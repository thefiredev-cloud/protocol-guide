# Feature: Pediatric Dosing Calculator

## Problem
- 28.8% of pediatric doses are wrong even with reference aids
- Weight-based calculations under stress = errors
- Crews don't run peds calls often enough to have it memorized

## User Story
As a firefighter/paramedic on a pediatric call, I need to get the exact dose in mL for this kid's weight so I don't have to do math under pressure.

## Core Flow
1. Enter weight (kg or lbs - auto-convert)
2. Select medication from LA County formulary
3. See: **"Give X.X mL"** in big text
4. See concentration, route, max dose as secondary info

## LA County Medications (Priority)
- Epinephrine (cardiac, anaphylaxis)
- Midazolam (seizures)
- Dextrose (hypoglycemia - D10 vs D25)
- Diphenhydramine
- Albuterol (weight-based nebulizer)
- Fentanyl (pain)

## UI Requirements
- **Big numbers** - readable in an ambulance
- **Dark mode** - night calls
- **Offline capable** - no cell signal in some areas
- **One-hand operation** - other hand is on the patient
- No login required for calculator (lives on public /tools route)

## Safety
- Show weight range warnings (too light/heavy for age)
- Max dose caps with visual alert
- "Double-check" confirmation before dismissing

## Integration
- Link from protocol search results when medication is mentioned
- ImageTrend can deep-link with `?weight=X&med=epinephrine`

## Success Metrics
- Time to dose: < 10 seconds from weight entry
- Zero math required by user
