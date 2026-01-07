import { Protocol } from '../../../types';

/**
 * Consolidated Destination Criteria Reference
 * All LA County EMS specialty center criteria in one searchable document
 * Source: LA County DHS EMS Agency Prehospital Care Manual
 */
export const destinationCriteria: Protocol = {
  id: "criteria-summary",
  refNo: "Destination Criteria",
  title: "LA County Specialty Center Destination Criteria",
  category: "Administrative",
  type: "Reference",
  lastUpdated: "Jan 6, 2026",
  icon: "local_hospital",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Destination Criteria Summary", subtitle: "All Specialty Center Criteria • Quick Reference", icon: "local_hospital" }]
    },
    {
      type: "text",
      title: "Purpose",
      content: "This reference consolidates ALL LA County specialty center destination criteria for rapid field decision-making. Use these criteria to determine appropriate patient destination."
    },

    // ==========================================
    // PMC CRITERIA
    // ==========================================
    {
      type: "section",
      title: "PMC - Pediatric Medical Center Criteria"
    },
    {
      type: "text",
      content: "<b>Age:</b> Pediatric patients ≤14 years old who are <b>critically ill</b> (non-trauma) should be transported to a PMC if within 30 minutes transport time."
    },
    {
      type: "list",
      title: "PMC Referral Criteria (Critically Ill)",
      items: [
        { title: "A. Cardiac Dysrhythmia", content: "Any unstable cardiac rhythm requiring intervention (SVT, bradycardia with poor perfusion, VT)" },
        { title: "B. Severe Respiratory Distress", content: "Requiring advanced airway management, CPAP, or high-flow oxygen. SpO2 <90% despite treatment." },
        { title: "C. Cyanosis", content: "Persistent central cyanosis despite supplemental oxygen therapy" },
        { title: "D. Altered Mental Status", content: "GCS ≤13 without signs of improvement, unresponsive to stimuli" },
        { title: "E. Status Epilepticus", content: "Seizure activity >5 minutes duration or repeated seizures without return to baseline" },
        { title: "F. BRUE", content: "<b>Brief Resolved Unexplained Event</b> in infant ≤12 months of age" },
        { title: "G. Focal Neurologic Signs", content: "Non-trauma related: suspected pediatric stroke, atypical migraine, new focal deficits" },
        { title: "H. Post-Arrest ROSC", content: "Return of spontaneous circulation achieved after cardiac arrest" },
        { title: "I. Sepsis/Shock", content: "Signs of septic shock: hypotension, poor perfusion, altered mental status with suspected infection" },
        { title: "J. Diabetic Emergency", content: "DKA (Kussmaul breathing, fruity odor, AMS) or severe hypoglycemia unresponsive to treatment" },
        { title: "K. Anaphylaxis", content: "Severe allergic reaction with respiratory compromise or hemodynamic instability" },
        { title: "L. Ingestion/Overdose", content: "Toxic ingestion with altered mental status or hemodynamic instability" }
      ]
    },
    {
      type: "warning",
      content: "<b>PMC Transport Time Rule:</b> Transport to PMC if ground transport time ≤30 minutes. If >30 minutes, may transport to most accessible EDAP."
    },

    // ==========================================
    // PTC CRITERIA
    // ==========================================
    {
      type: "section",
      title: "PTC - Pediatric Trauma Center Criteria"
    },
    {
      type: "text",
      content: "<b>Age:</b> Pediatric patients ≤14 years old meeting trauma triage criteria should be transported to a PTC if within 30 minutes transport time."
    },
    {
      type: "list",
      title: "PTC Referral Criteria (Injured Pediatric)",
      items: [
        { title: "Step 1: Physiologic Criteria", content: "GCS ≤13, SBP <90 mmHg (age-appropriate), RR <10 or >29" },
        { title: "Step 2: Anatomic Criteria", content: "Penetrating injury to head/neck/torso, flail chest, amputation, skull fracture, paralysis" },
        { title: "Step 3: Mechanism Criteria", content: "Ejection, death in same compartment, falls >20 feet (or 2x height for child)" },
        { title: "Step 4: Special Considerations", content: "Burns with trauma, pediatric patient judgment" }
      ]
    },
    {
      type: "warning",
      content: "<b>PTC Transport Time Rule:</b> Transport to PTC if ground transport time ≤30 minutes. If PTC not accessible, transport to Level I/II Trauma Center. If neither accessible, transport to PMC or EDAP."
    },

    // ==========================================
    // STROKE CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Stroke Center Criteria (PSC/CSC)"
    },
    {
      type: "accordion",
      title: "mLAPSS - Modified Los Angeles Prehospital Stroke Screen",
      items: [
        { title: "mLAPSS Criteria (ALL must be met)", content: "<b>1.</b> Age ≥40 years<br><b>2.</b> No history of seizures/epilepsy<br><b>3.</b> NOT wheelchair-bound/bedridden at baseline<br><b>4.</b> Blood glucose 60-400 mg/dL<br><b>5.</b> Unilateral motor weakness: Facial asymmetry OR Arm drift OR Grip weakness" },
        { title: "mLAPSS Positive", content: "→ Transport to Stroke Center (PSC or CSC)" },
        { title: "mLAPSS Negative", content: "Does NOT rule out stroke. Calculate LAMS if high clinical suspicion." }
      ]
    },
    {
      type: "accordion",
      title: "LAMS - Los Angeles Motor Scale (0-5)",
      items: [
        { title: "Facial Droop (0-1)", content: "<b>0</b> = Absent<br><b>1</b> = Present" },
        { title: "Arm Drift (0-2)", content: "<b>0</b> = Absent<br><b>1</b> = Drifts down<br><b>2</b> = Falls rapidly/no grip" },
        { title: "Grip Strength (0-2)", content: "<b>0</b> = Normal<br><b>1</b> = Weak<br><b>2</b> = No grip" },
        { title: "LAMS 4-5", content: "<b>LVO LIKELY</b> → Transport to <b>CSC</b> if ≤30 min transport time" },
        { title: "LAMS 0-3", content: "→ Transport to nearest Stroke Center (PSC or CSC)" }
      ]
    },
    {
      type: "text",
      content: "<b>Time Windows:</b> tPA ≤4.5 hours from LKWT | Thrombectomy ≤24 hours from LKWT"
    },

    // ==========================================
    // ECMO/ECPR CRITERIA
    // ==========================================
    {
      type: "section",
      title: "ECMO/ECPR Criteria"
    },
    {
      type: "list",
      title: "ECPR Patient Selection Criteria (MCG 1318)",
      items: [
        { title: "Age", content: "<b>≤75 years old</b>" },
        { title: "Initial Rhythm", content: "<b>Shockable rhythm (VF/VT)</b> - Initial and refractory" },
        { title: "Witnessed Arrest", content: "<b>Witnessed cardiac arrest</b> with immediate bystander CPR" },
        { title: "Refractory VF/VT", content: "Continued VF despite <b>≥2 defibrillations</b>" },
        { title: "Scene Time", content: "<b>≤15 minutes</b> on scene" },
        { title: "Transport Time", content: "Within <b>≤30 minutes</b> to ECPR center" }
      ]
    },
    {
      type: "list",
      title: "ECPR Contraindications (Do NOT transport for ECPR)",
      items: [
        { title: "Traumatic Arrest", content: "Cardiac arrest due to trauma" },
        { title: "DNR/POLST", content: "Valid Do Not Resuscitate order" },
        { title: "Unwitnessed Arrest", content: "No witness and no immediate CPR" },
        { title: "Non-Shockable Rhythm", content: "Initial rhythm PEA or asystole" },
        { title: "Prolonged Downtime", content: "Extended time without CPR" },
        { title: "Transport >30 min", content: "No ECPR center accessible" }
      ]
    },

    // ==========================================
    // TRAUMA CENTER CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Trauma Center Criteria (Adult)"
    },
    {
      type: "accordion",
      title: "Step 1: Physiologic Criteria (Highest Priority)",
      items: [
        { title: "GCS", content: "<b>GCS ≤13</b>" },
        { title: "Blood Pressure", content: "<b>SBP <90 mmHg</b>" },
        { title: "Respiratory Rate", content: "<b>RR <10 or >29</b> breaths/min (or need for ventilatory support)" }
      ]
    },
    {
      type: "accordion",
      title: "Step 2: Anatomic Criteria",
      items: [
        { title: "Penetrating Injuries", content: "Penetrating wounds to head, neck, torso, extremities proximal to elbow/knee" },
        { title: "Chest", content: "Flail chest, open or depressed skull fracture" },
        { title: "Extremities", content: "Amputation proximal to wrist/ankle, pelvic fractures" },
        { title: "Neurologic", content: "Paralysis, crushed/degloved/mangled extremity" },
        { title: "Burns", content: "Burns with other trauma mechanism" }
      ]
    },
    {
      type: "accordion",
      title: "Step 3: Mechanism of Injury Criteria",
      items: [
        { title: "Falls", content: "Adults: <b>>20 feet</b> | Children: <b>>10 feet or 2-3x height</b>" },
        { title: "Vehicle Crashes", content: "Intrusion <b>>12 inches</b> occupant site, <b>>18 inches</b> any site, ejection, death in same compartment" },
        { title: "Auto vs Pedestrian/Bicycle", content: "<b>>20 mph</b> impact" },
        { title: "Motorcycle Crash", content: "<b>>20 mph</b>" }
      ]
    },
    {
      type: "accordion",
      title: "Step 4: Special Considerations",
      items: [
        { title: "Age", content: "<b>>55 years</b> or <b><15 years</b>" },
        { title: "Anticoagulation", content: "Patients on blood thinners or bleeding disorders" },
        { title: "Pregnancy", content: "<b>>20 weeks</b> gestation" },
        { title: "Burns", content: "Patients with burns AND trauma mechanism" },
        { title: "EMS Judgment", content: "Provider clinical judgment for concerning mechanism" }
      ]
    },

    // ==========================================
    // BURN CENTER CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Burn Center Criteria"
    },
    {
      type: "list",
      title: "Burn Center Referral Criteria",
      items: [
        { title: "Surface Area", content: "Partial thickness burns <b>>10% TBSA</b>" },
        { title: "Critical Areas", content: "Burns involving face, hands, feet, genitalia, perineum, or major joints" },
        { title: "Full Thickness", content: "Any full thickness (3rd degree) burn" },
        { title: "Electrical Burns", content: "All electrical burns including lightning" },
        { title: "Chemical Burns", content: "Chemical burns with potential for systemic toxicity" },
        { title: "Inhalation Injury", content: "Suspected inhalation injury (soot, singed nasal hairs, carbonaceous sputum)" }
      ]
    },
    {
      type: "warning",
      content: "<b>Burns + Trauma:</b> If patient meets BOTH Burn and Trauma criteria, Trauma Center destination takes priority."
    },

    // ==========================================
    // STEMI CRITERIA
    // ==========================================
    {
      type: "section",
      title: "STEMI Receiving Center (SRC) Criteria"
    },
    {
      type: "list",
      title: "STEMI Alert Criteria",
      items: [
        { title: "ST Elevation", content: "ST elevation ≥1mm in 2 contiguous limb leads OR ≥2mm in precordial leads" },
        { title: "New LBBB", content: "New or presumably new left bundle branch block with ischemic symptoms" },
        { title: "Age", content: "Adults ≥18 years (pediatric STEMI → use Pediatric Destination)" }
      ]
    },
    {
      type: "text",
      content: "<b>Destination:</b> All patients meeting STEMI criteria → Transport directly to STEMI Receiving Center (SRC). Door-to-balloon goal <90 minutes."
    },

    // ==========================================
    // BLOOD TRANSFUSION CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Blood Transfusion Criteria (LA-DROP)"
    },
    {
      type: "list",
      title: "Prehospital Blood Transfusion Inclusion Criteria",
      items: [
        { title: "Age", content: "≥18 years" },
        { title: "Trauma", content: "Penetrating or blunt trauma with hemorrhagic shock" },
        { title: "Vital Signs", content: "SBP <90 mmHg OR HR >100 with signs of shock" },
        { title: "Consent", content: "Patient not refusing blood products" }
      ]
    },
    {
      type: "list",
      title: "Blood Transfusion Contraindications",
      items: [
        { title: "Refusal", content: "Patient refusing blood transfusion" },
        { title: "No Bleeding", content: "Non-hemorrhagic cause of hypotension" },
        { title: "Cardiac Arrest", content: "Traumatic cardiac arrest (prioritize transport)" }
      ]
    },

    // ==========================================
    // PREGNANCY/OB CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Pregnancy/Perinatal Destination Criteria"
    },
    {
      type: "list",
      title: "Perinatal Center Criteria",
      items: [
        { title: "Gestation", content: "Pregnancy ≥20 weeks with emergency complaint" },
        { title: "Active Labor", content: "Regular contractions with cervical change" },
        { title: "Rupture of Membranes", content: "PROM/PPROM with or without contractions" },
        { title: "Vaginal Bleeding", content: "Vaginal bleeding in pregnancy ≥20 weeks" },
        { title: "Hypertensive Crisis", content: "Preeclampsia/eclampsia (BP ≥160/110, seizures)" },
        { title: "Fetal Distress", content: "Decreased fetal movement, abnormal fetal heart rate" }
      ]
    },
    {
      type: "text",
      content: "<b>Destination:</b> Transport to nearest Perinatal Center (hospital with OB + NICU). If delivery imminent (crowning), transport to closest ED."
    },

    // ==========================================
    // NEONATE/INFANT CRITERIA
    // ==========================================
    {
      type: "section",
      title: "Neonate/Infant Destination Criteria"
    },
    {
      type: "list",
      title: "Neonate Criteria (<28 days old)",
      items: [
        { title: "Any Distress", content: "Respiratory distress, cyanosis, temperature instability, poor feeding, lethargy, seizures" },
        { title: "Fever", content: "Temperature ≥100.4°F (38°C) in neonate is EMERGENCY - transport to NICU-capable facility" },
        { title: "Newly Born", content: "Birth to 2 hours: with distress → Perinatal Center with NICU; no distress → nearest Perinatal Center" }
      ]
    },
    {
      type: "warning",
      content: "<b>Neonatal Fever:</b> Any fever in neonate (<28 days) is a medical emergency requiring full sepsis workup. Transport to NICU-capable facility."
    },

    // ==========================================
    // CROSS REFERENCES
    // ==========================================
    {
      type: "link-list",
      title: "Cross References",
      items: [
        { title: "Ref. 504 Trauma Patient Destination" },
        { title: "Ref. 506 Trauma Triage" },
        { title: "Ref. 507 PMC Standards" },
        { title: "Ref. 510 Pediatric Patient Destination" },
        { title: "Ref. 511 Perinatal Destination" },
        { title: "Ref. 512 Burn Center Destination" },
        { title: "Ref. 521 Stroke Patient Destination" },
        { title: "MCG 1318 ECPR Criteria" },
        { title: "LA-DROP Blood Transfusion Protocol" }
      ]
    }
  ]
};
