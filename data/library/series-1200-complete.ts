import { Protocol } from '../../types';

// LA County EMS Treatment Protocols - 1200 Series
// Extracted from Protocol-Guide.com knowledge base
// Last Updated: 2025

export const series1200: Protocol[] = [
  {
  id: "1201",
  refNo: "TP-1201",
  title: "General Patient Assessment",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "General Patient Assessment", subtitle: "TP-1201 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Overview"
    },
    {
      type: "list",
      title: "Purpose",
      items: [{ content: "This protocol provides the foundation for all patient encounters and should be applied to every patient contact. It ensures systematic evaluation and appropriate documentation." }]
    },
    {
      type: "section",
      title: "Assessment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Scene safety and situational awareness ❶ Ensure scene is safe for EMS personnel, patient, and bystanders Identify number of patients and need for additional resources" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Primary assessment Assess level of consciousness (AVPU) Assess and manage airway, breathing, and circulation Control life-threatening bleeding (MCG 1370)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Obtain vital signs Blood pressure, heart rate, respiratory rate, oxygen saturation, temperature Blood glucose if altered mental status or diabetic history" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Obtain focused history Chief complaint OPQRST (Onset, Provocation, Quality, Region/Radiation, Severity, Time) SAMPLE (Symptoms, Allergies, Medications, Past medical history, Last oral intake, Events leading to illness)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Perform focused physical examination Based on chief complaint and mechanism of injury Document all pertinent positive and negative findings" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Determine provider impression and treatment plan Select appropriate treatment protocol(s) Consider need for ALS intervention Determine appropriate destination" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Provide treatment per applicable protocol(s)" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Ongoing reassessment Reassess vital signs and response to treatment Document all interventions and patient response" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Scene safety is paramount. Do not enter an unsafe scene. Wait for appropriate resources (law enforcement, fire department, hazmat, etc.) to secure the scene before providing patient care." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Use of personal protective equipment (PPE) is essential for all patient contacts. Select appropriate PPE based on anticipated exposure risk." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "This protocol serves as the framework for patient assessment. All patients require application of this general assessment approach in addition to any specific treatment protocols indicated by their presenting condition." }]
    }
  ]
},
  {
  id: "1202",
  refNo: "TP-1202",
  title: "General Medical",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "General Medical", subtitle: "TP-1202 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Control external hemorrhage prn (MCG 1370)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Assess for signs of trauma For traumatic injury, treat in conjunction with TP 1244, Traumatic Injury" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate cardiac monitoring prn (MCG 1308) Perform 12-lead ECG if cardiac ischemia suspected and treat per TP 1211, Cardiac Chest Pain" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For patients with dysrhythmias, treat per TP 1212, Cardiac Dysrhythmia - Bradycardia or TP 1213, Cardiac Dysrhythmia - Tachycardia If patient with palpitations but normal sinus rhythm on 12-lead ECG – document Provider Impression as Palpitations" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Assess and document pain (MCG 1345) Consider the following Provider Impressions: If chest pain present without suspicion of cardiac cause – document Chest Pain – Not Cardiac ❶ If pain in neck or back without trauma – document Body Pain – Non-traumatic If headache and no report or signs of trauma – document Headache – Non-traumatic" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For pain management: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x 1 in 1 traumatic" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For pain management: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x 1 in 15 min prn and treat in conjunction with TP 1205, GI/GU Emergencies" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For patients with complaints of weakness Assess neurologic exam; if focal findings present or stroke suspected treat per TP 1232, Stroke/CVA/TIA If no focal weakness present and complaint of generalized weakness – document Provider Impression as Weakness – General" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "For patients with complaints of hypertension without other signs or symptoms – document Provider Impression as Hypertension ❷" }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "Consider the following Provider Impressions: If cold/cough symptoms without respiratory distress or wheezing – document Cold/Flu Symptoms If isolated pain or swelling in one or more extremities – document Extremity Pain/Swelling – Non- traumatic ❸" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "When evaluating a patient for chest pain consider age, previous history of cardiac disease or MI, risk factors, and signs and symptoms to determine if cardiac chest pain suspected. Obtain a 12-lead ECG if age ≥ 35 years and/or patient has risk factors (hypertension, diabetes mellitus, high cho ne if cardiac chest pain suspected. Obtain a 12-lead..." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Hypertension in a pregnant or recently post-partum patient is a sign of eclampsia, which requires immediate emergency and obstetric care. Additional signs of eclampsia are edema and seizures. Patients who are ≥ 20 weeks pregnant or ≤ 6 weeks post-partum with hypertension (BP ≥ 140/90mmHg) should be transported to the ED for evaluation." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "For patients with bilateral swelling of lower extremities, evaluate for signs of congestive heart failure. Careful examination of breath sounds and vital signs, including respiratory rate and pulse oximetry, should be performed. If there are signs or symptoms of pulmonary edema, treat per TP 1214, Pulmonary Edema / CHF." }]
    }
  ]
},
  {
  id: "1203",
  refNo: "TP-1203",
  title: "Diabetic Emergencies",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Diabetic Emergencies", subtitle: "TP-1203 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Advanced airway prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Initiate cardiac monitoring prn (MCG 1308) Perform 12-lead ECG if cardiac ischemia suspected" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Check blood glucose" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For blood glucose < 60 mg/dL: Oral glucose preparation or Glucopaste 15gm PO if patient awake and alert OR Dextrose 10% 125 mL IV/IO and reassess ❶ If patient continues to be symptomatic, repeat 125 mL for a total of 250mL Document Provider Impression as Hypoglycemia ❷ If unable to obtain venous access, Glucagon 1mg (1mL) IM, may repeat x1 in 20 min prn❸ CONTACT BASE for persistent hypoglycemia..." }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For blood glucose > 200 mg/dL: Document Provider Impression as Hyperglycemia For blood glucose >200 mg/dL and <400 mg/dL with suspected related symptoms:❹ CONTACT BASE for order for Normal Saline 1L IV rapid infusion For blood glucose > 400 mg/dL or reading “HIGH” ❺ or for poor perfusion (MCG 1355): Normal Saline 1L IV/IO rapid infusion ❶ Reassess after each 250 mL increment for evidence o dL o..." }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Use judgment based on the clinical status of the patient to determine whether IO placement for dextrose and/or fluid administration prior to hospital arrival is warranted. For altered patients who show signs of shock/poor perfusion and/or extremis with severe HYPERglycemia or HYPOglycemia and an IV cannot be obtained, an IO may be placed for flu..." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Patients with hypoglycemia who are successfully treated with oral glucose or Dextrose 10% IV and then wish to decline transport to the hospital should be discouraged to do so if they have abnormal vital signs, fever, are taking long-acting hypoglycemic agents, history of alcohol abuse, possible ingestion or poisoning, or if they DO NOT have a hi..." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Glucagon is effective only if there are sufficient glycogen stores in the liver. Patients with low glycogen stores such as severe malnutrition, cirrhosis, or adrenal insufficiency may not respond ient glycogen stores in the liver. Patients with low glycogen stores such as severe malnutrition, cirrhosis, or adrenal insufficiency may not respond t..." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Consider other potential causes of hyperglycemia such as trauma, infection, or myocardial infarction and treat as per associated protocols." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Patients with prolonged and/or severe hyperglycemia are at risk for significant volume losses leading to dehydration and electrolyte abnormalities. Fluid resuscitation with Normal Saline is recommended until their glucose can be lowered with medications." }]
    }
  ]
},
  {
  id: "1204",
  refNo: "TP-1204",
  title: "Fever / Sepsis",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Fever / Sepsis", subtitle: "TP-1204 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring prn (MCG 1308) Perform 12-lead ECG if cardiac ischemia suspected" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "If available, consider applying capnography for patients in whom you suspect sepsis (MCG 1305) ❶" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For suspected sepsis with any one of the following: tactile fever, tachycardia, or poor perfusion : Normal Saline 1L IV/IO rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops Document Provider Impression of Sepsis ❷ For persistent poor perfusion (MCG 1355), treat in conjunction with TP 1207, Shock/Hypot..." }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Check blood glucose prn; If < 60mg/dL or >400 mg/dL treat in conjunction with TP 1203, Diabetic Emergencies" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "If fever present without signs of sepsis or poor perfusion: Perform passive cooling measures and cover with thermal blankets if shivering occurs Document Provider Impression of Fever ❸" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Obtain a travel history For potential emerging infectious disease, contact the Medical Alert Center to d ocument Provider Impression of Fever ❸" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Obtain a travel history For potential emerging infectious disease, contact the Medical Alert Center to determine if special isolation procedures or transport is required ❹" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For pain management: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "An end-tidal CO 2 (EtCO 2 ) reading ≤ 25mmHG strongly supports the provider impression of sepsis in patients for whom sepsis is suspected." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Sepsis is defined as the body’s response to infection and may include fever, tachycardia or bradycardia, tachypnea, and signs of poor perfusion. Other signs of infection may be present such as cough (e.g., pneumonia), painful urination (e.g., urinary tract infection), abdominal pain (e.g., appendicitis), headache (e.g., meningitis), or a red swo..." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Fever is a natural response of the body to fight infect t and sepsis with or without shock is present document provider impression as Sepsis." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Fever is a natural response of the body to fight infection and may be present without signs of sepsis. If fever is present without signs of sepsis (tachypnea, tachycardia, or obvious sign of infection) or septic shock (signs of poor perfusion), document the provider impression as Fever." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Certain emerging diseases (e.g., Ebola virus disease) require special isolation procedures and transport. Determination of suspected cases must be made in coordination with the Department of Public Health (DPH). The Medical Alert Center (MAC) will facilitate DPH consultation and deployment of a High-Risk Ambulance (HRA) when indicated. Contact t..." }]
    }
  ]
},
  {
  id: "1205",
  refNo: "TP-1205",
  title: "GI / GU Emergencies",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "GI / GU Emergencies", subtitle: "TP-1205 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring prn (MCG 1308) Perform 12-lead ECG if cardiac ischemia suspected ❶" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion Reassess after each 250mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Assess and document pain (MCG 1345) If abdominal or pelvic pain during pregnancy, or vaginal bleeding with known or suspected pregnancy treat per TP 1217, Pregnancy Complications Consider the following Provider Impressions: If abdominal or pelvic pain – document Abdominal Pain/Problems If pain in penis, scrotum or testes in a male or complaints of vaginal symptoms in a female, or if for sexual ..." }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For pain management: MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Consider the following Provider Impressions: If nau ment" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Consider the following Provider Impressions: If nausea or vomiting present in the absence of abdominal pain or diarrhea – document Nausea / Vomiting If vomiting blood or coffee ground material, and/or tarry/black stools – document Upper GI Bleeding ❷ If vaginal bleeding without known pregnancy – document Vaginal Bleeding If complaint of diarrhea without hypotension – document Diarrhea If bleedi..." }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "When evaluating a patient with abdominal pain, note that abdominal pain may be a sign of cardiac disease. If age ≥ 35 years, previous history of cardiac disease or MI, or risk factors are present (hypertension, diabetes mellitus), consider obtaining a 12-lead ECG to evaluate for ischemia or STEMI." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "For both upper and lower GI bleeding, if abdominal pain is also present, document GI bleeding as primary provider impression and abdominal pain as secondary provider impression." }]
    }
  ]
},
  {
  id: "1206",
  refNo: "TP-1206",
  title: "Medical Device Malfunction",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Medical Device Malfunction", subtitle: "TP-1206 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Establish type of medical device inserted ❶" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Assess and document pain (MCG 1345)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For pain management: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Document Medical Device Malfunction as the Provider Impression if the patient’s presentation suggests malfunction of the medical device, otherwise treat as per applicable protocol, for example: • Insulin Pump: Check blood glucose prn and treat in conjunction with TP 1203, Diabetic Emergencies • Vagal Nerve Stimulation devices: Treat presenting symptoms; for seizure treat per TP 1231, Seizure – ..." }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Most patients with an inserted medical device have medical complaints that are not related to the device itself and should be treated as per standard protocols based on presenting signs and symptoms. It is important to obtain a history of when the medical device was inserted as different complications occur depending on time since insertion." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Patients with ventriculoperitoneal shunts can have breakage of the shunt connections, obstruction, or infection of the shunt, which may present as ALOC, headache, nausea and vomiting, or fever." }]
    }
  ]
},
  {
  id: "1207",
  refNo: "TP-1207",
  title: "Shock/Hypotension",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Shock/Hypotension", subtitle: "TP-1207 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302) Continually assess patient’s airway and ventilation status" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302) High flow Oxygen 15 L/min for all patients in shock, regardless of SpO 2 ❶" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Maintain supine if respiratory status allows ❷" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular access (MCG 1375) Large bore catheter (18G or 16G) preferred For patients with hypotension and clinical evidence of poor perfusion (MCG 1355), establish IO catheter if unable to obtain peripheral venous access after 2 attempts For IO placement in alert patients administer Lidocaine 2% 40mg (20mg/mL) slow IO push, dose per MCG 1317.23, may repeat once for infusion pain at half..." }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Apply blanket to keep patient warm ❸" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Consider etiology ❹ Perform 12-lead ECG if cardiac ischemia suspected For patients with dysrhythmia, treat in conjunction with TP 1212, Cardiac Dysrhythmia- Bradycardia or TP 1213, Cardiac Dysrhythmia-Tachycardia For patients with traumatic injury, treat per TP 1244, Traumatic Injury For concern of overdose or toxic exposure, treat in conju ythmia-Tachycardia For patients with traumatic injury,..." }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Normal Saline 1L IV/IO rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "CONTACT BASE for shock despite initial fluid resuscitation, and for order of additional Normal Saline 1L IV/IO" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For patients with isolated hypotension without signs of poor perfusion and those who rapidly improve with or without the initial Normal Saline 250mL document Hypotension (HOTN) as provider impression. For patients with hypotension and poor perfusion, as well as patients with poor perfusion who do not respond to an initial Normal Saline 250mL infusion and/or require addition Normal Saline beyond..." }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "If clinical evidence of poor perfusion persists despite fluid infusion or pulmonary edema develops requiring cessation of fluid administration: Push-dose Epinephrine – mix 9mL Normal Saline with 1mL Epinephrine (0.1mg/mL) IV formulation in a 10mL syringe; administer Push-dose Epinephrine (0.01mg/mL) 1mL IV/IO every 1-5 minutes as needed to h 1mL Epinephrine (0.1mg/mL) IV formulation in a 10mL s..." }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Shock is inadequate tissue perfusion, equivalent to poor perfusion for the purposes of this protocol." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Maintaining a patient supine improves perfusion to vital organs; raising the lower limbs does not provide additional benefit. However, not all patients will tolerate a supine position, which can further compromise respiratory function and airway patency." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Exposure to cold increases the likelihood of bleeding complications." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "There are many etiologies of shock. The treatment protocols referenced here contain guidance on specific interventions beyond what is contained in this treatment protocol. Consider Base contact if hypotension/shock of unclear etiology." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Push-dose Epinephrine is appropriate for non-traumatic shock including cardiogenic shock. Additional doses beyond 10mL may need to be prepared for prolonged transports." }]
    }
  ]
},
  {
  id: "1208",
  refNo: "TP-1208",
  title: "Hemorrhage Control",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Hemorrhage Control", subtitle: "TP-1208 • Protocol", icon: "healing" }]
    },
    {
      type: "alert",
      title: "Critical Intervention",
      content: "Life-threatening hemorrhage must be controlled immediately during primary assessment."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Identify source and severity of bleeding Assess for life-threatening external hemorrhage Evaluate for signs of internal hemorrhage (shock, abdominal distension, hematemesis, melena)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Control external hemorrhage (MCG 1370) Apply direct pressure with sterile dressing For extremity bleeding, apply tourniquet if direct pressure ineffective ❶ Tighten tourniquet until bleeding stops and distal pulse absent Document time of tourniquet application" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For junctional hemorrhage (axilla, groin, neck): Apply hemostatic dressing (e.g., QuikClot, Celox) with direct pressure If bleeding not controlled, consider junctional tourniquet if available" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Establish vascular access (MCG 1375) Large bore IV (14-16 gauge) preferred for significant hemorrhage Consider IO access if IV unsuccessful" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For signs of shock or poor perfusion (MCG 1355): Normal Saline 1L IV/IO rapid infusion ❷ Reassess after each 250 mL increment For traumatic hemorrhage, treat in conjunction with TP 1240, Multi-System Trauma For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For suspected pelvic fracture with hemodynamic instability: Apply pelvic binder Minimize patient movement" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Prevent hypothermia Keep patient warm with blankets Remove wet clothing Increase ambient temperature in ambulance" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For GI bleeding (hematemesis, melena, hematochezia): Treat in conjunction with TP 1205, GI/GU Emergencies" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "Consider tranexamic acid (TXA) if available and approved by local protocols For trauma patients with significant hemorrhage within 3 hours of injury ❸" }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "Rapid transport to appropriate facility Trauma center for traumatic hemorrhage Consider activation of trauma team Communicate early with receiving facility" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Tourniquets save lives when used appropriately for life-threatening extremity hemorrhage. Do not delay tourniquet application if direct pressure is ineffective. Commercial tourniquets (CAT, SOFTT) are preferred over improvised tourniquets. Document exact time of application. Do not remove or loosen tourniquet in the field once applied." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Fluid resuscitation in hemorrhagic shock should be targeted to maintain perfusion while avoiding overresuscitation. Goal is to maintain radial pulse and mental status while minimizing additional bleeding. Permissive hypotension (SBP 80-90 mmHg in adults) may be appropriate in traumatic hemorrhage prior to definitive hemorrhage control. Do not delay transport to establish IV access or administer fluids." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Tranexamic acid (TXA) has been shown to reduce mortality in trauma patients with significant hemorrhage when administered within 3 hours of injury. Maximum benefit is achieved when given within 1 hour. TXA availability and protocols vary by EMS system." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "The lethal triad of trauma is hypothermia, acidosis, and coagulopathy. Prevention of hypothermia is critical in hemorrhaging patients. Remove wet clothing, cover patient with dry blankets, and increase ambient temperature." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Hemostatic dressings (QuikClot, Celox, etc.) are impregnated with agents that promote clotting. They are particularly useful for junctional hemorrhage that cannot be controlled with tourniquets. Pack the wound with hemostatic gauze and apply direct pressure for at least 3 minutes." }]
    }
  ]
},
  {
  id: "1209",
  refNo: "TP-1209",
  title: "Behavioral / Psychiatric Crisis",
  category: "Behavioral",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "psychology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Behavioral / Psychiatric Crisis", subtitle: "TP-1209 • Protocol", icon: "psychology" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for all patients with agitation requiring midazolam."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Perform initial assessment of scene and patient situation for safety ❶" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Attain law enforcement (LE) assistance prior to approaching a patient if a weapon is visualized or the patient threatens violence or for potential assistance with application of an involuntary psychiatric hold ❶❷" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Approach patient with caution, assess for agitation and use verbal de-escalation as needed (MCG 1307, Care of the Psychiatric Patient with Agitation )❸" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Evaluate for medical conditions, including those that may present with psychiatric features ❹" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate basic and/or advanced airway maneuvers prn Prepare in advance to support ventilations prn for any patient who receives midazolam sedation❺" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Pre-plan approach to physical restraint; apply restraints when indicated (Ref. No. 838, Application of Patient Restraints) ❻" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Manage ongoing agitation based on patient’s condition" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For COOPERATIVE PATIENTS: Olanzapine 10mg Oral Disintegrating Tablet (ODT); given once (MCG 1317.32)" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For UNCOOPERATIVE PATIENTS who p" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For COOPERATIVE PATIENTS: Olanzapine 10mg Oral Disintegrating Tablet (ODT); given once (MCG 1317.32)" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For UNCOOPERATIVE PATIENTS who pose a potential safety risk to self and/or EMS personnel: Consider Midazolam 5mg (1mL) IM/IN/IV ❺❼ CONTACT BASE concurrent with administration With Base orders may repeat q5 min prn, to a maximum total dose of 20mg" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For SEVERE AGITATION WITH ALOC who pose an IMMEDIATE RISK to self and/or EMS personnel: Administer Midazolam 5mg (1mL) IM/IN/IV❺❼, repeat prn x1 in 5 min, or Administer Midazolam 10mg (2mL) IM/IN ❺❽ May administer 5mg with repeat prn or 10mg single dose considering size of patient and level of risk, maximum 10mg prior to Base Contact CONTACT BASE for additional sedation With Base orders may rep..." }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "Initiate cardiac monitoring on all patients in restraint and/or post-sedation (MCG 1308) ❺❾ Pre-position monitor prior to sedation; continuously monitor airway and breathing peri- and post- sedation Assess for dysrhythmia o on (MCG 1308) ❺❾ Pre-position monitor prior to sedation; continuously monitor airway and breathing peri- and post- sedation Assess for dysrhythmia or interval widening" }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "CONTACT BASE for QRS > 0.12 sec or heart rate < 50 to discuss need to administer Sodium Bicarbonate 50mEq (50mL) IV ❿" }]
    },
    {
      type: "list",
      title: "Step 14",
      items: [{ content: "If patient’s skin is hot to touch or has a measured fever with suspected hyperthermia (i.e., measured temperature greater than 39C or 102F), initiate cooling measures" }]
    },
    {
      type: "list",
      title: "Step 15",
      items: [{ content: "Establish vascular access prn (MCG 1375) Check blood glucose prn ⓫ If glucose < 60 mg/dL or > 400 mg/dL treat in conjunction with TP 1203, Diabetic Emergencies" }]
    },
    {
      type: "list",
      title: "Step 16",
      items: [{ content: "Evaluate for physical trauma; if present treat in conjunction with TP 1244, Traumatic Injury" }]
    },
    {
      type: "list",
      title: "Step 17",
      items: [{ content: "Evaluate for possible suicide attempt ⓬ For potential overdose, obtain patient and bystanders information about ingestions and treat in conjunction with TP 1241, Overdose/Poisoning/Ingestion" }]
    },
    {
      type: "list",
      title: "Step 18",
      items: [{ content: "If concern for suicidal intent in persons not on a 5150/5585 hold and refusing voluntary treatment or transport, CONTACT BASE (MCG 1306)" }]
    },
    {
      type: "list",
      title: "Step 19",
      items: [{ content: "Evaluate for acute mental health and/or substance abuse crises Obtain relevant clinical history regarding patient’s current psychiatric diagnoses, psychiatric and other medications, and any recent alcohol or recreational drug ingestions Obtain and document relevant third party or collateral data [13] atric and other medications, and any recent alcohol or recreational drug ingestions Obtain and ..." }]
    },
    {
      type: "list",
      title: "Step 20",
      items: [{ content: "Patients who respond to verbal de-escalation or are treated only with olanzapine for agitation, and are now cooperative, and who meet criteria in Ref. No. 526, Behavioral/Psychiatric Crisis Patient Destination and Ref. 526.1 Medical Clearance Criteria Screening Tool for Psychiatric Urgent Care Center, may be transported by Basic Life Support (BLS) or law enforcement (LE) to the MAR or to a Psyc..." }]
    },
    {
      type: "list",
      title: "Step 21",
      items: [{ content: "Patients, evaluated by EMS personnel not yet approved for alternate destination transport, who receive olanzapine for agitation and are otherwise stable, and do not have an emergency medical condition, may be transported by BLS or law enforcement to the MAR only." }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Scene safety includes the assessment for the presence of firearms or weapons, including observations and direct inquiry with the patient and any available/relevant third parties (e.g., family, caregivers, or witnesses). If a weapon is found on the scene, EMS personnel should notify all members on the scene, and contact law enforceme amily, careg..." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Psychiatric, including mental health and substance abuse, emergencies are medical emergencies, and as such are best treated by EMS personnel. Those patients with psychiatric emergencies presenting with agitation, violence, threats of harm to self or others, or criminal activity are best managed by an EMS and LE co-response." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Always attempt verbal de-escalation first and avoid applying restraints to patients who do not present a threat to self or EMS personnel (Ref. No. 838, Application of Patient Restraints)" }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Many medical causes of psychiatric symptoms exist: Agitation (see MCG 1307) Acute pain Head trauma Infection Encephalitis or Encephalopathy Exposure to environmental toxins Metabolic derangement Hypoxia Thyroid disease or other hormone irregularity Neurological disease Toxic levels of medications Alcohol or recreational drugs: intoxication or wi..." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Medications used for pharmacologic management of agitation may cause respiratory depression; administer only when necessary for the safety of the patients and/or EMS personnel. Apnea can occur suddenly and with little warning. Resuscitation equipment (oxygen and bag-mask ventilator) should be positioned near the patient and readily available pri..." }]
    },
    {
      type: "accordion",
      title: "Note 6",
      items: [{ content: "Use of restraints in severely agitated patients is associated with an increased risk of sudd for additional clinical assessment and treatment." }]
    },
    {
      type: "accordion",
      title: "Note 7",
      items: [{ content: "Use of restraints in severely agitated patients is associated with an increased risk of sudden death. Avoid using restraints in patients who do not present a threat to self or to EMS personnel. Monitor patients closely when restraints are applied. Never secure or transport a patient in restraints in prone position." }]
    },
    {
      type: "accordion",
      title: "Note 8",
      items: [{ content: "The IM or IN route is preferred unless an IV has been previously established." }]
    },
    {
      type: "accordion",
      title: "Note 9",
      items: [{ content: "Patients who are larger in size (e.g., ≥100kg) and/or pose a greater risk for harm due to their level of agitation and violence may require the higher dose of midazolam for adequate sedation. Patients in need of sedation who are smaller, frail, elderly or already exhibiting signs of fatigue should preferentially be treated with a 5mg dose, repea..." }]
    },
    {
      type: "accordion",
      title: "Note 10",
      items: [{ content: "Patients who are agitated while in physical restraint and have the potential for injury due to the degree of agitation, should receive medication by EMS personnel to reduce agitation with continued monitoring for respiratory depression, in accordance with Ref 838, Application of Patient Restraints." }]
    },
    {
      type: "accordion",
      title: "Note 11",
      items: [{ content: "Several drugs that may cause agitation and present similarly to a psychiatric crisis may also cause life threatening cardiac arrhythmias after intentional or acci that may cause agitation and present similarly to a psychiatric crisis may also cause life threatening cardiac arrhythmias after intentional or accidental overdose. These arrhythmias a..." }]
    },
    {
      type: "accordion",
      title: "Note 12",
      items: [{ content: "Agitation may be present after a seizure, or in the setting of hypo/hyperglycemia. Consider checking glucose early if the patient is a known diabetic or demonstrates clinical evidence of hypoglycemia, but only if safe to do so." }]
    },
    {
      type: "accordion",
      title: "Note 13",
      items: [{ content: "It is important to assess for any evidence of suicide attempt. If there is concern for overdose, ask the patient or bystanders to provide information on agents used (specifically what, when, and how much). Collect and transport any medication vials, or additional pills). This will assist in determining necessary antidote treatment a hen, and how..." }]
    }
  ]
},
  {
  id: "1210",
  refNo: "TP-1210",
  title: "Cardiac Arrest",
  category: "Cardiac",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Arrest", subtitle: "TP-1210 • Protocol", icon: "monitor_heart" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for all cardiac arrest patients who do not meet criteria for determination of death per Ref. 814; Contact Base prior to transport unless ECPR criteria are met per MCG 1318 – contact ECPR Base en route."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "For patients meeting Ref. 814 Section I criteria for determination of death in the field – document Provider Impression as DOA – Obvious Death" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Resuscitate cardiac arrest patients on scene ❶" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate chest compressions at a rate of 100-120 per min, depth 2 inches or 5 cm ❷ Minimize interruptions in chest compressions" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn ❸❹ (MCG 1302) Supraglottic airway (SGA), e.g., i-gel is the preferred advanced airway ❺ Monitor waveform capnography throughout resuscitation ❻" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Administer high-flow Oxygen (15L/min) (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) Briefly assess rhythm every 2 minutes, minimizing pauses, or continuously via rhythm display technology ❼ V-FIB/PULSELESS V-TACH: ❽" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Defibrillate biphasic at 200J immediately or per manufacturer’s instructions Repeat at each 2-minute cycle as indicated If persistent shockable rhythm after three shock c at 200J immediately or per manufacturer’s instructions Repeat at each 2-minute cycle as indicated If persistent shockable rhythm after three shocks, change the pad position when feasible ❾" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Establish vascular access (MCG 1375) Establish IO if any delay in obtaining IV access" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Begin Epinephrine after defibrillation x2: Epinephrine (0.1mg/mL) administer 1mg (10mL) IV/IO Repeat every 5 min x2 additional doses; maximum total dose 3mg ❿" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Prioritize transport for refractory VF/VT after defibrillation x2 in patients who meet ECPR criteria. Limit scene time to ≤15 minutes. (MCG 1318, Ref 516)" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "After defibrillation x3 (for refractory or recurrent V-Fib/V-Tach without pulses): Amiodarone 300mg (6mL) IV/IO Repeat Amiodarone 150mg (3mL) IV/IO x1 prn after additional defibrillation x2, maximum total dose 450mg" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "Epinephrine (0.1mg/mL) administer 1mg (10mL) IV/IO Repeat every 5 min x2; administer first dose as early as possible; maximum total dose 3mg ❿ CONTACT BASE to discuss additional epinephrine doses in cases where it may be indicated due to refractory PEA or recurrent arrest" }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "Consider and treat potential causes ⓫" }]
    },
    {
      type: "list",
      title: "Step 14",
      items: [{ content: "Normal Saline 1L IV/IO rapid infusion Repeat x icated due to refractory PEA or recurrent arrest" }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "Consider and treat potential causes ⓫" }]
    },
    {
      type: "list",
      title: "Step 14",
      items: [{ content: "Normal Saline 1L IV/IO rapid infusion Repeat x1 for persistent cardiac arrest For suspected hypovolemia, administer both liters simultaneously" }]
    },
    {
      type: "list",
      title: "Step 15",
      items: [{ content: "For patients with renal failure or other suspected hyperkalemia: ⓬ Calcium Chloride 1gm (10mL) IV/IO Sodium Bicarbonate 50mEq (50mL) IV/IO TERMINATION OF RESUSCITATION:" }]
    },
    {
      type: "list",
      title: "Step 16",
      items: [{ content: "If resuscitative efforts are unsuccessful and the patient does not meet ALL criteria for Termination of Resuscitation in Ref. 814, Section II.A., CONTACT BASE to consult with Base Physician ❽ RETURN OF SPONTANEOUS CIRCULATION (ROSC):" }]
    },
    {
      type: "list",
      title: "Step 17",
      items: [{ content: "Initiate post-resuscitation care immediately to stabilize the patient prior to transport ⓭⓮" }]
    },
    {
      type: "list",
      title: "Step 18",
      items: [{ content: "For SBP < 90 mmHg: Normal Saline 1L IV/IO rapid infusion If no response after Normal Saline 250mL, or worsening hypotension and/or bradycardia: Push-dose Epinephrine – mix 9mL Normal Saline with 1mL Epinephrine 0.1mg/mL (IV formulation) in a 10mL syringe. Administer Push-dose Epinephrine (0.01mg/mL) 1mL IV/IO every 1-5 minutes as needed to maintain SBP > 90mmHg ⓰" }]
    },
    {
      type: "list",
      title: "Step 19",
      items: [{ content: "Establish advanced airway prn ❺" }]
    },
    {
      type: "list",
      title: "Step 20",
      items: [{ content: "Raise head of stretcher to 30 degrees if blood pressure allows, otherwise maintain supine" }]
    },
    {
      type: "list",
      title: "Step 21",
      items: [{ content: "Continue low volume ventilations at 10 per minute ⓯" }]
    },
    {
      type: "list",
      title: "Step 22",
      items: [{ content: "Immediately resume CPR if patient re-arre pressure allows, otherwise maintain supine" }]
    },
    {
      type: "list",
      title: "Step 21",
      items: [{ content: "Continue low volume ventilations at 10 per minute ⓯" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Maintaining perfusion with high-quality CPR throughout resuscitation is essential to ensuring good patient outcome. Transporting the patient in cardiac arrest causes interruptions in CPR and reduces CPR quality. Patients who are resuscitated until ROSC on scene have higher ting the patient in cardiac arrest causes interruptions in CPR and reduce..." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Chest compressions are the most important aspect of cardiac arrest resuscitation. Maintaining continuous chest compressions should take priority over any medication administration or transport." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Hyperventilation reduces venous return and worsens patient outcomes. Both continuous and interrupted (30:2) compressions/ventilations are acceptable. Regardless of ventilation method used, ventilations should be no more frequent than 10 per minute with appropriate volume, just enough to see chest rise." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Bag-mask ventilation (BMV) with a viral filter is the preferred initial method of airway management. BMV in cardiac arrest has been associated with improved patient outcomes and advanced airway placement should be deferred until after return of spontaneous circulation (ROSC) unless BMV is inadequate. If a decision is made to transport the patien..." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Supraglottic airway (SGA), e.g., i-gel is the preferred advanced airway unless specifically contraindicated. Paramedics should use judgment based on patient characteristics, circumstances, and skill level when selecting the advanced airway modality." }]
    },
    {
      type: "accordion",
      title: "Note 6",
      items: [{ content: "d. Paramedics should use judgment based on patient characteristics, circumstances, and skill level when selecting the advanced airway modality." }]
    },
    {
      type: "accordion",
      title: "Note 7",
      items: [{ content: "ETCO 2 should be > 10 with a “box-shaped” waveform during effective CPR. A flat or wavy waveform or ETCO 2 < 10 may indicate ineffective compressions or airway obstruction. A sudden increase in ETCO 2 is suggestive of ROSC. The waveform can also be used to confirm ventilation rate if an advanced airway or asynchronous ventilation with continuous..." }]
    },
    {
      type: "accordion",
      title: "Note 8",
      items: [{ content: "If you are able to observe the underlying rhythm during compressions via rhythm display technology, do not pause for the rhythm check. In order to minimize pauses in chest compressions, pulse checks should only be performed during rhythm checks when there is an organized rhythm with signs of ROSC, such as normal capnography or sudden rise in cap..." }]
    },
    {
      type: "accordion",
      title: "Note 9",
      items: [{ content: "Patients in persistent cardiac arrest with refractory ventricular fibrillation (rVF) or EMS-witnessed arrest of presumed cardiac etiology may have a good outcome despite prolonged resuscitation. Early transport may be initiated using a mechanical compression device when routing a patient to a STEMI Receiving Center (SRC) for initiation of extrac..." }]
    },
    {
      type: "accordion",
      title: "Note 10",
      items: [{ content: "Changing the pad position, called vector change, from anterior-lateral to anterior-posterior or vice versa in patients who do not respond to initial defibrillation attempts, increases the chances of converting to a perfusing rhythm." }]
    },
    {
      type: "accordion",
      title: "Note 11",
      items: [{ content: "Epinephrine may improve outcomes if given early in non-shockable rhythms, but can worsen outcomes early in shockable rhythms, where defibrillation is the preferred initial treatment. Epinephrine is most DEPARTMENT OF HEALTH SERVICES COUNTY OF LOS ANGELES Treatment Protocol: CARDIAC ARREST Ref. No. 1210 REVISED: 07-01-25 PAGE 5 OF 5 likely to be ..." }]
    },
    {
      type: "accordion",
      title: "Note 12",
      items: [{ content: "Potential causes that can be treated in the field include hypoxia, hypovolemia, hyperkalem inephrine should only be administered with Base order." }]
    },
    {
      type: "accordion",
      title: "Note 13",
      items: [{ content: "Potential causes that can be treated in the field include hypoxia, hypovolemia, hyperkalemia, hypothermia, toxins, and tension pneumothorax. Massive pulmonary embolism is a rare cause that may be treated with extracorporeal cardiopulmonary resuscitation (ECPR). Hypoglycemia is a very rare cause of cardiac arrest and should not be assessed until ..." }]
    },
    {
      type: "accordion",
      title: "Note 14",
      items: [{ content: "Treat suspected hyperkalemia with calcium and sodium bicarbonate as soon as possible. The sooner it is administered, the more likely it is to be effective. Flush the line between medication administration." }]
    },
    {
      type: "accordion",
      title: "Note 15",
      items: [{ content: "Approximately 40% of patients will re-arrest shortly after ROSC. Early indicators of impending re-arrest include falling EtCO 2 and progressive bradycardia. Anticipate this decline as the epinephrine administered during the resuscitation begins to lose effect. Fluid resuscitation, vasopressor support, and avoidance of hyperventilation are recomm..." }]
    }
  ]
},
  {
  id: "1211",
  refNo: "TP-1211",
  title: "Cardiac Chest Pain",
  category: "Cardiac",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Chest Pain", subtitle: "TP-1211 • Protocol", icon: "monitor_heart" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) ❶ Assess cardiac rhythm and obtain 12-lead ECG ❷ Transmit the ECG to the receiving SRC if STEMI is suspected (MCG 1303)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For patients with dysrhythmias, treat in conjunction with TP 1212, Bradycardia or TP 1213, Tachycardia" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Aspirin 325mg chewable tablets PO if alert ❸" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For chest pain after 12-lead ECG: Nitroglycerin 0.4mg SL prn ❹❺ Repeat every 5 min prn x2, total of 3 doses Hold if SBP < 100mmHg or patient has taken sexually enhancing medication within 48hrs" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Establish vascular access (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For persistent chest pain after, or contraindication to, nitroglycerin: refer to MCG 1345, Pain Management❺" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion usea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Patients may have a myocardial infarction (MI) with or without ST elevations on the ECG. You should review and interpret the ECG; the software interpretation is not always accurate. Include your impression of the patient and interpretation of the ECG when discussing destination decision with the base. Patients with ST elevation myocardial infarc..." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Obtain the ECG as soon as possible with initial vital signs. For patien ion should not be used to determine destination and should be repeated." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Obtain the ECG as soon as possible with initial vital signs. For patients in whom you have a high clinical suspicion for STEMI and the initial ECG does not meet STEMI criteria, you should repeat the ECG prior to transport and at any point that the patient’s clinical status changes. Repeating the ECG increases your chances of detecting an evolvin..." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Aspirin is the most important medication for patients with acute myocardial infarction to improve outcomes and should be administered as soon as possible. All patients with cardiac chest pain should receive aspirin unless contraindicated due to active gastrointestinal bleeding or allergy, even if they already took aspirin at home or are prescrib..." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Nitroglycerin can cause a severe drop in blood pressure in some patients and, while useful for treatment of pain, it has not been sho n." }]
    },
    {
      type: "accordion",
      title: "Note 6",
      items: [{ content: "Nitroglycerin can cause a severe drop in blood pressure in some patients and, while useful for treatment of pain, it has not been shown to improve survival. Use caution in patients with borderline or relative hypotension (patients with history of hypertension or taking antihypertensive medications and SBP < 110) and/or patients with abnormal hea..." }]
    },
    {
      type: "accordion",
      title: "Note 7",
      items: [{ content: "Morphine or fentanyl is preferred for the treatment of cardiac chest pain that does not respond to nitroglycerin or when nitroglycerin is contraindicated; do not administer ketorolac. Morphine or fentanyl is also preferred over nitroglycerin to treat pain in patients with suspected aortic dissection. The classic presentation of acute aortic diss..." }]
    }
  ]
},
  {
  id: "1212",
  refNo: "TP-1212",
  title: "Cardiac Dysrhythmia - Bradycardia",
  category: "Cardiac",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Dysrhythmia - Bradycardia", subtitle: "TP-1212 • Protocol", icon: "monitor_heart" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for all patients with symptomatic bradycardia."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) Assess cardiac rhythm and obtain 12-lead ECG" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "If cardiac chest pain/STEMI suspected as cause of bradycardia, treat in conjunction with TP 1211, Cardiac Chest Pain" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Maintain supine for patients with signs of poor perfusion, if respiratory status allows" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access (MCG 1375) Do not delay transcutaneous pacing (TCP) if indicated for vascular access" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For suspected hyperkalemia ❶ Calcium Chloride 1gm (10mL) slow IV/IO push, may repeat x1 for persistent symptoms Albuterol 5mg (6mL) via neb, repeat continuously until hospital arrival CONTACT BASE to obtain order for Sodium Bicarbonate 50mEq (50mL) slow IVP ❷" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For poor perfusion (MCG 1355): Atropine 1mg (10mL) IV/IO push, repeat every 3-5 min prn, maximum total dose 3mg If IV cannot be rapidly established or if HR ≤ 40bpm in 2 nd degree type II or 3 rd degree heart block, proceed immediately to trans dose 3mg If IV cannot be rapidly established or if HR ≤ 40bpm in 2 nd degree type II or 3 rd degree heart block, proceed immediately to transcutaneous p..." }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "TCP for HR ≤ 40 with continued poor perfusion, initiate TCP as per MCG 1365 ❹ CONTACT BASE concurrent with initiation of TCP If TCP will be utilized for the awake patient, consider sedation and analgesia For sedation: Midazolam 5mg (1mL) slow IV/IO push or IM/IN May repeat in 5 min prn x1, maximum total dose prior to Base contact 10mg For pain management: refer to MCG 1345, Pain Management CONT..." }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For signs of poor perfusion with HR > 40: CONTACT BASE to discuss appropriateness of TCP" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For persistent poor perfusion after initiating TCP: CONTACT BASE to obtain order for Normal Saline 1L IV/IO rapid infusion and/or Push-dose Epinephrine" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "For suspected overdose, treat in conjunction with TP 1241, Overdose/Poisoning/Ingestion ❻" }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn ❼" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Patients at increased risk for hyperkalemia include those with history or clinical evidence of renal failure, missed dialysis or patients taking potassium-sparing diuretics such as spironolactone. ECG signs of hyperkalemia included peaked T-waves, wide QRS, bradycardia, long PR interval and absent P-waves." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Sodium Bicarbonate is another rapid-acting treatment for suspected hyperkalemia. Due to the risk of pulmonary edema, contact Base to discuss administration." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "In patients with 2 nd degree type II or 3 rd degree heart block, atropine is unlikely to produce clinical improvement discuss administration." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "In patients with 2 nd degree type II or 3 rd degree heart block, atropine is unlikely to produce clinical improvement, therefore TCP should not be delayed for atropine administration." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Electrical capture can occur without mechanical capture. Assess for electrical capture by reviewing the rhythm strip for a QRS complex and a T wave after each pacer spike. Assess for mechanical capture by palpating a pulse with each QRS complex." }]
    },
    {
      type: "accordion",
      title: "Note 6",
      items: [{ content: "Push-dose Epinephrine is appropriate for non-traumatic shock including cardiogenic shock. Additional doses beyond 10mL may need to be prepared for prolonged transports." }]
    },
    {
      type: "accordion",
      title: "Note 7",
      items: [{ content: "Consider calcium channel blocker and beta blocker overdose in patients with bradycardia and hypotension. Ask about potential exposures including medications in the home. Hyperglycemia is a common finding with calcium channel blocker overdose." }]
    },
    {
      type: "accordion",
      title: "Note 8",
      items: [{ content: "Nausea and vomiting cause vagal stimulation, which can worsen bradycardia. Ondansetron may be administered to reduce potential for nausea or vomiting." }]
    }
  ]
},
  {
  id: "1213",
  refNo: "TP-1213",
  title: "Cardiac Dysrhythmia - Tachycardia",
  category: "Cardiac",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Dysrhythmia - Tachycardia", subtitle: "TP-1213 • Protocol", icon: "monitor_heart" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for all patients with wide complex tachycardia."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) Assess cardiac rhythm and obtain 12-lead ECG" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "If cardiac chest pain/STEMI suspected, treat in conjunction with TP 1211, Cardiac Chest Pain" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Maintain supine for patients with signs of poor perfusion , if respiratory status allows" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Advanced airway prn (MCG 1302) SINUS TACHYCARDIA ❶" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Consider possible underlying cause and treat as per applicable protocol ❷" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For sinus tachycardia of unclear etiology and suspected hypovolemia or signs of poor perfusion (MCG 1355): Normal Saline 1L IV/IO rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension Continue to assess for underlying caus..." }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For adequate perfusion: Atte with TP 1207, Shock/Hypotension Continue to assess for underlying cause ❷ SVT – NARROW COMPLEX ≥ 150bpm ❸" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For adequate perfusion: Attempt Valsalva maneuver Adenosine 6 or 12mg (2 or 4mL) rapid IV push ❹ Immediately follow with Normal Saline rapid IV flush If no conversion Adenosine 12mg (4mL) rapid IV push ❹ Immediately follow with Normal Saline rapid IV flush" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For alert patients with poor perfusion: Adenosine 12mg (4mL) rapid IV push ❹ Immediately follow with Normal Saline rapid IV flush, may repeat x1 if persistent SVT" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "For poor perfusionwith ALOC: ❺ Synchronized Cardioversion at 120J, may repeat x2 with escalating doses of 150J followed by 200J, or per manufacturer’s guidelines CONTACT BASE concurrent with initial cardioversion Consider sedation prior to cardioversion: Midazolam 5mg (1mL) slow IV/IO push or IM/IN May repeat in 5min prn x1, maximum total dose prior to Base contact 10mg CONTACT BASE for additio..." }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "Consider possible underlying cause and treat as per applicable protocol ❷ 14. For poor perfusion (MCG 1355): CONTACT BASE for treatment guidance ❻ WIDE COMPLEX – REGULAR/MONOMORPHIC" }]
    },
    {
      type: "list",
      title: "Step 15",
      items: [{ content: "For adequate perfusion: Adenosine 6 or 12mg (2 or 4mL) rapid IV push ❹ ❼ Immediately follow with Normal Saline rapid IV flush If WCT persists: Adenosine 12mg (4mL) rapid IV push ❹ ❼ Immediately follow with Normal Saline rapid IV flush" }]
    },
    {
      type: "list",
      title: "Step 16",
      items: [{ content: "For alert patients with poor perfusion: If vascular access available, Adenosine 12mg (4mL) rapid IV push ❹ ❼ Immediately follow with Normal Saline rapid IV flush May repeat x1 for persistent WCT if mental status normal, or proceed directly to cardioversion If no vascular access or no conversion with adenosine: Synchronized Cardioversion at 120J, may repeat x2 with escalating doses of 150J follo..." }]
    },
    {
      type: "list",
      title: "Step 17",
      items: [{ content: "For poor perfusionwith ALOC: ❺ Synchronized Cardioversion at 120J, may repeat x2 with escalating doses of 150J followed by 200J, or per manufacturer’s guidelines CONTACT BASE concurrent with cardioversion Consider sedation prior to cardioversion: Midazolam 5mg (1mL) slow IV/IO push or IM/IN May repeat in 5min prn x1, maximum total dose prior to Base contact 10mg CONTACT BASE for additional seda..." }]
    },
    {
      type: "list",
      title: "Step 18",
      items: [{ content: "For adequate perfusion: CONTACT BASE for treatment guidance ❼" }]
    },
    {
      type: "list",
      title: "Step 19",
      items: [{ content: "For poor perfusion: Synchronized Cardioversion at 120J, may repeat x2 with escalating doses of 150J followed by 200J, or per manufacturer’s guidelines CONTACT BASE concurrent with cardioversion ❼ Consider sedation prior to cardioversion: Midazolam 5mg (1mL) slow IV/IO push or IM/IN May repeat in 5min prn x1, maximum total dose prior to Base contact 10mg CONTACT BASE for additional sedation afte..." }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Treatment of sinus tachycardia should be directed at the underlying cause. Sinus tachycardia due to conditions such as hypovolemia, sepsis, or GI bleed can present as a wide complex tachycardia in patients with left or right bundle branch blocks. P waves should be visible before each QRS and a typical bundle branch block pattern noted on the ECG." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Tachycardia is often a response to an underlying illness including but not limited to: sepsis, GI bleeding, respiratory distress, anaphylaxis, hyperthermia, and toxic ingestions. Sinus tachycardia may be a manifestation of pain and/or anxiety, but these should not be considered until other, more dangerous etiologies, are evaluated." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Sinus tachycardia can occur at a rate above 150 bpm. Sinus tachycardia does not respond to Adenosine, so it should not be administered, and treatment should be directed at the underlying cause." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Adenosine is contraindicated in patients with history of Wolf-Parkinson-Wh stered, and treatment should be directed at the underlying cause." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Adenosine is contraindicated in patients with history of Wolf-Parkinson-White (WPW) Syndrome and atrial fibrillation, Sick Sinus Syndrome, or heart transplant; or if the patient’s medications include carbamazepine (Tegretol) for seizure disorder. In these patients, adenosine may cause degeneration to a fatal dysrhythmia." }]
    },
    {
      type: "accordion",
      title: "Note 6",
      items: [{ content: "Altered level of consciousness (ALOC) refers to a decreased or depressed level of consciousness compared to the patient’s baseline (secondary to shock or hypoperfusion)." }]
    },
    {
      type: "accordion",
      title: "Note 7",
      items: [{ content: "Patients with atrial fibrillation (or flutter) have abnormal impulses generated by the atria. Adenosine is not effective to slow or terminate the rhythm and, in the presence of Wolf-Parkinson-White (WPW) Syndrome, can cause ventricular fibrillation. Further, these rhythms cause abnormal contraction of the atria that can lead to clot formation. C..." }]
    },
    {
      type: "accordion",
      title: "Note 8",
      items: [{ content: "Regular monomorphic wide complex tachycardia may be suprav ) atrial fibrillation with hemodynamic instability and without other apparent cause." }]
    },
    {
      type: "accordion",
      title: "Note 9",
      items: [{ content: "Regular monomorphic wide complex tachycardia may be supraventricular rhythm with a bundle branch block or aberrancy. In this case, Adenosine may convert the rhythm to sinus and AHA guidelines recommend its use for regular monomorphic wide complex tachycardia. Adenosine should not be used for irregular wide complex tachycardia, because this may r..." }]
    },
    {
      type: "accordion",
      title: "Note 10",
      items: [{ content: "above)." }]
    }
  ]
},
  {
  id: "1214",
  refNo: "TP-1214",
  title: "Pulmonary Edema / CHF",
  category: "Cardiac",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Pulmonary Edema / CHF", subtitle: "TP-1214 • Protocol", icon: "monitor_heart" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for severe respiratory distress unresponsive or not amenable to CPAP."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Maintain patient in position of comfort ❶" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer Oxygen prn (MCG 1302) High flow Oxygen 15 L/min for patients with impending respiratory failure" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "CPAP for all alert patients with moderate or severe respiratory distress, SBP ≥ 90mmHg, and no other contraindications (MCG 1315) ❷" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For associated chest pain and/or suspected cardiac ischemia ❸ Perform 12-lead ECG Aspirin 325mg chewable tablets PO if alert Treat in conjunction with TP 1211, Cardiac Chest Pain" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Establish vascular access (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For SBP > 100 with no sexually enhancing drugs within 48 hours: ❹ Nitroglycerin, 0.4mg SL, for SBP ≥ 100mmHg" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "If wheezing despite CPAP h administration and determine subsequent dose based on SBP as listed above Hold Nitroglycerin if SBP < 100mmHg ❺" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "If wheezing despite CPAP Albuterol 5mg (6mL) via neb May be given simultaneously with nitroglycerin based on clinical assessment of patient If patient reports history of COPD or asthma, treat in conjunction with TP 1237, Respiratory Distress" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For patients who progress to respiratory failure and/or shock Assist ventilations and CONTACT BASE Treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Fowler’s or Semi-Fowler’s positioning is likely to be most comfortable for awake patients with pulmonary edema." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Early use of CPAP has been shown to decrease hospital length of stay and risk of intubation for patients with pulmonary edema. Unless contraindicated, it should be initiated for all patients in moderate or severe respiratory distress from pulmonary edema regardless of SpO 2 . Contraindications: refer to MCG 1315" }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Cardiac ischemia should be suspected in patients complaining of chest pain or with new onset pulmonary edema without history of CHF/Heart failure. CHF is a common cause of ECG abnormalities that do not require transport to or with new onset pulmonary edema without history of CHF/Heart failure. CHF is a common cause of ECG abnormalities that do n..." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "In patients with recent use of sexually enhancing drugs, or systolic murmur and pulmonary edema due to critical aortic stenosis, nitroglycerin may precipitate significant hypotension and cardiovascular collapse. If patient with systolic murmur on exam, consider discussion with Base Physician prior to NTG administration." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Sudden significant decreases in blood pressure may cause stroke symptoms in patients with previously uncontrolled hypertension. If blood pressure decreases > 40mmHg or patient develops neurologic abnormalities (stroke symptoms or ALOC) after nitroglycerin, hold additional doses. Reassess blood pressure after 5 minutes." }]
    }
  ]
},
  {
  id: "1215",
  refNo: "TP-1215",
  title: "Childbirth (Mother)",
  category: "OB",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Childbirth (Mother)", subtitle: "TP-1215 • Protocol", icon: "pregnant_woman" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess the mother’s airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Establish vascular access prn (MCG 1375) Vascular access should not take precedence over controlled delivery or emergency transport" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Place mother in Semi-Fowler’s or Lateral Sims position" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "If mother has the urge to push or crowning is evident, prepare for delivery Prepare OB kit" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "If crown is showing with amniotic sac intact, pinch sac and twist the membrane to rupture" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "If maternal hypertension, breech presentation, shoulder dystocia, or prolapsed or nuchal cord treat in conjunction with TP 1217, Pregnancy Complication" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Once delivered, dry newborn with a towel, clamp and cut the cord ❷ Treat newborn per TP 1216-P, Newborn/Neonate Resuscitation" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For management of the placenta: The placenta may deliver spontaneously; do not pull on cord but allow placenta to separate naturally Place placenta in plastic bag from the OB kit and bring to the hospital with the mother" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Massage the mother’s lower abdomen (fundus) after the placenta delivers For post-partum hemorrhage, tre ring to the hospital with the mother" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Massage the mother’s lower abdomen (fundus) after the placenta delivers For post-partum hemorrhage, treat in conjunction with TP 1217, Pregnancy Complication ❸" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For signs of poor perfusion (MCG 1355) in mother: Normal Saline 1L IV rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops CONTACT BASE for persistent poor perfusion to obtain order for additional Normal Saline 1L IV" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "If delivery occurs in the field, determine destination based on stated or estimated gestational age and CONTACT BASE: ❶ Transport both patients to a Perinatal Center with an EDAP if newborn > 34 weeks gestation Transport both patients to a Perinatal Center with an EDAP and a NICU if ≤34 weeks gestation" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Any delivery after the first trimester (12 weeks) should be considered childbirth for the purposes of this treatment protocol and paramedics should contact Base to discuss the management and transport. In general, delivery prior to 20 weeks gestation is nonviable and does not require resuscitation. However, dates can be incorrectly estimated, th..." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Delay in clamping and cutting the cord for up 30 to 60 seconds is recommended unless newborn needs immediate resuscitation" }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Some bleeding is normal during delivery, typically up to 500mL. Bleeding is reduced with fundal massage after placental delivery, which promotes contraction of the uterus. Post-partum hemorrhage is defined as blood loss with signs of poor perfusion and/or cumulative blood loss ≥1000mL." }]
    }
  ]
},
  {
  id: "1216",
  refNo: "TP-1216",
  title: "Newborn / Neonatal Resuscitation",
  category: "Pediatric",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "child_care",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Newborn / Neonatal Resuscitation", subtitle: "TP-1216 • Protocol", icon: "child_care" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    }
  ]
},
  {
  id: "1217",
  refNo: "TP-1217",
  title: "Pregnancy Complication",
  category: "OB",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Pregnancy Complication", subtitle: "TP-1217 • Protocol", icon: "pregnant_woman" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for vaginal bleeding at > 20 weeks pregnancy or newborn delivery. ❶❷❸"
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Do not delay transport for treatment if suspected eclampsia; Manage delivery en route" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular access (MCG 1375) Vascular access should not take precedence over controlled delivery or emergency transport" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "If crown is showing with amniotic sac intact, pinch sac and twist the membrane to rupture BREECH DELIVERY" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Support presenting part and allow newborn to deliver" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "If head does not deliver, place gloved hand inside mother and form “V” formed with fingers by baby’s face to provide an opening for the airway PROLAPSED CORD" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Manually elevate presenting fetal part off the umbilical cord; maintain elevation of the presenting part until transfer of care❹" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Wrap cord with moist gauze NUCHAL ting fetal part off the umbilical cord; maintain elevation of the presenting part until transfer of care❹" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Wrap cord with moist gauze NUCHAL CORD" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "If nuchal cord is loose attempt slipping the cord over the head prior to delivery" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "If the cord is too tight to easily slip over the head, clamp the cord in two places 1 inch apart and cut the cord with scissors SHOULDER DYSTOCIA" }]
    },
    {
      type: "list",
      title: "Step 13",
      items: [{ content: "Perform McRoberts maneuver with suprapubic pressure in order to deliver the anterior shoulder ❺" }]
    },
    {
      type: "list",
      title: "Step 14",
      items: [{ content: "Place mother in left lateral decubitus position" }]
    },
    {
      type: "list",
      title: "Step 15",
      items: [{ content: "For seizure, treat in conjunction with TP 1231, Seizure POST-PARTUM HEMORRHAGE ❼" }]
    },
    {
      type: "list",
      title: "Step 18",
      items: [{ content: "Massage the mother’s lower abdomen (fundal massage)" }]
    },
    {
      type: "list",
      title: "Step 19",
      items: [{ content: "Establish 2 IVs, large bore catheter (16g or 18g) preferred" }]
    },
    {
      type: "list",
      title: "Step 20",
      items: [{ content: "Administer Normal Saline 1L IV rapid infusion Repeat x1 for ongoing hemorrhage and/or poor perfusion Reassess after each 250mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops" }]
    },
    {
      type: "list",
      title: "Step 21",
      items: [{ content: "For patients within 3 hours post delivery with ongoing bleeding and one or more of the following: Systolic blood pressure (SBP) <90 mmHg, O ps" }]
    },
    {
      type: "list",
      title: "Step 21",
      items: [{ content: "For patients within 3 hours post delivery with ongoing bleeding and one or more of the following: Systolic blood pressure (SBP) <90 mmHg, OR Heart rate > SBP, OR Estimated blood loss >500mL Tranexamic Acid (TXA) 1 gram in 50 or 100mL Normal Saline IV/IO, infuse over 10 minutes" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "This protocol was intended for complications of pregnancy at the time of delivery; if patient is known to be pregnant and has complaints not associated with labor or delivery treat per TP 1202, General Medical or most applicable protocol." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "If the patient has vaginal bleeding associated with known pregnancy > 20 weeks, Contact Base and communicate signs and symptoms so that the receiving hospital can pre-notify OB consultants as needed." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Any delivery after the first trimester (12 weeks) should be considered childbirth for the purposes of this treatment protocol and paramedics should contact Base to discuss the management and transport. In general, delivery prior to 20 weeks gestation is nonviable and does not require resuscitation. However, dates can be incorrectly estimated, th..." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "In addition to manually elevating the presenting part from the umbilical cord, placing the patient in Trendelenburg position during transport can help to elevate the presenting part off the cord to maintain blood flow to the fetus. Do not attempt to push a prolapsed cord back in." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Shoulder dystocia is inability to deliver the anterior shoulder, which usually occurs in large newborns. If delivery fails to progress after head delivers, hyperflex mother’s hips tightly in knee to chest position (McRoberts maneuver) and apply firm suprapubic pressure in attempt to dislodge anterior shoulder." }]
    },
    {
      type: "accordion",
      title: "Note 6",
      items: [{ content: "HTN in a pregnant or recently post-partum patient is a sign of pre-eclampsia, which required immediate emergency and obstetric care. Additional signs of pre-eclampsia are edema and headache which can progress to seizures (eclampsia). Patients who are ≥ 20 weeks pregnant or ≤ 6 weeks post-partum with hypertension (BP ≥ 140/90mmHg) should be trans..." }]
    },
    {
      type: "accordion",
      title: "Note 7",
      items: [{ content: "Some bleeding is normal during delivery, typically up to 500mL. Bleeding is reduced with fundal massage after placental delivery, which promotes contraction of the uterus. Post-partum hemorrhage is typically defined as blood loss with signs of poor perfusion and/or cumulative blood loss ≥1000mLs, however, if despite fundal massage the estimated ..." }]
    }
  ]
},
  {
  id: "1218",
  refNo: "TP-1218",
  title: "Pregnancy / Labor",
  category: "OB",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Pregnancy / Labor", subtitle: "TP-1218 • Protocol", icon: "pregnant_woman" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Monitor frequency and duration of contractions ❶" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "If delivery is imminent ❷, treat per TP 1215, Childbirth (Mother)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "If breech presentation, shoulder dystocia, nuchal cord or prolapsed cord treat per TP 1215, Childbirth (Mother) in conjunction with TP 1217, Pregnancy Complication" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Opiate and Ketorolac analgesia is contraindicated (MCG 1345)" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "The more frequent the contractions, the closer the patient is to delivery; if the contractions are < 2 minutes apart or last > 60 seconds prepare for delivery. Women who have had prior vaginal deliveries can progress through labor very rapidly." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Crowning, urge to push, or presentation of a presenting part indicate imminent delivery." }]
    }
  ]
},
  {
  id: "1219",
  refNo: "TP-1219",
  title: "Allergy",
  category: "Environmental",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "wb_sunny",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Allergy", subtitle: "TP-1219 • Protocol", icon: "wb_sunny" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for anaphylaxis."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302) Continually assess patient’s airway and ventilation status" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302) High flow Oxygen 15 L/min for anaphylaxis with poor perfusion or airway compromise" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring prn (MCG 1308)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For anaphylaxis: Epinephrine (1mg/mL) administer 0.5mg (0.5mL) IM in the lateral thigh ❶ CONTACT BASE: Repeat as above every 10 min x2 prn persistent symptoms, maximum total 3 doses" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Establish vascular access prn (MCG 1375) Vascular access for all patients with anaphylaxis" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops." }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For persistent poor perfusion after initial 250 mL Normal Saline (anaphylactic shock): Continue Normal Saline 1L IV rapid infusion Push-dose Epinephrine – mix 9mL Normal Saline with 1mL Epinephrine (0.1mg/mL) IV formulation in a 10mL syringe; administer Push-dose Epinephrine (0.01mg/mL) 1mL IV/IO every 1-5 minutes as needed to maintain SBP > 90mmHg mg/mL) IV formulation in a 10mL syringe; admin..." }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "If wheezing: ❷ Albuterol 5mg (6mL) via neb or 4 puffs via MDI Repeat x2 prn, maximum total prior to Base contact 3 doses" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For itching/hives: Diphenhydramine 50mg (1mL) slow IV push one time ❸ If unable to obtain venous access, Diphenhydramine 50mg (1mL) deep IM" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Epinephrine is the drug of choice for allergic reactions with any one of the following: angioedema, respiratory compromise or poor perfusion. It should be given IM into a large muscle group, lateral thigh preferred or alternatively the lateral gluteus." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Patients with wheezing due to allergic reaction should be treated with Epinephrine IM. Albuterol may be administered in addition to Epinephrine IM if wheezing persists." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Diphenhydramine does not treat anaphylaxis. For patients in anaphylaxis, Epinephrine administration is the first priority. Diphenhydramine may be considered once other treatments are complete or in stabl s in anaphylaxis, Epinephrine administration is the first priority. Diphenhydramine may be considered once other treatments are complete or in ..." }]
    }
  ]
},
  {
  id: "1220",
  refNo: "TP-1220",
  title: "Burns",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "local_fire_department",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Burns", subtitle: "TP-1220 • Protocol", icon: "local_fire_department" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for burns meeting Trauma Center criteria, 2 nd or 3 rd degree burns ≥ 20% TBSA."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302) If evidence of inhalation injury, treat in conjunction with TP 1236, Inhalation Injury" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302) If carbon monoxide exposure suspected, provide high flow Oxygen 15 L/min and treat in conjunction with TP 1238, Carbon Monoxide Poisoning ❶" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Assess for signs of trauma If traumatic injury suspected, treat in conjunction with TP 1244, Traumatic Injury" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Remove jewelry and clothing from involved area" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Apply blanket to keep patient warm" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For ELECTRICAL burns: Cover with dry dressing or sheet, treat in conjunction with TP 1221, Electrocution" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For THERMAL burns: Cover with dry dressing or sheet Consider cooling with water for burns isolated to less than 5% BSA" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For CHEMICAL burns: If dry, brush and flush with copious amounts of water If liquid, flush with large amounts of water ❷ If eye involvement, irrigate eye with Normal Saline 1L during transport; allow patient to remove contact lenses if possible, treat in conjunction with TP 1240, HAZMAT" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "E ate eye with Normal Saline 1L during transport; allow patient to remove contact lenses if possible, treat in conjunction with TP 1240, HAZMAT" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Establish vascular access prn (MCG 1375) For IO placement in alert patients administer, Lidocaine 2% 40mg (20mg/mL) slow IO push, may repeat once for infusion pain at half initial dose" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For partial/full thickness burn > 10% body surface area or poor perfusion (MCG 1355): Normal Saline 1L IV/IO rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops CONTACT BASE for persistent poor perfusion to obtain order for additional Normal Saline 1L IV/IO" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "Elevate burned extremities as able for comfort" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "For pain management: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Consider potential for carbon monoxide and/or cyanide toxicity in closed space fires. Pulse oximetry is not accurate in carbon monoxide poisoning (TP 1238, Carbon Monoxide Poisoning)" }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Observe for hypothermia; cooling large surface area burns (greater than 10% body surface area) may result in hypothermia." }]
    }
  ]
},
  {
  id: "1221",
  refNo: "TP-1221",
  title: "Electrocution",
  category: "Environmental",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "wb_sunny",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Electrocution", subtitle: "TP-1221 • Protocol", icon: "wb_sunny" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure source of electricity is turned off ❶" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For cardiac arrest, treat per TP 1210 Cardiac Arrest ❷" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) Perform 12-Lead ECG prn If cardiac dysrhythmia present, treat in conjunction with TP 1212, Bradycardia or TP 1213, Tachycardia ❸" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Assess for signs of trauma If traumatic injury suspected, treat in conjunction with TP 1244, Traumatic Injury" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Remove jewelry and clothing from involved areas" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For burns, treat in conjunction with TP 1220, Burns Cover affected areas with dry dressing or sheet ❹" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For pain management: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Do not touch the patient unless you have removed the source of the electricity. An electrical current can be conducted through water and skin. Ensure that area surrounding the patient is dry before approaching him/her." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "For young, healthy patients, especially in lightning injuries, consider prolonged cardio-pulmonary resuscitation." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Electrocution may result in ventricular tachycardia, ventricular fibrillation, asystole or other dysrhythmias. However, if the patient is in a regular rhythm on evaluation, they are unlikely to develop a dysrhythmia." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Superficial skin findings do not correlate with the severity of an electrical burn. As the electrical current passes through tissue, it can cause more damage than is superficially present." }]
    }
  ]
},
  {
  id: "1222",
  refNo: "TP-1222",
  title: "Hyperthermia (Environmental)",
  category: "Environmental",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "wb_sunny",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Hyperthermia (Environmental)", subtitle: "TP-1222 • Protocol", icon: "wb_sunny" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) For patients with dysrhythmias, treat in conjunction with TP 1212, Bradycardia or TP 1213, Tachycardia" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Provide cooling measures ❶" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For patients with fever due to presumed infection/sepsis, treat per TP 1204, Fever/Sepsis ❷" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For altered level of consciousness, treat in conjunction with TP 1229, ALOC" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For adequate perfusion and normal mental status, encourage oral hydration" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For poor perfusion (MCG 1355) or if unable to take fluids orally: Normal Saline 1L IV rapid infusion Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Cooling measure ment Protocol: HYPERTHERMIA (ENVIRONMENTAL) Ref. No. 1222 REVISED:07-01-24 PAGE 2 OF 2 SPECIAL CONSIDERATIONS" }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Cooling measures should include moving patient to a cooler environment (e.g. ambulance with air conditioner), removing clothing, applying wet towels, and fanning/blowing cool air from air conditioning vents." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "This protocol is intended for hyperthermia due to environmental exposures and toxic ingestions." }]
    }
  ]
},
  {
  id: "1223",
  refNo: "TP-1223",
  title: "Hypothermia / Cold Injury",
  category: "Environmental",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "wb_sunny",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Hypothermia / Cold Injury", subtitle: "TP-1223 • Protocol", icon: "wb_sunny" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) For patients with dysrhythmias, treat in conjunction with TP 1212, Bradycardia or TP 1213, Tachycardia" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Provide warming measures ❶" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For frostbite: Handle affected area gently, remove jewelry, cover and protect the area ❷" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For altered level of consciousness, treat in conjunction with TP 1229, ALOC" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV rapid infusion; use warm saline if available Reassess after each 250 mL increment for evidence of volume overload (pulmonary edema); stop infusion if pulmonary edema develops For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For cardiac arrest, treat in conjunction with TP 1210, Cardiac Arrest Initiate rewarming while resuscitation is ongoing ❸" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Warming measures should include moving the patient to a warm environment as quickly as possible, removing wet clothing/items, covering with an emergency/rescue blanket or blanket/sheets, and using warm normal saline if available." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Do not allow an area of frostbite to thaw and then refreeze as this causes more tissue damage." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Follow usual protocols for resuscitation of patients with hypothermic cardiac arrest while rewarming. Patients with hypothermia may have good neurologic outcome despite prolonged resuscitation; resuscitative efforts should continue until the patient is rewarmed. Consultation with the Base Physician is required before consideration of termination..." }]
    }
  ]
},
  {
  id: "1224",
  refNo: "TP-1224",
  title: "Stings / Venomous Bites",
  category: "Environmental",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "wb_sunny",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Stings / Venomous Bites", subtitle: "TP-1224 • Protocol", icon: "wb_sunny" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Prioritize treatment of systemic symptoms For signs or symptoms of allergic reaction, treat in conjunction with TP 1219, Allergy For poor perfusion (MCG 1355), treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Keep patient calm and limit activity Position affected extremity at or below level of the heart" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For SNAKE bites: Splint the affected area Elevate the extremity to the level of the heart" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For INSECT (bee, wasp, ant), spider and scorpion stings: Remove stinger if visualized ❶ Apply cold pack" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For MARINE envenomation (e.g., jelly fish, stingrays and scorpion fish): Remove barb when applicable Soak area in hot water if available ❷" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For continued pain after specific measures above: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Remov ANGELES Treatment Protocol: STINGS / VENOMOUS BITES Ref. No. 1224 REVISED:07-01-24 PAGE 2 OF 2 SPECIAL CONSIDERATIONS" }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Remove stinger by scraping patient's skin with the edge of a flat surface (credit card or similar). Do not attempt to pull the stinger out with fingernails or tweezers, as this may cause release of additional venom." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Do not use vinegar given the type of jellyfish endemic to California." }]
    }
  ]
},
  {
  id: "1225",
  refNo: "TP-1225",
  title: "Submersion",
  category: "Environmental",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "wb_sunny",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Submersion", subtitle: "TP-1225 • Protocol", icon: "wb_sunny" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for ALOC and decompression emergencies (Ref. 518). If decompression emergency suspected, Base Hospital shall contact the Medical Alert Center (Ref. 518)."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "For cardiac arrest, treat per TP 1210, Cardiac Arrest ❶" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer Oxygen prn (MCG 1302) For suspected decompression illness ❷, provide high flow Oxygen 15 L/min and CONTACT BASE" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Maintain supine if suspected decompression illness" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Advanced airway prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Provide warming measures ❸" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For altered level of consciousness, treat in conjunction with TP 1229, Altered Level of Consciousness (ALOC)" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For respiratory distress, treat in conjunction with TP 1237, Respiratory Distress ❹" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For poor perfusion (MCG 1355) or for suspected decompression illness: Normal Saline 1L IV rapid infusion; use warm saline if available Reassess after each 250 mL increment for evidence of worsening respiratory distress and if noted CONTACT BASE to discuss need to continue or hold Normal Saline based on pati mL increment for evidence of worsening respiratory distress and if noted CONTACT BASE to..." }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "Contact Public Health 213-989-7140 for all submersion incidents involving pools or spas after transfer of patient care in the emergency department or upon termination of resuscitation in the field. ❺" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Cardiac arrest from drowning should be treated per TP 1210, Cardiac Arrest. Ventilation is particularly important as the cardiac arrest is almost always due to respiratory failure. In cases of cold water drowning follow usual protocols for resuscitation while simultaneously rewarming the patient. Patients with hypothermia due to cold water drown..." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Decompression illness includes arterial gas embolism from barotrauma and decompression sickness (aka “the b ents with suspected hypothermia." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Decompression illness includes arterial gas embolism from barotrauma and decompression sickness (aka “the bends”) due to dissolved nitrogen in the blood coming out of solution. Decompression illness most frequently occurs in scuba divers after breathing compressed air at depth. While arterial gas embolism presents almost immediately after ascent..." }]
    },
    {
      type: "accordion",
      title: "Note 4",
      items: [{ content: "Warming measures should include moving the patient to a warm environment as quickly as possible, removing wet clothing/items, covering with an emergency/rescue blanket or other blankets/sheets, and using warm Normal Saline if available." }]
    },
    {
      type: "accordion",
      title: "Note 5",
      items: [{ content: "Rales may be present in patients after submersion/drowning due to direct lung injury and/or aspiration of water. This is not an indication of cardiogenic pulmonary edema (such as from congestive heart failure) and does not prohibit administration of IV fluids. IV fluids should be initiated and continued unless respiratory status worsens during a..." }]
    },
    {
      type: "accordion",
      title: "Note 6",
      items: [{ content: "EMS is assisting the Departm of IV fluids. IV fluids should be initiated and continued unless respiratory status worsens during administration." }]
    },
    {
      type: "accordion",
      title: "Note 7",
      items: [{ content: "EMS is assisting the Department of Public Health (DPH) in promptly investigating fatal or nonfatal drownings at public pools or spas in order to ensure safety can be verified before reopening. Contacting the on-call DPH officer will allow timely investigation of these incidents and prevent future incidents." }]
    }
  ]
},
  {
  id: "1226",
  refNo: "TP-1226",
  title: "Toxicologic Emergency",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Toxicologic Emergency", subtitle: "TP-1226 • Protocol", icon: "medical_services" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Consider for significant ingestions or exposures. Contact Poison Control Center as needed."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure scene safety Identify substance(s) involved if possible Decontamination if indicated (remove contaminated clothing, brush off dry chemicals)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For altered level of consciousness, treat in conjunction with TP 1229, ALOC" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) Obtain 12-lead ECG if cardiac symptoms present For dysrhythmias, treat per TP 1212, Bradycardia or TP 1213, Tachycardia" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Check blood glucose For hypoglycemia, treat per TP 1203, Diabetic Emergencies" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For seizures, treat per TP 1231, Seizure" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For opioid overdose with respiratory depression or apnea: Naloxone 2mg intranasal OR 0.4mg IV/IM/IO, may repeat every 2-3 min prn to restore adequate respirations Reassess frequently; repeat doses may be needed" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV/IO rapid infusion Reassess after each 250 mL increment" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "Bring substance containers, pill bottles, or samples to hospital if safe to do so Document time and route of exposure, amount if known" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Scene safety is paramount in toxicologic emergencies. Ensure appropriate PPE and decontamination. Do not enter hazmat scenes without proper training and equipment." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Naloxone administration may precipitate acute withdrawal in opioid-dependent patients. Titrate to restore adequate respirations, not full consciousness. Be prepared for combative behavior." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Poison Control Center (1-800-222-1222) can provide valuable guidance for unusual exposures and treatment recommendations. Consider contacting when clinically appropriate." }]
    }
  ]
},
  {
  id: "1227",
  refNo: "TP-1227",
  title: "Abdominal Pain",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Abdominal Pain", subtitle: "TP-1227 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Obtain focused history OPQRST characteristics of pain Last menstrual period for females of childbearing age Previous abdominal surgeries" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Perform abdominal examination Assess for distension, tenderness, guarding, rigidity Check for signs of peritonitis (rebound tenderness, rigid abdomen)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate cardiac monitoring prn (MCG 1308) Consider 12-lead ECG if age ≥ 35 or cardiac risk factors ❶" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV/IO rapid infusion Reassess after each 250 mL increment For persistent poor perfusion, treat in conjunction with TP 1207, Shock/Hypotension" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For suspected abdominal aortic aneurysm (AAA): Pulsatile abdominal mass, age > 50, tearing/ripping pain Rapid transport Minimize IV fluids unless profound hypotension" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For suspected ectopic pregnancy: Female of childbearing age with abdominal pain and vaginal bleeding Rapid transport if signs of shock" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Assess and document pain (MCG 1345)" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "For pain management: refer to MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 12",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn Treat in conjunction with TP 1205, GI/GU Emergencies if indicated" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Atypical presentations of myocardial infarction may include epigastric or abdominal pain, especially in elderly, diabetic, or female patients. Maintain high index of suspicion and obtain 12-lead ECG when appropriate." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Ruptured abdominal aortic aneurysm is a life-threatening emergency. Classic triad includes abdominal/back pain, pulsatile mass, and hypotension. Avoid aggressive fluid resuscitation which may worsen bleeding." }]
    },
    {
      type: "accordion",
      title: "Note 3",
      items: [{ content: "Any female of childbearing age with abdominal pain should be considered to have a potential ectopic pregnancy until proven otherwise. Ectopic pregnancy can be life-threatening if ruptured." }]
    }
  ]
}
,
  {
  id: "1228",
  refNo: "TP-1228",
  title: "Allergic Reaction / Anaphylaxis",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Allergic Reaction / Anaphylaxis", subtitle: "TP-1228 • Protocol", icon: "medical_services" }]
    },
    {
      type: "alert",
      title: "Critical Intervention",
      content: "Epinephrine is the primary treatment for anaphylaxis and should not be delayed."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302) Assess for signs of airway compromise (stridor, difficulty swallowing, tongue swelling)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For anaphylaxis (severe allergic reaction with respiratory distress, shock, or airway compromise): Epinephrine 0.3mg (0.3mL of 1:1000) IM (lateral thigh) May repeat every 5-15 min prn" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) For dysrhythmias, treat per TP 1212, Bradycardia or TP 1213, Tachycardia" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Establish vascular access (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For wheezing or bronchospasm: Albuterol 2.5mg nebulized, may repeat prn" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Diphenhydramine 25-50mg IV/IM/IO" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For poor perfusion (MCG 1355): Normal Saline 1L IV/IO rapid infusion Reassess after each 250 mL increment" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Epinephrine is the most important medication for anaphylaxis. IM administration in the lateral thigh provides rapid absorption. Do not delay epinephrine for IV access." }]
    }
  ]
},
  {
  id: "1229",
  refNo: "TP-1229",
  title: "Altered Level of Consciousness (ALOC)",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Altered Level of Consciousness (ALOC)", subtitle: "TP-1229 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and initiate basic and/or advanced airway maneuvers prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Assess level of consciousness using AVPU or GCS" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Establish vascular access (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Check blood glucose For blood glucose < 60 mg/dL, treat per TP 1203, Diabetic Emergencies" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "For suspected stroke: Treat per TP 1232, Weakness (Generalized)" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "For suspected opioid overdose: Naloxone 2mg intranasal OR 0.4mg IV/IM" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Use the mnemonic AEIOU-TIPS to consider causes of altered mental status: Alcohol, Epilepsy, Insulin, Opiates, Uremia, Trauma, Infection, Psychiatric, Stroke/Shock." }]
    }
  ]
},
  {
  id: "1230",
  refNo: "TP-1230",
  title: "Nausea and Vomiting",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Nausea and Vomiting", subtitle: "TP-1230 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway Position patient to prevent aspiration Suction prn" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Establish vascular access prn (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For nausea or vomiting: Ondansetron 4mg ODT/IV/IM, may repeat x1 in 15 min prn" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For poor perfusion or dehydration: Normal Saline 1L IV/IO" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Nausea and vomiting can be symptoms of serious underlying conditions including myocardial infarction, increased intracranial pressure, and bowel obstruction." }]
    }
  ]
},
  {
  id: "1231",
  refNo: "TP-1231",
  title: "Seizure",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Seizure", subtitle: "TP-1231 • Protocol", icon: "medical_services" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for status epilepticus and seizures not responding to initial treatment."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure patient safety Protect from injury Do not restrain Remove hazards" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess airway Position for drainage Suction prn" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular access (MCG 1375)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Check blood glucose For hypoglycemia, treat per TP 1203" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For active seizure: Midazolam 5mg IM/IN OR 2mg IV/IO May repeat x1 in 10 min" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Status epilepticus (seizure > 5 min) is a neurologic emergency requiring rapid intervention." }]
    }
  ]
},
  {
  id: "1232",
  refNo: "TP-1232",
  title: "Stroke / CVA / TIA / Weakness",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "neurology",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Stroke / CVA / TIA", subtitle: "TP-1232 • Protocol", icon: "neurology" }]
    },
    {
      type: "section",
      title: "Initial Assessment"
    },
    {
      type: "list",
      title: "Step 1 - Scene Assessment",
      items: [{ content: "Document <b>Last Known Well Time (LKWT)</b> - exact time patient was last seen normal. This is CRITICAL for treatment decisions." }]
    },
    {
      type: "list",
      title: "Step 2 - Stroke Screening (mLAPSS)",
      items: [{ content: "Perform <b>mLAPSS</b> screening. Positive if ALL criteria met:<br>• Age ≥40<br>• No seizure history<br>• Not wheelchair-bound/bedridden at baseline<br>• Glucose 60-400 mg/dL<br>• Unilateral weakness (facial droop OR arm drift OR grip weakness)" }]
    },
    {
      type: "list",
      title: "Step 3 - LAMS Score",
      items: [{ content: "Calculate <b>LAMS (Los Angeles Motor Scale)</b> - Total 0-5 points:<br><br><b>Facial Droop (0-1):</b> Ask patient to smile. 0=Symmetric, 1=Drooping<br><br><b>Arm Drift (0-2):</b> Both arms extended, palms DOWN, eyes CLOSED, hold 10 seconds. 0=No drift, 1=Drifts down, 2=Falls rapidly<br><br><b>Grip Strength (0-2):</b> Squeeze both hands simultaneously. 0=Equal, 1=Weak one side, 2=No grip one side" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Assess airway and breathing - Administer Oxygen prn (MCG 1302)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access (MCG 1375) - avoid affected extremity" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Check blood glucose - For abnormal glucose, treat per TP 1203. Hypoglycemia can mimic stroke." }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Do NOT administer aspirin or other anticoagulants - may worsen hemorrhagic stroke" }]
    },
    {
      type: "section",
      title: "Transport Destination"
    },
    {
      type: "accordion",
      title: "LAMS-Based Routing",
      items: [
        { title: "LAMS ≥4 (Score 4-5)", content: "<b>LVO LIKELY</b> - Large Vessel Occlusion suspected<br>→ Transport to <b>Comprehensive Stroke Center (CSC)</b> if ≤30 min transport<br>→ If >30 min to CSC, go to nearest Primary Stroke Center (PSC)" },
        { title: "LAMS <4 (Score 0-3)", content: "LVO less likely<br>→ Transport to nearest Stroke Center (PSC or CSC)" }
      ]
    },
    {
      type: "warning",
      content: "<b>TIME IS BRAIN:</b> tPA window ≤4.5 hours | Thrombectomy ≤24 hours | There is NO 36-hour window. Minimize scene time. Rapid transport to stroke center."
    },
    {
      type: "section",
      title: "Documentation Requirements"
    },
    {
      type: "list",
      title: "Required Documentation",
      items: [{ content: "• Last Known Well Time (LKWT) - exact time<br>• mLAPSS result (positive/negative)<br>• LAMS score (0-5)<br>• Blood glucose result<br>• Time of symptom recognition<br>• Stroke center notification time" }]
    },
    {
      type: "section",
      title: "Differential Diagnosis"
    },
    {
      type: "accordion",
      title: "Stroke Mimics",
      items: [
        { title: "Hypoglycemia", content: "Check glucose first. Can cause focal neurologic deficits. Treat and reassess." },
        { title: "Seizure (Todd's Paralysis)", content: "Post-ictal weakness can mimic stroke. Ask about seizure history." },
        { title: "Migraine", content: "Hemiplegic migraine can cause focal weakness. Ask about headache history." },
        { title: "Hypertensive Encephalopathy", content: "Severely elevated BP can cause neurologic changes." }
      ]
    },
    {
      type: "accordion",
      title: "Special Situations",
      items: [
        { title: "Wake-Up Stroke", content: "If patient woke with symptoms, LKWT = time last seen normal BEFORE sleep, NOT time of awakening." },
        { title: "TIA (Resolved Symptoms)", content: "Even if symptoms resolved, transport for evaluation. TIA = high risk for stroke within 48 hours." },
        { title: "Negative mLAPSS with High Suspicion", content: "Calculate LAMS anyway. Contact Base Hospital. mLAPSS does NOT rule out stroke." }
      ]
    },
    {
      type: "link-list",
      title: "Cross References",
      items: [
        { title: "Ref. 521 Stroke Patient Destination" },
        { title: "Ref. 522 Primary Stroke Center" },
        { title: "Ref. 523 Comprehensive Stroke Center" },
        { title: "TP-1203 Diabetic Emergencies" },
        { title: "TP-1231 Altered Mental Status" }
      ]
    }
  ]
},
  {
  id: "1233",
  refNo: "TP-1233",
  title: "Headache",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Headache", subtitle: "TP-1233 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Obtain focused history OPQRST characteristics Sudden onset 'worst headache' suggests subarachnoid hemorrhage Associated symptoms: fever, photophobia, neck stiffness, altered mental status" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess vital signs Check for hypertension" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Perform neurologic examination Assess for focal deficits Check pupils" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For altered mental status: Treat per TP 1229, ALOC" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For severe headache with concerning features: Establish vascular access Consider rapid transport" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For pain management: Refer to MCG 1345, Pain Management" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Sudden onset severe headache ('thunderclap headache') may indicate subarachnoid hemorrhage. This requires rapid evaluation and transport." }]
    }
  ]
},
  {
  id: "1234",
  refNo: "TP-1234",
  title: "Syncope / Fainting",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Syncope / Fainting", subtitle: "TP-1234 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Obtain history of event Prodromal symptoms Duration of loss of consciousness Witnessed seizure activity Post-event confusion" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess for trauma secondary to fall" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Obtain orthostatic vital signs if appropriate" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Initiate cardiac monitoring (MCG 1308) Obtain 12-lead ECG" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Check blood glucose" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For dysrhythmia: Treat per TP 1212 or TP 1213" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Syncope can be benign (vasovagal) or life-threatening (cardiac). Cardiac syncope has high mortality risk and requires evaluation." }]
    }
  ]
},
  {
  id: "1235",
  refNo: "TP-1235",
  title: "Dizziness / Vertigo",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Dizziness / Vertigo", subtitle: "TP-1235 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Characterize dizziness Vertigo (room spinning) vs lightheadedness Duration, triggers Associated symptoms" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess vital signs Check orthostatic vitals if appropriate" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Perform neurologic examination Assess for focal deficits" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For suspected stroke: Rapid transport" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For nausea: Ondansetron 4mg ODT/IV/IM" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Differentiate between peripheral vertigo (benign) and central vertigo (stroke). Central causes have associated neurologic deficits." }]
    }
  ]
},
  {
  id: "1236",
  refNo: "TP-1236",
  title: "Overdose / Poisoning",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Overdose / Poisoning", subtitle: "TP-1236 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure scene safety Identify substance if possible" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess airway and breathing" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For altered mental status: Treat per TP 1229, ALOC" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For opioid overdose: Naloxone 2mg intranasal OR 0.4mg IV/IM" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Bring substance containers to hospital" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Contact Poison Control (1-800-222-1222) for guidance on unusual exposures." }]
    }
  ]
},
  {
  id: "1237",
  refNo: "TP-1237",
  title: "Respiratory Distress (General)",
  category: "Respiratory",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "air",
  color: "cyan",
  sections: [
    {
      type: "header",
      items: [{ title: "Respiratory Distress (General)", subtitle: "TP-1237 • Protocol", icon: "air" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess airway and breathing Work of breathing, accessory muscle use Breath sounds" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen to maintain SpO2 ≥ 94%" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Position of comfort (usually upright)" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For wheezing: Treat per TP 1210, Asthma/COPD/Reactive Airway" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For pulmonary edema: Treat per TP 1214, Pulmonary Edema" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Identify and treat specific cause of respiratory distress. Consider asthma, COPD, CHF, pneumonia, pulmonary embolism, pneumothorax." }]
    }
  ]
},
  {
  id: "1238",
  refNo: "TP-1238",
  title: "Pain Management Protocol",
  category: "Medical",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Pain Management Protocol", subtitle: "TP-1238 • Protocol", icon: "medical_services" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess and document pain Numeric pain scale (0-10) Location, quality, radiation" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Provide non-pharmacologic interventions Splinting, positioning, ice/heat" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For mild to moderate pain: Refer to MCG 1345, Pain Management" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Reassess pain after interventions" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Pain management is an essential component of quality prehospital care. Document pain scores before and after interventions." }]
    }
  ]
},
  {
  id: "1239",
  refNo: "TP-1239",
  title: "Hypertensive Emergency",
  category: "Cardiac",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Hypertensive Emergency", subtitle: "TP-1239 • Protocol", icon: "monitor_heart" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for suspected hypertensive emergency with end-organ damage."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess for end-organ damage Chest pain, dyspnea, pulmonary edema Altered mental status, seizures Acute vision changes" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer Oxygen prn" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Initiate cardiac monitoring Obtain 12-lead ECG" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For pulmonary edema: Treat per TP 1214" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "CONTACT BASE for blood pressure management orders" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Hypertensive emergency is defined as severely elevated BP with acute end-organ damage. Do not aggressively lower BP without base hospital contact." }]
    }
  ]
},
  {
  id: "1240",
  refNo: "TP-1240",
  title: "Multi-System Trauma",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Multi-System Trauma", subtitle: "TP-1240 • Protocol", icon: "healing" }]
    },
    {
      type: "alert",
      title: "Time-Critical Intervention",
      content: "Rapid assessment, treatment of life-threats, and transport to trauma center."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Scene safety and mechanism of injury Assessment for hazards Number of patients, need for resources" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Primary survey MARCH protocol (Massive hemorrhage, Airway, Respirations, Circulation, Hypothermia prevention)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Control life-threatening hemorrhage (MCG 1370) Apply tourniquets prn Direct pressure, hemostatic dressings" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Airway management with spinal precautions" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Administer Oxygen prn" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Assess breathing Chest rise, breath sounds Treat tension pneumothorax if present" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Initiate cardiac monitoring" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Establish vascular access Large bore IV (14-16g) preferred" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "For shock or poor perfusion: Normal Saline 1L IV/IO rapid infusion Reassess after each 250mL Permissive hypotension (SBP 80-90) acceptable" }]
    },
    {
      type: "list",
      title: "Step 10",
      items: [{ content: "Prevent hypothermia Remove wet clothing Warm blankets Increase ambient temperature" }]
    },
    {
      type: "list",
      title: "Step 11",
      items: [{ content: "Rapid transport to trauma center Minimize on-scene time Trauma activation" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "The golden hour concept emphasizes rapid assessment, treatment of life threats, and transport. Minimize on-scene time to < 10 minutes when possible." }]
    },
    {
      type: "accordion",
      title: "Note 2",
      items: [{ content: "Permissive hypotension (SBP 80-90 mmHg) is acceptable in trauma patients with hemorrhagic shock prior to surgical control of bleeding. Avoid overresuscitation." }]
    }
  ]
}
,
  {
  id: "1241",
  refNo: "TP-1241",
  title: "Burns (Thermal / Chemical)",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Burns (Thermal / Chemical)", subtitle: "TP-1241 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure scene safety Remove patient from heat source Stop burning process (remove clothing, brush off dry chemicals)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess airway for thermal injury Signs: singed facial/nasal hair, carbonaceous sputum, facial burns Consider early intubation for airway burns" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer 100% Oxygen" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Assess burn severity Total body surface area (TBSA) using Rule of Nines Depth: superficial, partial thickness, full thickness" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Cover burns with dry sterile dressings Do not apply ice or ointments" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Establish vascular access for significant burns (>10% TBSA)" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Fluid resuscitation for significant burns: Normal Saline IV based on Parkland formula guidance" }]
    },
    {
      type: "list",
      title: "Step 8",
      items: [{ content: "Prevent hypothermia Remove wet dressings Warm environment" }]
    },
    {
      type: "list",
      title: "Step 9",
      items: [{ content: "Transport to burn center if indicated Partial thickness >10% TBSA, full thickness burns, burns to face/hands/feet/genitalia, circumferential burns, electrical/chemical burns, inhalation injury" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Inhalation injury significantly increases mortality. Look for signs of airway thermal injury and consider early definitive airway management." }]
    }
  ]
},
  {
  id: "1242",
  refNo: "TP-1242",
  title: "Pregnancy / Childbirth / OB Emergencies",
  category: "OB/GYN",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Pregnancy / Childbirth / OB Emergencies", subtitle: "TP-1242 • Protocol", icon: "pregnant_woman" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Determine gestational age Weeks of pregnancy, expected due date Last menstrual period" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess for imminent delivery Crowning, urge to push, contractions every 2-3 minutes" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For imminent delivery: Prepare for field delivery Position patient, prepare OB kit Support head, suction infant Clamp and cut cord, deliver placenta" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For vaginal bleeding: Assess amount and character Do NOT perform internal examination Place pad, count saturated pads Establish vascular access, fluid resuscitation prn" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For seizure in pregnancy (eclampsia): Protect patient from injury Administer Oxygen Left lateral position Magnesium sulfate per local protocol" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For trauma in pregnancy: Left lateral tilt to relieve aorto-caval compression Fetal monitoring if available" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Pregnancy causes physiologic changes that affect assessment. Pregnant patients can lose significant blood volume before showing signs of shock." }]
    }
  ]
},
  {
  id: "1243",
  refNo: "TP-1243",
  title: "Pediatric Medical Emergency",
  category: "Pediatric",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "child_care",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Pediatric Medical Emergency", subtitle: "TP-1243 • Protocol", icon: "child_care" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Pediatric assessment triangle (PAT) Appearance, Work of breathing, Circulation to skin" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Weight-based dosing Use length-based tape or estimated weight Age-appropriate equipment" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Assess and manage airway Position of comfort for conscious patients Supplemental oxygen as needed" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Treat per appropriate adult protocol with pediatric modifications" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Pediatric vital signs vary by age. Use age-appropriate normal ranges for assessment." }]
    }
  ]
},
  {
  id: "1244",
  refNo: "TP-1244",
  title: "Extremity Trauma",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Extremity Trauma", subtitle: "TP-1244 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess neurovascular status Pulses, motor, sensory distal to injury Document before and after interventions" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Control hemorrhage Direct pressure Tourniquet if life-threatening bleeding" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Splint fractures and dislocations Splint in position found unless neurovascular compromise Immobilize joint above and below injury" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Reassess neurovascular status after splinting" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For pain management: Refer to MCG 1345" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Document neurovascular exam (pulses, motor, sensory) before and after any manipulation or splinting." }]
    }
  ]
},
  {
  id: "1245",
  refNo: "TP-1245",
  title: "Soft Tissue Injury",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Soft Tissue Injury", subtitle: "TP-1245 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess wound characteristics Location, size, depth Contamination, foreign bodies" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Control hemorrhage Direct pressure Hemostatic dressings if needed" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Cover wound with sterile dressing Occlusive dressing for sucking chest wounds Moist dressing for evisceration" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For impaled objects: Stabilize object in place Do NOT remove" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Do not remove impaled objects in the field. Stabilize in place and transport." }]
    }
  ]
},
  {
  id: "1246",
  refNo: "TP-1246",
  title: "Head Injury / TBI",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Head Injury / TBI", subtitle: "TP-1246 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess level of consciousness GCS score Pupil size and reactivity" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess airway and breathing Maintain SpO2 ≥ 94% Avoid hypoxia and hyperventilation" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Spinal motion restriction per protocol" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Elevate head of bed 30 degrees if no spinal injury" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Avoid hypotension Maintain SBP ≥ 110 mmHg (age 50-69) or ≥ 120 mmHg (age 15-49, >70)" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For signs of herniation (dilated pupil, posturing): Hyperventilate to EtCO2 30-35 mmHg CONTACT BASE" }]
    },
    {
      type: "list",
      title: "Step 7",
      items: [{ content: "Rapid transport to trauma center with neurosurgical capability" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Avoid hypoxia and hypotension - these secondary insults worsen TBI outcomes. Maintain oxygenation and perfusion." }]
    }
  ]
},
  {
  id: "1247",
  refNo: "TP-1247",
  title: "Spinal Injury / Spinal Motion Restriction",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Spinal Injury / Spinal Motion Restriction", subtitle: "TP-1247 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Indications for Spinal Motion Restriction"
    },
    {
      type: "list",
      title: "Criteria",
      items: [{ content: "Blunt trauma with: Altered mental status, Spinal pain or tenderness, Neurologic deficit, Anatomic deformity, High-risk mechanism with intoxication or distracting injury" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Manual inline stabilization" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Apply cervical collar if indicated" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Secure to backboard or scoop stretcher Pad voids Secure torso then head" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Reassess neurologic statusDocument motor and sensory function" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Selective spinal immobilization based on clinical criteria reduces unnecessary immobilization while maintaining safety for at-risk patients." }]
    }
  ]
},
  {
  id: "1248",
  refNo: "TP-1248",
  title: "Chest Trauma",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Chest Trauma", subtitle: "TP-1248 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess breathing Breath sounds bilaterally Chest rise, respiratory rate Work of breathing" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Administer high-flow Oxygen" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For open chest wound (sucking chest wound): Apply occlusive dressing taped on 3 sides Monitor for tension pneumothorax" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For tension pneumothorax: Absent breath sounds, tracheal deviation, hypotension, JVD Needle decompression 2nd intercostal space, midclavicular line OR 5th intercostal space, anterior axillary line" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For flail chest: Support with bulky dressing Pain management Position on injured side if possible" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Initiate cardiac monitoring" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Tension pneumothorax is a life-threatening condition requiring immediate needle decompression. Classic signs may not all be present." }]
    }
  ]
},
  {
  id: "1249",
  refNo: "TP-1249",
  title: "Abdominal Trauma",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Abdominal Trauma", subtitle: "TP-1249 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess abdomen Distension, rigidity, guarding Ecchymosis, seat belt sign" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "For evisceration: Cover with moist sterile dressing Do NOT replace organs" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For impaled object: Stabilize in place Do NOT remove" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular access" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For shock: Fluid resuscitation Permissive hypotension acceptable" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Rapid transport to trauma center" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Significant intra-abdominal bleeding can occur without external signs of trauma. Maintain high index of suspicion based on mechanism." }]
    }
  ]
},
  {
  id: "1250",
  refNo: "TP-1250",
  title: "Pelvic Trauma",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Pelvic Trauma", subtitle: "TP-1250 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess for pelvic injury Mechanism of injury Pelvic pain or instability DO NOT rock or compress pelvis" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "For suspected pelvic fracture: Apply pelvic binder Commercial device or sheet Wrap around greater trochanters Minimize patient movement" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Establish large bore vascular access" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For hemorrhagic shock: Aggressive fluid resuscitation Normal Saline IV boluses" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Rapid transport to trauma center Activation for unstable pelvic fracture" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Pelvic fractures can cause massive internal hemorrhage. Early pelvic binding and rapid transport are critical." }]
    }
  ]
},
  {
  id: "1251",
  refNo: "TP-1251",
  title: "Eye Injury",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Eye Injury", subtitle: "TP-1251 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess visual acuity if possible" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "For chemical exposure: Immediate copious irrigation with normal saline Continue irrigation during transport" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For impaled object: Stabilize object DO NOT remove Cover both eyes to prevent consensual movement" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For globe rupture: Protective shield over eye DO NOT apply pressure Cover both eyes" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Chemical burns to the eye require immediate and continuous irrigation. Do not delay for transport." }]
    }
  ]
},
  {
  id: "1252",
  refNo: "TP-1252",
  title: "Facial Trauma",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Facial Trauma", subtitle: "TP-1252 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess and maintain airway Suction blood and secretions Consider early advanced airway for severe injuries" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Control hemorrhage Direct pressure Avoid nasal packing for basilar skull fracture" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Assess for associated injuries Eye injury, cervical spine injury, brain injury" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Position patient to allow drainage if no C-spine injury" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Facial trauma is often associated with airway compromise and cervical spine injury. Maintain high index of suspicion." }]
    }
  ]
},
  {
  id: "1253",
  refNo: "TP-1253",
  title: "Penetrating Trauma",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Penetrating Trauma", subtitle: "TP-1253 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure scene safety Law enforcement clearance for violent scenes" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Identify all wounds Entry and exit wounds Document number and location" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Control hemorrhage Direct pressure, hemostatic dressings Tourniquets for extremity hemorrhage" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For impaled objects: Stabilize in place DO NOT remove" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Treat per TP 1240, Multi-System Trauma" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Rapid transport to trauma center Minimize on-scene time" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Penetrating trauma to chest, abdomen, pelvis, or neck requires rapid transport to trauma center for surgical evaluation." }]
    }
  ]
},
  {
  id: "1254",
  refNo: "TP-1254",
  title: "Crush Injury / Compartment Syndrome",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Crush Injury / Compartment Syndrome", subtitle: "TP-1254 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Assess for crush injury Duration of compression Mechanism and weight" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "For prolonged crush (>4 hours): Establish vascular access BEFORE releasing pressure Aggressive fluid resuscitation Normal Saline 1-2L IV bolus" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Monitor for crush syndrome Hyperkalemia, rhabdomyolysis Cardiac dysrhythmias" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For compartment syndrome: Pain out of proportion Tense, swollen compartment Pain with passive stretch Rapid transport for fasciotomy" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Crush syndrome can cause life-threatening hyperkalemia and cardiac arrest when pressure is released. Establish IV and fluid resuscitation BEFORE releasing prolonged crush." }]
    }
  ]
},
  {
  id: "1255",
  refNo: "TP-1255",
  title: "Amputation",
  category: "Trauma",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "healing",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Amputation", subtitle: "TP-1255 • Protocol", icon: "healing" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Control hemorrhage from stump Direct pressure Tourniquet if direct pressure ineffective" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Cover stump with sterile dressing Moist saline dressing" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Care for amputated part Rinse with saline to remove gross debris Wrap in moist saline gauze Place in plastic bag Place bag on ice DO NOT place part directly on ice DO NOT immerse in fluid" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Transport amputated part with patient" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Treat for shock as needed" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "All amputated parts should be transported with the patient for potential reimplantation. Clean amputations of digits and distal extremities have best reimplantation success." }]
    }
  ]
},
  {
  id: "1256",
  refNo: "TP-1256",
  title: "Mass Casualty Incident",
  category: "Disaster",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "emergency",
  color: "amber",
  sections: [
    {
      type: "header",
      items: [{ title: "Mass Casualty Incident", subtitle: "TP-1256 • Protocol", icon: "emergency" }]
    },
    {
      type: "section",
      title: "Overview"
    },
    {
      type: "list",
      title: "Definition",
      items: [{ content: "MCI occurs when number of patients exceeds available resources. Requires triage and resource allocation." }]
    },
    {
      type: "section",
      title: "Response Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Declare MCI Request additional resources Establish incident command" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Perform triage START triage (Simple Triage and Rapid Treatment) or local protocol Tag patients: Red (immediate), Yellow (delayed), Green (minor), Black (deceased/expectant)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Establish treatment areas Separate by triage category" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Transport patients in order of priority RED patients first" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "In MCI, goal is greatest good for greatest number. This may require difficult decisions about resource allocation." }]
    }
  ]
},
  {
  id: "1257",
  refNo: "TP-1257",
  title: "HAZMAT / WMD Exposure",
  category: "Disaster",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "emergency",
  color: "amber",
  sections: [
    {
      type: "header",
      items: [{ title: "HAZMAT / WMD Exposure", subtitle: "TP-1257 • Protocol", icon: "emergency" }]
    },
    {
      type: "alert",
      title: "Scene Safety",
      content: "DO NOT enter contaminated area without proper training and PPE. Stage upwind and uphill."
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure personal safety Proper PPE Stage in safe zone" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Patients must be decontaminated before treatment Remove contaminated clothing Brush off dry substances Irrigate with water" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Treat per appropriate protocol after decontamination" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For specific exposures: Contact CHEMTREC or Poison Control Nerve agents: Antidote kit (atropine, pralidoxime) per protocol" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Provider safety is paramount. Do not become a casualty. Proper training, PPE, and decontamination are essential." }]
    }
  ]
},
  {
  id: "1258",
  refNo: "TP-1258",
  title: "Bariatric Patient Care",
  category: "General",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "groups",
  color: "teal",
  sections: [
    {
      type: "header",
      items: [{ title: "Bariatric Patient Care", subtitle: "TP-1258 • Protocol", icon: "groups" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Request appropriate resources Early request for lift assist, bariatric equipment Specialized stretchers, ramps" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Airway management challenges Proper positioning for airway Consider ramping (towels under shoulders/head)" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Vascular access challenges Consider IO access if IV difficult Ultrasound guidance if available" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Medication dosing Some medications require weight-based dosing adjustments Consult protocols or base hospital" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Bariatric patients present unique challenges for airway management, vascular access, and patient movement. Early planning and appropriate resources are essential." }]
    }
  ]
},
  {
  id: "1259",
  refNo: "TP-1259",
  title: "Hospice / End of Life Care",
  category: "General",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "groups",
  color: "teal",
  sections: [
    {
      type: "header",
      items: [{ title: "Hospice / End of Life Care", subtitle: "TP-1259 • Protocol", icon: "groups" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Verify hospice enrollment and orders Review DNR/POLST/MOLST orders Contact hospice agency if questions" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "For patient comfort issues: Provide comfort measures per hospice plan Contact hospice nurse for guidance" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For acute changes requiring hospital evaluation: Transport may be appropriate if consistent with goals of care Discuss with family and hospice" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Provide family support Compassionate communication Resource information" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Hospice patients have chosen comfort-focused care. Respect patient wishes and advance directives. Not all 911 calls require transport." }]
    }
  ]
},
  {
  id: "1260",
  refNo: "TP-1260",
  title: "Restraint (Physical / Chemical)",
  category: "Behavioral",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "psychology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Restraint (Physical / Chemical)", subtitle: "TP-1260 • Protocol", icon: "psychology" }]
    },
    {
      type: "alert",
      title: "Base Hospital Contact",
      content: "Required for chemical restraint orders."
    },
    {
      type: "section",
      title: "Indications"
    },
    {
      type: "list",
      title: "Criteria",
      items: [{ content: "Patient poses immediate threat to self or others Violent, combative behavior Only after verbal de-escalation attempted" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Ensure adequate personnel Law enforcement assistance as needed Minimum 5 people for safe restraint" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Apply physical restraints Supine position (never prone) 4-point soft restraints One person controls head" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Monitor airway and breathing continuously Never restrain in prone position Assess for positional asphyxia" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For chemical restraint: CONTACT BASE for orders Midazolam or Haloperidol per protocol Monitor vital signs and airway continuously" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Restraint-related deaths can occur from positional asphyxia. Never restrain in prone position. Continuous monitoring is essential." }]
    }
  ]
},
  {
  id: "1261",
  refNo: "TP-1261",
  title: "Neonatal Resuscitation",
  category: "Pediatric",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "child_care",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Neonatal Resuscitation", subtitle: "TP-1261 • Protocol", icon: "child_care" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Initial steps Dry and warm infant Stimulate Position airway Suction if needed" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Assess: Breathing and heart rate" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For apnea or gasping or HR < 100: PPV with bag-mask Ventilate at 40-60 breaths/min" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For HR < 60 despite adequate ventilation: Chest compressions 3:1 ratio (3 compressions: 1 ventilation) Rate: 120 events/minute (90 compressions, 30 breaths)" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For HR < 60 despite compressions and ventilation: Epinephrine 0.01-0.03 mg/kg IV/IO (0.1-0.3 mL/kg of 1:10,000)" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Effective ventilation is the most important step in neonatal resuscitation. Most neonates respond to PPV alone." }]
    }
  ]
},
  {
  id: "1262",
  refNo: "TP-1262",
  title: "Pediatric Cardiac Arrest",
  category: "Pediatric",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "child_care",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Pediatric Cardiac Arrest", subtitle: "TP-1262 • Protocol", icon: "child_care" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Begin high-quality CPR 100-120 compressions/min Compress 1/3 depth of chest 2-finger technique (infant), 1 or 2 hands (child)" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Attach AED/monitor Use pediatric pads/attenuator if age < 8 years Analyze rhythm" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "For VF/pVT: Defibrillate 2 J/kg, then 4 J/kg Resume CPR immediately" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Establish vascular or IO access" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Epinephrine 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000) Repeat every 3-5 min" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "For VF/pVT: Amiodarone 5 mg/kg IV/IO after 2nd shock" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Most pediatric arrests are respiratory in origin. High-quality CPR and effective ventilation are critical." }]
    }
  ]
},
  {
  id: "1263",
  refNo: "TP-1263",
  title: "Pediatric Respiratory Failure",
  category: "Pediatric",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "child_care",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Pediatric Respiratory Failure", subtitle: "TP-1263 • Protocol", icon: "child_care" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Recognize respiratory failure Signs: Severe increased work of breathing, altered mental status, poor air movement, cyanosis" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Position of comfort Do not agitate child" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Administer high-flow oxygen" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "For upper airway obstruction (croup, epiglottitis): Keep child calm Do NOT examine throat Position of comfort Humidified oxygen" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "For lower airway disease (asthma, bronchiolitis): Albuterol nebulizer Treat per respiratory protocol" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Prepare for assisted ventilation if respiratory failure progresses" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Children can compensate for respiratory distress until sudden decompensation. Early recognition and intervention are critical." }]
    }
  ]
},
  {
  id: "1264",
  refNo: "TP-1264",
  title: "Pediatric Trauma",
  category: "Pediatric",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "child_care",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Pediatric Trauma", subtitle: "TP-1264 • Protocol", icon: "child_care" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Pediatric trauma assessment Mechanism of injury Pediatric-specific injury patterns" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Airway with C-spine protection Pediatric airway anatomy differences" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Control hemorrhage Tourniquets sized appropriately" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Vascular access IO access if IV unsuccessful Weight-based fluid resuscitation" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Prevent hypothermia Children lose heat rapidly" }]
    },
    {
      type: "list",
      title: "Step 6",
      items: [{ content: "Transport to pediatric trauma center if available" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Children can maintain vital signs until sudden cardiovascular collapse. Early intervention is critical." }]
    }
  ]
},
  {
  id: "1265",
  refNo: "TP-1265",
  title: "Geriatric Patient Assessment",
  category: "General",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "groups",
  color: "teal",
  sections: [
    {
      type: "header",
      items: [{ title: "Geriatric Patient Assessment", subtitle: "TP-1265 • Protocol", icon: "groups" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "list",
      title: "Assessment",
      items: [{ content: "Atypical presentations of common diseases MI without chest pain, infection without fever Falls may indicate serious underlying condition" }]
    },
    {
      type: "list",
      title: "Medications",
      items: [{ content: "Polypharmacy common Review medication list Drug interactions" }]
    },
    {
      type: "list",
      title: "Baseline Function",
      items: [{ content: "Determine baseline mental and functional status Changes from baseline are significant" }]
    },
    {
      type: "list",
      title: "Communication",
      items: [{ content: "Speak clearly, allow time for responses Hearing and vision impairment common" }]
    },
    {
      type: "list",
      title: "Advanced Directives",
      items: [{ content: "Review DNR/POLST/MOLST Discuss with patient and family" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Treat per appropriate protocol with modifications for age-related changes" }]
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Geriatric patients often present atypically and have reduced physiologic reserve. Maintain high index of suspicion." }]
    }
  ]
},
  {
  id: "1266",
  refNo: "TP-1266",
  title: "Interfacility Transfer",
  category: "Disaster",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "local_hospital",
  color: "blue-grey",
  sections: [
    {
      type: "header",
      items: [{ title: "Interfacility Transfer", subtitle: "TP-1266 • Protocol", icon: "local_hospital" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Obtain complete report from transferring facility Patient history, diagnosis Current vital signs, medications, treatments Reason for transfer" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Review transfer orders Medication orders Monitoring requirements Interventions authorized" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Assess patient Perform appropriate assessment Verify all equipment functioning" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Bring all medical records and imaging" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Monitor patient continuously Report changes to receiving facility" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Interfacility transfers require appropriate level of care during transport. Ensure crew capabilities match patient needs." }]
    }
  ]
},
  {
  id: "1267",
  refNo: "TP-1267",
  title: "Airway Management (Advanced)",
  category: "Procedures",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "build",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Airway Management (Advanced)", subtitle: "TP-1267 • Protocol", icon: "build" }]
    },
    {
      type: "section",
      title: "Indications for Advanced Airway"
    },
    {
      type: "list",
      title: "Criteria",
      items: [{ content: "Inability to maintain airway with basic maneuvers Respiratory failure requiring ventilatory support Decreased level of consciousness with inability to protect airway (GCS ≤ 8)" }]
    },
    {
      type: "section",
      title: "Treatment Steps"
    },
    {
      type: "list",
      title: "Step 1",
      items: [{ content: "Pre-oxygenate 100% oxygen for 3-5 minutes" }]
    },
    {
      type: "list",
      title: "Step 2",
      items: [{ content: "Consider video laryngoscopy if available" }]
    },
    {
      type: "list",
      title: "Step 3",
      items: [{ content: "Intubation technique Proper positioning Direct or video laryngoscopy Tube placement confirmation" }]
    },
    {
      type: "list",
      title: "Step 4",
      items: [{ content: "Confirm placement Multiple methods: Colorimetric capnography, waveform capnography, auscultation, visualization Continuous waveform capnography required" }]
    },
    {
      type: "list",
      title: "Step 5",
      items: [{ content: "Secure tube Document tube depth" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Unrecognized esophageal intubation is catastrophic. Always confirm placement with multiple methods including continuous waveform capnography." }]
    }
  ]
},
  {
  id: "1268",
  refNo: "TP-1268",
  title: "Vascular Access (Advanced)",
  category: "Procedures",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "build",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Vascular Access (Advanced)", subtitle: "TP-1268 • Protocol", icon: "build" }]
    },
    {
      type: "section",
      title: "Intravenous Access"
    },
    {
      type: "list",
      title: "Technique",
      items: [{ content: "Select appropriate vein Large bore (14-16g) for trauma Tourniquet application Sterile technique" }]
    },
    {
      type: "section",
      title: "Intraosseous Access"
    },
    {
      type: "list",
      title: "Indications",
      items: [{ content: "Failed IV attempts in critical patient Immediate need for vascular access in arrest or shock" }]
    },
    {
      type: "list",
      title: "Sites",
      items: [{ content: "Proximal tibia (preferred in pediatrics) Proximal humerus (preferred in adults) Distal tibia" }]
    },
    {
      type: "list",
      title: "Technique",
      items: [{ content: "Identify landmarks Prepare site Insert IO needle Confirm placement (aspiration of marrow, easy infusion) Flush with 10mL saline" }]
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "IO access provides rapid, reliable vascular access. Any medication or fluid given IV can be given IO. Do not delay in critical patients." }]
    }
  ]
},
  {
  id: "1269",
  refNo: "TP-1269",
  title: "Special Populations",
  category: "General",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "groups",
  color: "teal",
  sections: [
    {
      type: "header",
      items: [{ title: "Special Populations", subtitle: "TP-1269 • Protocol", icon: "groups" }]
    },
    {
      type: "section",
      title: "Patient Groups Requiring Special Considerations"
    },
    {
      type: "list",
      title: "Pediatric",
      items: [{ content: "Weight-based dosing Age-appropriate equipment Anatomic differences" }]
    },
    {
      type: "list",
      title: "Geriatric",
      items: [{ content: "Atypical presentations Polypharmacy Baseline function assessment" }]
    },
    {
      type: "list",
      title: "Bariatric",
      items: [{ content: "Equipment needs Airway challenges Medication dosing" }]
    },
    {
      type: "list",
      title: "Pregnant",
      items: [{ content: "Physiologic changes Left lateral tilt Fetal considerations" }]
    },
    {
      type: "list",
      title: "Developmental Disabilities",
      items: [{ content: "Communication strategies Caregiver input Baseline function" }]
    },
    {
      type: "section",
      title: "General Approach"
    },
    {
      type: "list",
      title: "Assessment",
      items: [{ content: "Modify approach based on patient population Consider special needs Involve caregivers in assessment" }]
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Special populations require tailored approach to assessment and treatment. One size does not fit all." }]
    }
  ]
},
  {
  id: "1270",
  refNo: "TP-1270",
  title: "Transport Decisions / Destination",
  category: "General",
  type: "Protocol",
  lastUpdated: "2025",
  icon: "local_hospital",
  color: "blue-grey",
  sections: [
    {
      type: "header",
      items: [{ title: "Transport Decisions / Destination", subtitle: "TP-1270 • Protocol", icon: "local_hospital" }]
    },
    {
      type: "section",
      title: "Destination Decision Factors"
    },
    {
      type: "list",
      title: "Patient Condition",
      items: [{ content: "Severity and time-sensitivity of condition Specialty care needs (trauma, stroke, STEMI, burn)" }]
    },
    {
      type: "list",
      title: "Facility Capabilities",
      items: [{ content: "Level of care available Specialty services (trauma center, stroke center, PCI) Bed availability" }]
    },
    {
      type: "list",
      title: "Transport Time",
      items: [{ content: "Ground vs air transport Distance to appropriate facility Bypass closest facility for specialty care when indicated" }]
    },
    {
      type: "section",
      title: "Special Destinations"
    },
    {
      type: "list",
      title: "Trauma Center",
      items: [{ content: "Multi-system trauma Penetrating torso trauma Burns High-risk mechanism with physiologic compromise" }]
    },
    {
      type: "list",
      title: "Stroke Center",
      items: [{ content: "Suspected acute stroke within treatment window Thrombectomy-capable for large vessel occlusion" }]
    },
    {
      type: "list",
      title: "STEMI Receiving Center",
      items: [{ content: "STEMI on 12-lead ECG PCI capability" }]
    },
    {
      type: "list",
      title: "Pediatric Center",
      items: [{ content: "Critical pediatric patients when available" }]
    },
    {
      type: "section",
      title: "Patient Choice"
    },
    {
      type: "list",
      title: "Considerations",
      items: [{ content: "Patient preference considered when clinically appropriate Time-critical conditions may require override Patient refusal of transport (against medical advice)" }]
    },
    {
      type: "accordion",
      title: "Note 1",
      items: [{ content: "Right patient to right hospital at right time. Specialty centers improve outcomes for time-critical conditions." }]
    }
  ]
}
];
