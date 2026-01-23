# Protocol Guide Analytics Strategy

## Executive Summary

This document outlines a comprehensive analytics strategy for Protocol Guide to track search behavior, feature adoption, user retention, and protocol usage patterns. The goal is to inform product decisions and business strategy for serving EMS professionals.

---

## 1. Data Architecture

### 1.1 Current State

Protocol Guide currently tracks:
- **User queries**: `queries` table with queryText, responseText, protocolRefs
- **Search history**: `searchHistory` table for Pro users with cloud sync
- **Integration logs**: `integrationLogs` table for partner tracking (ImageTrend, ESOS, Zoll)
- **Audit logs**: `auditLogs` table for admin actions
- **User data**: `users` table with tier, queryCountToday, lastSignedIn, createdAt

### 1.2 Proposed New Tables

#### Analytics Events Table
```sql
CREATE TABLE analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,                          -- NULL for anonymous events
  sessionId VARCHAR(64) NOT NULL,           -- Client-generated session ID
  eventType VARCHAR(50) NOT NULL,           -- Event category
  eventName VARCHAR(100) NOT NULL,          -- Specific event
  properties JSON,                          -- Event-specific data
  deviceType VARCHAR(20),                   -- 'ios', 'android', 'web', 'pwa'
  appVersion VARCHAR(20),                   -- App version for tracking rollouts
  osVersion VARCHAR(20),
  screenName VARCHAR(100),                  -- Current screen/route
  referrer VARCHAR(255),                    -- For web/deep links
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (eventType),
  INDEX idx_user_id (userId),
  INDEX idx_timestamp (timestamp),
  INDEX idx_session (sessionId)
);
```

#### Search Analytics Table
```sql
CREATE TABLE search_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  sessionId VARCHAR(64) NOT NULL,
  queryText VARCHAR(500) NOT NULL,
  queryTokenCount INT,                      -- For query complexity analysis
  stateFilter VARCHAR(2),
  agencyId INT,
  resultsCount INT NOT NULL,
  topResultProtocolId INT,
  topResultScore FLOAT,
  selectedResultRank INT,                   -- Which result user clicked (1-indexed)
  selectedProtocolId INT,
  timeToFirstResult INT,                    -- Milliseconds
  totalSearchTime INT,                      -- Milliseconds for full search
  searchMethod VARCHAR(20),                 -- 'text', 'voice', 'example_click'
  isVoiceQuery BOOLEAN DEFAULT FALSE,
  voiceTranscriptionTime INT,               -- Ms for voice to text
  noResultsFound BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_search (userId, timestamp),
  INDEX idx_no_results (noResultsFound, timestamp),
  INDEX idx_state (stateFilter)
);
```

#### Protocol Access Logs Table
```sql
CREATE TABLE protocol_access_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  sessionId VARCHAR(64),
  protocolChunkId INT NOT NULL,
  protocolNumber VARCHAR(50),
  protocolTitle VARCHAR(255),
  agencyId INT,
  stateCode VARCHAR(2),
  accessSource VARCHAR(50),                 -- 'search', 'history', 'bookmark', 'deep_link'
  timeSpentSeconds INT,                     -- How long user viewed protocol
  scrollDepth FLOAT,                        -- 0-1, how far user scrolled
  copiedContent BOOLEAN DEFAULT FALSE,
  sharedProtocol BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_protocol (protocolChunkId),
  INDEX idx_user_access (userId, timestamp),
  INDEX idx_state (stateCode)
);
```

#### Session Analytics Table
```sql
CREATE TABLE session_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  sessionId VARCHAR(64) NOT NULL UNIQUE,
  deviceType VARCHAR(20),
  appVersion VARCHAR(20),
  startTime TIMESTAMP NOT NULL,
  endTime TIMESTAMP,
  durationSeconds INT,
  searchCount INT DEFAULT 0,
  protocolsViewed INT DEFAULT 0,
  queriesSubmitted INT DEFAULT 0,          -- AI-powered queries
  screenTransitions INT DEFAULT 0,
  isNewUser BOOLEAN DEFAULT FALSE,
  userTier VARCHAR(20),
  referralSource VARCHAR(100),
  INDEX idx_user_session (userId),
  INDEX idx_start (startTime)
);
```

