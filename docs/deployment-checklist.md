# Deployment Checklist - LA County Fire Medic Bot

**Version**: 2.0.0
**Last Updated**: January 2025
**Classification**: Internal Use - LA County Fire Department

---

## Overview

This simplified deployment checklist covers pre-deployment validation, deployment procedures, and post-deployment verification for the LA County Fire Medic Bot. Designed for the current zero-authentication, public access model.

---

## Phase 1: Pilot Program (Months 1-3)

### Month 1: Foundation & Setup

#### Week 1: Pre-Deployment Planning

**Executive Approvals**:
- [ ] Fire Chief sign-off on executive summary
- [ ] Assistant Chiefs briefed on pilot program
- [ ] Medical Director approval obtained
- [ ] IT Security Officer clearance received
- [ ] Budget allocation confirmed: $50,000 Phase 1

**Medical Validation Preparation**:
- [ ] Medical Director reviews 100 validation scenarios
- [ ] Accuracy target established: ≥98% protocol adherence
- [ ] Pediatric dosing calculations validated against Broselow tape
- [ ] Adult dosing calculations validated against LA County PCM
- [ ] Guardrails tested (reject unauthorized medications)
- [ ] Edge cases documented (unusual patient weights, contraindications)
- [ ] Medical Director sign-off with signature + date

**Security & Compliance Audit**:
- [ ] HIPAA Security Rule compliance audit completed
- [ ] HIPAA Privacy Rule compliance audit completed
- [ ] Penetration testing completed (no critical findings)
- [ ] Vulnerability scan passed (npm audit, Snyk, Playwright)
- [ ] Business Associate Agreement (BAA) signed with OpenAI
- [ ] BAA signed with Supabase (database provider)
- [ ] Incident response plan documented and reviewed
- [ ] Disaster recovery plan documented (RTO/RPO defined)
- [ ] Security Officer sign-off with signature + date

#### Week 2: Infrastructure Provisioning

**Azure Active Directory (Azure AD) Setup**:
- [ ] Azure AD tenant created: lacfd.onmicrosoft.com
- [ ] App registration created: "LA County Fire Medic Bot"
- [ ] Redirect URIs configured: https://medic-bot.lacfd.org/api/auth/callback
- [ ] Client ID and Client Secret generated (store securely)
- [ ] User accounts provisioned for 50 pilot paramedics
- [ ] Multi-factor authentication (MFA) enforced for all users
- [ ] Conditional access policy: Require MFA, block legacy auth
- [ ] Test login flow with sample paramedic account

**Database Provisioning (Supabase)**:
- [ ] Supabase project created: "lacfd-medic-bot-prod"
- [ ] PostgreSQL 15 database provisioned (US-West-2 region)
- [ ] Multi-AZ deployment enabled for high availability
- [ ] Database tables created (users, audit_logs, health_metrics)
- [ ] Indexes created for query performance
- [ ] Database connection string stored in environment variables
- [ ] Connection pooling configured (PgBouncer, max 100 connections)
- [ ] Automated daily backups enabled (30-day retention)
- [ ] Point-in-time recovery tested (7-day window)

