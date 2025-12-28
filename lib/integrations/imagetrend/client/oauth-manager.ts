/**
 * ImageTrend OAuth 2.0 Manager
 *
 * Singleton manager for ImageTrend OAuth 2.0 authentication with PKCE flow.
 * Handles authorization, token exchange, refresh, and revocation.
 */

import {
  type ImageTrendTokens,
  type ConnectionInfo,
  type PKCEChallenge,
  type TokenRefreshResult,
  type AuthorizationUrlParams,
  type TokenExchangeParams,
  type TokenRefreshParams,
  type TokenRevocationParams,
  type OAuthError,
  type StoredTokenMetadata,
} from './types';

/**
 * OAuth configuration from environment variables
 */
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  revokeUrl: string;
  redirectUri: string;
}

/**
 * Token storage interface
 */
interface TokenStorage {
  tokens: ImageTrendTokens | null;
  metadata: StoredTokenMetadata | null;
  connectionInfo: ConnectionInfo | null;
}

/**
 * ImageTrend OAuth Manager singleton
 * Manages OAuth 2.0 PKCE flow for ImageTrend integration
 */
class ImageTrendOAuthManager {
  private static instance: ImageTrendOAuthManager | null = null;

  private config: OAuthConfig;
  private storage: TokenStorage = {
    tokens: null,
    metadata: null,
    connectionInfo: null,
  };

  // Token expiry buffer (5 minutes in milliseconds)
  private readonly TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

  // Default OAuth scopes
  private readonly DEFAULT_SCOPES = [
    'patient.read',
    'incident.read',
    'incident.write',
    'narrative.read',
    'narrative.write',
  ];

  private constructor() {
    this.config = this.loadConfig();
    this.loadStoredTokens();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ImageTrendOAuthManager {
    if (!ImageTrendOAuthManager.instance) {
      ImageTrendOAuthManager.instance = new ImageTrendOAuthManager();
    }
    return ImageTrendOAuthManager.instance;
  }

  /**
   * Load OAuth configuration from environment variables
   */
  private loadConfig(): OAuthConfig {
    const clientId = process.env.NEXT_PUBLIC_IMAGETREND_CLIENT_ID || process.env.IMAGETREND_CLIENT_ID;
    const clientSecret = process.env.IMAGETREND_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_IMAGETREND_REDIRECT_URI || process.env.IMAGETREND_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        'Missing required ImageTrend OAuth environment variables: ' +
        'IMAGETREND_CLIENT_ID, IMAGETREND_CLIENT_SECRET, IMAGETREND_REDIRECT_URI'
      );
    }