#### Daily Aggregates Table (for performance)
```sql
CREATE TABLE daily_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL,         -- 'dau', 'searches', 'conversions', etc.
  dimension VARCHAR(100),                   -- State, tier, device, etc.
  dimension_value VARCHAR(100),
  count INT DEFAULT 0,
  sum_value DECIMAL(15,2),
  avg_value DECIMAL(15,4),
  p50_value DECIMAL(15,4),
  p95_value DECIMAL(15,4),
  UNIQUE KEY unique_daily (date, metric_type, dimension, dimension_value),
  INDEX idx_date (date),
  INDEX idx_metric (metric_type)
);
```

---

## 2. Event Tracking Specification

### 2.1 Search Events

| Event Name | Properties | Purpose |
|------------|------------|---------|
| `search_initiated` | query, method, stateFilter, agencyId | Track search attempts |
| `search_completed` | query, resultsCount, latencyMs, topScore | Measure search performance |
| `search_result_clicked` | resultRank, protocolId, relevanceScore | Understand result quality |
| `search_no_results` | query, stateFilter | Identify content gaps |
| `voice_search_started` | - | Voice feature adoption |
| `voice_transcription_complete` | transcriptionTimeMs, confidence | Voice quality metrics |
| `example_search_clicked` | exampleQuery | Popular starting points |

### 2.2 Protocol Events

| Event Name | Properties | Purpose |
|------------|------------|---------|
| `protocol_viewed` | protocolId, protocolNumber, source | Protocol popularity |
| `protocol_scroll_depth` | protocolId, depth (0-1) | Content engagement |
| `protocol_time_spent` | protocolId, seconds | Engagement depth |
| `protocol_content_copied` | protocolId, contentLength | Clinical utility |
| `protocol_shared` | protocolId, shareMethod | Viral behavior |
| `protocol_feedback_submitted` | protocolId, feedbackType | Quality issues |

### 2.3 User Journey Events

| Event Name | Properties | Purpose |
|------------|------------|---------|
| `app_opened` | source, isFirstOpen | Acquisition tracking |
| `session_started` | isReturning, daysSinceLastSession | Retention |
| `onboarding_step_completed` | stepNumber, stepName | Funnel analysis |
| `county_selected` | countyId, stateName | Geographic distribution |
| `feature_discovered` | featureName | Feature awareness |
| `upgrade_prompt_shown` | promptLocation, userTier | Conversion opportunities |
| `upgrade_initiated` | plan, promptLocation | Conversion tracking |
| `subscription_completed` | plan, amount, isAnnual | Revenue tracking |

### 2.4 Feature Usage Events

| Event Name | Properties | Purpose |
|------------|------------|---------|
| `ai_query_submitted` | queryLength, hasContext | AI feature adoption |
| `ai_query_completed` | model, latencyMs, tokensUsed | AI performance |
| `history_viewed` | - | History feature usage |
| `history_item_rerun` | queryId | Repeated query patterns |
| `settings_changed` | settingName, newValue | Preference tracking |
| `offline_mode_activated` | - | PWA adoption |

---

## 3. Key Metrics & KPIs

### 3.1 Usage Metrics

| Metric | Definition | Target | Alert Threshold |
|--------|------------|--------|-----------------|
| **DAU** | Unique users per day | Growth 5%+ WoW | <30% drop |
| **WAU** | Unique users per week | - | <20% drop |
| **MAU** | Unique users per month | - | - |
| **DAU/MAU Ratio** | Stickiness | >15% | <10% |
| **Sessions/User/Day** | Usage intensity | >2 | <1 |
| **Avg Session Duration** | Engagement | >3 min | <1 min |

### 3.2 Search Metrics

| Metric | Definition | Target | Alert Threshold |
|--------|------------|--------|-----------------|
| **Searches/User/Day** | Search intensity | >3 | - |
| **Search Success Rate** | Searches with results | >95% | <90% |
| **Click-Through Rate** | Searches with result click | >60% | <40% |
| **Time to First Result** | P50 latency | <200ms | >500ms |
| **P95 Search Latency** | Tail latency | <500ms | >1000ms |
| **Voice Search Adoption** | % searches via voice | >10% | - |
| **Zero Results Rate** | Searches with no results | <5% | >10% |

