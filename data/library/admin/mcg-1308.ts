import { Protocol } from '../../../types';

/**
 * MCG 1308 - Cardiac Monitoring / 12-Lead ECG Acquisition and Interpretation
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const mcg1308: Protocol = {
  id: "1308",
  refNo: "MCG 1308",
  title: "Cardiac Monitoring / 12-Lead ECG",
  category: "Medical Control",
  type: "Medical Control Guideline",
  lastUpdated: "Jul 1, 2025",
  icon: "ecg",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Monitoring / 12-Lead ECG", subtitle: "MCG 1308 • Acquisition and Interpretation", icon: "ecg" }]
    },
    {
      type: "list",
      title: "Purpose",
      items: [
        { title: "Continuous Monitoring", content: "Detect life-threatening arrhythmias in real-time for immediate intervention." },
        { title: "12-Lead ECG", content: "Identify STEMI, ischemia, conduction abnormalities, and other cardiac pathology." },
        { title: "Clinical Decision Support", content: "Guide treatment decisions, destination selection, and cath lab activation." }
      ]
    },
    {
      type: "warning",
      content: "<b>WHEN TO OBTAIN 12-LEAD ECG:</b><br>• Chest pain or discomfort (any quality)<br>• Dyspnea without clear respiratory cause<br>• Syncope or near-syncope<br>• Palpitations or 'racing heart'<br>• Altered mental status (consider cardiac etiology)<br>• Hypotension without obvious cause<br>• Any suspected cardiac complaint<br>• Post-cardiac arrest (ROSC)<br>• Electrical injury<br><br><b>Target: Obtain 12-lead within 10 minutes of patient contact for chest pain</b>"
    },
    {
      type: "section",
      title: "Lead Placement"
    },
    {
      type: "accordion",
      title: "Electrode Placement",
      items: [
        {
          title: "Limb Leads (Standard Placement)",
          content: "<b>RA (Right Arm):</b> Right shoulder/arm<br><b>LA (Left Arm):</b> Left shoulder/arm<br><b>RL (Right Leg):</b> Right lower abdomen/leg (ground)<br><b>LL (Left Leg):</b> Left lower abdomen/leg<br><br><b>For Supine Patients:</b> Electrodes can be placed on proximal extremities or trunk (shoulders and lower abdomen).<br><br><b>Quality Tip:</b> Avoid placing limb leads over bone or muscle. Place on flat, fleshy areas."
        },
        {
          title: "Precordial Leads (V1-V6)",
          content: "<b>V1:</b> 4th intercostal space, RIGHT sternal border<br><b>V2:</b> 4th intercostal space, LEFT sternal border<br><b>V3:</b> Midway between V2 and V4<br><b>V4:</b> 5th intercostal space, LEFT midclavicular line<br><b>V5:</b> Same horizontal level as V4, anterior axillary line<br><b>V6:</b> Same horizontal level as V4-V5, midaxillary line<br><br><b>Landmark:</b> 4th ICS is at the level of the nipple in males. Palpate down from sternal angle (angle of Louis) which is at 2nd ICS."
        },
        {
          title: "Right-Sided Leads (V4R)",
          content: "<b>Indication:</b> Inferior STEMI (II, III, aVF) - rule out RV infarct<br><br><b>V4R Placement:</b> 5th intercostal space, RIGHT midclavicular line (mirror of V4)<br><br><b>STEMI Criteria:</b> ST elevation ≥ 1 mm in V4R indicates RV infarct<br><br><b>Clinical Implication:</b> Avoid nitrates and diuretics. Patient is preload-dependent. May need fluid challenge."
        },
        {
          title: "Posterior Leads (V7-V9)",
          content: "<b>Indication:</b> Suspected posterior STEMI (horizontal ST depression V1-V3)<br><br><b>V7:</b> Left posterior axillary line, same horizontal level as V6<br><b>V8:</b> Left mid-scapular line, same level<br><b>V9:</b> Left paraspinal border, same level<br><br><b>STEMI Criteria:</b> ST elevation ≥ 0.5 mm in V7-V9 (lower threshold than standard leads)<br><br><b>Note:</b> Must roll patient slightly right-side-down for placement. Document on ECG printout."
        },
        {
          title: "Common Placement Errors",
          content: "<b>Limb Lead Reversal:</b><br>• RA/LA swap: Inverted P, QRS, T in lead I. Positive aVR.<br>• Lead reversal can mimic pathology. Check if ECG looks bizarre.<br><br><b>Precordial Misplacement:</b><br>• V1-V2 too high: False poor R wave progression, false Q waves<br>• V4-V6 too low: Altered axis, ST-T changes<br><br><b>Skin Preparation:</b><br>• Hairy chest: Shave electrode sites<br>• Diaphoretic skin: Dry and apply adhesive<br>• Oily skin: Wipe with alcohol prep<br><br><b>Artifact:</b><br>• Patient movement, shivering, 60Hz interference<br>• Ensure patient is still and cables are not tangled"
        }
      ]
    },
    {
      type: "section",
      title: "Systematic ECG Interpretation"
    },
    {
      type: "accordion",
      title: "Step-by-Step Approach",
      items: [
        {
          title: "1. Rate",
          content: "<b>Methods:</b><br><br><b>6-Second Method (Irregular rhythms):</b><br>Count QRS complexes in 30 large boxes (6 seconds) x 10<br><br><b>300 Method (Regular rhythms):</b><br>300 / (number of large boxes between R waves)<br>Sequence: 300, 150, 100, 75, 60, 50<br><br><b>1500 Method (Precise):</b><br>1500 / (number of small boxes between R waves)<br><br><b>Normal:</b> 60-100 bpm<br><b>Bradycardia:</b> < 60 bpm<br><b>Tachycardia:</b> > 100 bpm"
        },
        {
          title: "2. Rhythm",
          content: "<b>Regular vs Irregular:</b><br>• Use calipers or mark paper to compare R-R intervals<br>• Regular: Sinus, SVT, VT, atrial flutter with fixed block<br>• Irregularly irregular: Atrial fibrillation, multifocal atrial tachycardia<br>• Regularly irregular: 2nd degree AV block, sinus arrhythmia<br><br><b>P Waves:</b><br>• Present? Upright in II, inverted in aVR?<br>• P:QRS ratio 1:1?<br>• If no P waves: A-Fib, junctional, ventricular rhythm"
        },
        {
          title: "3. Axis",
          content: "<b>Quick Method (Leads I and aVF):</b><br><br>• Lead I (+) and aVF (+): Normal axis (0 to +90)<br>• Lead I (+) and aVF (-): Left axis deviation (-1 to -90)<br>• Lead I (-) and aVF (+): Right axis deviation (+91 to +180)<br>• Lead I (-) and aVF (-): Extreme axis (-91 to -180)<br><br><b>Causes of LAD:</b> LAFB, inferior MI, LVH, WPW<br><b>Causes of RAD:</b> LPFB, RVH, lateral MI, PE, WPW"
        },
        {
          title: "4. Intervals",
          content: "<b>PR Interval (0.12 - 0.20 seconds):</b><br>• Short (< 0.12s): WPW, junctional rhythm<br>• Prolonged (> 0.20s): 1st degree AV block<br><br><b>QRS Duration (< 0.12 seconds):</b><br>• Narrow (< 0.12s): Supraventricular origin<br>• Wide (≥ 0.12s): Bundle branch block, ventricular rhythm, or aberrant conduction<br><br><b>QT Interval (QTc < 0.44 seconds):</b><br>• Varies with heart rate - use corrected QT (QTc)<br>• Prolonged QTc: Drug effect, electrolyte abnormality, congenital LQTS<br>• Risk for Torsades de Pointes"
        },
        {
          title: "5. P Wave / QRS Morphology",
          content: "<b>P Waves:</b><br>• Normal: Upright in I, II, aVF; inverted in aVR<br>• P mitrale (notched): Left atrial enlargement<br>• P pulmonale (peaked): Right atrial enlargement<br><br><b>QRS:</b><br>• Q waves: > 1 small box wide, > 1/3 QRS height = pathologic (old MI)<br>• R wave progression: Should increase V1 to V4, then decrease<br>• Poor R wave progression: Anterior MI, COPD, lead misplacement<br><br><b>Bundle Branch Blocks:</b><br>• RBBB: rSR' in V1 ('M' shape), wide S in I, V6<br>• LBBB: Dominant S in V1, broad R in I, V6, no septal Q waves"
        },
        {
          title: "6. ST Segment / T Waves",
          content: "<b>ST Segment (J-point to T wave onset):</b><br>• Normal: Isoelectric (at baseline)<br>• Elevation: Acute MI (STEMI), pericarditis, early repolarization, LV aneurysm<br>• Depression: Ischemia, reciprocal changes, digoxin effect, strain pattern<br><br><b>T Waves:</b><br>• Normal: Upright in I, II, V3-V6; inverted in aVR<br>• Hyperacute T: Early STEMI, hyperkalemia<br>• Inverted T: Ischemia, Wellens syndrome, post-MI, PE, CNS event<br>• Peaked T: Hyperkalemia (narrow, symmetric, 'tented')"
        }
      ]
    },
    {
      type: "section",
      title: "Critical ECG Findings"
    },
    {
      type: "accordion",
      title: "Findings Requiring Immediate Action",
      items: [
        {
          title: "STEMI",
          content: "<b>Criteria:</b><br>• ST elevation ≥ 2.5mm V2-V3 (male < 40)<br>• ST elevation ≥ 2.0mm V2-V3 (male ≥ 40)<br>• ST elevation ≥ 1.5mm V2-V3 (female)<br>• ST elevation ≥ 1.0mm in 2 contiguous leads (other leads)<br><br><b>Action:</b><br>• Activate cath lab (MCG 1303)<br>• Transmit ECG to STEMI center<br>• Aspirin, consider NTG (if no RV involvement)<br>• Transport to SRC<br><br><b>See MCG 1303 for complete STEMI criteria and equivalents</b>"
        },
        {
          title: "Ventricular Tachycardia (VT)",
          content: "<b>Recognition:</b><br>• Wide QRS (> 120ms) tachycardia<br>• Rate usually 140-250 bpm<br>• Monomorphic (regular) or polymorphic (Torsades)<br><br><b>VT Clues:</b><br>• AV dissociation (P waves march through at different rate)<br>• Capture/fusion beats<br>• Very wide QRS (> 160ms)<br>• Concordance in precordial leads<br><br><b>Action:</b><br>• Stable: Amiodarone 150mg IV over 10 min<br>• Unstable: Synchronized cardioversion<br>• Pulseless: Defibrillation per cardiac arrest protocol"
        },
        {
          title: "Third Degree (Complete) Heart Block",
          content: "<b>Recognition:</b><br>• P waves and QRS complexes at different rates<br>• No relationship between P and QRS (AV dissociation)<br>• Atrial rate > ventricular rate<br>• Regular R-R intervals<br><br><b>Escape Rhythm:</b><br>• Junctional escape: Narrow QRS, rate 40-60<br>• Ventricular escape: Wide QRS, rate 20-40<br><br><b>Action:</b><br>• TCP immediately if symptomatic<br>• Atropine unlikely to help (block is below AV node)<br>• Push-dose epinephrine as bridge to pacing"
        },
        {
          title: "Hyperkalemia",
          content: "<b>Progressive ECG Changes:</b><br>1. Peaked T waves (earliest, > 5.5 mEq/L)<br>2. Prolonged PR interval (> 6.0 mEq/L)<br>3. Widening QRS (> 6.5 mEq/L)<br>4. Loss of P waves (> 7.0 mEq/L)<br>5. Sine wave pattern (> 8.0 mEq/L)<br>6. VF/asystole<br><br><b>Action:</b><br>• Calcium chloride 1g IV (membrane stabilization)<br>• Sodium bicarbonate 1 mEq/kg IV<br>• Albuterol nebulizer (drives K intracellular)"
        },
        {
          title: "Pulseless Electrical Activity (PEA)",
          content: "<b>Definition:</b> Organized rhythm on monitor without palpable pulse<br><br><b>Recognition:</b><br>• Any rhythm (including sinus) without pulse<br>• Wide, slow complexes = worse prognosis<br>• Narrow, faster complexes = potentially reversible<br><br><b>Action:</b><br>• CPR, epinephrine per cardiac arrest protocol<br>• Identify and treat H's and T's<br>• Treat underlying cause (hypovolemia, tension pneumo, tamponade, etc.)"
        },
        {
          title: "Wellens Syndrome",
          content: "<b>Recognition:</b><br>• Biphasic (Type A) or deeply inverted (Type B) T waves in V2-V3<br>• Patient currently PAIN-FREE (resolving ischemia)<br>• Normal or minimally elevated troponins<br>• No significant Q waves or R wave loss<br><br><b>Significance:</b><br>• Critical stenosis of proximal LAD<br>• High risk for anterior STEMI (progression to complete occlusion)<br><br><b>Action:</b><br>• Treat as high-risk ACS<br>• Transport to PCI-capable facility<br>• Anticipate deterioration"
        },
        {
          title: "de Winter T-Waves (STEMI Equivalent)",
          content: "<b>Recognition:</b><br>• Upsloping ST depression > 1mm at J-point in V1-V6<br>• Tall, symmetric T waves (hyperacute appearance)<br>• May have slight ST elevation in aVR<br>• NO ST elevation in precordial leads<br><br><b>Significance:</b><br>• LAD occlusion equivalent<br>• Often missed because no 'classic' ST elevation<br><br><b>Action:</b><br>• Activate cath lab as STEMI equivalent<br>• Same treatment as STEMI"
        }
      ]
    },
    {
      type: "section",
      title: "Continuous Monitoring"
    },
    {
      type: "accordion",
      title: "Monitoring Best Practices",
      items: [
        {
          title: "Lead Selection for Monitoring",
          content: "<b>Lead II:</b> Best for rhythm analysis<br>• Good P wave visibility<br>• Oriented along cardiac axis<br>• Standard monitoring lead<br><br><b>V1:</b> Best for differentiating VT vs SVT with aberrancy<br>• Shows bundle branch morphology<br>• Helps identify wide complex rhythms<br><br><b>MCL1:</b> Modified V1 for 3-lead monitoring<br>• RA to left shoulder, LA to V1 position, LL to left hip<br>• Select 'Lead III' on monitor to display MCL1"
        },
        {
          title: "Alarm Settings",
          content: "<b>Heart Rate Alarms:</b><br>• Low: Typically 50 bpm (adjust for patient baseline)<br>• High: Typically 120-150 bpm<br><br><b>Critical Alarms:</b><br>• VF/VT detection<br>• Asystole<br>• Extreme brady/tachycardia<br><br><b>Best Practice:</b><br>• NEVER silence alarms without addressing cause<br>• Adjust alarm parameters to patient's baseline<br>• Verify alarm functionality during equipment check"
        },
        {
          title: "Artifact Recognition",
          content: "<b>60 Hz (AC Interference):</b><br>• Regular, fine baseline distortion<br>• Caused by electrical equipment, power lines<br>• Fix: Move away from electrical sources, check leads<br><br><b>Motion Artifact:</b><br>• Irregular baseline, muscle potential interference<br>• Caused by patient movement, shivering, transport<br>• Fix: Secure leads, ask patient to remain still<br><br><b>Baseline Wander:</b><br>• Slow undulation of baseline<br>• Caused by respiration, poor electrode contact<br>• Fix: Secure electrodes, dry skin, proper placement"
        }
      ]
    },
    {
      type: "section",
      title: "Special Situations"
    },
    {
      type: "accordion",
      title: "Special ECG Considerations",
      items: [
        {
          title: "Pacemaker Rhythms",
          content: "<b>Recognition:</b><br>• Pacing spike before P wave (atrial pacing)<br>• Pacing spike before QRS (ventricular pacing)<br>• Both spikes (dual chamber pacing)<br><br><b>Assessment:</b><br>• Capture: Is each spike followed by appropriate complex?<br>• Sensing: Does pacemaker inhibit appropriately when intrinsic activity present?<br>• Rate: Is paced rate appropriate for programmed settings?<br><br><b>Paced STEMI:</b><br>• Very difficult to interpret - pacing obscures ST changes<br>• Transport to PCI center if clinical suspicion high<br>• Cardiologist interpretation needed"
        },
        {
          title: "LBBB and STEMI",
          content: "<b>Challenge:</b> LBBB causes ST-T changes that can mimic or mask STEMI<br><br><b>Sgarbossa Criteria (Modified):</b><br>1. Concordant ST elevation ≥ 1mm (any lead): +5 points<br>2. Concordant ST depression ≥ 1mm (V1-V3): +3 points<br>3. Discordant ST elevation ≥ 1mm with STE/S ratio ≥ 0.25: +2 points<br><br><b>Score ≥ 3:</b> High specificity for STEMI<br><br><b>Clinical Approach:</b><br>• New LBBB + ischemic symptoms = treat as STEMI equivalent<br>• Old LBBB + symptoms: Apply Sgarbossa criteria<br>• When in doubt, activate cath lab"
        },
        {
          title: "Pediatric ECG Differences",
          content: "<b>Normal Pediatric Variations:</b><br><br><b>Heart Rate:</b> Higher baseline (infant: 100-160, child: 60-120)<br><br><b>Axis:</b> Right axis deviation normal in infants (RV dominant)<br><br><b>T waves:</b> May be inverted in V1-V3 (juvenile pattern) up to adolescence<br><br><b>QTc:</b> Same upper limit applies (< 0.44s)<br><br><b>PR interval:</b> Shorter in children (0.08-0.16s normal for age)<br><br><b>Key Point:</b> Use age-appropriate normal values. Consult pediatric reference or contact medical control if uncertain."
        },
        {
          title: "Drug Effects on ECG",
          content: "<b>Digoxin:</b><br>• 'Salvador Dali mustache' ST depression (sagging)<br>• T wave flattening/inversion<br>• Shortened QT<br>• Toxicity: Any arrhythmia, especially regularized A-Fib, bidirectional VT<br><br><b>Beta-blockers/Calcium channel blockers:</b><br>• Bradycardia, prolonged PR<br>• Toxicity: Profound bradycardia, heart block<br><br><b>Tricyclic Antidepressants:</b><br>• Prolonged QRS, QTc<br>• Right axis deviation<br>• Toxicity: Wide complex tachycardia, seizures<br><br><b>Antiarrhythmics (Amiodarone, Sotalol, Procainamide):</b><br>• Prolonged QTc<br>• Risk of Torsades de Pointes"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Compare to Prior ECG:</b><br>If available, always compare to prior ECGs. What looks abnormal may be patient's baseline. What looks 'normal' may be new for that patient.<br><br><b>The ECG is One Data Point:</b><br>Never ignore clinical presentation. A 'normal' ECG does not rule out MI. Treat the patient, not the tracing.<br><br><b>Serial ECGs:</b><br>If initial ECG is non-diagnostic but clinical suspicion high, repeat ECG every 15-30 minutes. STEMI can evolve rapidly.<br><br><b>Lead Placement Matters:</b><br>Misplaced leads cause more confusion than any pathology. Take the extra 30 seconds to place leads correctly.<br><br><b>Print the ECG:</b><br>Always print and save the 12-lead. Digital transmission is great, but a physical copy allows comparison and documentation.<br><br><b>Reciprocal Changes Confirm Diagnosis:</b><br>ST depression in leads opposite to ST elevation (e.g., inferior depression with anterior STEMI) increases diagnostic confidence.<br><br><b>aVR Matters:</b><br>ST elevation in aVR with widespread ST depression suggests left main or severe 3-vessel disease. Very high mortality - urgent cath lab."
    },
    {
      type: "info",
      title: "Quick Reference - ECG Intervals",
      content: "<b>PR Interval:</b> 0.12 - 0.20 seconds (3-5 small boxes)<br><b>QRS Duration:</b> < 0.12 seconds (< 3 small boxes)<br><b>QTc Interval:</b> < 0.44 seconds (varies with rate)<br><br><b>Small Box:</b> 0.04 seconds (40 ms)<br><b>Large Box:</b> 0.20 seconds (200 ms)<br><b>Standard Paper Speed:</b> 25 mm/second<br><br><b>Voltage:</b><br>• Small box = 1 mm = 0.1 mV<br>• Large box = 5 mm = 0.5 mV<br>• Standard calibration: 10 mm = 1 mV"
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1211 Cardiac Chest Pain / STEMI" },
        { title: "TP-1212 Bradycardia" },
        { title: "TP-1213 Tachycardia" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "MCG 1303 Cath Lab Activation" },
        { title: "TP-1207 Shock / Hypotension" }
      ]
    }
  ]
};
