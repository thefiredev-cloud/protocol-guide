
import { Protocol } from '../../../types';

/**
 * TP-1212 - Cardiac Dysrhythmia: Bradycardia
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const tp1212: Protocol = {
  id: "1212",
  refNo: "TP-1212",
  title: "Cardiac Dysrhythmia - Bradycardia",
  category: "Cardiovascular",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Bradycardia", subtitle: "Adult • Standing Order", icon: "monitor_heart" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Cardiac Dysrhythmia - Bradycardia (DYSR)", content: "Heart rate < 60 bpm. Clinically significant when associated with signs/symptoms of poor perfusion." },
        { title: "Sinus Bradycardia", content: "Regular rhythm, P waves present, rate < 60 bpm. Often benign in athletes or during sleep." },
        { title: "Heart Block", content: "1st, 2nd (Type I/II), or 3rd degree AV block. 3rd degree and Mobitz Type II require immediate intervention." }
      ]
    },
    {
      type: "warning",
      content: "<b>UNSTABLE BRADYCARDIA - Treat Immediately If ANY Present:</b><br>• Hypotension (SBP < 90 mmHg)<br>• Altered mental status / Acute confusion<br>• Signs of shock (cool, clammy, delayed cap refill)<br>• Ischemic chest discomfort<br>• Acute heart failure (pulmonary edema)<br><br><b>High-Risk Rhythms Requiring Immediate Treatment:</b><br>• 3rd Degree (Complete) Heart Block<br>• Mobitz Type II 2nd Degree Block<br>• Symptomatic junctional or ventricular escape rhythms<br>• Wide QRS bradycardia"
    },
    {
      type: "section",
      title: "Assessment"
    },
    {
      type: "list",
      title: "Initial Evaluation",
      items: [
        { title: "1. ABCs", content: "Ensure patent airway, adequate ventilation. Apply oxygen if SpO2 < 94%." },
        { title: "2. Vital Signs", content: "Heart rate, blood pressure, SpO2, EtCO2. Establish baseline and trend." },
        { title: "3. 12-Lead ECG", content: "<b>Mandatory.</b> Identify rhythm: Sinus bradycardia, junctional, AV block type. Look for ischemic changes." },
        { title: "4. Symptom Correlation", content: "Is the heart rate causing the symptoms? Consider other causes of hypotension (sepsis, hypovolemia, medications)." },
        { title: "5. Medication History", content: "Beta-blockers, calcium channel blockers, digoxin, clonidine, amiodarone - common causes of bradycardia." }
      ]
    },
    {
      type: "accordion",
      title: "Identify the Rhythm",
      items: [
        {
          title: "Sinus Bradycardia",
          content: "<b>ECG:</b> Regular rhythm, P wave before every QRS, PR interval 0.12-0.20s, narrow QRS<br><b>Rate:</b> < 60 bpm<br><b>Clinical:</b> Often physiologic in athletes, during sleep. Pathologic if symptomatic."
        },
        {
          title: "1st Degree AV Block",
          content: "<b>ECG:</b> Prolonged PR interval > 0.20s (>5 small boxes), every P wave followed by QRS<br><b>Clinical:</b> Usually benign. Monitor only. Does not typically cause symptoms."
        },
        {
          title: "2nd Degree Type I (Wenckebach)",
          content: "<b>ECG:</b> Progressive PR prolongation until dropped QRS, grouped beating, irregular R-R<br><b>Clinical:</b> Usually benign if asymptomatic. Block is at AV node level - responds to atropine."
        },
        {
          title: "2nd Degree Type II (Mobitz II)",
          content: "<b>ECG:</b> Fixed PR interval with intermittently dropped QRS, often wide QRS<br><b>Clinical:</b> <b>HIGH RISK</b> - Block is below AV node (His bundle). Can progress suddenly to complete block. Atropine often ineffective. Prepare for pacing."
        },
        {
          title: "3rd Degree (Complete) Heart Block",
          content: "<b>ECG:</b> No relationship between P waves and QRS. Atria and ventricles beat independently. Regular R-R interval.<br><b>Clinical:</b> <b>CRITICAL</b> - Requires immediate pacing. Atropine unlikely to help. Escape rhythm may be junctional (narrow, 40-60 bpm) or ventricular (wide, 20-40 bpm)."
        }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "Symptomatic Bradycardia Treatment",
      items: [
        { title: "1. IV/IO Access", content: "Establish immediately. Large bore preferred for potential pacing sedation." },
        { title: "2. Atropine (First-Line)", content: "<b>0.5 mg IV/IO push</b>. May repeat every 3-5 minutes.<br><b>Maximum total dose: 3 mg</b> (6 doses).<br><b>Note:</b> Less effective for Mobitz II and 3rd degree block - proceed quickly to pacing." },
        { title: "3. Prepare for TCP", content: "Apply pacing pads (anterior/posterior preferred). Have sedation ready." },
        { title: "4. Transcutaneous Pacing", content: "If atropine ineffective or high-grade block present:<br>• Rate: 60-80 bpm (start at 70)<br>• mA: Start at 0, increase until capture<br>• Confirm mechanical capture (pulse with each QRS)" },
        { title: "5. Push-Dose Epinephrine", content: "For refractory hypotension despite atropine/pacing:<br><b>10 mcg (1 mL of 10 mcg/mL)</b> IV push every 1-3 minutes." },
        { title: "6. Dopamine Infusion", content: "Alternative to push-dose epi for sustained support:<br><b>5-20 mcg/kg/min</b> IV infusion. Titrate to SBP > 90." }
      ]
    },
    {
      type: "accordion",
      title: "Transcutaneous Pacing (TCP) Procedure",
      items: [
        {
          title: "Indications for Immediate Pacing",
          content: "• Hemodynamically unstable bradycardia unresponsive to atropine<br>• Mobitz Type II 2nd degree AV block<br>• 3rd degree (complete) heart block<br>• Symptomatic bradycardia with wide QRS escape rhythm<br>• Post-cardiac arrest with profound bradycardia"
        },
        {
          title: "Pad Placement",
          content: "<b>Anterior-Posterior (Preferred):</b><br>• Anterior: Left of sternum, over heart<br>• Posterior: Left of spine, behind heart<br><br><b>Anterior-Lateral (Alternative):</b><br>• Right infraclavicular<br>• Left lateral chest (V5-V6 position)"
        },
        {
          title: "Pacing Settings",
          content: "<b>Initial Rate:</b> 60-80 bpm (typically 70 bpm)<br><b>Initial mA:</b> Start at 0 mA<br><b>Increase mA:</b> Gradually increase until electrical capture (pacing spike followed by wide QRS)<br><b>Capture threshold:</b> Usually 50-100 mA. Some patients require higher.<br><b>Final setting:</b> Set 10 mA above capture threshold for safety margin."
        },
        {
          title: "Confirm Capture",
          content: "<b>Electrical Capture:</b> Pacing spike followed by wide QRS complex<br><b>Mechanical Capture:</b> Palpable pulse with each paced beat (verify with femoral pulse)<br><b>Caution:</b> Electrical activity does not guarantee mechanical capture. Always confirm pulse."
        },
        {
          title: "Sedation/Analgesia",
          content: "<b>TCP is PAINFUL</b> - Provide sedation unless patient is unconscious.<br><b>Midazolam:</b> 2-5 mg IV/IM/IN. May repeat x1 in 5 minutes.<br><b>Fentanyl:</b> 50-100 mcg IV/IM/IN for analgesia."
        }
      ]
    },
    {
      type: "accordion",
      title: "Medication Dosing",
      items: [
        {
          title: "Atropine Sulfate",
          content: "<b>Adult Dose:</b> 0.5 mg IV/IO push<br><b>Repeat:</b> Every 3-5 minutes<br><b>Maximum:</b> 3 mg total (6 doses)<br><br><b>Mechanism:</b> Vagolytic - blocks parasympathetic tone at SA and AV nodes<br><b>Onset:</b> 1-2 minutes IV<br><br><b>Caution:</b><br>• Doses < 0.5 mg may cause paradoxical bradycardia<br>• Less effective in denervated hearts (transplant patients)<br>• Unlikely to help infranodal blocks (Mobitz II, 3rd degree)",
          icon: "medication"
        },
        {
          title: "Epinephrine (Push-Dose)",
          content: "<b>Preparation:</b> 10 mcg/mL (dilute 1 mg in 100 mL NS, or use cardiac arrest syringe diluted)<br><b>Adult Dose:</b> 10-20 mcg (1-2 mL) IV push<br><b>Repeat:</b> Every 1-3 minutes as needed<br><br><b>Indication:</b> Hypotension refractory to atropine and pacing<br><b>Mechanism:</b> Beta-1 agonist increases heart rate and contractility",
          icon: "medication"
        },
        {
          title: "Dopamine Infusion",
          content: "<b>Adult Dose:</b> 5-20 mcg/kg/min IV infusion<br><b>Preparation:</b> 400 mg in 250 mL D5W (1600 mcg/mL)<br><br><b>Dosing Effects:</b><br>• 2-5 mcg/kg/min: Dopaminergic (renal)<br>• 5-10 mcg/kg/min: Beta effects (inotropy, chronotropy)<br>• 10-20 mcg/kg/min: Alpha effects (vasoconstriction)<br><br><b>Titration:</b> Start at 5 mcg/kg/min, increase to maintain SBP > 90",
          icon: "medication"
        },
        {
          title: "Midazolam (Versed) - TCP Sedation",
          content: "<b>Adult Dose:</b> 2-5 mg IV/IO/IM/IN<br><b>Repeat:</b> May repeat x1 in 5 minutes if inadequate sedation<br><b>Maximum:</b> 10 mg total<br><br><b>Onset:</b> 1-3 min IV, 5-10 min IM/IN<br><b>Duration:</b> 30-60 minutes<br><b>Note:</b> Have BVM ready. Monitor respiratory status.",
          icon: "medication"
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
          title: "Pediatric Patients",
          content: "<b>Definition:</b> Bradycardia in children = HR below normal for age (typically < 60 bpm for children is concerning)<br><br><b>Neonates/Infants:</b> HR < 100 bpm is bradycardia<br><b>Children:</b> HR < 60 bpm with poor perfusion is critical<br><br><b>Treatment:</b><br>• Oxygen and ventilation FIRST (most pediatric bradycardia is hypoxia-related)<br>• Epinephrine: 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO<br>• Atropine: 0.02 mg/kg IV/IO. Minimum 0.1 mg, Maximum 0.5 mg<br>• TCP: Rate per age, start low mA and increase"
        },
        {
          title: "Beta-Blocker / Calcium Channel Blocker Overdose",
          content: "<b>Suspect if:</b> History of BB/CCB use, profound bradycardia, hypotension<br><br><b>Treatment:</b><br>• Atropine (may be ineffective)<br>• Glucagon: 3-5 mg IV bolus (bypasses beta-receptors)<br>• Calcium chloride: 1 g (10 mL of 10%) IV slow push<br>• High-dose insulin: 1 unit/kg IV with D50 (if available per protocol)<br>• Push-dose epinephrine / Epinephrine infusion<br>• TCP as bridge therapy"
        },
        {
          title: "Digoxin Toxicity",
          content: "<b>Suspect if:</b> Digoxin use, nausea/vomiting, visual changes (yellow halos), ANY arrhythmia<br><br><b>Classic rhythms:</b> Bradycardia, regularized atrial fibrillation, bidirectional VT, accelerated junctional<br><br><b>Treatment:</b><br>• Avoid calcium (may worsen toxicity)<br>• Atropine for symptomatic bradycardia<br>• Digoxin-specific antibody (Fab) if available<br>• TCP if needed (use caution - may trigger VF)"
        },
        {
          title: "Hypothermia",
          content: "<b>Bradycardia is expected</b> in hypothermic patients.<br><br><b>Mild (32-35C):</b> Sinus bradycardia common<br><b>Moderate (28-32C):</b> Atrial fibrillation, J waves (Osborn waves)<br><b>Severe (<28C):</b> Risk of VF, severely depressed conduction<br><br><b>Treatment:</b><br>• Rewarm first - rhythm may normalize<br>• Handle gently (rough handling can trigger VF)<br>• Limit defibrillation to 3 attempts until temp > 30C<br>• Medications less effective until rewarmed"
        },
        {
          title: "Cardiac Transplant Patients",
          content: "<b>Denervated heart:</b> No vagal innervation - atropine will NOT work.<br><br><b>Treatment:</b><br>• Skip atropine - go directly to TCP or catecholamines<br>• Epinephrine/Dopamine infusion<br>• Transcutaneous pacing<br>• Isoproterenol if available (chronotropic support)"
        },
        {
          title: "Athletes / Asymptomatic Bradycardia",
          content: "<b>Resting HR 40-50 bpm</b> can be normal in well-conditioned athletes.<br><br><b>No treatment needed if:</b><br>• Patient is asymptomatic<br>• Normal blood pressure<br>• No signs of poor perfusion<br>• ECG shows sinus bradycardia without blocks<br><br><b>Document baseline and transport for evaluation if concerned.</b>"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Atropine Effectiveness:</b><br>Atropine works at the AV node. For blocks BELOW the AV node (Mobitz II, 3rd degree with wide QRS), atropine is often ineffective. Don't waste time - prepare for pacing early.<br><br><b>Push-Dose Epi as Bridge:</b><br>While setting up TCP, push-dose epinephrine can provide temporary chronotropic support. Have it ready.<br><br><b>Confirm Mechanical Capture:</b><br>Electrical capture (pacing spikes with QRS) does NOT guarantee mechanical capture. Always check a pulse (femoral works best during pacing).<br><br><b>TCP is Painful:</b><br>Unless the patient is unconscious, sedate before or immediately after initiating pacing. Use midazolam +/- fentanyl.<br><br><b>12-Lead is Mandatory:</b><br>You cannot appropriately treat bradycardia without knowing the rhythm. Sinus bradycardia vs. 3rd degree block have very different implications.<br><br><b>Consider Reversible Causes:</b><br>Medications (beta-blockers, CCB, digoxin), hyperkalemia, hypothyroidism, increased ICP, inferior MI with vagal response."
    },
    {
      type: "info",
      title: "Pediatric Bradycardia Summary",
      content: "<b>Heart Rate Thresholds:</b><br>• Infant: < 100 bpm is bradycardia<br>• Child: < 60 bpm with poor perfusion is critical<br><br><b>Primary Cause:</b> Hypoxia - ventilate and oxygenate FIRST<br><br><b>Medications:</b><br>• Epinephrine: 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO q 3-5 min<br>• Atropine: 0.02 mg/kg IV/IO (min 0.1 mg, max 0.5 mg single dose)<br><br><b>Pacing:</b> Use age-appropriate rate. Most bradycardia resolves with oxygenation."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1213 Cardiac Dysrhythmia - Tachycardia" },
        { title: "TP-1211 Cardiac Chest Pain / STEMI" },
        { title: "TP-1207 Shock / Hypotension" },
        { title: "MCG 1308 Cardiac Monitoring / 12-Lead ECG" },
        { title: "TP-1220 Hypothermia (Environmental)" },
        { title: "TP-1234 Toxicological Emergencies" }
      ]
    }
  ]
};
