
import { Protocol } from '../../../types';

/**
 * TP-1232 - Stroke / CVA / TIA
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 *
 * CRITICAL PROTOCOL - Stroke is a time-sensitive emergency
 * "Time is Brain" - Every minute without treatment = 1.9 million neurons lost
 */
export const tp1232: Protocol = {
  id: "1232",
  refNo: "TP-1232",
  title: "Stroke / CVA / TIA",
  category: "Neurology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  tags: ["stroke", "CVA", "TIA", "mLAPSS", "LAMS", "LVO", "thrombolytic", "tPA", "thrombectomy", "neuro", "brain attack", "cerebrovascular", "hemiparesis", "aphasia", "facial droop"],
  icon: "psychology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Stroke / CVA / TIA", subtitle: "Adult • Standing Order • Time Critical", icon: "psychology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Stroke - CVA (STRK)", content: "Acute neurologic deficit consistent with cerebrovascular accident. Focal weakness, speech difficulty, facial asymmetry." },
        { title: "TIA - Transient Ischemic Attack (TIAS)", content: "Stroke symptoms that have resolved. Still requires emergent evaluation - high risk for completed stroke within 48 hours." },
        { title: "Stroke - Hemorrhagic (STRH)", content: "Suspected hemorrhagic stroke. Sudden severe headache, vomiting, rapid deterioration. Field differentiation not possible - treat as ischemic until CT." }
      ]
    },
    {
      type: "warning",
      content: "<b>TIME IS BRAIN</b><br>Every minute of untreated stroke = 1.9 million neurons lost.<br><br><b>Treatment Windows:</b><br>• tPA (Alteplase): ≤4.5 hours from Last Known Well Time (LKWT)<br>• Thrombectomy (LVO): ≤24 hours from LKWT (with imaging selection)<br><br><b>Document LKWT precisely</b> - This determines treatment eligibility."
    },
    {
      type: "section",
      title: "Stroke Recognition"
    },
    {
      type: "accordion",
      title: "mLAPSS - Modified Los Angeles Prehospital Stroke Screen",
      items: [
        {
          title: "Screening Criteria (ALL must be met)",
          content: "<b>1.</b> Age ≥40 years<br><b>2.</b> No history of seizures or epilepsy<br><b>3.</b> NOT wheelchair-bound or bedridden at baseline<br><b>4.</b> Blood glucose between 60-400 mg/dL<br><b>5.</b> Symptom duration < 24 hours"
        },
        {
          title: "Motor Exam (ONE abnormal = positive)",
          content: "<b>Facial Droop:</b> Ask patient to smile or show teeth. Look for asymmetry.<br><b>Arm Drift:</b> Arms extended, palms up, eyes closed for 10 seconds. Watch for drift or pronation.<br><b>Grip Strength:</b> Compare both hands simultaneously. Note unilateral weakness."
        },
        {
          title: "mLAPSS Positive",
          content: "Criteria met + Any unilateral motor deficit = <b>STROKE ALERT</b><br>→ Transport to Stroke Center (PSC or CSC)"
        },
        {
          title: "mLAPSS Negative",
          content: "Does NOT rule out stroke. If clinical suspicion remains high, calculate LAMS score and transport to stroke center."
        }
      ]
    },
    {
      type: "accordion",
      title: "LAMS - Los Angeles Motor Scale (LVO Predictor)",
      items: [
        {
          title: "Facial Droop (0-1 points)",
          content: "<b>0</b> = Absent (normal, symmetric)<br><b>1</b> = Present (asymmetric smile, facial weakness)"
        },
        {
          title: "Arm Drift (0-2 points)",
          content: "<b>0</b> = Absent (arms stay up 10 seconds)<br><b>1</b> = Drifts down (arm drifts but doesn't fall)<br><b>2</b> = Falls rapidly or no movement"
        },
        {
          title: "Grip Strength (0-2 points)",
          content: "<b>0</b> = Normal (equal grip bilaterally)<br><b>1</b> = Weak grip (unilateral weakness)<br><b>2</b> = No grip (unable to squeeze)"
        },
        {
          title: "LAMS Score Interpretation",
          content: "<b>LAMS 0-3:</b> Lower probability of LVO → Transport to nearest Stroke Center (PSC or CSC)<br><b>LAMS 4-5:</b> HIGH probability of LVO → Transport to <b>Comprehensive Stroke Center (CSC)</b> if ≤30 min transport time"
        }
      ]
    },
    {
      type: "info",
      title: "Large Vessel Occlusion (LVO)",
      content: "<b>LVO = Thrombectomy Candidate</b><br><br>LVO strokes involve major cerebral arteries (MCA, ICA, basilar) and require mechanical thrombectomy at a Comprehensive Stroke Center (CSC).<br><br><b>Signs suggesting LVO:</b><br>• LAMS 4-5<br>• Severe deficits (dense hemiplegia, gaze deviation, aphasia)<br>• Neglect (patient unaware of affected side)<br>• Rapid symptom onset with maximum deficit at start"
    },
    {
      type: "section",
      title: "Last Known Well Time (LKWT)"
    },
    {
      type: "clinical-pearl",
      title: "Determining LKWT",
      content: "<b>LKWT = Last time patient was witnessed to be at their neurologic baseline</b><br><br><b>Key Questions:</b><br>1. When was the patient last seen normal?<br>2. Was symptom onset witnessed? If yes, exact time?<br>3. If patient woke with symptoms, LKWT = time they went to sleep<br>4. If unwitnessed, LKWT = last time someone saw them normal<br><br><b>Document precisely:</b> \"Patient last seen normal at 0730 by wife\" vs \"Wife found patient with slurred speech at 0915\""
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "Prehospital Stroke Management",
      items: [
        { title: "1. Scene Assessment", content: "Note exact time of symptom onset or LKWT. Identify witnesses. Look for medication lists (especially anticoagulants)." },
        { title: "2. Primary Survey", content: "Airway management, SpO2 monitoring. Maintain SpO2 ≥94%. Do NOT hyperventilate." },
        { title: "3. Obtain Blood Glucose", content: "Rule out hypoglycemia (< 60 mg/dL can mimic stroke). Treat hypoglycemia per TP-1203." },
        { title: "4. Perform mLAPSS", content: "Document each component. If positive, initiate Stroke Alert." },
        { title: "5. Calculate LAMS", content: "Score 0-5. LAMS ≥4 suggests LVO requiring CSC destination." },
        { title: "6. Obtain 12-Lead ECG", content: "Look for atrial fibrillation (common stroke etiology). Transmit to receiving facility." },
        { title: "7. Early Notification", content: "Contact receiving stroke center ASAP. Provide: LKWT, mLAPSS findings, LAMS score, anticoagulant use, ETA." },
        { title: "8. Rapid Transport", content: "Do NOT delay scene time. Target <10 min scene time for stroke alerts. Position patient with HOB 30 degrees." }
      ]
    },
    {
      type: "accordion",
      title: "Supportive Care",
      items: [
        {
          title: "Blood Pressure Management",
          content: "<b>DO NOT treat hypertension in the field</b> unless directed by medical control.<br><br>Elevated BP is a protective response in acute stroke (maintains cerebral perfusion).<br><br><b>Exception:</b> SBP > 220 or DBP > 120 with signs of end-organ damage (chest pain, pulmonary edema) - contact medical control."
        },
        {
          title: "Airway Management",
          content: "<b>GCS ≤8:</b> Consider advanced airway (i-gel preferred). Avoid hyperventilation.<br><b>Target EtCO2:</b> 35-40 mmHg. Hypocapnia causes cerebral vasoconstriction.<br><b>SpO2 Target:</b> 94-98%. Avoid hypoxia but also avoid hyperoxia."
        },
        {
          title: "IV Access",
          content: "Establish large-bore IV (18g preferred). Draw labs if capable.<br><b>Fluid:</b> NS at TKO rate. Avoid dextrose-containing fluids (hyperglycemia worsens outcomes)."
        },
        {
          title: "Positioning",
          content: "Transport with HOB elevated 30 degrees if BP stable. Flat if hypotensive. Protect paralyzed extremities."
        }
      ]
    },
    {
      type: "section",
      title: "Destination Criteria"
    },
    {
      type: "list",
      title: "Stroke Center Destination Decision",
      items: [
        {
          title: "LAMS 4-5 (Suspected LVO)",
          content: "Transport to <b>Comprehensive Stroke Center (CSC)</b> if transport time ≤30 minutes.<br>If CSC >30 min, transport to nearest PSC (they can transfer for thrombectomy)."
        },
        {
          title: "LAMS 0-3 (Lower LVO Risk)",
          content: "Transport to nearest <b>Primary Stroke Center (PSC)</b> or CSC.<br>Both can administer tPA. PSC can transfer to CSC if LVO confirmed on imaging."
        },
        {
          title: "LKWT > 4.5 hours",
          content: "Still transport to stroke center. Thrombectomy may be possible up to 24 hours with favorable imaging."
        },
        {
          title: "TIA (Resolved Symptoms)",
          content: "Still requires emergent evaluation. Transport to stroke center. High risk of completed stroke within 24-48 hours."
        }
      ]
    },
    {
      type: "accordion",
      title: "Posterior Circulation Stroke",
      items: [
        {
          title: "Recognition Challenges",
          content: "Posterior strokes (vertebrobasilar) often missed because they lack classic hemiparesis. May present as \"intoxication.\""
        },
        {
          title: "Warning Signs (BEFAST-VR)",
          content: "<b>B</b>alance - Sudden loss of balance, vertigo, ataxia<br><b>E</b>yes - Visual disturbance, diplopia, visual field cut<br><b>F</b>ace - Facial droop/weakness<br><b>A</b>rm - Arm weakness/drift<br><b>S</b>peech - Slurred speech, aphasia<br><b>T</b>ime - Time of symptom onset<br><b>V</b>ertigo - Sudden severe vertigo<br><b>R</b>etinal - Visual changes"
        },
        {
          title: "Clinical Pearl",
          content: "If patient presents with sudden vertigo, diplopia, ataxia, or dysarthria - perform mLAPSS even if appears intoxicated. Basilar artery stroke is life-threatening."
        }
      ]
    },
    {
      type: "section",
      title: "Special Populations"
    },
    {
      type: "info",
      title: "Pediatric Stroke",
      content: "<b>Stroke CAN occur in children</b> - often delayed recognition.<br><br><b>Risk Factors:</b> Sickle cell disease, congenital heart disease, arteriovenous malformation, prothrombotic disorders.<br><br><b>Presentation:</b> Similar to adults - focal weakness, speech changes, altered mental status, seizures.<br><br><b>Action:</b> Apply mLAPSS regardless of age if stroke suspected. Transport to Pediatric Medical Center (PMC) with neurology capability if available."
    },
    {
      type: "accordion",
      title: "Stroke Mimics",
      items: [
        {
          title: "Common Mimics",
          content: "<b>Hypoglycemia:</b> Always check blood glucose first.<br><b>Postictal (Todd's) paralysis:</b> Focal weakness after seizure, usually resolves in 24-48 hrs.<br><b>Complex migraine:</b> Aura with focal deficits, usually has headache and history.<br><b>Hypertensive encephalopathy:</b> Altered mental status with severe hypertension.<br><b>Conversion disorder:</b> Inconsistent exam, psychiatric history."
        },
        {
          title: "Key Point",
          content: "When in doubt, treat as stroke. Let the hospital differentiate with CT imaging. The consequence of missing a stroke far outweighs over-triage."
        }
      ]
    },
    {
      type: "accordion",
      title: "Anticoagulant Considerations",
      items: [
        {
          title: "Document Anticoagulant Use",
          content: "Critical information for tPA eligibility. Common anticoagulants:<br>• <b>Warfarin</b> (Coumadin)<br>• <b>Apixaban</b> (Eliquis)<br>• <b>Rivaroxaban</b> (Xarelto)<br>• <b>Dabigatran</b> (Pradaxa)<br>• <b>Enoxaparin</b> (Lovenox)"
        },
        {
          title: "Last Dose Timing",
          content: "If patient on anticoagulant, document last dose time. This affects treatment decisions."
        }
      ]
    },
    {
      type: "section",
      title: "Documentation Essentials"
    },
    {
      type: "list",
      title: "Critical Documentation Elements",
      items: [
        { title: "LKWT", content: "Exact time patient was last at neurologic baseline. Most important data point." },
        { title: "Symptom Onset Time", content: "If witnessed, exact time symptoms began." },
        { title: "mLAPSS Components", content: "Document each screening criterion (age, seizure history, baseline function, glucose, motor exam)." },
        { title: "LAMS Score", content: "Score 0-5 with component breakdown." },
        { title: "Medications", content: "Especially anticoagulants and last dose time." },
        { title: "Pre-notification Time", content: "When stroke center was notified." },
        { title: "Blood Glucose", content: "Document value to rule out hypoglycemic mimic." }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Scene Time Goal:</b> <10 minutes for stroke alerts. Stroke is a load-and-go emergency.<br><br><b>LKWT vs Onset:</b> LKWT is when patient was last NORMAL. Onset is when symptoms were first NOTICED. They may differ.<br><br><b>Wake-Up Strokes:</b> ~20% of strokes occur during sleep. LKWT = bedtime, not when patient woke.<br><br><b>Pre-notification:</b> Calling ahead reduces door-to-needle time by 15-20 minutes.<br><br><b>Never say \"TIA\" in field:</b> If symptoms resolved, still say \"stroke symptoms\" - TIA diagnosis requires imaging to exclude stroke."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1229 Altered Level of Consciousness" },
        { title: "TP-1231 Seizure" },
        { title: "TP-1203 Diabetic Emergencies (Hypoglycemia)" },
        { title: "TP-1212 Bradycardia" },
        { title: "TP-1207 Shock / Hypotension" },
        { title: "Ref. 521 Stroke Patient Destination" },
        { title: "MCG 1302 Airway Management" }
      ]
    }
  ]
};
