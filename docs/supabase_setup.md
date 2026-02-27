# Supabase Setup & Integration Documentation

## Overview
This document provides a comprehensive explanation of the Supabase database schema and configuration essential for integrating and powering the Antiques Appraisal application. It details all necessary tables, columns, relationships, data types, policies, and functional integration points.

## Database Tables & Descriptions

### 1. Users Table (`users`)
Stores essential user authentication data and profile details.

- **Columns:**
  - `user_id` (UUID, Primary Key): Unique identifier for each user.
  - `email` (TEXT, Unique, Not Null): User’s email address.
  - `created_at` (TIMESTAMP): Timestamp of account creation.
  - `last_login` (TIMESTAMP): Timestamp of last login.
  - `user_type` (TEXT DEFAULT 'user'): User type (e.g., 'admin', 'user').
  - `first_name` (TEXT): User's first name.
  - `last_name` (TEXT): User's last name.
  - `profile_data` (JSONB): Stores additional user preferences, subscription details, etc.

### 2. Tokens Table (`tokens`)
Manages the token system for valuation access and premium features.

- **Columns:**
  - `user_id` (UUID, Primary Key, Foreign Key → users.user_id): Associated user's ID.
  - `token_balance` (INTEGER): User’s available tokens for valuations.
  - `transaction_history` (JSONB): Historical log of token transactions including purchases and usages.

### 3. Valuations Table (`valuations`)
Stores user-generated valuations including detailed structured reports.

- **Columns:**
  - `valuation_id` (UUID, Primary Key): Unique identifier for each valuation.
  - `user_id` (UUID, Foreign Key → users.user_id): ID of the user who created the valuation.
  - `created_at` (TIMESTAMP): Timestamp when the valuation was created.
  - `is_detailed` (BOOLEAN): Flag indicating whether valuation is premium/detailed.
  - `valuation_report` (JSONB): Fully structured valuation response, including all detailed report sections as per defined JSON schema.

### 4. Referrals Table (`referrals`)
Manages referral tracking and reward allocation for user referrals.

- **Columns:**
  - `id` (UUID, Primary Key): Unique referral record identifier.
  - `referrer_user_id` (UUID, Foreign Key → users.user_id): User who initiated the referral.
  - `referred_user_id` (UUID, Foreign Key → users.user_id): User who registered via the referral.
  - `created_at` (TIMESTAMP): Timestamp when referral occurred.
  - `reward_granted` (BOOLEAN): Indicates whether the referral reward has been granted.

## Table Relationships
- `users.user_id` ↔ `tokens.user_id` (one-to-one)
- `users.user_id` ↔ `valuations.user_id` (one-to-many)
- `users.user_id` ↔ `referrals.referrer_user_id` (one-to-many)
- `users.user_id` ↔ `referrals.referred_user_id` (one-to-one)

## Security & Row-Level Security (RLS)
All tables implement Row-Level Security (RLS) to ensure users can access only their own data.

- **Policies:**
  - **Users Policy:** Users can read and write their own profiles.
  - **Tokens Policy:** Users can access and update their own token balances and transaction history.
  - **Valuations Policy:** Users can access and manage only their own valuations.
  - **Referrals Policy:** Users involved in referrals (as referrer or referred) can access relevant referral information.

## Storage Integration
- **Image Storage:** Utilizes Supabase Storage bucket named `antique-images` for secure user-uploaded antique images.
- Permissions set to restrict access to authenticated users only.

## Supabase Functions
### Token Balance Update Function
A server-side PostgreSQL function facilitates automatic token balance updates.

- **Function Definition:**
  - `update_token_balance(p_user_id UUID, tokens INTEGER)`: Updates token balances and logs transactions for token purchases or consumption.

## User Synchronization Function
Synchronizes newly authenticated users into the `public.users` and `public.tokens` tables.

- **Trigger Function Definition:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE user_id = NEW.id) THEN
    INSERT INTO public.users (user_id, email, created_at, user_type)
    VALUES (NEW.id, NEW.email, NEW.created_at, 'user');

    INSERT INTO public.tokens (user_id, token_balance)
    VALUES (NEW.id, 5);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Conclusion
This Supabase schema and configuration setup seamlessly integrates essential database operations into the Antiques Appraisal application, ensuring secure, efficient, and reliable data management.
