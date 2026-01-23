# Protocol Guide Pricing Strategy - Quick Reference

**Created:** January 22, 2026
**Full Strategy:** See PRICING_STRATEGY.md
**Implementation Plan:** See PRICING_IMPLEMENTATION_PLAN.md

---

## TL;DR - Recommended Changes

### Current Pricing (Undervalued)
- **Free:** 5 queries/day, 1 county
- **Pro:** $4.99/month or $39/year

### New Pricing (Recommended)
- **Free:** 3 queries/day, 1 county, 3 bookmarks, 7-day history
- **Pro:** $9.99/month or $89/year (25% savings)
- **Department:** $199/year (1-10 users) or $89/user/year (11+)
- **Enterprise:** Custom ($5K+ for large agencies/states)

**Impact:** 2x revenue per user, enables department sales ($2-10K deals)

---

## Why Change?

### Market Validation
- **Competitor pricing:** Professional EMS apps charge $5-15/month
- **Value delivered:** 15-63 hours saved/year = $375-1,575 value
- **Current price:** Undervalued by 50-100%
- **EMS market:** Willing to pay for time-saving, liability-reducing tools

### Business Goals
- Current $4.99/month → Hard to reach $500K ARR with individual sales alone
- Department licensing → Single $5K deal = 1,000 individual months
- Sustainable pricing → Supports better product development

---

## Pricing Comparison Table

| Feature | Free | Pro | Department | Enterprise |
|---------|------|-----|------------|------------|
| **Price** | $0 | $9.99/mo | $89/user/yr | Custom |
| **Annual** | - | $89/yr (save $31) | Min $199/yr | $5K+ |
| **Queries/day** | 3 | Unlimited | Unlimited | Unlimited |
| **Counties** | 1 | Unlimited | Unlimited | Unlimited |
| **AI Model** | Haiku | Smart | Smart | Smart |
| **Bookmarks** | 3 | Unlimited | Unlimited | Unlimited |
| **History** | 7 days | Forever | Forever | Forever |
| **Offline** | ✗ | ✓ | ✓ | ✓ |
| **Voice** | ✗ | ✓ | ✓ | ✓ |
| **Custom Protocols** | ✗ | ✗ | ✓ | ✓ |
| **Admin Dashboard** | ✗ | ✗ | ✓ | ✓ |
| **Support** | Self | Email | Email | Phone |

---

## Revenue Projections

### Year 1 (Conservative)
- **Individual Pro:** 650 users × $107 avg = $69,550
- **Departments:** 12 deals × $2,500 avg = $30,000
- **Total Year 1 ARR:** $99,550

### Year 2 (Moderate Growth)
- **Individual Pro:** 2,000 users × $107 avg = $214,000
- **Departments:** 40 deals × $3,500 avg = $140,000
- **Total Year 2 ARR:** $354,000

### Year 3 (Target)
- **Individual Pro:** 4,000 users × $107 avg = $428,000
- **Departments:** 80 deals × $5,000 avg = $400,000
- **Total Year 3 ARR:** $828,000

**Key Insight:** Department licensing becomes 50%+ of revenue by Year 2

---

## Department Opportunity Size

| Segment | Agencies | Avg Users | Price/Year | Total TAM |
|---------|----------|-----------|------------|-----------|
| Small (1-10) | 1,200 | 5 | $199 | $238K |
| Mid (11-100) | 1,200 | 30 | $2,670 | $3.2M |
| Large (100+) | 338 | 150 | $13,350 | $4.5M |
| **Total** | **2,738** | - | - | **$7.9M** |

---

## Implementation Timeline

### Week 1: Setup (Jan 22-28)
- [ ] Create new Stripe products/prices
- [ ] Database migrations for departments
- [ ] Update environment variables

### Week 2: Free Tier Changes (Jan 29-Feb 4)
- [ ] Reduce free queries: 5 → 3/day
- [ ] Add bookmark limit: 3 max
- [ ] Add history limit: 7 days
- [ ] Deploy upgrade prompts

### Week 3: Launch New Pricing (Feb 5-11)
- [ ] Update pricing page
- [ ] Deploy for NEW customers only
- [ ] Grandfather existing $4.99 users
- [ ] Monitor conversion rate daily

