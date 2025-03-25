# Product Requirements Document (PRD)

# Antiques Appraisal v2.2 with Referral Feature

---

## **1\. Introduction**

### **1.1 Product Overview**

Antiques Appraisal is an AI-powered web application designed for users to securely manage, analyze, and appraise antique items. Leveraging advanced AI, the platform supports monetization through a token-based system, premium valuation features, and now incorporates a user referral program.

### **1.2 Key Objectives**

* Offer an intuitive interface for users to analyze antiques using AI (image upload, summary generation, text-to-speech).  
* Enable secure storage and retrieval of user data via Supabase.  
* Monetize the platform through premium valuation features and a token system.  
* Boost user acquisition and retention through a structured referral program rewarding premium valuations.

---

## 2\. Functional Requirements

### **2.1 User Authentication (Supabase)**

* **Registration and Login**:

  * Users can securely register and log in using email/password or OAuth providers (e.g., Google).  
  * Validation of email address and password complexity enforced at sign-up.  
  * Email verification to confirm identity upon registration.  
* **Session Management**:

  * JWT tokens for secure, automatic session expiration and renewal.  
  * Secure session invalidation upon logout or timeout.  
  * Persistent sessions for enhanced user experience.  
* **Access Control**:

  * Protected routes for sensitive actions (image uploads, valuations, token transactions, referral tracking).  
  * Clear redirection and login/signup prompts for unauthenticated users.

### **2.2 Antique Valuation Workflow**

**Image Upload & Validation**

* Acceptable formats: JPEG, PNG (maximum file size: 10MB).  
* User-friendly drag-and-drop or file selection interface.  
* Real-time progress indicators and immediate error messaging.

**AI Analysis & Summarization**

* Image analysis via AI assistant "Antiques\_Appraisal".  
  * Detailed descriptions, historical context, condition analysis.  
* Concise summarization using GPT4o-mini.  
* Text-to-Speech playback for summaries.

**Voice Feedback & Refinement**

* Voice recording for user feedback.  
* Transcription through OpenAI Whisper.  
* AI refinement of the initial appraisal based on feedback.

**Structured Valuation Report Storage (Supabase)**:

* **valuations** table fields:  
  * `valuation_id`  
  * `user_id`  
  * `created_at`  
  * `is_detailed` (boolean)

`valuation_report` (JSON)  
 {  
  "preliminaryCategory": "string",  
  "physicalAttributes": {  
    "materials": "string",  
    "measurements": "string",  
    "condition": "string"  
  },  
  "inscriptions": {  
    "signatures": "string",  
    "hallmarks": "string",  
    "additionalIdentifiers": "string"  
  },  
  "uniqueFeatures": {  
    "motifs": "string",  
    "restoration": "string",  
    "anomalies": "string"  
  },  
  "stylistic": {  
    "indicators": "string",  
    "estimatedEra": "string",  
    "confidenceLevel": "string"  
  },  
  "attribution": {  
    "likelyMaker": "string",  
    "evidence": "string",  
    "probability": "string"  
  },  
  "provenance": {  
    "infoInPhotos": "string",  
    "historicIndicators": "string",  
    "recommendedFollowup": "string"  
  },  
  "intake": {  
    "photoCount": "string",  
    "photoQuality": "string",  
    "lightingAngles": "string",  
    "overallImpression": "string"  
  },  
  "valueIndicators": {  
    "factors": "string",  
    "redFlags": "string",  
    "references": "string",  
    "followupQuestions": \["string"\]  
  },  
  "summary": "string",  
  "fullReport": "string"  
}

* 

### **2.3 Monetization Logic**

**Subscription Plans**:

* **Hobby Plan**:

  * 10 initial standard valuations.  
  * Additional tokens available for purchase.  
* **Advanced Plan**:

  * 5 initial standard valuations and 1 premium valuation.  
  * Unlimited valuations via token system.

**Token System**:

* 5 tokens provided on registration.  
* Purchase options: 10 tokens for $10  
* Token deduction automated per valuation usage.

**Premium Valuation**:

* Cost: $10 per valuation.  
* Enhanced insights and market data.

### **2.4 User Referral Program**

**Referral Mechanics**:

* Unique referral links per user.  
* Automatic tracking via Supabase.

**Reward Structure**:

* 1 Premium valuation awarded per successful referral.  
* Immediate reward availability upon new user's first login.

**Referral Status & Notifications**:

* Real-time updates on referral dashboard.  
* Email notifications upon successful referrals.

#### **Data Storage (Supabase)\*\*:**

* **referrals**: `id`, `referrer_user_id`, `referred_user_id`, `created_at`, `reward_granted`  
* **users**: `user_id`, `email`, `created_at`, `last_login`, `profile_data` (preferences, plan)  
* **tokens**: `user_id`, `token_balance`, `transaction_history` (timestamp, tokens, cost)

---

## **3\. Non-Functional Requirements**

### **Performance**

* AI analysis response time \< 10 seconds.  
* Referral status checks \< 1 second.

### **Security**

* Supabase JWT authentication.  
* Stripe PCI-compliant payments.  
* HTTPS and encrypted sensitive data.

