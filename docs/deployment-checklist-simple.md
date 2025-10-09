# Deployment Checklist - LA County Fire Medic Bot

**Version**: 2.0.0
**Last Updated**: January 2025
**Classification**: Internal Use - LA County Fire Department

---

## Pre-Deployment

### Code Quality
- [ ] All tests passing (`npm run test`)
  - [ ] Unit tests (40+ tests, 80%+ coverage)
  - [ ] Integration tests (API endpoints)
  - [ ] E2E tests (Playwright security tests)
- [ ] Linting clean (`npm run lint` - zero warnings)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No console errors or warnings in development

### Medical Validation
- [ ] Medical director review completed (20 test queries minimum)
- [ ] Protocol accuracy verified (98%+ against LA County PCM)
- [ ] Pediatric dosing validated against Broselow tape
- [ ] Adult dosing calculations verified
- [ ] Medication safety guardrails tested
- [ ] Edge cases documented (unusual weights, contraindications)
- [ ] Medical director sign-off with signature + date

### Security Review
- [ ] Security scan clean (no critical/high vulnerabilities)
  - [ ] Run: `npm audit --production`
  - [ ] Fix any high-severity issues
- [ ] Rate limiting configured and tested
  - [ ] Chat endpoint: 20 req/min per IP
  - [ ] API endpoints: 60 req/min per IP
- [ ] Security headers validated (`/api/health` check)
  - [ ] HSTS enabled
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] CSP headers configured
- [ ] Audit logging functional (metadata only, no PHI)
- [ ] Environment variables validated (no secrets in git)

### Performance Validation
- [ ] Performance budgets met
  - [ ] P95 latency < 3 seconds (`/api/metrics`)
  - [ ] Bundle size < 500KB (main chunk)
  - [ ] Time to Interactive < 8 seconds (3G simulation)
- [ ] Knowledge base loading optimized
  - [ ] Initial load: ~200KB (chunked)
  - [ ] Offline cache functional
- [ ] PWA manifest and service worker tested
  - [ ] Add to home screen works
  - [ ] Offline mode functional

---

## Deployment Day

### Environment Setup (Netlify)
- [ ] Environment variables configured:
  ```bash
  LLM_API_KEY=<openai_key>
  LLM_BASE_URL=https://api.openai.com/v1
  LLM_MODEL=gpt-4o-mini
  KB_SCOPE=pcm
  KB_SOURCE=clean
  RATE_LIMIT_CHAT_RPM=20
  RATE_LIMIT_API_RPM=60
  ENABLE_AUDIT_LOGGING=true
  NODE_ENV=production
  ```
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (auto-provisioned by Netlify)

### Deployment Process
1. [ ] Create git tag for release
   ```bash
   git tag -a v2.0.0 -m "Release 2.0.0: Public access, mobile-first"
   git push origin v2.0.0
   ```

2. [ ] Trigger Netlify deployment
   ```bash
   git push origin main
   ```

3. [ ] Monitor build logs (Netlify dashboard)
   - [ ] Build succeeds without errors
   - [ ] No deployment warnings

4. [ ] Wait for deployment to complete (~3-5 minutes)

### Smoke Testing (Production)
Run these tests immediately after deployment:

- [ ] Health check endpoint
  ```bash
  curl https://your-domain.netlify.app/api/health
  ```
  - [ ] Status: "healthy"
  - [ ] KB loaded: true
  - [ ] Document count: 810+
  - [ ] LLM available: true

- [ ] Chat endpoint (JSON)
  ```bash
  curl https://your-domain.netlify.app/api/chat \
    -H 'content-type: application/json' \
    -d '{"messages":[{"role":"user","content":"chest pain"}]}'
  ```
  - [ ] Response received
  - [ ] Protocol citations included
  - [ ] Response time < 3 seconds

- [ ] Chat endpoint (SSE streaming)
  ```bash
  curl -N https://your-domain.netlify.app/api/chat/stream \
    -H 'content-type: application/json' \
    -d '{"messages":[{"role":"user","content":"cardiac arrest"}]}'
  ```
  - [ ] Events stream correctly
  - [ ] Events: start → citations → delta → final → done
  - [ ] First token < 1 second

- [ ] Dosing calculator
  ```bash
  curl https://your-domain.netlify.app/api/dosing \
    -H 'content-type: application/json' \
    -d '{"medicationId":"epinephrine","request":{"patientWeightKg":70,"scenario":"arrest"}}'
  ```
  - [ ] Dose calculated correctly
  - [ ] Volume and concentration returned
  - [ ] Safety bounds checked

- [ ] Metrics endpoint
  ```bash
  curl https://your-domain.netlify.app/api/metrics
  ```
  - [ ] Metrics returned (counters, latency)
  - [ ] P95 latency displayed

### Manual Testing (Production)
- [ ] Load homepage (`/`)
  - [ ] Page loads < 3 seconds
  - [ ] No console errors
  - [ ] Mobile navigation bar visible
- [ ] Test chat interface
  - [ ] Submit query: "55 year old chest pain"
  - [ ] Response streams correctly
  - [ ] Citations rendered
  - [ ] Copy button works
- [ ] Test dosing calculator (`/dosing`)
  - [ ] Select medication: Epinephrine
  - [ ] Enter weight: 70 kg
  - [ ] Select scenario: Arrest
  - [ ] Calculate button works
  - [ ] Result displays correctly
- [ ] Test offline mode
  - [ ] Enable airplane mode
  - [ ] Submit protocol query
  - [ ] Verify offline message displays
  - [ ] Disable airplane mode
  - [ ] Verify background sync

