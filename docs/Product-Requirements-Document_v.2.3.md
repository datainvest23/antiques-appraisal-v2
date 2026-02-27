# Product Requirements Document (PRD) – Antiques Appraisal v2.3

*Last Updated: 2025-03-26*

---

## **1\. Introduction**

### **1.1 Product Overview**

**Antiques Appraisal** is a web application that leverages advanced AI to evaluate and value antique items. The platform integrates image analysis, voice/text feedback, and detailed follow-up interactions to generate a comprehensive appraisal report. Recent updates include a modified appraisal flow that combines image uploads and feedback submission, enriched UI components for a seamless user experience, and robust authentication and monetization features powered by Supabase and simulated Stripe integration.

### **1.2 Key Objectives**

* **Streamlined Appraisal Process**:

  * Enable users to upload images and provide feedback (via text or transcribed voice notes) concurrently.

  * Generate an AI-driven, detailed appraisal report using a structured prompt template and optional web search integration.

* **Enhanced User Experience & Feedback Loop**:

  * Present analysis data in an intuitive, accordion-style Detailed Analysis component.

  * Allow real-time feedback submission to refine appraisals.

* **Monetization & Token System**:

  * Offer one free valuation per day, with additional valuations requiring token usage or direct payment.

  * Provide a premium detailed valuation upgrade for an extra fee.

* **Secure, Scalable, and Extensible Platform**:

  * Use Supabase for authentication, data storage, and route protection.

  * Prepare for future expansion with additional features such as referrals, comprehensive token purchase flows, and advanced analytics.

### **1.3 Target Users**

* **Casual Users & Hobbyists**: Seeking quick, free valuations.

* **Collectors & Enthusiasts**: Frequently evaluating items and purchasing tokens for additional analyses.

* **Professionals & Institutions**: Auctioneers, curators, and museums requiring detailed and accurate appraisals.

---

## **2\. Functional Requirements**

### **2.1 User Authentication & Data Security**

* **Authentication Mechanism**:

  * Utilize Supabase (JWT-based, OAuth support) for secure sign-up/login.

  * Middleware enforces protected routes (e.g., `/appraisal`, `/my-valuations`, `/buy-tokens`, `/referrals`).

* **Session Management**:

  * Automatic session refresh and token expiration handled via Supabase auth-helpers.

### **2.2 Appraisal Flow**

#### **2.2.1 Image & Feedback Submission**

* **Modified Workflow**:

  * **Image Upload**: Users can select and upload up to 3 images with drag-and-drop support and thumbnail previews.

  * **Concurrent Feedback Submission**:

    * Users may provide additional information (text or simulated voice recording that is transcribed) concurrently with image uploads.

    * The optional feedback (passed as an `additionalInfo` field) is sent together with image URLs in the analysis request.

* **Error Handling**:

  * Validate file type (JPEG, PNG) and size (max 10MB).

  * Display clear error messages and prevent memory leaks (e.g., revoking object URLs).

#### **2.2.2 AI Analysis & Refinement**

* **Initial Analysis API**:

  * **Endpoint**: `/api/analyze-antique`

  * **Input**: Uploaded image URLs and optional `additionalInfo`.

  * **Output**: Structured appraisal report using the enhanced prompt template.

* **Enhanced Prompt Template**:

  * The AI acts as an antiques evaluation expert generating a section-by-section report covering:

    1. Preliminary Object Category

    2. Observed Physical Attributes (materials, measurements, condition)

    3. Inscriptions and Marks

    4. Distinguishing or Unique Features

    5. Stylistic Assessment & Possible Period (including confidence level)

    6. Preliminary Attribution and Provenance Clues

    7. Intake & Identification (photo perspectives, quality)

    8. Value Indicators & Follow-up Questions

  * **Web Search Integration**: Configured via the tools array to enrich analysis with external data when needed.

* **Refinement via Feedback**:

  * **Endpoint**: `/api/refine-analysis`

  * The API refines the initial analysis based on the feedback provided and returns an updated report.

#### **2.2.3 Audio Summary Generation**

* **Endpoint**: `/api/generate-audio`

* **Process**: Convert the text summary of the appraisal into an audio file (using TTS-1) for playback within the app.

### **2.3 UI Components & User Experience**

#### **2.3.1 Appraisal Interface**

* **AppraiseAntique Component**:

  * Manages the image upload process, preview display, feedback recording (with simulated voice functionality), and triggers the AI analysis.

  * Transitions from an "upload" tab to an "analysis" tab once images are uploaded.

