use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum FeedbackCategory {
    Error,
    Suggestion,
    General,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum FeedbackStatus {
    Pending,
    Reviewed,
    Resolved,
    Dismissed,
}

impl Default for FeedbackStatus {
    fn default() -> Self {
        Self::Pending
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Feedback {
    pub id: i32,
    #[sqlx(rename = "userId")]
    pub user_id: i32,
    pub category: String,
    #[sqlx(rename = "protocolRef")]
    pub protocol_ref: Option<String>,
    #[sqlx(rename = "countyId")]
    pub county_id: Option<i32>,
    pub subject: String,
    pub message: String,
    pub status: String,
    #[sqlx(rename = "adminNotes")]
    pub admin_notes: Option<String>,
    #[sqlx(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFeedback {
    pub user_id: i32,
    pub category: String,
    pub protocol_ref: Option<String>,
    pub county_id: Option<i32>,
    pub subject: String,
    pub message: String,
}
