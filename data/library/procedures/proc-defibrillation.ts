import { Protocol } from '../../../types';

export const procDefibrillation: Protocol = {
  id: "PROC-DEFIB",
  refNo: "Defibrillation/Cardioversion",
  title: "Defibrillation and Cardioversion",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jan 1, 2026",
  icon: "electric_bolt",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Defibrillation & Cardioversion", subtitle: "Electrical Therapy Procedure", icon: "electric_bolt" }]
    },
    {
      type: "accordion",
      title: "Overview",
      items: [
        {
          title: "Defibrillation",
          content: "<b>Unsynchronized</b> electrical shock for pulseless rhythms (VF/pVT).<br><b>Purpose:</b> Depolarize entire myocardium simultaneously, allowing intrinsic pacemaker to resume.<br><b>Timing:</b> Immediate - no delay for synchronization."
        },
        {
          title: "Cardioversion",
          content: "<b>Synchronized</b> electrical shock for unstable rhythms with pulse.<br><b>Purpose:</b> Terminate tachyarrhythmia while avoiding R-on-T phenomenon.<br><b>Timing:</b> Synchronized to QRS complex to avoid vulnerable period."
        }
      ]
    },
    {
      type: "list",
      title: "Defibrillation - Indications",
      items: [
        { title: "Ventricular Fibrillation (VF)", content: "Chaotic, disorganized electrical activity with no pulse." },
        { title: "Pulseless Ventricular Tachycardia (pVT)", content: "Regular wide-complex tachycardia without pulse." },
        { title: "Timing", content: "<b>IMMEDIATE</b> when rhythm identified. Do not delay for IV access or airway." }
      ]
    },
    {
      type: "list",
      title: "Cardioversion - Indications",
      items: [
        { title: "Unstable SVT", content: "Supraventricular tachycardia with hypotension, altered LOC, chest pain, or shock." },
        { title: "Unstable Atrial Fibrillation", content: "A-fib with rapid ventricular response causing instability." },
        { title: "Unstable Atrial Flutter", content: "A-flutter with hemodynamic compromise." },
        { title: "Unstable Ventricular Tachycardia", content: "VT with pulse but showing signs of shock/instability." }
      ]
    },
    {
      type: "warning",
      content: "<b>Contraindications to Cardioversion:</b><br>• Stable tachycardia (use pharmacologic approach)<br>• Sinus tachycardia (treat underlying cause)<br>• Multifocal atrial tachycardia (MAT) - will not respond<br>• Digitalis toxicity (may precipitate VF)<br><br><b>Relative Contraindications:</b><br>• A-fib > 48 hours without anticoagulation (stroke risk)"
    },
    {
      type: "list",
      title: "Equipment & Preparation",
      items: [
        { title: "Defibrillator", content: "• Biphasic preferred (lower energy, higher success)<br>• Monophasic if biphasic unavailable<br>• Charge to appropriate energy level" },
        { title: "Pads/Paddles", content: "<b>Hands-Free Pads (preferred):</b><br>• Anterior-Lateral placement (right upper chest, left lateral chest)<br>• Alternative: Anterior-Posterior<br><b>Paddles:</b><br>• Apply firm pressure (25 lbs)<br>• Use conductive gel (never alcohol-based)" },
        { title: "Oxygen Safety", content: "<b>CRITICAL:</b><br>• Remove oxygen source from patient<br>• State 'Oxygen clear' before shock<br>• Ensure no one touching patient or bed" },
        { title: "Monitoring", content: "• Continuous ECG monitoring<br>• Pulse oximetry<br>• Blood pressure<br>• Capnography if intubated" }
      ]
    },
    {
      type: "list",
      title: "Defibrillation Procedure",
      items: [
        { title: "1. Identify Rhythm", content: "<b>Confirm VF/pVT:</b><br>• Check monitor<br>• Confirm pulseless<br>• Continue CPR until ready to shock" },
        { title: "2. Apply Pads", content: "<b>Placement:</b><br>• Anterior-Lateral (sternum/apex) OR<br>• Anterior-Posterior<br><b>Ensure:</b> Dry skin, remove medication patches, avoid implanted devices" },
        { title: "3. Select Energy", content: "<b>Biphasic (preferred):</b><br>• 1st shock: 120-200 J<br>• 2nd shock: Same or higher<br>• 3rd+ shocks: Maximum (200 J)<br><b>Monophasic:</b><br>• All shocks: 360 J" },
        { title: "4. Charge & Clear", content: "<b>Announce:</b><br>'Charging to [X] joules'<br>'I'm clear, you're clear, we're all clear'<br>'Oxygen clear'<br><b>Visual check:</b> No one touching patient/bed" },
        { title: "5. Deliver Shock", content: "• Press SHOCK button firmly<br>• <b>Immediately resume CPR</b> - do not check pulse<br>• Continue CPR for 2 minutes (5 cycles)" },
        { title: "6. Rhythm Check", content: "After 2 min CPR:<br>• Pause briefly to check rhythm<br>• If VF/pVT persists → charge and shock again<br>• If organized rhythm → check pulse<br>• If asystole/PEA → continue CPR per protocol" }
      ]
    },
    {
      type: "list",
      title: "Synchronized Cardioversion Procedure",
      items: [
        { title: "1. Assess Stability", content: "<b>Unstable signs requiring cardioversion:</b><br>• Hypotension (SBP < 90)<br>• Altered mental status<br>• Chest pain/acute coronary syndrome<br>• Shock/pulmonary edema<br><b>If stable:</b> Consider medication first" },
        { title: "2. Prepare Patient", content: "<b>If time permits:</b><br>• IV access<br>• Oxygen<br>• Consider sedation (Midazolam 2-5mg IV)<br><b>If unstable:</b> Proceed immediately" },
        { title: "3. Sync Mode ON", content: "<b>CRITICAL:</b><br>• Press SYNC button on defibrillator<br>• Confirm sync markers appearing on QRS complexes<br>• Ensure sync indicator remains ON (resets after shock)" },
        { title: "4. Select Energy", content: "<b>Narrow-Complex Regular (SVT, A-flutter):</b><br>• Start: 50-100 J<br>• Increase if needed<br><b>Narrow-Complex Irregular (A-fib):</b><br>• Start: 120-200 J<br><b>Wide-Complex Regular (VT with pulse):</b><br>• Start: 100 J<br>• Increase to 200 J, then 300 J, then 360 J as needed" },
        { title: "5. Deliver Shock", content: "• Announce 'Charging' and 'Clear'<br>• Press and HOLD shock button<br>• <b>Machine will sync to next QRS</b> - brief delay is normal<br>• Release after shock delivered" },
        { title: "6. Post-Shock", content: "• <b>Re-enable SYNC if repeat needed</b> (automatically disables)<br>• Assess rhythm and pulse<br>• If unsuccessful, increase energy and repeat<br>• If successful, monitor closely for recurrence" }
      ]
    },
    {
      type: "list",
      title: "Energy Dosing Summary",
      items: [
        {
          title: "Defibrillation (VF/pVT)",
          content: "<b>Biphasic:</b> 120-200 J → same/higher → max<br><b>Monophasic:</b> 360 J (all shocks)"
        },
        {
          title: "Cardioversion - SVT",
          content: "50-100 J → 200 J → 300 J → 360 J"
        },
        {
          title: "Cardioversion - A-fib",
          content: "120-200 J → 300 J → 360 J"
        },
        {
          title: "Cardioversion - A-flutter",
          content: "50-100 J (often very responsive)"
        },
        {
          title: "Cardioversion - VT with pulse",
          content: "100 J → 200 J → 300 J → 360 J"
        },
        {
          title: "Pediatric Dosing",
          content: "<b>Defibrillation:</b> 2 J/kg → 4 J/kg → 4+ J/kg (max 10 J/kg)<br><b>Cardioversion:</b> 0.5-1 J/kg → 2 J/kg"
        }
      ]
    },
    {
      type: "list",
      title: "Troubleshooting",
      items: [
        { title: "Won't Deliver Shock", content: "• Check sync mode (turn OFF for defibrillation)<br>• Ensure pads making good contact<br>• Check pad expiration date<br>• Verify charged to correct energy<br>• Check if safety features activated" },
        { title: "Sync Markers Not Appearing", content: "• Adjust ECG gain/size<br>• Change lead selection<br>• Reposition pads for better signal<br>• Check pad connections" },
        { title: "Persistent VF/pVT", content: "• Continue CPR between shocks<br>• Ensure minimal interruptions in compressions<br>• Give epinephrine/amiodarone per ACLS<br>• Consider reversible causes (H's and T's)<br>• Verify good pad contact and placement" },
        { title: "Return of VF After Conversion", content: "• Amiodarone 300 mg IV (first dose) or 150 mg (repeat)<br>• Continue ACLS protocol<br>• Treat underlying cause" },
        { title: "No Response to Cardioversion", content: "• Increase energy level<br>• Try alternative pad placement (anterior-posterior)<br>• Ensure adequate pad contact<br>• Consider medication (Amiodarone for VT, Adenosine for SVT)" }
      ]
    },
    {
      type: "warning",
      content: "<b>Safety Checklist - Before Every Shock:</b><br>1. ✓ Oxygen removed/clear<br>2. ✓ No one touching patient or bed<br>3. ✓ 'I'm clear, you're clear, we're all clear'<br>4. ✓ Visual confirmation of clearance<br>5. ✓ Sync ON (cardioversion) or OFF (defibrillation)<br>6. ✓ Correct energy selected"
    },
    {
      type: "info",
      title: "Special Considerations",
      content: "<b>Implanted Devices (Pacemaker/ICD):</b><br>• Place pads at least 2-3 inches away from device<br>• Anterior-posterior placement preferred<br>• Device may need reprogramming after shock<br><br><b>Medication Patches:</b><br>• Remove any transdermal patches (especially nitroglycerin)<br>• Wipe area clean before pad placement<br><br><b>Wet/Diaphoretic Patient:</b><br>• Quickly dry chest before pad application<br>• Poor contact reduces effectiveness<br><br><b>Excessive Chest Hair:</b><br>• Shave if time permits<br>• Press pads firmly to make contact<br>• Consider alternative if first shock fails"
    }
  ]
};
