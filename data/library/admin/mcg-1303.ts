import { Protocol } from '../../../types';

/**
 * MCG 1303 - Cath Lab Activation (STEMI Alert)
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const mcg1303: Protocol = {
  id: "1303",
  refNo: "MCG 1303",
  title: "Cath Lab Activation - STEMI Alert",
  category: "Medical Control",
  type: "Medical Control Guideline",
  lastUpdated: "Jul 1, 2025",
  icon: "cardiology",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cath Lab Activation", subtitle: "MCG 1303 • STEMI Alert Protocol", icon: "cardiology" }]
    },
    {
      type: "list",
      title: "Purpose",
      items: [
        { title: "Goal", content: "Minimize door-to-balloon time for STEMI patients through prehospital cath lab activation." },
        { title: "Target", content: "First medical contact to device (balloon) < 90 minutes. Prehospital activation saves 15-20 minutes." },
        { title: "Outcome", content: "Reduced myocardial infarct size, improved survival, better functional outcomes." }
      ]
    },
    {
      type: "warning",
      content: "<b>TIME IS MUSCLE:</b><br>Every 30-minute delay in reperfusion increases mortality by 7.5%<br><br><b>Prehospital Cath Lab Activation:</b><br>• Reduces door-to-balloon time by 15-20 minutes on average<br>• Enables direct-to-cath-lab transport (bypassing ED)<br>• Requires accurate ECG interpretation and transmission<br><br><b>Do NOT delay transport for:</b><br>• Repeat 12-lead attempts (if first shows STEMI)<br>• Additional IV access<br>• Base hospital contact (notify en route)"
    },
    {
      type: "section",
      title: "STEMI Recognition"
    },
    {
      type: "accordion",
      title: "STEMI Criteria on 12-Lead ECG",
      items: [
        {
          title: "ST Elevation - Primary Criteria",
          content: "<b>Definition:</b> ST segment elevation measured at the J-point<br><br><b>Leads V2-V3 (Male):</b><br>• Age < 40: ≥ 2.5 mm (2.5 small boxes)<br>• Age ≥ 40: ≥ 2.0 mm<br><br><b>Leads V2-V3 (Female):</b><br>• ≥ 1.5 mm at any age<br><br><b>All Other Leads:</b><br>• ≥ 1.0 mm (1 small box) in 2 or more contiguous leads<br><br><b>Contiguous Leads:</b><br>• Anatomically adjacent (e.g., II-III-aVF, I-aVL, V1-V2-V3-V4-V5-V6)"
        },
        {
          title: "Anatomic Localization",
          content: "<b>Anterior STEMI:</b> V1-V4 (LAD artery)<br>• Large infarct, high mortality<br>• May cause cardiogenic shock<br><br><b>Lateral STEMI:</b> I, aVL, V5-V6 (Circumflex or diagonal)<br><br><b>Inferior STEMI:</b> II, III, aVF (RCA usually, sometimes Circumflex)<br>• Check V4R for RV involvement<br>• Avoid nitrates if RV infarct<br><br><b>Posterior STEMI:</b> ST depression V1-V3 (mirror image)<br>• Do posterior leads V7-V9 if suspected<br>• Circumflex occlusion<br><br><b>Extensive Anterior (LAD Proximal):</b> V1-V6, I, aVL<br>• 'Widow-maker' - high mortality"
        },
        {
          title: "STEMI Equivalents - Also Activate",
          content: "<b>New or Presumably New LBBB + Symptoms:</b><br>• Classic teaching: LBBB masks STEMI<br>• Sgarbossa criteria can help identify STEMI in LBBB<br>• With ischemic symptoms, treat as STEMI<br><br><b>de Winter T-waves:</b><br>• Upsloping ST depression V1-V6<br>• Tall, symmetric T waves<br>• LAD occlusion equivalent<br><br><b>Wellens Syndrome (if caught in pain-free interval):</b><br>• Biphasic or deeply inverted T waves V2-V3<br>• Suggests critical LAD stenosis<br>• High risk of anterior STEMI<br><br><b>Hyperacute T Waves:</b><br>• Tall, broad-based, symmetric T waves<br>• Very early STEMI sign<br>• May precede ST elevation by minutes"
        },
        {
          title: "Exclusion - NOT STEMI",
          content: "<b>Conditions that mimic STEMI:</b><br><br><b>Early Repolarization:</b><br>• Notching at J-point ('fishhook')<br>• More common in young, healthy males<br>• Diffuse, not localized to coronary territory<br><br><b>Left Ventricular Hypertrophy (LVH):</b><br>• ST elevation V1-V3 with large S waves<br>• Discordance (ST elevation with QRS that is predominantly negative)<br><br><b>Pericarditis:</b><br>• Diffuse ST elevation (all leads)<br>• PR depression (especially lead II)<br>• Pleuritic chest pain, fever<br><br><b>Benign Early Repolarization:</b><br>• Often in V2-V4<br>• Stable on prior ECGs<br><br><b>When in doubt with symptoms: ACTIVATE</b>"
        }
      ]
    },
    {
      type: "section",
      title: "Activation Process"
    },
    {
      type: "list",
      title: "Step-by-Step Activation",
      items: [
        { title: "1. Obtain 12-Lead ECG", content: "Perform within <b>10 minutes</b> of patient contact. Ensure good quality tracing (no artifact, proper lead placement)." },
        { title: "2. Interpret ECG", content: "Identify ST elevation meeting criteria OR STEMI equivalent. Note reciprocal changes (support diagnosis)." },
        { title: "3. Transmit ECG", content: "Send 12-lead to STEMI Receiving Center (SRC) via approved transmission method. Confirm receipt." },
        { title: "4. Contact STEMI Center", content: "Verbal report to SRC: Patient demographics, symptom onset time, ECG findings, vitals, treatment given." },
        { title: "5. Prehospital STEMI Alert", content: "State clearly: <b>'STEMI Alert'</b> - This activates the cath lab team." },
        { title: "6. Direct Transport", content: "Transport directly to SRC. May bypass closer non-SRC hospitals per protocol." },
        { title: "7. Documentation", content: "Document symptom onset time, ECG time, transmission time, contact time with SRC." }
      ]
    },
    {
      type: "accordion",
      title: "Communication Script",
      items: [
        {
          title: "STEMI Alert Radio Report",
          content: "<b>Template:</b><br><br>'[Hospital Name], this is [Unit ID] with a STEMI Alert.<br><br>We have a [age] year old [male/female] with [duration] of chest pain.<br><br>12-lead ECG shows ST elevation in [leads], consistent with [anterior/inferior/lateral] STEMI.<br><br>Vitals: BP [X/X], HR [X], SpO2 [X%].<br><br>Treatment: Aspirin given, [other interventions].<br><br>Symptom onset time: [time].<br><br>ETA: [X] minutes.<br><br>ECG transmitted. Please confirm cath lab activation.'"
        },
        {
          title: "Required Information",
          content: "<b>Must Communicate:</b><br>• STEMI Alert declaration<br>• Patient age and sex<br>• Symptom onset time (for fibrinolytic decision if needed)<br>• ST elevation leads and suspected territory<br>• Current vitals and hemodynamic status<br>• Treatment given (aspirin, nitro, etc.)<br>• Any complications (arrhythmia, hypotension, arrest)<br>• ETA<br><br><b>Also Helpful:</b><br>• Prior cardiac history, PCI, CABG<br>• Anticoagulation/antiplatelet use<br>• Allergies (contrast, medications)<br>• Symptom characteristics (typical vs atypical)"
        }
      ]
    },
    {
      type: "section",
      title: "Destination Decision"
    },
    {
      type: "accordion",
      title: "STEMI Receiving Centers",
      items: [
        {
          title: "SRC Designation",
          content: "<b>STEMI Receiving Center (SRC):</b><br>• 24/7 PCI capability<br>• Cath lab available within 30 minutes of arrival<br>• Interventional cardiologist on call<br>• Cardiac surgery backup (on-site or transfer agreement)<br><br><b>LA County SRCs:</b> Refer to current EMS Agency approved list<br><br><b>Non-SRC Hospitals:</b><br>• May provide fibrinolytics if PCI not available within 120 minutes<br>• Transfer to SRC after fibrinolysis"
        },
        {
          title: "Transport Destination Algorithm",
          content: "<b>Transport to SRC if:</b><br>• STEMI identified on 12-lead ECG<br>• Transport time to SRC ≤ 60 minutes<br>• Patient is hemodynamically stable enough for transport<br><br><b>Consider Closest Facility if:</b><br>• Cardiac arrest with ROSC (may need stabilization)<br>• Cardiogenic shock requiring immediate intervention<br>• Transport time to SRC > 60 minutes AND fibrinolysis appropriate<br><br><b>Bypass Criteria:</b><br>• May bypass closer non-SRC hospitals<br>• Transport directly to SRC with activated cath lab<br>• Do not delay for stabilization at closer hospital unless critical"
        },
        {
          title: "Time Metrics",
          content: "<b>First Medical Contact to Device (FMC-to-D):</b><br>• Goal: < 90 minutes<br>• Prehospital activation can achieve < 60 minutes<br><br><b>Door-to-Balloon (D2B):</b><br>• Goal: < 60 minutes (for walk-in patients)<br>• With prehospital activation: Often < 45 minutes<br><br><b>Symptom Onset to Reperfusion:</b><br>• Critical window: < 12 hours (preferably < 3-6 hours)<br>• Beyond 12 hours: Benefit decreases significantly<br>• Beyond 24 hours: Generally no benefit from primary PCI"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment En Route"
    },
    {
      type: "accordion",
      title: "STEMI Treatment Protocol",
      items: [
        {
          title: "Aspirin",
          content: "<b>Dose:</b> 324 mg PO (4 x 81 mg chewed)<br><br><b>Timing:</b> Give immediately if not already taken in last 24 hours<br><br><b>Contraindications:</b><br>• True aspirin allergy (anaphylaxis)<br>• Active GI bleeding<br><br><b>Note:</b> GI upset is NOT a contraindication. Benefit far outweighs risk in STEMI."
        },
        {
          title: "Nitroglycerin",
          content: "<b>Dose:</b> 0.4 mg SL spray/tablet every 5 minutes x3 doses<br><br><b>Indication:</b> Chest pain/discomfort<br><br><b>Contraindications:</b><br>• SBP < 100 mmHg (or < 90 in some protocols)<br>• PDE-5 inhibitor use (Viagra/Cialis) in last 24-48 hours<br>• Inferior STEMI with suspected RV involvement<br>• Severe aortic stenosis<br><br><b>RV Infarct Warning:</b> Nitrates cause venodilation, reduce preload. RV is preload-dependent - can cause severe hypotension."
        },
        {
          title: "Right Ventricular Infarct Consideration",
          content: "<b>When to Suspect:</b><br>• Inferior STEMI (II, III, aVF)<br>• Hypotension or borderline BP<br>• Elevated JVP without pulmonary edema<br><br><b>Confirm with V4R:</b><br>• ST elevation ≥ 1 mm in V4R = RV infarct<br>• Place V4R: 5th intercostal space, right midclavicular line<br><br><b>Management:</b><br>• AVOID nitrates<br>• AVOID diuretics<br>• Fluid challenge if hypotensive (250-500 mL NS)<br>• Vasopressors if fluid-refractory"
        },
        {
          title: "Pain Management",
          content: "<b>Fentanyl:</b> 50 mcg IV/IM/IN, may repeat x1 in 5 minutes<br><br><b>Purpose:</b><br>• Reduce pain (pain increases oxygen demand)<br>• Reduce anxiety and catecholamine surge<br>• Do not delay for pain control<br><br><b>Caution:</b> Monitor for respiratory depression and hypotension"
        },
        {
          title: "Oxygen",
          content: "<b>Indication:</b> SpO2 < 94% or respiratory distress<br><br><b>Target:</b> SpO2 94-98%<br><br><b>Note:</b> Routine supplemental O2 is NOT recommended for normoxic STEMI patients. Studies show potential harm from hyperoxia (vasoconstriction, increased ROS)."
        }
      ]
    },
    {
      type: "section",
      title: "Special Situations"
    },
    {
      type: "accordion",
      title: "Special Considerations",
      items: [
        {
          title: "STEMI with Cardiac Arrest",
          content: "<b>If ROSC achieved:</b><br>• Obtain 12-lead ECG as soon as feasible<br>• STEMI criteria still apply for cath lab activation<br>• Consider cath lab even without obvious STEMI (occluded artery may be cause of arrest)<br><br><b>Transport Decision:</b><br>• SRC with cath lab AND post-arrest care (TTM) preferred<br>• Contact medical control for destination guidance<br>• Consider ECPR criteria (MCG 1318) if arrest is refractory"
        },
        {
          title: "STEMI with Cardiogenic Shock",
          content: "<b>Definition:</b> SBP < 90 despite fluids, signs of poor perfusion, pulmonary edema<br><br><b>Management:</b><br>• Cautious fluids (250 mL bolus if no pulmonary edema)<br>• Push-dose epinephrine for hypotension: 10-20 mcg IV q 1-3 min<br>• Avoid nitrates (will worsen hypotension)<br>• Consider CPAP if respiratory distress without hypotension<br><br><b>Transport:</b><br>• Direct to SRC - urgent revascularization improves survival<br>• Mechanical support (IABP, Impella) may be placed in cath lab"
        },
        {
          title: "Atypical Presentations",
          content: "<b>High-Risk Groups for Atypical STEMI:</b><br>• Women<br>• Elderly (> 75 years)<br>• Diabetics<br>• Post-transplant patients<br><br><b>Atypical Symptoms:</b><br>• Dyspnea only (no chest pain)<br>• Nausea/vomiting<br>• Fatigue, weakness<br>• Syncope<br>• Epigastric pain<br><br><b>Low Threshold for ECG:</b> Obtain 12-lead in any patient with concerning symptoms, especially in high-risk groups."
        },
        {
          title: "False Activation Concerns",
          content: "<b>Acceptable False Activation Rate:</b> 10-20%<br><br><b>It is better to over-activate than under-activate</b><br><br><b>Common Causes of False Activation:</b><br>• Early repolarization<br>• LVH<br>• Pericarditis<br>• Old MI with persistent ST elevation<br>• Lead misplacement<br><br><b>Quality Improvement:</b><br>• Review all activations for accuracy<br>• Provide feedback to crews<br>• Do not punish for appropriate uncertainty"
        },
        {
          title: "Posterior MI",
          content: "<b>Presentation:</b> Chest pain with ST depression in V1-V3<br><br><b>Why It's Missed:</b> Standard 12-lead does not directly view posterior wall<br><br><b>Clues:</b><br>• Horizontal ST depression V1-V3<br>• Tall, upright R waves in V1-V2 (Q wave equivalent)<br>• Upright T waves V1-V2<br><br><b>Confirm with Posterior Leads (V7-V9):</b><br>• ST elevation ≥ 0.5 mm in V7-V9<br>• V7: Left posterior axillary line, level of V6<br>• V8: Left mid-scapular line<br>• V9: Left paraspinal line<br><br><b>If confirmed, treat as STEMI and activate cath lab</b>"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Symptom Onset Time is Critical:</b><br>Document the exact time symptoms began. This determines reperfusion strategy (PCI vs lytics) and prognostic benefit. Ask family if patient is altered.<br><br><b>When in Doubt, Activate:</b><br>A false activation delays cath lab by 30 minutes. A missed STEMI delays reperfusion by hours. Err on the side of activation.<br><br><b>Inferior STEMI = Check Right Side:</b><br>Always perform V4R in inferior STEMI. RV infarct changes management dramatically (no nitrates, fluid challenge).<br><br><b>ST Depression is Not Benign:</b><br>Widespread ST depression with ST elevation in aVR suggests left main or severe 3-vessel disease. Very high mortality. Activate cath lab.<br><br><b>Prehospital ECG Transmission Saves Lives:</b><br>The 15-20 minutes saved by prehospital activation translates to improved survival and reduced infarct size. Master ECG transmission.<br><br><b>Do Not Delay Transport:</b><br>Once STEMI is identified, treat and transport. Additional ECGs, IV attempts, or procedures should not delay arrival at SRC."
    },
    {
      type: "info",
      title: "Quick Reference - STEMI Criteria",
      content: "<b>ST Elevation Thresholds:</b><br>• V2-V3 (Male < 40): ≥ 2.5 mm<br>• V2-V3 (Male ≥ 40): ≥ 2.0 mm<br>• V2-V3 (Female): ≥ 1.5 mm<br>• All other leads: ≥ 1.0 mm in 2 contiguous leads<br><br><b>STEMI Equivalents (Also Activate):</b><br>• New LBBB with ischemic symptoms<br>• de Winter T-waves (LAD equivalent)<br>• Posterior MI (ST depression V1-V3 + posterior leads)<br>• Hyperacute T-waves with symptoms<br><br><b>Transport Goal:</b> FMC-to-Device < 90 minutes"
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1211 Cardiac Chest Pain / STEMI" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1207 Shock / Hypotension" },
        { title: "MCG 1308 Cardiac Monitoring / 12-Lead ECG" },
        { title: "MCG 1318 ECPR Patient Algorithm" },
        { title: "Ref. 506 Destination Criteria" }
      ]
    }
  ]
};
