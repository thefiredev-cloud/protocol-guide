/**
 * ImageTrend OAuth 2.0 Types
 *
 * Type definitions for ImageTrend OAuth integration
 */

/**
 * OAuth 2.0 token response from ImageTrend
 */
export interface ImageTrendTokens {
  /** OAuth access token */
  access_token: string;

  /** OAuth refresh token for obtaining new access tokens */
  refresh_token: string;

  /** Token expiration time in seconds */
  expires_in: number;

  /** Token type (typically "Bearer") */
  token_type: string;

  /** Space-delimited list of granted scopes */
  scope: string;

  /** ISO timestamp when tokens were obtained */
  obtained_at?: string;
}

/**
 * Connection information for ImageTrend integration
 */
export interface ConnectionInfo {
  /** ImageTrend agency ID */
  agency_id: string;

  /** ImageTrend user ID */
  user_id: string;

  /** ISO timestamp when connection was established */
  connected_at: string;

  /** Array of granted OAuth scopes */
  scopes: string[];

  /** Optional agency name */
  agency_name?: string;

  /** Optional user email */
  user_email?: string;
}

/**
 * PKCE challenge components for OAuth 2.0
 */
export interface PKCEChallenge {
  /** Code verifier (random string) */
  verifier: string;

  /** Code challenge (SHA-256 hash of verifier) */
  challenge: string;

  /** Challenge method (always "S256" for SHA-256) */
  method: 'S256';
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  /** Whether refresh was successful */
  success: boolean;

  /** New tokens if successful */
  tokens?: ImageTrendTokens;

  /** Error message if failed */
  error?: string;
}

/**
 * OAuth authorization URL parameters
 */
export interface AuthorizationUrlParams {
  /** OAuth client ID */
  client_id: string;

  /** Redirect URI after authorization */
  redirect_uri: string;

  /** Response type (always "code" for authorization code flow) */
  response_type: 'code';

  /** Requested OAuth scopes */
  scope: string;

  /** PKCE code challenge */
  code_challenge: string;

  /** PKCE code challenge method */
  code_challenge_method: 'S256';

  /** State parameter for CSRF protection */
  state: string;

  /** Optional prompt parameter */
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
}

/**
 * Token exchange parameters
 */
export interface TokenExchangeParams {
  /** Authorization code from OAuth callback */
  code: string;

  /** PKCE code verifier */
  code_verifier: string;

  /** OAuth client ID */
  client_id: string;

  /** OAuth client secret */
  client_secret: string;

  /** Redirect URI (must match authorization request) */
  redirect_uri: string;

  /** Grant type (always "authorization_code") */
  grant_type: 'authorization_code';
}

/**
 * Token refresh parameters
 */
export interface TokenRefreshParams {
  /** OAuth refresh token */
  refresh_token: string;

  /** OAuth client ID */
  client_id: string;

  /** OAuth client secret */
  client_secret: string;

  /** Grant type (always "refresh_token") */
  grant_type: 'refresh_token';
}

/**
 * Token revocation parameters
 */
export interface TokenRevocationParams {
  /** Token to revoke (access or refresh token) */
  token: string;

  /** OAuth client ID */
  client_id: string;

  /** OAuth client secret */
  client_secret: string;

  /** Optional token type hint */
  token_type_hint?: 'access_token' | 'refresh_token';
}

/**
 * OAuth error response
 */
export interface OAuthError {
  /** Error code */
  error: string;

  /** Human-readable error description */
  error_description?: string;

  /** Error URI with additional information */
  error_uri?: string;
}

/**
 * Stored token metadata
 */
export interface StoredTokenMetadata {
  /** When tokens were obtained */
  obtained_at: number;

  /** When tokens expire (calculated) */
  expires_at: number;

  /** User ID associated with tokens */
  user_id?: string;

  /** Agency ID associated with tokens */
  agency_id?: string;
}
