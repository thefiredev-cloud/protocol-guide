# Feature: Blood Product Transfusion Guide

## Problem
- Blood product administration is rare in the field
- Protocol is referenced but not memorized
- LA County has MCG 1333 but crews need quick reference

## User Story
As a paramedic starting a blood transfusion on a trauma patient, I need the monitoring checklist and vital sign intervals so I don't miss a reaction.

## Core Flow
1. Search "blood transfusion" or "1333"
2. See step-by-step checklist
3. Timer for vital sign checks (optional)
4. Reaction recognition + response steps

## Content (from LA County 1333)
- Pre-transfusion checklist
- Vital sign monitoring intervals
- Signs of transfusion reaction
- Reaction response steps
- Documentation requirements

## UI Requirements
- Checklist format with tap-to-complete
- Timer option for "remind me in 15 min"
- Red alert styling for reaction signs
- Works offline

## Integration
- Link from Traumatic Injury (1244) and Shock (1207) protocols
- ImageTrend deep-link: `?search=blood+transfusion`

## Notes
- LA County scope includes "Monitor blood product transfusions" (803)
- Need to verify we have full MCG 1333 indexed
