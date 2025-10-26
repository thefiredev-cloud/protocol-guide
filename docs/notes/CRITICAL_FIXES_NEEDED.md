# Critical Fixes Needed - Quick Reference

**Last Updated**: 2025-10-25

---

## 🔴 PRODUCTION BLOCKERS (Must Fix Before Public Deployment)

### 1. RBAC Authentication Stub
**File**: `/lib/api/rbac.ts`
**Status**: ✅ Documented (Week 2 implementation)
**Risk**: CRITICAL - Allows unauthorized access to all protected routes

```typescript
// TODO(WEEK2-AUTH): Implement real RBAC authentication
// Current stub returns { ok: true } for ALL requests
```

**Action Required**: Implement JWT authentication in Week 2
- Extract JWT from Authorization header
- Verify JWT signature
- Check user role permissions
- Return 401/403 for unauthorized requests

**Blocked Until Fixed**:
- Admin endpoints (`/api/admin/rate-limits`, `/api/audit`)
- CAD integration webhooks
- Any user-specific functionality

---

### 2. Toast Notification Memory Leak
**File**: `/app/components/toast-notification.tsx` (Lines 39-52)
**Status**: ❌ NOT FIXED
**Risk**: HIGH - Memory leak in long-running sessions

**Quick Fix** (~30 minutes):
```typescript
const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).slice(2, 11);
  const newToast: Toast = { ...toast, id };
  setToasts((prev) => [...prev, newToast]);

  const duration = toast.duration ?? 5000;
  const timeoutId = setTimeout(() => {
    removeToast(id);
    timeoutRefs.current.delete(id);
  }, duration);

  timeoutRefs.current.set(id, timeoutId);
}, [removeToast]);

const removeToast = useCallback((id: string) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));

  // Clear timeout if manually dismissed
  const timeoutId = timeoutRefs.current.get(id);
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutRefs.current.delete(id);
  }
}, []);
```

---

### 3. Keyboard Shortcuts Memory Leak
**File**: `/app/components/keyboard-shortcuts.tsx` (Lines 30-93)
**Status**: ❌ NOT FIXED
**Risk**: HIGH - Multiple event listeners accumulate

**Quick Fix** (~20 minutes):
```typescript
// Use ref instead of state in useEffect deps
const isOpenRef = useRef(isOpen);
useEffect(() => {
  isOpenRef.current = isOpen;
}, [isOpen]);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Use ref instead of closure variable
    if (e.key === '?' && !isOpenRef.current) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    // ... rest of handler
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []); // ✅ Empty deps - only runs on mount/unmount
```

---

## 🟠 HIGH PRIORITY (Fix This Week)

### 4. TypeScript Errors in Tests
**File**: `/tests/unit/error-boundary.test.tsx`
**Status**: ❌ NOT FIXED
**Risk**: MEDIUM - Build health, test reliability

**Quick Fix** (~15 minutes):
```typescript
// Add React import
import React from 'react';

// Fix NODE_ENV assignment
const originalEnv = process.env.NODE_ENV;
beforeEach(() => {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'production',
    writable: true,
    configurable: true
  });
});
afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});
```

---

### 5. Keyboard Shortcut '?' Bug
**File**: `/app/components/keyboard-shortcuts.tsx` (Line 46)
**Status**: ❌ NOT FIXED
**Risk**: MEDIUM - UX issue

**Quick Fix** (~10 minutes):
```typescript
// Change from:
if (e.key === '?' && !e.shiftKey) {

// To:
if ((e.key === '/' && e.shiftKey) || e.key === '?') {
  e.preventDefault();
  setIsOpen(true);
  return;
}
```

---

### 6. Console.log in Production Code
**File**: `/app/components/web-vitals.tsx` (Line 40)
**Status**: ❌ NOT FIXED
**Risk**: LOW - Code quality

**Quick Fix** (~5 minutes):
```typescript
// Change from:
console.log(metric.name, metric.value);

// To:
if (process.env.NODE_ENV === 'development') {
  console.log(metric.name, metric.value);
}
// OR send to analytics instead
```

