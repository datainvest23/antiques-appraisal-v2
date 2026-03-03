# Antiques Appraisal System - Technical Flow

This document outlines the technical architecture, models, prompts, and data flows involved in the application's valuation features. There are two primary types of valuation:

1. **Initial Valuation** (Fast, categorization & quick assessment)
2. **Deep Valuation** (Comprehensive, slower, multi-model research & formatting pipeline)

---

## 1. Initial Valuation Flow
**Route:** `POST /app/api/appraise-v2/route.ts`

This flow is triggered when a user uploads an image to get a fast, initial understanding of an antique item.

### The Process
1. **User input:** Frontend sends `imageUrls` (typically Supabase storage URLs) and `additionalInfo` (text).
2. **Image Fetching:** The backend utilizes the `@supabase/supabase-js` Admin Client to securely fetch the image data and convert it to Base64 (`fetchImageAsBase64`).
3. **Model Calling:**
   - **Gateway:** Vercel AI Gateway (`https://ai-gateway.vercel.sh/v1/chat/completions`)
   - **Model:** Kimi-K2.5 (`moonshotai/kimi-k2.5`)
4. **Prompt Structure:**
   - **System Prompt:** Loaded from `docs/PROMPTS/initial-categorization-v1.md`. Instructs the model to output a specific markdown format with a "Quick Identification" section and a "Fact Sheet" table.
   - **User Prompt:** Appends `USER PROVIDED FACTS: [details]` and the array of Base64 images.
5. **Data Extraction & Storage:**
   - The returned markdown content is parsed using regex helpers (`extractField`, `extractFromTable`) to extract structured facts: `object_name`, `category`, `stylistic_period`, `materials`, `condition`, `primary_colors`, etc.
   - A new row is inserted into the `kimi_appraisals` Postgres table in Supabase.
6. **Response:** The API responds with the raw content, the parsed HTML version, and the extracted data dictionary, which the frontend displays.

---

## 2. Deep Valuation Flow
**Route:** `POST /app/api/valuation/route.ts`

This flow is triggered explicitly by the user (usually from the "My Valuations" dashboard) to produce a comprehensive, 15-section museum-grade valuation report. It utilizes an advanced two-step LLM pipeline to separate intense web research from reliable JSON formatting.

### The Process

#### Step 1: Deep Research Phase (Perplexity Sonar)
The goal of this phase is to fetch real-world data, historical context, and actual auction comparables.

1. **User Input:** Frontend sends `valuationId`, `userId`, `imageUrls`, and metadata like `currency`, `basisOfValue`, `purpose`, `valuationDate`, and `objectDetails`.
2. **Model:** `perplexity/sonar-reasoning-pro` via Vercel AI SDK Gateway.
3. **Prompt Structure:**
   - **System Prompt:** Loaded from `docs/PROMPTS/advanced-gpt-prompt.md`. This is a massive, highly detailed instruction set ensuring compliance with International Valuation Standards (IVS 2025) and USPAP. It demands 15 explicit sections.
   - **User Prompt:** Provides the metadata context, commands the model to "Search the web for real comparable auction sales", and includes the image URLs (converted to base64 objects).
4. **Processing:** The model runs its "reasoning" phase. The output (`<think>` blocks containing reasoning steps) is stripped out to get the `cleanReport`.

#### Step 2: Structured Formatting Phase (Gemini Flash)
Because Perplexity Sonar is highly focused on research and reasoning, attempting strict JSON schema adherence with it can be fragile. Therefore, the raw markdown from Phase 1 is passed to a secondary, faster model.

1. **Model:** `google/gemini-2.5-flash` via Vercel AI SDK Gateway.
2. **Prompt Structure:**
   - **System Prompt:** (`GEMINI_SYSTEM` constant inside `route.ts`). A strict directive explaining it is a "professional report formatter". It commands the LLM to output an exact JSON schema containing all 15 sections as markdown strings inside the JSON, extracting an array of `comparable_sales`, and preserving all citations without truncating any researched facts.
   - **User Prompt:** The raw `cleanReport` markdown from Perplexity Sonar.
3. **Data Handling & Pricing Logic:**
   - The token usage for both Sonar (Input: ~$5/M, Output: ~$25/M) and Gemini (Input: ~$0.075/M, Output: ~$0.30/M) is captured. Total USD costs are calculated.
4. **Storage:**
   - The system `upserts` a row into the `deep_valuations` Supabase table. The row is linked to the original `valuation_id` and contains the full `report_json` along with detailed token metrics.
5. **Response:** The API responds with the finalized JSON report object which powers the frontend "Deep Valuation" modal and PDF export.

---

### Key Prompt Files Reference
*   **Initial:** `docs/PROMPTS/initial-categorization-v1.md` - Short, table-focused layout.
*   **Deep Research:** `docs/PROMPTS/advanced-gpt-prompt.md` - IVS 2025 compliant definition, outlining 15 sections including market analysis, condition, provenance, and pricing strategies. There's also a `sonar-prompt.md` available, but `advanced-gpt-prompt.md` is currently hardcoded in `route.ts`.
*   **Deep Formatting:** Inline `GEMINI_SYSTEM` inside `app/api/valuation/route.ts` - Forces strict JSON extraction without data loss.
