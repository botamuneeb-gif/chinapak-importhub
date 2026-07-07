export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          display_name: string | null;
          primary_role: Database["public"]["Enums"]["user_role"] | null;
          preferred_language: string;
          status: "pending" | "active" | "suspended" | "revoked" | "hidden_future";
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          display_name?: string | null;
          primary_role?: Database["public"]["Enums"]["user_role"] | null;
          preferred_language?: string;
          status?: "pending" | "active" | "suspended" | "revoked" | "hidden_future";
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          display_name?: string | null;
          primary_role?: Database["public"]["Enums"]["user_role"] | null;
          preferred_language?: string;
          status?: "pending" | "active" | "suspended" | "revoked" | "hidden_future";
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      role_assignments: {
        Row: {
          id: string;
          user_profile_id: string;
          role: Database["public"]["Enums"]["user_role"];
          status: "active" | "pending" | "suspended" | "revoked";
          assigned_by: string | null;
          assigned_at: string;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_profile_id: string;
          role: Database["public"]["Enums"]["user_role"];
          status?: "active" | "pending" | "suspended" | "revoked";
          assigned_by?: string | null;
          assigned_at?: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_profile_id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          status?: "active" | "pending" | "suspended" | "revoked";
          assigned_by?: string | null;
          assigned_at?: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      importer_profiles: {
        Row: {
          id: string;
          user_profile_id: string;
          importer_code: string | null;
          full_name: string | null;
          phone_whatsapp: string | null;
          city: string | null;
          business_type: string | null;
          verification_status: string;
          support_notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_profile_id: string;
          importer_code?: string | null;
          full_name?: string | null;
          phone_whatsapp?: string | null;
          city?: string | null;
          business_type?: string | null;
          verification_status?: string;
          support_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_profile_id?: string;
          importer_code?: string | null;
          full_name?: string | null;
          phone_whatsapp?: string | null;
          city?: string | null;
          business_type?: string | null;
          verification_status?: string;
          support_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      fms_profiles: {
        Row: {
          id: string;
          user_profile_id: string;
          fms_code: string;
          tier: Database["public"]["Enums"]["fms_tier"];
          city_province: string | null;
          categories: string[];
          academy_status: Database["public"]["Enums"]["training_status"];
          quality_score: number | null;
          status: Database["public"]["Enums"]["profile_status"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_profile_id: string;
          fms_code: string;
          tier?: Database["public"]["Enums"]["fms_tier"];
          city_province?: string | null;
          categories?: string[];
          academy_status?: Database["public"]["Enums"]["training_status"];
          quality_score?: number | null;
          status?: Database["public"]["Enums"]["profile_status"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_profile_id?: string;
          fms_code?: string;
          tier?: Database["public"]["Enums"]["fms_tier"];
          city_province?: string | null;
          categories?: string[];
          academy_status?: Database["public"]["Enums"]["training_status"];
          quality_score?: number | null;
          status?: Database["public"]["Enums"]["profile_status"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          id: string;
          user_profile_id: string;
          department: string | null;
          permission_group: string | null;
          status: Database["public"]["Enums"]["profile_status"];
          two_factor_required: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_profile_id: string;
          department?: string | null;
          permission_group?: string | null;
          status?: Database["public"]["Enums"]["profile_status"];
          two_factor_required?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_profile_id?: string;
          department?: string | null;
          permission_group?: string | null;
          status?: Database["public"]["Enums"]["profile_status"];
          two_factor_required?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      representatives: {
        Row: {
          id: string;
          full_name: string;
          display_name: string;
          verification_code: string;
          code_status: Database["public"]["Enums"]["representative_code_status"];
          representative_status: Database["public"]["Enums"]["representative_status"];
          province: string | null;
          city: string | null;
          service_area: string | null;
          role_title: string;
          linked_user_id: string | null;
          agent_profile_id: string | null;
          public_notes: string | null;
          internal_notes: string | null;
          activated_at: string | null;
          suspended_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          full_name: string;
          display_name: string;
          verification_code: string;
          code_status?: Database["public"]["Enums"]["representative_code_status"];
          representative_status?: Database["public"]["Enums"]["representative_status"];
          province?: string | null;
          city?: string | null;
          service_area?: string | null;
          role_title?: string;
          linked_user_id?: string | null;
          agent_profile_id?: string | null;
          public_notes?: string | null;
          internal_notes?: string | null;
          activated_at?: string | null;
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          full_name?: string;
          display_name?: string;
          verification_code?: string;
          code_status?: Database["public"]["Enums"]["representative_code_status"];
          representative_status?: Database["public"]["Enums"]["representative_status"];
          province?: string | null;
          city?: string | null;
          service_area?: string | null;
          role_title?: string;
          linked_user_id?: string | null;
          agent_profile_id?: string | null;
          public_notes?: string | null;
          internal_notes?: string | null;
          activated_at?: string | null;
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      representative_verification_attempts: {
        Row: {
          id: string;
          verification_code_entered: string;
          normalized_code: string;
          matched_representative_id: string | null;
          result: Database["public"]["Enums"]["representative_verification_result"];
          requester_ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          verification_code_entered: string;
          normalized_code: string;
          matched_representative_id?: string | null;
          result: Database["public"]["Enums"]["representative_verification_result"];
          requester_ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          verification_code_entered?: string;
          normalized_code?: string;
          matched_representative_id?: string | null;
          result?: Database["public"]["Enums"]["representative_verification_result"];
          requester_ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      packages: {
        Row: {
          id: string;
          package_code: string;
          name: string;
          price_pkr: number;
          best_for_budget: string | null;
          factory_option_count: string | null;
          delivery_days_min: number | null;
          delivery_days_max: number | null;
          is_recommended: boolean;
          status: Database["public"]["Enums"]["package_status"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          package_code: string;
          name: string;
          price_pkr: number;
          best_for_budget?: string | null;
          factory_option_count?: string | null;
          delivery_days_min?: number | null;
          delivery_days_max?: number | null;
          is_recommended?: boolean;
          status?: Database["public"]["Enums"]["package_status"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          package_code?: string;
          name?: string;
          price_pkr?: number;
          best_for_budget?: string | null;
          factory_option_count?: string | null;
          delivery_days_min?: number | null;
          delivery_days_max?: number | null;
          is_recommended?: boolean;
          status?: Database["public"]["Enums"]["package_status"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      addons: {
        Row: {
          id: string;
          addon_code: string;
          name: string;
          price_type: Database["public"]["Enums"]["addon_price_type"];
          price_min_pkr: number | null;
          price_max_pkr: number | null;
          percentage_rate: number | null;
          status: Database["public"]["Enums"]["package_status"];
          requires_human_review: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          addon_code: string;
          name: string;
          price_type: Database["public"]["Enums"]["addon_price_type"];
          price_min_pkr?: number | null;
          price_max_pkr?: number | null;
          percentage_rate?: number | null;
          status?: Database["public"]["Enums"]["package_status"];
          requires_human_review?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          addon_code?: string;
          name?: string;
          price_type?: Database["public"]["Enums"]["addon_price_type"];
          price_min_pkr?: number | null;
          price_max_pkr?: number | null;
          percentage_rate?: number | null;
          status?: Database["public"]["Enums"]["package_status"];
          requires_human_review?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      import_projects: {
        Row: {
          id: string;
          project_code: string;
          importer_profile_id: string;
          importer_user_id: string;
          package_id: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          project_status: Database["public"]["Enums"]["project_status"];
          admin_review_status: Database["public"]["Enums"]["admin_review_status"];
          paid_at: string | null;
          admin_reviewed_at: string | null;
          ready_for_fms_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_code: string;
          importer_profile_id: string;
          importer_user_id: string;
          package_id?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          project_status?: Database["public"]["Enums"]["project_status"];
          admin_review_status?: Database["public"]["Enums"]["admin_review_status"];
          paid_at?: string | null;
          admin_reviewed_at?: string | null;
          ready_for_fms_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_code?: string;
          importer_profile_id?: string;
          importer_user_id?: string;
          package_id?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          project_status?: Database["public"]["Enums"]["project_status"];
          admin_review_status?: Database["public"]["Enums"]["admin_review_status"];
          paid_at?: string | null;
          admin_reviewed_at?: string | null;
          ready_for_fms_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      import_project_requirements: {
        Row: {
          id: string;
          project_id: string;
          product_name: string | null;
          product_description: string | null;
          product_links: string[];
          budget_range: string | null;
          quantity: string | null;
          quality_level: string | null;
          import_experience: string | null;
          special_notes: string | null;
          input_methods: string[];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_id: string;
          product_name?: string | null;
          product_description?: string | null;
          product_links?: string[];
          budget_range?: string | null;
          quantity?: string | null;
          quality_level?: string | null;
          import_experience?: string | null;
          special_notes?: string | null;
          input_methods?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_id?: string;
          product_name?: string | null;
          product_description?: string | null;
          product_links?: string[];
          budget_range?: string | null;
          quantity?: string | null;
          quality_level?: string | null;
          import_experience?: string | null;
          special_notes?: string | null;
          input_methods?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      import_project_addons: {
        Row: {
          id: string;
          project_id: string;
          addon_id: string;
          status: string;
          price_snapshot_pkr: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_id: string;
          addon_id: string;
          status?: string;
          price_snapshot_pkr?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_id?: string;
          addon_id?: string;
          status?: string;
          price_snapshot_pkr?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      import_project_status_history: {
        Row: {
          id: string;
          project_id: string;
          from_status: Database["public"]["Enums"]["project_status"] | null;
          to_status: Database["public"]["Enums"]["project_status"];
          reason: string | null;
          changed_by: string | null;
          changed_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_id: string;
          from_status?: Database["public"]["Enums"]["project_status"] | null;
          to_status: Database["public"]["Enums"]["project_status"];
          reason?: string | null;
          changed_by?: string | null;
          changed_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_id?: string;
          from_status?: Database["public"]["Enums"]["project_status"] | null;
          to_status?: Database["public"]["Enums"]["project_status"];
          reason?: string | null;
          changed_by?: string | null;
          changed_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      import_project_timeline_events: {
        Row: {
          id: string;
          project_id: string;
          event_type: string;
          title: string;
          body: string | null;
          visible_to_importer: boolean;
          visible_to_fms: boolean;
          visible_to_agent: boolean;
          created_at: string;
          created_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_id: string;
          event_type: string;
          title: string;
          body?: string | null;
          visible_to_importer?: boolean;
          visible_to_fms?: boolean;
          visible_to_agent?: boolean;
          created_at?: string;
          created_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_id?: string;
          event_type?: string;
          title?: string;
          body?: string | null;
          visible_to_importer?: boolean;
          visible_to_fms?: boolean;
          visible_to_agent?: boolean;
          created_at?: string;
          created_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      import_project_internal_notes: {
        Row: {
          id: string;
          project_id: string;
          author_admin_profile_id: string | null;
          note_body: string;
          note_type: string;
          pinned: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_id: string;
          author_admin_profile_id?: string | null;
          note_body: string;
          note_type?: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_id?: string;
          author_admin_profile_id?: string | null;
          note_body?: string;
          note_type?: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_code: string;
          document_id: string;
          project_id: string;
          customer_user_id: string;
          status: Database["public"]["Enums"]["invoice_status"];
          issued_at: string | null;
          due_at: string | null;
          paid_at: string | null;
          subtotal_pkr: number;
          discount_pkr: number;
          tax_pkr: number;
          total_pkr: number;
          payment_method: string | null;
          transaction_reference: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          invoice_code: string;
          document_id: string;
          project_id: string;
          customer_user_id: string;
          status?: Database["public"]["Enums"]["invoice_status"];
          issued_at?: string | null;
          due_at?: string | null;
          paid_at?: string | null;
          subtotal_pkr?: number;
          discount_pkr?: number;
          tax_pkr?: number;
          total_pkr?: number;
          payment_method?: string | null;
          transaction_reference?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          invoice_code?: string;
          document_id?: string;
          project_id?: string;
          customer_user_id?: string;
          status?: Database["public"]["Enums"]["invoice_status"];
          issued_at?: string | null;
          due_at?: string | null;
          paid_at?: string | null;
          subtotal_pkr?: number;
          discount_pkr?: number;
          tax_pkr?: number;
          total_pkr?: number;
          payment_method?: string | null;
          transaction_reference?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          package_id: string | null;
          addon_id: string | null;
          item_type: string;
          description: string;
          quantity: number;
          unit_price_pkr: number;
          total_pkr: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          package_id?: string | null;
          addon_id?: string | null;
          item_type: string;
          description: string;
          quantity?: number;
          unit_price_pkr?: number;
          total_pkr?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          package_id?: string | null;
          addon_id?: string | null;
          item_type?: string;
          description?: string;
          quantity?: number;
          unit_price_pkr?: number;
          total_pkr?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          project_id: string;
          invoice_id: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          amount_pkr: number;
          method: string | null;
          provider: string | null;
          provider_reference: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_id: string;
          invoice_id?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          amount_pkr?: number;
          method?: string | null;
          provider?: string | null;
          provider_reference?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_id?: string;
          invoice_id?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          amount_pkr?: number;
          method?: string | null;
          provider?: string | null;
          provider_reference?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      payment_attempts: {
        Row: {
          id: string;
          payment_id: string;
          attempt_status: Database["public"]["Enums"]["payment_status"];
          provider_response_code: string | null;
          failure_reason: string | null;
          attempted_at: string;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          payment_id: string;
          attempt_status?: Database["public"]["Enums"]["payment_status"];
          provider_response_code?: string | null;
          failure_reason?: string | null;
          attempted_at?: string;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          payment_id?: string;
          attempt_status?: Database["public"]["Enums"]["payment_status"];
          provider_response_code?: string | null;
          failure_reason?: string | null;
          attempted_at?: string;
          created_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      manual_payment_requests: {
        Row: {
          id: string;
          project_id: string | null;
          lead_id: string | null;
          requester_name: string | null;
          phone_whatsapp: string | null;
          city: string | null;
          preferred_method: string | null;
          problem_description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          lead_id?: string | null;
          requester_name?: string | null;
          phone_whatsapp?: string | null;
          city?: string | null;
          preferred_method?: string | null;
          problem_description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          lead_id?: string | null;
          requester_name?: string | null;
          phone_whatsapp?: string | null;
          city?: string | null;
          preferred_method?: string | null;
          problem_description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      refunds: {
        Row: {
          id: string;
          refund_code: string;
          project_id: string;
          invoice_id: string | null;
          requested_by: string | null;
          refund_status: Database["public"]["Enums"]["refund_status"];
          reason: string;
          requested_amount_pkr: number | null;
          approved_amount_pkr: number | null;
          fms_assigned_at_request: boolean;
          milestone_review_required: boolean;
          reassignment_offered: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          refund_code: string;
          project_id: string;
          invoice_id?: string | null;
          requested_by?: string | null;
          refund_status?: Database["public"]["Enums"]["refund_status"];
          reason: string;
          requested_amount_pkr?: number | null;
          approved_amount_pkr?: number | null;
          fms_assigned_at_request?: boolean;
          milestone_review_required?: boolean;
          reassignment_offered?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          refund_code?: string;
          project_id?: string;
          invoice_id?: string | null;
          requested_by?: string | null;
          refund_status?: Database["public"]["Enums"]["refund_status"];
          reason?: string;
          requested_amount_pkr?: number | null;
          approved_amount_pkr?: number | null;
          fms_assigned_at_request?: boolean;
          milestone_review_required?: boolean;
          reassignment_offered?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      refund_decisions: {
        Row: {
          id: string;
          refund_id: string;
          decision: string;
          decision_by_admin_profile_id: string | null;
          milestone_review_summary: string | null;
          reassignment_offered: boolean;
          decided_at: string;
          customer_visible_summary: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          refund_id: string;
          decision: string;
          decision_by_admin_profile_id?: string | null;
          milestone_review_summary?: string | null;
          reassignment_offered?: boolean;
          decided_at?: string;
          customer_visible_summary?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          refund_id?: string;
          decision?: string;
          decision_by_admin_profile_id?: string | null;
          milestone_review_summary?: string | null;
          reassignment_offered?: boolean;
          decided_at?: string;
          customer_visible_summary?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      refund_evidence: {
        Row: {
          id: string;
          refund_id: string;
          file_asset_id: string | null;
          evidence_type: string;
          visibility: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          refund_id: string;
          file_asset_id?: string | null;
          evidence_type: string;
          visibility?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          refund_id?: string;
          file_asset_id?: string | null;
          evidence_type?: string;
          visibility?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      report_feedback: {
        Row: {
          id: string;
          feedback_code: string;
          project_id: string;
          importer_profile_id: string;
          importer_user_id: string;
          report_status_snapshot: string;
          report_version: number;
          feedback_type:
            | "question_about_option"
            | "request_better_price"
            | "request_more_factories"
            | "request_sample_guidance"
            | "request_shipping_guidance"
            | "not_satisfied"
            | "ready_for_next_step"
            | "other";
          selected_option_label: string | null;
          urgency_level: "low" | "normal" | "urgent";
          message: string;
          status:
            | "new"
            | "in_review"
            | "answered"
            | "routed_to_fms"
            | "closed"
            | "rejected_or_not_applicable";
          admin_response: string | null;
          admin_responded_at: string | null;
          admin_responded_by: string | null;
          internal_notes: string | null;
          routed_to_assignment_id: string | null;
          fms_clarification_request: string | null;
          fms_clarification_status:
            | "not_requested"
            | "requested"
            | "answered"
            | "closed";
          contact_firewall_flags: string[];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          feedback_code: string;
          project_id: string;
          importer_profile_id: string;
          importer_user_id: string;
          report_status_snapshot: string;
          report_version?: number;
          feedback_type:
            | "question_about_option"
            | "request_better_price"
            | "request_more_factories"
            | "request_sample_guidance"
            | "request_shipping_guidance"
            | "not_satisfied"
            | "ready_for_next_step"
            | "other";
          selected_option_label?: string | null;
          urgency_level?: "low" | "normal" | "urgent";
          message: string;
          status?:
            | "new"
            | "in_review"
            | "answered"
            | "routed_to_fms"
            | "closed"
            | "rejected_or_not_applicable";
          admin_response?: string | null;
          admin_responded_at?: string | null;
          admin_responded_by?: string | null;
          internal_notes?: string | null;
          routed_to_assignment_id?: string | null;
          fms_clarification_request?: string | null;
          fms_clarification_status?:
            | "not_requested"
            | "requested"
            | "answered"
            | "closed";
          contact_firewall_flags?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          feedback_code?: string;
          project_id?: string;
          importer_profile_id?: string;
          importer_user_id?: string;
          report_status_snapshot?: string;
          report_version?: number;
          feedback_type?:
            | "question_about_option"
            | "request_better_price"
            | "request_more_factories"
            | "request_sample_guidance"
            | "request_shipping_guidance"
            | "not_satisfied"
            | "ready_for_next_step"
            | "other";
          selected_option_label?: string | null;
          urgency_level?: "low" | "normal" | "urgent";
          message?: string;
          status?:
            | "new"
            | "in_review"
            | "answered"
            | "routed_to_fms"
            | "closed"
            | "rejected_or_not_applicable";
          admin_response?: string | null;
          admin_responded_at?: string | null;
          admin_responded_by?: string | null;
          internal_notes?: string | null;
          routed_to_assignment_id?: string | null;
          fms_clarification_request?: string | null;
          fms_clarification_status?:
            | "not_requested"
            | "requested"
            | "answered"
            | "closed";
          contact_firewall_flags?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      report_feedback_responses: {
        Row: {
          id: string;
          feedback_id: string;
          response_type:
            | "admin_response"
            | "internal_note"
            | "fms_clarification_request"
            | "status_change"
            | "system_note";
          responder_role: "admin" | "super_admin" | "importer" | "fms" | "system";
          responder_user_id: string | null;
          message: string;
          visible_to_importer: boolean;
          visible_to_fms: boolean;
          created_at: string;
          created_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          feedback_id: string;
          response_type?:
            | "admin_response"
            | "internal_note"
            | "fms_clarification_request"
            | "status_change"
            | "system_note";
          responder_role: "admin" | "super_admin" | "importer" | "fms" | "system";
          responder_user_id?: string | null;
          message: string;
          visible_to_importer?: boolean;
          visible_to_fms?: boolean;
          created_at?: string;
          created_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          feedback_id?: string;
          response_type?:
            | "admin_response"
            | "internal_note"
            | "fms_clarification_request"
            | "status_change"
            | "system_note";
          responder_role?: "admin" | "super_admin" | "importer" | "fms" | "system";
          responder_user_id?: string | null;
          message?: string;
          visible_to_importer?: boolean;
          visible_to_fms?: boolean;
          created_at?: string;
          created_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          actor_role: Database["public"]["Enums"]["user_role"] | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before_data: Json | null;
          after_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          actor_role?: Database["public"]["Enums"]["user_role"] | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          actor_role?: Database["public"]["Enums"]["user_role"] | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      security_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          severity: string;
          description: string | null;
          ip_address: string | null;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          severity?: string;
          description?: string | null;
          ip_address?: string | null;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          severity?: string;
          description?: string | null;
          ip_address?: string | null;
          created_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      fms_assignments: {
        Row: {
          id: string;
          assignment_code: string;
          project_id: string;
          fms_profile_id: string;
          assigned_fms_user_id: string;
          assigned_by_admin_profile_id: string | null;
          assignment_status: Database["public"]["Enums"]["assignment_status"];
          tier_snapshot: Database["public"]["Enums"]["fms_tier"];
          deadline_at: string | null;
          submitted_for_admin_review_at: string | null;
          completed_by_admin_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          assignment_code: string;
          project_id: string;
          fms_profile_id: string;
          assigned_fms_user_id: string;
          assigned_by_admin_profile_id?: string | null;
          assignment_status?: Database["public"]["Enums"]["assignment_status"];
          tier_snapshot?: Database["public"]["Enums"]["fms_tier"];
          deadline_at?: string | null;
          submitted_for_admin_review_at?: string | null;
          completed_by_admin_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          assignment_code?: string;
          project_id?: string;
          fms_profile_id?: string;
          assigned_fms_user_id?: string;
          assigned_by_admin_profile_id?: string | null;
          assignment_status?: Database["public"]["Enums"]["assignment_status"];
          tier_snapshot?: Database["public"]["Enums"]["fms_tier"];
          deadline_at?: string | null;
          submitted_for_admin_review_at?: string | null;
          completed_by_admin_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      fms_assignment_milestones: {
        Row: {
          id: string;
          assignment_id: string;
          milestone_key: string;
          status: string;
          completed_at: string | null;
          reviewed_by_admin_profile_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          milestone_key: string;
          status?: string;
          completed_at?: string | null;
          reviewed_by_admin_profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          milestone_key?: string;
          status?: string;
          completed_at?: string | null;
          reviewed_by_admin_profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      fms_factory_submissions: {
        Row: {
          id: string;
          submission_code: string;
          assignment_id: string;
          converted_factory_id: string | null;
          factory_display_name: string | null;
          city_province: string | null;
          product_category: string | null;
          main_products: string[];
          moq: string | null;
          price_range: string | null;
          production_time: string | null;
          submission_status: Database["public"]["Enums"]["assignment_submission_status"];
          admin_review_status: Database["public"]["Enums"]["admin_review_status"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          submission_code: string;
          assignment_id: string;
          converted_factory_id?: string | null;
          factory_display_name?: string | null;
          city_province?: string | null;
          product_category?: string | null;
          main_products?: string[];
          moq?: string | null;
          price_range?: string | null;
          production_time?: string | null;
          submission_status?: Database["public"]["Enums"]["assignment_submission_status"];
          admin_review_status?: Database["public"]["Enums"]["admin_review_status"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          submission_code?: string;
          assignment_id?: string;
          converted_factory_id?: string | null;
          factory_display_name?: string | null;
          city_province?: string | null;
          product_category?: string | null;
          main_products?: string[];
          moq?: string | null;
          price_range?: string | null;
          production_time?: string | null;
          submission_status?: Database["public"]["Enums"]["assignment_submission_status"];
          admin_review_status?: Database["public"]["Enums"]["admin_review_status"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      fms_submission_evidence: {
        Row: {
          id: string;
          submission_id: string;
          file_asset_id: string | null;
          evidence_type: string | null;
          review_status: Database["public"]["Enums"]["file_review_status_enum"];
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          submission_id: string;
          file_asset_id?: string | null;
          evidence_type?: string | null;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          submission_id?: string;
          file_asset_id?: string | null;
          evidence_type?: string | null;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      factories: {
        Row: {
          id: string;
          factory_code: string;
          display_name: string;
          chinese_legal_name: string | null;
          category: string | null;
          city_province: string | null;
          status: Database["public"]["Enums"]["factory_status"];
          verification_status: Database["public"]["Enums"]["verification_status"];
          trust_score: number | null;
          submitted_by_fms_profile_id: string | null;
          source_assignment_id: string | null;
          last_verified_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          factory_code: string;
          display_name: string;
          chinese_legal_name?: string | null;
          category?: string | null;
          city_province?: string | null;
          status?: Database["public"]["Enums"]["factory_status"];
          verification_status?: Database["public"]["Enums"]["verification_status"];
          trust_score?: number | null;
          submitted_by_fms_profile_id?: string | null;
          source_assignment_id?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          factory_code?: string;
          display_name?: string;
          chinese_legal_name?: string | null;
          category?: string | null;
          city_province?: string | null;
          status?: Database["public"]["Enums"]["factory_status"];
          verification_status?: Database["public"]["Enums"]["verification_status"];
          trust_score?: number | null;
          submitted_by_fms_profile_id?: string | null;
          source_assignment_id?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      factory_sensitive_contacts: {
        Row: {
          id: string;
          factory_id: string;
          contact_person: string | null;
          phone: string | null;
          wechat: string | null;
          email: string | null;
          website_url: string | null;
          alibaba_url: string | null;
          exact_address: string | null;
          bank_payment_notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          factory_id: string;
          contact_person?: string | null;
          phone?: string | null;
          wechat?: string | null;
          email?: string | null;
          website_url?: string | null;
          alibaba_url?: string | null;
          exact_address?: string | null;
          bank_payment_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          factory_id?: string;
          contact_person?: string | null;
          phone?: string | null;
          wechat?: string | null;
          email?: string | null;
          website_url?: string | null;
          alibaba_url?: string | null;
          exact_address?: string | null;
          bank_payment_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      factory_products: {
        Row: {
          id: string;
          factory_id: string;
          product_name: string | null;
          category: string | null;
          main_products: string[];
          moq_range: string | null;
          price_range_notes: string | null;
          production_time_notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          factory_id: string;
          product_name?: string | null;
          category?: string | null;
          main_products?: string[];
          moq_range?: string | null;
          price_range_notes?: string | null;
          production_time_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          factory_id?: string;
          product_name?: string | null;
          category?: string | null;
          main_products?: string[];
          moq_range?: string | null;
          price_range_notes?: string | null;
          production_time_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      factory_evidence: {
        Row: {
          id: string;
          factory_id: string;
          file_asset_id: string | null;
          evidence_type: string | null;
          review_status: Database["public"]["Enums"]["file_review_status_enum"];
          visibility_scope: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          factory_id: string;
          file_asset_id?: string | null;
          evidence_type?: string | null;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          visibility_scope?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          factory_id?: string;
          file_asset_id?: string | null;
          evidence_type?: string | null;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          visibility_scope?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      file_assets: {
        Row: {
          id: string;
          bucket: Database["public"]["Enums"]["file_bucket"];
          storage_path: string;
          original_filename: string;
          mime_type: string | null;
          size_bytes: number;
          uploaded_by: string | null;
          source_role: Database["public"]["Enums"]["user_role"] | null;
          project_id: string | null;
          assignment_id: string | null;
          factory_id: string | null;
          message_id: string | null;
          checksum: string | null;
          review_status: Database["public"]["Enums"]["file_review_status_enum"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          bucket: Database["public"]["Enums"]["file_bucket"];
          storage_path: string;
          original_filename: string;
          mime_type?: string | null;
          size_bytes?: number;
          uploaded_by?: string | null;
          source_role?: Database["public"]["Enums"]["user_role"] | null;
          project_id?: string | null;
          assignment_id?: string | null;
          factory_id?: string | null;
          message_id?: string | null;
          checksum?: string | null;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          bucket?: Database["public"]["Enums"]["file_bucket"];
          storage_path?: string;
          original_filename?: string;
          mime_type?: string | null;
          size_bytes?: number;
          uploaded_by?: string | null;
          source_role?: Database["public"]["Enums"]["user_role"] | null;
          project_id?: string | null;
          assignment_id?: string | null;
          factory_id?: string | null;
          message_id?: string | null;
          checksum?: string | null;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      file_access_grants: {
        Row: {
          id: string;
          file_asset_id: string;
          granted_to_role: Database["public"]["Enums"]["user_role"] | null;
          granted_to_user_id: string | null;
          project_id: string | null;
          scope: string;
          expires_at: string | null;
          granted_by_admin_profile_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          file_asset_id: string;
          granted_to_role?: Database["public"]["Enums"]["user_role"] | null;
          granted_to_user_id?: string | null;
          project_id?: string | null;
          scope?: string;
          expires_at?: string | null;
          granted_by_admin_profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          file_asset_id?: string;
          granted_to_role?: Database["public"]["Enums"]["user_role"] | null;
          granted_to_user_id?: string | null;
          project_id?: string | null;
          scope?: string;
          expires_at?: string | null;
          granted_by_admin_profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      file_review_status: {
        Row: {
          id: string;
          file_asset_id: string;
          review_status: Database["public"]["Enums"]["file_review_status_enum"];
          reviewed_by_admin_profile_id: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          file_asset_id: string;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          reviewed_by_admin_profile_id?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          file_asset_id?: string;
          review_status?: Database["public"]["Enums"]["file_review_status_enum"];
          reviewed_by_admin_profile_id?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      file_redaction_history: {
        Row: {
          id: string;
          file_asset_id: string;
          redacted_file_asset_id: string | null;
          redaction_reason: string;
          redacted_by_admin_profile_id: string | null;
          created_at: string;
          created_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          file_asset_id: string;
          redacted_file_asset_id?: string | null;
          redaction_reason: string;
          redacted_by_admin_profile_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          file_asset_id?: string;
          redacted_file_asset_id?: string | null;
          redaction_reason?: string;
          redacted_by_admin_profile_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      unpaid_leads: {
        Row: {
          id: string;
          lead_code: string;
          importer_profile_id: string | null;
          importer_user_id: string | null;
          draft_project_id: string | null;
          package_id: string | null;
          product_summary: string;
          payment_problem_reason: string | null;
          lead_status: Database["public"]["Enums"]["lead_status"];
          follow_up_status: string | null;
          follow_up_due_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          lead_code: string;
          importer_profile_id?: string | null;
          importer_user_id?: string | null;
          draft_project_id?: string | null;
          package_id?: string | null;
          product_summary: string;
          payment_problem_reason?: string | null;
          lead_status?: Database["public"]["Enums"]["lead_status"];
          follow_up_status?: string | null;
          follow_up_due_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          lead_code?: string;
          importer_profile_id?: string | null;
          importer_user_id?: string | null;
          draft_project_id?: string | null;
          package_id?: string | null;
          product_summary?: string;
          payment_problem_reason?: string | null;
          lead_status?: Database["public"]["Enums"]["lead_status"];
          follow_up_status?: string | null;
          follow_up_due_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      lead_followups: {
        Row: {
          id: string;
          lead_id: string;
          actor_user_id: string | null;
          channel: string | null;
          outcome: string | null;
          notes: string | null;
          next_follow_up_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          lead_id: string;
          actor_user_id?: string | null;
          channel?: string | null;
          outcome?: string | null;
          notes?: string | null;
          next_follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          lead_id?: string;
          actor_user_id?: string | null;
          channel?: string | null;
          outcome?: string | null;
          notes?: string | null;
          next_follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_profile_id: string | null;
          recipient_role: Database["public"]["Enums"]["user_role"] | null;
          actor_profile_id: string | null;
          project_id: string | null;
          invoice_id: string | null;
          payment_id: string | null;
          refund_id: string | null;
          assignment_id: string | null;
          submission_id: string | null;
          type: string;
          title: string;
          message: string;
          channel: "in_app" | "email" | "system";
          status: "queued" | "delivered" | "read" | "failed" | "skipped";
          priority: "low" | "normal" | "high" | "urgent";
          action_url: string | null;
          metadata: Json;
          created_at: string;
          read_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          recipient_profile_id?: string | null;
          recipient_role?: Database["public"]["Enums"]["user_role"] | null;
          actor_profile_id?: string | null;
          project_id?: string | null;
          invoice_id?: string | null;
          payment_id?: string | null;
          refund_id?: string | null;
          assignment_id?: string | null;
          submission_id?: string | null;
          type: string;
          title: string;
          message: string;
          channel?: "in_app" | "email" | "system";
          status?: "queued" | "delivered" | "read" | "failed" | "skipped";
          priority?: "low" | "normal" | "high" | "urgent";
          action_url?: string | null;
          metadata?: Json;
          created_at?: string;
          read_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          recipient_profile_id?: string | null;
          recipient_role?: Database["public"]["Enums"]["user_role"] | null;
          actor_profile_id?: string | null;
          project_id?: string | null;
          invoice_id?: string | null;
          payment_id?: string | null;
          refund_id?: string | null;
          assignment_id?: string | null;
          submission_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          channel?: "in_app" | "email" | "system";
          status?: "queued" | "delivered" | "read" | "failed" | "skipped";
          priority?: "low" | "normal" | "high" | "urgent";
          action_url?: string | null;
          metadata?: Json;
          created_at?: string;
          read_at?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
      };
      notification_delivery_logs: {
        Row: {
          id: string;
          notification_id: string;
          provider: string;
          provider_message_id: string | null;
          delivery_status: string;
          error_message: string | null;
          attempted_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          notification_id: string;
          provider: string;
          provider_message_id?: string | null;
          delivery_status?: string;
          error_message?: string | null;
          attempted_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          notification_id?: string;
          provider?: string;
          provider_message_id?: string | null;
          delivery_status?: string;
          error_message?: string | null;
          attempted_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_profile_id: string;
          in_app_enabled: boolean;
          email_enabled: boolean;
          preferred_language: string;
          role_defaults: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_profile_id: string;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          preferred_language?: string;
          role_defaults?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_profile_id?: string;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          preferred_language?: string;
          role_defaults?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
    };
    Views: {
      admin_user_directory: {
        Row: {
          auth_user_id: string;
          user_profile_id: string;
          email: string | null;
          display_name: string | null;
          primary_role: Database["public"]["Enums"]["user_role"] | null;
          profile_status: Database["public"]["Enums"]["profile_status"];
          active_roles: string[];
          role_statuses: Json;
          role_status_entries: Json;
          created_at: string;
          updated_at: string;
          importer_profile_id: string | null;
          importer_business_name: string | null;
          importer_business_type: string | null;
          importer_city: string | null;
          fms_profile_id: string | null;
          fms_code: string | null;
          fms_tier: Database["public"]["Enums"]["fms_tier"] | null;
          fms_status: Database["public"]["Enums"]["profile_status"] | null;
          fms_city_province: string | null;
          fms_categories: string[] | null;
          fms_academy_status: Database["public"]["Enums"]["training_status"] | null;
          fms_quality_score: number | null;
          agent_profile_id: string | null;
          agent_code: string | null;
          agent_status: Database["public"]["Enums"]["profile_status"] | null;
          agent_city_market: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role:
        | "importer"
        | "fms"
        | "agent"
        | "admin"
        | "project_manager"
        | "super_admin"
        | "factory_future";
      profile_status:
        | "pending"
        | "active"
        | "suspended"
        | "revoked"
        | "hidden_future";
      representative_code_status: "active" | "suspended" | "revoked";
      representative_status: "active" | "pending" | "suspended" | "archived";
      representative_verification_result:
        | "verified"
        | "invalid"
        | "suspended"
        | "revoked";
      fms_tier: "bronze" | "silver" | "gold";
      training_status: "not_started" | "in_progress" | "certified" | "suspended";
      project_status:
        | "draft"
        | "awaiting_payment"
        | "payment_received"
        | "admin_review"
        | "needs_importer_clarification"
        | "ready_for_fms_assignment"
        | "fms_assigned"
        | "fms_working"
        | "factory_options_submitted"
        | "admin_quality_review"
        | "results_released_to_importer"
        | "importer_feedback_requested"
        | "completed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
        | "disputed";
      admin_review_status:
        | "not_started"
        | "in_review"
        | "needs_information"
        | "ready_for_fms_assignment"
        | "rejected";
      payment_status:
        | "awaiting_payment"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded";
      invoice_status:
        | "draft"
        | "issued"
        | "pending"
        | "awaiting_payment"
        | "paid"
        | "refunded"
        | "partially_refunded"
        | "cancelled";
      refund_status:
        | "requested"
        | "under_admin_review"
        | "reassignment_offered"
        | "approved"
        | "partially_approved"
        | "rejected"
        | "paid"
        | "processed"
        | "cancelled";
      assignment_status:
        | "assigned"
        | "requirements_reviewed"
        | "factory_researching"
        | "factory_options_drafted"
        | "submitted_for_admin_review"
        | "changes_requested"
        | "approved_by_admin"
        | "completed_by_admin"
        | "reassigned"
        | "cancelled";
      assignment_submission_status:
        | "draft"
        | "submitted_for_admin_review"
        | "changes_requested"
        | "approved_by_admin"
        | "rejected";
      factory_status:
        | "draft"
        | "submitted_by_fms"
        | "admin_verified"
        | "active_internal_record"
        | "invited_to_claim_profile"
        | "claimed_by_factory"
        | "suspended"
        | "blacklisted";
      verification_status:
        | "unverified"
        | "basic_checked"
        | "evidence_reviewed"
        | "video_verified"
        | "document_verified"
        | "trusted_factory";
      lead_status:
        | "new_lead"
        | "contact_attempted"
        | "interested"
        | "payment_help_needed"
        | "awaiting_customer"
        | "payment_link_sent"
        | "payment_completed"
        | "not_interested"
        | "closed";
      package_status: "draft" | "active" | "retired";
      addon_price_type: "fixed" | "range" | "percentage";
      message_thread_status:
        | "open"
        | "pending_admin_review"
        | "waiting_for_importer"
        | "waiting_for_fms"
        | "translation_needed"
        | "approved_for_forwarding"
        | "closed";
      message_risk_flag:
        | "none"
        | "contact_info_detected"
        | "payment_instruction_detected"
        | "factory_contact_detected"
        | "unapproved_direct_contact_attempt"
        | "sensitive_document_shared";
      file_review_status:
        | "pending_review"
        | "approved_internal"
        | "approved_importer_visible"
        | "approved_fms_visible"
        | "approved_factory_visible_future"
        | "needs_redaction"
        | "redacted"
        | "rejected"
        | "archived";
      file_bucket:
        | "importer-uploads"
        | "fms-evidence"
        | "factory-evidence"
        | "message-attachments"
        | "invoice-documents"
        | "refund-evidence"
        | "training-assets"
        | "public-content"
        | "importer-project-files"
        | "fms-evidence-files"
        | "admin-private-files"
        | "importer-released-report-files";
      file_review_status_enum:
        | "pending_review"
        | "approved_internal"
        | "approved_importer_visible"
        | "approved_fms_visible"
        | "approved_factory_visible_future"
        | "needs_redaction"
        | "redacted"
        | "rejected"
        | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type SupabaseTableName = keyof Database["public"]["Tables"];
