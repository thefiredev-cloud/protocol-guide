
import { Protocol } from '../../../types';

/**
 * TP-1229 - Altered Level of Consciousness (ALOC)
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const tp1229: Protocol = {
  id: "1229",
  refNo: "TP-1229",
  title: "Altered Level of Consciousness",
  category: "Neurology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  tags: ["ALOC", "altered mental status", "AMS", "unresponsive", "obtunded", "lethargic", "confused", "GCS", "AEIOU-TIPS", "unconscious", "coma", "neuro"],
  icon: "psychology",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Altered Level of Consciousness", subtitle: "Adult • Standing Order", icon: "psychology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "ALOC - Not Hypoglycemia or Seizure (ALOC)", content: "Altered mental status not due to hypoglycemia, postictal state, or other identified cause." },
        { title: "Syncope (SYNC)", content: "Transient loss of consciousness with spontaneous recovery. Patient now at baseline." },
        { title: "Coma (COMA)", content: "Unresponsive to all stimuli. GCS 3-8. Requires immediate intervention." }
      ]
    },
    {
      type: "warning",
      content: "<b>ALOC is a symptom, not a diagnosis.</b><br><br>Always search for the underlying cause. Common immediately treatable causes:<br>• <b>Hypoglycemia</b> - Check glucose on every ALOC patient<br>• <b>Opioid overdose</b> - Consider Narcan<br>• <b>Stroke</b> - Perform mLAPSS<br>• <b>Hypoxia</b> - Check SpO2, apply O2"
    },
    {
      type: "section",
      title: "Glasgow Coma Scale (GCS)"
    },
    {
      type: "accordion",
      title: "GCS Assessment (3-15)",
      items: [
        {
          title: "Eye Opening (E) 1-4",
          content: "<b>4</b> = Spontaneous<br><b>3</b> = To verbal command<br><b>2</b> = To painful stimulus<br><b>1</b> = No response"
        },
        {
          title: "Verbal Response (V) 1-5",
          content: "<b>5</b> = Oriented, appropriate<br><b>4</b> = Confused, disoriented<br><b>3</b> = Inappropriate words<br><b>2</b> = Incomprehensible sounds<br><b>1</b> = No response"
        },
        {
          title: "Motor Response (M) 1-6",
          content: "<b>6</b> = Obeys commands<br><b>5</b> = Localizes pain<br><b>4</b> = Withdraws from pain<br><b>3</b> = Abnormal flexion (decorticate)<br><b>2</b> = Extension (decerebrate)<br><b>1</b> = No response"
        },
        {
          title: "GCS Interpretation",
          content: "<b>GCS 15:</b> Normal<br><b>GCS 13-14:</b> Mild impairment<br><b>GCS 9-12:</b> Moderate impairment<br><b>GCS ≤8:</b> Severe - consider advanced airway"
        }
      ]
    },
    {
      type: "section",
      title: "Differential Diagnosis - AEIOU-TIPS"
    },
    {
      type: "accordion",
      title: "AEIOU-TIPS Mnemonic",
      items: [
        {
          title: "A - Alcohol / Acidosis",
          content: "<b>Alcohol:</b> Intoxication, withdrawal (DTs typically 48-72 hrs after cessation)<br><b>Acidosis:</b> DKA (fruity breath, Kussmaul respirations), uremia, metabolic"
        },
        {
          title: "E - Epilepsy / Endocrine / Electrolytes",
          content: "<b>Epilepsy:</b> Postictal state, status epilepticus<br><b>Endocrine:</b> Hypoglycemia, hyperglycemia, thyroid storm, myxedema coma<br><b>Electrolytes:</b> Hyponatremia, hypernatremia, hypercalcemia"
        },
        {
          title: "I - Infection / Insulin",
          content: "<b>Infection:</b> Sepsis, meningitis (fever, nuchal rigidity, rash), encephalitis<br><b>Insulin:</b> Hypoglycemia (most common reversible cause)"
        },
        {
          title: "O - Overdose / Oxygen (Hypoxia)",
          content: "<b>Overdose:</b> Opioids (pinpoint pupils, respiratory depression), benzodiazepines, sedatives, anticholinergics, sympathomimetics<br><b>Oxygen:</b> Hypoxia from any cause, CO poisoning (cherry red skin, multiple victims)"
        },
        {
          title: "U - Uremia / Underdose",
          content: "<b>Uremia:</b> Renal failure (asterixis, uremic frost)<br><b>Underdose:</b> Missed psychiatric medications, anti-epileptics, insulin"
        },
        {
          title: "T - Trauma / Temperature",
          content: "<b>Trauma:</b> Head injury, subdural hematoma (especially elderly on anticoagulants)<br><b>Temperature:</b> Hypothermia, hyperthermia/heat stroke"
        },
        {
          title: "I - Infection (again for emphasis)",
          content: "Sepsis is a leading cause of ALOC in elderly. May present without fever. Look for source: UTI (common in elderly), pneumonia, skin infection, abdominal."
        },
        {
          title: "P - Psychiatric / Poisoning",
          content: "<b>Psychiatric:</b> Acute psychosis, catatonia, conversion disorder (PNES)<br><b>Poisoning:</b> CO, cyanide, organophosphates (SLUDGE/BBB), toxic ingestion"
        },
        {
          title: "S - Stroke / Seizure / Shock",
          content: "<b>Stroke:</b> Acute neurologic deficit - perform mLAPSS<br><b>Seizure:</b> Postictal state or ongoing subtle status epilepticus<br><b>Shock:</b> Hypoperfusion from any cause"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "Systematic ALOC Management",
      items: [
        { title: "1. Scene Safety", content: "Look for environmental clues: medication bottles, drug paraphernalia, alcohol, trauma evidence, suicide note, CO detector alarm." },
        { title: "2. Primary Survey (ABCs)", content: "<b>Airway:</b> Open, maintain, protect. GCS ≤8 = consider advanced airway.<br><b>Breathing:</b> Rate, quality, SpO2. Support ventilation PRN.<br><b>Circulation:</b> Pulse, BP, skin signs. Treat shock if present." },
        { title: "3. Blood Glucose - MANDATORY", content: "Check BG on EVERY ALOC patient. Treat hypoglycemia (< 60 mg/dL) immediately. This is the most common reversible cause." },
        { title: "4. Pupils and Neuro Exam", content: "Pupils: Size, reactivity, symmetry. Perform mLAPSS if stroke suspected. Check for focal deficits." },
        { title: "5. Consider Naloxone", content: "If opioid overdose suspected (pinpoint pupils, respiratory depression, track marks): Naloxone 2-4 mg IN or IV." },
        { title: "6. Obtain History", content: "SAMPLE history from bystanders, family, medical records, medication bottles." },
        { title: "7. Monitor and Reassess", content: "Continuous SpO2, EtCO2 if intubated, cardiac monitor. Serial GCS assessments." }
      ]
    },
    {
      type: "accordion",
      title: "Targeted Interventions",
      items: [
        {
          title: "Hypoglycemia (BG < 60 mg/dL)",
          content: "<b>Awake, able to swallow:</b> Oral glucose 15-30g<br><b>IV access:</b> D10 125mL (12.5g) IV bolus. Recheck in 5 min, may repeat x1.<br><b>No IV:</b> Glucagon 1mg IM<br><br>See TP-1203 Diabetic Emergencies"
        },
        {
          title: "Suspected Opioid Overdose",
          content: "<b>Naloxone (Narcan):</b><br>• IN: 4 mg (2 mg per nostril) using MAD<br>• IV/IO: 0.4-2 mg, may repeat q 2-3 min<br>• IM: 0.4-2 mg<br><br><b>Goal:</b> Restore adequate respirations, not full consciousness. Excessive dosing causes withdrawal.<br><br>See TP-1204 Overdose/Poisoning"
        },
        {
          title: "Suspected Stroke",
          content: "Perform mLAPSS, calculate LAMS score, determine LKWT.<br>Transport to Stroke Center if positive.<br><br>See TP-1232 Stroke/CVA/TIA"
        },
        {
          title: "Airway Management",
          content: "<b>GCS ≤8 or unable to protect airway:</b><br>• Position: Recovery position if no C-spine concern<br>• Suction as needed<br>• Consider i-gel or ETT if persistent airway threat<br>• Monitor EtCO2 if advanced airway placed<br>• Target EtCO2 35-40 mmHg (avoid hyperventilation)"
        }
      ]
    },
    {
      type: "section",
      title: "Physical Exam Clues"
    },
    {
      type: "accordion",
      title: "Pupil Findings",
      items: [
        {
          title: "Pinpoint Pupils (Miosis)",
          content: "• Opioid overdose<br>• Pontine stroke (bilateral)<br>• Organophosphate poisoning<br>• Clonidine overdose"
        },
        {
          title: "Dilated Pupils (Mydriasis)",
          content: "• Sympathomimetic overdose (cocaine, meth, MDMA)<br>• Anticholinergic poisoning<br>• Severe hypoxia/anoxia<br>• Postictal state<br>• Increased intracranial pressure (late sign, often unilateral)"
        },
        {
          title: "Unequal Pupils (Anisocoria)",
          content: "• Intracranial lesion (herniation if with decreased LOC)<br>• Trauma - direct eye injury<br>• Physiologic (normal in ~20% of population, usually small difference)"
        },
        {
          title: "Fixed and Dilated (Bilateral)",
          content: "• Severe anoxic brain injury<br>• Cardiac arrest<br>• Anticholinergic overdose<br>• Hypothermia (pupils may be fixed - does not indicate death)"
        }
      ]
    },
    {
      type: "accordion",
      title: "Skin Findings",
      items: [
        {
          title: "Hot, Dry Skin",
          content: "• Heat stroke<br>• Anticholinergic toxidrome (\"hot as a hare, dry as a bone\")<br>• Thyroid storm"
        },
        {
          title: "Cool, Clammy Skin",
          content: "• Hypoglycemia<br>• Shock (hypovolemic, septic)<br>• Overdose<br>• Cardiac event"
        },
        {
          title: "Jaundice",
          content: "• Hepatic encephalopathy<br>• Liver failure"
        },
        {
          title: "Petechiae / Purpura",
          content: "• Meningococcemia (with fever = emergent)<br>• DIC / Sepsis"
        },
        {
          title: "Track Marks",
          content: "• IV drug use - consider opioid overdose, endocarditis, sepsis"
        }
      ]
    },
    {
      type: "accordion",
      title: "Breath Odors",
      items: [
        {
          title: "Fruity / Acetone",
          content: "Diabetic ketoacidosis (DKA) - check glucose, expect elevated"
        },
        {
          title: "Alcohol",
          content: "Intoxication - but do NOT assume alcohol explains ALOC without excluding other causes"
        },
        {
          title: "Uremic (Ammonia)",
          content: "Renal failure, uremic encephalopathy"
        },
        {
          title: "Fetor Hepaticus",
          content: "Hepatic failure - sweet, musty odor"
        }
      ]
    },
    {
      type: "section",
      title: "Special Populations"
    },
    {
      type: "accordion",
      title: "Elderly ALOC",
      items: [
        {
          title: "Common Causes in Elderly",
          content: "• <b>UTI</b> - Most common cause of ALOC in elderly, may be afebrile<br>• <b>Medication effects</b> - Polypharmacy, new medications<br>• <b>Subdural hematoma</b> - Minor trauma on anticoagulants, may be delayed<br>• <b>Stroke</b> - Risk increases with age<br>• <b>Sepsis</b> - May present without fever"
        },
        {
          title: "Key Considerations",
          content: "• Get accurate baseline from family (patient's normal mental status)<br>• Lower threshold for transport<br>• Review medications - anticoagulants increase bleeding risk<br>• \"Normal\" vital signs may be abnormal for patient"
        }
      ]
    },
    {
      type: "accordion",
      title: "Pediatric ALOC",
      items: [
        {
          title: "Common Causes in Children",
          content: "• <b>Infection</b> - Meningitis, sepsis, febrile illness<br>• <b>Ingestion</b> - Accidental poisoning<br>• <b>Hypoglycemia</b> - Especially in diabetics<br>• <b>Seizure</b> - Postictal, febrile seizure<br>• <b>Trauma</b> - Non-accidental trauma (abuse), falls<br>• <b>Dehydration</b>"
        },
        {
          title: "Assessment Tips",
          content: "• Use pediatric GCS for children < 5 years<br>• Ask about development - what is normal for this child?<br>• Check fontanelle in infants (bulging = increased ICP)<br>• Evaluate for signs of abuse if unexplained"
        }
      ]
    },
    {
      type: "section",
      title: "Syncope vs ALOC"
    },
    {
      type: "info",
      title: "Syncope Evaluation",
      content: "<b>Syncope</b> = Transient loss of consciousness with rapid, spontaneous recovery.<br><br><b>If patient is now at baseline:</b><br>• Obtain 12-lead ECG (look for arrhythmia, STEMI, QT prolongation)<br>• Check orthostatic vital signs if able<br>• Assess for injury from fall<br><br><b>High-risk features requiring transport:</b><br>• Exertional syncope<br>• Syncope while supine<br>• Associated chest pain or palpitations<br>• Family history of sudden cardiac death<br>• Abnormal ECG<br>• Age > 60<br>• Known cardiac disease"
    },
    {
      type: "section",
      title: "Documentation"
    },
    {
      type: "list",
      title: "Essential Documentation",
      items: [
        { title: "GCS", content: "Document component scores (E_V_M_) and total." },
        { title: "Baseline Status", content: "Patient's normal mental status per family/records." },
        { title: "Blood Glucose", content: "Document value - essential on every ALOC patient." },
        { title: "Pupil Exam", content: "Size, reactivity, symmetry." },
        { title: "Response to Interventions", content: "Did patient improve with dextrose, Narcan, O2?" },
        { title: "Environmental Clues", content: "Medications, drugs, alcohol, suicide notes, trauma evidence." },
        { title: "Trend", content: "Is patient improving, stable, or deteriorating?" }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Glucose First:</b> Check blood glucose on EVERY ALOC patient. It takes 30 seconds and rules out the most treatable cause.<br><br><b>Don't Blame Alcohol:</b> Intoxicated patients can also have hypoglycemia, head trauma, overdose, or stroke. Always look for other causes.<br><br><b>GCS ≤8 = Airway:</b> Patients with GCS ≤8 cannot protect their airway. Be prepared to intervene.<br><br><b>Know Baseline:</b> A GCS of 13 might be improvement or decline depending on the patient's baseline. Always ask family.<br><br><b>Posterior Stroke:</b> Patients with basilar artery stroke may present as \"intoxicated\" with ALOC, vertigo, and ataxia. Perform mLAPSS even if intoxication suspected.<br><br><b>Hypothermia Note:</b> Cold patients may appear dead (fixed, dilated pupils, unresponsive). \"Not dead until warm and dead.\""
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1203 Diabetic Emergencies" },
        { title: "TP-1204 Overdose / Poisoning" },
        { title: "TP-1207 Shock / Hypotension" },
        { title: "TP-1231 Seizure" },
        { title: "TP-1232 Stroke / CVA / TIA" },
        { title: "TP-1244 Head Trauma" },
        { title: "TP-1237 Hypothermia" },
        { title: "TP-1238 Hyperthermia / Heat Stroke" }
      ]
    }
  ]
};
