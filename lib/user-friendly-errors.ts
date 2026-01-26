/**
 * User-Friendly Error Messages
 *
 * Maps technical error codes and messages to user-friendly explanations.
 * Use this to display errors to users without exposing implementation details.
 *
 * Usage:
 * ```tsx
 * const userMessage = getUserFriendlyError(error);
 * // "We couldn't complete your search. Please try again."
 * ```
 */

export interface UserFriendlyError {
  /** User-facing title */
  title: string;
  /** User-facing description */
  message: string;
  /** Suggested action */
  action?: string;
  /** Whether the user can retry */
  canRetry: boolean;
  /** Whether to show support contact */
  showSupport?: boolean;
}

// Error code to user-friendly message mapping
const ERROR_MESSAGES: Record<string, UserFriendlyError> = {
  // Network errors
  NETWORK_ERROR: {
    title: "Connection Problem",
    message: "We couldn't connect to the server. Please check your internet connection.",
    action: "Try again",
    canRetry: true,
  },
  FETCH_ERROR: {
    title: "Connection Failed",
    message: "Unable to reach our servers. Please check your internet connection and try again.",
    action: "Try again",
    canRetry: true,
  },
  TIMEOUT: {
    title: "Request Timed Out",
    message: "The request took too long. This might be a connection issue.",
    action: "Try again",
    canRetry: true,
  },

  // Rate limiting
  RATE_LIMITED: {
    title: "Too Many Requests",
    message: "You've made too many requests. Please wait a moment before trying again.",
    action: "Wait and retry",
    canRetry: true,
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Slow Down",
    message: "Please wait a moment before making more requests.",
    action: "Wait and retry",
    canRetry: true,
  },

  // Authentication
  UNAUTHORIZED: {
    title: "Please Sign In",
    message: "You need to be signed in to access this feature.",
    action: "Sign in",
    canRetry: false,
  },
  SESSION_EXPIRED: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again.",
    action: "Sign in",
    canRetry: false,
  },
  INVALID_TOKEN: {
    title: "Authentication Error",
    message: "There was a problem with your login. Please sign in again.",
    action: "Sign in",
    canRetry: false,
  },

  // Subscription/Access
  SUBSCRIPTION_REQUIRED: {
    title: "Pro Feature",
    message: "This feature requires a Pro subscription.",
    action: "Upgrade",
    canRetry: false,
  },
  TIER_LIMIT_EXCEEDED: {
    title: "Limit Reached",
    message: "You've reached the limit for your current plan. Upgrade to continue.",
    action: "Upgrade",
    canRetry: false,
  },

  // Search errors
  SEARCH_FAILED: {
    title: "Search Unavailable",
    message: "We couldn't complete your search. Please try again with different keywords.",
    action: "Try again",
    canRetry: true,
  },
  NO_RESULTS: {
    title: "No Results Found",
    message: "We couldn't find any protocols matching your search. Try different keywords.",
    canRetry: true,
  },

  // AI/Claude errors
  CLAUDE_RATE_LIMITED: {
    title: "AI Service Busy",
    message: "Our AI assistant is experiencing high demand. Please try again in a moment.",
    action: "Try again",
    canRetry: true,
  },
  CLAUDE_OVERLOADED: {
    title: "AI Service Busy",
    message: "Our AI assistant is handling many requests. Please wait a moment.",
    action: "Try again",
    canRetry: true,
  },
  CLAUDE_SERVER_ERROR: {
    title: "AI Service Issue",
    message: "Our AI assistant is temporarily unavailable. Please try again shortly.",
    action: "Try again",
    canRetry: true,
  },
  CLAUDE_TIMEOUT: {
    title: "Request Too Long",
    message: "The AI request took too long. Try a shorter or simpler question.",
    action: "Try again",
    canRetry: true,
  },
  CLAUDE_AUTH_ERROR: {
    title: "Service Configuration",
    message: "There's a problem with our AI service. We've been notified.",
    canRetry: false,
    showSupport: true,
  },

  // Voyage/Embedding errors
  VOYAGE_RATE_LIMITED: {
    title: "Search Service Busy",
    message: "The search service is handling many requests. Please try again.",
    action: "Try again",
    canRetry: true,
  },
  VOYAGE_SERVER_ERROR: {
    title: "Search Service Issue",
    message: "The search service is temporarily unavailable. Please try again.",
    action: "Try again",
    canRetry: true,
  },
  VOYAGE_TIMEOUT: {
    title: "Search Timeout",
    message: "The search took too long. Please try again.",
    action: "Try again",
    canRetry: true,
  },

  // Database errors
  DATABASE_ERROR: {
    title: "Data Unavailable",
    message: "We're having trouble loading your data. Please try again.",
    action: "Try again",
    canRetry: true,
  },
  DATABASE_UNAVAILABLE: {
    title: "Service Temporarily Down",
    message: "Our data service is temporarily unavailable. Please try again in a moment.",
    action: "Try again",
    canRetry: true,
  },

  // Circuit breaker
  CIRCUIT_BREAKER_OPEN: {
    title: "Service Recovering",
    message: "This service is temporarily unavailable while we fix an issue. Please try again shortly.",
    action: "Try again later",
    canRetry: true,
  },

  // Voice errors
  VOICE_PERMISSION_DENIED: {
    title: "Microphone Access Needed",
    message: "Please allow microphone access to use voice search.",
    action: "Enable in settings",
    canRetry: true,
  },
  VOICE_NOT_SUPPORTED: {
    title: "Voice Not Available",
    message: "Voice search isn't available on this device. Please type your search instead.",
    canRetry: false,
  },
  VOICE_TRANSCRIPTION_FAILED: {
    title: "Couldn't Understand",
    message: "We couldn't understand the audio. Please speak clearly or type your search.",
    action: "Try again",
    canRetry: true,
  },

  // Validation errors
  VALIDATION_ERROR: {
    title: "Invalid Input",
    message: "Please check your input and try again.",
    canRetry: true,
  },
  INVALID_REQUEST: {
    title: "Something's Wrong",
    message: "There was a problem with your request. Please try again.",
    canRetry: true,
  },

  // Generic fallbacks
  INTERNAL_ERROR: {
    title: "Something Went Wrong",
    message: "We encountered an unexpected error. Please try again.",
    action: "Try again",
    canRetry: true,
  },
  UNKNOWN_ERROR: {
    title: "Unexpected Error",
    message: "Something unexpected happened. Please try again or contact support if the problem persists.",
    action: "Try again",
    canRetry: true,
    showSupport: true,
  },
};

