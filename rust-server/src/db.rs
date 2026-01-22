use sqlx::mysql::{MySqlPool, MySqlPoolOptions, MySqlConnectOptions, MySqlSslMode};
use std::env;
use std::time::Duration;
use std::str::FromStr;

pub type DbPool = MySqlPool;

pub async fn create_pool() -> Result<DbPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    // Parse the connection options and enable SSL
    let options = MySqlConnectOptions::from_str(&database_url)?
        .ssl_mode(MySqlSslMode::Required);

    let pool = MySqlPoolOptions::new()
        .max_connections(20)
        .min_connections(5)
        .acquire_timeout(Duration::from_secs(30))
        .idle_timeout(Duration::from_secs(600))
        .max_lifetime(Duration::from_secs(1800))
        .connect_with(options)
        .await?;

    tracing::info!("Database connection pool created successfully");
    Ok(pool)
}

// County queries
pub mod counties {
    use super::*;
    use crate::models::{County, CountyWithProtocolCount, StateWithCount};

    pub async fn get_all(pool: &DbPool) -> Result<Vec<County>, sqlx::Error> {
        sqlx::query_as::<_, County>(
            "SELECT * FROM counties ORDER BY state, name"
        )
        .fetch_all(pool)
        .await
    }

    pub async fn get_by_id(pool: &DbPool, id: i32) -> Result<Option<County>, sqlx::Error> {
        sqlx::query_as::<_, County>(
            "SELECT * FROM counties WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(pool)
        .await
    }

    pub async fn get_by_state(pool: &DbPool, state: &str) -> Result<Vec<CountyWithProtocolCount>, sqlx::Error> {
        sqlx::query_as::<_, CountyWithProtocolCount>(
            r#"
            SELECT c.id, c.name, c.state, COUNT(p.id) as protocol_count
            FROM counties c
            LEFT JOIN protocolChunks p ON c.id = p.countyId
            WHERE c.state = ?
            GROUP BY c.id, c.name, c.state
            ORDER BY protocol_count DESC, c.name
            "#
        )
        .bind(state)
        .fetch_all(pool)
        .await
    }

    pub async fn get_states_with_counts(pool: &DbPool) -> Result<Vec<StateWithCount>, sqlx::Error> {
        sqlx::query_as::<_, StateWithCount>(
            r#"
            SELECT 
                c.state,
                COUNT(DISTINCT c.id) as agency_count,
                COUNT(p.id) as protocol_count
            FROM counties c
            LEFT JOIN protocolChunks p ON c.id = p.countyId
            GROUP BY c.state
            ORDER BY protocol_count DESC
            "#
        )
        .fetch_all(pool)
        .await
    }
}

// Protocol queries
pub mod protocols {
    use super::*;
    use crate::models::{ProtocolChunk, ProtocolStats};

    pub async fn search(
        pool: &DbPool,
        query: &str,
        state: Option<&str>,
        county_id: Option<i32>,
        limit: i32,
    ) -> Result<Vec<ProtocolChunk>, sqlx::Error> {
        let search_pattern = format!("%{}%", query);
        
        let sql = match (state, county_id) {
            (Some(state), Some(cid)) => {
                sqlx::query_as::<_, ProtocolChunk>(
                    r#"
                    SELECT p.* FROM protocolChunks p
                    JOIN counties c ON p.countyId = c.id
                    WHERE c.state = ? AND p.countyId = ?
                    AND (p.protocolTitle LIKE ? OR p.content LIKE ? OR p.section LIKE ?)
                    ORDER BY 
                        CASE WHEN p.protocolTitle LIKE ? THEN 0 ELSE 1 END,
                        p.protocolTitle
                    LIMIT ?
                    "#
                )
                .bind(state)
                .bind(cid)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(limit)
                .fetch_all(pool)
                .await
            }
            (Some(state), None) => {
                sqlx::query_as::<_, ProtocolChunk>(
                    r#"
                    SELECT p.* FROM protocolChunks p
                    JOIN counties c ON p.countyId = c.id
                    WHERE c.state = ?
                    AND (p.protocolTitle LIKE ? OR p.content LIKE ? OR p.section LIKE ?)
                    ORDER BY 
                        CASE WHEN p.protocolTitle LIKE ? THEN 0 ELSE 1 END,
                        p.protocolTitle
                    LIMIT ?
                    "#
                )
                .bind(state)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(limit)
                .fetch_all(pool)
                .await
            }
            (None, Some(cid)) => {
                sqlx::query_as::<_, ProtocolChunk>(
                    r#"
                    SELECT p.* FROM protocolChunks p
                    WHERE p.countyId = ?
                    AND (p.protocolTitle LIKE ? OR p.content LIKE ? OR p.section LIKE ?)
                    ORDER BY 
                        CASE WHEN p.protocolTitle LIKE ? THEN 0 ELSE 1 END,
                        p.protocolTitle
                    LIMIT ?
                    "#
                )
                .bind(cid)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(limit)
                .fetch_all(pool)
                .await
            }
            (None, None) => {
                sqlx::query_as::<_, ProtocolChunk>(
                    r#"
                    SELECT * FROM protocolChunks
                    WHERE protocolTitle LIKE ? OR content LIKE ? OR section LIKE ?
                    ORDER BY 
                        CASE WHEN protocolTitle LIKE ? THEN 0 ELSE 1 END,
                        protocolTitle
                    LIMIT ?
                    "#
                )
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(&search_pattern)
                .bind(limit)
                .fetch_all(pool)
                .await
            }
        };
        
        sql
    }

