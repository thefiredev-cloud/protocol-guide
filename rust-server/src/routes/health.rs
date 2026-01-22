use actix_web::{web, HttpResponse, Result};
use serde::Serialize;

use crate::db::DbPool;

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub database: String,
    pub version: String,
}

/// Health check endpoint
pub async fn health(pool: web::Data<DbPool>) -> Result<HttpResponse> {
    // Test database connection
    let db_status = match sqlx::query("SELECT 1")
        .execute(pool.get_ref())
        .await
    {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    Ok(HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        database: db_status.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }))
}

/// Ready check for load balancers
pub async fn ready(pool: web::Data<DbPool>) -> Result<HttpResponse> {
    match sqlx::query("SELECT 1").execute(pool.get_ref()).await {
        Ok(_) => Ok(HttpResponse::Ok().body("ready")),
        Err(_) => Ok(HttpResponse::ServiceUnavailable().body("not ready")),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("")
            .route("/health", web::get().to(health))
            .route("/ready", web::get().to(ready))
    );
}