// Default error for unknown codes
const DEFAULT_ERROR: UserFriendlyError = {
  title: "Something Went Wrong",
  message: "An unexpected error occurred. Please try again.",
  action: "Try again",
  canRetry: true,
};

/**
 * Get a user-friendly error from an error code
 */
export function getUserFriendlyErrorByCode(code: string): UserFriendlyError {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[code.toUpperCase()] || DEFAULT_ERROR;
}

/**
 * Get a user-friendly error from any error object
 *
 * Handles:
 * - Error objects with code property
 * - TRPC errors
 * - HTTP status codes
 * - Network errors
 * - Unknown errors
 */
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  // Handle null/undefined
  if (!error) {
    return DEFAULT_ERROR;
  }

  // Check for error code property
  if (typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    if (ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
  }

  // Check for TRPC error
  if (typeof error === "object" && "data" in error) {
    const data = (error as { data?: { code?: string } }).data;
    if (data?.code && ERROR_MESSAGES[data.code]) {
      return ERROR_MESSAGES[data.code];
    }
  }

  // Check for HTTP status code
  if (typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.SUBSCRIPTION_REQUIRED;
      case 429:
        return ERROR_MESSAGES.RATE_LIMITED;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.INTERNAL_ERROR;
      default:
        break;
    }
  }

  // Check error message for patterns
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch") ||
    message.includes("econnrefused") ||
    message.includes("econnreset")
  ) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Timeout
  if (message.includes("timeout") || message.includes("timed out")) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  // Rate limit
  if (message.includes("rate limit") || message.includes("too many")) {
    return ERROR_MESSAGES.RATE_LIMITED;
  }

  // Auth
  if (message.includes("unauthorized") || message.includes("not authenticated")) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  // AI service
  if (message.includes("claude") || message.includes("anthropic")) {
    return ERROR_MESSAGES.CLAUDE_SERVER_ERROR;
  }

  // Search/embedding
  if (message.includes("voyage") || message.includes("embedding")) {
    return ERROR_MESSAGES.VOYAGE_SERVER_ERROR;
  }

  // Database
  if (message.includes("database") || message.includes("postgres") || message.includes("supabase")) {
    return ERROR_MESSAGES.DATABASE_ERROR;
  }

  return DEFAULT_ERROR;
}

/**
 * Format error for display in UI
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
  showRetry: boolean;
} {
  const friendly = getUserFriendlyError(error);
  return {
    title: friendly.title,
    message: friendly.message,
    showRetry: friendly.canRetry,
  };
}

export default getUserFriendlyError;
