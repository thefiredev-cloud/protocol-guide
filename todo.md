# Protocol Guide - TODO

## Protocol Database Population
- [ ] Add OB/GYN protocols (childbirth, complications) - Future
- [ ] Add environmental protocols (heat/cold emergencies, drowning) - Future
- [ ] Add medication reference protocols (drug dosages, contraindications) - Future

## UX Enhancements for Field Use
- [ ] Add query history tab for recent searches

## Pricing & Tier Updates
- [ ] Implement county restriction (Free: 1 county, Pro: all)
- [ ] Implement offline access restriction (Pro only)
- [ ] Implement bookmark limits (Free: 5, Pro: unlimited)

## Remaining California LEMSAs Scraping
- [ ] Scrape El Dorado County EMS Agency protocols (partial - download issues)
- [ ] Scrape Solano County EMS Agency protocols (failed - app-only access)
- [ ] Scrape Mountain Counties EMS Agency protocols (failed - download links broken)

## Consolidated Homepage Redesign
- [ ] Add agency filter API endpoint that returns agencies for a selected state
- [ ] Redesign homepage with consolidated state/agency/search in minimalist layout
- [ ] Remove separate Search tab and update navigation
- [ ] Test the new consolidated homepage flow

## Manual Protocol PDF Downloads (High-Priority Counties)
- [ ] Find and download Contra Costa County EMS protocols PDF
- [ ] Find and download Riverside County EMS protocols PDF (currently has 406 protocols but may need update)
- [ ] Find and download San Joaquin County EMS protocols PDF
- [ ] Extract protocol content from downloaded PDFs
- [ ] Import extracted protocols into database

## Comprehensive California EMS Protocol Database
- [ ] Audit current database structure and identify optimization needs
- [ ] Review California coverage gaps - identify agencies with missing/incomplete protocols
- [ ] Compile complete list of all 33 California LEMSAs
- [ ] Identify all sub-agencies under each LEMSA
- [ ] Scrape ALL protocols from each LEMSA (not just summaries)
- [ ] Verify data completeness for each agency
- [ ] Ensure proper categorization (Cardiac, Trauma, Medical, Pediatric, OB, Environmental, etc.)
- [ ] Validate protocol numbers, titles, and content accuracy
- [ ] Import all verified protocols with proper metadata
- [ ] Run comprehensive data integrity tests

## NATIONAL EMS PROTOCOL COVERAGE - ImageTrend Partnership
- [ ] Run comprehensive data integrity tests

## California Database Polish (All 33 LEMSAs)
- [ ] Audit all California agencies and protocol counts
- [ ] Identify the official 33 LEMSAs and map to database entries
- [ ] Standardize agency naming convention (LEMSA name format)
- [ ] Remove duplicate or incorrectly categorized entries
- [ ] Ensure each LEMSA has complete protocol coverage (Cardiac, Trauma, Medical, Pediatric, OB, Environmental)
- [ ] Fill gaps for LEMSAs with missing protocols
- [ ] Verify protocol categorization (section field)
- [ ] Verify protocol numbering consistency
- [ ] Run data integrity tests

## Rust Backend Migration
- [ ] Set up Rust project structure with Cargo
- [ ] Add dependencies (actix-web, sqlx, serde, tokio, reqwest)
- [ ] Create database models matching existing MySQL schema
- [ ] Implement database connection pool
- [ ] Convert search API routes to Rust
- [ ] Convert authentication middleware to Rust
- [ ] Convert user/subscription routes to Rust
- [ ] Implement LLM client for semantic search
- [ ] Update frontend API client to connect to Rust server
- [ ] Test all endpoints and verify functionality
- [ ] Performance benchmarking vs TypeScript version

## Update Tests for REST API
- [ ] Review all test files and identify tRPC endpoints
- [ ] Update state-filter.test.ts to use REST API
- [ ] Update agency-filter.test.ts to use REST API
- [ ] Update search.test.ts to use REST API
- [ ] Update any other test files to use REST API
- [ ] Run all tests and verify they pass

## Fix Coverage Screen for Rust API
- [ ] Investigate why Coverage screen shows no data
- [ ] Update Coverage screen to use Rust REST API endpoints
- [ ] Test and verify the fix

## App Store Readiness - Authentication & Database
- [ ] Add Apple Sign-In support for iOS App Store compliance
- [ ] Verify Supabase database integration with Rust server
- [ ] Test user data storage and retrieval

## Parallel Improvements
- [ ] Add offline mode indicator banner
- [ ] Add recent searches feature on home screen
- [ ] Add voice input for faster protocol queries
- [ ] Add favorites/bookmarks for protocols
- [ ] Improve search results with agency name display

## App Store Readiness - Authentication & Database (Jan 2026)
- [ ] Add voice input capability (requires expo-speech-recognition)

## Features Needing Device Testing
- [ ] Apple Sign-In (iOS only)
- [ ] Google Sign-In (OAuth flow)
- [ ] Offline mode banner (network detection)
- [ ] Haptic feedback (native only)
- [ ] Share sheet (native only)

## Not Implemented
- [ ] Voice input (requires expo-speech-recognition)
- [ ] Push notifications
- [ ] Protocol PDF viewer
- [ ] Search history cloud sync

## Bug Fix - 404 Fetch Error on States (Jan 17, 2026)
- [ ] Diagnose 404 error on state reflections
- [ ] Fix API endpoint or server configuration
- [ ] Test and verify the fix