### 3.3 Protocol Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Protocol Views/Day** | Content consumption | Growth |
| **Unique Protocols Viewed** | Content breadth | - |
| **Avg Time on Protocol** | Content depth | >30s |
| **Protocol Copy Rate** | Clinical utility | - |
| **Most Searched Terms** | Content demand | - |
| **Protocol Coverage Gaps** | Failed searches by topic | Minimize |

### 3.4 Retention Metrics

| Metric | Definition | Target | Alert Threshold |
|--------|------------|--------|-----------------|
| **D1 Retention** | Return next day | >40% | <30% |
| **D7 Retention** | Return within week | >30% | <20% |
| **D30 Retention** | Return within month | >20% | <10% |
| **Churn Rate** | Users lost per month | <10% | >20% |
| **Reactivation Rate** | Churned users returning | >5% | - |

### 3.5 Revenue Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Conversion Rate** | Free to Pro | >5% |
| **MRR** | Monthly recurring revenue | Growth |
| **ARPU** | Avg revenue per user | $X |
| **LTV** | Lifetime value | 12x monthly |
| **LTV:CAC Ratio** | Unit economics | >3:1 |
| **Trial to Paid** | Conversion after trial | >30% |

---

## 4. Dashboard Requirements

### 4.1 Executive Dashboard (Daily)

**Purpose**: High-level business health at a glance

**Widgets**:
1. **KPI Summary Cards**
   - DAU with 7-day trend
   - Total searches today
   - Active Pro subscribers
   - Revenue (MTD)

2. **User Trend Chart**
   - DAU/WAU/MAU over 30 days
   - Stacked by user tier

3. **Search Volume Chart**
   - Hourly search volume
   - Overlay: previous week

4. **Conversion Funnel**
   - Visitors > Signups > Active > Pro

5. **Alert Panel**
   - Critical metrics below threshold
   - Anomaly detection alerts

### 4.2 Product Dashboard

**Purpose**: Feature adoption and user behavior analysis

**Widgets**:
1. **Feature Usage Heatmap**
   - Grid of features x time
   - Color by usage intensity

2. **Search Behavior**
   - Top 20 search terms (real-time)
   - Zero-result queries
   - Voice vs text ratio

3. **Protocol Popularity**
   - Most viewed protocols (24h)
   - By state/certification level
   - Trending protocols

4. **User Journey Sankey**
   - Flow from entry to conversion
   - Drop-off points

5. **Onboarding Completion**
   - Step-by-step funnel
   - Time to complete

### 4.3 Search Quality Dashboard

**Purpose**: Monitor and improve search experience

**Widgets**:
1. **Search Performance**
   - P50/P95 latency (real-time)
   - Success rate
   - Error rate

2. **Query Analysis**
   - Query length distribution
   - Common query patterns
   - Failed query clustering

3. **Result Quality**
   - Click position distribution
   - Avg relevance score of clicked results
   - Search refinement rate

4. **Content Gaps**
   - Zero-result queries grouped by topic
   - Frequently searched missing protocols
   - Geographic coverage gaps

5. **Voice Search**
   - Transcription accuracy
   - Voice-to-text latency
   - Voice search success rate

### 4.4 Retention Dashboard

**Purpose**: Understand and improve user retention

**Widgets**:
1. **Retention Curves**
   - D1/D7/D30 over time
   - By cohort
   - By acquisition source

2. **Cohort Analysis Table**
   - Weekly cohorts
   - Retention by week since signup

3. **Churn Indicators**
   - Users at risk (declining activity)
   - Days since last session distribution
   - Churn prediction score

4. **Engagement Segments**
   - Power users (daily)
   - Regular (weekly)
   - Casual (monthly)
   - Dormant (30+ days)

5. **Reactivation**
   - Win-back campaign performance
   - Push notification effectiveness

### 4.5 Revenue Dashboard

**Purpose**: Track subscription business health

**Widgets**:
1. **Revenue Metrics**
   - MRR with trend
   - New MRR / Expansion / Churn
   - ARPU by tier

