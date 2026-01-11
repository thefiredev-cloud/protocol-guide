
import { Protocol } from '../../../types';

/**
 * TP-1209 - Behavioral / Psychiatric Crisis
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const tp1209: Protocol = {
  id: "1209",
  refNo: "TP-1209",
  title: "Behavioral / Psychiatric Crisis",
  category: "Behavioral",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  tags: ["behavioral", "psychiatric", "mental health", "5150", "5585", "agitation", "psychosis", "de-escalation", "restraints", "midazolam", "olanzapine", "ketamine", "suicide", "homicide", "crisis"],
  icon: "psychology",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Behavioral / Psychiatric Crisis", subtitle: "Adult • Standing Order", icon: "psychology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Behavioral / Psychiatric Crisis (PSYC)", content: "Patient exhibiting psychiatric symptoms requiring intervention. May include psychosis, severe anxiety, depression, or behavioral disturbance." },
        { title: "Severe Agitation with ALOC (SAAL)", content: "Extreme agitation with altered level of consciousness. May indicate excited delirium. Life-threatening emergency." },
        { title: "Suicidal Ideation (SUIC)", content: "Patient expressing suicidal thoughts or has made suicide attempt. Requires evaluation and transport." }
      ]
    },
    {
      type: "warning",
      content: "<b>SAFETY FIRST</b><br><br>• Ensure scene is safe before approach<br>• Request law enforcement if patient is violent, armed, or presents danger<br>• Maintain exit route - never position yourself between patient and only exit<br>• Remove potential weapons from environment<br>• Protect patient from self-harm<br><br><b>Rule out medical causes of behavioral changes - especially in elderly or first-time psychiatric presentation</b>"
    },
    {
      type: "section",
      title: "De-escalation Techniques"
    },
    {
      type: "accordion",
      title: "Verbal De-escalation - FIRST LINE",
      items: [
        {
          title: "General Approach",
          content: "• Approach calmly, non-threateningly<br>• Maintain safe distance (at least arm's length)<br>• Speak in calm, low tone<br>• Use open body posture<br>• Avoid sudden movements<br>• Reduce environmental stimuli (lights, sirens, crowd)<br>• Allow patient to vent - listen actively"
        },
        {
          title: "Communication Strategies",
          content: "<b>DO:</b><br>• Introduce yourself and explain your role<br>• Ask open-ended questions<br>• Validate emotions (\"I can see you're upset\")<br>• Offer choices when possible<br>• Set clear, simple limits<br>• Be honest about what will happen<br><br><b>DON'T:</b><br>• Argue or challenge delusions<br>• Use condescending language<br>• Make sudden movements or touch without permission<br>• Make promises you can't keep<br>• Corner the patient"
        },
        {
          title: "Psychosis-Specific",
          content: "• Do NOT argue with hallucinations or delusions<br>• Focus on emotions, not content of delusions<br>• Use simple, concrete language<br>• Reduce stimulation<br>• Be patient - processing may be slow"
        },
        {
          title: "When De-escalation Fails",
          content: "If verbal de-escalation is unsuccessful and patient is danger to self or others, chemical restraint may be necessary. Physical restraint should be avoided unless absolutely necessary for safety."
        }
      ]
    },
    {
      type: "section",
      title: "Medical Evaluation"
    },
    {
      type: "accordion",
      title: "Rule Out Medical Causes",
      items: [
        {
          title: "ALWAYS Consider Medical Etiology",
          content: "New-onset psychiatric symptoms or behavioral changes warrant medical evaluation, especially:<br>• Age > 40 with no psychiatric history<br>• Acute onset<br>• Visual hallucinations (more likely organic)<br>• Abnormal vital signs<br>• Focal neurologic findings<br>• Known medical conditions"
        },
        {
          title: "Medical Causes of Behavioral Changes",
          content: "<b>Metabolic:</b> Hypoglycemia, hyperglycemia, hyponatremia, thyroid disorders<br><b>Infectious:</b> UTI (especially elderly), meningitis, encephalitis, sepsis<br><b>Neurologic:</b> Stroke, seizure (postictal), head trauma, dementia<br><b>Toxicologic:</b> Drug intoxication, withdrawal, medication effects<br><b>Hypoxia:</b> Any cause of decreased oxygen<br><b>Environmental:</b> Hyperthermia, hypothermia"
        },
        {
          title: "Required Assessment",
          content: "• Blood glucose - check on ALL behavioral patients<br>• Vital signs including temperature<br>• SpO2<br>• Brief neuro exam if cooperative<br>• SAMPLE history from patient, family, or bystanders<br>• Medication list - especially psychiatric medications"
        }
      ]
    },
    {
      type: "section",
      title: "Chemical Restraint"
    },
    {
      type: "accordion",
      title: "Medication Options",
      items: [
        {
          title: "Midazolam (Versed) - First Line",
          content: "<b>Indication:</b> Severe agitation not responsive to de-escalation<br><br><b>Adult Dose:</b><br>• <b>IM:</b> 5 mg (may repeat x1 in 5 min if needed)<br>• <b>IN:</b> 5 mg (2.5 mg per nostril)<br>• <b>IV/IO:</b> 2.5-5 mg slow push<br><br><b>Maximum:</b> 10 mg total<br><br><b>Onset:</b> IM 5-15 min, IV 2-3 min<br><b>Duration:</b> 30-60 min"
        },
        {
          title: "Olanzapine (Zyprexa) - Alternative",
          content: "<b>Indication:</b> Agitation, especially in known psychiatric patient<br><br><b>Adult Dose:</b> 10 mg IM or 10 mg ODT (oral disintegrating tablet)<br><br><b>Onset:</b> IM 15-30 min<br><b>Duration:</b> 2-4 hours<br><br><b>Caution:</b> Do NOT give within 1 hour of benzodiazepine - risk of severe respiratory depression and hypotension"
        },
        {
          title: "Ketamine - Excited Delirium / Severe Agitation",
          content: "<b>Indication:</b> Excited delirium or severe agitation unresponsive to other agents<br><br><b>Adult Dose:</b> 4 mg/kg IM (max 500 mg)<br><br><b>Onset:</b> 3-5 min<br><b>Duration:</b> 15-30 min<br><br><b>REQUIRES:</b><br>• Continuous monitoring<br>• Airway equipment ready<br>• Suction available<br>• Be prepared for emergence reactions<br><br>See MCG 1307 for excited delirium protocol"
        },
        {
          title: "Droperidol (if available)",
          content: "<b>Indication:</b> Severe agitation, nausea<br><br><b>Adult Dose:</b> 2.5-5 mg IM or IV<br><br><b>Monitor:</b> May cause QT prolongation. Have cardiac monitor in place."
        }
      ]
    },
    {
      type: "warning",
      content: "<b>POST-SEDATION MONITORING:</b><br><br>After ANY chemical restraint:<br>• Continuous SpO2 monitoring<br>• Cardiac monitoring<br>• Frequent reassessment of airway and respiratory status<br>• Have BVM and suction ready<br>• Position to protect airway (recovery position if appropriate)<br>• Monitor for paradoxical agitation"
    },
    {
      type: "section",
      title: "Physical Restraint"
    },
    {
      type: "accordion",
      title: "Restraint Guidelines",
      items: [
        {
          title: "Least Restrictive Principle",
          content: "Use the least restrictive means necessary to ensure safety. Physical restraints are a last resort when:<br>• Patient is immediate danger to self or others<br>• Verbal de-escalation has failed<br>• Chemical restraint is not yet effective or contraindicated"
        },
        {
          title: "Approved Restraints",
          content: "<b>Soft restraints only:</b> Commercial restraints applied to wrists and/or ankles<br><br>• Use 4-point restraints when needed (all extremities)<br>• Restrain supine or lateral - NEVER prone<br>• Ensure restraints do not impair circulation or respiration<br>• Allow some range of motion"
        },
        {
          title: "Restraint Monitoring",
          content: "<b>Check every 15 minutes:</b><br>• Circulation distal to restraints (CMS checks)<br>• Respiratory status<br>• Level of consciousness<br>• Skin integrity under restraints<br><br><b>Document:</b> Reason for restraint, type used, monitoring findings"
        },
        {
          title: "Hobble Restraints",
          content: "<b>NEVER use hobble restraints with patient prone (face down)</b><br><br>Prone positioning with hobble restraints causes positional asphyxia and has resulted in deaths. If hobble restraint used, patient must be supine or lateral."
        }
      ]
    },
    {
      type: "section",
      title: "Legal Holds"
    },
    {
      type: "accordion",
      title: "5150 / 5585 Holds (California)",
      items: [
        {
          title: "5150 Hold (Adults)",
          content: "<b>72-hour involuntary psychiatric hold</b><br><br><b>Criteria (ONE or more):</b><br>• Danger to self<br>• Danger to others<br>• Gravely disabled (unable to provide for basic needs)<br><br><b>Who can initiate:</b> Peace officer, designated mental health professional, or designated EMS personnel (per local policy)"
        },
        {
          title: "5585 Hold (Minors)",
          content: "<b>72-hour involuntary hold for minors</b><br><br>Same criteria as 5150:<br>• Danger to self<br>• Danger to others<br>• Gravely disabled<br><br>Parental consent is NOT required if minor meets criteria."
        },
        {
          title: "EMS Role",
          content: "In LA County, EMS typically transports patients on 5150/5585 holds initiated by law enforcement or mental health professionals.<br><br>Transport to designated psychiatric emergency facility or emergency department per base hospital direction."
        },
        {
          title: "Documentation Requirements",
          content: "• Specific behaviors meeting criteria<br>• Threats made (verbatim if possible)<br>• Actions observed<br>• Who initiated the hold<br>• Notification of rights (if applicable)"
        }
      ]
    },
    {
      type: "section",
      title: "Suicide / Self-Harm"
    },
    {
      type: "accordion",
      title: "Suicide Risk Evaluation",
      items: [
        {
          title: "All Suicide-Related Calls",
          content: "• Ensure scene safety<br>• Remove access to means (weapons, medications)<br>• Never leave patient alone<br>• Express concern and empathy<br>• Ask directly about suicidal thoughts<br><br>See MCG 1306 for Columbia Suicide Severity Rating Scale"
        },
        {
          title: "High-Risk Indicators",
          content: "<b>Immediate Risk:</b><br>• Active suicidal ideation with plan and intent<br>• Recent suicide attempt<br>• Access to lethal means<br>• History of suicide attempts<br>• Current intoxication with suicidal ideation<br>• Command hallucinations to harm self"
        },
        {
          title: "Suicide Attempt - Medical",
          content: "Treat medical emergency first:<br>• Overdose - see TP-1204<br>• Trauma - see trauma protocols<br>• Hanging - airway, C-spine protection<br>• GSW - hemorrhage control, trauma activation<br><br>All suicide attempts require transport and psychiatric evaluation."
        }
      ]
    },
    {
      type: "section",
      title: "Special Populations"
    },
    {
      type: "accordion",
      title: "Pediatric/Adolescent",
      items: [
        {
          title: "Approach",
          content: "• Include parents/guardians when helpful, exclude if contributing to distress<br>• Use age-appropriate language<br>• Be patient and non-judgmental<br>• Ask about school stressors, bullying, social media"
        },
        {
          title: "Pediatric Dosing",
          content: "<b>Midazolam:</b> 0.1 mg/kg IM/IV (max 5 mg)<br><b>Olanzapine:</b> Generally avoided in children without consultation<br><b>Ketamine:</b> 4 mg/kg IM (same mg/kg as adult)"
        }
      ]
    },
    {
      type: "accordion",
      title: "Elderly",
      items: [
        {
          title: "Key Considerations",
          content: "• Higher likelihood of medical cause for behavioral change<br>• Lower threshold for organic etiology workup<br>• UTI is most common cause of ALOC/confusion in elderly<br>• Check for polypharmacy and new medications<br>• Consider elder abuse"
        },
        {
          title: "Medication Cautions",
          content: "• Start with lower doses (50% of adult dose)<br>• Higher risk of respiratory depression<br>• Anticholinergics (like diphenhydramine) cause paradoxical agitation<br>• Increased fall risk with sedation"
        }
      ]
    },
    {
      type: "accordion",
      title: "Known Psychiatric Patient",
      items: [
        {
          title: "Helpful Information",
          content: "• What is patient's baseline?<br>• What precipitated current crisis?<br>• Any medication changes or non-compliance?<br>• Previous effective interventions?<br>• Known triggers?<br>• Preferred coping strategies?"
        },
        {
          title: "Medication Non-Compliance",
          content: "Common cause of psychiatric decompensation. Document if patient has not been taking medications and for how long. This helps receiving facility."
        }
      ]
    },
    {
      type: "section",
      title: "Transport Considerations"
    },
    {
      type: "info",
      title: "Destination Decisions",
      content: "<b>Psychiatric Emergency:</b> Transport to designated psychiatric emergency facility (PES) if available and medically stable.<br><br><b>Medical Evaluation Needed:</b> Transport to ED for:<br>• Unknown medical cause of symptoms<br>• Abnormal vital signs<br>• Overdose or ingestion<br>• Trauma<br>• Medical complaints in addition to psychiatric<br>• Age > 40 with first psychiatric presentation<br><br><b>Base Contact:</b> Contact base hospital for destination guidance if unclear."
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>De-escalation Works:</b> Most psychiatric patients can be managed with verbal techniques alone. Take time to talk before reaching for medications.<br><br><b>Medical First:</b> Always check glucose and consider medical causes, especially in elderly or new presentations.<br><br><b>Document Specifically:</b> Record exact statements and behaviors, not just \"patient was agitated.\"<br><br><b>Safety:</b> Your safety is paramount. Never put yourself at risk. Wait for law enforcement if needed.<br><br><b>Respect Dignity:</b> Psychiatric patients deserve the same respect and compassion as any patient. They are experiencing a medical emergency.<br><br><b>Excited Delirium:</b> If patient has hyperthermia, extreme agitation, superhuman strength, and apparent imperviousness to pain - this is a medical emergency. See MCG 1307."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "MCG 1306 Suicide Risk Evaluation" },
        { title: "MCG 1307 Agitation / Excited Delirium" },
        { title: "TP-1204 Overdose / Poisoning" },
        { title: "TP-1229 Altered Level of Consciousness" },
        { title: "TP-1203 Diabetic Emergencies" },
        { title: "TP-1238 Hyperthermia / Heat Stroke" }
      ]
    }
  ]
};
