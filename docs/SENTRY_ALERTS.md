# Sentry Alerts Configuration Guide

This document outlines the recommended Sentry alert configuration for Protocol Guide production monitoring.

## Prerequisites

1. Create a Sentry account at https://sentry.io
2. Create a new project for Protocol Guide (Node.js)
3. Get your DSN from Project Settings > Client Keys (DSN)
4. Set `SENTRY_DSN` environment variable in production

## Environment Setup

```bash
# Production .env
SENTRY_DSN=https://your-key@o12345.ingest.sentry.io/67890
```

## Recommended Alert Rules

### 1. Critical Error Spike Alert

Triggers when there's a sudden increase in errors, indicating a potential incident.

**Settings:**
- **Name:** Critical Error Spike
- **Environment:** production
- **Trigger:** When error count increases by 300% in 10 minutes compared to the previous hour
- **Action:** Send to PagerDuty/Slack/Email (high priority)
- **Filter:** Exclude rate limit errors

```json
{
  "name": "Critical Error Spike",
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyPercentCondition",
      "interval": "10m",
      "comparisonInterval": "1h",
      "value": 300
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.tagged_event.TaggedEventFilter",
      "key": "code",
      "match": "ne",
      "value": "rate_limit"
    }
  ],
  "actions": [
    {
      "id": "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
      "channel": "#alerts-critical"
    }
  ]
}
```

### 2. Database Connectivity Alert

Triggers when database connection errors occur, indicating infrastructure issues.

**Settings:**
- **Name:** Database Connectivity Issues
- **Environment:** production
- **Trigger:** When an error contains "database" or "ECONNREFUSED" in the message
- **Action:** Send to infrastructure channel
- **Threshold:** More than 5 occurrences in 5 minutes

```json
{
  "name": "Database Connectivity Issues",
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
      "interval": "5m",
      "value": 5
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.issue_occurrences.IssueOccurrencesFilter",
      "value": 5
    },
    {
      "id": "sentry.rules.filters.tagged_event.TaggedEventFilter",
      "key": "error.type",
      "match": "co",
      "value": "database"
    }
  ]
}
```

### 3. AI Service Degradation Alert

Triggers when Claude/Voyage APIs are having issues.

**Settings:**
- **Name:** AI Service Degradation
- **Environment:** production
- **Trigger:** Errors with code CLAUDE_* or VOYAGE_*
- **Action:** Send to engineering channel
- **Threshold:** More than 10 occurrences in 10 minutes

```json
{
  "name": "AI Service Degradation",
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
      "interval": "10m",
      "value": 10
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.tagged_event.TaggedEventFilter",
      "key": "code",
      "match": "sw",
      "value": "CLAUDE_"
    }
  ]
}
```

### 4. Authentication Failures Alert

Monitors for potential security issues or auth system problems.

**Settings:**
- **Name:** Authentication Failures
- **Environment:** production
- **Trigger:** High volume of 401/403 errors
- **Action:** Send to security channel
- **Threshold:** More than 50 occurrences in 15 minutes (could indicate attack)

### 5. High Latency Alert

Triggers when response times exceed acceptable thresholds.

**Settings:**
- **Name:** High Latency Detected
- **Environment:** production
- **Trigger:** Average transaction duration > 5 seconds
- **Action:** Send to performance channel

## Alert Channels Setup

### Slack Integration

1. Go to Sentry > Settings > Integrations > Slack
2. Connect your Slack workspace
3. Create channels:
   - `#alerts-critical` - PagerDuty integration for on-call
   - `#alerts-engineering` - Engineering team notifications
   - `#alerts-security` - Security-related alerts

### PagerDuty Integration

1. Go to Sentry > Settings > Integrations > PagerDuty
2. Connect your PagerDuty account
3. Map Sentry projects to PagerDuty services
4. Set escalation policies for critical alerts

### Email Notifications

1. Go to Sentry > Settings > Integrations > Email
2. Configure email addresses for different alert severities
3. Set up digest emails for non-critical issues

## Performance Monitoring

Enable performance monitoring to track:

- API response times
- Database query performance
- External API latency (Claude, Voyage)

```typescript
// Already configured in server/_core/sentry.ts
tracesSampleRate: ENV.isProduction ? 0.1 : 1.0,
```

## Custom Tags for Better Filtering

Protocol Guide automatically adds these tags to errors:

| Tag | Description | Example Values |
|-----|-------------|----------------|
| `section` | App section where error occurred | search, voice, protocol_viewer |
| `platform` | Client platform | web, ios, android |
| `tier` | User subscription tier | free, pro, premium |
| `code` | Error code | CLAUDE_RATE_LIMITED, VOYAGE_TIMEOUT |

## Recommended Dashboard Widgets

Create a Sentry dashboard with:

1. **Error Rate Over Time** - Line chart showing error count
2. **Top Issues** - Table of most frequent errors
3. **User Impact** - Number of users affected
4. **Service Health** - Circuit breaker states
5. **Response Times** - P50, P95, P99 latencies

## Alert Response Runbook

### Critical Error Spike

1. Check `/api/health` endpoint for service status
2. Check `/api/resilience` for circuit breaker states
3. Review recent deployments
4. Check external service status (Supabase, Claude, Voyage)

### Database Issues

1. Check Supabase status page
2. Verify connection pool status
3. Check for slow queries in Supabase dashboard
4. Review circuit breaker state for database

### AI Service Issues

1. Check Anthropic/Voyage status pages
2. Verify API keys are valid
3. Check rate limit headers in responses
4. Consider enabling fallback responses

## Testing Alerts

To test that alerts are working:

```typescript
// In development, temporarily enable error reporting:
// EXPO_PUBLIC_REPORT_DEV_ERRORS=true

// Then trigger a test error:
captureMessage('Test alert - please ignore', 'error');
```

## Maintenance Mode

During planned maintenance:

1. Set up a maintenance window in Sentry
2. Temporarily mute non-critical alerts
3. Update status page
4. Re-enable alerts after maintenance

---

For questions about Sentry configuration, contact the Platform team.
