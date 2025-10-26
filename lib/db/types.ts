/**
 * TypeScript Database Types
 * Generated from Supabase schema for type-safe database operations
 */

/**
 * Audit action enum (matches PostgreSQL audit_action type)
 */
export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.session.start'
  | 'user.session.end'
  | 'chat.query'
  | 'chat.stream'
  | 'dosing.calculate'
  | 'dosing.list'
  | 'protocol.view'
  | 'protocol.search'
  | 'auth.failure'
  | 'auth.unauthorized'
  | 'api.error'
  | 'api.validation_error'
  | 'system.startup'
  | 'system.shutdown';

/**
 * Audit outcome enum (matches PostgreSQL audit_outcome type)
 */
export type AuditOutcome = 'success' | 'failure' | 'partial';

/**
 * User role enum (matches PostgreSQL user_role type)
 */
export type UserRole = 'paramedic' | 'emt' | 'medical_director' | 'admin' | 'guest';

/**
 * Metric type enum
 */
export type MetricType = 'counter' | 'histogram';

/**
 * Complete database schema type definition
 */
export interface Database {
  public: {
    Tables: {
      /**
       * Audit logs table - immutable audit trail
       */
      audit_logs: {
        Row: {
          event_id: string;
          timestamp: string;
          user_id: string | null;
          user_role: UserRole | null;
          session_id: string | null;
          action: AuditAction;
          resource: string;
          outcome: AuditOutcome;
          metadata: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          error_message: string | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: {
          event_id?: string;
          timestamp?: string;
          user_id?: string | null;
          user_role?: UserRole | null;
          session_id?: string | null;
          action: AuditAction;
          resource: string;
          outcome: AuditOutcome;
          metadata?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          error_message?: string | null;
          duration_ms?: number | null;
          created_at?: string;
        };
        Update: never;
      };

      /**
       * Users table
       */
      users: {
        Row: {
          id: string;
          email: string;
          badge_number: string | null;
          full_name: string;
          role: UserRole;
          station_id: string | null;
          department: string;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          badge_number?: string | null;
          full_name: string;
          role?: UserRole;
          station_id?: string | null;
          department?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          deleted_at?: string | null;
        };
        Update: Omit<Partial<{
          id: string;
          email: string;
          badge_number: string | null;
          full_name: string;
          role: UserRole;
          station_id: string | null;
          department: string;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          deleted_at: string | null;
        }>, 'id' | 'created_at'>;
      };

      /**
       * Sessions table
       */
      sessions: {
        Row: {
          id: string;
          user_id: string;
          fingerprint: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          expires_at: string;
          last_activity: string;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          fingerprint: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          expires_at: string;
          last_activity?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: Omit<Partial<{
          id: string;
          user_id: string;
          fingerprint: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          expires_at: string;
          last_activity: string;
          metadata: Record<string, unknown> | null;
        }>, 'id' | 'user_id' | 'fingerprint' | 'created_at'>;
      };

      /**
       * Metrics table - performance metrics storage
       */
      metrics: {
        Row: {
          id: string;
          metric_name: string;
          metric_type: MetricType;
          date: string;
          hour: number;
          count: number | null;
          p50: number | null;
          p95: number | null;
          p99: number | null;
          min_value: number | null;
          max_value: number | null;
          avg_value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          metric_name: string;
          metric_type: MetricType;
          date: string;
          hour: number;
          count?: number | null;
          p50?: number | null;
          p95?: number | null;
          p99?: number | null;
          min_value?: number | null;
          max_value?: number | null;
          avg_value?: number | null;
          created_at?: string;
        };
        Update: Omit<Partial<{
          id: string;
          metric_name: string;
          metric_type: MetricType;
          date: string;
          hour: number;
          count: number | null;
          p50: number | null;
          p95: number | null;
          p99: number | null;
          min_value: number | null;
          max_value: number | null;
          avg_value: number | null;
          created_at: string;
        }>, 'id' | 'created_at'>;
      };

      /**
       * Rate limit configuration table
       */
      rate_limit_config: {
        Row: {
          id: string;
          limit_type: string;
          requests_per_window: number;
          window_ms: number;
          error_message: string;
          enabled: boolean;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          limit_type: string;
          requests_per_window: number;
          window_ms: number;
          error_message: string;
          enabled?: boolean;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Omit<Partial<{
          id: string;
          limit_type: string;
          requests_per_window: number;
          window_ms: number;
          error_message: string;
          enabled: boolean;
          updated_at: string;
          updated_by: string | null;
        }>, 'id'>;
      };

      /**
       * Rate limit violations table
       */
      rate_limit_violations: {
        Row: {
          id: string;
          fingerprint: string;
          ip_address: string | null;
          limit_type: string;
          violation_count: number;
          reputation_score: number;
          is_banned: boolean;
          first_violation: string;
          last_violation: string;
          banned_until: string | null;
        };
        Insert: {
          id?: string;
          fingerprint: string;
          ip_address?: string | null;
          limit_type: string;
          violation_count?: number;
          reputation_score?: number;
          is_banned?: boolean;
          first_violation?: string;
          last_violation?: string;
          banned_until?: string | null;
        };
        Update: Omit<Partial<{
          id: string;
          fingerprint: string;
          ip_address: string | null;
          limit_type: string;
          violation_count: number;
          reputation_score: number;
          is_banned: boolean;
          first_violation: string;
          last_violation: string;
          banned_until: string | null;
        }>, 'id' | 'fingerprint' | 'first_violation'>;
      };
    };

    Views: {
      /**
       * Recent audit logs view (last 30 days)
       */
      audit_logs_recent: {
        Row: {
          event_id: string;
          timestamp: string;
          user_id: string | null;
          user_role: UserRole | null;
          session_id: string | null;
          action: AuditAction;
          resource: string;
          outcome: AuditOutcome;
          metadata: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          error_message: string | null;
          duration_ms: number | null;
        };
      };

      /**
       * Daily metrics view
       */
      metrics_daily: {
        Row: {
          metric_name: string;
          metric_type: MetricType;
          date: string;
          total_count: number | null;
          avg_p50: number | null;
          avg_p95: number | null;
          avg_p99: number | null;
          min_value: number | null;
          max_value: number | null;
          avg_value: number | null;
        };
      };

      /**
       * Recent metrics view (last 24 hours)
       */
      metrics_recent: {
        Row: {
          metric_name: string;
          metric_type: MetricType;
          date: string;
          hour: number;
          count: number | null;
          p50: number | null;
          p95: number | null;
          p99: number | null;
          min_value: number | null;
          max_value: number | null;
          avg_value: number | null;
        };
      };
    };

    Functions: {
      /**
       * Get user audit trail
       */
      get_user_audit_trail: {
        Args: {
          p_user_id: string;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: Array<{
          event_id: string;
          timestamp: string;
          action: AuditAction;
          resource: string;
          outcome: AuditOutcome;
          ip_address: string | null;
          duration_ms: number | null;
        }>;
      };

      /**
       * Get failed authentication attempts
       */
      get_failed_auth_attempts: {
        Args: {
          p_hours?: number;
        };
        Returns: Array<{
          event_id: string;
          timestamp: string;
          user_id: string | null;
          ip_address: string | null;
          error_message: string | null;
        }>;
      };

      /**
       * Get audit summary statistics
       */
      get_audit_summary: {
        Args: {
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: Array<{
          total_events: number;
          success_count: number;
          failure_count: number;
          unique_users: number;
          unique_sessions: number;
          avg_duration_ms: number | null;
          p95_duration_ms: number | null;
        }>;
      };

      /**
       * Get metric summary for date range
       */
      get_metric_summary: {
        Args: {
          p_metric_name: string;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: Array<{
          date: string;
          total_count: number;
          avg_p50: number | null;
          avg_p95: number | null;
          avg_p99: number | null;
          min_value: number | null;
          max_value: number | null;
        }>;
      };

      /**
       * Get top metrics by count
       */
      get_top_metrics: {
        Args: {
          p_limit?: number;
          p_days?: number;
        };
        Returns: Array<{
          metric_name: string;
          total_count: number;
          avg_value: number | null;
        }>;
      };
    };
  };
}

/**
 * Convenience type exports
 */
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
/** @deprecated Audit logs are immutable - updates are not allowed. Use Insert and Select operations only. */
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

export type Metric = Database['public']['Tables']['metrics']['Row'];
export type MetricInsert = Database['public']['Tables']['metrics']['Insert'];
export type MetricUpdate = Database['public']['Tables']['metrics']['Update'];

export type RateLimitConfig = Database['public']['Tables']['rate_limit_config']['Row'];
export type RateLimitConfigInsert = Database['public']['Tables']['rate_limit_config']['Insert'];
export type RateLimitConfigUpdate = Database['public']['Tables']['rate_limit_config']['Update'];

export type RateLimitViolation = Database['public']['Tables']['rate_limit_violations']['Row'];
export type RateLimitViolationInsert = Database['public']['Tables']['rate_limit_violations']['Insert'];
export type RateLimitViolationUpdate = Database['public']['Tables']['rate_limit_violations']['Update'];
