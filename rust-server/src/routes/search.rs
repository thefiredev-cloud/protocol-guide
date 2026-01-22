use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};

use crate::db::{self, DbPool};
use crate::models::{ProtocolSearchResult, SearchResponse, ProtocolStats};
use crate::services::llm::LlmClient;

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub query: String,
    pub state: Option<String>,
    #[serde(rename = "countyId")]
    pub county_id: Option<i32>,
    pub limit: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct SemanticSearchResponse {
    pub results: Vec<ProtocolSearchResult>,
    pub answer: Option<String>,
    pub total_count: i64,
}

/// Semantic search endpoint - searches protocols using keyword matching + LLM ranking
pub async fn semantic_search(
    pool: web::Data<DbPool>,
    llm: web::Data<LlmClient>,
    query: web::Query<SearchQuery>,
) -> Result<HttpResponse> {
    let limit = query.limit.unwrap_or(20).min(100);
    
    // Get raw search results from database
    let protocols = db::protocols::search(
        pool.get_ref(),
        &query.query,
        query.state.as_deref(),
        query.county_id,
        limit * 2, // Get more results for LLM to rank
    )
    .await
    .map_err(|e| {
        tracing::error!("Database search error: {}", e);
        actix_web::error::ErrorInternalServerError("Search failed")
    })?;

    if protocols.is_empty() {
        return Ok(HttpResponse::Ok().json(SemanticSearchResponse {
            results: vec![],
            answer: None,
            total_count: 0,
        }));
    }

    // Get county info for each protocol
    let mut results: Vec<ProtocolSearchResult> = Vec::new();
    for protocol in protocols.iter().take(limit as usize) {
        let county = db::counties::get_by_id(pool.get_ref(), protocol.county_id)
            .await
            .ok()
            .flatten();
        
        results.push(ProtocolSearchResult {
            id: protocol.id,
            county_id: protocol.county_id,
            county_name: county.as_ref().map(|c| c.name.clone()).unwrap_or_default(),
            state: county.as_ref().map(|c| c.state.clone()).unwrap_or_default(),
            protocol_number: protocol.protocol_number.clone(),
            protocol_title: protocol.protocol_title.clone(),
            section: protocol.section.clone(),
            content: protocol.content.clone(),
            source_pdf_url: protocol.source_pdf_url.clone(),
            protocol_year: protocol.protocol_year,
            last_verified_at: protocol.last_verified_at,
            relevance_score: 1.0, // Will be updated by LLM ranking
        });
    }

    // Use LLM to generate a concise answer if we have results
    let answer = if !results.is_empty() {
        match llm.generate_answer(&query.query, &results).await {
            Ok(ans) => Some(ans),
            Err(e) => {
                tracing::warn!("LLM answer generation failed: {}", e);
                None
            }
        }
    } else {
        None
    };

    let total = results.len() as i64;
    Ok(HttpResponse::Ok().json(SemanticSearchResponse {
        results,
        answer,
        total_count: total,
    }))
}

/// Get protocol statistics
pub async fn get_stats(pool: web::Data<DbPool>) -> Result<HttpResponse> {
    let stats = db::protocols::get_stats(pool.get_ref())
        .await
        .map_err(|e| {
            tracing::error!("Stats query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get stats")
        })?;

    Ok(HttpResponse::Ok().json(stats))
}

/// Get protocols by county ID
pub async fn get_by_county(
    pool: web::Data<DbPool>,
    path: web::Path<i32>,
) -> Result<HttpResponse> {
    let county_id = path.into_inner();
    
    let protocols = db::protocols::get_by_county(pool.get_ref(), county_id)
        .await
        .map_err(|e| {
            tracing::error!("Protocol query error: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to get protocols")
        })?;

    Ok(HttpResponse::Ok().json(protocols))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/search")
            .route("", web::get().to(semantic_search))
            .route("/stats", web::get().to(get_stats))
            .route("/county/{id}", web::get().to(get_by_county))
    );
}
