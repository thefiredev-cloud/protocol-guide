use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ProtocolChunk {
    pub id: i32,
    #[sqlx(rename = "countyId")]
    pub county_id: i32,
    #[sqlx(rename = "protocolNumber")]
    pub protocol_number: String,
    #[sqlx(rename = "protocolTitle")]
    pub protocol_title: String,
    pub section: Option<String>,
    pub content: String,
    #[sqlx(rename = "sourcePdfUrl")]
    pub source_pdf_url: Option<String>,
    #[sqlx(rename = "protocolEffectiveDate")]
    pub protocol_effective_date: Option<String>,
    #[sqlx(rename = "lastVerifiedAt")]
    pub last_verified_at: Option<DateTime<Utc>>,
    #[sqlx(rename = "protocolYear")]
    pub protocol_year: Option<i32>,
    #[sqlx(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolSearchResult {
    pub id: i32,
    pub county_id: i32,
    pub county_name: String,
    pub state: String,
    pub protocol_number: String,
    pub protocol_title: String,
    pub section: Option<String>,
    pub content: String,
    pub source_pdf_url: Option<String>,
    pub protocol_year: Option<i32>,
    pub last_verified_at: Option<DateTime<Utc>>,
    pub relevance_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProtocolChunk {
    pub county_id: i32,
    pub protocol_number: String,
    pub protocol_title: String,
    pub section: Option<String>,
    pub content: String,
    pub source_pdf_url: Option<String>,
    pub protocol_effective_date: Option<String>,
    pub protocol_year: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub state: Option<String>,
    pub county_id: Option<i32>,
    pub limit: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResponse {
    pub results: Vec<ProtocolSearchResult>,
    pub total_count: i64,
    pub query: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolStats {
    pub total_protocols: i64,
    pub total_counties: i64,
    pub states_covered: i64,
}