### **Scalability**

* Designed for seamless user growth and traffic spikes.

### **Usability**

* User-friendly referral and monetization interfaces.  
* WCAG 2.1 accessibility compliance.

### **Reliability**

* 99.9% uptime target.  
* Automated backups and disaster recovery.

---

## **4\. System Architecture**

### **Technology Stack**

* Frontend: Next.js, React, Tailwind CSS  
* Backend: Next.js API routes, Node.js  
* Database/Auth: Supabase (PostgreSQL)  
* Payment Processing: Stripe  
* AI Services: OpenAI (Whisper, GPT4o-mini)

### **Architectural Flow Diagram**

User \-\> Supabase Auth  
|  
|---\> Image Upload  
|       |--\> AI Analysis (Antiques\_Appraisal)  
|              |--\> GPT4o-mini Summarization  
|                     |--\> TTS (Audio Playback)  
|                             |--\> User Voice Feedback  
|                                     |--\> Whisper Transcription  
|                                             |--\> AI Refinement  
|                                                     |--\> Valuation Creation  
|                                                             |--\> Monetization Logic (Tokens/Premium)  
|  
|---\> Referral System  
        |--\> User Shares Referral Link  
        |--\> New User Registers via Link  
        |--\> Supabase Referral Tracking  
        |--\> Reward Allocation (Premium Valuation)

---

## **5\. UI Components & User Flow**

#### **UI Flow:**

1. User signs up (chooses Hobby or Advanced).  
2. Upon signup, user sees initial valuation allotment and available referral option.  
3. User performs valuation (upload image → AI analysis → summary → playback → feedback).  
4. System checks valuation eligibility (free, token-based, premium).  
5. User notified clearly via UI elements about token deductions or daily limits.  
6. User prompted occasionally to refer friends for more premium valuations.  
7. Upon successful referral, immediate UI feedback through Toast notifications, and rewards are reflected clearly on the user's dashboard.

#### **Registration and Monetization Logic**

When users register/sign up, they have two subscription options:

**Hobby Plan:**

* 10 initial free valuations (standard)  
* Option to purchase additional tokens for further valuations or premium valuations.

**Advanced Plan:**

* 5 initial free standard valuations  
* 1 free premium (Advanced) valuation  
* No daily limit; valuations subject to available token balance  
* Option to purchase tokens for additional valuations

#### **Token System**

* Tokens act as credits for performing valuations beyond initial free allocations.  
* Users purchase tokens through integrated Stripe payments.  
* Each premium (Advanced) valuation or additional standard valuation beyond free allotments requires token expenditure.  
* Tokens are credited immediately upon successful payment.

#### **Referral Rewards**

* Every successful referral grants the referring user 1 additional Advanced valuation.  
* Referral reward valuation is immediately available upon the referral’s first successful login.

#### **Referral Dashboard**

* Accessible through the main user dashboard  
* Features include:  
  * Unique referral link for easy sharing (email, social media, messaging apps)  
  * Overview of referral status (total referrals, pending referrals, rewarded referrals)  
  * Visual indicators and progress tracking bars showing referral goals and earned rewards

#### **Notifications (Toast Notifications)**

* Instant feedback for referral actions:  
  * Confirmation when a referral successfully registers  
  * Notification upon earning referral rewards  
* Clear, concise messages to enhance user experience (e.g., “You’ve earned a Premium Valuation\!”)

#### **Integration within User Valuation Workflow**

* Seamless referral experience embedded directly within valuation creation and account management workflows  
* Users prompted gently to refer friends at key moments (e.g., post-valuation completion, upon token purchase)  
* Dedicated "Earn Rewards" button visible across primary navigation, directing users to the referral dashboard for immediate action

This comprehensive UI and monetization approach enhances user experience, drives platform growth through referrals, and provides clear, rewarding interaction pathways for both hobbyist and advanced users.

---

## **6\. API Specifications**

### **`Supabase APIs`**

* **`User Authentication`**

  * **`POST /auth/signup`**`: Register new users. Response: { user_id, session, error }`  
  * **`POST /auth/login`**`: User login. Response: { session, error }`  
  * **`POST /auth/logout`**`: User logout. Response: { success, error }`  
* **`Token Management`**

  * **`GET /api/tokens`**`: Retrieve user token balance and transaction history. Response: { token_balance, transaction_history }`  
  * **`POST /api/buy-tokens`**`: Purchase additional tokens. Body: { user_id, amount }, Response: { new_balance, success }`  
* **`Valuation Management`**

  * **`POST /api/create-valuation`**`: Create new antique valuation. Body: { user_id, analysis_summary, image_urls, is_detailed }, Response: { valuation_id, success, payment_required }`  
  * **`GET /api/my-valuations`**`: Retrieve user's valuations. Response: { valuations: [{ valuation_id, created_at, summary, image_urls, is_detailed }] }`  
* **`Image Upload Management`**

  * **`POST /api/upload-image`**`: Upload images and receive URL. Body: { user_id, image_file }, Response: { image_url, success }`

### **`Referral APIs`**