### Week 4-6: Department MVP (Feb 12-25)
- [ ] Build admin dashboard
- [ ] Bulk user management
- [ ] Sales collateral (deck, one-pager)
- [ ] First 3 department customers

### Month 4+: Scale & Optimize
- [ ] Run Van Westendorp survey (100+ responses)
- [ ] A/B test pricing page variants
- [ ] Migrate existing users (3-month notice)
- [ ] Department sales outreach

---

## Pricing Psychology Applied

### Anchoring
- Show annual savings: "Just $7.42/month when billed annually"
- Enterprise pricing anchors Pro as affordable

### Decoy Effect
- Pro tier positioned as "best value"
- Free tier creates contrast (limited vs unlimited)

### Loss Aversion
- "Upgrade now to keep your bookmarks" (when limit hit)
- "Don't lose your search history"

### Social Proof
- "Join 2,500+ paramedics"
- "Trusted by [X] departments"

### Urgency (Limited Use)
- "Last chance to lock in $4.99/month" (for existing users)
- "3/3 queries used today. Upgrade for unlimited"

---

## Key Metrics to Track

### Conversion Funnel
- **Activation:** % of sign-ups completing first search (target: 80%)
- **Engagement:** % hitting query limit (target: 40%)
- **Conversion:** Free → Pro (target: 15-25%)
- **Time to convert:** Average days (target: 14-30)

### Revenue Metrics
- **ARPU (Average Revenue Per User):** Target $107/year ($89 annual + $120 monthly avg)
- **MRR (Monthly Recurring Revenue):** Track growth
- **CAC (Customer Acquisition Cost):** Target <$50 for individual, <$500 for department
- **LTV (Lifetime Value):** Target $500+ individual, $10K+ department

### Department Metrics
- **Demo → Trial:** Target 60%
- **Trial → Close:** Target 30-40%
- **Average Deal Size:** Target $2,500
- **Sales Cycle:** Target 60-90 days

---

## Competitive Positioning

### vs Paper Protocols
- **Advantage:** 100x faster, searchable, always current
- **Price:** "Less than one tank of gas per month"

### vs Agency PDFs
- **Advantage:** AI answers, multi-jurisdiction, voice input
- **Price:** "Cost of 2 coffees per month"

### vs Medical Reference Apps (UpToDate, Epocrates)
- **Advantage:** EMS-specific, protocol-focused, jurisdiction-aware
- **Price:** 85% cheaper than UpToDate ($9.99 vs $50/month)

### vs EMS Software (ImageTrend, ESO)
- **Advantage:** Focused, affordable, easy to adopt
- **Price:** 90% cheaper ($200 vs $2K+ per agency)

---

## Objection Handling

### "That's too expensive for an app"
**Response:** "Protocol Guide saves you 15+ hours per year. At $25/hour, that's $375 in time savings. We charge less than 10% of the value we provide. Plus, many departments cover the cost as a training/CE expense."

### "My agency should pay for this"
**Response:** "Absolutely! We offer department licensing starting at $199/year for up to 10 users. Want me to send you info to share with your chief?"

### "I can just use my agency's PDFs"
**Response:** "Totally fair! Most paramedics do. But how long does it take you to find the right protocol when a PDF is 200+ pages? Protocol Guide gets you the answer in 2 seconds, not 2 minutes. That's the difference when time matters."

### "What if I change agencies/counties?"
**Response:** "Pro gives you unlimited counties. Work in multiple jurisdictions? Mutual aid calls? You're covered. Switch agencies? Just change your primary county. Your subscription follows you."

### "I don't trust AI for medical decisions"
**Response:** "Great instinct! Protocol Guide doesn't replace your clinical judgment—it helps you quickly find your agency's protocols. The AI pulls directly from your approved protocols, not the internet. You're still following YOUR medical director's orders, just faster."

---

## Free Tier Strategy

### Purpose
1. **Acquisition:** Low-friction entry point
2. **Activation:** Let users experience core value
3. **Conversion:** Create upgrade triggers

### Upgrade Triggers
1. **Query Limit:** "You've used 3/3 queries today" (60% of conversions)
2. **County Limit:** "Add unlimited counties with Pro" (25%)
3. **Bookmark Limit:** "Save unlimited protocols" (10%)
4. **History Limit:** "Your search from 8 days ago is gone" (5%)

