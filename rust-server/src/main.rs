mod db;
mod middleware;
mod models;
mod routes;
mod services;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use std::env;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables from parent directory
    dotenvy::from_path("../.env").ok();
    dotenvy::dotenv().ok();

    // Initialize logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "protocol_guide_server=debug,actix_web=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting Protocol Guide Rust Server");

    // Create database pool
    let pool = db::create_pool()
        .await
        .expect("Failed to create database pool");

    // Create LLM client
    let llm_client = services::llm::LlmClient::new()
        .expect("Failed to create LLM client");

    // Get server configuration
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse()
        .expect("PORT must be a number");

    tracing::info!("Server listening on {}:{}", host, port);

    // Start HTTP server
    HttpServer::new(move || {
        // Configure CORS
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(actix_web::middleware::Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(llm_client.clone()))
            // Health routes (no prefix)
            .route("/health", web::get().to(routes::health::health))
            .route("/ready", web::get().to(routes::health::ready))
            // Search routes
            .service(
                web::scope("/api/search")
                    .route("", web::get().to(routes::search::semantic_search))
                    .route("/stats", web::get().to(routes::search::get_stats))
                    .route("/county/{id}", web::get().to(routes::search::get_by_county))
            )
            // Counties routes
            .service(
                web::scope("/api/counties")
                    .route("", web::get().to(routes::counties::get_all))
                    .route("/states", web::get().to(routes::counties::get_states))
                    .route("/by-state", web::get().to(routes::counties::get_agencies_by_state))
                    .route("/{id}", web::get().to(routes::counties::get_by_id))
            )
            // Users routes
            .service(
                web::scope("/api/users")
                    .route("/me", web::get().to(routes::users::get_me))
                    .route("/history", web::get().to(routes::users::get_history))
                    .route("/county", web::put().to(routes::users::update_selected_county))
            )
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}
