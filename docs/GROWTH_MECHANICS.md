# Protocol Guide - Viral Growth Mechanics Design

## Executive Summary

Protocol Guide's value proposition (2.3s retrieval vs 90s manual, 63 hours saved/year) creates a natural "aha moment" that can drive viral adoption. This document outlines three interconnected growth strategies designed for the EMS community.

**Target**: 100,000 MAU within 18 months
**North Star Metric**: Weekly Active Users who complete 5+ searches
**Viral Coefficient Target**: 1.3+ (each user brings 1.3 new users)

---

## Strategy 1: Crew Referral Program

### Core Mechanic

EMS operates in partner/crew dynamics. Leverage this tight-knit structure for peer-to-peer referrals.

### Referral Code System

```
Database Schema Addition (drizzle/schema.ts):

referralCodes table:
- id: int (PK)
- userId: int (owner of code)
- code: varchar(12) - unique, e.g., "CREW-A3B7C9"
- usesCount: int (times redeemed)
- maxUses: int (null = unlimited)
- rewardType: enum('pro_days', 'credits')
- rewardAmount: int (days or credits)
- expiresAt: timestamp (optional)
- createdAt: timestamp

referralRedemptions table:
- id: int (PK)
- referralCodeId: int (FK)
- referredUserId: int (new user who used code)
- referrerUserId: int (owner of code)
- referrerReward: json (what referrer received)
- refereeReward: json (what new user received)
- redeemedAt: timestamp
- attributedRevenue: decimal (if referee converts to paid)
```

### Reward Structure

| Action | Referrer Gets | Referee Gets |
|--------|---------------|--------------|
| Sign up with code | 7 days Pro | 14 days Pro (vs 7-day standard trial) |
| 3 referrals | Bonus 30 days Pro | - |
| 5 referrals | 6 months Pro free | - |
| 10 referrals | 1 year Pro free | Ambassador badge |

### Implementation: In-App Referral Dashboard

Location: `/app/(tabs)/profile.tsx` - Add referral section

```typescript
// Components to build:
// 1. ReferralDashboard - shows code, stats, rewards
// 2. ShareCrewCard - one-tap share to SMS/WhatsApp
// 3. ReferralLeaderboard - gamification element

interface ReferralStats {
  totalReferrals: number;
  pendingRewards: number;
  earnedProDays: number;
  nextTierProgress: number; // 0-100%
  rank: number; // leaderboard position
}
```

### "Shift Share" Feature

End-of-shift prompt after positive interaction (successful protocol lookup):

```
"Great shift? Share Protocol Guide with your partner"
[Share with Crew Button] [Maybe Later]

// Trigger conditions:
// - User completed 3+ searches in session
// - Session duration > 10 minutes
// - Haven't shown prompt in 48 hours
```

### Viral Messaging Templates

Pre-written messages optimized for EMS audience:

```
SMS Template:
"Hey, I've been using Protocol Guide on shift - found the
cardiac arrest protocol in 2 seconds instead of flipping
through the book. Use my code [CODE] for 2 weeks Pro free:
protocolguide.app/join?ref=[CODE]"

WhatsApp Template:
"Check this out - Protocol Guide saved me during a
respiratory call yesterday. 2.3 seconds to find what I
needed. Try it free with my code: [CODE]"
```

---

## Strategy 2: Department-Level Adoption

### Enterprise Pricing Tiers

Add to `/server/db.ts`:

```typescript
export const DEPARTMENT_PRICING = {
  starter: {
    maxSeats: 25,
    pricePerSeat: 399, // $3.99/month per seat
    annualDiscount: 20, // 20% off annual
    features: ['protocol_access', 'offline_mode', 'basic_analytics'],
  },
  professional: {
    maxSeats: 100,
    pricePerSeat: 299, // $2.99/month per seat
    annualDiscount: 25,
    features: ['protocol_access', 'offline_mode', 'advanced_analytics', 'custom_branding', 'sso'],
  },
  enterprise: {
    maxSeats: Infinity,
    pricePerSeat: 199, // $1.99/month per seat
    annualDiscount: 30,
    features: ['protocol_access', 'offline_mode', 'advanced_analytics', 'custom_branding',
               'sso', 'api_access', 'dedicated_support', 'custom_protocols'],
  },
} as const;
```

### Department Challenge Campaign

**Mechanic**: Departments compete on engagement metrics for prizes.

