use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct County {
    pub id: i32,
    pub name: String,
    pub state: String,
    #[sqlx(rename = "usesStateProtocols")]
    pub uses_state_protocols: bool,
    #[sqlx(rename = "protocolVersion")]
    pub protocol_version: Option<String>,
    #[sqlx(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CountyWithProtocolCount {
    pub id: i32,
    pub name: String,
    pub state: String,
    pub protocol_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCounty {
    pub name: String,
    pub state: String,
    pub uses_state_protocols: Option<bool>,
    pub protocol_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct StateWithCount {
    pub state: String,
    pub agency_count: i64,
    pub protocol_count: i64,
}
