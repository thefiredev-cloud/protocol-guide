import { Protocol } from '../../../types';

/**
 * Ref. 506 - Trauma Triage Criteria
 * Complete Step 1-4 trauma triage criteria from LA County
 * Source: LA County DHS EMS Agency Prehospital Care Manual
 */
export const ref506Trauma: Protocol = {
  id: "506-trauma",
  refNo: "Ref. 506",
  title: "Trauma Triage Criteria",
  category: "Administrative",
  type: "Policy",
  lastUpdated: "Jan 6, 2026",
  icon: "personal_injury",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Trauma Triage Criteria", subtitle: "Ref. 506 • Trauma Center Destination Decision Tool", icon: "personal_injury" }]
    },
    {
      type: "text",
      title: "Purpose",
      content: "Use this 4-step trauma triage tool to determine if a patient meets Trauma Center criteria. <b>Any ONE positive finding at ANY step = Trauma Center destination.</b>"
    },

    // ==========================================
    // STEP 1: PHYSIOLOGIC CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Step 1: Physiologic Criteria (Highest Priority)"
    },
    {
      type: "text",
      content: "<b>Measure vital signs and level of consciousness.</b> ANY of the following = Transport to Trauma Center:"
    },
    {
      type: "list",
      title: "Step 1 Criteria",
      items: [
        { title: "Glasgow Coma Scale", content: "<b>GCS ≤13</b> - Document individual components (E, V, M)" },
        { title: "Systolic Blood Pressure", content: "<b>SBP <90 mmHg</b> (adults) | Age-appropriate hypotension in children" },
        { title: "Respiratory Rate", content: "<b>RR <10 or >29</b> breaths/min, OR need for ventilatory support (intubation, BVM)" }
      ]
    },
    {
      type: "warning",
      content: "<b>Step 1 Positive?</b> → Transport to highest level Trauma Center within transport time guidelines."
    },

    // ==========================================
    // STEP 2: ANATOMIC CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Step 2: Anatomic Criteria"
    },
    {
      type: "text",
      content: "<b>Assess anatomy of injury.</b> ANY of the following = Transport to Trauma Center:"
    },
    {
      type: "list",
      title: "Step 2 Criteria - Penetrating Injuries",
      items: [
        { title: "Penetrating Head/Neck/Torso", content: "Penetrating wounds to head, neck, chest, abdomen, pelvis, or back" },
        { title: "Penetrating Extremities", content: "Penetrating wounds <b>proximal to elbow or knee</b>" }
      ]
    },
    {
      type: "list",
      title: "Step 2 Criteria - Blunt Injuries",
      items: [
        { title: "Chest Wall", content: "<b>Flail chest</b> (≥2 ribs fractured in ≥2 places)" },
        { title: "Skull Fracture", content: "<b>Open or depressed skull fracture</b>" },
        { title: "Amputation", content: "Amputation <b>proximal to wrist or ankle</b>" },
        { title: "Pelvic Fracture", content: "<b>Unstable pelvic fracture</b> (suspected)" },
        { title: "Paralysis", content: "<b>Paralysis</b> - any loss of motor function" },
        { title: "Extremity", content: "<b>Crushed, degloved, or mangled extremity</b>" }
      ]
    },
    {
      type: "warning",
      content: "<b>Step 2 Positive?</b> → Transport to highest level Trauma Center within transport time guidelines."
    },

    // ==========================================
    // STEP 3: MECHANISM OF INJURY CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Step 3: Mechanism of Injury Criteria"
    },
    {
      type: "text",
      content: "<b>Evaluate mechanism of injury.</b> ANY of the following = Consider Trauma Center:"
    },
    {
      type: "list",
      title: "Step 3 Criteria - Falls",
      items: [
        { title: "Adult Falls", content: "Falls <b>>20 feet</b> (approximately 2 stories)" },
        { title: "Pediatric Falls", content: "Falls <b>>10 feet</b> or <b>2-3 times the child's height</b>" }
      ]
    },
    {
      type: "list",
      title: "Step 3 Criteria - Motor Vehicle Crashes",
      items: [
        { title: "Vehicle Intrusion", content: "Intrusion including roof: <b>>12 inches at occupant site</b> OR <b>>18 inches at any site</b>" },
        { title: "Ejection", content: "<b>Ejection (partial or complete)</b> from vehicle" },
        { title: "Death in Vehicle", content: "<b>Death in same passenger compartment</b>" },
        { title: "Vehicle Telemetry", content: "Vehicle telemetry data consistent with high-risk injury" }
      ]
    },
    {
      type: "list",
      title: "Step 3 Criteria - Other Mechanisms",
      items: [
        { title: "Auto vs Pedestrian/Bicycle", content: "Vehicle striking pedestrian or bicyclist at <b>>20 mph</b>" },
        { title: "Motorcycle Crash", content: "Motorcycle crash at <b>>20 mph</b>" }
      ]
    },
    {
      type: "text",
      content: "<b>Note:</b> Step 3 mechanisms ALONE may warrant Trauma Center, but clinical judgment should be applied."
    },

    // ==========================================
    // STEP 4: SPECIAL CONSIDERATIONS
    // ==========================================
    {
      type: "section",
      title: "Step 4: Special Considerations"
    },
    {
      type: "text",
      content: "<b>Evaluate special patient populations.</b> These factors lower threshold for Trauma Center transport:"
    },
    {
      type: "list",
      title: "Step 4 Criteria - Age Considerations",
      items: [
        { title: "Older Adults", content: "<b>Age >55 years</b> - Lower threshold for Trauma Center due to occult injury risk" },
        { title: "Pediatric", content: "<b>Age <15 years</b> - Consider Pediatric Trauma Center (PTC)" }
      ]
    },
    {
      type: "list",
      title: "Step 4 Criteria - Medical Considerations",
      items: [
        { title: "Anticoagulation", content: "Patients on <b>blood thinners</b> (warfarin, DOACs, aspirin) or with bleeding disorders" },
        { title: "Pregnancy", content: "<b>Pregnancy >20 weeks</b> - Transport to Trauma Center with OB capability" },
        { title: "Burns", content: "Patients with <b>burns AND trauma mechanism</b>" },
        { title: "End-Stage Renal Disease", content: "ESRD patients have higher injury mortality" }
      ]
    },
    {
      type: "list",
      title: "Step 4 Criteria - Provider Judgment",
      items: [
        { title: "EMS Provider Judgment", content: "<b>Clinical judgment</b> for concerning mechanism not captured by criteria" },
        { title: "Low-Level Trauma Center", content: "If not a Level I or II Trauma Center, consider additional consultation or transfer" }
      ]
    },

    // ==========================================
    // DESTINATION DECISION
    // ==========================================
    {
      type: "section",
      title: "Destination Decision Summary"
    },
    {
      type: "accordion",
      title: "Transport Destination Logic",
      items: [
        { title: "Step 1 or 2 Positive", content: "→ Transport to <b>highest level Trauma Center</b> (Level I preferred) within transport time guidelines" },
        { title: "Step 3 Positive", content: "→ Transport to <b>Trauma Center</b> (Level I, II, or III)" },
        { title: "Step 4 Considerations", content: "→ Transport to Trauma Center OR consult with medical control" },
        { title: "Pediatric (<15 years)", content: "→ Transport to <b>Pediatric Trauma Center (PTC)</b> if within 30 minutes; otherwise Level I/II TC" },
        { title: "No Criteria Met", content: "→ Transport to closest appropriate ED (Basic or Comprehensive)" }
      ]
    },
    {
      type: "warning",
      content: "<b>Transport Time Guidelines:</b> Level I/II TC or PTC preferred if within 30 minutes ground transport time. Do not bypass appropriate TC for longer transport to 'higher level' center."
    },

    // ==========================================
    // CROSS REFERENCES
    // ==========================================
    {
      type: "link-list",
      title: "Cross References",
      items: [
        { title: "Ref. 504 Trauma Patient Destination" },
        { title: "Ref. 506.1 Trauma Triage Decision Scheme" },
        { title: "Ref. 506.2 9-1-1 Trauma Re-Triage" },
        { title: "Ref. 510 Pediatric Patient Destination" },
        { title: "TP-1244 Traumatic Injury" },
        { title: "LA-DROP Blood Transfusion Protocol" }
      ]
    }
  ]
};
