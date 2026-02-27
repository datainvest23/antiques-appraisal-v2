# Vercel AI Gateway Models for the Antiques Appraisal Platform

## Executive Summary

This report connects the requirements of the Antiques Appraisal Platform to the current model catalog exposed through Vercel AI Gateway, and recommends a short list of recent, efficient, and relevant models by provider and use case.

## Project Overview: Antiques Appraisal Platform

The Antiques Appraisal Platform is a Next.js (App Router) and Supabase-based SaaS that lets users upload up to three photos plus textual or voice-noted context to obtain AI-generated antique identifications and appraisals, with a token-based monetization model and multiple service tiers. The backend routes lower tiers (Basic Categorization and Initial Evaluation) through a fast /api/chat path and reserves a dedicated /api/appraise path with deeper multimodal analysis (currently via models like Gemini 2.5 Pro and GPT‑4o) for the Full Appraisal Report tier. Across versions v1.44–v4.0 the architecture has matured into a modular, role-based system with admin dashboards, SEO content, Stripe-like payments, and strict Row-Level Security on Supabase storage.\[1\]

Functionally, the system emphasizes: (1) strong image understanding for varied antiques, (2) cautious, well-justified language that acknowledges limits of 2D photography, and (3) a refinement loop where the user can add clarifications to improve the report. This means the underlying models must combine multimodal vision, long-context reasoning, and good tool-use support, while also being cost-efficient enough for free and low-cost tiers.\[1\]

## How Vercel AI Gateway Exposes Models

Vercel AI Gateway sits in front of many providers (OpenAI, Anthropic, Google, xAI, DeepSeek, Alibaba/Qwen, Amazon, Mistral, Meta, etc.) and exposes their models through a single base URL and API key. Vercel’s public "Models & Providers" documentation explains that you can either browse models via the AI Gateway models page or query the unauthenticated REST endpoint `https://ai-gateway.vercel.sh/v1/models` to get a JSON list including model IDs, context window, tags (e.g., `vision`, `file-input`, `reasoning`), and pricing.\[2\]\[3\]\[4\]

The models endpoint currently returns about 150 models across 30+ providers, spanning general-purpose language models, multimodal reasoning models, image generators, and embedding models. The same docs stress that model IDs are not stable forever and recommend discovering them dynamically via the Gateway models endpoint or SDK helpers rather than hard-coding them.\[3\]\[5\]

## Selection Criteria for This App

Given the platform’s design, the most relevant models from the Gateway catalog are those that:

- Support **multimodal vision** (images \+ text), since appraisals start from user photos.  
- Offer **strong reasoning** and **tool-use** for Full Appraisal Reports (e.g., calling web search or custom tools for comparables).  
- Provide **cheap, fast variants** for Basic Categorization and Initial Evaluation tiers to keep token costs low.  
- Offer **large context windows** and **file-input** for long user histories or appended PDFs, where available.

The Gateway’s model metadata—especially tags like `vision`, `reasoning`, `tool-use`, and `file-input`, plus per-token pricing—makes it possible to algorithmically filter for these capabilities. What follows is a curated list of recent and efficient models that align with these criteria, grouped by provider and intended use in the antiques platform.\[3\]

## Google Gemini Models (Via AI Gateway)

Google’s Gemini line is already part of the platform’s architecture (Gemini 2.5 Pro for premium appraisals), and Vercel’s models endpoint exposes several newer variants that improve cost-performance tradeoffs.\[1\]\[3\]

### Recommended Gemini Models

| Gateway Model ID | Type & Tags | Why It Fits the App |
| :---- | :---- | :---- |
| `google/gemini-2.5-pro` | Language; `tool-use`, `reasoning`; 1M-token context window | Most advanced reasoning model in the Gemini 2.5 line; excellent for premium Full Appraisal Reports that need deep historical context, complex condition reasoning, and structured outputs.\[1\] |
| `google/gemini-3-pro-preview` | Language; `file-input`, `tool-use`, `reasoning`, `vision`, `implicit-caching`; 1M-token context | Newer Pro generation that improves on Gemini 2.5 Pro for complex reasoning and agentic workflows; well-suited for high-end appraisals with tool-calling and potential future agent-based flows.\[3\]\[1\] |
| `google/gemini-3-flash` | Language; `reasoning`, `file-input`, `vision`, `tool-use`, `implicit-caching` | Frontier-level intelligence tuned for speed and search grounding, with large context and multimodal vision; ideal as a slightly cheaper, faster full-report model or for pro users who run many appraisals.\[1\] |
| `google/gemini-2.5-flash` | Language; `reasoning`, `tool-use`; 1M-token context | Thinking model balancing price and performance; strong candidate for the Intermediate "Initial Evaluation" tier where good reasoning is needed but at lower cost than Pro.\[1\] |
| `google/gemini-2.5-flash-lite` | Language; `file-input`, `reasoning`, `tool-use`, `vision`, `implicit-caching`; 1M-token context | Low-latency, low-cost multimodal model; excellent for Basic Categorization, rapid object-type detection, and light historical hints while keeping token costs minimal.\[1\] |

