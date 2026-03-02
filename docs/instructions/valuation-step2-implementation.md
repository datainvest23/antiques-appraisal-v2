# Vercel AI Gateway + Claude Sonnet 4.5 + Perplexity Search (Implementation Guide)

## Target architecture

The recommended implementation is a Next.js API route (server) that calls `anthropic/claude-sonnet-4.5` through Vercel AI Gateway and exposes a streaming endpoint to your UI.[1][2]

Web research is enabled via the AI Gateway–executed `perplexitySearch` tool, so the model can fetch up-to-date auction comps and include URLs/titles in its citations.[3][4]

## Prerequisites (Vercel-side)

Create/enable AI Gateway for your Vercel team and obtain an AI Gateway API key (or use OIDC in Vercel deployments).[5][2]

Set `AI_GATEWAY_API_KEY` in your environment when using API-key auth (local dev and non-Vercel runtimes), and note that the OpenAI-compatible base URL is `https://ai-gateway.vercel.sh/v1` if you choose the OpenAI SDK route.[6][2]

Ensure Perplexity Search is available to your team (via Vercel’s Perplexity integration / connectable account) so AI Gateway can route search calls to Perplexity.[7][3]

## Prerequisites (codebase)

Use Vercel’s AI SDK (v5.0.36+ or v6) so a model string like `anthropic/claude-sonnet-4.5` automatically routes through AI Gateway.[2][5]

Use `streamText()` for long, report-like outputs so you can stream tokens to the client as the report is produced.[3]

## Core server endpoint (Next.js App Router)

### 1) Request shape (recommended)

Send a single JSON payload containing: `purpose`, `basisOfValue`, `currency`, `objectDetails`, and `imageUrls` (public URLs). (This keeps the API stable and allows replays for debugging.)

If you need private images, upload to a secured object store and generate short-lived signed URLs before sending them into the model. (Do not embed raw user uploads directly into prompts without size limits.)

### 2) Image + text message format

AI SDK Core supports multimodal user messages as an array of parts that can include `TextPart`, `ImagePart`, and `FilePart`. 

For image URLs, `ImagePart` can carry a `URL` pointing to the image. 

### 3) Minimal streaming route example

Create `app/api/valuation/route.ts`:

```ts
import { streamText, stepCountIs, gateway } from 'ai';

export const maxDuration = 60;

type ValuationRequest = {
  purpose:
    | 'Insurance'
    | 'Sale'
    | 'Auction Estimate'
    | 'Estate'
    | 'Financial Reporting'
    | 'Litigation'
    | 'Private Sale'
    | 'Collection Management';
  basisOfValue:
    | 'Market Value'
    | 'Fair Market Value'
    | 'Replacement Value'
    | 'Liquidation Value'
    | 'Investment Value';
  currency: string; // e.g. 'EUR', 'USD'
  valuationDate?: string; // ISO
  objectDetails: Record<string, unknown>;
  imageUrls: string[];
  userId?: string;
};

function buildSystemPrompt() {
  return `You are a certified senior valuation expert specializing in fine art, antiques, and collectible objects.

CRITICAL RULES:
- Do not guess unsupported facts.
- Separate: Observed facts, Reasoned conclusions, Assumptions, Uncertainty.
- When using web search results, cite the source URLs in the report.
- If comps are weak or not comparable, say so and lower confidence.

OUTPUT:
Return a complete formal valuation report with the user-specified 15-section structure.`;
}

function buildUserPrompt(req: ValuationRequest) {
  const valuationDate = req.valuationDate ?? new Date().toISOString().slice(0, 10);

  return `Valuation date: ${valuationDate}
Purpose: ${req.purpose}
Basis of value: ${req.basisOfValue}
Currency: ${req.currency}

Object details (may be incomplete; do not invent missing fields):
${JSON.stringify(req.objectDetails, null, 2)}

Task: Analyze the images and the details. Use web search ONLY to find comparable sales and authoritative references.
Return the full report (>=1500 words).`;
}

export async function POST(request: Request) {
  const req = (await request.json()) as ValuationRequest;

  const imageParts = (req.imageUrls ?? []).map((u) => ({
    type: 'image' as const,
    image: new URL(u),
  }));

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.5',
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: buildUserPrompt(req) },
          ...imageParts,
        ],
      },
    ],

    tools: {
      perplexity_search: gateway.tools.perplexitySearch({
        maxResults: 8,
        maxTokens: 60000,
        maxTokensPerPage: 2048,
        searchLanguageFilter: ['en'],
        searchRecencyFilter: 'year',
        searchDomainFilter: [
          'christies.com',
          'sothebys.com',
          'bonhams.com',
          'invaluable.com',
          'liveauctioneers.com',
          'mutualart.com',
          'artnet.com',
          'artprice.com',
        ],
      }),
    },

    stopWhen: stepCountIs(4),

    providerOptions: {
      gateway: {
        user: req.userId,
        tags: ['valuation', 'report', 'sonnet-4.5', 'perplexity-search'],
      },
    },
  });

  return result.toDataStreamResponse();
}
```