**Hosting Environment (Netlify)**:
- [ ] Netlify account created: lacfd-fire-dept
- [ ] Site created: "lacfd-medic-bot-prod"
- [ ] Custom domain configured: medic-bot.lacfd.org
- [ ] SSL certificate installed (Let's Encrypt, auto-renewal)
- [ ] Environment variables configured:
  - [ ] AZURE_AD_CLIENT_ID
  - [ ] AZURE_AD_CLIENT_SECRET
  - [ ] AZURE_AD_TENANT_ID
  - [ ] DATABASE_URL
  - [ ] LLM_API_KEY
  - [ ] SESSION_SECRET (32-byte random string)
- [ ] Build hooks configured for CI/CD
- [ ] Deploy notifications configured (Slack, email)

**Monitoring & Alerting Setup**:
- [ ] UptimeRobot monitoring configured (5-minute interval)
  - [ ] Health check: GET /api/health every 5 minutes
  - [ ] Alert threshold: 3 consecutive failures (15 minutes)
- [ ] PagerDuty integration configured
  - [ ] On-call rotation established (24/7 coverage)
  - [ ] Escalation policy defined (engineer → medical director → fire chief)
- [ ] Netlify Analytics enabled (basic metrics)
- [ ] Custom metrics endpoint tested: GET /api/metrics

#### Week 3: Testing & Validation

**Functional Testing**:
- [ ] Run full test suite: `npm run test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run medical validation suite: `npm run test:medical` (if exists)
- [ ] Test Azure AD login flow with real paramedic account
- [ ] Test sample queries:
  - [ ] "Adult cardiac arrest protocol"
  - [ ] "55 year old chest pain"
  - [ ] "7 kg infant seizure, need midazolam dose"
  - [ ] "Broselow pink zone epinephrine"
- [ ] Verify offline mode:
  - [ ] Download knowledge base (11MB)
  - [ ] Disconnect from internet
  - [ ] Test protocol queries (should work offline)
  - [ ] Reconnect (should sync automatically)
- [ ] Test voice input (Web Speech API)
- [ ] Test medication dosing calculators (all 17 calculators)

**Performance Testing**:
- [ ] Load test completed: 100 concurrent users, 10 minutes sustained
- [ ] Results: P95 latency < 3 seconds (target met)
- [ ] Cold start latency measured: ~200ms (acceptable)
- [ ] Database query performance verified: <100ms per query
- [ ] LLM API latency measured: P95 < 2 seconds

**Security Testing**:
- [ ] Authentication testing:
  - [ ] Test login with valid credentials (success)
  - [ ] Test login with invalid credentials (failure)
  - [ ] Test session expiration after 60 minutes (logout required)
  - [ ] Test MFA enforcement (Azure AD level)
- [ ] Authorization testing (RBAC):
  - [ ] Paramedic role: Can access chat, dosing, protocols (approved)
  - [ ] EMT role: Limited to BLS protocols (approved)
  - [ ] Medical Director role: Can access audit logs (approved)
  - [ ] Admin role: Can manage users, system config (approved)
- [ ] Rate limiting testing:
  - [ ] Test auth endpoint: 5 attempts per 15 minutes (enforced)
  - [ ] Test chat endpoint: 30 requests per minute (enforced)
  - [ ] Test global rate limit: 1000 requests per 15 minutes (enforced)
- [ ] Input validation testing:
  - [ ] Test SQL injection (parameterized queries block attacks)
  - [ ] Test XSS attacks (React escaping blocks attacks)
  - [ ] Test CSRF attacks (SameSite cookies prevent)

**Audit Logging Testing**:
- [ ] Submit test chat query
- [ ] Verify audit log entry created in database (or file)
- [ ] Confirm log contains:
  - [ ] User ID (anonymized)
  - [ ] Session ID
  - [ ] Action: "chat.stream"
  - [ ] Query length (NOT query text - HIPAA compliant)
  - [ ] Protocols referenced
  - [ ] Timestamp
  - [ ] Outcome: "success"
  - [ ] Duration in milliseconds
- [ ] Confirm no PHI in logs (query text is NOT logged)
- [ ] Test log rotation: Create multiple daily logs
- [ ] Test log cleanup: Delete logs older than 6 years

#### Week 4: Training Material Development

**Training Videos** (5 videos, 3-5 minutes each):
- [ ] **Video 1: Overview & Login** (4 minutes)
  - Introduction to Medic Bot
  - Benefits for paramedics
  - How to log in with Azure AD
  - Two-factor authentication walkthrough
- [ ] **Video 2: Basic Protocol Queries** (5 minutes)
  - How to ask questions in natural language
  - Example queries: cardiac arrest, chest pain, stroke
  - Understanding protocol citations (PCM section references)
  - When to contact base hospital
- [ ] **Video 3: Medication Dosing Calculators** (4 minutes)
  - Accessing dosing calculator page
  - Entering patient weight
  - Selecting medication and scenario
  - Interpreting dose, volume, concentration
- [ ] **Video 4: Pediatric Broselow Dosing** (5 minutes)
  - Broselow color code integration
  - How to calculate pediatric doses
  - Safety bounds checking
  - Example: 7kg infant epinephrine dose
- [ ] **Video 5: Offline Mode** (3 minutes)
  - How to enable offline mode
  - Adding Medic Bot to home screen (PWA)
  - Using system without internet connection
  - Automatic sync when connection restored

**Quick Reference Guide** (1-page PDF):
- [ ] Designed for printing and laminating (station wall poster)
- [ ] Includes:
  - [ ] QR code to login page
  - [ ] Sample queries ("chest pain", "cardiac arrest", etc.)
  - [ ] How to use voice input
  - [ ] Support contact information
  - [ ] Troubleshooting tips

**FAQ Document**:
- [ ] Answers to common questions:
  - [ ] "What if the system is down during a call?"
  - [ ] "Does this replace my protocol manual?" (No, it's a reference tool)
  - [ ] "Will my searches be tracked?" (Yes, but anonymized for QA)
  - [ ] "Can I use this on personal phone?" (Yes, if Azure AD login works)
  - [ ] "What if I get a wrong answer?" (Report to medical director immediately)

**Station Captain Briefing Deck** (PowerPoint, 20 slides):
- [ ] Slide 1-3: Executive summary for Fire Chief
- [ ] Slide 4-6: Problem statement (protocol lookup friction, cognitive load, dosing errors)
- [ ] Slide 7-10: Solution overview (AI assistant, offline PWA, dosing calculators)
- [ ] Slide 11-13: Security & compliance (Azure AD, HIPAA, audit logging)
- [ ] Slide 14-16: Pilot program details (5 stations, 50 paramedics, 3 months)
- [ ] Slide 17-19: Training plan (2-hour in-service, videos, support)
- [ ] Slide 20: Next steps (station captain responsibilities)

---

### Month 2: Pilot Deployment & Training

#### Week 5: Station Selection & Recruitment

**Pilot Station Selection** (5 stations):
- [ ] **Station 71**: High-volume urban (>3,000 calls/year)
  - Captain: [Name]
  - Pilot paramedics: 10 selected
  - Training date: [Date]
- [ ] **Station 127**: Moderate suburban (1,500-2,000 calls/year)
  - Captain: [Name]
  - Pilot paramedics: 10 selected
  - Training date: [Date]
- [ ] **Station 51**: Urban with training academy (2,500+ calls/year)
  - Captain: [Name]
  - Pilot paramedics: 10 selected
  - Training date: [Date]
- [ ] **Station 14**: Suburban (1,000-1,500 calls/year)
  - Captain: [Name]
  - Pilot paramedics: 10 selected
  - Training date: [Date]
- [ ] **Station 181**: Rural/remote (500-1,000 calls/year)
  - Captain: [Name]
  - Pilot paramedics: 10 selected
  - Training date: [Date]

**Paramedic Recruitment**:
- [ ] Email invitation sent to 70 paramedics (target 50, assume 30% decline)
- [ ] Volunteer basis (no mandatory participation in pilot)
- [ ] Selection criteria:
  - [ ] Mix of experience levels (new hires + veterans)
  - [ ] Tech-savvy paramedics preferred
  - [ ] Early adopters willing to provide feedback
- [ ] Informed consent obtained (participation agreement signed)
- [ ] Azure AD accounts created for all 50 pilot paramedics

#### Week 6-7: In-Service Training

**Training Schedule** (2 hours per shift, per station):
- [ ] **Hour 1: Classroom Instruction**
  - Introduction to Medic Bot (15 minutes)
  - Login demonstration with Azure AD (10 minutes)
  - Live demo: Protocol queries (20 minutes)
  - Live demo: Dosing calculators (10 minutes)
  - Q&A session (5 minutes)
- [ ] **Hour 2: Hands-On Practice**
  - Each paramedic logs in on personal device or MDT (10 minutes)
  - Practice queries: cardiac arrest, chest pain, pediatric seizure (20 minutes)
  - Practice dosing calculations: epinephrine, midazolam, atropine (20 minutes)
  - Enable offline mode and test (5 minutes)
  - Feedback survey (5 minutes)

**Training Completion Checklist** (per paramedic):
- [ ] Successfully logged in with Azure AD credentials
- [ ] Submitted at least 3 practice queries
- [ ] Completed at least 2 dosing calculations
- [ ] Enabled offline mode (installed PWA)
- [ ] Completed feedback survey
- [ ] Received quick reference guide (laminated card)

#### Week 8: Daily Usage Monitoring

**Usage Metrics Collection** (Daily):
- [ ] **Monday**: Total queries: ____, Unique users: ____, P95 latency: ____ms
- [ ] **Tuesday**: Total queries: ____, Unique users: ____, P95 latency: ____ms
- [ ] **Wednesday**: Total queries: ____, Unique users: ____, P95 latency: ____ms
- [ ] **Thursday**: Total queries: ____, Unique users: ____, P95 latency: ____ms
- [ ] **Friday**: Total queries: ____, Unique users: ____, P95 latency: ____ms
- [ ] **Saturday**: Total queries: ____, Unique users: ____, P95 latency: ____ms
- [ ] **Sunday**: Total queries: ____, Unique users: ____, P95 latency: ____ms

**Daily Monitoring Tasks**:
- [ ] **Morning (0800)**: Review overnight metrics
  - [ ] Uptime: ____% (target: 99.9%)
  - [ ] Errors: ____ (investigate any >0)
  - [ ] Check PagerDuty alerts (resolve any critical)
- [ ] **Midday (1200)**: Medical Director spot-check
  - [ ] Review random sample of 10 queries
  - [ ] Flag any inaccurate responses
  - [ ] Document findings in spreadsheet
- [ ] **Evening (1700)**: Station Captain check-in (call 1 station per day)
  - [ ] Ask: "Any issues today? Paramedic feedback?"
  - [ ] Log responses in feedback tracker

**Issue Triage**:
- [ ] **Critical (P1)**: Safety risk, app down → Fix within 4 hours
- [ ] **High (P2)**: Degraded performance → Fix within 24 hours
- [ ] **Medium (P3)**: Slow/buggy → Fix within 1 week
- [ ] **Low (P4)**: Cosmetic issues → Fix in next release

---

### Month 3: Pilot Evaluation & Go/No-Go Decision

#### Week 9-11: Continued Monitoring & Feedback

**Weekly Paramedic Surveys**:
- [ ] Week 9: Survey sent to all 50 pilot paramedics
  - [ ] "How many times did you use Medic Bot this week?"
  - [ ] "Did Medic Bot save you time? (Yes/No)"
  - [ ] "Rate your trust in the system (1-5 scale)"
  - [ ] "Any issues or bugs encountered?"
  - [ ] "Any feature requests?"
- [ ] Week 10: Follow-up survey
- [ ] Week 11: Final pilot survey

**Station Captain Interviews** (30 minutes each):
- [ ] Station 71 Captain: [Date completed]
  - Key feedback: [Summary]
- [ ] Station 127 Captain: [Date completed]
  - Key feedback: [Summary]
- [ ] Station 51 Captain: [Date completed]
  - Key feedback: [Summary]
- [ ] Station 14 Captain: [Date completed]
  - Key feedback: [Summary]
- [ ] Station 181 Captain: [Date completed]
  - Key feedback: [Summary]

#### Week 12: Pilot Evaluation Report

**Aggregate Metrics** (3-month pilot):
- [ ] **Usage Metrics**:
  - [ ] Total queries: ____ (target: ≥2,000 queries over 3 months)
  - [ ] Unique users: ____ (target: ≥35/50 paramedics = 70% adoption)
  - [ ] Average queries per user: ____ (target: ≥40 queries/user over 3 months)
  - [ ] Daily active users: ____% (target: ≥60%)
- [ ] **Performance Metrics**:
  - [ ] P95 latency: ____ ms (target: <3,000ms)
  - [ ] Uptime: ____% (target: ≥99.9%)
  - [ ] Error rate: ____% (target: <1%)
- [ ] **Quality Metrics**:
  - [ ] Protocol accuracy: ____% (medical director validated, target: ≥98%)
  - [ ] Medication dosing errors: ____ (target: 0)
  - [ ] User satisfaction: ____% "trust rating" (target: ≥80%)
- [ ] **Time Savings**:
  - [ ] Average time saved per query: ____ seconds (target: ≥25 seconds)
  - [ ] Total time saved (3 months): ____ hours (target: ≥50 hours)

**Top 3 Issues Identified**:
1. [Issue 1 description]
   - Severity: [Critical/High/Medium/Low]
   - Action plan: [How to fix]
2. [Issue 2 description]
   - Severity: [Critical/High/Medium/Low]
   - Action plan: [How to fix]
3. [Issue 3 description]
   - Severity: [Critical/High/Medium/Low]
   - Action plan: [How to fix]

**Top 3 Feature Requests**:
1. [Feature 1 description]
   - Priority: [Must-have/Nice-to-have]
   - Implementation effort: [Small/Medium/Large]
2. [Feature 2 description]
   - Priority: [Must-have/Nice-to-have]
   - Implementation effort: [Small/Medium/Large]
3. [Feature 3 description]
   - Priority: [Must-have/Nice-to-have]
   - Implementation effort: [Small/Medium/Large]

**Go/No-Go Decision Criteria**:
- [ ] **GO**: Proceed to Phase 2 (Full Rollout)
  - [ ] Protocol accuracy ≥ 98%
  - [ ] User adoption ≥ 70% (35+ of 50 paramedics active)
  - [ ] User satisfaction ≥ 80% trust rating
  - [ ] Zero critical safety incidents
  - [ ] P95 latency < 3 seconds
  - [ ] Uptime ≥ 99.9%
- [ ] **NO-GO**: Pause or cancel project
  - [ ] Protocol accuracy < 95% (unacceptable clinical risk)
  - [ ] User adoption < 50% (paramedics don't find it useful)
  - [ ] User satisfaction < 60% (low trust in system)
  - [ ] Any critical safety incidents (medication errors, wrong protocols)
  - [ ] P95 latency > 5 seconds (too slow for field use)
  - [ ] Uptime < 99% (unreliable)

**Decision**:
- [ ] **GO** - Signed by:
  - [ ] Fire Chief: ________________________ Date: ______
  - [ ] Medical Director: ________________________ Date: ______
  - [ ] Project Manager: ________________________ Date: ______
- [ ] **NO-GO** - Reason: ________________________________________________
  - [ ] Pause for 3 months to address issues
  - [ ] Cancel project (not viable)

---

## Phase 2: Department-Wide Rollout (Months 4-9)

### Month 4: Rollout Planning

**Budget Approval**:
- [ ] Phase 2 budget approved: $225,000
- [ ] Breakdown:
  - [ ] Azure AD licensing (3,200 users): $50,000
  - [ ] Department-wide training: $75,000
  - [ ] CAD/ePCR integration development: $50,000
  - [ ] Medical director dashboard: $25,000
  - [ ] 24/7 helpdesk support: $15,000
  - [ ] Change management campaign: $10,000

**Infrastructure Scaling**:
- [ ] Migrate from Netlify to AWS GovCloud or Azure Government
- [ ] Multi-region deployment:
  - [ ] Primary: US-West-2 (Oregon)
  - [ ] Secondary: US-East-1 (Virginia) - failover
- [ ] ECS/AKS cluster provisioned:
  - [ ] Min instances: 3 (1 per AZ)
  - [ ] Max instances: 10 (auto-scaling)
  - [ ] CPU/memory: 2 vCPU, 4GB RAM per instance
- [ ] RDS PostgreSQL Multi-AZ:
  - [ ] Instance type: db.r5.xlarge (4 vCPU, 32GB RAM)
  - [ ] Storage: 100GB (auto-scaling to 1TB)
  - [ ] Read replicas: 2 (for audit log queries)
- [ ] Application Load Balancer (ALB):
  - [ ] Health check: GET /api/health every 30 seconds
  - [ ] SSL termination (TLS 1.3)
- [ ] CloudFront CDN:
  - [ ] Cache static assets for 1 year
  - [ ] Gzip compression enabled

**Azure AD Provisioning**:
- [ ] Azure AD accounts created for all 3,200 paramedics and EMTs
- [ ] User sync from LA County HR system (automated)
- [ ] Role assignments:
  - [ ] 2,800 Paramedics → "paramedic" role
  - [ ] 400 EMTs → "emt" role
  - [ ] 150 Captains → "captain" role
  - [ ] 5 Medical Directors → "medical_director" role
  - [ ] 10 Admins → "admin" role
- [ ] MFA enrollment campaign (email + SMS)

### Months 5-7: Rolling Deployment (25 stations/month)

**Month 5: First 25 Stations**:
- [ ] Stations 1-25 selected (prioritize high-volume urban stations)
- [ ] Training schedule published (2-hour in-service per shift)
- [ ] Station captains briefed
- [ ] Training sessions completed for ~450 paramedics
- [ ] Feedback surveys collected

**Month 6: Next 25 Stations**:
- [ ] Stations 26-50 selected (mix of urban and suburban)
- [ ] Training sessions completed for ~450 paramedics
- [ ] Mid-rollout evaluation:
  - [ ] Total users: ~950 (pilot 50 + rollout 900)
  - [ ] Daily active users: ____% (target: ≥70%)
  - [ ] System performance: P95 latency ____ ms (target: <2,000ms)
  - [ ] Uptime: ____% (target: ≥99.95%)

**Month 7: Next 25 Stations**:
- [ ] Stations 51-75 selected (suburban and rural mix)
- [ ] Training sessions completed for ~450 paramedics
- [ ] Total users: ~1,400 (43% of department)

### Month 8: CAD/ePCR Integration Development

**CAD System Integration**:
- [ ] CAD vendor identified: [Vendor name]
- [ ] API documentation reviewed
- [ ] Webhook endpoint developed: POST /api/integrations/cad/incidents
- [ ] Test environment setup
- [ ] Integration testing completed:
  - [ ] Dispatch incident sent to Medic Bot
  - [ ] Chief complaint extracted
  - [ ] Relevant protocols pre-loaded
  - [ ] Time savings measured: ____ seconds per call
- [ ] Production deployment (soft launch)

**ePCR System Integration**:
- [ ] ePCR vendor identified: [ImageTrend/ESO/ZOLL]
- [ ] API documentation reviewed
- [ ] Export endpoint developed: POST /api/integrations/epcr/narrative
- [ ] NEMSIS 3.5.0 compliance validated
- [ ] Integration testing completed:
  - [ ] Sample incident processed
  - [ ] Narrative generated with protocol citations
  - [ ] Export to ePCR successful
- [ ] Production deployment (soft launch)

### Month 9: Final 99 Stations & Medical Director Dashboard

**Months 9: Final 99 Stations**:
- [ ] Stations 76-174 selected (all remaining stations)
- [ ] Training sessions completed for ~1,800 paramedics
- [ ] Total users: 3,200 (100% of department)
- [ ] Department-wide launch announcement

**Medical Director Dashboard**:
- [ ] Dashboard developed: /admin/dashboard
- [ ] Features:
  - [ ] Real-time usage metrics (queries/hour, active users)
  - [ ] Protocol usage heatmap (most queried protocols)
  - [ ] Audit log search interface
  - [ ] Quality assurance reports (random sampling)
  - [ ] Medication dosing analytics (most calculated meds)
- [ ] Access restricted to medical_director and admin roles
- [ ] Training session for medical directors (1 hour)
- [ ] Dashboard launched

**QA/QI Reporting Interface**:
- [ ] Monthly reports generated:
  - [ ] Total queries by station
  - [ ] Top 10 protocols queried
  - [ ] Average query response time
  - [ ] User satisfaction scores
  - [ ] Medication dosing calculator usage
- [ ] Delivered to medical director and fire chief

**Phase 2 Completion Metrics**:
- [ ] Total users: 3,200 (100% of department)
- [ ] Daily active users: ____% (target: ≥70%)
- [ ] Total queries/month: ____ (target: ≥20,000)
- [ ] P95 latency: ____ ms (target: <2,000ms)
- [ ] Uptime: ____% (target: ≥99.95%)
- [ ] User satisfaction: ____% (target: ≥85%)
- [ ] Zero system-attributable medication errors

---

## Phase 3: Advanced Features (Months 10-12)

### Month 10: Real-Time Protocol Updates

**Push Notification System**:
- [ ] Web Push API integrated (browser notifications)
- [ ] Service Worker updated to handle notifications
- [ ] Admin interface for protocol update announcements
- [ ] Test notification sent to pilot group:
  - [ ] Notification delivered within 30 seconds
  - [ ] Acknowledgment tracking (who read update)
- [ ] Production rollout

**Protocol Update Workflow**:
1. [ ] Medical director publishes protocol update in admin dashboard
2. [ ] Push notification sent to all active users
3. [ ] Knowledge base updated (new protocol chunks added)
4. [ ] Service Worker cache invalidated (force refresh)
5. [ ] Acknowledgment tracking dashboard shows 90% read rate within 24 hours

### Month 11: Hospital Destination Protocols

**Hospital System Integration**:
- [ ] Hospital API documentation reviewed (LA County DHS)
- [ ] Endpoint developed: GET /api/integrations/hospitals/routing
- [ ] Features:
  - [ ] STEMI bypass: Closest PCI-capable facility
  - [ ] Stroke bypass: Closest certified stroke center
  - [ ] Trauma center selection: Based on triage criteria
  - [ ] Pediatric specialty routing: Children's Hospital LA
- [ ] Integration testing completed
- [ ] Production deployment

**Predictive Dosing Suggestions**:
- [ ] Machine learning model trained on historical dosing data
- [ ] Features:
  - [ ] Patient presentation → recommended medications
  - [ ] Example: "Chest pain" → suggest nitroglycerin, aspirin
  - [ ] Example: "Pediatric seizure" → suggest midazolam
- [ ] Model accuracy validated by medical director
- [ ] Opt-in feature (paramedics can enable/disable)
- [ ] Production deployment (beta flag)

### Month 12: Native Mobile Apps & CE Integration

**Native Mobile Apps** (iOS and Android):
- [ ] React Native app developed (code reuse from PWA)
- [ ] Features:
  - [ ] Faster performance than PWA
  - [ ] Native push notifications
  - [ ] Biometric authentication (Face ID, fingerprint)
  - [ ] Offline-first (same as PWA)
- [ ] App Store submission:
  - [ ] iOS: Apple App Store approval received
  - [ ] Android: Google Play Store approval received
- [ ] App distribution:
  - [ ] Download link sent to all 3,200 users
  - [ ] MDT pre-installation (for apparatus tablets)

**Continuing Education (CE) Integration**:
- [ ] CE curriculum developed (20 modules, 1 hour each)
- [ ] Topics:
  - [ ] Cardiac arrest management
  - [ ] Pediatric emergencies
  - [ ] Medication administration
  - [ ] Trauma triage
- [ ] Integrated into Medic Bot:
  - [ ] CE module button on home page
  - [ ] Completion tracking
  - [ ] Certificate generation (PDF)
- [ ] Approved by LA County EMS for CE credit
- [ ] Launch announcement

**Phase 3 Completion Metrics**:
- [ ] Protocol update acknowledgment rate: ____% within 24 hours (target: ≥90%)
- [ ] Hospital destination recommendations used: ____ times/month
- [ ] Native app downloads: ____ (target: ≥2,000)
- [ ] CE modules completed: ____ (target: ≥500 in first month)

---

## Ongoing Maintenance (Post-Deployment)

### Weekly Tasks

- [ ] Review metrics dashboard (Monday 10am)
- [ ] Medical director spot-checks 10 random queries (Wednesday)
- [ ] Deploy bug fixes and improvements (Friday)
- [ ] Send weekly update email to station captains (Friday)

### Monthly Tasks

- [ ] Generate monthly report:
  - [ ] Total queries
  - [ ] Unique users
  - [ ] Protocol accuracy (medical director validated)
  - [ ] Performance (latency, uptime)
  - [ ] User satisfaction (survey results)
- [ ] Medical director reviews random sample of 20 queries
- [ ] Update protocols (if LA County PCM changes)
- [ ] Security patch deployment (npm audit, Snyk)

### Quarterly Tasks

- [ ] Comprehensive system review
- [ ] Update knowledge base (new protocols, medications)
- [ ] User feedback survey (all 3,200 paramedics)
- [ ] Performance optimization review
- [ ] Board presentation (Fire Chief + County Board of Supervisors)

### Annual Tasks

- [ ] HIPAA compliance audit (third-party auditor)
- [ ] Penetration testing (third-party vendor)
- [ ] Disaster recovery drill (test failover + restore)
- [ ] Contract renewals:
  - [ ] Azure AD licensing
  - [ ] AWS/Azure hosting
  - [ ] Supabase database
  - [ ] OpenAI API
- [ ] Budget review for next year

---

## Rollback Plan (Emergency)

### Immediate Actions (Critical Issue)

1. [ ] **Alert Notification** (within 5 minutes)
   - [ ] Page on-call engineer (PagerDuty)
   - [ ] Notify medical director and fire chief (phone call)
   - [ ] Email all users: "System temporarily offline for emergency maintenance"

2. [ ] **System Disable** (within 10 minutes)
   - [ ] Disable production deployment (take offline)
   - [ ] Display maintenance page with ETA
   - [ ] Redirect users to backup protocol resources (PDF links)

3. [ ] **Root Cause Investigation** (within 30 minutes)
   - [ ] Review error logs (CloudWatch, Splunk)
   - [ ] Identify root cause (code bug, infrastructure failure, LLM API issue)
   - [ ] Document findings in incident report

4. [ ] **Hotfix or Rollback** (within 1-4 hours)
   - [ ] Option A: Deploy hotfix (if quick fix available)
   - [ ] Option B: Rollback to previous stable version
   - [ ] Test fix in staging environment
   - [ ] Re-deploy to production

5. [ ] **Verification** (within 30 minutes after re-deployment)
   - [ ] Run smoke tests (sample queries)
   - [ ] Verify /api/health returns 200 OK
   - [ ] Check monitoring dashboards (no errors)

6. [ ] **User Notification** (within 10 minutes after verification)
   - [ ] Email all users: "System back online. Issue resolved."
   - [ ] Post-mortem report published within 48 hours

### Escalation Matrix

- **Critical (P1)**: Safety risk, data breach, app completely down
  - **Response Time**: 5 minutes
  - **Notify**: On-call engineer + Medical Director + Fire Chief + IT Security Officer
  - **Fix SLA**: 4 hours

- **High (P2)**: Degraded performance, partial outage, incorrect protocols
  - **Response Time**: 15 minutes
  - **Notify**: On-call engineer + Operations team
  - **Fix SLA**: 24 hours

- **Medium (P3)**: Slow queries, minor bugs, UI issues
  - **Response Time**: 1 hour
  - **Notify**: Engineering team (email)
  - **Fix SLA**: 1 week

- **Low (P4)**: Cosmetic issues, feature requests
  - **Response Time**: 1 business day
  - **Notify**: Product manager (ticket)
  - **Fix SLA**: Next release cycle

---

## Sign-Off

### Phase 1 Pilot Approval

- [ ] **Medical Director**: ________________________ Date: ______
- [ ] **Fire Chief**: ________________________ Date: ______
- [ ] **IT Security Officer**: ________________________ Date: ______
- [ ] **Project Manager**: ________________________ Date: ______

### Phase 2 Full Rollout Approval

- [ ] **Medical Director**: ________________________ Date: ______
- [ ] **Fire Chief**: ________________________ Date: ______
- [ ] **Operations Chief**: ________________________ Date: ______

### Phase 3 Advanced Features Approval

- [ ] **Medical Director**: ________________________ Date: ______
- [ ] **Fire Chief**: ________________________ Date: ______
- [ ] **CTO/IT Director**: ________________________ Date: ______

---

*Document Version 1.0 - January 2025*
*Classification: Internal Use - LA County Fire Department Operations*
