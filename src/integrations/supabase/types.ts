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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          active: boolean
          admin_name: string
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          admin_name: string
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          admin_name?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          created_at: string
          expenses: Json
          id: string
          income_amount: number
          income_currency: string
          income_frequency: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expenses?: Json
          id?: string
          income_amount: number
          income_currency?: string
          income_frequency: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expenses?: Json
          id?: string
          income_amount?: number
          income_currency?: string
          income_frequency?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          context_data: Json
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          context_data?: Json
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          context_data?: Json
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          base_currency: string
          created_at: string
          id: string
          rate: number
          source: string | null
          target_currency: string
        }
        Insert: {
          base_currency: string
          created_at?: string
          id?: string
          rate: number
          source?: string | null
          target_currency: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          id?: string
          rate?: number
          source?: string | null
          target_currency?: string
        }
        Relationships: []
      }
      financial_health_scores: {
        Row: {
          budget_id: string | null
          created_at: string
          health_score: number
          id: string
          recommendations: Json
          score_factors: Json
        }
        Insert: {
          budget_id?: string | null
          created_at?: string
          health_score: number
          id?: string
          recommendations?: Json
          score_factors?: Json
        }
        Update: {
          budget_id?: string | null
          created_at?: string
          health_score?: number
          id?: string
          recommendations?: Json
          score_factors?: Json
        }
        Relationships: [
          {
            foreignKeyName: "financial_health_scores_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          notes: string | null
          order_id: string
          payment_method: string | null
          previous_status: string | null
          recorded_by: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          order_id: string
          payment_method?: string | null
          previous_status?: string | null
          recorded_by?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          order_id?: string
          payment_method?: string | null
          previous_status?: string | null
          recorded_by?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_public: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          is_public?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_public?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          order_id: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          order_id?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_history: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          order_id: string
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          order_id: string
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notified: boolean | null
          assigned_rider_id: string | null
          confirmed_at: string | null
          confirmed_by_session_id: string | null
          created_at: string
          customer_address: string | null
          customer_coordinates: Json | null
          customer_name: string | null
          customer_number: string | null
          customer_user_id: string | null
          estimated_ready_time: string | null
          id: string
          order_type: string
          payment_method: string | null
          rider_accepted_at: string | null
          rider_notified: boolean | null
          rider_number: string | null
          status: string
          total: number
          updated_at: string
          waiter_user_id: string | null
        }
        Insert: {
          admin_notified?: boolean | null
          assigned_rider_id?: string | null
          confirmed_at?: string | null
          confirmed_by_session_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_coordinates?: Json | null
          customer_name?: string | null
          customer_number?: string | null
          customer_user_id?: string | null
          estimated_ready_time?: string | null
          id?: string
          order_type: string
          payment_method?: string | null
          rider_accepted_at?: string | null
          rider_notified?: boolean | null
          rider_number?: string | null
          status?: string
          total: number
          updated_at?: string
          waiter_user_id?: string | null
        }
        Update: {
          admin_notified?: boolean | null
          assigned_rider_id?: string | null
          confirmed_at?: string | null
          confirmed_by_session_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_coordinates?: Json | null
          customer_name?: string | null
          customer_number?: string | null
          customer_user_id?: string | null
          estimated_ready_time?: string | null
          id?: string
          order_type?: string
          payment_method?: string | null
          rider_accepted_at?: string | null
          rider_notified?: boolean | null
          rider_number?: string | null
          status?: string
          total?: number
          updated_at?: string
          waiter_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_confirmed_by_session_id_fkey"
            columns: ["confirmed_by_session_id"]
            isOneToOne: false
            referencedRelation: "admin_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      price_data: {
        Row: {
          category: string | null
          created_at: string
          currency: string
          id: string
          item_name: string
          location: string | null
          price: number
          source: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string
          id?: string
          item_name: string
          location?: string | null
          price: number
          source?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string
          id?: string
          item_name?: string
          location?: string | null
          price?: number
          source?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          location: string | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role_new"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role_new"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role_new"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_confirm_delivery: {
        Args: { order_id: string }
        Returns: {
          admin_notified: boolean | null
          assigned_rider_id: string | null
          confirmed_at: string | null
          confirmed_by_session_id: string | null
          created_at: string
          customer_address: string | null
          customer_coordinates: Json | null
          customer_name: string | null
          customer_number: string | null
          customer_user_id: string | null
          estimated_ready_time: string | null
          id: string
          order_type: string
          payment_method: string | null
          rider_accepted_at: string | null
          rider_notified: boolean | null
          rider_number: string | null
          status: string
          total: number
          updated_at: string
          waiter_user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      can_update_order_for_dashboard_user: {
        Args: {
          new_row: Database["public"]["Tables"]["orders"]["Row"]
          old_row: Database["public"]["Tables"]["orders"]["Row"]
        }
        Returns: boolean
      }
      current_auth_uid: { Args: never; Returns: string }
      get_order_statistics: { Args: never; Returns: Json }
      get_requester_user_role: { Args: never; Returns: string }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role_new"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_all_orders: { Args: never; Returns: undefined }
      reset_todays_orders: { Args: never; Returns: undefined }
      rider_report_delivery: {
        Args: { order_id: string; payment_method?: string }
        Returns: {
          admin_notified: boolean | null
          assigned_rider_id: string | null
          confirmed_at: string | null
          confirmed_by_session_id: string | null
          created_at: string
          customer_address: string | null
          customer_coordinates: Json | null
          customer_name: string | null
          customer_number: string | null
          customer_user_id: string | null
          estimated_ready_time: string | null
          id: string
          order_type: string
          payment_method: string | null
          rider_accepted_at: string | null
          rider_notified: boolean | null
          rider_number: string | null
          status: string
          total: number
          updated_at: string
          waiter_user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "timelexx_kitchen" | "customer_hub" | "timelexx_riders"
      app_role_new: "customer" | "admin" | "rider"
      transaction_type:
        | "order_created"
        | "payment_received"
        | "payment_verified"
        | "status_change"
        | "refund"
        | "adjustment"
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
      app_role: ["timelexx_kitchen", "customer_hub", "timelexx_riders"],
      app_role_new: ["customer", "admin", "rider"],
      transaction_type: [
        "order_created",
        "payment_received",
        "payment_verified",
        "status_change",
        "refund",
        "adjustment",
      ],
    },
  },
} as const