These Gemini variants give a clear upgrade path: keep or migrate premium reports to Gemini 2.5 Pro or Gemini 3 Pro Preview, while moving Basic and Initial tiers to Flash / Flash-Lite for substantial cost savings without losing multimodal capability.\[3\]\[1\]

## Anthropic Claude Models

Anthropic’s Claude models are strong at structured reasoning, cautious language, and tool use, with several recent Sonnet and Haiku variants that include vision support and large context windows. These align very well with the platform’s requirement for well-justified, conservative appraisals.\[1\]

### Recommended Claude Models

| Gateway Model ID | Type & Tags | Why It Fits the App |
| :---- | :---- | :---- |
| `anthropic/claude-opus-4.5` | Language; `tool-use`, `reasoning`, `vision`, `file-input`; large context | High-end reasoning and vision model designed for demanding tasks and long, multi-step workflows; ideal alternative or complement to Gemini Pro for the Full Appraisal Report tier.\[1\] |
| `anthropic/claude-sonnet-4.5` | Language; `file-input`, `reasoning`, `tool-use`, `vision`; 1M-token context | Newest Sonnet iteration with improved performance over Sonnet 4 at the same price; strong balance of capability and cost, excellent candidate for both Full Appraisal and rich Initial Evaluations.\[1\] |
| `anthropic/claude-sonnet-4` | Language; `file-input`, `reasoning`, `tool-use`, `vision`; 1M-token context | Earlier Sonnet 4 model tuned for coding and complex tasks with large context; still a solid, cost-effective workhorse for initial tiers where absolute frontier quality is not required.\[1\] |
| `anthropic/claude-3.5-haiku` | Language; `file-input`, `tool-use`, `vision`; 200K context | Next-gen Haiku that surpasses many prior large models at Haiku’s speed tier; ideal for fast, image-informed Basic Categorization and brief Initial Evaluations.\[1\] |
| `anthropic/claude-haiku-4.5` | Language; `file-input`, `reasoning`, `tool-use`, `vision`; 200K context | Very low-cost, low-latency model intended for scaled deployments and budget-sensitive workloads; good candidate for free-token Basic tier while maintaining decent multimodal understanding.\[1\] |

Claude’s design philosophy (conservative language, strong tool use, good document handling) fits well with the platform’s need to avoid overconfident valuations and to provide explicit rationales.\[1\]

## Google Imagen and Gemini Image Variants (Optional)

While the core appraisal pipeline only needs vision understanding, the platform’s content strategy (SEO articles, educational examples, marketing visuals) could benefit from image generation.

### Image-Focused Gateway Models

| Gateway Model ID | Type & Tags | Why It Fits the App |
| :---- | :---- | :---- |
| `google/gemini-2.5-flash-image` (Nano Banana) | Language; `image-generation`; can interleave text and images | Suitable for generating illustrative images (e.g., style exemplars, visual explainers about restoration techniques) alongside text descriptions in educational content.\[1\] |
| `google/gemini-3-pro-image` (Nano Banana Pro) | Language; `image-generation` | Higher-fidelity image generation for marketing assets, website hero images, and high-quality visuals that accompany appraisal reports or blog posts.\[1\] |

These are not required for the appraisal logic itself but can be integrated into the Resources/SEO section defined in the project documents.\[1\]

## Amazon Nova Models

Amazon’s Nova family offers cost-effective multimodal models through the Gateway, including a very cheap and fast variant suitable for high-volume workloads.\[1\]

### Recommended Nova Models