* **`POST /api/referral-register`**

  * `Tracks referrals and assigns rewards.`  
  * `Body: { referrer_user_id, referred_user_email }`  
  * `Response: { status, referral_id }`  
* **`GET /api/user-referrals`**

  * `Retrieves user's referral status and rewards.`  
  * `Response: { total_referrals, rewarded_referrals }`

### **`OpenAI APIs`**

* **`POST /api/ai-analysis`**

  * `Sends uploaded images for AI analysis.`  
  * `Body: { image_urls }`  
  * `Response: { description, historical_context, condition_estimate }`  
* **`POST /api/gpt-summary`**

  * `Summarizes AI analysis.`  
  * `Body: { analysis_text }`  
  * `Response: { summary_text }`  
* **`POST /api/text-to-speech`**

  * `Converts summary text to speech.`  
  * `Body: { summary_text }`  
  * `Response: { audio_url }`  
* **`POST /api/voice-feedback`**

  * `Transcribes user voice feedback using OpenAI Whisper.`  
  * `Body: { audio_file }`  
  * `Response: { transcript_text }`

### **`Stripe APIs`**

* **`POST /api/create-payment-session`**

  * `Initiates payment session for tokens or premium valuations.`  
  * `Body: { user_id, item_type, quantity }`  
  * `Response: { session_id, checkout_url }`  
* **`POST /api/webhook/stripe`**

  * `Handles Stripe payment confirmations.`  
  * `Response: { success, user_id, new_token_balance, valuation_created }`

---

## **7\. Testing & Deployment**

* Unit tests: Referral tracking, reward allocation.

* Integration tests: Referral flows with Supabase, Stripe.

* End-to-end tests: Full user journey including referrals.

* Deployment via Vercel.

* CI/CD via GitHub Actions.

---

## **8\. Success Metrics**

To effectively evaluate the referral program and the overall success of the *Antiques Appraisal* platform, we will track the following expanded metrics:

* **User Acquisition Growth via Referrals**  
  * **Definition**: The increase in new users who join the platform through referral links.  
  * **Target**: Achieve a 20% month-over-month increase in new users acquired via referrals.  
  * **Measurement**: Track the number of new users who sign up using a referral link and complete their first valuation. This ensures we measure engaged users rather than just sign-ups.  
  * **Why It Matters**: This metric reflects the referral program’s ability to drive scalable user growth, a key pillar of the app’s expansion strategy.  
* **Referral Conversion Rate**  
  * **Definition**: The percentage of referred users who complete their first valuation after signing up.  
  * **Target**: Achieve a conversion rate of at least 50%.  
  * **Measurement**: Calculated as (Number of referred users completing a valuation ÷ Total number of referred sign-ups) × 100\.  
  * **Why It Matters**: A high conversion rate indicates that the referral program attracts users who are genuinely interested in the app’s core offering, ensuring quality over quantity.  
* **Revenue Uplift from Referral-Driven Premium Valuations**  
  * **Definition**: The additional revenue generated from premium valuations purchased by referred users.  
  * **Measurement**:  
    * Track the total number of premium valuations purchased by referred users.  
    * Calculate the total revenue from these purchases.  
    * Compare the average revenue per user (ARPU) between referred and non-referred users to assess the referral program’s monetization impact.  
  * **Target**: Increase revenue from referred users’ premium valuations by 15% within the first six months.  
  * **Why It Matters**: This metric ties the referral program directly to revenue generation, ensuring it contributes to the app’s financial success.

These enhanced success metrics provide a clear, actionable framework to measure the referral program’s impact on growth, engagement, and profitability.

---

## **9\. Future Enhancements**

To build on the referral program and elevate the *Antiques Appraisal* platform, we propose the following expanded features and improvements:

* **Advanced Analytics Dashboard for Referrals**  
  * **Description**: A user-facing dashboard offering real-time insights into referral performance.  
  * **Features**:  
    * Display metrics such as referral link clicks, sign-ups, and valuations completed by referred users.  
    * Include visual progress indicators (e.g., “3 more referrals to unlock a reward”) to motivate users.  
  * **Impact**: By providing transparency and feedback, this dashboard will encourage users to actively participate in the referral program, boosting its effectiveness.  
* **Multi-Tier Referral Incentives**  
  * **Description**: A structured reward system that escalates based on referral milestones.  
  * **Additional Perks**: Offer exclusive titles (e.g., “Referral Champion”) or badges for top referrers.  
  * **Impact**: This tiered approach incentivizes users to refer more people, amplifying user acquisition and creating a competitive, engaging experience.  
* **Integration with Social Platforms for Seamless Sharing**  
  * **Description**: Enable effortless sharing of referral links across major social platforms.  
  * **Features**:  
    * One-click sharing to Facebook, Twitter, Instagram, and WhatsApp.  
    * Option to share valuation results (with user-controlled privacy settings) to showcase the app’s value.  
  * **Impact**: Simplifying the sharing process will increase referral activity and leverage social networks for organic growth, enhancing the app’s virality.

These expanded enhancements will strengthen the referral program, improve user engagement, and pave the way for sustained growth and revenue generation.

