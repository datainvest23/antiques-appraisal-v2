# Antiques Appraisal Application

## Overview

The Antiques Appraisal Application is an AI-powered platform designed to provide instant, detailed valuations and appraisals for antique items. built with Next.js 15, the application leverages OpenAI's advanced vision and language models to analyze user-uploaded images and generate comprehensive reports covering identification, historical context, physical attributes, and estimated value.

## Features

- **AI-Powered Analysis**: Uses OpenAI's Vision and Assistant APIs to analyze antique photos and generate detailed appraisal reports.
- **Comprehensive Reports**: Provides in-depth information on:
  - Identification & Classification
  - Physical Attributes (Materials, Measurements, Condition)
  - Historical Context & Era
  - Provenance & Maker Attribution
  - Value Indicators & Red Flags
- **User Authentication**: Secure signup and login using Supabase Auth.
- **Valuation History**: Users can save and access their past valuations.
- **Image Upload**: Secure image storage using Supabase Storage.
- **Audio Summary**: Text-to-Speech generation for listening to the appraisal summary.
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS and Shadcn UI.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI Integration**: [OpenAI API](https://openai.com/) (GPT-4 Vision, Assistants API, TTS)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.17.0 or higher recommended for Next.js 15)
- npm or pnpm

You will also need accounts and API keys for:
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)

## Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_openai_assistant_id
```

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Install Sharp (for image optimization):**

   The project includes a helper script to install `sharp` correctly.

   ```bash
   npm run postinstall
   ```

## Supabase Setup

This project requires a specific Supabase setup for database tables and storage.

1. **Database Tables:**
   Ensure you have a `valuations` table with columns for `user_id`, `is_detailed`, `valuation_report` (JSONB), and timestamps.

2. **Storage:**
   The application uses a Supabase Storage bucket named `antique-images`.

   Refer to `supabase/README.md` for detailed SQL scripts and instructions on how to set up the storage bucket and Row Level Security (RLS) policies.

## Running the Project

1. **Start the development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components
├── contexts/             # React Contexts (e.g., AuthContext)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
│   ├── openai.ts         # OpenAI client setup
│   ├── supabase-client.ts # Supabase client setup
│   └── ...
├── public/               # Static assets
├── supabase/             # Supabase setup scripts and documentation
├── types/                # TypeScript type definitions
├── .env.local            # Environment variables (not committed)
└── package.json          # Project dependencies and scripts
```

## AI Integration Details

The application uses a specialized OpenAI Assistant configuration. The `lib/openai.ts` file handles:
- Creating threads and runs for the Assistant API.
- Parsing the JSON response from the Assistant.
- Handling retries and timeouts.
- Integrating Text-to-Speech for summaries.

## License

[MIT](LICENSE)
