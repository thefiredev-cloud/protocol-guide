# Protocol Guide Data Collection & Privacy Documentation

> Last Updated: January 27, 2025

This document provides a comprehensive overview of all data collected, stored, and processed by Protocol Guide. This serves as internal documentation for compliance, audits, and enterprise sales.

## Table of Contents

1. [Data Collection Summary](#data-collection-summary)
2. [Personal Data](#personal-data)
3. [Usage Data](#usage-data)
4. [Technical Data](#technical-data)
5. [Third-Party Services](#third-party-services)
6. [Data Retention Schedule](#data-retention-schedule)
7. [Security Measures](#security-measures)
8. [Compliance Status](#compliance-status)

---

## Data Collection Summary

| Category | Data Type | Collected | Stored | Retention | Legal Basis |
|----------|-----------|-----------|--------|-----------|-------------|
| Account | Email, Name | Yes | Yes | Account lifetime + 30 days | Contract |
| Auth | Password hash, OAuth tokens | Yes | Yes | Account lifetime | Contract |
| Billing | Stripe Customer ID | Yes | Yes | 7 years | Legal obligation |
| Usage | Search queries | Yes | Yes | 30 days (then anonymized) | Legitimate interest |
| Usage | Protocol views | Yes | Yes | 30 days (then anonymized) | Legitimate interest |
| Device | OS, App version | Yes | Yes | 30 days | Legitimate interest |
| Device | Push tokens | Yes | Yes | Until unsubscribed | Consent |
| Cookies | Session cookies | Yes | Device only | Session | Contract |
| Cookies | Analytics cookies | With consent | Yes | 30 days | Consent |

---

## Personal Data

### Account Information

**Database Table:** `manus_users`

| Field | Type | Purpose | Required | Encrypted |
|-------|------|---------|----------|-----------|
| `id` | Integer | Primary key | Yes | No |
| `auth_id` | UUID | Supabase auth link | Yes | No |
| `email` | Text | Account identification, communication | Yes | No |
| `name` | Text | Display name | No | No |
| `login_method` | Text | OAuth provider tracking | No | No |
| `role` | Text | Access control (user/admin) | Yes | No |
| `tier` | Text | Subscription level | Yes | No |
| `created_at` | Timestamp | Audit trail | Yes | No |
| `updated_at` | Timestamp | Audit trail | Yes | No |
| `last_signed_in` | Timestamp | Security monitoring | No | No |

**Collection Method:** User registration, OAuth authentication  
**Legal Basis:** Contract performance  
**Data Subject Rights:** Access, rectification, deletion, portability

### Billing Information

**Database Table:** `manus_users` (billing fields)

| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `stripe_customer_id` | Text | Payment processing | Only for paid users |
| `subscription_id` | Text | Subscription management | Only for paid users |
| `subscription_status` | Text | Access control | Only for paid users |
| `subscription_end_date` | Timestamp | Billing cycle | Only for paid users |

**Note:** Credit card numbers are NEVER stored. All payment processing is handled by Stripe, Inc. with PCI DSS compliance.

---

## Usage Data

### Search History

**Database Table:** `queries`

| Field | Type | Purpose | Retention |
|-------|------|---------|-----------|
| `user_id` | Integer | Attribution | 30 days |
| `county_id` | Integer | Context | 30 days |
| `query_text` | Text | Search query | 30 days |
| `response_text` | Text | AI response | 30 days |
| `protocol_refs` | JSON | Matched protocols | 30 days |
| `created_at` | Timestamp | Analytics | 30 days |

**After 30 Days:** Individual queries are deleted. Aggregated statistics (query counts, popular topics) are retained for 2 years.

### Search History (Client-Side)

**Database Table:** `search_history`

| Field | Type | Purpose | Retention |
|-------|------|---------|-----------|
| `user_id` | Integer | User association | 30 days |
| `county_id` | Integer | Context | 30 days |
| `search_query` | Text | Display in history | 30 days |
| `results_count` | Integer | Analytics | 30 days |
| `created_at` | Timestamp | Ordering | 30 days |

### Bookmarks

**Database Table:** `bookmarks`

| Field | Type | Purpose | Retention |
|-------|------|---------|-----------|
| `user_id` | Integer | User association | Account lifetime |
| `protocol_number` | Text | Reference | Account lifetime |
| `protocol_title` | Text | Display | Account lifetime |
| `section` | Text | Deep link | Account lifetime |
| `content` | Text | Preview | Account lifetime |
| `agency_id` | Integer | Multi-agency support | Account lifetime |
| `created_at` | Timestamp | Ordering | Account lifetime |

### Analytics Events

**Storage:** Event queue (memory) → Server batch upload

| Event Type | Data Collected | Purpose |
|------------|---------------|---------|
| `screen_viewed` | Screen name, previous screen | Navigation analytics |
| `search_completed` | Query, results count, latency | Search optimization |
| `protocol_viewed` | Protocol ID, source, rank | Content analytics |
| `voice_search_completed` | Transcription time, word count | Feature usage |
| `upgrade_prompt_shown` | Location, trigger | Conversion tracking |
| `feature_used` | Feature name, user tier | Product analytics |
| `error_occurred` | Error type, context | Debugging |

**Note:** Analytics events are anonymized after 30 days. Individual user behavior is not tracked long-term.

---

## Technical Data

### Device Information

Collected automatically via the app:

| Data | Purpose | Sent to Server | Retention |
|------|---------|----------------|-----------|
| Device type | Analytics | Yes (anonymized) | 30 days |
| OS version | Compatibility | Yes | 30 days |
| App version | Support, updates | Yes | 30 days |
| Screen dimensions | Layout optimization | No | Session only |
| Locale/language | Localization | No | Session only |

### Session Information

| Data | Purpose | Storage | Retention |
|------|---------|---------|-----------|
| Session ID | Analytics correlation | Server | 30 days |
| Session start time | Usage patterns | Server | 30 days |
| IP address | Security, geolocation | Server | Anonymized after 30 days |

### Push Notification Tokens

**Database Table:** `push_tokens`

| Field | Type | Purpose | Retention |
|-------|------|---------|-----------|
| `user_id` | Integer | Targeting | Until opt-out |
| `token` | Text | Device identifier | Until opt-out |
| `platform` | Text | iOS/Android routing | Until opt-out |
| `last_used_at` | Timestamp | Cleanup | Until opt-out |

---

## Third-Party Services

### Stripe (Payment Processing)

| Data Shared | Purpose | Stripe's Retention |
|-------------|---------|-------------------|
| Email | Receipt delivery | Per Stripe policy |
| Subscription details | Billing | Per Stripe policy |
| Payment method | Processing | PCI DSS compliant |

**Privacy Policy:** https://stripe.com/privacy

### Supabase (Authentication & Database)

| Data Shared | Purpose | Location |
|-------------|---------|----------|
| User credentials | Authentication | US (AWS) |
| All database content | Storage | US (AWS) |

**Privacy Policy:** https://supabase.com/privacy

### Anthropic Claude (AI Search)

| Data Shared | Purpose | Retention |
|-------------|---------|-----------|
| Search queries | Natural language processing | Not retained for training |
| Protocol content (context) | Response generation | Not retained |

**Note:** Queries are sent via API with data retention disabled. Anthropic does not use API data for model training.

**Privacy Policy:** https://www.anthropic.com/privacy

### Voyage AI (Semantic Search)

| Data Shared | Purpose | Retention |
|-------------|---------|-----------|
| Search queries | Embedding generation | Real-time only |
| Protocol text | Index building | Real-time only |

**Note:** Voyage processes embeddings in real-time without storage.

### Sentry (Error Tracking)

| Data Shared | Purpose | Retention |
|-------------|---------|-----------|
| Error stack traces | Debugging | 90 days |
| Device/OS info | Context | 90 days |
| User ID (if logged in) | Support | 90 days |

**Note:** No search queries or PHI are sent to Sentry.

**Privacy Policy:** https://sentry.io/privacy/

---

## Data Retention Schedule

| Data Category | Active Retention | Archive Period | Deletion |
|---------------|-----------------|----------------|----------|
| Account data | Account lifetime | 30 days after deletion request | Permanent deletion |
| Search queries | 30 days | Anonymized aggregates: 2 years | Auto-delete |
| Billing records | 7 years | N/A | Per tax law |
| Analytics events | 30 days | Aggregates: 2 years | Auto-delete |
| Session data | 30 days | N/A | Auto-delete |
| Audit logs | 2 years | 5 years (enterprise) | Auto-delete |
| Disclaimer acknowledgments | Indefinite | N/A | Never deleted |
| Push tokens | Until opt-out | N/A | On unsubscribe |

### Deletion Procedures

1. **User-Initiated Deletion:**
   - User requests via settings or email
   - Account marked for deletion
   - 30-day grace period (reversible)
   - Permanent deletion after grace period
   - Anonymized analytics retained

2. **Automatic Cleanup:**
   - Daily job purges expired data
   - Search queries > 30 days → deleted or anonymized
   - Sessions > 30 days → deleted
   - Orphaned records → cleaned weekly

---

## Security Measures

### Data Protection

| Measure | Implementation |
|---------|---------------|
| Encryption in transit | TLS 1.3 for all connections |
| Encryption at rest | AES-256 via Supabase |
| Database security | Row-level security policies |
| Password hashing | bcrypt with salt (via Supabase Auth) |
| API authentication | JWT tokens with expiration |

### Access Controls

| Control | Implementation |
|---------|---------------|
| Role-based access | User/Admin roles in database |
| Least privilege | Minimal permissions for services |
| Audit logging | All admin actions logged |
| Employee access | Restricted to engineering team |

### Monitoring

| Monitor | Purpose |
|---------|---------|
| Sentry | Error tracking and alerting |
| Railway metrics | Performance and uptime |
| Supabase dashboard | Database health |
| Stripe webhooks | Payment event tracking |

---

## Compliance Status

### GDPR (EU/EEA/UK)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Legal basis documentation | ✅ | Contract, consent, legitimate interest |
| Privacy policy | ✅ | Comprehensive, accessible |
| Data subject rights | ✅ | Access, rectification, deletion, portability |
| Consent management | ✅ | Cookie consent banner |
| Data processing records | ✅ | This document |
| International transfers | ✅ | Standard Contractual Clauses |
| DPO designation | ⚠️ | Not required (< threshold) |

### CCPA/CPRA (California)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Privacy policy disclosures | ✅ | Categories, purposes, rights |
| Right to know | ✅ | Data access request process |
| Right to delete | ✅ | Deletion request process |
| Right to correct | ✅ | Via account settings |
| Right to opt-out of sale | ✅ | We do not sell data |
| Non-discrimination | ✅ | No penalties for exercising rights |

### HIPAA

| Item | Status | Notes |
|------|--------|-------|
| Covered entity status | N/A | Protocol Guide is NOT a covered entity |
| PHI collection | ❌ | We do NOT collect PHI |
| BAA requirements | N/A | Not applicable |
| PHI safeguards | N/A | System designed to reject PHI input |

**Important:** Protocol Guide is a reference tool and does not create, receive, maintain, or transmit Protected Health Information (PHI). Users are instructed not to enter patient-identifiable information.

---

## Data Flow Diagram

```
User Device                    Protocol Guide Backend              Third Parties
─────────────                  ─────────────────────              ─────────────

[App/PWA] ──────────────────► [Railway API Server]
    │                                │
    │ Auth                           │
    └───────────────────────────────►[Supabase Auth] ◄──────────► Google/Apple OAuth
                                     │
    │ Search Query                   │
    └───────────────────────────────►[Search Handler]
                                     │
                                     ├──► [Voyage AI] → Embeddings
                                     │         ↓
                                     ├──► [Vector DB] → Similar chunks
                                     │         ↓
                                     └──► [Claude API] → Response
                                              │
                                              ▼
    [Display Results] ◄──────────────────────┘

    │ Payment                        
    └───────────────────────────────►[Stripe API] → Payment processing

    │ Errors                         
    └───────────────────────────────►[Sentry] → Error tracking
```

---

## Contact Information

**Data Protection Inquiries:**  
Email: privacy@protocol-guide.com

**Security Incidents:**  
Email: security@protocol-guide.com

**Enterprise/Compliance:**  
Email: sales@protocol-guide.com

---

*This document is maintained by the Protocol Guide engineering team and reviewed quarterly for accuracy.*
