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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      client_payouts: {
        Row: {
          client_id: string
          collected_amount_lbp: number | null
          collected_amount_usd: number | null
          created_at: string
          created_by: string | null
          delivery_fee_lbp: number | null
          delivery_fee_usd: number | null
          id: string
          invoice_id: string | null
          net_payout_lbp: number | null
          net_payout_usd: number | null
          order_id: string
          payout_status: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          collected_amount_lbp?: number | null
          collected_amount_usd?: number | null
          created_at?: string
          created_by?: string | null
          delivery_fee_lbp?: number | null
          delivery_fee_usd?: number | null
          id?: string
          invoice_id?: string | null
          net_payout_lbp?: number | null
          net_payout_usd?: number | null
          order_id: string
          payout_status?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          collected_amount_lbp?: number | null
          collected_amount_usd?: number | null
          created_at?: string
          created_by?: string | null
          delivery_fee_lbp?: number | null
          delivery_fee_usd?: number | null
          id?: string
          invoice_id?: string | null
          net_payout_lbp?: number | null
          net_payout_usd?: number | null
          order_id?: string
          payout_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_payouts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          address: string | null
          admin_notes: string | null
          assigned_zones: string[] | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_photo_url: string | null
          license_photo_url: string | null
          phone: string | null
          status: string | null
          vehicle_type: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          assigned_zones?: string[] | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_photo_url?: string | null
          license_photo_url?: string | null
          phone?: string | null
          status?: string | null
          vehicle_type?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          assigned_zones?: string[] | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_photo_url?: string | null
          license_photo_url?: string | null
          phone?: string | null
          status?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city_id: string | null
          created_at: string
          created_by: string
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
          created_by: string
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
          created_by?: string
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
      invoice_counters: {
        Row: {
          company_id: string
          created_at: string
          id: string
          next_number: number
          updated_at: string
        }
        Insert: {
          company_id?: string
          created_at?: string
          id?: string
          next_number?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          next_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount_collected_lbp: number
          amount_collected_usd: number
          created_at: string
          delivery_fee_lbp: number
          delivery_fee_usd: number
          id: string
          invoice_id: string
          net_payout_lbp: number
          net_payout_usd: number
          order_id: string
        }
        Insert: {
          amount_collected_lbp?: number
          amount_collected_usd?: number
          created_at?: string
          delivery_fee_lbp?: number
          delivery_fee_usd?: number
          id?: string
          invoice_id: string
          net_payout_lbp?: number
          net_payout_usd?: number
          order_id: string
        }
        Update: {
          amount_collected_lbp?: number
          amount_collected_usd?: number
          created_at?: string
          delivery_fee_lbp?: number
          delivery_fee_usd?: number
          id?: string
          invoice_id?: string
          net_payout_lbp?: number
          net_payout_usd?: number
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
          total_amount_lbp?: number
          total_amount_usd?: number
          total_delivery_lbp?: number
          total_delivery_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_price_snapshot: {
        Row: {
          base_fee_lbp: number | null
          base_fee_usd: number | null
          calculated_at: string
          city_id: string | null
          client_id: string | null
          extra_fee_lbp: number | null
          extra_fee_usd: number | null
          governorate_id: string | null
          id: string
          order_id: string
          package_type: string | null
          pricing_source: string | null
          rule_details: Json | null
          total_fee_lbp: number | null
          total_fee_usd: number | null
        }
        Insert: {
          base_fee_lbp?: number | null
          base_fee_usd?: number | null
          calculated_at?: string
          city_id?: string | null
          client_id?: string | null
          extra_fee_lbp?: number | null
          extra_fee_usd?: number | null
          governorate_id?: string | null
          id?: string
          order_id: string
          package_type?: string | null
          pricing_source?: string | null
          rule_details?: Json | null
          total_fee_lbp?: number | null
          total_fee_usd?: number | null
        }
        Update: {
          base_fee_lbp?: number | null
          base_fee_usd?: number | null
          calculated_at?: string
          city_id?: string | null
          client_id?: string | null
          extra_fee_lbp?: number | null
          extra_fee_usd?: number | null
          governorate_id?: string | null
          id?: string
          order_id?: string
          package_type?: string | null
          pricing_source?: string | null
          rule_details?: Json | null
          total_fee_lbp?: number | null
          total_fee_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_price_snapshot_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          allow_opening: boolean | null
          archived: boolean | null
          cash_collection_enabled: boolean | null
          cash_collection_lbp: number | null
          cash_collection_usd: number | null
          client_id: string | null
          collected_amount_lbp: number | null
          collected_amount_usd: number | null
          collected_currency: string | null
          collection_timestamp: string | null
          courier_id: string | null
          courier_name: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          delivery_fees_lbp: number | null
          delivery_fees_usd: number | null
          delivery_photo_url: string | null
          edit_history: Json | null
          edited: boolean | null
          id: string
          invoice_id: string | null
          items_count: number | null
          note: string | null
          order_id: number
          package_description: string | null
          package_type: string | null
          payment_status: string | null
          payout_status: string | null
          pricing_source: string | null
          reason_unsuccessful: string | null
          reference_number: string | null
          status: string | null
          type: string
          unsuccessful_reason: string | null
          updated_at: string
        }
        Insert: {
          allow_opening?: boolean | null
          archived?: boolean | null
          cash_collection_enabled?: boolean | null
          cash_collection_lbp?: number | null
          cash_collection_usd?: number | null
          client_id?: string | null
          collected_amount_lbp?: number | null
          collected_amount_usd?: number | null
          collected_currency?: string | null
          collection_timestamp?: string | null
          courier_id?: string | null
          courier_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          delivery_fees_lbp?: number | null
          delivery_fees_usd?: number | null
          delivery_photo_url?: string | null
          edit_history?: Json | null
          edited?: boolean | null
          id?: string
          invoice_id?: string | null
          items_count?: number | null
          note?: string | null
          order_id?: number
          package_description?: string | null
          package_type?: string | null
          payment_status?: string | null
          payout_status?: string | null
          pricing_source?: string | null
          reason_unsuccessful?: string | null
          reference_number?: string | null
          status?: string | null
          type: string
          unsuccessful_reason?: string | null
          updated_at?: string
        }
        Update: {
          allow_opening?: boolean | null
          archived?: boolean | null
          cash_collection_enabled?: boolean | null
          cash_collection_lbp?: number | null
          cash_collection_usd?: number | null
          client_id?: string | null
          collected_amount_lbp?: number | null
          collected_amount_usd?: number | null
          collected_currency?: string | null
          collection_timestamp?: string | null
          courier_id?: string | null
          courier_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          delivery_fees_lbp?: number | null
          delivery_fees_usd?: number | null
          delivery_photo_url?: string | null
          edit_history?: Json | null
          edited?: boolean | null
          id?: string
          invoice_id?: string | null
          items_count?: number | null
          note?: string | null
          order_id?: number
          package_description?: string | null
          package_type?: string | null
          payment_status?: string | null
          payout_status?: string | null
          pricing_source?: string | null
          reason_unsuccessful?: string | null
          reference_number?: string | null
          status?: string | null
          type?: string
          unsuccessful_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_courier_id_fk"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_invoice_id_fk"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
          {
            foreignKeyName: "pickups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_change_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string
          entity_id: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          pricing_type: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          pricing_type: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          pricing_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_change_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_client_defaults: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          default_fee_lbp: number | null
          default_fee_usd: number | null
          id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          default_fee_lbp?: number | null
          default_fee_usd?: number | null
          id?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          default_fee_lbp?: number | null
          default_fee_usd?: number | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_client_defaults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_client_overrides: {
        Row: {
          city_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          fee_lbp: number
          fee_usd: number
          governorate_id: string | null
          id: string
          package_type: string | null
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          fee_lbp: number
          fee_usd: number
          governorate_id?: string | null
          id?: string
          package_type?: string | null
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          fee_lbp?: number
          fee_usd?: number
          governorate_id?: string | null
          id?: string
          package_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_client_overrides_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_client_overrides_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_client_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_client_overrides_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_client_package_extras: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          extra_fee_lbp: number | null
          extra_fee_usd: number | null
          id: string
          package_type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          extra_fee_lbp?: number | null
          extra_fee_usd?: number | null
          id?: string
          package_type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          extra_fee_lbp?: number | null
          extra_fee_usd?: number | null
          id?: string
          package_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_client_package_extras_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_client_zone_rules: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          fee_lbp: number | null
          fee_usd: number | null
          governorate_ids: string[]
          id: string
          rule_name: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          fee_lbp?: number | null
          fee_usd?: number | null
          governorate_ids: string[]
          id?: string
          rule_name?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          fee_lbp?: number | null
          fee_usd?: number | null
          governorate_ids?: string[]
          id?: string
          rule_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_client_zone_rules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_global: {
        Row: {
          created_at: string
          default_fee_lbp: number
          default_fee_usd: number
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          default_fee_lbp?: number
          default_fee_usd?: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          default_fee_lbp?: number
          default_fee_usd?: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_global_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_package_extras_global: {
        Row: {
          created_at: string
          extra_lbp: number | null
          extra_usd: number | null
          id: string
          package_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          extra_lbp?: number | null
          extra_usd?: number | null
          id?: string
          package_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          extra_lbp?: number | null
          extra_usd?: number | null
          id?: string
          package_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_package_types: {
        Row: {
          city_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          fee_lbp: number
          fee_usd: number
          governorate_id: string | null
          id: string
          is_active: boolean | null
          package_type: string
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          fee_lbp: number
          fee_usd: number
          governorate_id?: string | null
          id?: string
          is_active?: boolean | null
          package_type: string
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          fee_lbp?: number
          fee_usd?: number
          governorate_id?: string | null
          id?: string
          is_active?: boolean | null
          package_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_package_types_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_package_types_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_package_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_package_types_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_zone: {
        Row: {
          created_at: string
          fee_lbp: number | null
          fee_usd: number | null
          governorate_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_lbp?: number | null
          fee_usd?: number | null
          governorate_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_lbp?: number | null
          fee_usd?: number | null
          governorate_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_zone_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: true
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_zone_rules: {
        Row: {
          city_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          fee_lbp: number
          fee_usd: number
          governorate_id: string | null
          id: string
          is_active: boolean | null
          package_type: string | null
          updated_at: string
          zone_name: string | null
        }
        Insert: {
          city_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          fee_lbp: number
          fee_usd: number
          governorate_id?: string | null
          id?: string
          is_active?: boolean | null
          package_type?: string | null
          updated_at?: string
          zone_name?: string | null
        }
        Update: {
          city_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          fee_lbp?: number
          fee_usd?: number
          governorate_id?: string | null
          id?: string
          is_active?: boolean | null
          package_type?: string | null
          updated_at?: string
          zone_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_zone_rules_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_zone_rules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_zone_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_zone_rules_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
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
          issue_description: string | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          status: string
          ticket_number: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          issue_description?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          status?: string
          ticket_number?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          issue_description?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          status?: string
          ticket_number?: string | null
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
      calculate_comprehensive_delivery_fee: {
        Args: {
          p_city_id?: string
          p_client_id?: string
          p_governorate_id?: string
          p_package_type?: string
        }
        Returns: {
          base_fee_lbp: number
          base_fee_usd: number
          extra_fee_lbp: number
          extra_fee_usd: number
          pricing_source: string
          rule_details: Json
          total_fee_lbp: number
          total_fee_usd: number
        }[]
      }
      calculate_delivery_fee: {
        Args: {
          p_city_id?: string
          p_client_id?: string
          p_governorate_id?: string
          p_package_type?: string
        }
        Returns: {
          fee_lbp: number
          fee_usd: number
          rule_type: string
        }[]
      }
      create_invoice_with_items: {
        Args: { p_merchant_name?: string; p_order_ids: string[] }
        Returns: Json
      }
      delete_client_pricing_configuration: {
        Args: { p_client_id: string }
        Returns: undefined
      }
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
      generate_sequential_invoice_id: {
        Args: { p_company_id?: string }
        Returns: string
      }
      generate_ticket_number: {
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
        Args: { end_date: string; start_date: string }
        Returns: {
          courier_name: string
          orders_count: number
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          business_name: string
          business_type: string
          email: string
          full_name: string
          id: string
          phone: string
          user_type: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: { details?: Json; entity_id: string; event_type: string }
        Returns: undefined
      }
      mark_invoice_as_paid: {
        Args: { p_invoice_id: string }
        Returns: Json
      }
      update_user_role: {
        Args: { new_role: string; target_user_id: string }
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