    return {
      clientId,
      clientSecret,
      authUrl: process.env.IMAGETREND_AUTH_URL || 'https://auth.imagetrend.com/oauth/authorize',
      tokenUrl: process.env.IMAGETREND_TOKEN_URL || 'https://auth.imagetrend.com/oauth/token',
      revokeUrl: process.env.IMAGETREND_REVOKE_URL || 'https://auth.imagetrend.com/oauth/revoke',
      redirectUri,
    };
  }

  /**
   * Load stored tokens from persistent storage
   * In browser: localStorage, on server: database/session
   */
  private loadStoredTokens(): void {
    if (typeof window === 'undefined') {
      // Server-side: tokens should be loaded from database/session
      // This will be handled by the API routes
      return;
    }

    try {
      // Client-side: load from localStorage (temporary, should use httpOnly cookies)
      const storedTokens = localStorage.getItem('imagetrend_tokens');
      const storedMetadata = localStorage.getItem('imagetrend_tokens_metadata');
      const storedConnection = localStorage.getItem('imagetrend_connection_info');

      if (storedTokens) {
        this.storage.tokens = JSON.parse(storedTokens);
      }

      if (storedMetadata) {
        this.storage.metadata = JSON.parse(storedMetadata);
      }

      if (storedConnection) {
        this.storage.connectionInfo = JSON.parse(storedConnection);
      }
    } catch (error) {
      console.error('[ImageTrend OAuth] Failed to load stored tokens:', error);
      this.clearStorage();
    }
  }

  /**
   * Save tokens to persistent storage
   */
  private saveTokens(tokens: ImageTrendTokens, connectionInfo?: ConnectionInfo): void {
    const now = Date.now();
    const expiresAt = now + (tokens.expires_in * 1000);

    this.storage.tokens = tokens;
    this.storage.metadata = {
      obtained_at: now,
      expires_at: expiresAt,
      user_id: connectionInfo?.user_id,
      agency_id: connectionInfo?.agency_id,
    };

    if (connectionInfo) {
      this.storage.connectionInfo = connectionInfo;
    }

    if (typeof window !== 'undefined') {
      // Client-side storage (temporary, should use httpOnly cookies)
      try {
        localStorage.setItem('imagetrend_tokens', JSON.stringify(tokens));
        localStorage.setItem('imagetrend_tokens_metadata', JSON.stringify(this.storage.metadata));
        if (connectionInfo) {
          localStorage.setItem('imagetrend_connection_info', JSON.stringify(connectionInfo));
        }
      } catch (error) {
        console.error('[ImageTrend OAuth] Failed to save tokens:', error);
      }
    }

    console.log('[ImageTrend OAuth] Tokens saved, expires at:', new Date(expiresAt).toISOString());
  }

  /**
   * Clear stored tokens
   */
  private clearStorage(): void {
    this.storage.tokens = null;
    this.storage.metadata = null;
    this.storage.connectionInfo = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('imagetrend_tokens');
      localStorage.removeItem('imagetrend_tokens_metadata');
      localStorage.removeItem('imagetrend_connection_info');
    }
  }

  /**
   * Generate PKCE challenge
   * Creates a cryptographically secure code verifier and SHA-256 challenge
   */
  async generatePKCEChallenge(): Promise<PKCEChallenge> {
    // Generate random code verifier (43-128 characters)
    const verifier = this.generateCodeVerifier();

    // Create SHA-256 hash of verifier
    const challenge = await this.generateCodeChallenge(verifier);

    return {
      verifier,
      challenge,
      method: 'S256',
    };
  }

  /**
   * Generate cryptographically secure code verifier
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);

    if (typeof window !== 'undefined') {
      crypto.getRandomValues(array);
    } else {
      // Node.js environment
      const nodeCrypto = require('crypto');
      nodeCrypto.randomFillSync(array);
    }

    return this.base64URLEncode(array);
  }

  /**
   * Generate code challenge from verifier using SHA-256
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);

    if (typeof window !== 'undefined') {
      // Browser environment
      const hash = await crypto.subtle.digest('SHA-256', data);
      return this.base64URLEncode(new Uint8Array(hash));
    } else {
      // Node.js environment
      const nodeCrypto = require('crypto');
      const hash = nodeCrypto.createHash('sha256').update(verifier).digest();
      return this.base64URLEncode(new Uint8Array(hash));
    }
  }

  /**
   * Base64 URL encode (RFC 4648)
   */
  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = typeof window !== 'undefined'
      ? btoa(String.fromCharCode(...buffer))
      : Buffer.from(buffer).toString('base64');

    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate OAuth authorization URL with PKCE
   * @param state - CSRF protection state parameter
   * @param scopes - Optional custom scopes (defaults to DEFAULT_SCOPES)
   * @returns Authorization URL to redirect user to
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const params: AuthorizationUrlParams = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: (scopes || this.DEFAULT_SCOPES).join(' '),
      code_challenge: '', // Will be set by caller with PKCE challenge
      code_challenge_method: 'S256',
      state,
    };

    // Note: PKCE challenge should be generated and stored before calling this
    // The challenge will be added by the caller
    const url = new URL(this.config.authUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value.toString());
      }
    });

    return url.toString();
  }

  /**
   * Build complete authorization URL with PKCE challenge
   * @param state - CSRF protection state parameter
   * @param codeChallenge - PKCE code challenge
   * @param scopes - Optional custom scopes
   * @returns Complete authorization URL
   */
  buildAuthorizationUrl(state: string, codeChallenge: string, scopes?: string[]): string {
    const url = new URL(this.config.authUrl);

    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', (scopes || this.DEFAULT_SCOPES).join(' '));
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
    url.searchParams.append('state', state);

    return url.toString();
  }

  /**
   * Exchange authorization code for tokens
   * @param code - Authorization code from OAuth callback
   * @param codeVerifier - PKCE code verifier
   * @returns OAuth tokens
   */
  async exchangeCode(code: string, codeVerifier: string): Promise<ImageTrendTokens> {
    const params: TokenExchangeParams = {
      code,
      code_verifier: codeVerifier,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
    };

    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(params as Record<string, string>),
      });

      if (!response.ok) {
        const error: OAuthError = await response.json();
        throw new Error(
          `Token exchange failed: ${error.error} - ${error.error_description || 'Unknown error'}`
        );
      }

      const tokens: ImageTrendTokens = await response.json();
      tokens.obtained_at = new Date().toISOString();

      // Fetch connection info
      const connectionInfo = await this.fetchConnectionInfo(tokens.access_token);

      // Save tokens
      this.saveTokens(tokens, connectionInfo);

      console.log('[ImageTrend OAuth] Code exchange successful');
      return tokens;
    } catch (error) {
      console.error('[ImageTrend OAuth] Code exchange failed:', error);
      throw error;
    }
  }

  /**
   * Get valid access token (auto-refresh if expired)
   * @returns Valid access token
   */
  async getAccessToken(): Promise<string> {
    // Check if we have tokens
    if (!this.storage.tokens || !this.storage.metadata) {
      throw new Error('Not authenticated. Please connect to ImageTrend first.');
    }

    // Check if token is expired or will expire soon
    const now = Date.now();
    const expiresAt = this.storage.metadata.expires_at;
    const bufferTime = expiresAt - this.TOKEN_EXPIRY_BUFFER_MS;

    if (now >= bufferTime) {
      console.log('[ImageTrend OAuth] Token expired or expiring soon, refreshing...');
      await this.refreshTokens();
    }

    if (!this.storage.tokens) {
      throw new Error('Failed to get valid access token');
    }

    return this.storage.tokens.access_token;
  }

  /**
   * Refresh access token using refresh token
   * @returns New tokens
   */
  async refreshTokens(): Promise<ImageTrendTokens> {
    if (!this.storage.tokens?.refresh_token) {
      throw new Error('No refresh token available. Please reconnect to ImageTrend.');
    }

    const params: TokenRefreshParams = {
      refresh_token: this.storage.tokens.refresh_token,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
    };

    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(params as Record<string, string>),
      });

      if (!response.ok) {
        const error: OAuthError = await response.json();

        // If refresh fails, clear tokens and require re-authentication
        if (error.error === 'invalid_grant') {
          this.clearStorage();
          throw new Error('Refresh token expired. Please reconnect to ImageTrend.');
        }

        throw new Error(
          `Token refresh failed: ${error.error} - ${error.error_description || 'Unknown error'}`
        );
      }

      const tokens: ImageTrendTokens = await response.json();
      tokens.obtained_at = new Date().toISOString();

      // Save refreshed tokens (preserve existing connection info)
      this.saveTokens(tokens, this.storage.connectionInfo || undefined);

      console.log('[ImageTrend OAuth] Token refresh successful');
      return tokens;
    } catch (error) {
      console.error('[ImageTrend OAuth] Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Revoke tokens and disconnect
   */
  async revokeTokens(): Promise<void> {
    if (!this.storage.tokens) {
      console.log('[ImageTrend OAuth] No tokens to revoke');
      return;
    }

    // Revoke both access and refresh tokens
    const tokens = [
      { token: this.storage.tokens.access_token, hint: 'access_token' as const },
      { token: this.storage.tokens.refresh_token, hint: 'refresh_token' as const },
    ];

    const revokePromises = tokens.map(({ token, hint }) => {
      const params: TokenRevocationParams = {
        token,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        token_type_hint: hint,
      };

      return fetch(this.config.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params as Record<string, string>),
      }).catch((error) => {
        console.warn(`[ImageTrend OAuth] Failed to revoke ${hint}:`, error);
      });
    });

    try {
      await Promise.all(revokePromises);
      console.log('[ImageTrend OAuth] Tokens revoked successfully');
    } catch (error) {
      console.error('[ImageTrend OAuth] Token revocation failed:', error);
    } finally {
      // Clear local storage regardless of revocation success
      this.clearStorage();
    }
  }

  /**
   * Check if currently connected to ImageTrend
   */
  isConnected(): boolean {
    if (!this.storage.tokens || !this.storage.metadata) {
      return false;
    }

    // Check if token is still valid (with buffer)
    const now = Date.now();
    const expiresAt = this.storage.metadata.expires_at;
    const bufferTime = expiresAt - this.TOKEN_EXPIRY_BUFFER_MS;

    return now < bufferTime;
  }

  /**
   * Get connection information
   */
  getConnectionInfo(): ConnectionInfo | null {
    return this.storage.connectionInfo;
  }

  /**
   * Fetch connection info from ImageTrend API
   * @param accessToken - Valid access token
   * @returns Connection information
   */
  private async fetchConnectionInfo(accessToken: string): Promise<ConnectionInfo> {
    // This endpoint should be configured based on ImageTrend's API
    const userInfoUrl = process.env.IMAGETREND_USERINFO_URL || 'https://api.imagetrend.com/v1/userinfo';

    try {
      const response = await fetch(userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const data = await response.json();

      const connectionInfo: ConnectionInfo = {
        agency_id: data.agency_id || data.agencyId || 'unknown',
        user_id: data.user_id || data.userId || data.sub || 'unknown',
        connected_at: new Date().toISOString(),
        scopes: this.storage.tokens?.scope?.split(' ') || [],
        agency_name: data.agency_name || data.agencyName,
        user_email: data.email,
      };

      return connectionInfo;
    } catch (error) {
      console.warn('[ImageTrend OAuth] Failed to fetch connection info:', error);

      // Return minimal connection info
      return {
        agency_id: 'unknown',
        user_id: 'unknown',
        connected_at: new Date().toISOString(),
        scopes: this.storage.tokens?.scope?.split(' ') || [],
      };
    }
  }

  /**
   * Get current token metadata (for debugging/monitoring)
   */
  getTokenMetadata(): StoredTokenMetadata | null {
    return this.storage.metadata;
  }

  /**
   * Check if token is expired (with buffer)
   */
  isTokenExpired(): boolean {
    if (!this.storage.metadata) {
      return true;
    }

    const now = Date.now();
    const expiresAt = this.storage.metadata.expires_at;
    const bufferTime = expiresAt - this.TOKEN_EXPIRY_BUFFER_MS;

    return now >= bufferTime;
  }

  /**
   * Get time until token expiry (in milliseconds)
   */
  getTimeUntilExpiry(): number {
    if (!this.storage.metadata) {
      return 0;
    }

    const now = Date.now();
    const expiresAt = this.storage.metadata.expires_at;

    return Math.max(0, expiresAt - now);
  }
}

/**
 * Singleton export
 */
export const imageTrendOAuthManager = ImageTrendOAuthManager.getInstance();

/**
 * Class export for testing
 */
export { ImageTrendOAuthManager };