```
Campaign: "Protocol Pro Challenge"
Duration: 90 days
Eligibility: Any fire/EMS department with 10+ active users

Scoring:
- Daily active users: 1 point per user
- Protocols searched: 0.1 points per search
- New users onboarded: 5 points per signup
- Feedback submitted: 2 points

Prizes:
- 1st Place: 1 year free (entire department)
- 2nd-5th: 6 months 50% off
- All participants: 30% off first year

Tracking Dashboard:
- Real-time leaderboard
- Department progress charts
- Individual "MVP" highlights
```

### Bulk Onboarding Flow

New route: `/app/admin/bulk-invite.tsx`

```typescript
// Training Officer can:
// 1. Upload CSV of emails
// 2. Generate department-wide QR code
// 3. Create magic link for shift briefings
// 4. Track onboarding progress

interface BulkInviteOptions {
  method: 'csv' | 'qr' | 'magic_link';
  departmentId: number;
  defaultRole: 'member' | 'protocol_author';
  expiresIn: '24h' | '7d' | '30d' | 'never';
  autoAssignProtocols: boolean;
}
```

### ROI Calculator for Chiefs

Embed on landing page and in sales materials:

```typescript
// Location: /components/landing/roi-calculator.tsx

interface ROIInputs {
  personnelCount: number;
  callsPerMonth: number;
  avgProtocolLookups: number;
  hourlyLaborCost: number;
}

interface ROIOutputs {
  timeSavedPerYear: number;  // hours
  moneySavedPerYear: number; // dollars
  riskReduction: string;     // qualitative
  breakEvenDays: number;
}

// Formula:
// Time saved = (90s - 2.3s) * lookupsPerCall * callsPerMonth * 12 / 3600
// Money saved = timeSaved * hourlyLaborCost
```

---

## Strategy 3: Unconventional Marketing Tactics

### 1. "Protocol Lookup Race" at Conferences

**Target Events**: EMS World Expo, FDIC, EMS Today

**Mechanic**:
- Set up two stations: Protocol Guide vs Traditional Book
- Race to find specific protocol
- Winner gets Protocol Guide swag + free Pro year
- Record times, display on leaderboard
- Collect contact info for follow-up

**Expected Outcome**: 200+ leads per conference, social media content

### 2. Union Partnership Program

**Target**: IAFF (International Association of Fire Fighters)

**Offer**:
- Free Pro for all union reps
- 30% member discount
- Featured in union newsletter
- Booth at union events

### 3. Student Ambassador Network

```
Program: "Protocol Guide Campus Reps"
Target: Top 50 EMT/Paramedic programs

Benefits for Ambassadors:
- Free Pro lifetime (while student + 1 year post-grad)
- $25 per signup (up to $500/semester)
- Branded swag kit
- Resume builder, reference letter

Responsibilities:
- 5 social posts/month
- 2 in-class demos/semester
- Feedback collection
- Recruit next ambassador
```

### 4. EMS Week Blitz (May annually)

**Theme**: "Every Second Counts"

**Daily Promotions**:
| Day | Theme | Offer |
|-----|-------|-------|
| Monday | Thank a Medic | User testimonial campaign |
| Tuesday | Protocol Quiz | In-app trivia, prizes |
| Wednesday | Free Pro Day | 24hr unlimited access for all |
| Thursday | Dept Spotlight | Feature top departments |
| Friday | Referral Bonus | 2x referral rewards |
| Weekend | Give Back | $1 per download to EMS charity |

### 5. Podcast Sponsorship Strategy

**Target Shows**:
- EMS Over Coffee (largest EMS podcast)
- MedicCast
- Inside EMS
- The EMT Spot

**Message Framework**:
```
"This episode brought to you by Protocol Guide -
the app that helps you find the right protocol
in 2 seconds, not 2 minutes. Because on scene,
every second counts. Try it free at protocolguide.app"
```

### 6. Guerrilla Content Strategy

**TikTok/Instagram Reels Series**:

```
"Protocol Lookup Challenge"
- Partner vs Partner race
- Protocol Guide vs Flip Book
- Dramatic timer overlay
- Slow-mo "winning" moment

"Day in the Life" featuring app:
- Real scenarios (with privacy protection)
- Natural product placement
- Partner with EMS influencers

"Stump the App":
- Users submit obscure protocol questions
- Show Protocol Guide finding answers
- Educational and entertaining
```

---

## Technical Implementation Roadmap

### Phase 1: Referral Foundation (2 weeks)

```
Week 1:
- [ ] Create referral schema (drizzle migration)
- [ ] Build referral code generation API
- [ ] Add referral tracking to user signup flow

Week 2:
- [ ] Build ReferralDashboard component
- [ ] Implement share functionality (SMS, WhatsApp, copy)
- [ ] Add "Shift Share" prompt logic
```

