/**
 * ImageTrend API Client
 * Production-ready singleton client with circuit breaker, automatic token refresh,
 * and comprehensive error handling for ImageTrend Elite API integration
 */

import { CircuitBreaker } from '../../../protocols/circuit-breaker';
import { createLogger } from '../../../log';
import { imageTrendOAuthManager } from './oauth-manager';
import type {
  PCR,
  PCRFilters,
  CreatePCRData,
  UpdatePCRData,
  NarrativeUpdate,
  ProtocolUsage,
  PCRProtocolLink,
  Incident,
  Patient,
  PatientContext,
  ImageTrendResult,
  PaginatedResponse,
  ValidationError,
} from './pcr-types';

const logger = createLogger('ImageTrend:Client');

/**
 * Circuit breaker configuration
 */
const CIRCUIT_BREAKER_CONFIG = {
  threshold: 5,           // Failures before opening circuit
  timeout: 5000,          // Request timeout (5 seconds)
  resetTimeout: 60000,    // Time before attempting half-open (60 seconds)
  halfOpenRequests: 3,    // Max requests to try in half-open state
};

/**
 * HTTP client configuration
 */
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * ImageTrend API Client
 * Singleton pattern with circuit breaker for resilient API communication
 */
export class ImageTrendClient {
  private static instance: ImageTrendClient | null = null;

  private readonly baseUrl: string;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly oauthManager = imageTrendOAuthManager;

