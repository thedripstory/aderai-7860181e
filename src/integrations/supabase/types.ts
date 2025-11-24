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
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_user_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read: boolean | null
          severity: string
          title: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read?: boolean | null
          severity: string
          title: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read?: boolean | null
          severity?: string
          title?: string
        }
        Relationships: []
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
      analytics_events: {
        Row: {
          created_at: string | null
          event_metadata: Json | null
          event_name: string
          id: string
          ip_address: string | null
          page_url: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_metadata?: Json | null
          event_name: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_metadata?: Json | null
          event_name?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_audit_log: {
        Row: {
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_reminders: {
        Row: {
          created_at: string | null
          id: string
          last_reminder_sent_at: string | null
          reminder_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reminder_sent_at?: string | null
          reminder_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reminder_sent_at?: string | null
          reminder_count?: number | null
          user_id?: string
        }
        Relationships: []
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
      klaviyo_webhook_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_marketing: boolean | null
          email_on_api_key_added: boolean | null
          email_on_api_key_changes: boolean | null
          email_on_client_added: boolean | null
          email_on_client_invitation: boolean | null
          email_on_password_reset: boolean | null
          email_on_segment_creation: boolean | null
          email_on_settings_updated: boolean | null
          email_weekly_summary: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_marketing?: boolean | null
          email_on_api_key_added?: boolean | null
          email_on_api_key_changes?: boolean | null
          email_on_client_added?: boolean | null
          email_on_client_invitation?: boolean | null
          email_on_password_reset?: boolean | null
          email_on_segment_creation?: boolean | null
          email_on_settings_updated?: boolean | null
          email_weekly_summary?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_marketing?: boolean | null
          email_on_api_key_added?: boolean | null
          email_on_api_key_changes?: boolean | null
          email_on_client_added?: boolean | null
          email_on_client_invitation?: boolean | null
          email_on_password_reset?: boolean | null
          email_on_segment_creation?: boolean | null
          email_on_settings_updated?: boolean | null
          email_weekly_summary?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          created_at: string | null
          current_step: number
          id: string
          last_step_at: string | null
          steps_completed: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_step?: number
          id?: string
          last_step_at?: string | null
          steps_completed?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_step?: number
          id?: string
          last_step_at?: string | null
          steps_completed?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      segment_creation_errors: {
        Row: {
          created_at: string | null
          error_code: string | null
          error_message: string
          id: string
          klaviyo_key_id: string
          resolved_at: string | null
          retry_count: number | null
          segment_definition: Json
          segment_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_code?: string | null
          error_message: string
          id?: string
          klaviyo_key_id: string
          resolved_at?: string | null
          retry_count?: number | null
          segment_definition: Json
          segment_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_code?: string | null
          error_message?: string
          id?: string
          klaviyo_key_id?: string
          resolved_at?: string | null
          retry_count?: number | null
          segment_definition?: Json
          segment_name?: string
          user_id?: string
        }
        Relationships: []
      }
      segment_creation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_count: number | null
          error_message: string | null
          id: string
          klaviyo_key_id: string
          segments_processed: number | null
          segments_to_create: Json
          status: string
          success_count: number | null
          total_segments: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_count?: number | null
          error_message?: string | null
          id?: string
          klaviyo_key_id: string
          segments_processed?: number | null
          segments_to_create: Json
          status?: string
          success_count?: number | null
          total_segments: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_count?: number | null
          error_message?: string | null
          id?: string
          klaviyo_key_id?: string
          segments_processed?: number | null
          segments_to_create?: Json
          status?: string
          success_count?: number | null
          total_segments?: number
          user_id?: string
        }
        Relationships: []
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          last_used_at: string | null
          secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_used_at?: string | null
          secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_used_at?: string | null
          secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usage_limits: {
        Row: {
          ai_suggestions_today: number
          ai_suggestions_total: number
          created_at: string | null
          last_reset_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_suggestions_today?: number
          ai_suggestions_total?: number
          created_at?: string | null
          last_reset_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_suggestions_today?: number
          ai_suggestions_total?: number
          created_at?: string | null
          last_reset_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string | null
          description: string
          feedback_type: string
          id: string
          metadata: Json | null
          status: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          feedback_type: string
          id?: string
          metadata?: Json | null
          status?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          feedback_type?: string
          id?: string
          metadata?: Json | null
          status?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          account_name: string
          created_at: string | null
          current_challenges: string | null
          email: string
          email_verified: boolean | null
          id: string
          industry: string | null
          klaviyo_setup_completed: boolean | null
          marketing_goals: string | null
          onboarding_completed: boolean | null
          password_hash: string
          password_reset_expires: string | null
          password_reset_token: string | null
          two_factor_backup_codes: Json | null
          two_factor_enabled: boolean | null
          two_factor_prompt_shown_at: string | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          created_at?: string | null
          current_challenges?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          industry?: string | null
          klaviyo_setup_completed?: boolean | null
          marketing_goals?: string | null
          onboarding_completed?: boolean | null
          password_hash: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          two_factor_backup_codes?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_prompt_shown_at?: string | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          created_at?: string | null
          current_challenges?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          industry?: string | null
          klaviyo_setup_completed?: boolean | null
          marketing_goals?: string | null
          onboarding_completed?: boolean | null
          password_hash?: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          two_factor_backup_codes?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_prompt_shown_at?: string | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      email_delivery_analytics: {
        Row: {
          date: string | null
          email_type: string | null
          failed: number | null
          successful: number | null
          total_emails: number | null
        }
        Relationships: []
      }
      segment_error_analytics: {
        Row: {
          date: string | null
          resolved_errors: number | null
          total_errors: number | null
          unresolved_errors: number | null
        }
        Relationships: []
      }
      user_growth_analytics: {
        Row: {
          date: string | null
          new_users: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
