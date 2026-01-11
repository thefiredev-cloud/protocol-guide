import { Protocol } from '../../../types';

/**
 * TP-1213 - Cardiac Dysrhythmia: Tachycardia
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const tp1213: Protocol = {
  id: "1213",
  refNo: "TP-1213",
  title: "Cardiac Dysrhythmia - Tachycardia",
  category: "Cardiovascular",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "timeline",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Tachycardia", subtitle: "Adult • Standing Order", icon: "timeline" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Cardiac Dysrhythmia - Tachycardia (DYSR)", content: "Heart rate > 100 bpm. Clinically significant tachyarrhythmias typically > 150 bpm." },
        { title: "Supraventricular Tachycardia (SVT)", content: "Regular narrow complex tachycardia, usually 150-250 bpm. Includes AVNRT, AVRT, atrial tachycardia." },
        { title: "Ventricular Tachycardia (VT)", content: "Wide complex tachycardia (QRS > 120ms). May be monomorphic or polymorphic. Assume VT until proven otherwise." },
        { title: "Atrial Fibrillation/Flutter", content: "Irregularly irregular rhythm (A-Fib) or regular with sawtooth pattern (Flutter). Variable rate control." }
      ]
    },
    {
      type: "warning",
      content: "<b>UNSTABLE TACHYCARDIA - Immediate Synchronized Cardioversion Required:</b><br>• Hypotension (SBP < 90 mmHg)<br>• Altered mental status / Acute confusion<br>• Signs of shock (cool, clammy, delayed cap refill, mottling)<br>• Ischemic chest pain unrelieved by oxygen<br>• Acute heart failure (pulmonary edema, JVD)<br><br><b>Critical Question:</b> Is the tachycardia CAUSING the instability, or is the tachycardia a RESPONSE to another condition (sepsis, hypovolemia, pain)? Sinus tachycardia should NOT be cardioverted."
    },
    {
      type: "section",
      title: "Assessment"
    },
    {
      type: "list",
      title: "Initial Evaluation",
      items: [
        { title: "1. ABCs + Vitals", content: "Airway, breathing, circulation. BP, SpO2, EtCO2. Assess perfusion status." },
        { title: "2. 12-Lead ECG", content: "<b>Mandatory.</b> Identify rhythm type: Narrow vs Wide, Regular vs Irregular. Look for ischemic changes." },
        { title: "3. Stable vs Unstable", content: "Unstable = any hemodynamic compromise. Rate alone does not define instability - clinical picture matters." },
        { title: "4. Identify Rhythm", content: "Narrow regular (SVT), narrow irregular (A-Fib), wide regular (VT), wide irregular (A-Fib with aberrancy or polymorphic VT)." },
        { title: "5. History", content: "Prior episodes? Known arrhythmia? Medications (especially nodal agents, anticoagulation)? Stimulant use?" }
      ]
    },
    {
      type: "accordion",
      title: "Rhythm Identification",
      items: [
        {
          title: "Narrow Complex Regular - SVT",
          content: "<b>Rate:</b> Usually 150-250 bpm<br><b>QRS:</b> < 120 ms (narrow)<br><b>Rhythm:</b> Regular<br><b>P waves:</b> Often buried in QRS or T waves<br><br><b>Types:</b><br>• AVNRT (most common) - Reentry circuit at AV node<br>• AVRT (WPW) - Accessory pathway<br>• Atrial tachycardia<br><br><b>Treatment:</b> Vagal maneuvers, then Adenosine"
        },
        {
          title: "Narrow Complex Irregular - A-Fib/Flutter",
          content: "<b>Atrial Fibrillation:</b><br>• Irregularly irregular R-R intervals<br>• No discernible P waves (fibrillatory baseline)<br>• Variable ventricular rate (often 100-180 bpm uncontrolled)<br><br><b>Atrial Flutter:</b><br>• Sawtooth flutter waves (best seen in II, III, aVF)<br>• Regular or regularly irregular (variable block)<br>• Classic rate: 150 bpm (2:1 block) or 75 bpm (4:1 block)<br><br><b>Treatment:</b> Rate control vs rhythm control based on stability"
        },
        {
          title: "Wide Complex Regular - Assume VT",
          content: "<b>Rate:</b> Usually 140-250 bpm<br><b>QRS:</b> > 120 ms (wide)<br><b>Rhythm:</b> Regular<br><br><b>ASSUME VT UNTIL PROVEN OTHERWISE</b><br>• VT is far more common than SVT with aberrancy<br>• Treating SVT as VT is safe; treating VT as SVT is dangerous<br><br><b>VT Clues:</b><br>• AV dissociation (P waves march through at different rate)<br>• Fusion/capture beats<br>• Extreme axis deviation<br>• Concordance in precordial leads<br>• Very wide QRS > 160 ms"
        },
        {
          title: "Wide Complex Irregular - Critical",
          content: "<b>Differential:</b><br>1. <b>A-Fib with aberrancy</b> (bundle branch block)<br>2. <b>A-Fib with WPW</b> (preexcitation) - DANGEROUS<br>3. <b>Polymorphic VT / Torsades de Pointes</b><br><br><b>A-Fib with WPW:</b> Very rapid, irregular, varying QRS width<br><b>CONTRAINDICATIONS:</b> Adenosine, calcium channel blockers, beta-blockers, digoxin (can cause VF)<br><br><b>Polymorphic VT/Torsades:</b> Twisting axis, often associated with prolonged QT<br><b>Treatment:</b> Defibrillation if pulseless; Magnesium 2g IV if stable"
        },
        {
          title: "Sinus Tachycardia - Do NOT Cardiovert",
          content: "<b>Rate:</b> Usually 100-150 bpm (rarely > 180)<br><b>P waves:</b> Present, normal morphology before each QRS<br><b>Cause:</b> Physiologic response (pain, fever, hypovolemia, anxiety, sepsis, PE)<br><br><b>Treatment:</b> Treat the underlying cause, NOT the rhythm<br>• Fluids for hypovolemia<br>• Pain control<br>• Antipyretics for fever<br>• Identify and treat sepsis<br><br><b>WARNING:</b> Cardioverting sinus tachycardia is ineffective and potentially harmful"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "accordion",
      title: "UNSTABLE Tachycardia (Wide or Narrow)",
      items: [
        {
          title: "1. Preparation",
          content: "• Apply defibrillation pads (Anterior-Posterior preferred)<br>• Establish IV/IO access<br>• SpO2 and EtCO2 monitoring<br>• BVM at bedside<br>• Prepare sedation medication"
        },
        {
          title: "2. Sedation (If Patient Conscious)",
          content: "<b>Midazolam (Versed):</b> 2-5 mg IV/IO/IM<br>• May repeat x1 in 5 minutes if inadequate sedation<br>• Maximum 10 mg total<br><br><b>Do NOT delay cardioversion</b> for sedation if patient is severely unstable (near-arrest, unconscious)"
        },
        {
          title: "3. Synchronized Cardioversion",
          content: "<b>CRITICAL:</b> Ensure 'SYNC' mode is activated. Verify sync markers on R waves.<br><br><b>Biphasic Energy (Recommended):</b><br>• Narrow complex: 50-100J initial, then 100J, 150J, 200J<br>• Wide complex (VT): 100J initial, then 150J, 200J<br>• A-Fib: 120-200J initial<br>• Follow manufacturer recommendations<br><br><b>Monophasic Energy:</b><br>• Start 100J, escalate: 200J, 300J, 360J<br><br><b>After each shock:</b> Re-enable SYNC mode (auto-disables after shock)"
        },
        {
          title: "4. Post-Cardioversion Care",
          content: "• Reassess rhythm and hemodynamics<br>• Obtain 12-lead ECG<br>• Monitor for recurrence<br>• Continue monitoring and transport"
        }
      ]
    },
    {
      type: "accordion",
      title: "STABLE - Narrow Complex Regular (SVT)",
      items: [
        {
          title: "1. Vagal Maneuvers (First-Line)",
          content: "<b>Modified Valsalva (Most Effective):</b><br>1. Patient sits upright at 45 degrees<br>2. Forceful exhalation against closed glottis for 15 seconds (blow into 10mL syringe)<br>3. Immediately lay patient flat and elevate legs 45 degrees for 15 seconds<br><br><b>Alternative:</b> Carotid sinus massage (contraindicated if bruit, stroke history, carotid disease)<br><br><b>Ice water to face</b> (diving reflex) - especially useful in pediatrics"
        },
        {
          title: "2. Adenosine (If Vagal Unsuccessful)",
          content: "<b>First Dose:</b> 6 mg rapid IV push<br>• Inject as close to heart as possible (antecubital preferred)<br>• Immediately follow with 20 mL NS flush<br>• Run rhythm strip during administration<br><br><b>Second Dose:</b> 12 mg rapid IV push (if no conversion after 2 minutes)<br>• Same technique with rapid flush<br><br><b>Third Dose:</b> 12 mg may be repeated x1 if needed<br><br><b>Maximum:</b> 30 mg total"
        },
        {
          title: "Adenosine Administration Tips",
          content: "<b>Warn Patient:</b> Brief but intense symptoms expected<br>• Chest pressure/pain<br>• Flushing, warmth<br>• Sense of impending doom<br>• Brief asystole (normal - reassure patient this is expected)<br><br><b>Contraindications:</b><br>• Heart transplant (use 3 mg initial dose - hypersensitive)<br>• Known WPW with pre-excited A-Fib<br>• Theophylline/caffeine use (higher doses needed)<br>• Dipyridamole use (reduce dose by 50%)"
        },
        {
          title: "3. Consider Cardioversion",
          content: "If patient remains in SVT after adenosine:<br>• Consider synchronized cardioversion at 50-100J<br>• Contact medical control for additional options"
        }
      ]
    },
    {
      type: "accordion",
      title: "STABLE - Wide Complex Regular (VT)",
      items: [
        {
          title: "1. Confirm Wide Complex is VT",
          content: "<b>Assume VT until proven otherwise.</b><br><br>VT Criteria:<br>• AV dissociation<br>• Capture or fusion beats<br>• Very wide QRS (>160ms)<br>• Northwest axis<br>• Concordance in precordial leads<br><br>If uncertain: TREAT AS VT"
        },
        {
          title: "2. Amiodarone (First-Line for Stable VT)",
          content: "<b>Dose:</b> 150 mg in 100 mL NS<br><b>Infusion:</b> IV piggyback over 10 minutes (15 mg/min)<br><br><b>Maximum single dose:</b> 150 mg<br><b>Total daily dose:</b> 2.2 g (in-hospital)<br><br><b>Caution:</b><br>• Can cause hypotension (slow infusion if BP drops)<br>• Prolong QT (monitor for torsades)"
        },
        {
          title: "3. Alternative: Procainamide",
          content: "<b>Dose:</b> 20-50 mg/min IV infusion<br><b>Maximum:</b> 17 mg/kg total loading dose<br><br><b>Stop infusion if:</b><br>• Arrhythmia suppressed<br>• Hypotension develops<br>• QRS widens > 50%<br>• Maximum dose reached"
        },
        {
          title: "4. Synchronized Cardioversion",
          content: "If patient becomes unstable or medications fail:<br>• Sedate with Midazolam 2-5 mg IV<br>• Synchronized cardioversion at 100J, escalate as needed<br>• Ensure SYNC mode active for each shock"
        },
        {
          title: "12-Lead ECG Documentation",
          content: "<b>MANDATORY</b> - Obtain before and after treatment<br>• Document wide complex tachycardia<br>• Look for underlying ischemia<br>• Transmit to receiving facility"
        }
      ]
    },
    {
      type: "accordion",
      title: "STABLE - Irregular Narrow (A-Fib/Flutter)",
      items: [
        {
          title: "Prehospital Approach",
          content: "Atrial fibrillation with RVR (rapid ventricular response) in stable patients is generally managed <b>supportively in the prehospital setting</b>.<br><br>Rate control medications (diltiazem, metoprolol) may worsen hypotension or cause bradycardia."
        },
        {
          title: "Treatment",
          content: "<b>Stable with adequate BP:</b><br>• Supportive care<br>• IV fluid if needed<br>• Transport for rate control in ED<br><br><b>Borderline hypotension (SBP 80-100):</b><br>• Fluid bolus: 500 mL NS<br>• Monitor closely for deterioration<br><br><b>If patient becomes unstable:</b><br>• Proceed to synchronized cardioversion<br>• 120-200J biphasic"
        },
        {
          title: "Anticoagulation Consideration",
          content: "<b>Critical Question:</b> How long has the patient been in A-Fib?<br><br><b>New onset (< 48 hours):</b> Lower stroke risk with cardioversion<br><b>Unknown onset or > 48 hours:</b> Higher stroke risk with cardioversion<br><br>This is primarily an ED/hospital consideration for elective cardioversion. Emergent cardioversion for instability proceeds regardless of anticoagulation status."
        }
      ]
    },
    {
      type: "accordion",
      title: "Special Situations",
      items: [
        {
          title: "Wide Complex Irregular - A-Fib with WPW",
          content: "<b>DANGER:</b> Pre-excited A-Fib with accessory pathway<br><b>Appearance:</b> Very rapid, irregular, varying QRS width, rates often 200-300 bpm<br><br><b>CONTRAINDICATED Medications:</b><br>• Adenosine<br>• Calcium channel blockers<br>• Beta-blockers<br>• Digoxin<br><br><b>These medications can block the AV node, forcing conduction down the accessory pathway and precipitating VF.</b><br><br><b>Treatment:</b> Synchronized cardioversion at 100-200J"
        },
        {
          title: "Polymorphic VT / Torsades de Pointes",
          content: "<b>Recognition:</b> Wide complex, twisting QRS axis, varying amplitude<br><b>Often associated with:</b> Prolonged QT interval<br><br><b>Causes of prolonged QT:</b><br>• Medications (antipsychotics, antiemetics, antiarrhythmics)<br>• Electrolyte abnormalities (hypokalemia, hypomagnesemia)<br>• Congenital long QT syndrome<br><br><b>Treatment:</b><br>• If pulseless: Defibrillation (NOT synchronized)<br>• If pulse present: Magnesium Sulfate 2g IV over 2 minutes<br>• Correct electrolytes if possible"
        },
        {
          title: "SVT in Pediatrics",
          content: "<b>Most common arrhythmia in children</b><br><b>Rate:</b> Often > 220 bpm in infants<br><br><b>Vagal Maneuvers:</b><br>• Ice to face (diving reflex) - very effective<br>• Blow through straw<br><br><b>Adenosine:</b><br>• First dose: 0.1 mg/kg IV (max 6 mg)<br>• Second dose: 0.2 mg/kg IV (max 12 mg)<br><br><b>Cardioversion:</b> 0.5-1 J/kg, increase to 2 J/kg"
        },
        {
          title: "Recurrent/Refractory SVT",
          content: "If SVT recurs after successful conversion:<br>• Repeat vagal maneuvers<br>• Repeat adenosine<br>• Consider calcium channel blocker or beta-blocker (per medical control)<br>• Transport with continuous monitoring"
        }
      ]
    },
    {
      type: "accordion",
      title: "Medication Dosing",
      items: [
        {
          title: "Adenosine",
          content: "<b>Adult Dose:</b><br>• First: 6 mg rapid IV push + 20 mL NS flush<br>• Second: 12 mg rapid IV push + 20 mL NS flush<br>• Third: 12 mg if needed<br>• Maximum: 30 mg total<br><br><b>Pediatric Dose:</b><br>• First: 0.1 mg/kg (max 6 mg)<br>• Second: 0.2 mg/kg (max 12 mg)<br><br><b>Half-life:</b> < 10 seconds<br><b>Mechanism:</b> Blocks AV node conduction, terminates reentry<br><br><b>Special populations:</b><br>• Heart transplant: Use 3 mg initial (hypersensitive)<br>• Central line: Use 3 mg initial (closer to heart)",
          icon: "medication"
        },
        {
          title: "Amiodarone",
          content: "<b>Adult Dose (Stable VT):</b><br>• 150 mg in 100 mL NS IV over 10 minutes<br><br><b>Adult Dose (Cardiac Arrest):</b><br>• 300 mg IV/IO bolus (first dose)<br>• 150 mg IV/IO bolus (second dose)<br><br><b>Pediatric Dose:</b><br>• 5 mg/kg IV/IO (max 300 mg)<br><br><b>Side Effects:</b> Hypotension, bradycardia, QT prolongation<br><b>Caution:</b> Slow or hold infusion if hypotension develops",
          icon: "medication"
        },
        {
          title: "Midazolam (Versed) - Cardioversion Sedation",
          content: "<b>Adult Dose:</b> 2-5 mg IV/IO/IM/IN<br><b>Repeat:</b> May repeat x1 in 5 minutes<br><b>Maximum:</b> 10 mg total<br><br><b>Pediatric Dose:</b> 0.1-0.2 mg/kg IV/IM/IN (max 5 mg)<br><br><b>Onset:</b> 1-3 min IV, 5-10 min IM/IN<br><b>Duration:</b> 30-60 minutes<br><br><b>Note:</b> Have BVM and airway equipment ready. Monitor respiratory status closely.",
          icon: "medication"
        },
        {
          title: "Magnesium Sulfate (Torsades)",
          content: "<b>Adult Dose:</b> 2 g IV over 2-5 minutes<br>• May repeat once if torsades continues<br><br><b>Pediatric Dose:</b> 25-50 mg/kg IV over 10-20 minutes (max 2 g)<br><br><b>Indication:</b> Polymorphic VT / Torsades de Pointes<br><b>Mechanism:</b> Membrane stabilization, suppresses early afterdepolarizations",
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
          title: "Pediatric Tachycardia",
          content: "<b>Normal Heart Rates by Age:</b><br>• Neonate: 100-180 bpm<br>• Infant: 100-160 bpm<br>• Toddler: 90-150 bpm<br>• Child: 70-120 bpm<br>• Adolescent: 60-100 bpm<br><br><b>SVT in Infants:</b> Rate often > 220 bpm<br><b>Sinus Tachycardia:</b> Rate usually < 220 bpm, gradual onset/offset<br><br><b>Cardioversion:</b> 0.5-1 J/kg initial, then 2 J/kg"
        },
        {
          title: "Pregnancy",
          content: "<b>Physiologic tachycardia is normal in pregnancy</b> (HR 80-100 bpm baseline)<br><br><b>SVT Treatment:</b><br>• Vagal maneuvers - safe<br>• Adenosine - safe, drug of choice<br>• Cardioversion - safe at all stages of pregnancy<br><br><b>Position:</b> Left lateral tilt to avoid IVC compression<br><b>Fetal monitoring:</b> Arrange at receiving facility"
        },
        {
          title: "Elderly/Cardiac History",
          content: "<b>Higher risk for:</b><br>• Medication-induced arrhythmias<br>• Ischemia-induced arrhythmias<br>• Atrial fibrillation/flutter<br>• Poor tolerance of rapid rates (reduced cardiac reserve)<br><br><b>Consider:</b><br>• Lower cardioversion energy initially<br>• Check for ischemia (12-lead ECG)<br>• Medication list review (digoxin, antiarrhythmics)"
        },
        {
          title: "Stimulant-Induced Tachycardia",
          content: "<b>Causes:</b> Cocaine, methamphetamine, synthetic cathinones, caffeine<br><br><b>Sinus tachycardia:</b> Common, treat with supportive care and sedation<br><b>SVT/VT:</b> May occur with cocaine/meth<br><br><b>Treatment:</b><br>• Benzodiazepines for sedation and rate control<br>• Avoid beta-blockers in cocaine (can cause unopposed alpha, worsening HTN)<br>• Standard ACLS for arrhythmias"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Wide Complex = VT Until Proven Otherwise:</b><br>Never assume SVT with aberrancy in the field. Treating VT as SVT (giving nodal blockers) can be fatal. Treating SVT as VT (cardioversion, amiodarone) is safe.<br><br><b>Rate Does Not Equal Instability:</b><br>A heart rate of 180 bpm in a young patient with SVT may be well-tolerated. A rate of 130 bpm in an elderly patient with CAD may cause severe symptoms. Treat the patient, not the number.<br><br><b>SYNC Mode After Every Shock:</b><br>Most defibrillators reset to unsynchronized mode after each shock. Re-enable SYNC before each cardioversion attempt.<br><br><b>Adenosine Technique Matters:</b><br>Give as close to heart as possible, rapid IV push, immediate 20 mL flush. Poor technique = failure.<br><br><b>Modified Valsalva is Superior:</b><br>Adding the leg raise/supine positioning after strain significantly increases conversion rates (up to 43% vs 17%).<br><br><b>Sinus Tachycardia is NOT an Arrhythmia:</b><br>It's a physiologic response. Find and treat the cause (pain, hypovolemia, fever, anxiety, sepsis, PE). Do NOT cardiovert."
    },
    {
      type: "info",
      title: "Cardioversion Energy Summary",
      content: "<b>Narrow Complex SVT:</b> 50-100J initial, escalate to 150J, 200J<br><b>Atrial Fibrillation:</b> 120-200J initial<br><b>Atrial Flutter:</b> 50-100J initial<br><b>Monomorphic VT:</b> 100J initial, escalate to 150J, 200J<br><b>Polymorphic VT:</b> Treat as VF - defibrillate (NOT synchronized) at maximum energy<br><br><b>Pediatric:</b> 0.5-1 J/kg initial, then 2 J/kg<br><br><b>Always use SYNC mode for organized rhythms with a pulse.</b>"
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1212 Cardiac Dysrhythmia - Bradycardia" },
        { title: "TP-1211 Cardiac Chest Pain / STEMI" },
        { title: "MCG 1303 Cath Lab Activation" },
        { title: "MCG 1308 Cardiac Monitoring / 12-Lead ECG" },
        { title: "TP-1207 Shock / Hypotension" },
        { title: "TP-1234 Toxicological Emergencies" }
      ]
    }
  ]
};
