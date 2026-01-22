use actix_web::{dev::ServiceRequest, Error, HttpMessage};
use actix_web::web;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use std::env;

use crate::db::{self, DbPool};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // openId
    pub exp: usize,
    pub iat: usize,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub id: i32,
    pub open_id: String,
    pub tier: String,
    pub query_count_today: i32,
}

impl actix_web::FromRequest for AuthenticatedUser {
    type Error = actix_web::Error;
    type Future = std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let req = req.clone();
        
        Box::pin(async move {
            // Get authorization header
            let auth_header = req
                .headers()
                .get("Authorization")
                .and_then(|h| h.to_str().ok())
                .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing authorization header"))?;

            // Extract Bearer token
            let token = auth_header
                .strip_prefix("Bearer ")
                .ok_or_else(|| actix_web::error::ErrorUnauthorized("Invalid authorization format"))?;

            // Decode JWT
            let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default-secret".to_string());
            let token_data = decode::<Claims>(
                token,
                &DecodingKey::from_secret(secret.as_bytes()),
                &Validation::new(Algorithm::HS256),
            )
            .map_err(|e| {
                tracing::warn!("JWT decode error: {}", e);
                actix_web::error::ErrorUnauthorized("Invalid token")
            })?;

            // Get database pool
            let pool = req
                .app_data::<web::Data<DbPool>>()
                .ok_or_else(|| actix_web::error::ErrorInternalServerError("Database not configured"))?;

            // Look up user
            let user = db::users::get_by_open_id(pool.get_ref(), &token_data.claims.sub)
                .await
                .map_err(|e| {
                    tracing::error!("User lookup error: {}", e);
                    actix_web::error::ErrorInternalServerError("Database error")
                })?
                .ok_or_else(|| actix_web::error::ErrorUnauthorized("User not found"))?;

            Ok(AuthenticatedUser {
                id: user.id,
                open_id: user.open_id,
                tier: user.tier,
                query_count_today: user.query_count_today,
            })
        })
    }
}

/// Check if user has exceeded their daily query limit
pub fn check_query_limit(user: &AuthenticatedUser) -> Result<(), actix_web::Error> {
    let limit = match user.tier.as_str() {
        "pro" | "enterprise" => 1000,
        _ => 5, // free tier
    };

    if user.query_count_today >= limit {
        return Err(actix_web::error::ErrorPaymentRequired(
            "Daily query limit reached. Upgrade to Pro for unlimited queries."
        ));
    }

    Ok(())
}

/// Generate a JWT token for a user
pub fn generate_token(open_id: &str) -> Result<String, jsonwebtoken::errors::Error> {
    use jsonwebtoken::{encode, EncodingKey, Header};
    
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default-secret".to_string());
    let now = chrono::Utc::now().timestamp() as usize;
    
    let claims = Claims {
        sub: open_id.to_string(),
        exp: now + 86400 * 30, // 30 days
        iat: now,
    };

    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}
