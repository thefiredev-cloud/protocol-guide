use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    User,
    Admin,
}

impl Default for UserRole {
    fn default() -> Self {
        Self::User
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum UserTier {
    Free,
    Pro,
    Enterprise,
}

impl Default for UserTier {
    fn default() -> Self {
        Self::Free
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i32,
    #[sqlx(rename = "openId")]
    pub open_id: String,
    pub name: Option<String>,
    pub email: Option<String>,
    #[sqlx(rename = "loginMethod")]
    pub login_method: Option<String>,
    pub role: String,
    pub tier: String,
    #[sqlx(rename = "queryCountToday")]
    pub query_count_today: i32,
    #[sqlx(rename = "lastQueryDate")]
    pub last_query_date: Option<String>,
    #[sqlx(rename = "selectedCountyId")]
    pub selected_county_id: Option<i32>,
    #[sqlx(rename = "stripeCustomerId")]
    pub stripe_customer_id: Option<String>,
    #[sqlx(rename = "subscriptionId")]
    pub subscription_id: Option<String>,
    #[sqlx(rename = "subscriptionStatus")]
    pub subscription_status: Option<String>,
    #[sqlx(rename = "subscriptionEndDate")]
    pub subscription_end_date: Option<DateTime<Utc>>,
    #[sqlx(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
    #[sqlx(rename = "lastSignedIn")]
    pub last_signed_in: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUser {
    pub open_id: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub login_method: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: i32,
    pub name: Option<String>,
    pub email: Option<String>,
    pub role: String,
    pub tier: String,
    pub query_count_today: i32,
    pub selected_county_id: Option<i32>,
    pub subscription_status: Option<String>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tier: user.tier,
            query_count_today: user.query_count_today,
            selected_county_id: user.selected_county_id,
            subscription_status: user.subscription_status,
        }
    }
}
