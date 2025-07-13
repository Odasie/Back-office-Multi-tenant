export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          tenant_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_reference: string
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          destination: string
          end_date: string | null
          id: string
          itinerary_data: Json | null
          lead_id: string
          start_date: string | null
          status: string | null
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_reference: string
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          destination: string
          end_date?: string | null
          id?: string
          itinerary_data?: Json | null
          lead_id: string
          start_date?: string | null
          status?: string | null
          tenant_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          booking_reference?: string
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          destination?: string
          end_date?: string | null
          id?: string
          itinerary_data?: Json | null
          lead_id?: string
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_agent_id: string | null
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          department: Database["public"]["Enums"]["department"]
          destination: string | null
          estimated_value: number | null
          id: string
          metadata: Json | null
          notes: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          department?: Database["public"]["Enums"]["department"]
          destination?: string | null
          estimated_value?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          department?: Database["public"]["Enums"]["department"]
          destination?: string | null
          estimated_value?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          related_booking_id: string | null
          related_lead_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          tenant_id: string
          time_spent: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_booking_id?: string | null
          related_lead_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tenant_id: string
          time_spent?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_booking_id?: string | null
          related_lead_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tenant_id?: string
          time_spent?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          css_overrides: Json | null
          id: string
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          css_overrides?: Json | null
          id?: string
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          css_overrides?: Json | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          description: string | null
          id: string
          priority: string | null
          related_booking_id: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          related_booking_id?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          related_booking_id?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_type: "domestic" | "international" | "b2b" | "group" | "corporate"
      department:
        | "sales"
        | "operations"
        | "finance"
        | "customer_service"
        | "management"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "negotiating"
        | "awaiting_agency_confirm"
        | "confirmed"
        | "booked"
        | "completed"
        | "cancelled"
        | "lost"
      payment_status: "pending" | "partial" | "paid" | "overdue" | "refunded"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "super_admin" | "admin" | "manager" | "agent" | "user"
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
      booking_type: ["domestic", "international", "b2b", "group", "corporate"],
      department: [
        "sales",
        "operations",
        "finance",
        "customer_service",
        "management",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal_sent",
        "negotiating",
        "awaiting_agency_confirm",
        "confirmed",
        "booked",
        "completed",
        "cancelled",
        "lost",
      ],
      payment_status: ["pending", "partial", "paid", "overdue", "refunded"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: ["super_admin", "admin", "manager", "agent", "user"],
    },
  },
} as const