* **DetailedAnalysis Component**:

  * Displays the structured appraisal report in an accordion interface.

  * Shows follow-up questions and confidence level badges to prompt further interaction if needed.

#### **2.3.2 Additional UI Pages**

* **Home Page**:

  * Includes a Hero section, features overview, and "How It Works" component.

* **Login & Registration Pages**:

  * Facilitate user authentication with options for email/password and OAuth.

* **My Valuations**:

  * List view (`/my-valuations`) showing summaries of all saved valuations.

  * Detail view (`/my-valuations/[id]`) for full appraisal reports with images and user comments.

* **Buy Tokens Page**:

  * Allows users to select token packages (e.g., 5 for $5 or 10 for $9) with a simulated payment flow.

* **Referrals & Verification**:

  * Dedicated pages for referral system management and email verification status.

### **2.4 Monetization & Token System**

#### **2.4.1 Valuation & Payment Flow**

* **Daily Free Valuation**:

  * One free valuation per user per day (00:00–23:59 UTC).

* **Token Usage**:

  * Additional valuations require the use of tokens, fetched via the `getTokenBalance` function.

  * A premium detailed valuation upgrade is available for an extra fee ($3).

* **Payment Integration**:

  * Simulated Stripe-based payment (with future plans to integrate actual Stripe functionality).

  * A dedicated `/buy-tokens` page facilitates token purchases.

### **2.5 API Endpoints & Backend Integration**

* **/api/upload-image**:

  * Handles image upload to Supabase storage and returns public URLs.

* **/api/analyze-antique**:

  * Accepts image URLs and optional additional information; returns a structured appraisal report.

* **/api/refine-analysis**:

  * Processes user feedback and refines the initial analysis.

* **/api/generate-audio**:

  * Converts the appraisal summary into an audio file URL.

* **Authentication & Middleware**:

  * Middleware (`middleware.ts`) enforces route protection for appraisal, valuations, referrals, and token purchase pages.

### **2.6 Third-Party Integrations**

* **OpenAI Integration**:

  * Uses GPT-4o for detailed analysis and TTS-1 for audio summary generation.

  * Web search capability enabled through the tools array for enriched data.

* **Supabase**:

  * Provides authentication, storage, and database functionalities.

* **Stripe (Simulated)**:

  * Manages token purchases and payment flows.

* **UI Libraries**:

  * Uses Next.js with React, Tailwind CSS, and Radix UI for components and styling.

---

## **3\. Non-Functional Requirements**

### **3.1 Performance & Scalability**

* **Latency**:

  * API responses (analysis, token checks, payment processing) should be under 2 seconds.

* **Concurrent Users**:

  * Support at least 1,000 concurrent users.

* **Optimized Assets**:

  * Use efficient image handling and state management to prevent memory leaks.

### **3.2 Security**

* **Authentication & Data Privacy**:

  * Secure user data with Supabase’s JWT-based authentication and HTTPS.

* **Payment Security**:

  * Simulated payment flows adhere to PCI compliance; production will use fully PCI-compliant Stripe integration.

### **3.3 Usability & Accessibility**

* **User Interface**:

  * Intuitive navigation with clear state indicators (upload progress, analysis state, error messages).

* **Accessibility**:

  * Comply with WCAG 2.1 guidelines (keyboard navigation, screen readers, etc.).

### **3.4 Reliability & Maintainability**

* **Robust Error Handling**:

  * API routes and UI components include detailed error logging and user-friendly error messages.

* **Modular Architecture**:

  * Clear separation of concerns across components, API routes, and utility libraries to facilitate future updates and scalability.

---

## **4\. System Architecture**

### **4.1 Frontend**

* **Framework**: Next.js with React (App Router)

* **Styling**: Tailwind CSS with Radix UI components for a modern and accessible UI.

* **Routing**:

  * Pages include home, appraisal, login, my-valuations, buy-tokens, referrals, and verification-sent.

### **4.2 Backend & API**

* **API Routes**:

  * `/api/upload-image`, `/api/analyze-antique`, `/api/refine-analysis`, `/api/generate-audio`

* **Authentication Middleware**:

  * Implemented in `middleware.ts` to enforce protected routes.

* **Data Storage**:

  * Supabase used for storing valuations, token balances, and user data.

### **4.3 Third-Party Integrations**

* **OpenAI**:

  * AI models for image analysis and TTS, with web search for additional context.

* **Supabase**:

  * Auth, storage, and database services.

* **Stripe (Simulated)**:

  * Payment flow for token purchase and detailed valuation upgrades.

---

## **5\. Folder Structure**

