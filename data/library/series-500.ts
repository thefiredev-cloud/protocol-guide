
import { Protocol } from '../../types';

export const series500: Protocol[] = [
  {
    id: "501", refNo: "Ref. 501", title: "Patient Destination Policy - General", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "local_hospital", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Patient Destination", subtitle: "Ref. 501" }] },
        { type: "text", title: "Purpose", content: "Establishes general principles for appropriate patient destination selection to ensure patients receive the right care at the right facility." },
        { type: "list", title: "General Principles", items: [
            { title: "Closest Appropriate", content: "Transport to the closest appropriate facility based on patient condition and specialty needs." },
            { title: "Patient Preference", content: "Patient preference should be considered when clinically appropriate and safe." },
            { title: "Specialty Centers", content: "Specialty centers take priority over general EDs when criteria are met (STEMI, Stroke, Trauma, Burn, Pediatric)." },
            { title: "Base Contact", content: "Contact Base Hospital for clarification if destination is unclear." }
        ]}
    ]
  },
  {
    id: "502", refNo: "Ref. 502", title: "Emergency Department Categorization", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "apartment", color: "blue",
    sections: [
        { type: "header", items: [{ title: "ED Categories", subtitle: "Ref. 502" }] },
        { type: "accordion", title: "ED Types", items: [
            { title: "Basic Emergency Department (BED)", content: "Provides basic emergency services 24/7. May have limited specialty services." },
            { title: "Comprehensive Emergency Department (CED)", content: "Full-service ED with broader specialty coverage including surgery, ICU capability." },
            { title: "Standby Emergency Department (SBED)", content: "Limited hours or services. Primarily for stabilization and transfer." }
        ]}
    ]
  },
  {
    id: "503", refNo: "Ref. 503", title: "Trauma Center Designation", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "healing", color: "red",
    sections: [
        { type: "header", items: [{ title: "Trauma Centers", subtitle: "Ref. 503" }] },
        { type: "list", title: "Levels", items: [
            { title: "Level I", content: "Regional trauma center with full surgical/specialty services, research, education." },
            { title: "Level II", content: "Provides comprehensive trauma care, may lack some specialty services or research of Level I." },
            { title: "Pediatric Trauma Center (PTC)", content: "Specialized for pediatric trauma patients." }
        ]}
    ]
  },
  {
    id: "504", refNo: "Ref. 504", title: "Trauma Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "emergency", color: "red",
    sections: [
        { type: "header", items: [{ title: "Trauma Destination", subtitle: "Ref. 504" }] },
        { type: "text", title: "Triage Tool", content: "Use the Trauma Triage Tool (Ref. 1104) to determine if patient meets Trauma Center criteria." },
        { type: "accordion", title: "Destination Logic", items: [
            { title: "Meets TC Criteria", content: "Transport directly to closest Trauma Center (Level I or II)." },
            { title: "Pediatric (<15 years)", content: "Transport to Pediatric Trauma Center if available and transport time reasonable." },
            { title: "Does Not Meet Criteria", content: "Transport to closest appropriate ED (BED/CED)." }
        ]},
        { type: "warning", content: "Trauma Center destination takes priority over most other specialty centers (except pediatric considerations)." }
    ]
  },
  {
    id: "505", refNo: "Ref. 505", title: "STEMI Receiving Center (SRC)", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "ecg_heart", color: "red",
    sections: [
        { type: "header", items: [{ title: "STEMI Centers", subtitle: "Ref. 505" }] },
        { type: "text", title: "Definition", content: "STEMI Receiving Centers have 24/7 cardiac catheterization lab capability for immediate coronary intervention." },
        { type: "list", title: "SRC Requirements", items: [
            { title: "Cath Lab", content: "24/7 PCI capability with team activation in < 90 minutes." },
            { title: "Cardiology", content: "Interventional cardiologist on call 24/7." },
            { title: "CCU", content: "Cardiac intensive care unit for post-intervention monitoring." }
        ]}
    ]
  },
  {
    id: "506", refNo: "Ref. 506", title: "STEMI Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "monitor_heart", color: "red",
    sections: [
        { type: "header", items: [{ title: "STEMI Destination", subtitle: "Ref. 506" }] },
        { type: "text", title: "Requirement", content: "Adult patients with STEMI identified on 12-Lead ECG must be transported directly to a STEMI Receiving Center (SRC)." },
        { type: "list", title: "STEMI Criteria", items: [
            { title: "ECG Findings", content: "ST-elevation >= 1mm in two contiguous leads (limb) or >= 2mm (precordial)." },
            { title: "New LBBB", content: "New or presumably new left bundle branch block with ischemic symptoms." },
            { title: "Age", content: "Adults >= 18 years (pediatric STEMI use Pediatric Destination policy)." }
        ]},
        { type: "accordion", title: "Notification", items: [
            { title: "Base Contact", content: "Contact Base Hospital for STEMI Alert. Base will activate receiving SRC." },
            { title: "Time Critical", content: "Door-to-balloon time goal is < 90 minutes. Prehospital notification reduces delays." }
        ]}
    ]
  },
  {
    id: "507", refNo: "Ref. 507", title: "Pediatric Medical Center (PMC)", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "purple",
    sections: [
        { type: "header", items: [{ title: "Pediatric Centers", subtitle: "Ref. 507" }] },
        { type: "text", title: "Purpose", content: "Pediatric Medical Centers provide specialized emergency care for critically ill/injured children." },
        { type: "list", title: "PMC Capabilities", items: [
            { title: "PICU", content: "Pediatric intensive care unit." },
            { title: "Pediatric Surgery", content: "Pediatric surgeons available 24/7." },
            { title: "Subspecialties", content: "Pediatric cardiology, neurosurgery, orthopedics, etc." },
            { title: "Equipment", content: "Pediatric-specific equipment and medication dosing." }
        ]}
    ]
  },
  {
    id: "508", refNo: "Ref. 508", title: "Pediatric Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "family_restroom", color: "purple",
    sections: [
        { type: "header", items: [{ title: "Pediatric Destination", subtitle: "Ref. 508" }] },
        { type: "accordion", title: "Destination Logic", items: [
            { title: "Critical Pediatric (<15 years)", content: "If patient meets Pediatric Trauma Center or Pediatric Medical Center criteria, transport to PMC/PTC." },
            { title: "Stable Pediatric", content: "May transport to closest appropriate ED if stable and no specialty criteria met." },
            { title: "Neonate (<28 days)", content: "Transport to facility with NICU capability." }
        ]},
        { type: "warning", content: "Always consider developmental/anatomical differences in pediatric assessment and treatment." }
    ]
  },
  {
    id: "509", refNo: "Ref. 509", title: "Service Area Hospital", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "map", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Service Areas", subtitle: "Ref. 509" }] },
        { type: "text", content: "Defines the geographic catchment areas for hospitals. EMS providers generally transport to the Service Area Hospital unless a specialty center is required." }
    ]
  },
  {
    id: "510", refNo: "Ref. 510", title: "Patient Refusal of Service Area Hospital", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "cancel", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Hospital Refusal", subtitle: "Ref. 510" }] },
        { type: "text", title: "Patient Choice", content: "Competent patients may request transport to a hospital outside their service area if clinically safe." },
        { type: "list", title: "Requirements", items: [
            { title: "Capacity", content: "Patient must have decision-making capacity (not altered mental status)." },
            { title: "Stability", content: "Patient condition allows for extended transport time without deterioration." },
            { title: "Documentation", content: "Document patient's hospital preference and clinical justification for honoring request." }
        ]},
        { type: "warning", content: "If patient requires specialty center (STEMI, Trauma, Stroke), specialty criteria override patient preference." }
    ]
  },
  {
    id: "511", refNo: "Ref. 511", title: "Perinatal Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "pregnant_woman", color: "pink",
    sections: [
        { type: "header", items: [{ title: "Perinatal Destination", subtitle: "Ref. 511" }] },
        { type: "list", title: "Destination Criteria", items: [
            { title: "Gestation", content: "Pregnancy >= 20 weeks." },
            { title: "Complaint", content: "Active labor, rupture of membranes, vaginal bleeding, hypertensive crisis (preeclampsia/eclampsia), or fetal distress." }
        ]},
        { type: "accordion", title: "Facility Selection", items: [
            { title: "Perinatal Center", content: "Transport to the nearest Perinatal Center (Hospital with Basic Emergency Service + OB + NICU)." },
            { title: "Imminent Delivery", content: "If crowning or delivery is imminent and cannot be safely delayed, transport to the closest Basic Emergency Department (MAR)." }
        ]}
    ]
  },
  {
    id: "512", refNo: "Ref. 512", title: "Burn Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "local_fire_department", color: "orange",
    sections: [
        { type: "header", items: [{ title: "Burn Destination", subtitle: "Ref. 512" }] },
        { type: "text", title: "Principle", content: "Patients meeting Burn Center criteria should be transported directly to a designated Burn Center to improve outcomes." },
        { type: "list", title: "Burn Center Criteria", items: [
            { title: "Surface Area", content: "Partial thickness burns > 10% TBSA." },
            { title: "Critical Areas", content: "Burns involving the face, hands, feet, genitalia, perineum, or major joints." },
            { title: "Type", content: "Full thickness burns (any age/size), Electrical burns (including lightning), Chemical burns." },
            { title: "Inhalation", content: "Inhalation injury." }
        ]},
        { type: "warning", content: "If the patient also meets Trauma Center criteria (e.g. car crash with fire), Trauma Center destination takes priority over Burn Center." }
    ]
  },
  {
    id: "513", refNo: "Ref. 513", title: "Psychiatric Emergency Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "psychology", color: "teal",
    sections: [
        { type: "header", items: [{ title: "Psychiatric Destination", subtitle: "Ref. 513" }] },
        { type: "text", title: "Purpose", content: "Patients with primary psychiatric complaints may be transported to designated Psychiatric Emergency Services or medical EDs." },
        { type: "accordion", title: "Destination Options", items: [
            { title: "Psychiatric Emergency", content: "Standalone psychiatric emergency facility for patients with no medical issues." },
            { title: "ED with Psych Services", content: "Medical ED with psychiatric evaluation capability for patients with co-existing medical issues." },
            { title: "Medical Clearance", content: "Patients requiring medical evaluation (intoxication, overdose, trauma) must go to medical ED first." }
        ]},
        { type: "list", title: "5150 Hold Requirements", items: [
            { title: "Authority", content: "Law enforcement or designated mental health professional initiates 5150 hold." },
            { title: "Criteria", content: "Danger to self, danger to others, or gravely disabled due to mental disorder." },
            { title: "Destination", content: "Transport to designated psychiatric facility per county protocols." }
        ]}
    ]
  },
  {
    id: "514", refNo: "Ref. 514", title: "Hyperbaric Oxygen (HBO) Capable Facility", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "air", color: "cyan",
    sections: [
        { type: "header", items: [{ title: "HBO Destination", subtitle: "Ref. 514" }] },
        { type: "text", title: "Indications", content: "Patients with carbon monoxide poisoning, decompression sickness, or gas gangrene may benefit from hyperbaric oxygen therapy." },
        { type: "list", title: "HBO Indications", items: [
            { title: "CO Poisoning", content: "Carbon monoxide level > 25% or symptomatic (altered mental status, syncope, chest pain)." },
            { title: "Decompression Illness", content: "SCUBA diving accident with neurologic or pulmonary symptoms." },
            { title: "Gas Gangrene", content: "Clostridial myonecrosis." }
        ]},
        { type: "warning", content: "Consult Base Hospital for HBO referral. Most patients require initial stabilization at ED before transfer to HBO-capable facility." }
    ]
  },
  {
    id: "515", refNo: "Ref. 515", title: "Interfacility Transfer Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "compare_arrows", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Interfacility Transfer", subtitle: "Ref. 515" }] },
        { type: "text", title: "Definition", content: "Interfacility transfer involves moving a patient from one medical facility to another for higher level of care or specialized services." },
        { type: "accordion", title: "Requirements", items: [
            { title: "Physician Orders", content: "Must have written or verbal orders from sending physician." },
            { title: "Accepting Facility", content: "Receiving facility must have accepted the patient prior to transport." },
            { title: "Medical Record", content: "Copy of relevant medical records, labs, imaging should accompany patient." },
            { title: "EMTALA Compliance", content: "Transfer must comply with EMTALA stabilization requirements." }
        ]}
    ]
  },
  {
    id: "516", refNo: "Ref. 516", title: "ROSC Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "monitor_heart", color: "red",
    sections: [
        { type: "header", items: [{ title: "ROSC Destination", subtitle: "Ref. 516" }] },
        { type: "text", title: "Requirement", content: "Adult patients (>= 18) with non-traumatic cardiac arrest who achieve Return of Spontaneous Circulation (ROSC) in the field shall be transported to a STEMI Receiving Center (SRC)." },
        { type: "accordion", title: "Rationale", items: [
            { title: "Post-Arrest Care", content: "SRCs provide targeted temperature management (TTM) and immediate coronary intervention if indicated, which improves survival." },
            { title: "ECG Findings", content: "Transport to SRC regardless of whether the post-ROSC 12-Lead ECG shows ST-elevation." }
        ]}
    ]
  },
  {
    id: "517", refNo: "Ref. 517", title: "Pediatric Cardiac Arrest Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "child_friendly", color: "purple",
    sections: [
        { type: "header", items: [{ title: "Pediatric Arrest Destination", subtitle: "Ref. 517" }] },
        { type: "text", title: "Policy", content: "Pediatric patients (<18 years) with cardiac arrest (with or without ROSC) should be transported to a Pediatric Medical Center when feasible." },
        { type: "accordion", title: "Considerations", items: [
            { title: "ROSC", content: "If ROSC achieved, transport to PMC for PICU-level care." },
            { title: "Ongoing CPR", content: "If CPR ongoing, consider transport time. May go to closest ED if PMC significantly further." },
            { title: "Neonates", content: "Neonates require NICU capability - transport to facility with neonatal resuscitation resources." }
        ]}
    ]
  },
  {
    id: "518", refNo: "Ref. 518", title: "Air Ambulance Utilization", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "flight", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Air Ambulance", subtitle: "Ref. 518" }] },
        { type: "text", title: "Purpose", content: "Helicopter Emergency Medical Services (HEMS) provide rapid transport for time-critical patients or access to remote areas." },
        { type: "list", title: "Indications", items: [
            { title: "Remote Location", content: "Prolonged ground transport time (>30 min) to appropriate facility." },
            { title: "Critical Patient", content: "Severely injured trauma patient requiring rapid transport to Trauma Center." },
            { title: "Specialized Care", content: "Patient requires specialized team (neonatal, burn, ECMO) not available by ground." },
            { title: "Terrain", content: "Inaccessible by ground ambulance (wilderness, disaster)." }
        ]},
        { type: "warning", content: "Weather, landing zone safety, and aircraft availability may limit HEMS utilization. Always have ground backup plan." }
    ]
  },
  {
    id: "519", refNo: "Ref. 519", title: "Base Hospital Designation", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "contact_phone", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Base Hospital", subtitle: "Ref. 519" }] },
        { type: "text", title: "Definition", content: "Base Hospitals provide online medical direction to paramedics for ALS treatment orders and destination decisions." },
        { type: "accordion", title: "Base Hospital Functions", items: [
            { title: "Medical Direction", content: "Emergency physician provides real-time treatment orders to paramedics." },
            { title: "Consultation", content: "Guidance on complex cases, medication orders beyond standing orders, destination clarification." },
            { title: "Refusal Evaluation", content: "Physician evaluation for AMA refusals when required." },
            { title: "Quality Improvement", content: "Review of EMS calls, case review, education." }
        ]}
    ]
  },
  {
    id: "520", refNo: "Ref. 520", title: "Diversion Status and Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "block", color: "red",
    sections: [
        { type: "header", items: [{ title: "Hospital Diversion", subtitle: "Ref. 520" }] },
        { type: "text", title: "Purpose", content: "Hospital diversion status indicates a facility is temporarily unable to accept ambulance patients due to capacity constraints." },
        { type: "list", title: "Diversion Rules", items: [
            { title: "Critical Patients", content: "Diversion does NOT apply to STEMI, Stroke, Trauma, or other specialty center criteria - always transport." },
            { title: "Stable Patients", content: "For non-critical patients, redirect to next closest appropriate facility." },
            { title: "Base Contact", content: "Contact Base Hospital if unclear whether patient can bypass diversion." },
            { title: "Patient Preference", content: "Patient preference does NOT override diversion for non-specialty cases." }
        ]}
    ]
  },
  {
    id: "521", refNo: "Ref. 521", title: "Stroke Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "neurology", color: "indigo",
    sections: [
        { type: "header", items: [{ title: "Stroke Destination", subtitle: "Ref. 521" }] },
        { type: "list", title: "Screening Tools", items: [
            { title: "mLAPSS", content: "Modified Los Angeles Prehospital Stroke Screen. Used to identify acute stroke." },
            { title: "LAMS", content: "Los Angeles Motor Scale (0-5). Used to identify Large Vessel Occlusion (LVO)." }
        ]},
        { type: "accordion", title: "Destination Logic", items: [
            { title: "Positive mLAPSS", content: "Transport to closest Stroke Center (Primary or Comprehensive)." },
            { title: "LAMS 4-5 (Suspected LVO)", content: "Transport directly to a <b>Comprehensive Stroke Center (CSC)</b> if transport time is <= 30 minutes. If > 30 mins, go to closest Primary Stroke Center." },
            { title: "LAMS <= 3", content: "Transport to closest Primary Stroke Center (PSC)." }
        ]}
    ]
  },
  {
    id: "522", refNo: "Ref. 522", title: "Primary Stroke Center (PSC)", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "local_hospital", color: "indigo",
    sections: [
        { type: "header", items: [{ title: "Primary Stroke Center", subtitle: "Ref. 522" }] },
        { type: "text", title: "Definition", content: "Primary Stroke Centers have capability for IV thrombolytic therapy (tPA) and basic stroke care." },
        { type: "list", title: "PSC Requirements", items: [
            { title: "CT/MRI", content: "24/7 neuroimaging capability." },
            { title: "Neurology", content: "Neurologist available for consultation (on-site or telemedicine)." },
            { title: "tPA", content: "Ability to administer IV tissue plasminogen activator within 60 minutes of arrival." },
            { title: "Stroke Unit", content: "Dedicated stroke unit or ICU for monitoring." }
        ]}
    ]
  },
  {
    id: "523", refNo: "Ref. 523", title: "Comprehensive Stroke Center (CSC)", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "home_health", color: "indigo",
    sections: [
        { type: "header", items: [{ title: "Comprehensive Stroke Center", subtitle: "Ref. 523" }] },
        { type: "text", title: "Definition", content: "Comprehensive Stroke Centers provide all PSC services PLUS advanced interventions for complex strokes." },
        { type: "list", title: "CSC Additional Capabilities", items: [
            { title: "Endovascular Therapy", content: "Mechanical thrombectomy for large vessel occlusion (LVO)." },
            { title: "Neurosurgery", content: "24/7 neurosurgery for hemorrhagic stroke, decompressive craniectomy." },
            { title: "Neuro ICU", content: "Dedicated neuro-intensive care unit." },
            { title: "Advanced Imaging", content: "CT angiography, perfusion imaging, angiography suite." }
        ]}
    ]
  },
  {
    id: "524", refNo: "Ref. 524", title: "Altered Mental Status Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "psychology_alt", color: "blue",
    sections: [
        { type: "header", items: [{ title: "AMS Destination", subtitle: "Ref. 524" }] },
        { type: "text", title: "General Rule", content: "Patients with undifferentiated altered mental status should be transported to the closest appropriate Emergency Department." },
        { type: "accordion", title: "Special Considerations", items: [
            { title: "Stroke Suspected", content: "If mLAPSS positive, treat as stroke and transport to Stroke Center." },
            { title: "Hypoglycemia Corrected", content: "If AMS resolved with D10/Oral glucose and patient meets refusal criteria (Ref. 1212), may refuse transport." },
            { title: "Overdose/Poisoning", content: "May consult Poison Control but transport to ED for medical evaluation." },
            { title: "Head Injury", content: "If trauma mechanism, consider Trauma Center destination." }
        ]}
    ]
  },
  {
    id: "525", refNo: "Ref. 525", title: "Seizure Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "emergency", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Seizure Destination", subtitle: "Ref. 525" }] },
        { type: "text", title: "General Transport", content: "Most seizure patients should be transported to the closest appropriate Emergency Department for evaluation." },
        { type: "list", title: "Transport Considerations", items: [
            { title: "First-Time Seizure", content: "All first-time seizures require ED evaluation - always transport." },
            { title: "Status Epilepticus", content: "Ongoing seizures despite treatment require immediate transport to closest ED." },
            { title: "Known Epileptic", content: "Patient with known seizure disorder who has returned to baseline may refuse if meets AMA criteria (Ref. 1216)." },
            { title: "Trauma", content: "If seizure caused fall/injury, consider Trauma Center if criteria met." }
        ]}
    ]
  },
  {
    id: "526", refNo: "Ref. 526", title: "SNF/Nursing Home Transfer Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "local_hotel", color: "blue",
    sections: [
        { type: "header", items: [{ title: "SNF Transfers", subtitle: "Ref. 526" }] },
        { type: "text", title: "Purpose", content: "Skilled Nursing Facility (SNF) and nursing home transfers require appropriate destination selection based on patient condition." },
        { type: "accordion", title: "Destination Decisions", items: [
            { title: "Critical Condition", content: "Unstable patients (shock, respiratory failure, altered mental status) transport to closest appropriate ED." },
            { title: "Specialty Criteria", content: "If STEMI/Stroke/Trauma criteria met, transport to specialty center." },
            { title: "Facility Preference", content: "SNF may request specific hospital, but patient condition dictates appropriate destination." },
            { title: "Documentation", content: "Obtain facility transfer paperwork, medication list, DNR/POLST if available." }
        ]}
    ]
  },
  {
    id: "527", refNo: "Ref. 527", title: "Homeless/Undomiciled Patient", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "person_off", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Homeless Patient", subtitle: "Ref. 527" }] },
        { type: "text", title: "Equal Treatment", content: "Homeless/undomiciled patients receive the same medical evaluation and destination selection as all other patients." },
        { type: "list", title: "Considerations", items: [
            { title: "Medical Necessity", content: "Transport decision based on medical condition, not housing status." },
            { title: "Capacity", content: "Assess decision-making capacity - intoxication/mental illness may impair capacity." },
            { title: "Refusal", content: "Competent patients may refuse care. Document thoroughly (Ref. 1216)." },
            { title: "Social Services", content: "ED can arrange social services, shelter resources if patient transported." }
        ]},
        { type: "warning", content: "Do NOT transport patients without medical complaint solely for shelter/social reasons." }
    ]
  },
  {
    id: "528", refNo: "Ref. 528", title: "Intoxicated (Alcohol) Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "liquor", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Sobering Center", subtitle: "Ref. 528" }] },
        { type: "text", title: "Purpose", content: "To divert stable, uncomplicated alcohol-intoxicated patients away from EDs to Sobering Centers for monitoring." },
        { type: "accordion", title: "Inclusion Criteria", items: [
            { title: "Complaint", content: "Primary issue is intoxication (ETOH)." },
            { title: "Status", content: "Patient is awake, alert, and ambulatory (steady gait)." },
            { title: "Vitals", content: "HR 60-100, SBP 100-180, RR 12-24, SpO2 > 94%, BG > 60." },
            { title: "No Trauma", content: "No evidence of fall or head strike." }
        ]}
    ]
  },
  {
    id: "529", refNo: "Ref. 529", title: "Drug Overdose Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "medication_liquid", color: "red",
    sections: [
        { type: "header", items: [{ title: "Overdose Destination", subtitle: "Ref. 529" }] },
        { type: "text", title: "General Rule", content: "All drug overdose patients require medical evaluation at an Emergency Department regardless of response to naloxone." },
        { type: "list", title: "Transport Requirements", items: [
            { title: "Opioid Overdose", content: "Even if patient wakes up after naloxone, transport for observation (re-sedation risk)." },
            { title: "Multi-Drug", content: "Patients with polypharmacy overdose require extended ED monitoring." },
            { title: "Intentional Overdose", content: "Suicide attempt requires medical AND psychiatric evaluation." },
            { title: "Synthetic Drugs", content: "Fentanyl, carfentanil, novel psychoactive substances require medical clearance." }
        ]},
        { type: "warning", content: "Patient may refuse after naloxone, but strongly encourage transport. Document refusal thoroughly (Ref. 1216)." }
    ]
  },
  {
    id: "530", refNo: "Ref. 530", title: "Dialysis Patient Emergency Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "water_drop", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Dialysis Emergency", subtitle: "Ref. 530" }] },
        { type: "text", title: "Purpose", content: "Dialysis patients experiencing emergency complications require appropriate facility selection." },
        { type: "accordion", title: "Common Emergencies", items: [
            { title: "Hyperkalemia", content: "Cardiac arrhythmias from elevated potassium - transport to closest ED for emergent dialysis/management." },
            { title: "Fluid Overload", content: "Pulmonary edema, CHF exacerbation - transport to ED for diuresis or emergent dialysis." },
            { title: "Fistula/Graft Issues", content: "Bleeding, clotted access - apply pressure, transport to ED (may need vascular surgery)." },
            { title: "Chest Pain", content: "Evaluate for STEMI - if criteria met, transport to SRC." }
        ]}
    ]
  },
  {
    id: "531", refNo: "Ref. 531", title: "Bariatric Patient Transport", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "scale", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Bariatric Transport", subtitle: "Ref. 531" }] },
        { type: "text", title: "Definition", content: "Bariatric patients (typically >350 lbs or unable to fit on standard gurney) may require specialized equipment and destination planning." },
        { type: "list", title: "Considerations", items: [
            { title: "Equipment", content: "Bariatric ambulance with specialized gurney, lift equipment may be required." },
            { title: "Personnel", content: "Additional personnel for safe lifting/moving." },
            { title: "Facility Capability", content: "Confirm receiving facility has bariatric equipment (CT scanner, OR table) if needed." },
            { title: "Medical Priority", content: "Specialty center criteria (STEMI/Stroke/Trauma) still apply - don't delay for bariatric resources." }
        ]}
    ]
  },
  {
    id: "532", refNo: "Ref. 532", title: "Patient in Custody Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "policy", color: "slate",
    sections: [
        { type: "header", items: [{ title: "In-Custody Patient", subtitle: "Ref. 532" }] },
        { type: "text", title: "Policy", content: "Patients in custody (arrested, detained) require law enforcement escort and may have specific destination requirements." },
        { type: "accordion", title: "Transport Procedures", items: [
            { title: "Law Enforcement", content: "Custody must be maintained - officer accompanies patient in ambulance." },
            { title: "Restraints", content: "Law enforcement responsible for restraints. EMS may apply medical restraints per protocol (Ref. 824)." },
            { title: "Destination", content: "Medical destination based on patient condition. Some facilities have secure units for in-custody patients." },
            { title: "Documentation", content: "Document law enforcement agency, officer name, booking/case number." }
        ]}
    ]
  },
  {
    id: "533", refNo: "Ref. 533", title: "Sexual Assault Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "personal_injury", color: "purple",
    sections: [
        { type: "header", items: [{ title: "Sexual Assault", subtitle: "Ref. 533" }] },
        { type: "text", title: "Purpose", content: "Sexual assault patients require transport to facilities with Sexual Assault Response Team (SART) capability for forensic examination." },
        { type: "list", title: "Transport Guidelines", items: [
            { title: "SART Facility", content: "Transport to designated SART facility when available and patient condition stable." },
            { title: "Critical Injury", content: "If patient has life-threatening injuries, closest appropriate ED takes priority." },
            { title: "Evidence Preservation", content: "Discourage patient from changing clothes, urinating, washing. Preserve clothing in paper bag if removed." },
            { title: "Documentation", content: "Document only medical findings. Law enforcement handles assault investigation." }
        ]},
        { type: "warning", content: "Maintain patient privacy and dignity. Limit scene personnel. Offer victim advocacy resources." }
    ]
  },
  {
    id: "534", refNo: "Ref. 534", title: "Elder Abuse Suspected - Destination and Reporting", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "elderly", color: "orange",
    sections: [
        { type: "header", items: [{ title: "Elder Abuse", subtitle: "Ref. 534" }] },
        { type: "text", title: "Mandatory Reporting", content: "EMS providers are mandatory reporters of suspected elder abuse (physical, neglect, financial, emotional) per California Welfare & Institutions Code." },
        { type: "list", title: "Indicators of Abuse", items: [
            { title: "Physical", content: "Unexplained bruises, fractures, burns in various stages of healing." },
            { title: "Neglect", content: "Malnutrition, dehydration, poor hygiene, untreated medical conditions, unsafe living environment." },
            { title: "Emotional", content: "Patient fearful of caregiver, caregiver dismissive or aggressive." }
        ]},
        { type: "accordion", title: "Actions Required", items: [
            { title: "Transport", content: "Transport patient to ED for medical evaluation." },
            { title: "Reporting", content: "Report to Adult Protective Services (APS) or law enforcement within required timeframe." },
            { title: "Documentation", content: "Document objective findings (injuries, vital signs, environment) without accusations." }
        ]}
    ]
  },
  {
    id: "535", refNo: "Ref. 535", title: "Child Abuse Suspected - Destination and Reporting", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "orange",
    sections: [
        { type: "header", items: [{ title: "Child Abuse", subtitle: "Ref. 535" }] },
        { type: "text", title: "Mandatory Reporting", content: "EMS providers are mandatory reporters of suspected child abuse or neglect per California Penal Code 11166." },
        { type: "list", title: "Red Flags", items: [
            { title: "Injury Pattern", content: "Injuries inconsistent with stated mechanism, multiple injuries in different stages of healing." },
            { title: "Delay in Care", content: "Significant delay in seeking care for serious injury." },
            { title: "Behavior", content: "Child fearful, withdrawn, or parent/caregiver story changes." },
            { title: "Environmental", content: "Unsafe home environment, inadequate supervision." }
        ]},
        { type: "accordion", title: "Required Actions", items: [
            { title: "Transport", content: "Transport to ED, preferably Pediatric Medical Center for specialized evaluation." },
            { title: "Reporting", content: "Report to Child Protective Services or law enforcement immediately (by phone) and written report within 36 hours." },
            { title: "Documentation", content: "Document objective findings, verbatim quotes from child/caregiver, scene observations." }
        ]},
        { type: "warning", content: "Do NOT confront suspected abuser. Focus on child's medical care and safety." }
    ]
  },
  {
    id: "536", refNo: "Ref. 536", title: "Hospice/End-of-Life Patient Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "local_florist", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Hospice Patient", subtitle: "Ref. 536" }] },
        { type: "text", title: "Purpose", content: "Patients enrolled in hospice have chosen comfort care over curative treatment. Transport decisions should align with goals of care." },
        { type: "accordion", title: "Decision Framework", items: [
            { title: "DNR/POLST", content: "Review POLST form or DNR orders. Honor patient/family wishes regarding resuscitation and transport." },
            { title: "Comfort Measures", content: "Patient may request transport for symptom management (pain, dyspnea) rather than curative care." },
            { title: "Family Request", content: "Family may request transport despite hospice status. Discuss goals of care and document decision." },
            { title: "Reversible Cause", content: "Some hospice patients may want treatment for reversible issues (fracture from fall) - individualize." }
        ]},
        { type: "list", title: "Transport Options", items: [
            { title: "ED Transport", content: "If patient/family requests ED evaluation for comfort care or reversible issue." },
            { title: "Non-Transport", content: "If DNR/POLST indicates no transport and no reversible emergency, may remain at home with hospice notification." },
            { title: "Hospice Notification", content: "Contact hospice agency if patient elects to remain home for comfort measures." }
        ]}
    ]
  },
  {
    id: "537", refNo: "Ref. 537", title: "Language Barrier - Interpretation Services", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "translate", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Language Access", subtitle: "Ref. 537" }] },
        { type: "text", title: "Requirement", content: "Patients with limited English proficiency have the right to interpretation services for informed consent and medical communication." },
        { type: "list", title: "Interpretation Resources", items: [
            { title: "Phone Interpretation", content: "Use telephonic interpretation service (Language Line) for critical communication." },
            { title: "Family/Bystanders", content: "May assist with basic communication but should NOT be sole interpreter for medical consent." },
            { title: "Bilingual EMS", content: "Utilize bilingual EMS personnel when available." },
            { title: "Hospital", content: "Document language barrier - hospital will arrange certified interpreter for ED care." }
        ]},
        { type: "warning", content: "For refusal of care (AMA), make reasonable effort to obtain interpretation before accepting refusal from non-English speaker." }
    ]
  },
  {
    id: "538", refNo: "Ref. 538", title: "Patient Transport Across County Lines", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "alt_route", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Out of County Transport", subtitle: "Ref. 538" }] },
        { type: "text", title: "General Rule", content: "Patients should generally be transported to facilities within LA County unless specialty center criteria require out-of-county facility." },
        { type: "accordion", title: "Out-of-County Scenarios", items: [
            { title: "Specialty Center", content: "If patient meets criteria (Burn, Trauma, Stroke) and nearest center is out of county, transport there." },
            { title: "Border Areas", content: "In areas near county border, closest appropriate facility may be in adjacent county - acceptable." },
            { title: "Patient Preference", content: "Patient request for out-of-county hospital honored only if clinically safe and stable." },
            { title: "Interfacility Transfer", content: "Transferring patient from LA County facility to out-of-county specialty center per physician order." }
        ]}
    ]
  },
  {
    id: "539", refNo: "Ref. 539", title: "Standby Medical Evaluation (Planned Events)", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "event", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Standby Events", subtitle: "Ref. 539" }] },
        { type: "text", title: "Purpose", content: "EMS units may be assigned to standby for planned events (sports, concerts, demonstrations) to provide immediate medical response." },
        { type: "list", title: "Standby Procedures", items: [
            { title: "Scope", content: "Provide BLS/ALS assessment and treatment per protocols." },
            { title: "Destination", content: "Transport to appropriate facility based on patient condition using standard destination protocols." },
            { title: "Refusals", content: "Standard refusal procedures apply (Ref. 1216)." },
            { title: "Multiple Patients", content: "If multiple casualties occur, implement MCI procedures (Ref. 1400 series)." }
        ]}
    ]
  },
  {
    id: "540", refNo: "Ref. 540", title: "Behavioral Emergency Destination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "mood_bad", color: "teal",
    sections: [
        { type: "header", items: [{ title: "Behavioral Emergency", subtitle: "Ref. 540" }] },
        { type: "text", title: "Purpose", content: "Patients with acute behavioral disturbance require medical evaluation to rule out organic causes and ensure safety." },
        { type: "accordion", title: "Destination Selection", items: [
            { title: "Medical Clearance First", content: "Altered mental status, acute psychosis, violent behavior may be due to medical cause (hypoglycemia, hypoxia, intoxication, head injury, infection) - transport to medical ED first." },
            { title: "Pure Psychiatric", content: "If patient has known psychiatric diagnosis, no medical issues, and on 5150 hold, may transport to psychiatric facility per county protocol." },
            { title: "Dual Diagnosis", content: "Patient with both medical and psychiatric issues goes to medical ED for clearance before psychiatric placement." }
        ]},
        { type: "list", title: "Safety Considerations", items: [
            { title: "Law Enforcement", content: "Request law enforcement for violent/aggressive patients." },
            { title: "Restraints", content: "Use medical restraints per Ref. 824 when necessary for safety." },
            { title: "De-escalation", content: "Attempt verbal de-escalation first. Maintain safe distance." }
        ]}
    ]
  }
];
