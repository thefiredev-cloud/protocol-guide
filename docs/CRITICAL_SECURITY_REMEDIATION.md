# Critical Security Remediation Plan

## URGENT: Production Blocking Security Issues

**Severity:** CRITICAL
**Risk Level:** EXTREME
**Status:** IMMEDIATE ACTION REQUIRED

---

## Executive Summary

The Medic-Bot application currently has **CRITICAL SECURITY VULNERABILITIES** that make it unsuitable for production deployment, especially in a medical environment handling Protected Health Information (PHI). The most severe issue is the complete absence of authentication, where the RBAC stub returns `{ ok: true }` for all requests.

**DO NOT DEPLOY TO PRODUCTION UNTIL THESE ISSUES ARE RESOLVED**

---

## 1. Critical Vulnerabilities (Fix Immediately)

### 1.1 NO AUTHENTICATION - SEVERITY: CRITICAL

**Current State:**
```typescript
// lib/api/rbac.ts - LINE 50-58
if (env === "development" || allowInsecure) {
  return { ok: true }; // ALLOWS ALL REQUESTS WITHOUT AUTH!
}
```

**Risk:**
- Anyone can access any endpoint
- No user identification or tracking
- No access control for PHI
- HIPAA violation risk
- Complete system compromise possible

**Immediate Fix Required:**
```typescript
// lib/api/rbac.ts - REPLACE ENTIRE FILE
import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

interface JWTPayload {
  sub: string;
  role: string;
  permissions: string[];
  exp: number;
  org: string;
}

export async function requirePermission(
  req: NextRequest,
  permission: string
): Promise<PermissionResult> {
  // NEVER allow unauthenticated access
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      error: new Response(
        JSON.stringify({ error: 'Missing authentication token' }),
        { status: 401 }
      )
    };
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT token
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;

    // Check expiration
    if (payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    // Check permission
    if (!payload.permissions.includes(permission)) {
      return {
        ok: false,
        error: new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403 }
        )
      };
    }

    // Add user context to request
    (req as any).user = {
      id: payload.sub,
      role: payload.role,
      org: payload.org
    };

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401 }
      )
    };
  }
}
```

### 1.2 MISSING ENVIRONMENT VARIABLES - SEVERITY: HIGH

**Required Environment Variables:**
```bash
# .env.local - ADD IMMEDIATELY
JWT_SECRET=<generate-256-bit-secret>
JWT_PUBLIC_KEY=<rsa-public-key>
IMAGETREND_ALLOWED_ORIGINS=https://elite.imagetrend.com,https://*.imagetrend.com
ENCRYPTION_KEY=<generate-256-bit-key>
SESSION_TIMEOUT_MS=1800000  # 30 minutes
ENABLE_AUDIT_LOGGING=true
HIPAA_COMPLIANCE_MODE=true
```

**Generate Secure Keys:**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 32

# Generate RSA key pair for ImageTrend
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### 1.3 NO CROSS-ORIGIN VALIDATION - SEVERITY: HIGH

**Current State:** No validation of iframe parent origin

**Immediate Fix:**
```typescript
// app/layout.tsx - ADD to headers
export async function generateMetadata() {
  return {
    other: {
      'Content-Security-Policy': `
        frame-ancestors 'self' https://*.imagetrend.com;
        frame-src 'none';
        connect-src 'self' https://api.anthropic.com;
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
      `.replace(/\s+/g, ' ').trim(),
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  };
}
```

---

## 2. High Priority Vulnerabilities (Fix Week 1)

### 2.1 No PHI Encryption

**Risk:** Patient data stored/transmitted in plaintext

**Fix:**
```typescript
// lib/security/encryption.ts - CREATE FILE
import crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    this.key = Buffer.from(keyString, 'base64');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### 2.2 Insufficient Audit Logging

**Risk:** HIPAA requires comprehensive audit trails

**Fix:**
```typescript
// lib/audit/hipaa-logger.ts - CREATE FILE
export class HIPAALogger {
  async logPHIAccess(event: {
    userId: string;
    patientId: string;
    action: string;
    resource: string;
    ipAddress: string;
    success: boolean;
    reason?: string;
  }): Promise<void> {
    const encrypted = await this.encryption.encrypt(
      JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        sessionId: crypto.randomUUID()
      })
    );

    await this.db.hipaa_audit_logs.create({
      data: encrypted,
      user_id: event.userId,
      timestamp: new Date(),
      action_type: event.action
    });
  }

  async generateComplianceReport(): Promise<void> {
    // Generate HIPAA-required reports
    const logs = await this.db.hipaa_audit_logs.findAll({
      where: {
        timestamp: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } // 180 days
      }
    });

    // Required HIPAA reports
    return {
      totalAccess: logs.length,
      unauthorizedAttempts: logs.filter(l => !l.success).length,
      uniquePatients: new Set(logs.map(l => l.patient_id)).size,
      accessByUser: this.groupByUser(logs)
    };
  }
}
```

### 2.3 No Session Management

**Risk:** Sessions never expire, no timeout for PHI access

**Fix:**
```typescript
// lib/security/session-manager.ts - CREATE FILE
export class SessionManager {
  private readonly TIMEOUT_MS = parseInt(process.env.SESSION_TIMEOUT_MS || '1800000');
  private sessions = new Map<string, SessionData>();

