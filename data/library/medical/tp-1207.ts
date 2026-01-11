
import { Protocol } from '../../../types';

/**
 * TP-1207 - Shock / Hypotension
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const tp1207: Protocol = {
  id: "1207",
  refNo: "TP-1207",
  title: "Shock / Hypotension",
  category: "General Medical",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "low_density_kpi",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Shock / Hypotension", subtitle: "Adult • Standing Order", icon: "low_density_kpi" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Hypotension (HOTN)", content: "SBP < 90 mmHg without signs of poor perfusion. May be asymptomatic or patient's normal baseline." },
        { title: "Shock (SHOK)", content: "Hypotension with inadequate tissue perfusion: Altered mental status, cool/clammy skin, tachycardia, delayed capillary refill, mottling." },
        { title: "Compensated Shock", content: "Signs of poor perfusion with NORMAL blood pressure. Body compensating via tachycardia and vasoconstriction. High index of suspicion required." }
      ]
    },
    {
      type: "warning",
      content: "<b>SHOCK IS A CLINICAL DIAGNOSIS - NOT A BLOOD PRESSURE:</b><br>• Patients can be in shock with normal BP (compensated shock)<br>• Young patients may maintain BP until catastrophic decompensation<br>• Hypotension is a LATE finding indicating decompensation<br><br><b>Signs of Shock:</b><br>• Altered mental status (anxiety, confusion, lethargy)<br>• Tachycardia (may be absent in elderly, beta-blocked patients)<br>• Tachypnea<br>• Cool, pale, diaphoretic skin (NOT in distributive shock)<br>• Delayed capillary refill (> 2 seconds)<br>• Weak/thready pulse<br>• Mottled extremities<br>• Decreased urine output"
    },
    {
      type: "section",
      title: "Types of Shock"
    },
    {
      type: "accordion",
      title: "Shock Classification",
      items: [
        {
          title: "Hypovolemic Shock",
          content: "<b>Cause:</b> Decreased intravascular volume<br><b>Etiologies:</b><br>• Hemorrhage (trauma, GI bleed, ruptured AAA, ectopic pregnancy)<br>• Dehydration (vomiting, diarrhea, DKA, heat illness)<br>• Burns (plasma loss)<br><br><b>Clinical Signs:</b><br>• Flat neck veins<br>• Cool, pale, diaphoretic skin<br>• Tachycardia<br>• Narrow pulse pressure<br><br><b>Treatment:</b> IV fluids (NS), blood products (in-hospital), hemorrhage control, identify source"
        },
        {
          title: "Cardiogenic Shock",
          content: "<b>Cause:</b> Pump failure - heart cannot generate adequate cardiac output<br><b>Etiologies:</b><br>• Acute MI (especially large anterior STEMI)<br>• Acute CHF exacerbation<br>• Severe valvular disease<br>• Arrhythmias<br>• Myocarditis<br><br><b>Clinical Signs:</b><br>• JVD (jugular venous distension)<br>• Pulmonary edema (rales, respiratory distress)<br>• Cool extremities<br>• S3 gallop<br><br><b>Treatment:</b> Limit fluids (can worsen pulmonary edema), vasopressors (push-dose epi), 12-lead ECG, treat underlying cause"
        },
        {
          title: "Distributive Shock",
          content: "<b>Cause:</b> Widespread vasodilation causing maldistribution of blood flow<br><b>Subtypes:</b><br><br><b>1. Septic Shock:</b><br>• Suspected/confirmed infection + hypotension unresponsive to fluids<br>• Warm, flushed skin early; cool skin late<br>• Fever or hypothermia<br>• Treatment: Fluids, vasopressors, source control<br><br><b>2. Anaphylactic Shock:</b><br>• Allergen exposure + hypotension<br>• Urticaria, angioedema, wheezing, GI symptoms<br>• Treatment: Epinephrine IM 0.3-0.5mg, fluids, H1/H2 blockers<br><br><b>3. Neurogenic Shock:</b><br>• Spinal cord injury (usually cervical/high thoracic)<br>• Hypotension + bradycardia (loss of sympathetic tone)<br>• Warm, dry skin below level of injury<br>• Treatment: Fluids cautiously, vasopressors, spine immobilization"
        },
        {
          title: "Obstructive Shock",
          content: "<b>Cause:</b> Mechanical obstruction to blood flow<br><b>Etiologies:</b><br><br><b>1. Tension Pneumothorax:</b><br>• Absent breath sounds, tracheal deviation (late), JVD<br>• Treatment: Needle decompression (MCG 1335)<br><br><b>2. Cardiac Tamponade:</b><br>• Beck's triad: JVD, muffled heart sounds, hypotension<br>• Pulsus paradoxus (> 10 mmHg drop with inspiration)<br>• Treatment: Rapid transport, pericardiocentesis (hospital)<br><br><b>3. Massive Pulmonary Embolism:</b><br>• Acute dyspnea, chest pain, hypotension<br>• Risk factors: immobility, recent surgery, DVT, cancer<br>• Treatment: Supportive, thrombolytics (hospital)<br><br><b>All obstructive shock:</b> Fluid resuscitation alone will NOT work - must treat underlying obstruction"
        }
      ]
    },
    {
      type: "section",
      title: "Assessment"
    },
    {
      type: "list",
      title: "Initial Evaluation",
      items: [
        { title: "1. Rapid Assessment", content: "LOC (AVPU), skin signs (color, temperature, moisture), respiratory effort, pulse quality." },
        { title: "2. Vital Signs", content: "BP, HR, RR, SpO2, EtCO2 (low EtCO2 can indicate poor perfusion). Temperature if sepsis suspected." },
        { title: "3. Determine Shock Type", content: "Hypovolemic, cardiogenic, distributive, or obstructive? History and physical exam guide treatment." },
        { title: "4. 12-Lead ECG", content: "Rule out cardiac etiology. Look for STEMI, arrhythmia, right heart strain (PE)." },
        { title: "5. Identify Source", content: "Bleeding? Infection? Allergic reaction? Trauma? Cardiac event? Medication effect?" }
      ]
    },
    {
      type: "accordion",
      title: "Shock Assessment by Type",
      items: [
        {
          title: "Hypovolemic Shock Assessment",
          content: "<b>History:</b> Trauma, vomiting, diarrhea, melena, hematemesis, vaginal bleeding, abdominal pain<br><br><b>Physical Exam:</b><br>• Flat neck veins<br>• Cool, pale, diaphoretic skin<br>• Dry mucous membranes<br>• Poor skin turgor<br>• Tachycardia<br>• Narrowed pulse pressure<br><br><b>Blood Loss Estimation:</b><br>• Class I (< 15%): Minimal tachycardia, normal BP<br>• Class II (15-30%): Tachycardia, narrowed pulse pressure<br>• Class III (30-40%): Hypotension, marked tachycardia, AMS<br>• Class IV (> 40%): Severe hypotension, near-death"
        },
        {
          title: "Cardiogenic Shock Assessment",
          content: "<b>History:</b> Chest pain, dyspnea, known heart disease, MI risk factors<br><br><b>Physical Exam:</b><br>• JVD (elevated)<br>• Rales/crackles (pulmonary edema)<br>• Peripheral edema<br>• Cool extremities<br>• S3/S4 heart sounds<br><br><b>12-Lead ECG Findings:</b><br>• ST elevation (STEMI)<br>• ST depression, T wave inversions<br>• Arrhythmias (VT, complete heart block)<br><br><b>Key Differentiator:</b> Pulmonary edema + hypotension = cardiogenic until proven otherwise"
        },
        {
          title: "Distributive Shock Assessment",
          content: "<b>Septic Shock:</b><br>• Suspected infection source<br>• Fever or hypothermia<br>• Warm, flushed skin (early) or cool (late)<br>• qSOFA criteria: RR > 22, AMS, SBP < 100<br><br><b>Anaphylactic Shock:</b><br>• Known allergen exposure<br>• Urticaria, angioedema<br>• Respiratory distress, wheezing<br>• Abdominal cramping, nausea/vomiting<br><br><b>Neurogenic Shock:</b><br>• Spinal cord injury (especially cervical)<br>• Hypotension + BRADYCARDIA (unique)<br>• Warm, dry skin below lesion<br>• Loss of motor/sensory function"
        },
        {
          title: "Obstructive Shock Assessment",
          content: "<b>Tension Pneumothorax:</b><br>• Trauma or spontaneous (tall, thin patients)<br>• Respiratory distress, absent breath sounds<br>• JVD, tracheal deviation (late signs)<br>• Hypotension, tachycardia<br><br><b>Cardiac Tamponade:</b><br>• Trauma (especially penetrating chest)<br>• Beck's triad: JVD, hypotension, muffled heart sounds<br>• Pulsus paradoxus<br><br><b>Massive PE:</b><br>• Sudden dyspnea, pleuritic chest pain<br>• Risk factors present (immobility, DVT, cancer, recent surgery)<br>• Hypoxia out of proportion to exam<br>• Right heart strain on ECG (S1Q3T3, RV strain pattern)"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "General Shock Management",
      items: [
        { title: "1. Airway/Breathing", content: "Ensure patent airway. High-flow O2 to maintain SpO2 > 94%. Ventilate if needed." },
        { title: "2. Positioning", content: "<b>Supine with legs elevated</b> (Trendelenburg or passive leg raise) unless contraindicated (CHF, head injury, spinal injury)." },
        { title: "3. IV/IO Access", content: "Large bore IV (18G or larger) x2 if possible. IO if IV not rapidly obtainable." },
        { title: "4. Cardiac Monitor + 12-Lead", content: "Continuous monitoring. 12-lead ECG for all hypotensive patients." },
        { title: "5. Identify and Treat Cause", content: "Treatment varies dramatically based on shock type. Reassess frequently." }
      ]
    },
    {
      type: "accordion",
      title: "Treatment by Shock Type",
      items: [
        {
          title: "Hypovolemic Shock Treatment",
          content: "<b>Hemorrhagic:</b><br>• Control bleeding (direct pressure, tourniquet, hemostatic agents)<br>• IV fluid: 1L NS bolus, reassess, may repeat x1<br>• TXA: 1g IV if hemorrhagic shock and < 3 hours from injury<br>• Permissive hypotension for penetrating trauma (target radial pulse present, SBP 80-90)<br>• Rapid transport to trauma center<br><br><b>Non-Hemorrhagic (Dehydration):</b><br>• IV fluid: 1-2L NS bolus as tolerated<br>• Reassess lung sounds between boluses<br>• More liberal fluid administration than hemorrhagic shock"
        },
        {
          title: "Cardiogenic Shock Treatment",
          content: "<b>KEY PRINCIPLE:</b> DO NOT overload with fluids - can worsen pulmonary edema<br><br><b>If pulmonary edema present:</b><br>• AVOID large fluid boluses<br>• Small fluid challenge (250 mL) only if severely hypotensive and no rales<br>• Push-dose Epinephrine: 10-20 mcg IV q 1-3 min for hypotension<br>• Consider Norepinephrine infusion if available<br><br><b>12-Lead ECG:</b> MANDATORY - if STEMI, activate cath lab (MCG 1303)<br><br><b>Treat arrhythmias:</b> Per bradycardia/tachycardia protocols<br><br><b>Consider CPAP:</b> If respiratory distress from pulmonary edema (improves preload and afterload)"
        },
        {
          title: "Distributive Shock Treatment",
          content: "<b>Septic Shock:</b><br>• Aggressive IV fluids: 30 mL/kg NS (2-3L for average adult)<br>• Push-dose Epinephrine: 10-20 mcg IV q 1-3 min if fluid-refractory<br>• Monitor for fluid overload<br>• Identify source (pneumonia, UTI, skin infection, abdominal)<br><br><b>Anaphylactic Shock:</b><br>• Epinephrine 0.3-0.5 mg IM (1:1,000) - FIRST LINE<br>• IV fluids: 1-2L NS bolus<br>• Remove allergen if possible<br>• Diphenhydramine 25-50mg IV/IM<br>• Repeat Epi q 5-15 min as needed<br>• Consider Epi infusion for refractory cases<br><br><b>Neurogenic Shock:</b><br>• Spinal immobilization<br>• IV fluids: 1-2L NS (use cautiously - won't fix the problem)<br>• Vasopressors for persistent hypotension<br>• Atropine if symptomatic bradycardia"
        },
        {
          title: "Obstructive Shock Treatment",
          content: "<b>Tension Pneumothorax:</b><br>• Needle decompression (MCG 1335)<br>• 2nd intercostal space, midclavicular line OR<br>• 4th-5th intercostal space, anterior axillary line<br>• Rush of air = confirmation; prepare for repeat if recurs<br><br><b>Cardiac Tamponade:</b><br>• No prehospital treatment available<br>• IV fluid bolus (increases preload - may temporarily help)<br>• Rapid transport for pericardiocentesis/OR<br><br><b>Massive PE:</b><br>• Supportive care, high-flow O2<br>• IV fluids (cautiously - RV already distended)<br>• Vasopressors for hypotension<br>• Rapid transport (thrombolytics may be indicated in-hospital)"
        }
      ]
    },
    {
      type: "accordion",
      title: "Medication Dosing",
      items: [
        {
          title: "Normal Saline (NS)",
          content: "<b>Hypovolemic Shock:</b><br>• 1L IV bolus, reassess, may repeat x1-2<br>• Trauma: Titrate to radial pulse (permissive hypotension)<br>• Non-hemorrhagic: More liberal, 2-3L if tolerated<br><br><b>Septic Shock:</b><br>• 30 mL/kg (2-3L for 70kg adult) within first hour<br>• Continue until BP responds or signs of overload<br><br><b>Cardiogenic Shock:</b><br>• 250 mL bolus ONLY if no pulmonary edema<br>• Avoid large volumes<br><br><b>Monitor:</b> Lung sounds after each bolus. Stop if rales develop.",
          icon: "water_drop"
        },
        {
          title: "Epinephrine - Push Dose",
          content: "<b>Preparation:</b> 10 mcg/mL<br>• Take 1 mL of 1:10,000 (100 mcg) + 9 mL NS = 10 mcg/mL<br>• OR dilute 1 mg in 100 mL NS = 10 mcg/mL<br><br><b>Dose:</b> 10-20 mcg (1-2 mL) IV push<br><b>Repeat:</b> Every 1-3 minutes as needed<br><br><b>Indication:</b> Hypotension refractory to fluids (or when fluids contraindicated in cardiogenic shock)<br><b>Mechanism:</b> Alpha-1 (vasoconstriction) + Beta-1 (inotropy/chronotropy)",
          icon: "medication"
        },
        {
          title: "Epinephrine - IM (Anaphylaxis)",
          content: "<b>Adult Dose:</b> 0.3-0.5 mg IM (1:1,000 / 1 mg/mL)<br>• Use anterolateral thigh (most reliable absorption)<br><b>Repeat:</b> Every 5-15 minutes as needed<br><br><b>Pediatric Dose:</b> 0.01 mg/kg IM (max 0.3 mg)<br><br><b>Auto-Injector:</b><br>• EpiPen: 0.3 mg (adult) or 0.15 mg (pediatric)<br><br><b>Note:</b> IM is first-line for anaphylaxis. IV only if profound shock and IV access present.",
          icon: "medication"
        },
        {
          title: "Dopamine Infusion",
          content: "<b>Dose:</b> 5-20 mcg/kg/min IV<br><b>Preparation:</b> 400 mg in 250 mL D5W (1600 mcg/mL)<br><br><b>Dosing Effects:</b><br>• 2-5 mcg/kg/min: Dopaminergic (renal perfusion)<br>• 5-10 mcg/kg/min: Beta effects (inotropy, chronotropy)<br>• 10-20 mcg/kg/min: Alpha effects (vasoconstriction)<br><br><b>Start:</b> 5 mcg/kg/min, titrate to SBP > 90 mmHg or MAP > 65<br><b>Alternative to:</b> Push-dose epinephrine for sustained support",
          icon: "medication"
        },
        {
          title: "Tranexamic Acid (TXA)",
          content: "<b>Dose:</b> 1 g in 100 mL NS IV over 10 minutes<br><br><b>Indication:</b> Hemorrhagic shock with suspected ongoing bleeding<br><b>Time Limit:</b> Must be given within 3 hours of injury<br><br><b>Mechanism:</b> Antifibrinolytic - prevents clot breakdown<br><b>Evidence:</b> CRASH-2 and MATTERS trials show mortality benefit<br><br><b>Contraindications:</b> Active thromboembolic disease, > 3 hours from injury",
          icon: "medication"
        },
        {
          title: "Diphenhydramine (Benadryl)",
          content: "<b>Dose:</b> 25-50 mg IV/IM<br><b>Pediatric:</b> 1-1.25 mg/kg IV/IM (max 50 mg)<br><br><b>Indication:</b> Anaphylaxis (adjunct to epinephrine, NOT first-line)<br><b>Mechanism:</b> H1 receptor antagonist<br><br><b>Note:</b> Does NOT reverse hypotension - epinephrine is the critical intervention",
          icon: "pill"
        }
      ]
    },
    {
      type: "section",
      title: "Special Populations"
    },
    {
      type: "accordion",
      title: "Special Considerations",
      items: [
        {
          title: "Pediatric Shock",
          content: "<b>Critical Concept:</b> Children compensate extremely well until sudden decompensation. Tachycardia is the earliest sign.<br><br><b>Normal BP (Lower Limit SBP):</b><br>• 1 month - 1 year: 70 mmHg<br>• 1-10 years: 70 + (2 x age in years)<br>• > 10 years: 90 mmHg<br><br><b>Fluid Resuscitation:</b><br>• 20 mL/kg NS bolus, may repeat x2-3<br>• Reassess after each bolus<br><br><b>Vasopressors:</b><br>• Epinephrine: 0.1-1 mcg/kg/min IV infusion<br>• Push-dose epi: 1 mcg/kg IV<br><br><b>Intraosseous:</b> Preferred access in critically ill children if IV not rapidly obtained"
        },
        {
          title: "Geriatric Shock",
          content: "<b>Challenges:</b><br>• Blunted tachycardic response (beta-blockers, pacemakers, aged myocardium)<br>• Baseline hypertension - 'normal' BP may be shock<br>• Reduced cardiac reserve - less tolerance of volume shifts<br>• Higher risk of cardiogenic component<br><br><b>Considerations:</b><br>• More cautious with fluids (risk of pulmonary edema)<br>• Earlier vasopressor use<br>• Lower threshold for cardiogenic shock diagnosis<br>• Baseline creatinine may indicate chronic hypoperfusion"
        },
        {
          title: "Pregnancy",
          content: "<b>Physiologic Changes:</b><br>• Increased blood volume (30-50% above baseline)<br>• Baseline tachycardia (HR 80-100 normal)<br>• Supine hypotension (IVC compression by uterus)<br><br><b>Key Points:</b><br>• Hypotension is LATE in pregnancy (significant volume loss before BP drops)<br>• Position in LEFT lateral decubitus or manual uterine displacement<br>• Aggressive fluid resuscitation (fetus is first to be sacrificed)<br>• Two patients - fetal heart rate monitoring when possible<br><br><b>Hemorrhagic Shock:</b><br>• Placental abruption, placenta previa, ruptured ectopic, postpartum hemorrhage<br>• Massive transfusion protocol early"
        },
        {
          title: "Trauma-Induced Shock",
          content: "<b>Assume hypovolemic until proven otherwise</b><br><br><b>Hemorrhage Control Priority:</b><br>1. Extremity: Tourniquet, wound packing<br>2. Junctional: Hemostatic agents, direct pressure<br>3. Truncal: Rapid transport, permissive hypotension<br><br><b>Permissive Hypotension:</b><br>• Penetrating torso trauma: Target radial pulse present (SBP 80-90)<br>• Blunt trauma: More liberal (SBP 90-100)<br>• Head trauma: AVOID hypotension (SBP > 100, ideally > 110)<br><br><b>TXA:</b> 1g IV within 3 hours if hemorrhagic shock suspected<br><br><b>Consider Concomitant:</b> Tension pneumothorax, cardiac tamponade in chest trauma"
        },
        {
          title: "Medication-Induced Hypotension",
          content: "<b>Common Culprits:</b><br>• Antihypertensives (ACE inhibitors, beta-blockers, calcium channel blockers)<br>• Diuretics<br>• Opioids<br>• Sedatives/anesthetics<br>• Nitrates<br><br><b>Treatment:</b><br>• IV fluids (if not cardiogenic etiology)<br>• Vasopressors for refractory cases<br>• Specific antidotes if available (glucagon for beta-blockers, calcium for CCB)"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Shock is a Clinical Diagnosis:</b><br>Look at the patient, not just the blood pressure. Compensated shock (normal BP with signs of poor perfusion) is common and dangerous if missed.<br><br><b>Know Your Shock Types:</b><br>Treating hypovolemic shock with vasopressors alone will fail. Treating cardiogenic shock with aggressive fluids will make it worse. Diagnosis guides treatment.<br><br><b>Trendelenburg Position:</b><br>Passive leg raise (45 degrees) increases preload without the respiratory compromise of full Trendelenburg. Use this for initial positioning in shock.<br><br><b>EtCO2 as Perfusion Marker:</b><br>Low EtCO2 (< 35 mmHg) in a non-hyperventilating patient suggests poor cardiac output. Rising EtCO2 during resuscitation indicates improved perfusion.<br><br><b>Obstructive Shock is Time-Critical:</b><br>Tension pneumothorax kills in minutes. Recognize it (absent breath sounds, JVD, hypotension) and decompress immediately. Don't wait for confirmation.<br><br><b>Cardiogenic Shock - Less is More:</b><br>Every mL of fluid can worsen pulmonary edema. Use push-dose epinephrine early. Think of it as 'fluid-sparing' resuscitation.<br><br><b>Sepsis - More is More:</b><br>Aggressive early fluids (30 mL/kg in first hour) improve outcomes. Don't under-resuscitate septic shock."
    },
    {
      type: "info",
      title: "Pediatric Shock Summary",
      content: "<b>Earliest Sign:</b> Tachycardia (hypotension is LATE)<br><br><b>Normal Heart Rate:</b><br>• Infant: 100-160 bpm<br>• Toddler: 90-150 bpm<br>• Child: 70-120 bpm<br><br><b>Hypotension (SBP):</b><br>• < 1 year: < 70 mmHg<br>• 1-10 years: < 70 + (2 x age)<br>• > 10 years: < 90 mmHg<br><br><b>Fluid Bolus:</b> 20 mL/kg NS, repeat PRN x2-3<br><b>IO Access:</b> If IV not obtained in 90 seconds in critical child"
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1211 Cardiac Chest Pain / STEMI" },
        { title: "TP-1212 Bradycardia" },
        { title: "TP-1213 Tachycardia" },
        { title: "TP-1215 Anaphylaxis" },
        { title: "TP-1244 Traumatic Injury" },
        { title: "MCG 1335 Needle Thoracostomy" },
        { title: "MCG 1303 Cath Lab Activation" },
        { title: "TP-1229 Sepsis" }
      ]
    }
  ]
};