### What NOT to Do
- ✗ Make free tier so good they never upgrade
- ✗ Make free tier so bad they never activate
- ✓ Sweet spot: Enough to see value, not enough for daily pro use

---

## Department Sales Playbook

### Ideal Customer Profile (ICP)
- **Size:** 10-100 paramedics
- **Type:** Career department (not volunteer)
- **Pain:** Training new hires, protocol updates, multi-jurisdiction responses
- **Budget:** $1K-10K/year for training/software

### Decision Makers
1. **EMS Chief:** Budget authority
2. **Training Officer:** Day-to-day champion
3. **Medical Director:** Clinical approval

### Sales Process
1. **Inbound Lead:** Contact sales form
2. **Discovery Call:** 15 min, understand needs
3. **Demo:** 15-30 min, show value
4. **Trial:** 30 days, 5-10 users
5. **Proposal:** Custom quote based on # users
6. **Procurement:** Handle PO process
7. **Onboarding:** Kickoff call, setup, training
8. **Expansion:** Upsell from trial users to full agency

### Sales Collateral Needed
- [ ] One-pager (PDF)
- [ ] Demo deck (15 slides)
- [ ] ROI calculator (spreadsheet)
- [ ] Case studies (2-3)
- [ ] Pricing sheet
- [ ] Sample contract
- [ ] Onboarding plan

---

## Van Westendorp Survey (Priority #1)

**Goal:** Validate $9.99/month price point with data

**Timeline:**
- Week 1: Create survey
- Week 2-3: Distribute (email, Reddit, Facebook)
- Week 4: Analyze results

**Hypothesis:**
- Too Cheap: ~$5/month
- Optimal: $9-12/month
- Too Expensive: ~$20/month

**If we're wrong:**
- Results show lower optimal: Test $7.99
- Results show higher optimal: Test $12.99
- Results confirm $9.99: Full steam ahead

**Survey Template:** See docs/pricing-research-survey.md

---

## Risk Mitigation

### Risk: Conversion Rate Drops >30%
**Mitigation:**
- A/B test before full rollout
- Grandfather existing users
- Monitor daily, adjust messaging
- Rollback plan ready

### Risk: Existing Users Churn When Migrated
**Mitigation:**
- 90-day advance notice
- Lock-in offer: "$89/year for 2 years, last chance"
- Expect 15-20% churn (acceptable)
- Focus on higher LTV from remaining users

### Risk: Department Sales Don't Materialize
**Mitigation:**
- Individual pricing still supports business
- Start with self-serve small departments ($199)
- Test messaging/positioning
- Pivot if needed

---

## Success Criteria

### Month 1
- ✓ New pricing live for new customers
- ✓ Conversion rate within 20% of baseline
- ✓ MRR increased 50%+

### Month 3
- ✓ 3+ department customers
- ✓ Van Westendorp survey completed
- ✓ Revenue doubled from Month 1

### Month 6
- ✓ Existing users migrated to new pricing
- ✓ 10+ department customers
- ✓ $10K+ MRR

### Month 12
- ✓ 800+ Pro users
- ✓ 20+ departments
- ✓ $100K+ ARR

---

## Next Actions (This Week)

1. **Review Strategy:** Read PRICING_STRATEGY.md in full
2. **Validate Time Savings:** Survey 20-30 current users on actual time saved
3. **Create Van Westendorp Survey:** Use template in docs/pricing-research-survey.md
4. **Set Up Stripe:** Create new products/prices
5. **Plan Database Migrations:** Review PRICING_IMPLEMENTATION_PLAN.md
6. **Get Feedback:** Share with 2-3 trusted paramedic users

---

## Questions?

- **Full Strategy:** /Users/tanner-osterkamp/Protocol Guide Manus/PRICING_STRATEGY.md
- **Implementation Plan:** /Users/tanner-osterkamp/Protocol Guide Manus/PRICING_IMPLEMENTATION_PLAN.md
- **Survey Template:** /Users/tanner-osterkamp/Protocol Guide Manus/docs/pricing-research-survey.md

**Owner:** Tanner Osterkamp
**Last Updated:** January 22, 2026
