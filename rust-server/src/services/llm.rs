use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use thiserror::Error;

use crate::models::ProtocolSearchResult;

#[derive(Error, Debug)]
pub enum LlmError {
    #[error("HTTP request failed: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("API error: {0}")]
    ApiError(String),
    #[error("Missing API key")]
    MissingApiKey,
}

#[derive(Debug, Clone)]
pub struct LlmClient {
    client: Client,
    api_key: String,
    base_url: String,
}

#[derive(Debug, Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Debug, Deserialize)]
struct ChatChoice {
    message: ChatMessageResponse,
}

#[derive(Debug, Deserialize)]
struct ChatMessageResponse {
    content: String,
}

impl LlmClient {
    pub fn new() -> Result<Self, LlmError> {
        let api_key = env::var("OPENAI_API_KEY")
            .or_else(|_| env::var("LLM_API_KEY"))
            .map_err(|_| LlmError::MissingApiKey)?;

        let base_url = env::var("LLM_BASE_URL")
            .unwrap_or_else(|_| "https://api.openai.com/v1".to_string());

        Ok(Self {
            client: Client::new(),
            api_key,
            base_url,
        })
    }

    /// Generate a concise answer from protocol search results
    pub async fn generate_answer(
        &self,
        query: &str,
        results: &[ProtocolSearchResult],
    ) -> Result<String, LlmError> {
        // Build context from search results
        let context = results
            .iter()
            .take(5)
            .map(|r| {
                format!(
                    "Protocol: {} - {}\nAgency: {} ({})\nContent: {}\n",
                    r.protocol_number,
                    r.protocol_title,
                    r.county_name,
                    r.state,
                    &r.content[..r.content.len().min(500)]
                )
            })
            .collect::<Vec<_>>()
            .join("\n---\n");

        let system_prompt = r#"You are an EMS protocol assistant. Provide concise, actionable answers based on the provided protocol excerpts. 
Focus on:
- Key steps and interventions
- Medication dosages when mentioned
- Critical decision points
Keep responses brief and field-ready. Always cite the protocol number."#;

        let user_prompt = format!(
            "Question: {}\n\nRelevant Protocols:\n{}\n\nProvide a concise answer based on these protocols.",
            query, context
        );

        let request = ChatRequest {
            model: "gpt-4o-mini".to_string(),
            messages: vec![
                ChatMessage {
                    role: "system".to_string(),
                    content: system_prompt.to_string(),
                },
                ChatMessage {
                    role: "user".to_string(),
                    content: user_prompt,
                },
            ],
            max_tokens: 500,
            temperature: 0.3,
        };

        let response = self
            .client
            .post(format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(LlmError::ApiError(error_text));
        }

        let chat_response: ChatResponse = response.json().await?;
        
        chat_response
            .choices
            .first()
            .map(|c| c.message.content.clone())
            .ok_or_else(|| LlmError::ApiError("No response from LLM".to_string()))
    }

    /// Rank search results by relevance using LLM
    pub async fn rank_results(
        &self,
        query: &str,
        results: &mut [ProtocolSearchResult],
    ) -> Result<(), LlmError> {
        // For now, use simple keyword matching for ranking
        // In production, this could use embeddings or LLM-based ranking
        let query_lower = query.to_lowercase();
        let keywords: Vec<&str> = query_lower.split_whitespace().collect();

        for result in results.iter_mut() {
            let title_lower = result.protocol_title.to_lowercase();
            let content_lower = result.content.to_lowercase();
            
            let mut score = 0.0;
            
            for keyword in &keywords {
                // Title matches are worth more
                if title_lower.contains(keyword) {
                    score += 2.0;
                }
                // Content matches
                if content_lower.contains(keyword) {
                    score += 1.0;
                }
            }
            
            // Normalize score
            result.relevance_score = score / (keywords.len() as f64 * 3.0);
        }

        // Sort by relevance score descending
        results.sort_by(|a, b| {
            b.relevance_score
                .partial_cmp(&a.relevance_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        Ok(())
    }
}

impl Default for LlmClient {
    fn default() -> Self {
        Self::new().expect("Failed to create LLM client")
    }
}
