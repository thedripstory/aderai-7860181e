export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          affiliate_code: string
          converted: boolean | null
          created_at: string | null
          id: string
          ip_address: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_code: string
          converted?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_code?: string
          converted?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      affiliate_stats: {
        Row: {
          affiliate_user_id: string
          commission_amount: number
          commission_paid: boolean | null
          commission_type: string
          created_at: string | null
          id: string
          payment_date: string | null
          referred_user_id: string
          stripe_payment_id: string | null
        }
        Insert: {
          affiliate_user_id: string
          commission_amount: number
          commission_paid?: boolean | null
          commission_type: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          referred_user_id: string
          stripe_payment_id?: string | null
        }
        Update: {
          affiliate_user_id?: string
          commission_amount?: number
          commission_paid?: boolean | null
          commission_type?: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          referred_user_id?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_stats_affiliate_user_id_fkey"
            columns: ["affiliate_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_stats_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          challenge: string | null
          created_at: string | null
          created_segments: Json | null
          frequency: string | null
          goal: string
          id: string
          industry: string
          klaviyo_key_id: string
          specific_behaviors: string | null
          suggested_segments: Json
          user_id: string
        }
        Insert: {
          challenge?: string | null
          created_at?: string | null
          created_segments?: Json | null
          frequency?: string | null
          goal: string
          id?: string
          industry: string
          klaviyo_key_id: string
          specific_behaviors?: string | null
          suggested_segments: Json
          user_id: string
        }
        Update: {
          challenge?: string | null
          created_at?: string | null
          created_segments?: Json | null
          frequency?: string | null
          goal?: string
          id?: string
          industry?: string
          klaviyo_key_id?: string
          specific_behaviors?: string | null
          suggested_segments?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_klaviyo_key_id_fkey"
            columns: ["klaviyo_key_id"]
            isOneToOne: false
            referencedRelation: "klaviyo_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      klaviyo_keys: {
        Row: {
          aov: number | null
          churned_days: number | null
          client_name: string | null
          created_at: string | null
          currency: string | null
          currency_symbol: string | null
          high_value_threshold: number | null
          id: string
          is_active: boolean | null
          klaviyo_api_key_hash: string
          lapsed_days: number | null
          locked: boolean | null
          new_customer_days: number | null
          updated_at: string | null
          user_id: string
          vip_threshold: number | null
        }
        Insert: {
          aov?: number | null
          churned_days?: number | null
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          currency_symbol?: string | null
          high_value_threshold?: number | null
          id?: string
          is_active?: boolean | null
          klaviyo_api_key_hash: string
          lapsed_days?: number | null
          locked?: boolean | null
          new_customer_days?: number | null
          updated_at?: string | null
          user_id: string
          vip_threshold?: number | null
        }
        Update: {
          aov?: number | null
          churned_days?: number | null
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          currency_symbol?: string | null
          high_value_threshold?: number | null
          id?: string
          is_active?: boolean | null
          klaviyo_api_key_hash?: string
          lapsed_days?: number | null
          locked?: boolean | null
          new_customer_days?: number | null
          updated_at?: string | null
          user_id?: string
          vip_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "klaviyo_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_analytics_cache: {
        Row: {
          cached_at: string | null
          id: string
          klaviyo_key_id: string
          segment_data: Json
        }
        Insert: {
          cached_at?: string | null
          id?: string
          klaviyo_key_id: string
          segment_data: Json
        }
        Update: {
          cached_at?: string | null
          id?: string
          klaviyo_key_id?: string
          segment_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "segment_analytics_cache_klaviyo_key_id_fkey"
            columns: ["klaviyo_key_id"]
            isOneToOne: false
            referencedRelation: "klaviyo_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_name: string
          account_type: string
          affiliate_code: string | null
          created_at: string | null
          current_challenges: string | null
          email: string
          email_list_size_range: string | null
          email_verified: boolean | null
          id: string
          industry: string | null
          klaviyo_setup_completed: boolean | null
          marketing_goals: string | null
          monthly_revenue_range: string | null
          onboarding_completed: boolean | null
          password_hash: string
          referred_by: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_type: string
          affiliate_code?: string | null
          created_at?: string | null
          current_challenges?: string | null
          email: string
          email_list_size_range?: string | null
          email_verified?: boolean | null
          id?: string
          industry?: string | null
          klaviyo_setup_completed?: boolean | null
          marketing_goals?: string | null
          monthly_revenue_range?: string | null
          onboarding_completed?: boolean | null
          password_hash: string
          referred_by?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_type?: string
          affiliate_code?: string | null
          created_at?: string | null
          current_challenges?: string | null
          email?: string
          email_list_size_range?: string | null
          email_verified?: boolean | null
          id?: string
          industry?: string | null
          klaviyo_setup_completed?: boolean | null
          marketing_goals?: string | null
          monthly_revenue_range?: string | null
          onboarding_completed?: boolean | null
          password_hash?: string
          referred_by?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_affiliate_code: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
