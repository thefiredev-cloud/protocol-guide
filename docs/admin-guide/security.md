# Security & Compliance

Security features and compliance information for Protocol Guide Enterprise.

---

## Security Overview

Protocol Guide is built with security-first principles:

- **Data encryption** in transit (TLS 1.3) and at rest (AES-256)
- **SOC 2 Type II** compliance (in progress)
- **HIPAA-ready** architecture (no PHI stored)
- **Regular security audits** by third-party firms
- **Penetration testing** annually

---

## Authentication Security

### Supported Authentication Methods

| Method | Security Level | Use Case |
|--------|----------------|----------|
| Email + Password | Standard | Small departments |
| Google OAuth | Enhanced | Gmail/Workspace users |
| Apple OAuth | Enhanced | Apple device users |
| SAML 2.0 SSO | Enterprise | Corporate IdP |
| OIDC SSO | Enterprise | Modern IdP |

### Multi-Factor Authentication (MFA)

**For Admin Accounts (Required):**
- TOTP (Google Authenticator, Authy, etc.)
- Hardware security keys (YubiKey, etc.)

**For User Accounts (Optional/Configurable):**
- Enable at **Settings** → **Security** → **MFA**
- Can require MFA for all users
- Or allow self-enrollment

### Password Policy Configuration

**Settings** → **Security** → **Password Policy**

| Setting | Options | Recommendation |
|---------|---------|----------------|
| Minimum length | 8-24 chars | 12+ characters |
| Require complexity | Yes/No | Yes |
| Password expiry | Never-365 days | 90 days |
| Lockout threshold | 3-10 attempts | 5 attempts |
| Lockout duration | 5-60 minutes | 15 minutes |

---

## Access Controls

### Role-Based Access Control (RBAC)

Users can only access features appropriate to their role:

| Feature | User | Training Officer | Admin | Super Admin |
|---------|------|------------------|-------|-------------|
| Search protocols | ✅ | ✅ | ✅ | ✅ |
| View own analytics | ✅ | ✅ | ✅ | ✅ |
| View team analytics | ❌ | ✅ | ✅ | ✅ |
| View all analytics | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Manage settings | ❌ | ❌ | ✅ | ✅ |
| Manage admins | ❌ | ❌ | ❌ | ✅ |
| Billing access | ❌ | ❌ | ❌ | ✅ |

### IP Allowlisting (Enterprise+)

Restrict access to specific IP ranges:

1. Go to **Settings** → **Security** → **IP Allowlist**
2. Add allowed IP ranges (CIDR notation)
3. Enable allowlist
4. Test before enforcing

**Use cases:**
- Restrict admin access to department network
- Limit user access to known locations

### Session Security

Configure at **Settings** → **Security** → **Sessions**:

| Setting | Options | Default |
|---------|---------|---------|
| Session timeout | 1-72 hours | 8 hours |
| Idle timeout | 15-240 minutes | 60 minutes |
| Concurrent sessions | 1-10 | 5 |
| Session invalidation on password change | Yes/No | Yes |

---

## Data Security

### Encryption

| Data State | Method | Key Management |
|------------|--------|----------------|
| In transit | TLS 1.3 | Certificate rotation |
| At rest | AES-256 | AWS KMS |
| Backups | AES-256 | Separate key hierarchy |

### Data Location

| Data Type | Location | Region |
|-----------|----------|--------|
| User accounts | Supabase (AWS) | US-East |
| Protocol database | Supabase (AWS) | US-East |
| Analytics | Supabase (AWS) | US-East |
| Backups | AWS S3 | US-East + US-West |

**Data Residency Options (Enterprise+):**
- US-only data residency (default)
- EU data residency (available on request)

### Data Retention

Configure at **Settings** → **Data** → **Retention**:

| Data Type | Default | Options |
|-----------|---------|---------|
| Search history | 90 days | 30-365 days |
| Access logs | 1 year | 1-7 years |
| Analytics data | 2 years | 1-5 years |
| Deleted user data | 30 days | 30-90 days |

---

## Audit & Logging

### What's Logged

**Administrative Actions:**
- User creation/modification/deletion
- Role changes
- Settings changes
- SSO configuration changes
- Admin sign-ins

**User Activity:**
- Sign-in events (success/failure)
- Password changes
- MFA enrollment
- Session events