This uses `gateway.tools.perplexitySearch()` as a provider-agnostic web search tool that works with any model behind AI Gateway.[5][3]

The parameters shown (`maxResults`, `maxTokens`, `maxTokensPerPage`, language/country/domain/recency filters) are the documented Perplexity Search tool controls in AI Gateway.[3][5]

Multi-step tool calling is enabled by `stopWhen: stepCountIs(n)`, which allows the model to call tools and then continue generation with the tool results until the stop condition is met.[8][9]

### Notes on citations inside your generated report

Perplexity Search tool results are billed at $5 per 1,000 requests, so it is cost-effective to keep `maxResults` small and to restrict domains to trusted auction sources where possible.[3]

To make your app’s outputs defensible, require that every “comparable sale” entry includes at least: title, auction house/platform, date, lot ID (if available), currency, and URL. (If any of those are missing, the model should mark the comp as “partial” and lower confidence.)

## Client UI (minimal)

For a chat-like UX, AI SDK’s `useChat` supports multimodal parts and can send an image URL plus text in one user message. 

On the server, `convertToModelMessages` can convert UI messages to model messages and handle multimodal content automatically (useful when you adopt `useChat`’s `parts`). 

If you are not building a chat UI, keep the simpler “single POST JSON payload” API above and stream the response into a report viewer.

## Observability, cost attribution, and governance

AI Gateway supports tagging and per-end-user attribution via `providerOptions.gateway.user` and `providerOptions.gateway.tags`, which is helpful for measuring cost per report and per feature flag.[5]

AI Gateway is designed to support fallbacks and routing controls (provider order, allowed providers, fallback models) through gateway provider options if you later add reliability layers.[10][5]

## How to drive this with Google Antigravity (vibe coder)

Google describes “vibe coding” in Antigravity as guiding an agentic workflow (mission-first) rather than hand-writing every line.[11][12]

A practical Antigravity workflow for this feature:

1. Create a mission: “Add `/api/valuation` streaming route using AI SDK + AI Gateway + Sonnet 4.5 + Perplexity Search; accept image URLs + object details; return full valuation report.”[11]
2. Ask the agent to generate a plan, then implement in small commits (route first, then UI, then storage for images).[11]
3. Have the agent run local tests (unit test prompt builder; manual test with 1–2 sample images).[12]

### Copy/paste Antigravity ‘mission’ prompt (starter)

Use this as your first instruction inside Antigravity:

```text
Mission:
Implement a server-side streaming endpoint in a Next.js (App Router) app:
- POST /api/valuation
- Uses Vercel AI SDK + Vercel AI Gateway
- Model: anthropic/claude-sonnet-4.5
- Tools: gateway.tools.perplexitySearch()
- Input JSON: { purpose, basisOfValue, currency, objectDetails, imageUrls }
- Constructs a multimodal prompt (text + images)
- Returns result.toDataStreamResponse()

Constraints:
- No hallucinated provenance or artists.
- Must separate Observed facts vs Assumptions vs Conclusions.
- Must include URLs for any market comps pulled from web search.

Deliverables:
- app/api/valuation/route.ts
- A minimal client page that submits the form and renders the streamed text.
- Basic validation + error handling.
- README snippet explaining env vars (AI_GATEWAY_API_KEY).
```

## Known gotchas (production hardening)

Use domain filters and recency filters to reduce irrelevant comps and lower Perplexity Search cost, especially if users repeatedly regenerate reports.[3]

If you later migrate to a `useChat`-based UI with multi-step tool loops, be mindful that server-side stop conditions and client-side `maxSteps` can interact in surprising ways in some edge cases; keep the first version server-only (no client tools) to simplify.[13]

## Extension ideas (optional)

Add a “comps pack” step that forces Perplexity Search first (tool choice), then a second step that writes the final report using the retrieved comps (multi-step agent loop).[8]

If you need compatibility with existing OpenAI tooling, AI Gateway provides OpenAI-compatible endpoints (base URL `https://ai-gateway.vercel.sh/v1`) so you can swap base URLs while still calling `anthropic/claude-sonnet-4.5`.[6]

***

*End of guide.*