2. **Conversion Analysis**
   - Upgrade rate by trigger point
   - Time to conversion distribution
   - Upgrade path (monthly vs annual)

3. **Subscription Health**
   - Active subscriptions by tier
   - Payment failure rate
   - Subscription age distribution

4. **LTV Analysis**
   - LTV by acquisition channel
   - LTV by user segment
   - Predicted LTV for active users

---

## 5. EMS-Specific Analytics

### 5.1 Certification Level Analysis

Track usage patterns by EMS certification:
- **EMT-Basic**: Most searched protocols, common queries
- **AEMT**: Advanced procedures, medication protocols
- **Paramedic**: Complex scenarios, drug calculations
- **Medical Director**: Protocol review, updates

**Implementation**: Add `certificationLevel` to user profile and join with events.

### 5.2 Shift Pattern Analysis

EMS professionals work varied shifts (12-hr, 24-hr, rotating):

| Time Window | Expected Behavior |
|-------------|-------------------|
| 06:00-18:00 | Day shift - steady usage |
| 18:00-06:00 | Night shift - critical lookups |
| Shift change | Quick reference peaks |

**Metrics to track**:
- Peak usage hours by day of week
- Query urgency indicators (short sessions, quick searches)
- After-hours usage patterns

### 5.3 Geographic Distribution

| Dimension | Purpose |
|-----------|---------|
| State | Regional protocol differences |
| Urban/Rural | Different protocol needs |
| Agency size | Feature adoption patterns |
| Protocol version | Currency of local protocols |

### 5.4 Clinical Scenario Tracking

Group queries by clinical category:
- Cardiac (STEMI, arrest, arrhythmia)
- Respiratory (asthma, COPD, anaphylaxis)
- Trauma (burns, bleeding, spinal)
- Pediatric (dosing, specific conditions)
- OB/GYN (labor, eclampsia)
- Behavioral (agitation, overdose)
- Medical (stroke, diabetes, seizure)

**Use cases**:
- Content gap analysis by category
- Protocol completeness scoring
- Training/education opportunities

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

1. **Create new database tables**
   - analytics_events
   - search_analytics
   - daily_metrics

2. **Implement client-side tracking**
   - Session management
   - Event batching
   - Offline queue for PWA

3. **Build ingestion pipeline**
   - API endpoint for events
   - Batch processing job
   - Daily aggregation cron

### Phase 2: Core Dashboards (Weeks 3-4)

1. **Executive Dashboard**
   - KPI cards
   - Trend charts
   - Alert system

2. **Search Quality Dashboard**
   - Latency monitoring
   - Zero-result tracking
   - Query analysis

### Phase 3: Advanced Analytics (Weeks 5-6)

1. **Retention Dashboard**
   - Cohort analysis
   - Churn prediction
   - Engagement segments

2. **Protocol Analytics**
   - Popularity tracking
   - Content gap analysis
   - Geographic coverage

### Phase 4: Revenue & Business (Weeks 7-8)

1. **Revenue Dashboard**
   - MRR tracking
   - Conversion funnels
   - LTV analysis

2. **Automated Reporting**
   - Daily email digests
   - Weekly business reviews
   - Monthly board reports

---

## 7. Data Privacy & Compliance

### 7.1 HIPAA Considerations

Protocol Guide does not store PHI, but search queries could contain clinical information:

| Data Type | Treatment |
|-----------|-----------|
| Search queries | Aggregate only, no individual linking |
| Protocol views | Anonymized after 90 days |
| User demographics | Aggregated for reporting |

### 7.2 Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| Raw events | 90 days |
| Aggregated metrics | 3 years |
| User-level analytics | Until account deletion |
| Session data | 30 days |

### 7.3 User Consent

- Analytics tracking disclosed in privacy policy
- Optional analytics opt-out in settings
- No third-party analytics sharing

---

## 8. Technical Architecture

### 8.1 Event Flow

```
[Mobile/Web Client]
        |
        v
  [Event Queue]  -----> [Local Storage (PWA)]
        |
        v
  [API Gateway]
        |
        v
  [Event Ingestion Service]
        |
   +----+----+
   |         |
   v         v
[TiDB]   [Real-time Stream]
   |              |
   v              v
[Daily Agg]  [Dashboards]
```

