export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          email: string
          created_at: string
          last_login: string | null
          user_type: string
          first_name: string | null
          last_name: string | null
          profile_data: Json
        }
        Insert: {
          user_id?: string
          email: string
          created_at?: string
          last_login?: string | null
          user_type?: string
          first_name?: string | null
          last_name?: string | null
          profile_data?: Json
        }
        Update: {
          user_id?: string
          email?: string
          created_at?: string
          last_login?: string | null
          user_type?: string
          first_name?: string | null
          last_name?: string | null
          profile_data?: Json
        }
      }
      tokens: {
        Row: {
          user_id: string
          token_balance: number
          transaction_history: Json
        }
        Insert: {
          user_id: string
          token_balance?: number
          transaction_history?: Json
        }
        Update: {
          user_id?: string
          token_balance?: number
          transaction_history?: Json
        }
      }
      valuations: {
        Row: {
          valuation_id: string
          user_id: string
          created_at: string
          is_detailed: boolean
          valuation_report: Json
        }
        Insert: {
          valuation_id?: string
          user_id: string
          created_at?: string
          is_detailed?: boolean
          valuation_report: Json
        }
        Update: {
          valuation_id?: string
          user_id?: string
          created_at?: string
          is_detailed?: boolean
          valuation_report?: Json
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_user_id: string
          referred_user_id: string
          created_at: string
          reward_granted: boolean
        }
        Insert: {
          id?: string
          referrer_user_id: string
          referred_user_id: string
          created_at?: string
          reward_granted?: boolean
        }
        Update: {
          id?: string
          referrer_user_id?: string
          referred_user_id?: string
          created_at?: string
          reward_granted?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_token_balance: {
        Args: {
          p_user_id: string
          tokens: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 