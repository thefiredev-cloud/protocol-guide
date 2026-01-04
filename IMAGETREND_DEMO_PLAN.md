# ImageTrend Demo Meeting: Comprehensive Preparation Plan

**Created**: January 4, 2026
**Purpose**: Preparation materials for second ImageTrend partnership meeting

## Context
- **First meeting**: 30 minutes, went well, 4 ImageTrend employees (admin/management/development)
- **Second meeting**: Product demo requested, not yet scheduled
- **Precedent**: "John" went through their partner program and sold his product to ImageTrend
- **Founder goal**: Keep options open (partnership OR acquisition), open to selling if price is right
- **Key concern**: Don't show so much that they can easily replicate it themselves
- **Legal Entity**: Operating under FireDev LLC

---

## Part 1: Demo Strategy (What to Show vs Protect)

### SHOW (Creates Value Without Revealing Secret Sauce)
| Element | Why It's Safe | Impact |
|---------|---------------|--------|
| **Live protocol queries** | The UX, not the prompts | "Wow, this actually works" |
| **Pediatric dosing calculator** | Obvious feature, execution matters | Clinical credibility |
| **Offline PWA capability** | Architectural choice, not proprietary | Field-ready proof |
| **LA County protocol accuracy** | Content, not how it's retrieved | Domain expertise proof |
| **Response speed (<1 second)** | Result, not implementation | Technical competence |

### PROTECT (Don't Reveal)
| Element | Why It's Valuable | How to Handle |
|---------|-------------------|---------------|
| **System prompts / guardrails** | Core IP, months of tuning | Never share prompt code |
| **RAG architecture details** | Could be replicated | Say "proprietary retrieval" |
| **Knowledge base structure** | How protocols are chunked/embedded | Keep vague |
| **ImageTrend integration code** | Shows exactly how to integrate | Don't demo integration features |
| **Pricing model** | Negotiation leverage | Let them make first offer |

### Demo Script (15-20 minutes)
```
1. Problem Statement (2 min)
   - "Paramedics lose 30 seconds per protocol lookup"
   - "Pediatric dosing errors happen under stress"
   - Show the pain point, establish credibility as firefighter-paramedics

2. Live Product Demo (8-10 min)
   - Query: "chest pain with diaphoresis" → Show protocol match
   - Query: "pediatric epinephrine dose 15kg" → Show calculator
   - Query: "when do I need base hospital contact for hypoglycemia" → Show nuanced retrieval
   - Demonstrate offline mode (airplane mode toggle)
   - Show mobile-optimized UI

3. Validation & Traction (3 min)
   - Medical Director endorsement (9/10 rating)
   - Union VP support
   - Field testing results (91%+ accuracy)
   - Active LA County paramedics eager for pilot

4. Integration Vision (2 min) - HIGH LEVEL ONLY
   - "We've designed for ImageTrend Elite integration"
   - "Narrative export, PCR field population, patient context"
   - DON'T show code or architecture diagrams
   - "We'd need API access to complete the integration"

5. Open Discussion (5 min)
   - Let THEM talk about what they see
   - Listen for acquisition vs partnership signals
```

---

## Part 2: Technical Demo Environment Setup

### Recommended: Polished Local Development
**Why local, not production:**
- More control over what's shown
- Can disconnect internet to demo offline
- Avoids any production issues during meeting

### Setup Tasks
| Task | Priority | Time |
|------|----------|------|
| Fresh local environment with clean test data | High | 2 hours |
| Pre-test all demo queries (ensure they work) | High | 1 hour |
| Remove any debug/dev UI elements | Medium | 30 min |
| Test offline mode thoroughly | High | 30 min |
| Prepare backup: screen recording of demo | High | 1 hour |
| Test on iPad/tablet (field device simulation) | Medium | 30 min |

---

## Part 3: Acquisition vs Partnership Analysis

### Signals to Listen For

**Acquisition Interest Signals:**
- "Have you thought about what an exit might look like?"
- "How much have you invested in this so far?"
- "Would you consider joining our team?"
- "What's your company structure?"
- "Who owns the IP?"

**Partnership Interest Signals:**
- "How would the revenue share work?"
- "What's your pricing model?"
- "How would support work?"
- "What's your go-to-market plan?"

### Valuation Framework (If Acquisition Comes Up)

**Your Assets:**
| Asset | Value Driver |
|-------|--------------|
| Working product | 8 months of development |
| LA County validation | Medical director + union endorsement |
| Domain expertise | Active firefighter-paramedics |
| Protocol knowledge base | LA County specific, curated |
| First-mover advantage | No comparable ImageTrend AI feature exists |