  createSession(userId: string, metadata: any): string {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      userId,
      metadata,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.TIMEOUT_MS
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  validateSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);

    if (!session) return null;

    // Check expiration
    if (Date.now() > session.expiresAt) {
      this.destroySession(sessionId);
      return null;
    }

    // Update activity
    session.lastActivity = Date.now();
    session.expiresAt = Date.now() + this.TIMEOUT_MS;

    return session;
  }

  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Log session end for audit
      this.auditLogger.log({
        action: 'session.end',
        sessionId,
        userId: session.userId,
        duration: Date.now() - session.createdAt
      });
    }
    this.sessions.delete(sessionId);
  }
}
```

---

## 3. Medium Priority Issues (Fix Week 2)

### 3.1 Weak Rate Limiting

**Current:** IP-based only, easily bypassed

**Fix:**
```typescript
// lib/security/enhanced-rate-limit.ts
export class EnhancedRateLimiter {
  private limits = new Map<string, RateLimit>();

  check(userId: string, resource: string): RateLimitResult {
    const key = `${userId}:${resource}`;
    const limit = this.limits.get(key);

    // User-specific limits
    const maxRequests = this.getUserLimit(userId, resource);
    const windowMs = 60000; // 1 minute

    if (!limit) {
      this.limits.set(key, {
        count: 1,
        resetAt: Date.now() + windowMs
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (Date.now() > limit.resetAt) {
      limit.count = 1;
      limit.resetAt = Date.now() + windowMs;
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (limit.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: limit.resetAt - Date.now()
      };
    }

    limit.count++;
    return { allowed: true, remaining: maxRequests - limit.count };
  }

  private getUserLimit(userId: string, resource: string): number {
    // Different limits based on user role
    const role = this.getUserRole(userId);

    const limits = {
      admin: { chat: 1000, export: 100 },
      paramedic: { chat: 100, export: 20 },
      emt: { chat: 50, export: 10 }
    };

    return limits[role]?.[resource] || 10;
  }
}
```

### 3.2 Missing Input Validation

**Risk:** SQL injection, XSS attacks

**Fix:**
```typescript
// lib/security/input-validator.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export class InputValidator {
  // Sanitize HTML content
  sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  // Validate and sanitize chat messages
  validateChatMessage(input: unknown): string {
    const schema = z.string()
      .min(1, 'Message cannot be empty')
      .max(1000, 'Message too long')
      .transform(s => this.sanitizeHTML(s));

    return schema.parse(input);
  }

  // Validate patient ID format
  validatePatientId(input: unknown): string {
    const schema = z.string()
      .regex(/^[A-Z0-9-]+$/, 'Invalid patient ID format')
      .max(50);

    return schema.parse(input);
  }

  // Prevent SQL injection
  escapeSQLIdentifier(identifier: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
      throw new Error('Invalid SQL identifier');
    }
    return `"${identifier}"`;
  }
}
```

---

## 4. Compliance Requirements (Fix Week 3)

### 4.1 HIPAA Technical Safeguards

```typescript
// lib/compliance/hipaa-safeguards.ts
export class HIPAASafeguards {
  // Access control
  async enforceMinimumNecessary(userId: string, patientId: string): Promise<boolean> {
    // Check if user has legitimate reason to access PHI
    const relationship = await this.db.user_patient_relationships.findOne({
      where: { user_id: userId, patient_id: patientId }
    });

    return relationship?.active || false;
  }

  // Automatic logoff
  setupAutoLogoff(): void {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.logoff('Automatic logoff due to inactivity');
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Reset on any activity
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();
  }