    pub async fn get_stats(pool: &DbPool) -> Result<ProtocolStats, sqlx::Error> {
        let row: (i64, i64, i64) = sqlx::query_as(
            r#"
            SELECT 
                (SELECT COUNT(*) FROM protocolChunks) as total_protocols,
                (SELECT COUNT(*) FROM counties) as total_counties,
                (SELECT COUNT(DISTINCT state) FROM counties) as states_covered
            "#
        )
        .fetch_one(pool)
        .await?;

        Ok(ProtocolStats {
            total_protocols: row.0,
            total_counties: row.1,
            states_covered: row.2,
        })
    }

    pub async fn get_by_county(pool: &DbPool, county_id: i32) -> Result<Vec<ProtocolChunk>, sqlx::Error> {
        sqlx::query_as::<_, ProtocolChunk>(
            "SELECT * FROM protocolChunks WHERE countyId = ? ORDER BY protocolNumber"
        )
        .bind(county_id)
        .fetch_all(pool)
        .await
    }
}

// User queries
pub mod users {
    use super::*;
    use crate::models::User;

    pub async fn get_by_open_id(pool: &DbPool, open_id: &str) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE openId = ?"
        )
        .bind(open_id)
        .fetch_optional(pool)
        .await
    }

    pub async fn get_by_id(pool: &DbPool, id: i32) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(pool)
        .await
    }

    pub async fn increment_query_count(pool: &DbPool, user_id: i32, today: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE users 
            SET queryCountToday = CASE 
                WHEN lastQueryDate = ? THEN queryCountToday + 1 
                ELSE 1 
            END,
            lastQueryDate = ?
            WHERE id = ?
            "#
        )
        .bind(today)
        .bind(today)
        .bind(user_id)
        .execute(pool)
        .await?;
        Ok(())
    }

    pub async fn update_selected_county(pool: &DbPool, user_id: i32, county_id: i32) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE users SET selectedCountyId = ? WHERE id = ?")
            .bind(county_id)
            .bind(user_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}

// Query history
pub mod query_logs {
    use super::*;
    use crate::models::{QueryLog, QueryHistoryItem};

    pub async fn create(
        pool: &DbPool,
        user_id: i32,
        county_id: i32,
        query_text: &str,
        response_text: Option<&str>,
        protocol_refs: Option<&str>,
    ) -> Result<i32, sqlx::Error> {
        let result = sqlx::query(
            r#"
            INSERT INTO queries (userId, countyId, queryText, responseText, protocolRefs)
            VALUES (?, ?, ?, ?, ?)
            "#
        )
        .bind(user_id)
        .bind(county_id)
        .bind(query_text)
        .bind(response_text)
        .bind(protocol_refs)
        .execute(pool)
        .await?;

        Ok(result.last_insert_id() as i32)
    }

    pub async fn get_user_history(pool: &DbPool, user_id: i32, limit: i32) -> Result<Vec<QueryHistoryItem>, sqlx::Error> {
        sqlx::query_as::<_, QueryHistoryItem>(
            r#"
            SELECT q.id, q.queryText as query_text, q.responseText as response_text,
                   c.name as county_name, c.state, q.createdAt as created_at
            FROM queries q
            JOIN counties c ON q.countyId = c.id
            WHERE q.userId = ?
            ORDER BY q.createdAt DESC
            LIMIT ?
            "#
        )
        .bind(user_id)
        .bind(limit)
        .fetch_all(pool)
        .await
    }
}