| Gateway Model ID | Type & Tags | Why It Fits the App |
| :---- | :---- | :---- |
| `amazon/nova-pro` | Language; multimodal vision; balanced cost | Highly capable multimodal model described as combining accuracy, speed, and cost efficiency; good alternative backbone for Initial Evaluations when you want provider diversity.\[1\] |
| `amazon/nova-2-lite` | Language; `reasoning`, `vision`; 1M-token context | Fast, cost-effective reasoning model handling text, images, and video; promising candidate for the Basic or Intermediate tier when doing quick visual checks plus light commentary.\[1\] |
| `amazon/nova-lite` | Language; multimodal; very low cost | Extremely low-cost multimodal model optimized for speed; a potential engine for free-token Basic categorizations where you want to cap spend per request aggressively.\[1\] |

These give you an additional provider axis to route traffic through AI Gateway’s fallback and routing features, improving resilience during outages of other providers.\[6\]

## DeepSeek Models for Reasoning-Heavy Text Phases

DeepSeek models in the Gateway catalog focus on high-quality reasoning and long context at aggressive pricing, but are primarily text-focused rather than vision-enabled.\[1\]

### Recommended DeepSeek Models

| Gateway Model ID | Type & Tags | Why It Fits the App |
| :---- | :---- | :---- |
| `deepseek/deepseek-r1` | Language; `reasoning`, `implicit-caching`; 160K+ context | Strong reasoning model at low cost; suitable as a second-stage text-only refinement engine once a vision model has extracted structured attributes from images.\[1\] |
| `deepseek/deepseek-v3.2-thinking` | Language; `reasoning`, `tool-use`, `implicit-caching` | Thinking mode of DeepSeek V3.2 designed for complex reasoning over long contexts; good for scenarios where you pipe in long chains of previous appraisals, chat history, or large batches of comparables.\[1\] |
| `deepseek/deepseek-v3.2` or `deepseek-v3.2-exp` | Language; `implicit-caching`, `reasoning`, `tool-use` | Cost-efficient general-purpose models with experimental long-context attention mechanisms; candidates for background tasks such as bulk report summarization or SEO content generation. |

In the antiques platform, these models are best used in **multi-model pipelines**: a vision-capable model handles perception and initial reasoning, then DeepSeek refines pricing narratives, cross-references comparables, or rewrites reports at lower cost.

## Alibaba Qwen3 Models (Vision \+ Reasoning)

Alibaba’s Qwen3 family appears in the Gateway list with both language-only and multimodal VL (vision-language) variants, plus specialized coder and embedding models.\[1\]

### Recommended Qwen Models

| Gateway Model ID | Type & Tags | Why It Fits the App |
| :---- | :---- | :---- |
| `alibaba/qwen3-vl-instruct` | Language; `vision`; large context | Multimodal VL model with improved visual perception and OCR, including long video support; promising for fine-grained analysis of markings, inscriptions, or catalog pages uploaded as images.\[1\] |
| `alibaba/qwen3-vl-thinking` | Language; `vision`; multimodal reasoning | Enhanced multimodal reasoning with a focus on math and STEM; also useful for complex pattern recognition in decorative motifs or manufacturing details as part of higher-end appraisals.\[1\] |
| `alibaba/qwen3-max` / `qwen3-max-thinking` | Language; `tool-use`, `reasoning`, `implicit-caching` | State-of-the-art text models with strong agent and tool-invocation capabilities; good backbone for text-only stages of the appraisal pipeline (e.g., comparable search, narrative report generation). |

Using Qwen VL variants as an alternative vision backbone diversifies providers and may offer better OCR on certain scripts or labels, which is relevant when appraising antiques with non-Latin markings.

## Embedding Models for Search and Comparables

The platform’s premium appraisals rely heavily on surfacing recent market comparables, which becomes much more efficient if you maintain an embeddings-backed index of auction results, dealer listings, and prior appraisals.

### Recommended Embedding Models in AI Gateway

| Gateway Model ID | Type | Why It Fits the App |
| :---- | :---- | :---- |
| `alibaba/qwen3-embedding-0.6b` / `4b` / `8b` | Embedding | Qwen3 Embedding series tuned for text embedding and ranking across multiple sizes; good for generic semantic search over descriptions, titles, and notes.\[1\] |
| `amazon/titan-embed-text-v2` | Embedding | Lightweight, multilingual embeddings with configurable dimensions (256–1024); useful for multi-language antique descriptions and low-latency similarity search.\[1\] |
| `cohere/embed-v4.0` | Embedding (text and image/mixed) | Handles text, images, or mixed content; helpful if you want a single embedding space for both textual descriptions and selected visual features extracted from images.\[1\] |