### Monitoring Setup
- [ ] UptimeRobot monitoring configured
  - [ ] Health check: GET /api/health every 5 minutes
  - [ ] Alert threshold: 3 consecutive failures
  - [ ] Notification email configured
- [ ] Netlify Analytics enabled
- [ ] Error tracking configured (if using Sentry)

---

## Post-Deployment (24 Hours)

### Medical Director Spot-Check
- [ ] Medical director reviews 20 random queries
- [ ] Protocol accuracy verified (98%+ target)
- [ ] No medication dosing errors
- [ ] No safety concerns identified
- [ ] Sign-off with signature + date

### Performance Review
- [ ] Review `/api/metrics` dashboard
  - [ ] P95 latency < 3 seconds
  - [ ] Error rate < 1%
  - [ ] Request volume as expected
- [ ] Check Netlify Analytics
  - [ ] Page load times < 5 seconds
  - [ ] No 500 errors
  - [ ] Bounce rate < 20%

### Audit Log Review
- [ ] Verify audit logs are being written
- [ ] Sample log entry contains:
  - [ ] Timestamp
  - [ ] Action (e.g., "chat.stream")
  - [ ] Outcome (success/failure)
  - [ ] Duration in milliseconds
  - [ ] Protocols referenced
  - [ ] NO query text (HIPAA compliant)
  - [ ] NO patient information

### User Feedback Collection
- [ ] Monitor user feedback channels
  - [ ] Email support inbox
  - [ ] Station captain check-ins
  - [ ] Anonymous feedback form
- [ ] Document any issues
  - [ ] Bug reports
  - [ ] Feature requests
  - [ ] Usability concerns

---

## Rollback Plan (If Needed)

### Trigger Conditions
Rollback immediately if:
- [ ] Critical bug discovered (app crashes, data loss)
- [ ] Medical accuracy < 95% (unacceptable clinical risk)
- [ ] P95 latency > 10 seconds (unusable)
- [ ] Error rate > 10% (system instability)
- [ ] Security vulnerability discovered

### Rollback Procedure
1. [ ] Alert medical director and fire chief (phone call)
2. [ ] Revert to previous Netlify deployment
   - [ ] Go to Netlify dashboard
   - [ ] Find previous successful deployment
   - [ ] Click "Publish deploy"
3. [ ] Verify rollback successful
   - [ ] Run smoke tests (health, chat, dosing)
   - [ ] Check metrics (latency, errors)
4. [ ] Email all users: "System temporarily reverted for maintenance"
5. [ ] Investigate root cause (within 4 hours)
6. [ ] Document findings in incident report
7. [ ] Fix issue in development
8. [ ] Re-deploy after fix validated

---

## Post-Deployment Ops

### Daily Tasks
- [ ] Review metrics dashboard (10am)
  - [ ] Uptime: 99.9%+
  - [ ] Error rate: < 1%
  - [ ] P95 latency: < 3 seconds
- [ ] Check for errors (Netlify logs)
- [ ] Respond to user feedback

### Weekly Tasks
- [ ] Medical director spot-check (10 queries)
- [ ] Review audit logs (sample 20 entries)
- [ ] Deploy bug fixes (if any)
- [ ] Send weekly update to station captains

### Monthly Tasks
- [ ] Generate monthly report
  - [ ] Total queries
  - [ ] Unique users
  - [ ] Protocol accuracy
  - [ ] Performance (latency, uptime)
  - [ ] User satisfaction
- [ ] Medical director comprehensive review (50 queries)
- [ ] Update protocols (if LA County PCM changes)
- [ ] Security patch deployment (`npm audit fix`)

### Quarterly Tasks
- [ ] Comprehensive system review
- [ ] Update knowledge base (new protocols)
- [ ] User feedback survey (all users)
- [ ] Performance optimization review
- [ ] Board presentation (Fire Chief + County)

### Annual Tasks
- [ ] Security audit (third-party)
- [ ] Penetration testing (third-party vendor)
- [ ] Disaster recovery drill (test failover)
- [ ] Contract renewals
  - [ ] OpenAI API
  - [ ] Netlify hosting
- [ ] Budget review for next year

---

## Emergency Contacts

### Critical Incident (P1)
- **On-Call Engineer**: [Phone]
- **Medical Director**: [Phone]
- **Fire Chief**: [Phone]
- **IT Security Officer**: [Phone]

### Escalation Path
1. On-call engineer (responds within 5 minutes)
2. Engineering manager (responds within 15 minutes)
3. Medical director (responds within 30 minutes)
4. Fire chief (responds within 1 hour)

### Support Channels
- **Email**: medic-bot-support@fire.lacounty.gov
- **Phone**: [Support hotline]
- **Slack**: #medic-bot-support (internal)
- **PagerDuty**: [On-call rotation link]

---

## Sign-Off

### Pre-Deployment Approval
- [ ] **Medical Director**: ________________________ Date: ______
- [ ] **IT Security Officer**: ________________________ Date: ______
- [ ] **Project Manager**: ________________________ Date: ______

### Post-Deployment Verification
- [ ] **Medical Director**: ________________________ Date: ______
  - 20 queries reviewed, accuracy ≥ 98%
- [ ] **Operations Lead**: ________________________ Date: ______
  - Performance metrics meet targets
- [ ] **Fire Chief**: ________________________ Date: ______
  - Approved for full deployment

---

**Document Version**: 2.0.0
**Last Updated**: January 2025
**Classification**: Internal Use - LA County Fire Department Operations
