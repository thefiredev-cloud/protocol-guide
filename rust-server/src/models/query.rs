use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct QueryLog {
    pub id: i32,
    #[sqlx(rename = "userId")]
    pub user_id: i32,
    #[sqlx(rename = "countyId")]
    pub county_id: i32,
    #[sqlx(rename = "queryText")]
    pub query_text: String,
    #[sqlx(rename = "responseText")]
    pub response_text: Option<String>,
    #[sqlx(rename = "protocolRefs")]
    pub protocol_refs: Option<String>, // JSON string
    #[sqlx(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateQueryLog {
    pub user_id: i32,
    pub county_id: i32,
    pub query_text: String,
    pub response_text: Option<String>,
    pub protocol_refs: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct QueryHistoryItem {
    pub id: i32,
    pub query_text: String,
    pub response_text: Option<String>,
    pub county_name: String,
    pub state: String,
    pub created_at: DateTime<Utc>,
}