  private constructor() {
    this.baseUrl = process.env.IMAGETREND_API_URL || 'https://api.imagetrend.com/v1';
    this.circuitBreaker = new CircuitBreaker(
      'imagetrend-api',
      CIRCUIT_BREAKER_CONFIG
    );

    logger.info('ImageTrend client initialized', {
      baseUrl: this.baseUrl,
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ImageTrendClient {
    if (!ImageTrendClient.instance) {
      ImageTrendClient.instance = new ImageTrendClient();
    }
    return ImageTrendClient.instance;
  }

  // ============================================================================
  // PCR Operations
  // ============================================================================

  /**
   * List PCRs with optional filtering
   */
  public async listPCRs(filters?: PCRFilters): Promise<ImageTrendResult<PaginatedResponse<PCR>>> {
    const query = this.buildPCRFilterQuery(filters);

    return this.request<PaginatedResponse<PCR>>({
      method: 'GET',
      path: '/pcrs',
      query,
    });
  }

  /**
   * Get a specific PCR by ID
   */
  public async getPCR(pcrId: string): Promise<ImageTrendResult<PCR>> {
    return this.request<PCR>({
      method: 'GET',
      path: `/pcrs/${pcrId}`,
    });
  }

  /**
   * Create a new PCR
   */
  public async createPCR(data: CreatePCRData): Promise<ImageTrendResult<PCR>> {
    return this.request<PCR>({
      method: 'POST',
      path: '/pcrs',
      body: data,
    });
  }

  /**
   * Update an existing PCR
   */
  public async updatePCR(pcrId: string, data: UpdatePCRData): Promise<ImageTrendResult<PCR>> {
    return this.request<PCR>({
      method: 'PATCH',
      path: `/pcrs/${pcrId}`,
      body: data,
    });
  }

  // ============================================================================
  // Protocol Linking
  // ============================================================================

  /**
   * Link a protocol to a PCR
   */
  public async linkProtocol(
    pcrId: string,
    protocolId: string,
    usage: ProtocolUsage
  ): Promise<ImageTrendResult<PCRProtocolLink>> {
    return this.request<PCRProtocolLink>({
      method: 'POST',
      path: `/pcrs/${pcrId}/protocols`,
      body: {
        protocolId,
        usage,
      },
    });
  }

  /**
   * Unlink a protocol from a PCR
   */
  public async unlinkProtocol(pcrId: string, linkId: string): Promise<ImageTrendResult<void>> {
    return this.request<void>({
      method: 'DELETE',
      path: `/pcrs/${pcrId}/protocols/${linkId}`,
    });
  }

  /**
   * Get all linked protocols for a PCR
   */
  public async getLinkedProtocols(pcrId: string): Promise<ImageTrendResult<PCRProtocolLink[]>> {
    return this.request<PCRProtocolLink[]>({
      method: 'GET',
      path: `/pcrs/${pcrId}/protocols`,
    });
  }

  // ============================================================================
  // Incident & Patient Operations
  // ============================================================================

  /**
   * Get the current active incident (if any)
   */
  public async getActiveIncident(): Promise<ImageTrendResult<Incident | null>> {
    const result = await this.request<{ incident: Incident | null }>({
      method: 'GET',
      path: '/incidents/active',
    });

    if (result.type === 'success') {
      return {
        type: 'success',
        data: result.data.incident,
      };
    }

    return result as ImageTrendResult<Incident | null>;
  }

  /**
   * Get patient information by ID
   */
  public async getPatientInfo(patientId: string): Promise<ImageTrendResult<Patient>> {
    return this.request<Patient>({
      method: 'GET',
      path: `/patients/${patientId}`,
    });
  }

  /**
   * Get complete patient context (patient + current incident + PCRs)
   */
  public async getPatientContext(patientId: string): Promise<ImageTrendResult<PatientContext>> {
    return this.request<PatientContext>({
      method: 'GET',
      path: `/patients/${patientId}/context`,
    });
  }

  // ============================================================================
  // Narrative Operations
  // ============================================================================

  /**
   * Update PCR narrative
   */
  public async updateNarrative(
    pcrId: string,
    narrative: NarrativeUpdate
  ): Promise<ImageTrendResult<void>> {
    return this.request<void>({
      method: 'PATCH',
      path: `/pcrs/${pcrId}/narrative`,
      body: narrative,
    });
  }

  // ============================================================================
  // Health & Status
  // ============================================================================

  /**
   * Check if client is connected and authenticated
   */
  public isConnected(): boolean {
    return this.oauthManager.isConnected();
  }

  /**
   * Get circuit breaker status
   */
  public getCircuitBreakerState(): {
    state: string;
    failures: number;
  } {
    return {
      state: this.circuitBreaker.getState(),
      failures: this.circuitBreaker.getFailureCount(),
    };
  }

  /**
   * Reset circuit breaker (admin use)
   */
  public resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
    logger.info('Circuit breaker manually reset');
  }

  /**
   * Force disconnect (revoke tokens)
   */
  public async disconnect(): Promise<void> {
    await this.oauthManager.revokeTokens();
    this.circuitBreaker.reset();
    logger.info('Disconnected from ImageTrend');
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Execute an HTTP request with circuit breaker and error handling
   */
  private async request<T>(config: RequestConfig): Promise<ImageTrendResult<T>> {
    // Check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      logger.warn('Circuit breaker is open, request blocked', {
        path: config.path,
        state: this.circuitBreaker.getState(),
      });
      return {
        type: 'circuit_open',
        message: 'Service temporarily unavailable due to repeated failures',
      };
    }

    try {
      // Get access token (auto-refreshes if needed)
      const accessToken = await this.oauthManager.getAccessToken();

      // Build URL
      const url = this.buildUrl(config.path, config.query);

      // Prepare request
      const headers: HeadersInit = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const requestOptions: RequestInit = {
        method: config.method,
        headers,
        signal: AbortSignal.timeout(CIRCUIT_BREAKER_CONFIG.timeout),
      };

      if (config.body) {
        requestOptions.body = JSON.stringify(config.body);
      }

      // Execute request
      logger.debug('Making request to ImageTrend API', {
        method: config.method,
        path: config.path,
      });

      const response = await fetch(url, requestOptions);

      // Handle response
      const result = await this.handleResponse<T>(response, config);

      // Record success
      this.circuitBreaker.recordSuccess();

      return result;

    } catch (error) {
      // Record failure
      this.circuitBreaker.recordFailure();

      return this.handleError(error, config);
    }
  }