These can be invoked through AI Gateway’s embedding APIs and combined with Supabase or an external vector store to power similar-item retrieval inside the Full Appraisal Report flow.\[3\]

## Image Generation Providers (Optional Enhancements)

Beyond Gemini’s image capabilities, the Gateway includes dedicated image providers that can be used for education and marketing.

### Notable Image Models

| Gateway Model ID | Type & Tags | Potential Use in Platform |
| :---- | :---- | :---- |
| `bfl/flux-pro-1.1` and `bfl/flux-pro-1.1-ultra` | Image; `image-generation` | High-quality, fast image generation for creating example photos, mock catalog layouts, or visual aids in SEO articles.\[1\] |
| `bfl/flux-pro-1.0-fill` | Image; `image-generation` (inpainting) | Could illustrate hypothetical restorations or reconstructions by editing user-submitted images for educational purposes (with clear disclaimers that edits are illustrative).\[1\] |

These models are not central to core valuation but align well with the resource section and content marketing strategy described in the project documentation.\[1\]

## How to Keep the List Current Programmatically

Because Vercel adds and deprecates models over time, the most robust approach is to dynamically query and filter the models endpoint rather than hard-code this list.\[4\]\[3\]

Key practices:

- Periodically call `https://ai-gateway.vercel.sh/v1/models` from a scheduled job and store relevant fields (id, tags, pricing, context\_window) in your own table.\[3\]  
- Filter for `tags` containing `vision` (for image understanding) and `reasoning` or `tool-use` (for appraisal logic), plus reasonable pricing thresholds for each tier.\[1\]  
- Surface a small, curated subset into your admin dashboard so you can manually select which models power Basic, Initial, and Full tiers without redeploying code.

This way, you can rapidly adopt new efficient models (for example, new Gemini Flash or Claude Haiku releases) while maintaining backward-compatible behavior for existing users.

## Summary of Recommended Model Set by Tier

The table below summarizes a pragmatic starting configuration for the Antiques Appraisal Platform using today’s Gateway catalog.

| Tier / Use Case | Primary Models | Backup / Alternative Models |
| :---- | :---- | :---- |
| **Full Appraisal Report (highest quality)** | `google/gemini-2.5-pro`, `google/gemini-3-pro-preview`, `anthropic/claude-opus-4.5`, `anthropic/claude-sonnet-4.5` | `google/gemini-3-flash`, `anthropic/claude-sonnet-4`, selected DeepSeek/Qwen text models for second-stage reasoning.\[1\]\[1\] |
| **Initial Evaluation (mid-tier)** | `google/gemini-2.5-flash`, `google/gemini-2.5-flash-lite`, `anthropic/claude-3.5-haiku`, `amazon/nova-pro` | `amazon/nova-2-lite`, `anthropic/claude-haiku-4.5`, Qwen VL models for additional vision diversity.\[1\] |
| **Basic Categorization (free / low-cost)** | `google/gemini-2.5-flash-lite`, `google/gemini-2.0-flash`, `amazon/nova-lite` | `anthropic/claude-haiku-4.5`, other cheap multimodal models surfaced via tag filters.\[1\] |
| **Text-only refinement and SEO content** | `deepseek/deepseek-r1`, `deepseek/deepseek-v3.2-thinking`, `alibaba/qwen3-max` | Other DeepSeek / Qwen3 text models with favorable pricing.\[1\] |
| **Embeddings for comparables search** | `amazon/titan-embed-text-v2`, `cohere/embed-v4.0`, `alibaba/qwen3-embedding-*` | Additional embeddings from OpenAI, Google, Voyage, or Mistral via Gateway as needed.\[1\]\[3\] |
| **Image generation for content/marketing** | `google/gemini-2.5-flash-image`, `google/gemini-3-pro-image`, `bfl/flux-pro-1.1` | `bfl/flux-pro-1.1-ultra`, `bfl/flux-pro-1.0-fill` for special effects and inpainting workflows.\[1\] |

This configuration can be tightened or expanded as pricing and performance benchmarks evolve, but it provides a solid, up-to-date baseline tuned to the Antiques Appraisal Platform’s multimodal, tiered-service architecture.\[3\]\[1\]  