### Phase 2: Department Features (3 weeks)

```
Week 3:
- [ ] Department pricing config in Stripe
- [ ] Bulk invite API endpoint
- [ ] CSV upload parser

Week 4:
- [ ] QR code generation for dept onboarding
- [ ] Department admin dashboard enhancements
- [ ] Usage analytics per department

Week 5:
- [ ] ROI calculator component
- [ ] Department landing page template
- [ ] Challenge/campaign infrastructure
```

### Phase 3: Growth Tracking (2 weeks)

```
Week 6:
- [ ] Event tracking for viral actions
- [ ] Referral attribution analytics
- [ ] A/B testing framework for prompts

Week 7:
- [ ] Growth dashboard for admin
- [ ] Automated email sequences (welcome, re-engagement)
- [ ] Push notification campaigns
```

---

## Database Migrations Required

```typescript
// drizzle/migrations/add_referral_system.ts

export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 12 }).notNull().unique(),
  usesCount: int("usesCount").default(0).notNull(),
  maxUses: int("maxUses"),
  rewardType: mysqlEnum("rewardType", ["pro_days", "credits"]).default("pro_days"),
  rewardAmount: int("rewardAmount").default(7).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const referralRedemptions = mysqlTable("referral_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  referralCodeId: int("referralCodeId").notNull(),
  referredUserId: int("referredUserId").notNull(),
  referrerUserId: int("referrerUserId").notNull(),
  referrerReward: json("referrerReward").$type<{type: string; amount: number}>(),
  refereeReward: json("refereeReward").$type<{type: string; amount: number}>(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  attributedRevenue: decimal("attributedRevenue", { precision: 10, scale: 2 }),
});

export const departmentChallenges = mysqlTable("department_challenges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  prizeDescription: text("prizeDescription"),
  scoringConfig: json("scoringConfig").$type<ScoringConfig>(),
  status: mysqlEnum("status", ["upcoming", "active", "ended"]).default("upcoming"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const challengeScores = mysqlTable("challenge_scores", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  agencyId: int("agencyId").notNull(),
  score: int("score").default(0).notNull(),
  breakdown: json("breakdown").$type<ScoreBreakdown>(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});
```

---

## Success Metrics

### Leading Indicators (Weekly)
- Referral codes generated
- Share button taps
- "Shift Share" prompt acceptance rate
- Department demo requests
- Ambassador applications

### Lagging Indicators (Monthly)
- New user signups from referrals
- Referral-to-paid conversion rate
- Department contracts signed
- Viral coefficient (K-factor)
- Net Promoter Score (NPS)

### Growth Dashboard KPIs

```typescript
interface GrowthMetrics {
  // Acquisition
  newUsers: number;
  referralSignups: number;
  organicSignups: number;
  paidSignups: number;

  // Activation
  day1Retention: number;
  firstSearchCompleted: number;
  proTrialStarted: number;

  // Referral
  viralCoefficient: number;
  referralCodesGenerated: number;
  referralConversionRate: number;

  // Revenue
  mrr: number;
  arpu: number;
  ltv: number;
  ltvCacRatio: number;
}
```

---

## Compliance Checklist

### Referral Program
- [ ] FTC disclosure on referral landing pages
- [ ] Clear T&C for reward program
- [ ] No incentives for app store reviews (violation)
- [ ] Proper tracking consent (GDPR/CCPA)

### Department Sales
- [ ] GSA Schedule compliance docs (federal)
- [ ] State procurement requirements
- [ ] BAA ready for HIPAA (if storing PHI)
- [ ] SOC 2 readiness for enterprise

### Marketing Claims
- [ ] "2.3 seconds" claim documented/tested
- [ ] No patient outcome claims without studies
- [ ] Medical director endorsements disclosed
- [ ] "Reference tool" positioning maintained

---

## Next Steps

1. **Immediate (This Week)**:
   - Review and approve growth mechanics design
   - Prioritize Phase 1 referral features
   - Create Stripe products for department tiers

2. **Short-term (This Month)**:
   - Build referral MVP
   - Design department landing page
   - Identify first 3 ambassador campuses

3. **Medium-term (This Quarter)**:
   - Launch referral program
   - Pilot department challenge
   - Secure 2 podcast sponsorships

---

*Document Version: 1.0*
*Last Updated: 2026-01-22*
*Author: Growth Strategy Agent*
