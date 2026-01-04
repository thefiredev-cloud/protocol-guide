import { Protocol } from '../../../types';

export const proc12Lead: Protocol = {
  id: "PROC-12LEAD",
  refNo: "12-Lead ECG",
  title: "12-Lead ECG Acquisition",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jan 1, 2026",
  icon: "monitor_heart",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "12-Lead ECG", subtitle: "Acquisition & Interpretation Basics", icon: "monitor_heart" }]
    },
    {
      type: "list",
      title: "Indications",
      items: [
        { title: "Chest Pain/Discomfort", content: "Any cardiac-sounding chest pain or anginal equivalent." },
        { title: "Suspected ACS", content: "STEMI identification within 10 minutes of patient contact." },
        { title: "Cardiac Arrhythmia", content: "Wide-complex tachycardia, irregular rhythms, symptomatic bradycardia." },
        { title: "Syncope", content: "Unexplained loss of consciousness, possible cardiac origin." },
        { title: "Shortness of Breath", content: "Dyspnea with suspected cardiac etiology (CHF, MI)." },
        { title: "Stroke", content: "CVA patients (screen for A-fib, concurrent ACS)." },
        { title: "Electrolyte Disturbances", content: "Suspected hyperkalemia, hypokalemia, hypercalcemia." },
        { title: "Overdose/Toxicology", content: "Cardiac medication overdose, TCA, other cardiotoxic ingestions." }
      ]
    },
    {
      type: "list",
      title: "Equipment",
      items: [
        { title: "ECG Machine", content: "12-lead capable, with interpretation software." },
        { title: "Electrodes", content: "10 electrodes (4 limb + 6 precordial). Check expiration dates." },
        { title: "Prep Supplies", content: "• Alcohol wipes<br>• Towel<br>• Razor (if needed for chest hair)<br>• Gauze pads" },
        { title: "Transmission", content: "Ability to transmit to receiving facility if STEMI Alert." }
      ]
    },
    {
      type: "list",
      title: "Patient Preparation",
      items: [
        { title: "Position", content: "• Supine preferred (most reproducible)<br>• 45° if patient cannot tolerate lying flat<br>• Document position if not supine" },
        { title: "Exposure", content: "• Expose chest, wrists, ankles<br>• Maintain patient privacy/warmth<br>• Remove bra (females) - can place over chest after electrode placement" },
        { title: "Skin Prep", content: "• Wipe electrode sites with alcohol<br>• Shave excessive chest hair if needed<br>• Dry skin thoroughly<br>• Rough skin slightly with gauze (improves contact)" },
        { title: "Patient Instructions", content: "• Remain still during acquisition<br>• Breathe normally, don't hold breath<br>• Relax arms and legs<br>• Avoid talking during recording" }
      ]
    },
    {
      type: "list",
      title: "Limb Lead Placement",
      items: [
        { title: "Right Arm (RA/White)", content: "Right wrist or shoulder (fleshy part, avoid bone)." },
        { title: "Left Arm (LA/Black)", content: "Left wrist or shoulder." },
        { title: "Right Leg (RL/Green)", content: "Right ankle or upper thigh (ground lead)." },
        { title: "Left Leg (LL/Red)", content: "Left ankle or upper thigh." }
      ]
    },
    {
      type: "info",
      title: "Limb Lead Mnemonic",
      content: "<b>Snow over grass (white over green):</b><br>White (RA) and Black (LA) on arms<br>Green (RL) and Red (LL) on legs<br><br><b>Alternative: 'Smoke over fire'</b><br>White smoke (RA) over green grass (RL)<br>Black clouds (LA) over red fire (LL)"
    },
    {
      type: "list",
      title: "Precordial Lead Placement",
      items: [
        { title: "V1 (Red/Brown)", content: "4th intercostal space, RIGHT sternal border.<br><b>Landmark:</b> Angle of Louis (sternal angle) = 2nd rib." },
        { title: "V2 (Yellow)", content: "4th intercostal space, LEFT sternal border.<br><b>Mirror of V1 across sternum.</b>" },
        { title: "V3 (Green)", content: "Midway between V2 and V4.<br><b>Place after V4 is positioned.</b>" },
        { title: "V4 (Blue/Brown)", content: "5th intercostal space, LEFT midclavicular line.<br><b>Key landmark - place this first, then V3.</b>" },
        { title: "V5 (Orange)", content: "Same level as V4, LEFT anterior axillary line.<br><b>Horizontal from V4.</b>" },
        { title: "V6 (Purple/Violet)", content: "Same level as V4/V5, LEFT midaxillary line.<br><b>Horizontal from V4/V5.</b>" }
      ]
    },
    {
      type: "warning",
      content: "<b>Common Placement Errors:</b><br>• V1/V2 too high (3rd instead of 4th intercostal space) → false anterior MI<br>• V4 too medial or lateral → distorts transition zone<br>• V5/V6 not horizontal with V4 → inaccurate lateral leads<br>• Electrodes on breast tissue (females) → poor contact, artifact<br><br><b>Female Patients:</b> Place V4-V6 <u>under</u> breast tissue, not on top"
    },
    {
      type: "list",
      title: "Acquisition Procedure",
      items: [
        { title: "1. Prep & Place", content: "• Prepare skin<br>• Apply all 10 electrodes correctly<br>• Ensure good contact (press firmly)" },
        { title: "2. Connect Leads", content: "• Attach lead wires to electrodes<br>• Manage cable to avoid pulling on electrodes<br>• Check for secure connections" },
        { title: "3. Check Quality", content: "• Verify all leads showing waveform on monitor<br>• Check for artifact, wandering baseline<br>• Ensure patient relaxed and still" },
        { title: "4. Acquire ECG", content: "• Press 'Acquire' or 'Print' button<br>• Patient must remain still during 10-second recording<br>• Watch for artifact during acquisition" },
        { title: "5. Review Quality", content: "• Check all 12 leads visible and clear<br>• Verify no baseline wander or artifact<br>• Confirm standardization (10mm = 1mV)<br>• Re-acquire if poor quality" },
        { title: "6. Document", content: "• Patient name, date, time<br>• Reason for ECG<br>• Clinical presentation<br>• Any medications given<br>• Your interpretation or machine reading" }
      ]
    },
    {
      type: "list",
      title: "Special ECGs",
      items: [
        { title: "Right-Sided ECG", content: "<b>Indication:</b> Suspected RV infarction (inferior STEMI).<br><b>Technique:</b><br>• Place V1-V6 on RIGHT chest (mirror image)<br>• Label V1R through V6R<br>• Look for ST elevation in V3R-V4R" },
        { title: "Posterior ECG", content: "<b>Indication:</b> Suspected posterior MI.<br><b>Technique:</b><br>• V7: Left posterior axillary line (level with V6)<br>• V8: Left mid-scapular line (level with V6)<br>• V9: Left paraspinal (level with V6)<br>• Look for ST elevation V7-V9" },
        { title: "Serial ECGs", content: "<b>Indication:</b> Evolving ACS, dynamic changes.<br><b>Technique:</b><br>• Repeat ECG every 10-15 min if ongoing symptoms<br>• Compare to previous ECG<br>• Mark electrode sites with marker for exact replication<br>• Look for dynamic ST changes" }
      ]
    },
    {
      type: "accordion",
      title: "Systematic Interpretation",
      items: [
        {
          title: "1. Rate",
          content: "<b>Methods:</b><br>• 300-150-100-75-60-50 method (count large boxes between R waves)<br>• 1500/small boxes between R-R intervals<br>• Count complexes in 6 seconds × 10<br><br><b>Normal:</b> 60-100 bpm<br><b>Bradycardia:</b> < 60 bpm<br><b>Tachycardia:</b> > 100 bpm"
        },
        {
          title: "2. Rhythm",
          content: "<b>Regular vs Irregular:</b><br>• Measure R-R intervals<br>• Regular: Consistent spacing<br>• Irregular: Variable spacing<br><br><b>P waves:</b><br>• Present before each QRS?<br>• Consistent morphology?<br>• Upright in I, II, aVF?"
        },
        {
          title: "3. Axis",
          content: "<b>Normal Axis:</b> -30° to +90°<br>• Lead I positive + aVF positive = Normal<br><br><b>Left Axis Deviation (LAD):</b> -30° to -90°<br>• Lead I positive + aVF negative<br><br><b>Right Axis Deviation (RAD):</b> +90° to +180°<br>• Lead I negative + aVF positive<br><br><b>Extreme Axis:</b> -90° to -180°<br>• Lead I negative + aVF negative"
        },
        {
          title: "4. Intervals",
          content: "<b>PR Interval:</b> 0.12-0.20 sec (3-5 small boxes)<br>• Short PR: Pre-excitation (WPW)<br>• Long PR: First-degree AV block<br><br><b>QRS Duration:</b> < 0.12 sec (< 3 small boxes)<br>• Wide QRS (≥ 0.12): Bundle branch block, ventricular rhythm<br><br><b>QT Interval:</b><br>• Normal: < half of R-R interval<br>• QTc (corrected): < 440ms (men), < 460ms (women)<br>• Prolonged QT: risk of Torsades"
        },
        {
          title: "5. Morphology",
          content: "<b>P wave:</b> Atrial depolarization<br>• Tall P: atrial enlargement<br><br><b>QRS complex:</b> Ventricular depolarization<br>• Q waves: old MI (> 0.04s wide or > 25% R wave height)<br>• R wave progression: should increase V1→V6<br><br><b>ST segment:</b> Ventricular repolarization<br>• Should be isoelectric (on baseline)<br>• Elevation: injury/STEMI<br>• Depression: ischemia<br><br><b>T wave:</b><br>• Normally upright in I, II, V3-V6<br>• Inversion: ischemia/old MI<br>• Peaked: hyperkalemia"
        },
        {
          title: "6. STEMI Criteria",
          content: "<b>ST Elevation:</b><br>• ≥ 1mm (1 small box) in 2 contiguous leads, OR<br>• ≥ 2mm in V2-V3 (men), ≥ 1.5mm in V2-V3 (women)<br><br><b>Contiguous Leads:</b><br>• Anterior: V1-V4<br>• Lateral: I, aVL, V5-V6<br>• Inferior: II, III, aVF<br>• Septal: V1-V2<br><br><b>Reciprocal Changes:</b><br>• ST depression in opposite territory confirms STEMI"
        }
      ]
    },
    {
      type: "list",
      title: "STEMI Localization",
      items: [
        { title: "Anterior STEMI", content: "V1-V4 (LAD territory)<br><b>Reciprocal:</b> ST depression II, III, aVF" },
        { title: "Septal STEMI", content: "V1-V2 (LAD septal branches)" },
        { title: "Lateral STEMI", content: "I, aVL, V5-V6 (Circumflex territory)<br><b>Reciprocal:</b> ST depression II, III, aVF" },
        { title: "Inferior STEMI", content: "II, III, aVF (RCA territory)<br><b>Reciprocal:</b> ST depression I, aVL<br><b>Consider:</b> Right-sided ECG (RV infarct)" },
        { title: "Posterior STEMI", content: "Reciprocal ST depression V1-V3 + tall R waves<br><b>Confirm:</b> Posterior leads V7-V9 (ST elevation)" },
        { title: "Right Ventricular MI", content: "Inferior STEMI + ST elevation V1 (or V4R on right-sided ECG)<br><b>Avoid:</b> Nitrates (preload dependent)" }
      ]
    },
    {
      type: "list",
      title: "Troubleshooting Artifact",
      items: [
        { title: "Wandering Baseline", content: "<b>Cause:</b> Patient movement, poor electrode contact, breathing.<br><b>Fix:</b> Reposition electrodes, ensure skin dry, patient relaxed." },
        { title: "60 Hz Interference", content: "<b>Cause:</b> Electrical interference from nearby equipment.<br><b>Fix:</b> Unplug nearby devices, move away from motors, check grounding." },
        { title: "Muscle Tremor", content: "<b>Cause:</b> Shivering, Parkinson's, anxiety.<br><b>Fix:</b> Warm patient, position limb leads proximally (shoulders/hips), relax patient." },
        { title: "Leads Reversed", content: "<b>Detection:</b> Inverted P or QRS in lead I, bizarre axis.<br><b>Fix:</b> Check color coding, verify placement, re-acquire." },
        { title: "Poor R-Wave Progression", content: "<b>Cause:</b> V1-V2 placed too high, lead misplacement.<br><b>Fix:</b> Verify 4th intercostal space, ensure V3-V6 horizontal." }
      ]
    },
    {
      type: "warning",
      content: "<b>STEMI Mimics (False Positives):</b><br>• <b>Early Repolarization:</b> Benign, young males, J-point elevation with notching<br>• <b>Left Bundle Branch Block (LBBB):</b> Use Sgarbossa criteria<br>• <b>Left Ventricular Hypertrophy (LVH):</b> Large voltage with strain pattern<br>• <b>Pericarditis:</b> Diffuse ST elevation (many leads), PR depression<br>• <b>Brugada Syndrome:</b> V1-V3 elevation with RBBB pattern<br>• <b>Hyperkalemia:</b> Peaked T waves, wide QRS<br><br><b>When in doubt, treat as STEMI - consult medical control</b>"
    },
    {
      type: "info",
      title: "Critical Actions for STEMI",
      content: "<b>Within 10 minutes of patient contact:</b><br>1. Acquire 12-lead ECG<br>2. Interpret for STEMI criteria<br>3. Activate STEMI Alert if criteria met<br>4. Notify receiving hospital<br>5. Transmit ECG to hospital<br>6. Aspirin 324mg PO (if no contraindications)<br>7. Nitroglycerin 0.4mg SL (if SBP > 90 and no RV involvement)<br>8. IV access, oxygen if indicated<br>9. Serial ECGs if ongoing symptoms<br>10. Rapid transport to PCI-capable facility<br><br><b>Goal: Door-to-balloon < 90 minutes</b>"
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Lead Placement:</b><br>• Same anatomical landmarks, adjusted for smaller torso<br>• May need smaller electrodes<br><br><b>Normal Pediatric ECG Differences:</b><br>• Faster heart rates (age-dependent)<br>• Right axis deviation (normal in infants)<br>• Tall R waves in V1 (RVH normal < 6 months)<br>• T wave inversions V1-V3 (normal until adolescence)<br>• Shorter intervals<br><br><b>Indications:</b> Rare in pediatrics, but consider for syncope, chest pain, palpitations, known cardiac disease"
    }
  ]
};
