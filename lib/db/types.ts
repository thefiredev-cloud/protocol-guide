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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alternate_routing_rules: {
        Row: {
          alternate_facility_id: string
          created_at: string
          distance_miles: number | null
          diversion_type: Database["public"]["Enums"]["diversion_type"]
          id: string
          is_active: boolean
          notes: string | null
          primary_facility_id: string
          priority: number
          transport_minutes: number | null
        }
        Insert: {
          alternate_facility_id: string
          created_at?: string
          distance_miles?: number | null
          diversion_type: Database["public"]["Enums"]["diversion_type"]
          id?: string
          is_active?: boolean
          notes?: string | null
          primary_facility_id: string
          priority?: number
          transport_minutes?: number | null
        }
        Update: {
          alternate_facility_id?: string
          created_at?: string
          distance_miles?: number | null
          diversion_type?: Database["public"]["Enums"]["diversion_type"]
          id?: string
          is_active?: boolean
          notes?: string | null
          primary_facility_id?: string
          priority?: number
          transport_minutes?: number | null
        }
        Relationships: []
      }
      apot_records: {
        Row: {
          arrival_time: string
          created_at: string
          delay_reason: string | null
          exceeded_threshold: boolean | null
          facility_id: string
          facility_name: string
          id: string
          offload_minutes: number | null
          offload_time: string | null
          patient_acuity: string | null
          shift_date: string
          threshold_minutes: number | null
          unit_id: string | null
        }
        Insert: {
          arrival_time: string
          created_at?: string
          delay_reason?: string | null
          exceeded_threshold?: boolean | null
          facility_id: string
          facility_name: string
          id?: string
          offload_minutes?: number | null
          offload_time?: string | null
          patient_acuity?: string | null
          shift_date?: string
          threshold_minutes?: number | null
          unit_id?: string | null
        }
        Update: {
          arrival_time?: string
          created_at?: string
          delay_reason?: string | null
          exceeded_threshold?: boolean | null
          facility_id?: string
          facility_name?: string
          id?: string
          offload_minutes?: number | null
          offload_time?: string | null
          patient_acuity?: string | null
          shift_date?: string
          threshold_minutes?: number | null
          unit_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_id: string
          ip_address: unknown
          metadata: Json | null
          outcome: Database["public"]["Enums"]["audit_outcome"]
          resource: string
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string
          ip_address?: unknown
          metadata?: Json | null
          outcome: Database["public"]["Enums"]["audit_outcome"]
          resource: string
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string
          ip_address?: unknown
          metadata?: Json | null
          outcome?: Database["public"]["Enums"]["audit_outcome"]
          resource?: string
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          citations: Json | null
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          is_sanitized: boolean
          protocols_referenced: string[] | null
          response_time_ms: number | null
          role: string
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          citations?: Json | null
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_sanitized?: boolean
          protocols_referenced?: string[] | null
          response_time_ms?: number | null
          role: string
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          citations?: Json | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_sanitized?: boolean
          protocols_referenced?: string[] | null
          response_time_ms?: number | null
          role?: string
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          deleted_at: string | null
          device_fingerprint: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          provider_level: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          device_fingerprint?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          provider_level?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          device_fingerprint?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          provider_level?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_diversion_status: {
        Row: {
          created_at: string
          diversion_type: Database["public"]["Enums"]["diversion_type"]
          ended_at: string | null
          expected_end_at: string | null
          facility_id: string
          facility_name: string
          id: string
          is_active: boolean
          reason: string | null
          region: string
          reported_by: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          diversion_type?: Database["public"]["Enums"]["diversion_type"]
          ended_at?: string | null
          expected_end_at?: string | null
          facility_id: string
          facility_name: string
          id?: string
          is_active?: boolean
          reason?: string | null
          region: string
          reported_by?: string | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          diversion_type?: Database["public"]["Enums"]["diversion_type"]
          ended_at?: string | null
          expected_end_at?: string | null
          facility_id?: string
          facility_name?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          region?: string
          reported_by?: string | null
          started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      facility_status: {
        Row: {
          available_beds: number | null
          avg_apot_24h: number | null
          current_diversion_type:
            | Database["public"]["Enums"]["diversion_type"]
            | null
          ed_wait_minutes: number | null
          facility_id: string
          facility_name: string
          icu_beds_available: number | null
          is_operational: boolean
          last_apot_minutes: number | null
          last_updated: string
          region: string
          sync_source: string | null
          trauma_beds_available: number | null
        }
        Insert: {
          available_beds?: number | null
          avg_apot_24h?: number | null
          current_diversion_type?:
            | Database["public"]["Enums"]["diversion_type"]
            | null
          ed_wait_minutes?: number | null
          facility_id: string
          facility_name: string
          icu_beds_available?: number | null
          is_operational?: boolean
          last_apot_minutes?: number | null
          last_updated?: string
          region: string
          sync_source?: string | null
          trauma_beds_available?: number | null
        }
        Update: {
          available_beds?: number | null
          avg_apot_24h?: number | null
          current_diversion_type?:
            | Database["public"]["Enums"]["diversion_type"]
            | null
          ed_wait_minutes?: number | null
          facility_id?: string
          facility_name?: string
          icu_beds_available?: number | null
          is_operational?: boolean
          last_apot_minutes?: number | null
          last_updated?: string
          region?: string
          sync_source?: string | null
          trauma_beds_available?: number | null
        }
        Relationships: []
      }
      facility_sync_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          records_added: number | null
          records_removed: number | null
          records_synced: number | null
          records_updated: number | null
          source_date: string | null
          source_ref: string | null
          started_at: string
          status: string | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_removed?: number | null
          records_synced?: number | null
          records_updated?: number | null
          source_date?: string | null
          source_ref?: string | null
          started_at?: string
          status?: string | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_removed?: number | null
          records_synced?: number | null
          records_updated?: number | null
          source_date?: string | null
          source_ref?: string | null
          started_at?: string
          status?: string | null
          sync_type?: string
        }
        Relationships: []
      }
      mcg_entries: {
        Row: {
          adult_dose: Json | null
          adverse_effects: string[] | null
          calculation_formula: string | null
          concentration: string | null
          contraindications: string[] | null
          created_at: string
          drug_interactions: string[] | null
          effective_date: string
          generic_name: string | null
          id: string
          is_current: boolean
          max_dose: string | null
          mcg_number: string
          medication_class: string | null
          medication_name: string
          neonatal_dose: Json | null
          pediatric_dose: Json | null
          precautions: string[] | null
          ref_id: string | null
          routes: string[] | null
          special_considerations: string | null
          updated_at: string
          version: number
        }
        Insert: {
          adult_dose?: Json | null
          adverse_effects?: string[] | null
          calculation_formula?: string | null
          concentration?: string | null
          contraindications?: string[] | null
          created_at?: string
          drug_interactions?: string[] | null
          effective_date: string
          generic_name?: string | null
          id?: string
          is_current?: boolean
          max_dose?: string | null
          mcg_number: string
          medication_class?: string | null
          medication_name: string
          neonatal_dose?: Json | null
          pediatric_dose?: Json | null
          precautions?: string[] | null
          ref_id?: string | null
          routes?: string[] | null
          special_considerations?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          adult_dose?: Json | null
          adverse_effects?: string[] | null
          calculation_formula?: string | null
          concentration?: string | null
          contraindications?: string[] | null
          created_at?: string
          drug_interactions?: string[] | null
          effective_date?: string
          generic_name?: string | null
          id?: string
          is_current?: boolean
          max_dose?: string | null
          mcg_number?: string
          medication_class?: string | null
          medication_name?: string
          neonatal_dose?: Json | null
          pediatric_dose?: Json | null
          precautions?: string[] | null
          ref_id?: string | null
          routes?: string[] | null
          special_considerations?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "mcg_entries_ref_id_fkey"
            columns: ["ref_id"]
            isOneToOne: false
            referencedRelation: "current_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcg_entries_ref_id_fkey"
            columns: ["ref_id"]
            isOneToOne: false
            referencedRelation: "reference_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      mci_bed_availability: {
        Row: {
          available_beds: number | null
          burn_available: number | null
          burn_total: number | null
          can_accept_delayed: boolean | null
          can_accept_immediate: boolean | null
          diversion_status: string | null
          facility_id: string
          facility_name: string
          icu_available: number | null
          icu_total: number | null
          id: string
          mci_event_id: string | null
          notes: string | null
          peds_available: number | null
          peds_total: number | null
          region: string
          reported_at: string
          reporter_name: string | null
          total_beds: number | null
          trauma_available: number | null
          trauma_total: number | null
        }
        Insert: {
          available_beds?: number | null
          burn_available?: number | null
          burn_total?: number | null
          can_accept_delayed?: boolean | null
          can_accept_immediate?: boolean | null
          diversion_status?: string | null
          facility_id: string
          facility_name: string
          icu_available?: number | null
          icu_total?: number | null
          id?: string
          mci_event_id?: string | null
          notes?: string | null
          peds_available?: number | null
          peds_total?: number | null
          region: string
          reported_at?: string
          reporter_name?: string | null
          total_beds?: number | null
          trauma_available?: number | null
          trauma_total?: number | null
        }
        Update: {
          available_beds?: number | null
          burn_available?: number | null
          burn_total?: number | null
          can_accept_delayed?: boolean | null
          can_accept_immediate?: boolean | null
          diversion_status?: string | null
          facility_id?: string
          facility_name?: string
          icu_available?: number | null
          icu_total?: number | null
          id?: string
          mci_event_id?: string | null
          notes?: string | null
          peds_available?: number | null
          peds_total?: number | null
          region?: string
          reported_at?: string
          reporter_name?: string | null
          total_beds?: number | null
          trauma_available?: number | null
          trauma_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mci_bed_availability_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "active_mci_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mci_bed_availability_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "mci_events"
            referencedColumns: ["id"]
          },
        ]
      }
      mci_events: {
        Row: {
          created_at: string
          deceased_count: number | null
          declared_at: string
          delayed_count: number | null
          id: string
          immediate_count: number | null
          incident_commander: string | null
          incident_number: string | null
          incident_type: string
          is_active: boolean
          location: string
          mci_level: Database["public"]["Enums"]["mci_level"]
          medical_group_supervisor: string | null
          minor_count: number | null
          notes: string | null
          region: string
          resolved_at: string | null
          total_patients: number | null
          transport_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deceased_count?: number | null
          declared_at?: string
          delayed_count?: number | null
          id?: string
          immediate_count?: number | null
          incident_commander?: string | null
          incident_number?: string | null
          incident_type: string
          is_active?: boolean
          location: string
          mci_level: Database["public"]["Enums"]["mci_level"]
          medical_group_supervisor?: string | null
          minor_count?: number | null
          notes?: string | null
          region: string
          resolved_at?: string | null
          total_patients?: number | null
          transport_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deceased_count?: number | null
          declared_at?: string
          delayed_count?: number | null
          id?: string
          immediate_count?: number | null
          incident_commander?: string | null
          incident_number?: string | null
          incident_type?: string
          is_active?: boolean
          location?: string
          mci_level?: Database["public"]["Enums"]["mci_level"]
          medical_group_supervisor?: string | null
          minor_count?: number | null
          notes?: string | null
          region?: string
          resolved_at?: string | null
          total_patients?: number | null
          transport_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      mci_patients: {
        Row: {
          age_group: string | null
          assigned_transport_unit: string | null
          chief_complaint: string | null
          created_at: string
          destination_facility_id: string | null
          destination_facility_name: string | null
          id: string
          initial_category:
            | Database["public"]["Enums"]["triage_category"]
            | null
          injuries: string | null
          mci_event_id: string
          notes: string | null
          transport_priority: number | null
          transported_at: string | null
          triage_category: Database["public"]["Enums"]["triage_category"]
          triage_tag_number: string | null
          triaged_at: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          assigned_transport_unit?: string | null
          chief_complaint?: string | null
          created_at?: string
          destination_facility_id?: string | null
          destination_facility_name?: string | null
          id?: string
          initial_category?:
            | Database["public"]["Enums"]["triage_category"]
            | null
          injuries?: string | null
          mci_event_id: string
          notes?: string | null
          transport_priority?: number | null
          transported_at?: string | null
          triage_category: Database["public"]["Enums"]["triage_category"]
          triage_tag_number?: string | null
          triaged_at?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          assigned_transport_unit?: string | null
          chief_complaint?: string | null
          created_at?: string
          destination_facility_id?: string | null
          destination_facility_name?: string | null
          id?: string
          initial_category?:
            | Database["public"]["Enums"]["triage_category"]
            | null
          injuries?: string | null
          mci_event_id?: string
          notes?: string | null
          transport_priority?: number | null
          transported_at?: string | null
          triage_category?: Database["public"]["Enums"]["triage_category"]
          triage_tag_number?: string | null
          triaged_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mci_patients_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "active_mci_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mci_patients_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "mci_events"
            referencedColumns: ["id"]
          },
        ]
      }
      mci_resources: {
        Row: {
          arrived_at: string | null
          assigned_at: string
          assignment: string | null
          cleared_at: string | null
          id: string
          mci_event_id: string
          notes: string | null
          resource_type: string
          station: string | null
          transports_completed: number | null
          unit_id: string
        }
        Insert: {
          arrived_at?: string | null
          assigned_at?: string
          assignment?: string | null
          cleared_at?: string | null
          id?: string
          mci_event_id: string
          notes?: string | null
          resource_type: string
          station?: string | null
          transports_completed?: number | null
          unit_id: string
        }
        Update: {
          arrived_at?: string | null
          assigned_at?: string
          assignment?: string | null
          cleared_at?: string | null
          id?: string
          mci_event_id?: string
          notes?: string | null
          resource_type?: string
          station?: string | null
          transports_completed?: number | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mci_resources_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "active_mci_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mci_resources_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "mci_events"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_chunks: {
        Row: {
          content: string
          created_at: string
          id: string
          protocol_id: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id: string
          protocol_id?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          protocol_id?: string | null
          title?: string
        }
        Relationships: []
      }
      protocols: {
        Row: {
          created_at: string
          full_text: string
          id: string
          tp_code: string
          tp_name: string
        }
        Insert: {
          created_at?: string
          full_text: string
          id?: string
          tp_code: string
          tp_name: string
        }
        Update: {
          created_at?: string
          full_text?: string
          id?: string
          tp_code?: string
          tp_name?: string
        }
        Relationships: []
      }
      reference_changes: {
        Row: {
          change_type: string
          clinical_impact: string | null
          created_at: string
          description: string
          from_version: number
          id: string
          ref_id: string
          ref_number: string
          requires_training: boolean | null
          section: string | null
          to_version: number
        }
        Insert: {
          change_type: string
          clinical_impact?: string | null
          created_at?: string
          description: string
          from_version: number
          id?: string
          ref_id: string
          ref_number: string
          requires_training?: boolean | null
          section?: string | null
          to_version: number
        }
        Update: {
          change_type?: string
          clinical_impact?: string | null
          created_at?: string
          description?: string
          from_version?: number
          id?: string
          ref_id?: string
          ref_number?: string
          requires_training?: boolean | null
          section?: string | null
          to_version?: number
        }
        Relationships: [
          {
            foreignKeyName: "reference_changes_ref_id_fkey"
            columns: ["ref_id"]
            isOneToOne: false
            referencedRelation: "current_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reference_changes_ref_id_fkey"
            columns: ["ref_id"]
            isOneToOne: false
            referencedRelation: "reference_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_documents: {
        Row: {
          category: Database["public"]["Enums"]["ref_category"]
          created_at: string
          effective_date: string
          expiration_date: string | null
          full_text: string | null
          id: string
          is_current: boolean
          keywords: string[] | null
          ref_number: string
          related_refs: string[] | null
          revision_date: string | null
          status: Database["public"]["Enums"]["ref_status"]
          summary: string | null
          superseded_by_ref: string | null
          supersedes_ref: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category: Database["public"]["Enums"]["ref_category"]
          created_at?: string
          effective_date: string
          expiration_date?: string | null
          full_text?: string | null
          id?: string
          is_current?: boolean
          keywords?: string[] | null
          ref_number: string
          related_refs?: string[] | null
          revision_date?: string | null
          status?: Database["public"]["Enums"]["ref_status"]
          summary?: string | null
          superseded_by_ref?: string | null
          supersedes_ref?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["ref_category"]
          created_at?: string
          effective_date?: string
          expiration_date?: string | null
          full_text?: string | null
          id?: string
          is_current?: boolean
          keywords?: string[] | null
          ref_number?: string
          related_refs?: string[] | null
          revision_date?: string | null
          status?: Database["public"]["Enums"]["ref_status"]
          summary?: string | null
          superseded_by_ref?: string | null
          supersedes_ref?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          fingerprint: string
          id: string
          ip_address: unknown
          last_activity: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          fingerprint: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          fingerprint?: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_protocols: {
        Row: {
          base_contact_criteria: string | null
          base_contact_required: boolean | null
          category: string | null
          chief_complaints: string[] | null
          contraindications: string[] | null
          created_at: string
          effective_date: string
          id: string
          is_current: boolean
          monitoring: string[] | null
          positioning: string | null
          provider_impressions: string[] | null
          ref_id: string | null
          tp_code: string
          tp_name: string
          transport_destinations: Json | null
          updated_at: string
          version: number
          warnings: string[] | null
        }
        Insert: {
          base_contact_criteria?: string | null
          base_contact_required?: boolean | null
          category?: string | null
          chief_complaints?: string[] | null
          contraindications?: string[] | null
          created_at?: string
          effective_date: string
          id?: string
          is_current?: boolean
          monitoring?: string[] | null
          positioning?: string | null
          provider_impressions?: string[] | null
          ref_id?: string | null
          tp_code: string
          tp_name: string
          transport_destinations?: Json | null
          updated_at?: string
          version?: number
          warnings?: string[] | null
        }
        Update: {
          base_contact_criteria?: string | null
          base_contact_required?: boolean | null
          category?: string | null
          chief_complaints?: string[] | null
          contraindications?: string[] | null
          created_at?: string
          effective_date?: string
          id?: string
          is_current?: boolean
          monitoring?: string[] | null
          positioning?: string | null
          provider_impressions?: string[] | null
          ref_id?: string | null
          tp_code?: string
          tp_name?: string
          transport_destinations?: Json | null
          updated_at?: string
          version?: number
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_protocols_ref_id_fkey"
            columns: ["ref_id"]
            isOneToOne: false
            referencedRelation: "current_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_protocols_ref_id_fkey"
            columns: ["ref_id"]
            isOneToOne: false
            referencedRelation: "reference_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          badge_number: string | null
          created_at: string | null
          deleted_at: string | null
          department: string
          email: string
          full_name: string
          id: string
          last_login: string | null
          role: Database["public"]["Enums"]["user_role"]
          station_id: string | null
          updated_at: string | null
        }
        Insert: {
          badge_number?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string
          email: string
          full_name: string
          id?: string
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          station_id?: string | null
          updated_at?: string | null
        }
        Update: {
          badge_number?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          station_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_diversions: {
        Row: {
          diversion_type: Database["public"]["Enums"]["diversion_type"] | null
          expected_end_at: string | null
          facility_id: string | null
          facility_name: string | null
          minutes_on_diversion: number | null
          reason: string | null
          region: string | null
          started_at: string | null
        }
        Insert: {
          diversion_type?: Database["public"]["Enums"]["diversion_type"] | null
          expected_end_at?: string | null
          facility_id?: string | null
          facility_name?: string | null
          minutes_on_diversion?: never
          reason?: string | null
          region?: string | null
          started_at?: string | null
        }
        Update: {
          diversion_type?: Database["public"]["Enums"]["diversion_type"] | null
          expected_end_at?: string | null
          facility_id?: string | null
          facility_name?: string | null
          minutes_on_diversion?: never
          reason?: string | null
          region?: string | null
          started_at?: string | null
        }
        Relationships: []
      }
      active_mci_summary: {
        Row: {
          deceased_count: number | null
          declared_at: string | null
          delayed_count: number | null
          id: string | null
          immediate_count: number | null
          incident_commander: string | null
          incident_number: string | null
          incident_type: string | null
          location: string | null
          mci_level: Database["public"]["Enums"]["mci_level"] | null
          minor_count: number | null
          minutes_active: number | null
          region: string | null
          total_patients: number | null
          transport_count: number | null
        }
        Insert: {
          deceased_count?: number | null
          declared_at?: string | null
          delayed_count?: number | null
          id?: string | null
          immediate_count?: number | null
          incident_commander?: string | null
          incident_number?: string | null
          incident_type?: string | null
          location?: string | null
          mci_level?: Database["public"]["Enums"]["mci_level"] | null
          minor_count?: number | null
          minutes_active?: never
          region?: string | null
          total_patients?: number | null
          transport_count?: number | null
        }
        Update: {
          deceased_count?: number | null
          declared_at?: string | null
          delayed_count?: number | null
          id?: string | null
          immediate_count?: number | null
          incident_commander?: string | null
          incident_number?: string | null
          incident_type?: string | null
          location?: string | null
          mci_level?: Database["public"]["Enums"]["mci_level"] | null
          minor_count?: number | null
          minutes_active?: never
          region?: string | null
          total_patients?: number | null
          transport_count?: number | null
        }
        Relationships: []
      }
      apot_summary_24h: {
        Row: {
          avg_offload_minutes: number | null
          exceeded_count: number | null
          exceeded_pct: number | null
          facility_id: string | null
          facility_name: string | null
          max_offload_minutes: number | null
          total_transports: number | null
        }
        Relationships: []
      }
      audit_logs_recent: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"] | null
          duration_ms: number | null
          error_message: string | null
          event_id: string | null
          ip_address: unknown
          metadata: Json | null
          outcome: Database["public"]["Enums"]["audit_outcome"] | null
          resource: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          action?: Database["public"]["Enums"]["audit_action"] | null
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string | null
          ip_address?: unknown
          metadata?: Json | null
          outcome?: Database["public"]["Enums"]["audit_outcome"] | null
          resource?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"] | null
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string | null
          ip_address?: unknown
          metadata?: Json | null
          outcome?: Database["public"]["Enums"]["audit_outcome"] | null
          resource?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      audit_stats: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"] | null
          avg_duration_ms: number | null
          date: string | null
          event_count: number | null
          outcome: Database["public"]["Enums"]["audit_outcome"] | null
          p50_duration_ms: number | null
          p95_duration_ms: number | null
          p99_duration_ms: number | null
        }
        Relationships: []
      }
      current_references: {
        Row: {
          category: Database["public"]["Enums"]["ref_category"] | null
          effective_date: string | null
          id: string | null
          keywords: string[] | null
          ref_number: string | null
          related_refs: string[] | null
          revision_date: string | null
          summary: string | null
          title: string | null
          version: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["ref_category"] | null
          effective_date?: string | null
          id?: string | null
          keywords?: string[] | null
          ref_number?: string | null
          related_refs?: string[] | null
          revision_date?: string | null
          summary?: string | null
          title?: string | null
          version?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["ref_category"] | null
          effective_date?: string | null
          id?: string | null
          keywords?: string[] | null
          ref_number?: string | null
          related_refs?: string[] | null
          revision_date?: string | null
          summary?: string | null
          title?: string | null
          version?: number | null
        }
        Relationships: []
      }
      high_impact_changes: {
        Row: {
          created_at: string | null
          description: string | null
          from_version: number | null
          ref_number: string | null
          requires_training: boolean | null
          section: string | null
          title: string | null
          to_version: number | null
        }
        Relationships: []
      }
      mci_regional_beds: {
        Row: {
          facilities_accepting_delayed: number | null
          facilities_accepting_immediate: number | null
          mci_event_id: string | null
          region: string | null
          total_available: number | null
          total_icu_available: number | null
          total_peds_available: number | null
          total_trauma_available: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mci_bed_availability_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "active_mci_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mci_bed_availability_mci_event_id_fkey"
            columns: ["mci_event_id"]
            isOneToOne: false
            referencedRelation: "mci_events"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_reference_changes: {
        Row: {
          change_type: string | null
          clinical_impact: string | null
          created_at: string | null
          description: string | null
          from_version: number | null
          ref_number: string | null
          requires_training: boolean | null
          section: string | null
          title: string | null
          to_version: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_mci_patient: {
        Args: {
          p_age_group?: string
          p_chief_complaint?: string
          p_mci_id: string
          p_tag_number?: string
          p_triage_category: Database["public"]["Enums"]["triage_category"]
        }
        Returns: string
      }
      add_reference_version: {
        Args: {
          p_category: Database["public"]["Enums"]["ref_category"]
          p_effective_date: string
          p_full_text?: string
          p_keywords?: string[]
          p_ref_number: string
          p_summary?: string
          p_title: string
        }
        Returns: string
      }
      assign_patient_transport: {
        Args: {
          p_facility_id: string
          p_facility_name: string
          p_patient_id: string
          p_unit_id: string
        }
        Returns: undefined
      }
      cleanup_old_audit_logs: { Args: never; Returns: number }
      cleanup_old_chat_history: { Args: never; Returns: number }
      declare_mci: {
        Args: {
          p_incident_commander?: string
          p_incident_number?: string
          p_incident_type: string
          p_location: string
          p_mci_level: Database["public"]["Enums"]["mci_level"]
          p_region: string
        }
        Returns: string
      }
      end_diversion: { Args: { p_facility_id: string }; Returns: boolean }
      get_alternate_facilities: {
        Args: {
          p_diversion_type?: Database["public"]["Enums"]["diversion_type"]
          p_facility_id: string
        }
        Returns: {
          alternate_facility_id: string
          current_status: Database["public"]["Enums"]["diversion_type"]
          distance_miles: number
          priority: number
          transport_minutes: number
        }[]
      }
      get_audit_summary: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          avg_duration_ms: number
          failure_count: number
          p95_duration_ms: number
          success_count: number
          total_events: number
          unique_sessions: number
          unique_users: number
        }[]
      }
      get_chat_session_with_messages: {
        Args: { p_session_id: string }
        Returns: {
          citations: Json
          content: string
          message_created_at: string
          message_id: string
          role: string
          session_created_at: string
          session_id: string
          session_title: string
        }[]
      }
      get_failed_auth_attempts: {
        Args: { p_hours?: number }
        Returns: {
          error_message: string
          event_id: string
          event_timestamp: string
          ip_address: unknown
          user_id: string
        }[]
      }
      get_reference_history: {
        Args: { p_ref_number: string }
        Returns: {
          effective_date: string
          is_current: boolean
          revision_date: string
          status: Database["public"]["Enums"]["ref_status"]
          summary: string
          version: number
        }[]
      }
      get_station_users: {
        Args: { p_station_id: string }
        Returns: {
          badge_number: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }[]
      }
      get_user_audit_trail: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: {
          action: Database["public"]["Enums"]["audit_action"]
          duration_ms: number
          event_id: string
          event_timestamp: string
          ip_address: unknown
          outcome: Database["public"]["Enums"]["audit_outcome"]
          resource: string
        }[]
      }
      get_user_by_badge: {
        Args: { p_badge_number: string }
        Returns: {
          badge_number: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          station_id: string
          user_id: string
        }[]
      }
      get_user_by_email: {
        Args: { p_email: string }
        Returns: {
          badge_number: string
          email: string
          full_name: string
          last_login: string
          role: Database["public"]["Enums"]["user_role"]
          station_id: string
          user_id: string
        }[]
      }
      get_user_chat_history: {
        Args: {
          p_device_fingerprint?: string
          p_limit?: number
          p_offset?: number
          p_user_id?: string
        }
        Returns: {
          created_at: string
          last_message_at: string
          message_count: number
          preview: string
          session_id: string
          title: string
        }[]
      }
      get_user_sessions: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          expires_at: string
          fingerprint: string
          ip_address: unknown
          last_activity: string
          session_id: string
        }[]
      }
      get_version_changes: {
        Args: {
          p_from_version?: number
          p_ref_number: string
          p_to_version?: number
        }
        Returns: {
          change_type: string
          clinical_impact: string
          description: string
          requires_training: boolean
          section: string
        }[]
      }
      record_apot: {
        Args: {
          p_arrival_time: string
          p_facility_id: string
          p_facility_name: string
          p_offload_time: string
          p_patient_acuity?: string
          p_threshold?: number
          p_unit_id?: string
        }
        Returns: string
      }
      record_reference_change: {
        Args: {
          p_change_type: string
          p_clinical_impact?: string
          p_description: string
          p_from_version: number
          p_ref_id: string
          p_requires_training?: boolean
          p_section?: string
          p_to_version: number
        }
        Returns: string
      }
      refresh_audit_stats: { Args: never; Returns: undefined }
      report_bed_availability: {
        Args: {
          p_available_beds: number
          p_can_accept_delayed?: boolean
          p_can_accept_immediate?: boolean
          p_facility_id: string
          p_facility_name: string
          p_icu_available?: number
          p_mci_id: string
          p_region: string
          p_trauma_available?: number
        }
        Returns: string
      }
      resolve_mci: { Args: { p_mci_id: string }; Returns: undefined }
      start_diversion: {
        Args: {
          p_diversion_type: Database["public"]["Enums"]["diversion_type"]
          p_expected_hours?: number
          p_facility_id: string
          p_facility_name: string
          p_reason: string
          p_region?: string
        }
        Returns: string
      }
      update_last_login: { Args: { p_user_id: string }; Returns: undefined }
      update_mci_counts: { Args: { p_mci_id: string }; Returns: undefined }
    }
    Enums: {
      audit_action:
        | "user.login"
        | "user.logout"
        | "user.session.start"
        | "user.session.end"
        | "chat.query"
        | "chat.stream"
        | "dosing.calculate"
        | "dosing.list"
        | "protocol.view"
        | "protocol.search"
        | "auth.failure"
        | "auth.unauthorized"
        | "api.error"
        | "api.validation_error"
        | "system.startup"
        | "system.shutdown"
      audit_outcome: "success" | "failure" | "partial"
      diversion_type:
        | "internal_disaster"
        | "saturation"
        | "trauma_bypass"
        | "stemi_bypass"
        | "stroke_bypass"
        | "pediatric_bypass"
        | "burn_bypass"
        | "psych_bypass"
        | "none"
      mci_level: "level_1" | "level_2" | "level_3" | "level_4"
      ref_category:
        | "destination"
        | "treatment"
        | "mcg"
        | "operational"
        | "education"
        | "administrative"
      ref_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "effective"
        | "superseded"
        | "retired"
      triage_category: "immediate" | "delayed" | "minor" | "deceased"
      user_role: "paramedic" | "emt" | "medical_director" | "admin" | "guest"
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
      audit_action: [
        "user.login",
        "user.logout",
        "user.session.start",
        "user.session.end",
        "chat.query",
        "chat.stream",
        "dosing.calculate",
        "dosing.list",
        "protocol.view",
        "protocol.search",
        "auth.failure",
        "auth.unauthorized",
        "api.error",
        "api.validation_error",
        "system.startup",
        "system.shutdown",
      ],
      audit_outcome: ["success", "failure", "partial"],
      diversion_type: [
        "internal_disaster",
        "saturation",
        "trauma_bypass",
        "stemi_bypass",
        "stroke_bypass",
        "pediatric_bypass",
        "burn_bypass",
        "psych_bypass",
        "none",
      ],
      mci_level: ["level_1", "level_2", "level_3", "level_4"],
      ref_category: [
        "destination",
        "treatment",
        "mcg",
        "operational",
        "education",
        "administrative",
      ],
      ref_status: [
        "draft",
        "pending_review",
        "approved",
        "effective",
        "superseded",
        "retired",
      ],
      triage_category: ["immediate", "delayed", "minor", "deceased"],
      user_role: ["paramedic", "emt", "medical_director", "admin", "guest"],
    },
  },
} as const

export type UserRole = Database["public"]["Enums"]["user_role"]
export type AuditAction = Database["public"]["Enums"]["audit_action"]
export type AuditOutcome = Database["public"]["Enums"]["audit_outcome"]

export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"]
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"]
