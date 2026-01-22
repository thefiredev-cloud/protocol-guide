use actix_web::{web, HttpResponse, Result};
use serde::Deserialize;

use crate::db::{self, DbPool};
use crate::middleware::auth::AuthenticatedUser;
use crate::models::UserResponse;

#[derive(Debug, Deserialize)]
pub struct UpdateCountyRequest {
    #[serde(rename = "countyId")]
    pub county_id: i32,
}

/// Get current user profile
pub async fn get_me(
    pool: web::Data<DbPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse> {
    let db_user = db::users::get_by_id(pool.get_ref(), user.id)
        .await
        .map_err(|e| {
            tracing::error!("User query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get user")
        })?;

    match db_user {
        Some(u) => Ok(HttpResponse::Ok().json(UserResponse::from(u))),
        None => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "User not found"
        }))),
    }
}

/// Update user's selected county
pub async fn update_selected_county(
    pool: web::Data<DbPool>,
    user: AuthenticatedUser,
    body: web::Json<UpdateCountyRequest>,
) -> Result<HttpResponse> {
    db::users::update_selected_county(pool.get_ref(), user.id, body.county_id)
        .await
        .map_err(|e| {
            tracing::error!("Update county error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to update county")
        })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true
    })))
}

/// Get user's query history
pub async fn get_history(
    pool: web::Data<DbPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse> {
    let history = db::query_logs::get_user_history(pool.get_ref(), user.id, 50)
        .await
        .map_err(|e| {
            tracing::error!("History query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get history")
        })?;

    Ok(HttpResponse::Ok().json(history))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/users")
            .route("/me", web::get().to(get_me))
            .route("/county", web::put().to(update_selected_county))
            .route("/history", web::get().to(get_history))
    );
}
