
import { Protocol } from '../../../types';

/**
 * TP-1231 - Seizure
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const tp1231: Protocol = {
  id: "1231",
  refNo: "TP-1231",
  title: "Seizure",
  category: "Neurology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  tags: ["seizure", "convulsion", "epilepsy", "status epilepticus", "tonic-clonic", "grand mal", "postictal", "midazolam", "versed", "benzodiazepine", "neuro", "febrile seizure", "eclampsia"],
  icon: "psychology",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Seizure", subtitle: "Adult • Standing Order", icon: "psychology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Seizure - Active (SEAC)", content: "Generalized tonic-clonic activity currently in progress. May include focal seizures with altered awareness." },
        { title: "Seizure - Post (SEPI)", content: "Postictal state following seizure. Patient may be confused, somnolent, or have focal weakness (Todd's paralysis)." },
        { title: "Status Epilepticus (SEPS)", content: "Continuous seizure activity >5 minutes OR repeated seizures without return to baseline between episodes. MEDICAL EMERGENCY." }
      ]
    },
    {
      type: "warning",
      content: "<b>STATUS EPILEPTICUS = TIME-CRITICAL EMERGENCY</b><br><br>Defined as:<br>• Continuous seizure activity ≥5 minutes, OR<br>• ≥2 seizures without return to baseline between episodes<br><br>Prolonged seizures cause neuronal injury, hyperthermia, rhabdomyolysis, aspiration, and death.<br><br><b>Goal:</b> Terminate seizure activity within 5 minutes of EMS arrival."
    },
    {
      type: "section",
      title: "Seizure Recognition"
    },
    {
      type: "accordion",
      title: "Types of Seizures",
      items: [
        {
          title: "Generalized Tonic-Clonic (Grand Mal)",
          content: "<b>Most common EMS presentation.</b><br><br><b>Tonic phase:</b> Sudden loss of consciousness, muscle rigidity, cyanosis, may have incontinence<br><b>Clonic phase:</b> Rhythmic jerking of extremities, tongue biting, drooling<br><br>Typically lasts 1-3 minutes. Followed by postictal state."
        },
        {
          title: "Focal Seizure with Impaired Awareness",
          content: "Previously called \"complex partial seizure.\"<br><br>Patient has altered awareness/consciousness. May have automatisms (lip smacking, picking movements, repetitive behaviors). May progress to generalized seizure."
        },
        {
          title: "Focal Seizure without Impaired Awareness",
          content: "Previously called \"simple partial seizure.\"<br><br>Patient remains conscious. May have focal motor symptoms (arm jerking), sensory symptoms (tingling), or psychic symptoms. Awareness intact."
        },
        {
          title: "Absence Seizure (Petit Mal)",
          content: "Brief (seconds) staring episodes with impaired awareness. No convulsive activity. Primarily in children. Rarely requires EMS intervention."
        }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "Active Seizure Management",
      items: [
        { title: "1. Protect from Injury", content: "Clear hazards from around patient. Cushion head if possible. Do NOT insert anything in mouth. Do NOT restrain patient." },
        { title: "2. Position & Airway", content: "Once seizure stops, place in recovery position (left lateral decubitus). Suction as needed. Apply high-flow O2." },
        { title: "3. Obtain Blood Glucose", content: "Check BG as soon as safe. Hypoglycemia can cause seizures and is easily reversible." },
        { title: "4. Treat Hypoglycemia", content: "If BG < 60 mg/dL: D10 125mL IV or Glucagon 1mg IM if no IV access. (See TP-1203)" },
        { title: "5. Establish IV/IO Access", content: "Attempt IV access when safe. Consider IO if IV unobtainable and medication needed." },
        { title: "6. Time the Seizure", content: "Document seizure duration. If >5 min continuous or repeated without recovery, treat as status epilepticus." }
      ]
    },
    {
      type: "accordion",
      title: "Benzodiazepine Therapy - Status Epilepticus",
      items: [
        {
          title: "Midazolam (Versed) - FIRST LINE",
          content: "<b>Adult Dose:</b><br>• <b>IM:</b> 10 mg single dose (preferred if no IV)<br>• <b>IN:</b> 5 mg per nostril (10 mg total) using MAD device<br>• <b>IV/IO:</b> 5 mg slow push<br><br><b>May repeat x1</b> in 3-5 min if seizure persists.<br><b>Maximum total dose:</b> 10 mg IV or 20 mg IM/IN<br><br><b>Pediatric Dose:</b><br>• <b>IM/IN:</b> 0.2 mg/kg (max 10 mg)<br>• <b>IV/IO:</b> 0.1 mg/kg (max 5 mg)"
        },
        {
          title: "Route Priority",
          content: "<b>1. IM (fastest if no IV)</b> - 10 mg deltoid or vastus lateralis<br><b>2. IN (intranasal)</b> - 5 mg each nostril via MAD<br><b>3. IV/IO</b> - 5 mg slow push over 2 min<br><br>IM route is often faster than establishing IV during active seizure and equally effective."
        },
        {
          title: "Monitoring After Administration",
          content: "Monitor for:<br>• Respiratory depression (have BVM ready)<br>• Hypotension<br>• Excessive sedation<br><br>Be prepared to support airway and ventilation."
        }
      ]
    },
    {
      type: "section",
      title: "Postictal Care"
    },
    {
      type: "accordion",
      title: "Postictal State Management",
      items: [
        {
          title: "Expected Postictal Findings",
          content: "<b>Duration:</b> Minutes to hours (typically 15-30 min)<br><br>• Confusion, disorientation, agitation<br>• Somnolence, lethargy<br>• Headache<br>• Muscle soreness<br>• Amnesia for the event<br>• Gradual return to baseline"
        },
        {
          title: "Todd's Paralysis",
          content: "Focal neurologic deficit (weakness) following seizure, typically affecting area of seizure focus.<br><br>• Usually resolves within 24-48 hours<br>• Can mimic stroke<br>• <b>Key difference:</b> History of witnessed seizure<br>• <b>If uncertain:</b> Treat as stroke (TP-1232)"
        },
        {
          title: "Supportive Care",
          content: "• Left lateral (recovery) position<br>• Supplemental oxygen to maintain SpO2 ≥94%<br>• Suction as needed<br>• Reassure patient as they regain awareness<br>• Monitor for recurrent seizure activity"
        }
      ]
    },
    {
      type: "section",
      title: "Special Populations"
    },
    {
      type: "accordion",
      title: "Eclampsia (Pregnancy)",
      items: [
        {
          title: "Recognition",
          content: "Seizure in pregnant patient ≥20 weeks gestation OR within 6 weeks postpartum.<br><br><b>Risk factors:</b> Preeclampsia (HTN, proteinuria, edema), headache, visual changes, RUQ pain, severe hypertension (≥160/110)."
        },
        {
          title: "Treatment - Magnesium Sulfate",
          content: "<b>Magnesium Sulfate 4g IV/IO</b><br>• Dilute in 100mL NS if time permits<br>• Administer slow IV push over 3-4 minutes<br>• Faster than dilution if actively seizing<br><br><b>For refractory seizure:</b> May give Midazolam 5mg IV per standard protocol."
        },
        {
          title: "Post-Seizure Care",
          content: "• Left lateral positioning (left uterine displacement)<br>• Monitor for repeat seizures<br>• Transport to hospital with OB capability (Perinatal Center)<br>• May require emergent delivery"
        }
      ]
    },
    {
      type: "accordion",
      title: "Pediatric Seizures",
      items: [
        {
          title: "Febrile Seizure",
          content: "Seizure associated with fever in child 6 months - 5 years without CNS infection.<br><br><b>Simple febrile seizure:</b> Generalized, <15 min, single episode, normal postictal<br><b>Complex febrile seizure:</b> Focal, >15 min, multiple in 24 hrs<br><br><b>Treatment:</b> Supportive care, passive cooling. Benzodiazepines typically NOT needed if seizure <5 min."
        },
        {
          title: "Pediatric Dosing",
          content: "<b>Midazolam:</b><br>• IM/IN: 0.2 mg/kg (max 10 mg)<br>• IV/IO: 0.1 mg/kg (max 5 mg)<br>• May repeat x1 in 5 min<br><br><b>Use Broselow tape for weight-based dosing</b>"
        },
        {
          title: "Pediatric Considerations",
          content: "• Children have higher seizure threshold for benzodiazepines<br>• Watch closely for respiratory depression<br>• Consider child abuse if unexplained seizure with trauma<br>• Neonatal seizures often subtle - look for subtle eye deviations, repetitive movements"
        }
      ]
    },
    {
      type: "accordion",
      title: "Known Epilepsy Patient",
      items: [
        {
          title: "Breakthrough Seizure",
          content: "Common causes:<br>• Medication non-compliance<br>• Recent medication change<br>• Illness, sleep deprivation, stress<br>• Alcohol use or withdrawal<br><br>Get list of anti-epileptic medications (AEDs) when possible."
        },
        {
          title: "Vagal Nerve Stimulator (VNS)",
          content: "Some epilepsy patients have implanted VNS. Patient or family may have magnet to activate device during seizure. Allow them to use if available. Does not interfere with treatment."
        },
        {
          title: "Rescue Medications",
          content: "Some patients have prescribed rescue medications:<br>• Diastat (rectal diazepam)<br>• Nayzilam (nasal midazolam)<br>• Valtoco (nasal diazepam)<br><br>If family has already administered rescue medication, document dose and time. Adjust protocol dosing accordingly."
        }
      ]
    },
    {
      type: "section",
      title: "Differential Diagnosis"
    },
    {
      type: "accordion",
      title: "Seizure Mimics",
      items: [
        {
          title: "Syncope with Myoclonus",
          content: "Brief convulsive movements during fainting spell. Usually <30 seconds. Rapid recovery without postictal state."
        },
        {
          title: "Psychogenic Non-Epileptic Seizure (PNES)",
          content: "Previously called \"pseudoseizure.\" Not malingering - involuntary psychological response.<br><br><b>Features suggesting PNES:</b><br>• Asynchronous limb movements<br>• Side-to-side head shaking<br>• Closed eyes (often resisted to opening)<br>• Pelvic thrusting<br>• No postictal state<br>• Avoidance of noxious stimuli<br><br><b>Important:</b> Cannot differentiate reliably in field. Treat as true seizure."
        },
        {
          title: "Other Mimics",
          content: "• <b>Rigors:</b> Shaking with fever, patient is conscious<br>• <b>Movement disorders:</b> Chorea, dystonia, tremor<br>• <b>Hypoglycemia:</b> May cause seizure-like activity<br>• <b>Drug-induced dyskinesia:</b> Antipsychotics, metoclopramide"
        }
      ]
    },
    {
      type: "section",
      title: "Causes of New-Onset Seizure"
    },
    {
      type: "list",
      title: "Evaluate for Underlying Cause",
      items: [
        { title: "Hypoglycemia", content: "Always check glucose first. Most easily reversible cause." },
        { title: "Hypoxia", content: "Check SpO2. Maintain oxygenation." },
        { title: "Head Trauma", content: "Ask about recent trauma. Look for signs of injury." },
        { title: "Stroke/Intracranial Hemorrhage", content: "New-onset seizure in elderly may indicate stroke." },
        { title: "Infection/Fever", content: "Meningitis, encephalitis, febrile seizure in children." },
        { title: "Toxins/Withdrawal", content: "Drug overdose, alcohol withdrawal (typically 24-72 hrs after last drink)." },
        { title: "Metabolic", content: "Hyponatremia, uremia, hepatic encephalopathy." },
        { title: "Eclampsia", content: "Pregnancy ≥20 weeks with hypertension." }
      ]
    },
    {
      type: "section",
      title: "Transport Decisions"
    },
    {
      type: "info",
      title: "Transport Considerations",
      content: "<b>Transport all patients who:</b><br>• Had first-time seizure<br>• Required medication to terminate seizure<br>• Have persistent altered mental status<br>• Have focal neurologic deficits (r/o stroke)<br>• Are pregnant<br>• Have diabetes<br>• Have underlying medical conditions<br><br><b>Refusal considerations:</b> Known epileptic with typical breakthrough seizure, fully recovered to baseline, and reliable follow-up may consider refusal with medical control consultation."
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Timing Matters:</b> Start timing seizure from when YOU observe it, not when family says it started.<br><br><b>IM is Fast:</b> Don't delay benzodiazepine trying to get IV. IM midazolam works within 5 minutes.<br><br><b>Postictal Confusion:</b> Expected and not a reason for additional sedation. Patient will gradually clear.<br><br><b>Todd's vs Stroke:</b> If postictal weakness persists >30 min or uncertain if seizure occurred, treat as stroke.<br><br><b>Document Details:</b> Description of seizure activity (where it started, what it looked like), duration, postictal behavior - helps neurologist determine seizure type.<br><br><b>Safety First:</b> Don't reach into seizing patient's mouth. Tongue biting occurs at onset - you cannot prevent it."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1203 Diabetic Emergencies (Hypoglycemia)" },
        { title: "TP-1217 Eclampsia / Preeclampsia" },
        { title: "TP-1229 Altered Level of Consciousness" },
        { title: "TP-1232 Stroke / CVA / TIA" },
        { title: "TP-1218 Nausea / Vomiting" },
        { title: "MCG 1302 Airway Management" },
        { title: "TP-1309 Pediatric Seizure" }
      ]
    }
  ]
};