### 8.2 Client SDK Interface

```typescript
// lib/analytics.ts

interface AnalyticsEvent {
  eventType: string;
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

class Analytics {
  private sessionId: string;
  private eventQueue: AnalyticsEvent[];

  // Core methods
  track(eventName: string, properties?: Record<string, unknown>): void;
  identify(userId: number, traits?: Record<string, unknown>): void;
  screen(screenName: string): void;

  // Specialized methods
  trackSearch(query: string, results: number, latencyMs: number): void;
  trackProtocolView(protocolId: number, source: string): void;
  trackConversion(plan: string, source: string): void;

  // Session management
  startSession(): void;
  endSession(): void;

  // Queue management
  flush(): Promise<void>;
}
```

### 8.3 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analytics/events` | POST | Batch event ingestion |
| `/api/analytics/session` | POST | Session start/end |
| `/api/analytics/identify` | POST | User identification |

---

## 9. Alerts & Anomaly Detection

### 9.1 Critical Alerts (Immediate)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| DAU drops >30% | vs same day last week | Page on-call |
| Search errors >5% | 5-minute window | Alert engineering |
| P95 latency >1s | 5-minute window | Alert engineering |
| Payment failures >10% | Daily | Alert finance |

### 9.2 Warning Alerts (4-hour response)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Retention drop >15% | WoW | Notify product |
| Zero-result rate >10% | Daily | Notify content |
| Conversion drop >20% | WoW | Notify growth |

### 9.3 Anomaly Detection

Implement statistical anomaly detection for:
- Search volume (seasonal adjustment)
- User registrations
- Error rates
- Revenue metrics

---

## 10. Success Criteria

### 10.1 Phase 1 Success (Month 1)

- [ ] All core events tracked (>95% coverage)
- [ ] Executive dashboard live
- [ ] Daily email reports automated
- [ ] P95 latency monitoring accurate

### 10.2 Phase 2 Success (Month 2)

- [ ] Search quality dashboard complete
- [ ] Content gap reports generated weekly
- [ ] Retention cohorts tracked
- [ ] Anomaly detection active

### 10.3 Phase 3 Success (Month 3)

- [ ] Revenue dashboard live
- [ ] LTV predictions accurate (within 20%)
- [ ] Churn prediction model trained
- [ ] Full product coverage analytics

---

## Appendix A: Sample Queries

### Daily Active Users
```sql
SELECT DATE(timestamp) as date, COUNT(DISTINCT userId) as dau
FROM analytics_events
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(timestamp)
ORDER BY date;
```

### Top Searched Terms
```sql
SELECT queryText, COUNT(*) as count,
       AVG(resultsCount) as avg_results,
       SUM(CASE WHEN noResultsFound THEN 1 ELSE 0 END) as zero_results
FROM search_analytics
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY queryText
ORDER BY count DESC
LIMIT 50;
```

### Retention Cohort
```sql
SELECT
  DATE_FORMAT(u.createdAt, '%Y-%m') as cohort,
  COUNT(DISTINCT u.id) as cohort_size,
  COUNT(DISTINCT CASE WHEN e.timestamp >= u.createdAt + INTERVAL 7 DAY THEN u.id END) as retained_d7,
  COUNT(DISTINCT CASE WHEN e.timestamp >= u.createdAt + INTERVAL 30 DAY THEN u.id END) as retained_d30
FROM users u
LEFT JOIN analytics_events e ON u.id = e.userId
WHERE u.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY cohort
ORDER BY cohort;
```

### Protocol Popularity by State
```sql
SELECT stateCode, protocolNumber, protocolTitle, COUNT(*) as views
FROM protocol_access_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY stateCode, protocolNumber, protocolTitle
ORDER BY stateCode, views DESC;
```

---

## Appendix B: Dashboard Mockup Specifications

See `/docs/designs/analytics-dashboards/` for Figma links and wireframes.

---

*Document Version: 1.0*
*Last Updated: 2026-01-22*
*Author: Analytics Reporter Agent*