**System Events:**
- API calls
- Security events
- Error conditions

### Viewing Audit Logs

1. Go to **Settings** → **Audit Log**
2. Filter by:
   - Date range
   - Event type
   - User/Admin
   - Action

### Exporting Audit Logs

For compliance or security review:

1. Go to **Audit Log**
2. Set filters
3. Click **Export**
4. Choose format (CSV, JSON)

### Log Retention

Audit logs retained per your configured policy (default: 1 year).

**Compliance Note:** For regulations requiring longer retention, configure extended retention before go-live.

---

## Security Alerts

### Configuring Alerts

**Settings** → **Security** → **Alerts**

| Alert Type | Default | Configurable |
|------------|---------|--------------|
| Failed admin login | On | Email, Slack |
| Multiple failed user logins | On | Email |
| Password reset | On | Email |
| Role change | On | Email |
| New admin created | On | Email |
| SSO config change | On | Email, Slack |

### Alert Recipients

Configure who receives security alerts:

1. Go to **Settings** → **Security** → **Alert Recipients**
2. Add email addresses
3. (Optional) Add Slack webhook for instant alerts

---

## Compliance

### HIPAA

**Protocol Guide's HIPAA Stance:**

Protocol Guide is designed as a **reference tool** and does **not** store Protected Health Information (PHI):

- ❌ No patient names
- ❌ No patient records
- ❌ No medical record numbers
- ❌ No diagnosis codes linked to patients

**What this means:**
- Protocol Guide is not a "covered entity"
- BAA not typically required
- Can be used in HIPAA-regulated environments

**If you need a BAA:** Contact enterprise@protocol-guide.com to discuss your specific requirements.

### SOC 2

**Current Status:** SOC 2 Type II audit in progress

**Expected Completion:** Q2 2026

**Controls Covered:**
- Security
- Availability
- Confidentiality

**Request SOC 2 Report:** Contact compliance@protocol-guide.com

### Other Compliance

| Standard | Status |
|----------|--------|
| GDPR | Compliant |
| CCPA | Compliant |
| CJIS | Under review |
| FedRAMP | Not currently |

---

## Incident Response

### Security Incident Reporting

If you discover a security vulnerability or incident:

1. **Email:** security@protocol-guide.com
2. **Do not** post publicly
3. **Include:** Description, steps to reproduce, impact assessment

### Our Incident Response

| Severity | Initial Response | Resolution Target |
|----------|------------------|-------------------|
| Critical | 1 hour | 4 hours |
| High | 4 hours | 24 hours |
| Medium | 24 hours | 72 hours |
| Low | 72 hours | 2 weeks |

### Incident Communication

For incidents affecting customers:
- Email notification to admin contacts
- Status page updates (status.protocol-guide.com)
- Post-incident report within 5 business days

---

## Vulnerability Management

### Our Practices

- **Dependency scanning**: Daily automated scans
- **Penetration testing**: Annual third-party tests
- **Bug bounty**: Responsible disclosure program
- **Patch management**: Critical patches within 24 hours

### Responsible Disclosure

We welcome security researchers:

1. Report to security@protocol-guide.com
2. Provide reasonable time for fix (90 days)
3. No public disclosure until fixed
4. We credit researchers who follow guidelines

---

## Security Best Practices

### For Administrators

1. **Use strong, unique passwords** for admin accounts
2. **Enable MFA** on all admin accounts
3. **Review audit logs** weekly
4. **Limit admin accounts** to necessary personnel
5. **Use SSO** when possible
6. **Regularly review** user access
7. **Remove access** for departed employees immediately

### For Users

1. **Don't share accounts**
2. **Log out** on shared devices
3. **Report suspicious activity** to IT
4. **Keep devices updated** (OS and browser)

---

## Security Questionnaire

For procurement teams, we provide:

- **CAIQ** (Consensus Assessments Initiative Questionnaire)
- **SIG** (Standardized Information Gathering)
- **Custom questionnaires** upon request

**Request:** Contact enterprise@protocol-guide.com

---

## Next Steps

- [Set up SSO →](./sso-integration.md)
- [Upload custom protocols →](./custom-protocols.md)
- [Return to Admin Guide →](./README.md)

---

**Security Questions?** Contact security@protocol-guide.com

**Need help?** Contact enterprise-support@protocol-guide.com
