# Antiques Appraisal

Antiques Appraisal is a web application that leverages advanced AI to evaluate and value antique items. It integrates image analysis, concurrent voice/text feedback, and detailed follow-up interactions to produce comprehensive appraisal reports.

## Features

*   **AI-Powered Appraisals:** Utilizes advanced AI to evaluate and value antique items.
*   **Image Analysis:** Allows users to upload images of their antiques for analysis.
*   **Voice/Text Feedback:** Supports concurrent voice (simulated) and text feedback for detailed evaluations.
*   **Detailed Reports:** Generates comprehensive appraisal reports with structured information.
*   **Token-Based System:** Implements a token system for users to access appraisal services.
*   **User Authentication:** Secure user registration and login functionality.
*   **Admin Panel:** Provides administrative capabilities for user and content management.
*   **Resources Section:** Offers articles and information related to antiques and valuations.

## Tech Stack

*   **Frontend:** Next.js (App Router), React, Tailwind CSS, Radix UI
*   **Backend:** Node.js, Next.js API Routes
*   **Database & Auth:** Supabase
*   **AI & Machine Learning:** Google Generative AI (Gemini 2.5-Pro), OpenAI (GPT-4o, TTS-1)
*   **Deployment:** Vercel

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   pnpm (https://pnpm.io/installation)

### Installation

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/your_username/your_project_name.git
    cd your_project_name
    ```
2.  **Install PNPM packages:**
    ```bash
    pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables. You'll need to get these from your Supabase project settings and any other third-party services you're using.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY # If needed for admin tasks from backend
    OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    # Add any other environment variables required by the project
    ```
4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

This project uses Supabase for its backend, including database storage, authentication, and file storage.

For detailed instructions on setting up the Supabase project, including creating the necessary tables (Users, Tokens, Valuations, Referrals, Articles) and storage buckets (antique-images, article-images) with appropriate Row Level Security (RLS) policies, please refer to the `supabase/README.md` file in this repository. It contains the SQL scripts and steps required to initialize your Supabase backend.

## Folder Structure

A brief overview of the project's folder structure:

```
datainvest23-antiques-appraisal-v3/
├── app/                      # Next.js App Router: Pages and API routes
│   ├── api/                  # API endpoint handlers
│   ├── appraisal/            # Appraisal page components
│   ├── auth/                 # Authentication related pages/routes
│   ├── buy-tokens/           # Token purchase page
│   ├── login/                # Login page
│   ├── my-valuations/        # User's valuations pages
│   ├── referrals/            # Referral system pages
│   ├── admin/                # Admin dashboard pages
│   ├── resources/            # Resources/articles pages
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # Shared React components
│   ├── ui/                   # UI components (e.g., Shadcn/ui)
├── contexts/                 # React context providers (e.g., AuthContext)
├── docs/                     # Project documentation (PRD, etc.)
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and client libraries (OpenAI, Supabase)
├── middleware.ts             # Next.js middleware for route protection
├── public/                   # Static assets (images, videos)
├── supabase/                 # Supabase specific files (migrations, init scripts)
│   ├── init/
│   └── migrations/
├── styles/                   # Global styles (if any beyond app/globals.css)
├── types/                    # TypeScript type definitions
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore file
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and scripts
├── pnpm-lock.yaml            # PNPM lock file
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## API Endpoints

The application exposes several API endpoints for core functionalities:

*   **`POST /api/upload-image`**: Handles image uploads to Supabase storage.
    *   Input: `FormData` (file)
    *   Output: `{ "url": "publicUrl" }`
*   **`POST /api/analyze-antique`**: Processes image URLs and additional information to generate an antique appraisal.
    *   Input: `{ "imageUrls": ["url1", "url2"], "additionalInfo": "text" }`
    *   Output: Structured appraisal report and follow-up questions.
*   **`POST /api/refine-analysis`**: Allows users to submit feedback to refine an initial analysis.
    *   Input: `{ "initialAnalysis": {...}, "userFeedback": "text" }`
    *   Output: Updated appraisal report and questions.
*   **`POST /api/generate-audio`**: Generates audio from text, typically for summaries or reports.
    *   Input: `{ "text": "summary" }`
    *   Output: `{ "audioUrl": "url" }`
*   **`POST /api/save-valuation`**: Saves a valuation report to the database.
*   **`POST /api/transcribe-audio`**: Transcribes uploaded audio feedback.
*   **Other API routes** exist for specific appraisal flows (e.g., `appraise-basic`, `appraise-initial`, `evaluation-expert`).

Authentication is handled via Supabase, and protected routes are managed using Next.js middleware.

## Contributing

Contributions are welcome! If you have suggestions for improving the application, please feel free to contribute.

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

Please ensure your code adheres to the existing style and that any new features are appropriately documented.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details (though a `LICENSE` file may need to be created if one doesn't exist).

```text
MIT License

Copyright (c) [Year] [FullName]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
