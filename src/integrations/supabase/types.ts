export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          actor_email: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          actor_email?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          actor_email?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
          category_id: string | null
          source_type: string
          source_ref: string | null
          ai_title: string | null
          ai_description: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          category_id?: string | null
          source_type?: string
          source_ref?: string | null
          ai_title?: string | null
          ai_description?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          category_id?: string | null
          source_type?: string
          source_ref?: string | null
          ai_title?: string | null
          ai_description?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      content_library: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          category_id: string | null
          tags: string[]
          duration_seconds: number | null
          is_active: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          category_id?: string | null
          tags?: string[]
          duration_seconds?: number | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          category_id?: string | null
          tags?: string[]
          duration_seconds?: number | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_drive_links: {
        Row: {
          id: string
          user_id: string
          drive_folder_url: string
          label: string | null
          status: string
          admin_note: string | null
          approved_by: string | null
          approved_at: string | null
          video_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          drive_folder_url: string
          label?: string | null
          status?: string
          admin_note?: string | null
          approved_by?: string | null
          approved_at?: string | null
          video_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          drive_folder_url?: string
          label?: string | null
          status?: string
          admin_note?: string | null
          approved_by?: string | null
          approved_at?: string | null
          video_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          payer_name: string
          payment_method: string
          plan: string
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
          screenshot_url: string | null
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          payer_name: string
          payment_method?: string
          plan: string
          status?: string
          transaction_id: string
          updated_at?: string
          user_id: string
          screenshot_url?: string | null
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          payer_name?: string
          payment_method?: string
          plan?: string
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
          screenshot_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          account_id: string | null
          content_id: string | null
          created_at: string
          id: string
          scheduled_at: string
          status: string
          user_id: string
          platform_post_id: string | null
          error_message: string | null
          retry_count: number
          ai_title: string | null
          ai_description: string | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          account_id?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          scheduled_at: string
          status?: string
          user_id: string
          platform_post_id?: string | null
          error_message?: string | null
          retry_count?: number
          ai_title?: string | null
          ai_description?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          account_id?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          scheduled_at?: string
          status?: string
          user_id?: string
          platform_post_id?: string | null
          error_message?: string | null
          retry_count?: number
          ai_title?: string | null
          ai_description?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          platform: string
          platform_username: string | null
          status: string
          user_id: string
          refresh_token: string | null
          token_expires_at: string | null
          platform_account_id: string | null
          api_key: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          platform: string
          platform_username?: string | null
          status?: string
          user_id: string
          refresh_token?: string | null
          token_expires_at?: string | null
          platform_account_id?: string | null
          api_key?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          platform?: string
          platform_username?: string | null
          status?: string
          user_id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          platform_account_id?: string | null
          api_key?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          starts_at: string | null
          status: string
          updated_at: string
          user_id: string
          max_accounts: number
          max_uploads_per_day: number
          total_uploads_allowed: number
          uploads_used: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          max_accounts?: number
          max_uploads_per_day?: number
          total_uploads_allowed?: number
          uploads_used?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          max_accounts?: number
          max_uploads_per_day?: number
          total_uploads_allowed?: number
          uploads_used?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit: {
        Args: {
          _actor_id: string
          _action: string
          _entity_type?: string
          _entity_id?: string
          _details?: Json
        }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _user_id: string
          _type: string
          _title: string
          _message: string
          _metadata?: Json
        }
        Returns: string
      }
      increment_uploads_used: {
        Args: { _user_id: string }
        Returns: undefined
      }
      increment_usage_count: {
        Args: { _item_id: string }
        Returns: undefined
      }
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