**Comparable Deals (EMS Software):**
- Small tuck-in acquisitions: $500K - $2M
- Strategic acquisitions with customer base: $2M - $10M
- Revenue multiple (if any revenue): 3-8x ARR

**Your Leverage:**
1. You could integrate with ESO or Zoll instead
2. LA County is already interested (even without ImageTrend)
3. You're building the feature they eventually need
4. Time = competitor risk for them

**Counter-Leverage (Be Realistic):**
1. No revenue, no customers yet
2. They could build this in 6-12 months
3. You need their integration more than they need you

### Negotiation Talking Points

**If They Ask About Acquisition:**
- "We're open to conversations about the right structure"
- "What did the partnership-to-acquisition path look like for others?"
- "What would integration into ImageTrend look like for the founders?"
- Don't give a number first - make them anchor

**If They Push for Partnership Details:**
- "We're still exploring the right model"
- "We'd want to understand API access and go-to-market support first"
- "What does your typical partner relationship look like?"

---

## Part 4: Materials to Prepare

### Required Before Meeting
| Material | Status | Action |
|----------|--------|--------|
| Demo script (above) | Create | Write out and practice |
| Backup demo video | Create | Screen record full demo flow |
| One-pager (non-technical) | Create | See template below |
| Company info | Ready | FireDev LLC |

### Legal Entity Note
- Operating under **FireDev LLC** (software development company)
- Can assign Protocol-Guide IP to this entity for any deal
- If acquisition: may need to spin out or assign IP specifically
- Have entity details ready if they ask

### ImageTrend-Specific One-Pager Template
```
Contents:
1. Problem (30 seconds lookup time, dosing errors)
2. Solution (AI protocol assistant)
3. Why ImageTrend (Elite integration, shared customers)
4. Traction (LA County validation)
5. Ask (API access for sandbox integration)

DO NOT INCLUDE:
- Technical architecture
- Pricing details
- Detailed feature roadmap
```

### DON'T Bring
- Technical architecture diagrams
- Code samples
- Detailed integration documentation
- Pricing proposals (let them ask)

---

## Part 5: Post-Meeting Strategy

### Scenarios and Responses

**Scenario A: "We want to acquire you"**
- Ask for term sheet or LOI
- Don't commit to exclusivity without compensation
- Get specifics on: price range, structure, founder roles
- Ask for time to consider (7-14 days minimum)

**Scenario B: "We want to partner"**
- Ask for partner program details in writing
- Request sandbox API access
- Clarify revenue share expectations
- Get timeline for integration certification

**Scenario C: "We need to think about it"**
- Ask for specific follow-up timeline
- Offer to answer any questions async
- Mention you're also exploring other options (creates urgency)

**Scenario D: "We're building something similar"**
- Pivot to acquisition conversation
- Emphasize time-to-market advantage
- Highlight LA County relationships

---

## Part 6: Implementation Checklist

### Week Before Meeting
- [ ] Clean up local demo environment
- [ ] Test all demo queries multiple times
- [ ] Record backup demo video
- [ ] Create ImageTrend-specific one-pager
- [ ] Practice demo script with Christian (co-founder)
- [ ] Prepare questions to ask THEM
- [ ] Research ImageTrend team members attending

### Day Before Meeting
- [ ] Full demo dry run
- [ ] Test internet connectivity backup
- [ ] Charge all devices
- [ ] Review their partner program page again
- [ ] Prepare notebook for notes during meeting

### Day of Meeting
- [ ] Arrive/connect 10 min early
- [ ] Test screen share before demo
- [ ] Have backup device ready
- [ ] Take notes on their reactions and questions

---

## Summary: The Core Strategy

**Goal**: Impress them enough to get a term sheet (partnership or acquisition) without revealing how to replicate the product.

**Key Messages**:
1. "This works today, in the field, validated by LA County medical leadership"
2. "We designed this for ImageTrend Elite integration"
3. "Active firefighter-paramedics understand the problem deeply"
4. "We're exploring the best path forward and are open to options"

**What NOT to Say**:
- Specific pricing numbers (let them anchor)
- Technical implementation details
- "We need you" (maintains leverage)
- Commitment to exclusivity without compensation

---

## Why They Won't Just "Steal It"

Building this would cost ImageTrend:
- 4-5 engineers for 6-12 months = $500K-$1M+ in salary
- Time to learn EMS domain (you already have it)
- Risk of building something that doesn't resonate with paramedics
- LA County relationships that took you time to build

Acquiring/partnering with you is likely cheaper and faster for them.