---

## 📊 Fix Priority Matrix

| Issue | Severity | Effort | Priority | Status |
|-------|----------|--------|----------|--------|
| RBAC Auth Stub | CRITICAL | 2-3 days | P0 (Week 2) | ✅ Documented |
| Toast Memory Leak | HIGH | 30 min | P0 | ❌ To Do |
| Keyboard Memory Leak | HIGH | 20 min | P0 | ❌ To Do |
| TypeScript Test Errors | MEDIUM | 15 min | P1 | ❌ To Do |
| Keyboard '?' Bug | MEDIUM | 10 min | P1 | ❌ To Do |
| Console.log | LOW | 5 min | P2 | ❌ To Do |

**Total Immediate Fix Time**: ~1.5 hours (excluding Week 2 auth)

---

## ✅ Quick Win Checklist

Run these commands to verify fixes:

```bash
# 1. Fix memory leaks (manual code changes needed)
# See fixes above for toast-notification.tsx and keyboard-shortcuts.tsx

# 2. Fix TypeScript errors
npm run build  # Should complete without errors

# 3. Run linter
npm run lint   # Review remaining warnings

# 4. Run tests
npm test       # All tests should pass

# 5. Check for memory leaks
# Open Chrome DevTools > Memory > Take heap snapshot
# Use app for 5 minutes, take another snapshot
# Compare - should not see growing toast/listener references
```

---

## 🎯 Week 1 vs Week 2 Fixes

### Week 1 (Before Demo) - 1.5 hours
- [ ] Fix toast notification memory leak (30 min)
- [ ] Fix keyboard shortcuts memory leak (20 min)
- [ ] Fix keyboard shortcut '?' bug (10 min)
- [ ] Fix TypeScript test errors (15 min)
- [ ] Remove console.log from web-vitals (5 min)

**Demo Ready**: ✅ Safe for internal demo/pitch

---

### Week 2 (Before Production) - 5-6 days
- [ ] Implement JWT authentication (2-3 days)
- [ ] Implement CAD webhook signature verification (4 hours)
- [ ] Replace in-memory incident storage with Redis/Supabase (1 day)
- [ ] Add focus traps to modals (2 hours)
- [ ] Add skip link for accessibility (30 min)
- [ ] Run full accessibility audit (4 hours)
- [ ] Set up error tracking (Sentry/LogRocket) (4 hours)
- [ ] Optimize CSS bundle size (1 day)

**Production Ready**: ✅ Safe for public deployment

---

## 🚨 Before You Deploy

### Pre-Demo Checklist
- [ ] Fixed memory leaks ✓
- [ ] TypeScript builds without errors ✓
- [ ] Tests pass ✓
- [ ] Linter shows <30 warnings ✓
- [ ] Verified in Chrome/Firefox/Safari
- [ ] Tested keyboard shortcuts work
- [ ] Tested on mobile device

### Pre-Production Checklist
- [ ] All Week 1 fixes complete ✓
- [ ] JWT authentication implemented ✓
- [ ] Error tracking configured ✓
- [ ] Performance monitoring set up ✓
- [ ] Accessibility audit passed ✓
- [ ] Security review completed ✓
- [ ] Load testing completed ✓
- [ ] Backup/recovery plan in place ✓

---

## 📞 Emergency Contacts

If critical issues found in production:

1. **Check error tracking**: Sentry/LogRocket dashboard
2. **Check health endpoint**: `/api/health`
3. **Check logs**: Netlify deploy logs
4. **Rollback**: `git revert` and redeploy
5. **Incident response**: Follow BUGS.md for known issues

---

## 📚 Related Documentation

- **Full Bug Report**: See `BUGS.md` (comprehensive 500+ line report)
- **Session Summary**: See `BUG_HUNT_SUMMARY.md` (executive summary)
- **Implementation Guide**: See `IMPLEMENTATION_COMPLETE.md`
- **Phase A Progress**: See `PHASE-A-TP1210-PROGRESS.md`

---

**Last Updated**: 2025-10-25
**Next Review**: Before Week 2 production deployment