bash  
Copy  
`datainvest23-antiques-appraisal-v2/`  
`├── app/`  
`│   ├── globals.css`  
`│   ├── layout.tsx`  
`│   ├── page.tsx`  
`│   ├── api/`  
`│   │   ├── analyze-antique/route.ts`  
`│   │   ├── generate-audio/route.ts`  
`│   │   ├── refine-analysis/route.ts`  
`│   │   └── upload-image/route.ts`  
`│   ├── appraisal/page.tsx`  
`│   ├── auth/callback/route.ts`  
`│   ├── buy-tokens/page.tsx`  
`│   ├── login/page.tsx`  
`│   ├── my-valuations/page.tsx`  
`│   ├── my-valuations/[id]/page.tsx`  
`│   ├── referrals/page.tsx`  
`│   └── verification-sent/page.tsx`  
`├── components/`  
`│   ├── appraise-antique.tsx`  
`│   ├── detailed-analysis.tsx`  
`│   ├── footer.tsx`  
`│   ├── hero-section.tsx`  
`│   ├── how-it-works.tsx`  
`│   ├── navbar.tsx`  
`│   ├── protected-route.tsx`  
`│   ├── referral-banner.tsx`  
`│   ├── referral-system.tsx`  
`│   ├── referred-signup-bonus.tsx`  
`│   ├── theme-provider.tsx`  
`│   ├── user-status.tsx`  
`│   ├── valuation-detail.tsx`  
`│   ├── valuations-list.tsx`  
`│   └── ui/ (various UI components)`  
`├── contexts/`  
`│   └── auth-context.tsx`  
`├── lib/`  
`│   ├── openai.ts`  
`│   ├── supabase-client.ts`  
`│   └── utils.ts`  
`├── middleware.ts`  
`├── next.config.mjs`  
`├── package.json`  
`├── package.json.example`  
`├── pnpm-lock.yaml`  
`├── postcss.config.mjs`  
`├── tailwind.config.ts`  
`└── tsconfig.json`

---

## **6\. API Specifications**

### **6.1 POST /api/upload-image**

* **Description**: Uploads image files to Supabase storage and returns public URLs.

* **Input**: FormData with file.

* **Output**: `{ "url": "publicUrl" }`

### **6.2 POST /api/analyze-antique**

* **Description**: Analyzes uploaded image URLs with optional feedback (`additionalInfo`).

**Input**:

 json  
Copy  
`{`  
  `"imageUrls": ["url1", "url2"],`  
  `"additionalInfo": "Optional feedback text"`  
`}`

*   
* **Output**: Structured appraisal report (sections as per enhanced prompt) and follow-up questions.

### **6.3 POST /api/refine-analysis**

* **Description**: Refines the initial analysis using provided user feedback.

**Input**:

 json  
Copy  
`{`  
  `"initialAnalysis": { ... },`  
  `"userFeedback": "Feedback text"`  
`}`

*   
* **Output**: Updated analysis report and revised follow-up questions.

### **6.4 POST /api/generate-audio**

* **Description**: Generates an audio summary from provided text.

**Input**:

 json  
Copy  
`{`  
  `"text": "Summary text"`  
`}`

*   
* **Output**: `{ "audioUrl": "url" }`

---

## **7\. Testing, Deployment & Future Enhancements**

### **7.1 Testing Strategy**

* **Unit Testing**:

  * Validate API endpoints, token logic, and error handling.

* **Integration Testing**:

  * Ensure the full appraisal flow (upload → analysis with concurrent feedback → audio generation) functions correctly.

* **End-to-End Testing**:

  * Simulate complete user journeys covering authentication, appraisal, token purchase, and valuation creation.

### **7.2 Deployment**

* **Platform**: Vercel for hosting the Next.js application.

* **CI/CD**: GitHub Actions for automated testing and deployment pipelines.

### **7.3 Future Enhancements**

* **Voice Transcription**:

  * Implement real-time voice recording and transcription.

* **Enhanced Payment Integration**:

  * Integrate a fully functional Stripe payment system.

* **Advanced Analytics Dashboard**:

  * Develop detailed metrics on appraisal trends and user engagement.

* **Referral System Expansion**:

  * Enhance referral incentives and bonus mechanisms.

* **External Data Integration**:

  * Enrich appraisal reports with live auction data and historical records.

---

This PRD (v2.3) captures the current state of the application, including the streamlined image and feedback submission flow, comprehensive AI-driven analysis, robust UI/UX enhancements, secure authentication, and a token-based monetization system. Further refinements and feature enhancements are planned to continue evolving the platform.