  // Encryption in transit
  enforceHTTPS(): void {
    if (location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      location.href = 'https:' + location.href.substring(5);
    }
  }
}
```

### 4.2 Business Associate Agreement (BAA) Requirements

```yaml
Required Documentation:
  - Data Processing Agreement with Anthropic
  - BAA with ImageTrend
  - Encryption certificates
  - Security audit reports
  - Incident response plan
  - Data retention policy
  - Employee training records
```

---

## 5. Deployment Blockers Checklist

**DO NOT DEPLOY UNTIL ALL ITEMS ARE COMPLETE:**

- [ ] JWT authentication implemented and tested
- [ ] All API endpoints require authentication
- [ ] Cross-origin validation active
- [ ] PHI encryption at rest and in transit
- [ ] HIPAA audit logging complete
- [ ] Session timeout implemented (30 min)
- [ ] Rate limiting per user
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] SSL/TLS certificates valid
- [ ] Penetration testing completed
- [ ] HIPAA risk assessment done
- [ ] BAA agreements signed
- [ ] Incident response plan documented
- [ ] Security training completed

---

## 6. Emergency Response Plan

If a security breach is detected:

1. **IMMEDIATE ACTIONS (First 15 minutes):**
   - Disable all API endpoints
   - Revoke all active sessions
   - Enable emergency maintenance mode
   - Alert security team

2. **INVESTIGATION (First 2 hours):**
   - Review audit logs
   - Identify affected records
   - Document timeline
   - Preserve evidence

3. **NOTIFICATION (Within 24 hours):**
   - Notify HIPAA compliance officer
   - Prepare breach notification
   - Contact affected users
   - File required reports

4. **REMEDIATION:**
   - Patch vulnerability
   - Reset all credentials
   - Enhanced monitoring
   - Post-incident review

---

## 7. Security Testing Requirements

### Penetration Testing Checklist
```bash
# Authentication bypass attempts
curl -X POST https://app.com/api/chat -H "Authorization: Bearer invalid"

# SQL injection tests
curl "https://app.com/api/protocols?search='; DROP TABLE users;--"

# XSS attempts
curl -X POST https://app.com/api/chat \
  -d '{"message":"<script>alert(\"XSS\")</script>"}'

# CSRF testing
curl -X POST https://app.com/api/admin/delete \
  -H "Origin: https://evil.com"

# Rate limit testing
for i in {1..1000}; do
  curl https://app.com/api/chat &
done
```

---

## 8. Monitoring & Alerting

### Required Security Monitoring

```typescript
// lib/monitoring/security-monitor.ts
export class SecurityMonitor {
  private alerts = {
    FAILED_AUTH_THRESHOLD: 5,      // per minute
    RATE_LIMIT_VIOLATIONS: 10,     // per minute
    SUSPICIOUS_PATTERNS: [
      /union.*select/i,
      /script.*src/i,
      /<iframe/i,
      /javascript:/i
    ]
  };

  async checkSecurityMetrics(): Promise<void> {
    // Check failed authentication attempts
    const failedAuths = await this.getFailedAuthCount();
    if (failedAuths > this.alerts.FAILED_AUTH_THRESHOLD) {
      await this.sendAlert('HIGH', 'Excessive failed authentication attempts', {
        count: failedAuths,
        threshold: this.alerts.FAILED_AUTH_THRESHOLD
      });
    }

    // Check for suspicious patterns
    const recentRequests = await this.getRecentRequests();
    for (const request of recentRequests) {
      for (const pattern of this.alerts.SUSPICIOUS_PATTERNS) {
        if (pattern.test(request.body)) {
          await this.sendAlert('CRITICAL', 'Suspicious pattern detected', {
            pattern: pattern.toString(),
            request: request.id
          });
        }
      }
    }
  }

  private async sendAlert(severity: string, message: string, data: any): Promise<void> {
    // Send to monitoring service
    await fetch(process.env.ALERT_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity,
        message,
        data,
        timestamp: new Date().toISOString(),
        application: 'medic-bot'
      })
    });

    // Log to audit trail
    await this.auditLogger.log({
      action: 'security.alert',
      severity,
      message,
      data
    });
  }
}
```

---

## Critical Action Items

### IMMEDIATE (Today):
1. Implement JWT authentication
2. Remove RBAC stub that returns true
3. Add authentication to all endpoints
4. Configure security headers

### URGENT (This Week):
1. Implement PHI encryption
2. Add HIPAA audit logging
3. Setup session management
4. Configure cross-origin validation

### HIGH PRIORITY (Week 2):
1. Enhanced rate limiting
2. Input validation
3. Security monitoring
4. Penetration testing

### COMPLIANCE (Week 3):
1. HIPAA risk assessment
2. BAA agreements
3. Security documentation
4. Training completion

---

## Conclusion

**THE APPLICATION IS NOT SAFE FOR PRODUCTION IN ITS CURRENT STATE**

The absence of authentication is a critical vulnerability that must be fixed immediately. No deployment should occur until all critical and high-priority security issues are resolved. Medical applications handling PHI require the highest security standards, and the current implementation falls far short of requirements.

Estimated time to production-ready security: **3 weeks minimum** with dedicated security focus.