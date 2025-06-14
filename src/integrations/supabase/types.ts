export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          performed_by?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          governorate_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          governorate_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          governorate_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city_id: string | null
          created_at: string
          governorate_id: string | null
          id: string
          is_work_address: boolean | null
          name: string
          phone: string
          secondary_phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          created_at?: string
          governorate_id?: string | null
          id?: string
          is_work_address?: boolean | null
          name: string
          phone: string
          secondary_phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city_id?: string | null
          created_at?: string
          governorate_id?: string | null
          id?: string
          is_work_address?: boolean | null
          name?: string
          phone?: string
          secondary_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      governorates: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      invoice_orders: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          order_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          merchant_name: string
          net_payout_lbp: number
          net_payout_usd: number
          total_amount_lbp: number
          total_amount_usd: number
          total_delivery_lbp: number
          total_delivery_usd: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          merchant_name: string
          net_payout_lbp?: number
          net_payout_usd?: number
          total_amount_lbp?: number
          total_amount_usd?: number
          total_delivery_lbp?: number
          total_delivery_usd?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          merchant_name?: string
          net_payout_lbp?: number
          net_payout_usd?: number
          total_amount_lbp?: number
          total_amount_usd?: number
          total_delivery_lbp?: number
          total_delivery_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          allow_opening: boolean | null
          cash_collection_enabled: boolean | null
          cash_collection_lbp: number | null
          cash_collection_usd: number | null
          client_id: string | null
          courier_name: string | null
          created_at: string
          customer_id: string
          delivery_fees_lbp: number | null
          delivery_fees_usd: number | null
          id: string
          items_count: number | null
          note: string | null
          order_id: number
          package_description: string | null
          package_type: string | null
          reference_number: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          allow_opening?: boolean | null
          cash_collection_enabled?: boolean | null
          cash_collection_lbp?: number | null
          cash_collection_usd?: number | null
          client_id?: string | null
          courier_name?: string | null
          created_at?: string
          customer_id: string
          delivery_fees_lbp?: number | null
          delivery_fees_usd?: number | null
          id?: string
          items_count?: number | null
          note?: string | null
          order_id?: number
          package_description?: string | null
          package_type?: string | null
          reference_number?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          allow_opening?: boolean | null
          cash_collection_enabled?: boolean | null
          cash_collection_lbp?: number | null
          cash_collection_usd?: number | null
          client_id?: string | null
          courier_name?: string | null
          created_at?: string
          customer_id?: string
          delivery_fees_lbp?: number | null
          delivery_fees_usd?: number | null
          id?: string
          items_count?: number | null
          note?: string | null
          order_id?: number
          package_description?: string | null
          package_type?: string | null
          reference_number?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_orders: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          pickup_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          pickup_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          pickup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_orders_pickup_id_fkey"
            columns: ["pickup_id"]
            isOneToOne: false
            referencedRelation: "pickups"
            referencedColumns: ["id"]
          },
        ]
      }
      pickups: {
        Row: {
          address: string
          client_id: string | null
          contact_person: string
          contact_phone: string
          courier_name: string | null
          courier_phone: string | null
          created_at: string
          id: string
          location: string
          note: string | null
          orders_count: number | null
          picked_up: boolean | null
          pickup_date: string
          pickup_id: string | null
          requested: boolean | null
          status: string
          updated_at: string
          validated: boolean | null
          vehicle_type: string | null
        }
        Insert: {
          address: string
          client_id?: string | null
          contact_person: string
          contact_phone: string
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          id?: string
          location: string
          note?: string | null
          orders_count?: number | null
          picked_up?: boolean | null
          pickup_date: string
          pickup_id?: string | null
          requested?: boolean | null
          status: string
          updated_at?: string
          validated?: boolean | null
          vehicle_type?: string | null
        }
        Update: {
          address?: string
          client_id?: string | null
          contact_person?: string
          contact_phone?: string
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          id?: string
          location?: string
          note?: string | null
          orders_count?: number | null
          picked_up?: boolean | null
          pickup_date?: string
          pickup_id?: string | null
          requested?: boolean | null
          status?: string
          updated_at?: string
          validated?: boolean | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pickups_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          business_type: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          user_type?: string
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          sender: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          sender: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          sender?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_pickup_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_reference_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_type: string
        }[]
      }
      get_top_courier_today: {
        Args: { start_date: string; end_date: string }
        Returns: {
          courier_name: string
          orders_count: number
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          email: string
          full_name: string
          phone: string
          business_name: string
          business_type: string
          user_type: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