  /**
   * Handle HTTP response
   */
  private async handleResponse<T>(
    response: Response,
    config: RequestConfig
  ): Promise<ImageTrendResult<T>> {
    const { status } = response;

    // Success - 2xx
    if (status >= 200 && status < 300) {
      // No content responses
      if (status === 204 || config.method === 'DELETE') {
        return { type: 'success', data: undefined as T };
      }

      const data = await response.json();
      return { type: 'success', data };
    }

    // Client errors - 4xx
    if (status === 401) {
      logger.warn('Unauthorized request, clearing tokens', {
        path: config.path,
      });
      this.oauthManager.revokeTokens();
      return {
        type: 'unauthorized',
        message: 'Authentication failed. Please reconnect to ImageTrend.',
      };
    }

    if (status === 404) {
      return {
        type: 'not_found',
        message: 'Resource not found',
      };
    }

    if (status === 409) {
      const error = await this.safeParseJson(response);
      return {
        type: 'conflict',
        message: error?.message || 'Resource conflict',
      };
    }

    if (status === 422) {
      const error = await this.safeParseJson(response);
      return {
        type: 'validation_error',
        errors: error?.errors || [{ field: 'unknown', message: 'Validation failed' }],
      };
    }

    if (status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      logger.warn('Rate limited by ImageTrend API', {
        retryAfter,
        path: config.path,
      });
      return {
        type: 'rate_limited',
        retryAfter,
        message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
      };
    }

    // Server errors - 5xx
    const errorBody = await this.safeParseJson(response);
    logger.error('ImageTrend API error', {
      status,
      path: config.path,
      error: errorBody,
    });

    return {
      type: 'error',
      message: errorBody?.message || `API request failed with status ${status}`,
      code: errorBody?.code,
      statusCode: status,
    };
  }

  /**
   * Handle request errors
   */
  private handleError(error: unknown, config: RequestConfig): ImageTrendResult<never> {
    if (error instanceof Error) {
      // Timeout errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        logger.error('Request timeout', {
          path: config.path,
          timeout: CIRCUIT_BREAKER_CONFIG.timeout,
        });
        return {
          type: 'error',
          message: 'Request timeout',
          code: 'TIMEOUT',
        };
      }

      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        logger.error('Network error', {
          path: config.path,
          error: error.message,
        });
        return {
          type: 'error',
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        };
      }

      logger.error('Request failed', {
        path: config.path,
        error: error.message,
      });

      return {
        type: 'error',
        message: error.message,
        code: 'UNKNOWN_ERROR',
      };
    }

    logger.error('Unknown error', {
      path: config.path,
      error,
    });

    return {
      type: 'error',
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Safely parse JSON response
   */
  private async safeParseJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Build query parameters from PCR filters
   */
  private buildPCRFilterQuery(filters?: PCRFilters): Record<string, string | number | boolean | undefined> {
    if (!filters) {
      return {};
    }

    const query: Record<string, string | number | boolean | undefined> = {};

    if (filters.incidentId) query.incidentId = filters.incidentId;
    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.agencyId) query.agencyId = filters.agencyId;
    if (filters.status) query.status = filters.status.join(',');
    if (filters.dateFrom) query.dateFrom = filters.dateFrom;
    if (filters.dateTo) query.dateTo = filters.dateTo;
    if (filters.createdBy) query.createdBy = filters.createdBy;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.hasProtocolLinks !== undefined) query.hasProtocolLinks = filters.hasProtocolLinks;
    if (filters.protocolIds) query.protocolIds = filters.protocolIds.join(',');
    if (filters.limit) query.limit = filters.limit;
    if (filters.offset) query.offset = filters.offset;
    if (filters.sortBy) query.sortBy = filters.sortBy;
    if (filters.sortOrder) query.sortOrder = filters.sortOrder;

    return query;
  }
}

/**
 * Singleton export
 */
export const imageTrendClient = ImageTrendClient.getInstance();

/**
 * Class export for testing
 */
export { ImageTrendClient as ImageTrendClientClass };
