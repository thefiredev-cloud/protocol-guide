
import { Protocol } from '../../../types';

export const tp1210: Protocol = {
  id: "1210",
  refNo: "TP-1210",
  title: "Cardiac Arrest",
  category: "Cardiovascular",
  type: "Standing Order",
  lastUpdated: "Oct 1, 2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Arrest", subtitle: "Adult • Standing Order", icon: "monitor_heart" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "CANT", content: "Cardiac Arrest – Non-Traumatic. Pulseless patient without traumatic etiology." },
        { title: "DEAD", content: "DOA – Obvious Death. Patient with signs of obvious death (see criteria below)." }
      ]
    },
    {
      type: "warning",
      content: "<b>DO NOT RESUSCITATE – Obvious Death Criteria:</b><br>• Rigor mortis<br>• Dependent lividity<br>• Decomposition<br>• Decapitation or transection of torso<br>• Incineration<br><br><b>Withhold resuscitation if:</b><br>• Valid DNR/POLST present<br>• Prehospital Determination of Death (EMS Field Pronouncement) criteria met<br>• Asystole > 20 minutes despite optimal resuscitation without reversible cause"
    },
    {
      type: "section",
      title: "Initial Actions"
    },
    {
      type: "list",
      title: "Immediate Assessment",
      items: [
        { title: "Confirm Arrest", content: "Unresponsive, not breathing normally (agonal respirations = arrest), no pulse (< 10 seconds)." },
        { title: "Activate Response", content: "Call for ALS backup. Begin CPR immediately. Apply defibrillator pads." },
        { title: "Identify Rhythm", content: "Shockable (VF/pVT) vs Non-Shockable (Asystole/PEA). Determines treatment pathway." }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "Shockable Rhythm (VF/pVT)",
      items: [
        { title: "1. Defibrillate", content: "<b>Shock immediately</b> at maximum joules (biphasic 200J or per device). Resume CPR immediately after shock." },
        { title: "2. CPR 2 Minutes", content: "High-quality compressions 100-120/min, depth 2-2.4 inches. Full chest recoil. Minimize interruptions < 10 sec." },
        { title: "3. Vascular Access", content: "IV/IO access. Prefer IV if rapidly achievable; otherwise IO (humeral or tibial)." },
        { title: "4. Epinephrine", content: "<b>1 mg (1:10,000) IV/IO</b> after 2nd shock. Repeat every 3-5 minutes." },
        { title: "5. Refractory VF/pVT", content: "<b>Amiodarone 300 mg IV/IO</b> after 3rd shock. May give 150 mg x1 after 5th shock." },
        { title: "6. Continue Cycles", content: "Shock → CPR 2 min → Rhythm check. Repeat until ROSC or termination criteria met." }
      ]
    },
    {
      type: "list",
      title: "Non-Shockable Rhythm (Asystole/PEA)",
      items: [
        { title: "1. CPR Immediately", content: "Begin high-quality CPR. No shock indicated." },
        { title: "2. Vascular Access", content: "IV/IO access while CPR continues." },
        { title: "3. Epinephrine", content: "<b>1 mg (1:10,000) IV/IO ASAP</b>. Repeat every 3-5 minutes." },
        { title: "4. Identify Cause", content: "PEA: Treat reversible causes (H's and T's). Asystole: Consider if rhythm is actually fine VF." },
        { title: "5. Continue Cycles", content: "CPR 2 min → Rhythm check. If rhythm becomes shockable, follow VF/pVT pathway." }
      ]
    },
    {
      type: "accordion",
      title: "Medication Dosing",
      items: [
        {
          title: "Epinephrine",
          content: "<b>Adult:</b> 1 mg (10 mL of 1:10,000 or 1 mL of 1:1,000) IV/IO every 3-5 min<br><b>Pediatric:</b> 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO every 3-5 min. Max single dose 1 mg.<br><br><b>Timing:</b> Give after 2nd shock for VF/pVT. Give ASAP for asystole/PEA.",
          icon: "medication"
        },
        {
          title: "Amiodarone",
          content: "<b>Adult:</b> 300 mg IV/IO bolus (first dose after 3rd shock). 150 mg IV/IO (second dose after 5th shock).<br><b>Pediatric:</b> 5 mg/kg IV/IO bolus. May repeat x2 for refractory VF/pVT. Max single dose 300 mg.<br><br><b>Alternative (Lidocaine):</b> If amiodarone unavailable: 1-1.5 mg/kg IV/IO, then 0.5-0.75 mg/kg every 5-10 min. Max 3 mg/kg.",
          icon: "pill"
        },
        {
          title: "Sodium Bicarbonate",
          content: "<b>Indication:</b> Known or suspected hyperkalemia, tricyclic antidepressant overdose, prolonged arrest > 10 min.<br><b>Adult:</b> 1 mEq/kg IV/IO<br><b>Pediatric:</b> 1 mEq/kg IV/IO<br><br><b>Caution:</b> Not routine. Adequate ventilation must be established first.",
          icon: "medication"
        },
        {
          title: "Calcium Chloride",
          content: "<b>Indication:</b> Hyperkalemia, hypocalcemia, calcium channel blocker overdose.<br><b>Adult:</b> 1 g (10 mL of 10%) IV slow push<br><b>Pediatric:</b> 20 mg/kg IV slow push. Max 1 g.<br><br><b>Caution:</b> Ensure line patency. Causes tissue necrosis if extravasation.",
          icon: "medication"
        }
      ]
    },
    {
      type: "accordion",
      title: "Reversible Causes (H's and T's)",
      items: [
        {
          title: "H's - Hypoxia, Hypovolemia, H+, Hypo/Hyperkalemia, Hypothermia",
          content: "<b>Hypoxia:</b> Ensure effective ventilation. SpO2 target > 94%. Advanced airway if needed.<br><b>Hypovolemia:</b> IV fluid bolus. Consider occult hemorrhage.<br><b>Hydrogen ion (Acidosis):</b> Optimize ventilation. Consider bicarb if prolonged arrest.<br><b>Hypo/Hyperkalemia:</b> Check glucose (surrogate). Give calcium chloride empirically if suspected.<br><b>Hypothermia:</b> Check temp. Warm fluids. Limit shocks to 3 until temp > 30°C."
        },
        {
          title: "T's - Tension Pneumothorax, Tamponade, Toxins, Thrombosis",
          content: "<b>Tension Pneumothorax:</b> Bilateral needle decompression (MCG 1335) for traumatic arrest or suspected pneumothorax.<br><b>Cardiac Tamponade:</b> Field treatment limited. Rapid transport. Pericardiocentesis only if trained/equipped.<br><b>Toxins/Overdose:</b> Specific antidotes (Narcan 2mg IN/IV for opioids, Sodium bicarb for TCA, Glucagon for beta blockers).<br><b>Thrombosis (Coronary):</b> Standard ACLS. Consider cath lab if ROSC. <b>Thrombosis (Pulmonary):</b> Consider if PEA with distended neck veins. No field thrombolytics."
        }
      ]
    },
    {
      type: "section",
      title: "Special Situations"
    },
    {
      type: "accordion",
      title: "Post-ROSC Care",
      items: [
        {
          title: "Immediate Actions",
          content: "• Confirm pulse and blood pressure<br>• Secure airway if not already done<br>• 12-lead ECG – evaluate for STEMI<br>• Target SpO2 94-98% (avoid hyperoxia)<br>• Target ETCO2 35-40 mmHg"
        },
        {
          title: "Hemodynamic Support",
          content: "<b>Hypotension (SBP < 90):</b><br>• NS 250 mL bolus, may repeat<br>• Epinephrine infusion 2-10 mcg/min if fluid unresponsive<br>• Target MAP ≥ 65 mmHg"
        },
        {
          title: "Transport Destination",
          content: "<b>STEMI on ECG:</b> STEMI Center for emergent cath lab<br><b>No STEMI:</b> Cardiac Arrest Center with TTM capability<br><b>Consider ECPR criteria (MCG 1318):</b> Witnessed arrest, age < 70, shockable rhythm, quality CPR < 60 min"
        }
      ]
    },
    {
      type: "warning",
      content: "<b>Termination of Resuscitation Criteria:</b><br><br>Consider field termination if ALL criteria met:<br>• Arrest not witnessed by EMS<br>• No ROSC after 20+ minutes of ACLS<br>• No shockable rhythm at any point<br>• No reversible cause identified<br><br><b>Continue resuscitation if ANY present:</b><br>• Witnessed arrest<br>• Any ROSC during resuscitation<br>• Shockable rhythm at any point<br>• Reversible cause (hypothermia, overdose, electrolyte)<br>• Pregnancy (perimortem C-section may be indicated)<br>• Age < 18 years"
    },
    {
      type: "info",
      title: "Pediatric Modifications",
      content: "<b>Compression Rate:</b> 100-120/min<br><b>Compression Depth:</b> 1/3 AP diameter (1.5 inches infant, 2 inches child)<br><b>Compression:Ventilation:</b> 15:2 with 2 rescuers<br><b>Defibrillation:</b> 2 J/kg first shock, 4 J/kg subsequent<br><b>Epinephrine:</b> 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO<br><b>Amiodarone:</b> 5 mg/kg IV/IO bolus<br><br><b>Common pediatric causes:</b> Respiratory failure, SIDS, drowning, trauma. Address hypoxia first."
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>CPR Quality Markers:</b><br>• Chest compression fraction > 80%<br>• ETCO2 > 10 mmHg (if < 10 after 20 min, consider termination)<br>• Arterial diastolic pressure > 20 mmHg if invasive monitoring<br><br><b>Pit Crew Model:</b> Assign roles before patient contact. Rotate compressors every 2 minutes. Designate a timer.<br><br><b>Defibrillation:</b> Charge during CPR. Pause only to deliver shock. Resume CPR immediately without pulse check.<br><br><b>Epinephrine Timing:</b> Early epi (< 3 min) in non-shockable rhythms improves outcomes. Delay does not improve outcomes in VF/pVT."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1243 Traumatic Arrest" },
        { title: "TP-1211 Cardiac Chest Pain/STEMI" },
        { title: "TP-1212 Bradycardia" },
        { title: "TP-1213 Tachycardia" },
        { title: "MCG 1302 Airway Management" },
        { title: "MCG 1318 ECPR Patient Algorithm" },
        { title: "MCG 1375 Vascular Access" }
      ]
    }
  ]
};
