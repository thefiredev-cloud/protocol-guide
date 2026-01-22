use actix_web::{web, HttpResponse, Result};
use serde::Deserialize;

use crate::db::{self, DbPool};

#[derive(Debug, Deserialize)]
pub struct StateQuery {
    pub state: String,
}

/// Get all states with agency and protocol counts
pub async fn get_states(pool: web::Data<DbPool>) -> Result<HttpResponse> {
    let states = db::counties::get_states_with_counts(pool.get_ref())
        .await
        .map_err(|e| {
            tracing::error!("States query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get states")
        })?;

    Ok(HttpResponse::Ok().json(states))
}

/// Get agencies by state with protocol counts
pub async fn get_agencies_by_state(
    pool: web::Data<DbPool>,
    query: web::Query<StateQuery>,
) -> Result<HttpResponse> {
    let agencies = db::counties::get_by_state(pool.get_ref(), &query.state)
        .await
        .map_err(|e| {
            tracing::error!("Agencies query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get agencies")
        })?;

    Ok(HttpResponse::Ok().json(agencies))
}

/// Get all counties/agencies
pub async fn get_all(pool: web::Data<DbPool>) -> Result<HttpResponse> {
    let counties = db::counties::get_all(pool.get_ref())
        .await
        .map_err(|e| {
            tracing::error!("Counties query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get counties")
        })?;

    Ok(HttpResponse::Ok().json(counties))
}

/// Get county by ID
pub async fn get_by_id(
    pool: web::Data<DbPool>,
    path: web::Path<i32>,
) -> Result<HttpResponse> {
    let county_id = path.into_inner();
    
    let county = db::counties::get_by_id(pool.get_ref(), county_id)
        .await
        .map_err(|e| {
            tracing::error!("County query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get county")
        })?;

    match county {
        Some(c) => Ok(HttpResponse::Ok().json(c)),
        None => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "County not found"
        }))),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/counties")
            .route("", web::get().to(get_all))
            .route("/states", web::get().to(get_states))
            .route("/by-state", web::get().to(get_agencies_by_state))
            .route("/{id}", web::get().to(get_by_id))
    );
}
