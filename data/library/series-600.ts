
import { Protocol } from '../../types';

export const series600: Protocol[] = [
  {
    id: "600", refNo: "Ref. 600", title: "Record Keeping / Audit", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "folder", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Record Keeping", subtitle: "Ref. 600" }] },
        { type: "text", title: "Purpose", content: "Establishes requirements for documentation, record retention, and audit compliance for EMS agencies." },
        { type: "list", title: "General Requirements", items: [
            { title: "Completeness", content: "All patient contacts require complete documentation." },
            { title: "Accuracy", content: "Documentation must be accurate, objective, and contemporaneous." },
            { title: "Legibility", content: "Written records must be legible; electronic records must be retrievable." },
            { title: "Retention", content: "Records must be retained per state and federal requirements (minimum 7 years for adults, 7 years after age 18 for pediatrics)." }
        ]}
    ]
  },
  {
    id: "601", refNo: "Ref. 601", title: "EMS Patient Care Record (PCR) Requirements", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "description", color: "slate",
    sections: [
        { type: "header", items: [{ title: "PCR Requirements", subtitle: "Ref. 601" }] },
        { type: "text", title: "Purpose", content: "Defines minimum data elements and completion standards for EMS Patient Care Records." },
        { type: "accordion", title: "Required Elements", items: [
            { title: "Patient Demographics", content: "Name, age/DOB, gender, address (if available)." },
            { title: "Incident Details", content: "Date, time of call/arrival/transport/hospital, incident location, unit/personnel identifiers." },
            { title: "Clinical Information", content: "Chief complaint, history, physical exam findings, vital signs, treatments, medications, response to treatment." },
            { title: "Disposition", content: "Transport destination, refusal documentation, patient condition on transfer of care." }
        ]},
        { type: "list", title: "Documentation Standards", items: [
            { title: "Timely", content: "PCR completed before end of shift or within 24 hours maximum." },
            { title: "Accurate Times", content: "Use dispatch/CAD times when available; estimate if necessary and document as such." },
            { title: "Objective", content: "Document facts, not opinions. Use quotes for patient/witness statements." },
            { title: "Corrections", content: "Corrections via single line-through with date/initial (written) or addendum (electronic). Never delete or obscure original entry." }
        ]}
    ]
  },
  {
    id: "602", refNo: "Ref. 602", title: "Confidentiality of Patient Information", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "lock", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Confidentiality", subtitle: "Ref. 602" }] },
        { type: "text", content: "Adhere to HIPAA/CMIA. PHI protection." },
        { type: "list", title: "HIPAA Requirements", items: [
            { title: "Minimum Necessary", content: "Disclose only minimum PHI necessary for purpose." },
            { title: "Authorized Disclosures", content: "May release to treating providers, insurance, patient/legal representative, law enforcement (limited), public health, legal requirement." },
            { title: "Patient Rights", content: "Patients have right to access records, request corrections, accounting of disclosures." },
            { title: "Violations", content: "HIPAA violations subject to civil/criminal penalties." }
        ]},
        { type: "warning", content: "Do NOT discuss patient information in public areas, post on social media, or disclose to unauthorized persons." }
    ]
  },
  {
    id: "603", refNo: "Ref. 603", title: "Electronic Patient Care Reporting (ePCR)", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "tablet", color: "slate",
    sections: [
        { type: "header", items: [{ title: "ePCR Systems", subtitle: "Ref. 603" }] },
        { type: "text", title: "Purpose", content: "Electronic Patient Care Reporting systems improve data quality, accessibility, and integration with hospital and county systems." },
        { type: "accordion", title: "ePCR Requirements", items: [
            { title: "NEMSIS Compliant", content: "System must meet National EMS Information System (NEMSIS) version 3 standards." },
            { title: "Data Submission", content: "Agencies must submit ePCR data to LA County EMS Agency per specified timeline and format." },
            { title: "Backup Systems", content: "Paper backup PCR forms must be available if ePCR system fails." },
            { title: "Security", content: "ePCR systems must meet HIPAA security requirements (encryption, access controls, audit logs)." }
        ]},
        { type: "list", title: "User Responsibilities", items: [
            { title: "Login Security", content: "Do not share passwords or login credentials." },
            { title: "Timely Entry", content: "Complete ePCR before end of shift; avoid batching multiple days." },
            { title: "Accuracy", content: "Verify auto-populated data (times, addresses) for accuracy." },
            { title: "Digital Signatures", content: "Electronic signature constitutes legal signature - review before signing." }
        ]}
    ]
  },
  {
    id: "604", refNo: "Ref. 604", title: "Controlled Substance Documentation", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "medication", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Controlled Drugs", subtitle: "Ref. 604" }] },
        { type: "text", title: "Requirement", content: "DEA Schedule II-V controlled substances require detailed documentation and inventory tracking." },
        { type: "list", title: "Documentation Requirements", items: [
            { title: "Patient Administration", content: "Document drug name, dose, route, time, patient response in PCR." },
            { title: "Controlled Substance Log", content: "Record every administration/wastage in controlled substance log (date, time, drug, dose, patient/incident, personnel)." },
            { title: "Wastage", content: "Wasted medication must be witnessed by second provider and documented." },
            { title: "Inventory", content: "Shift check inventory and reconcile count. Report discrepancies immediately." }
        ]},
        { type: "accordion", title: "Audit Requirements", items: [
            { title: "Supervisor Review", content: "Supervisor reviews controlled substance logs weekly for discrepancies." },
            { title: "DEA Compliance", content: "Annual DEA audit of controlled substance records and inventory." },
            { title: "Discrepancy Investigation", content: "Any unexplained discrepancy triggers investigation and report to EMS Agency and DEA if indicated." }
        ]}
    ]
  },
  {
    id: "605", refNo: "Ref. 605", title: "Refusal of Care Documentation", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "cancel_presentation", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Refusal Documentation", subtitle: "Ref. 605" }] },
        { type: "text", title: "Purpose", content: "Thorough documentation of refusals protects patients and providers by demonstrating informed refusal process." },
        { type: "list", title: "Required Documentation", items: [
            { title: "Capacity Assessment", content: "Document mental status, orientation, no evidence of intoxication/altered mental status." },
            { title: "Informed Refusal", content: "Document patient was informed of findings, risks of refusal, potential consequences, alternative (transport to ED)." },
            { title: "Patient Understanding", content: "Document patient verbalized understanding of risks and still wishes to refuse." },
            { title: "Contact Information", content: "Provide and document patient received EMS callback number or 911 instructions." }
        ]},
        { type: "accordion", title: "Special Situations", items: [
            { title: "AMA Signature", content: "Obtain patient signature on refusal form. If patient refuses to sign, document this." },
            { title: "Base Contact", content: "Document Base Hospital contact for AMA evaluation when required (ALS refusals)." },
            { title: "Witness", content: "When possible, have witness to refusal (family, law enforcement, bystander)." }
        ]},
        { type: "warning", content: "Never allow patient to refuse if they lack capacity. Patients with altered mental status cannot refuse - transport or request law enforcement assistance if patient combative." }
    ]
  },
  {
    id: "606", refNo: "Ref. 606", title: "Documentation of Prehospital Care", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "edit_document", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Documentation", subtitle: "Ref. 606" }] },
        { type: "text", content: "An EMS Patient Care Record (PCR) must be completed for every patient contact." },
        { type: "list", title: "Clinical Documentation", items: [
            { title: "SOAP Format", content: "Subjective (chief complaint, history), Objective (exam, vitals), Assessment (impression), Plan (treatment, transport)." },
            { title: "Vital Signs", content: "Minimum one set of vital signs; serial vitals for ALS patients, critical patients, or > 10 min transport." },
            { title: "Treatments", content: "Document all interventions with time performed and patient response." },
            { title: "Medical Direction", content: "Document Base Hospital contact including physician name, orders received, and time." }
        ]}
    ]
  },
  {
    id: "607", refNo: "Ref. 607", title: "EMS Data Submission to LA County", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "cloud_upload", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Data Submission", subtitle: "Ref. 607" }] },
        { type: "text", title: "Requirement", content: "All EMS agencies must submit patient care data to the LA County EMS Agency for quality improvement, research, and regulatory compliance." },
        { type: "accordion", title: "Submission Requirements", items: [
            { title: "Frequency", content: "Submit ePCR data within 48 hours of patient contact (or weekly batch if approved)." },
            { title: "Format", content: "NEMSIS v3 XML format via approved secure transmission method." },
            { title: "Completeness", content: "Minimum 95% completion rate for required data elements." },
            { title: "Accuracy", content: "Agencies responsible for data quality - incomplete or inaccurate data may trigger audit." }
        ]},
        { type: "list", title: "Data Elements", items: [
            { title: "Demographics", content: "Patient demographics, incident location, times." },
            { title: "Clinical", content: "Chief complaint, vitals, exams, treatments, medications, procedures." },
            { title: "Destination", content: "Transport destination or refusal information." },
            { title: "Personnel", content: "Certification levels of attending personnel." }
        ]}
    ]
  },
  {
    id: "608", refNo: "Ref. 608", title: "Quality Improvement (QI) Program", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "trending_up", color: "slate",
    sections: [
        { type: "header", items: [{ title: "QI Program", subtitle: "Ref. 608" }] },
        { type: "text", title: "Purpose", content: "Quality Improvement programs monitor EMS performance, identify opportunities for improvement, and ensure protocol compliance." },
        { type: "list", title: "QI Components", items: [
            { title: "Case Review", content: "Random and targeted case review (cardiac arrests, traumas, medication errors, complications)." },
            { title: "Indicator Monitoring", content: "Track performance indicators (response times, protocol compliance, patient outcomes)." },
            { title: "Peer Review", content: "Colleague review of clinical care with feedback to providers." },
            { title: "Action Plans", content: "Develop corrective action plans for identified deficiencies." }
        ]},
        { type: "accordion", title: "Provider Participation", items: [
            { title: "PCR Review", content: "Providers may be asked to clarify or supplement documentation during QI review." },
            { title: "Feedback", content: "Providers receive feedback on cases - both positive recognition and opportunities for improvement." },
            { title: "Education", content: "QI findings drive continuing education topics and protocol updates." },
            { title: "Confidentiality", content: "QI activities are confidential and protected from discovery (California Evidence Code 1157)." }
        ]}
    ]
  },
  {
    id: "609", refNo: "Ref. 609", title: "Record Retention and Disposal", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "delete_forever", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Record Retention", subtitle: "Ref. 609" }] },
        { type: "text", title: "Requirement", content: "EMS records must be retained for legally mandated periods and disposed of securely." },
        { type: "list", title: "Retention Periods", items: [
            { title: "Adult Patient Records", content: "Minimum 7 years from date of service." },
            { title: "Pediatric Records", content: "Until patient turns 25 years old (7 years after age 18)." },
            { title: "Controlled Substance Logs", content: "Minimum 3 years (DEA requirement)." },
            { title: "Personnel Training Records", content: "Duration of employment + 3 years." }
        ]},
        { type: "accordion", title: "Disposal Requirements", items: [
            { title: "Secure Destruction", content: "Shred paper records or use secure document destruction service." },
            { title: "Electronic Deletion", content: "Electronic records must be permanently deleted (not just archived) with audit trail." },
            { title: "HIPAA Compliance", content: "Disposal must prevent unauthorized access to PHI." }
        ]}
    ]
  },
  {
    id: "610", refNo: "Ref. 610", title: "Ambulance Trip Report (Billing Documentation)", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "receipt", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Billing Documentation", subtitle: "Ref. 610" }] },
        { type: "text", title: "Purpose", content: "Ambulance billing requires specific documentation to support medical necessity and level of service." },
        { type: "accordion", title: "Medicare/Medi-Cal Requirements", items: [
            { title: "Medical Necessity", content: "Document why ambulance transport was medically necessary (patient condition, symptoms, vital signs, level of care required)." },
            { title: "Point of Pickup", content: "Specific address or location where patient was loaded into ambulance." },
            { title: "Destination", content: "Name and address of receiving facility." },
            { title: "Loaded Mileage", content: "Distance traveled with patient on board (closest appropriate facility)." }
        ]},
        { type: "list", title: "Level of Service Documentation", items: [
            { title: "BLS", content: "Basic Life Support - non-emergency or stable patient." },
            { title: "ALS1", content: "ALS Assessment/Treatment - ALS assessment or at least one ALS intervention." },
            { title: "ALS2", content: "Advanced ALS - minimum 3 separate ALS interventions or medication administration." },
            { title: "Specialty Care", content: "Critical care, paramedic intercept, neonatal transport." }
        ]},
        { type: "warning", content: "Insufficient documentation may result in claim denial. Document specific findings and interventions to support level of service billed." }
    ]
  },
  {
    id: "611", refNo: "Ref. 611", title: "Incident/Exposure Reporting", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "report_problem", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Incident Reporting", subtitle: "Ref. 611" }] },
        { type: "text", title: "Purpose", content: "Adverse incidents, exposures, injuries, and equipment failures must be reported to identify hazards and prevent recurrence." },
        { type: "list", title: "Reportable Events", items: [
            { title: "Personnel Injury", content: "Any injury to EMS personnel (needlestick, back injury, assault, vehicle collision)." },
            { title: "Patient Injury", content: "Injury to patient while in EMS care (fall from gurney, medication error, complication)." },
            { title: "Infectious Exposure", content: "Exposure to blood/body fluids, airborne pathogens (TB)." },
            { title: "Equipment Failure", content: "Failure of critical equipment (defibrillator, airway device, ambulance breakdown)." }
        ]},
        { type: "accordion", title: "Reporting Process", items: [
            { title: "Immediate", content: "Report to supervisor immediately or as soon as safely possible." },
            { title: "Written Report", content: "Complete incident report form within 24 hours." },
            { title: "Exposure Follow-Up", content: "Seek medical evaluation for infectious exposures (baseline testing, prophylaxis if indicated)." },
            { title: "Investigation", content: "Supervisor investigates and submits report to EMS Agency for serious events." }
        ]}
    ]
  },
  {
    id: "612", refNo: "Ref. 612", title: "Medication Error Reporting", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "medical_information", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Medication Errors", subtitle: "Ref. 612" }] },
        { type: "text", title: "Requirement", content: "Medication errors must be reported, documented, and reviewed to improve patient safety." },
        { type: "accordion", title: "Types of Medication Errors", items: [
            { title: "Wrong Drug", content: "Administered incorrect medication." },
            { title: "Wrong Dose", content: "Dose higher or lower than ordered/indicated." },
            { title: "Wrong Route", content: "Administered via incorrect route (IV vs IM)." },
            { title: "Wrong Patient", content: "Medication given to wrong patient (rare in prehospital)." },
            { title: "Omission", content: "Failure to administer indicated medication." }
        ]},
        { type: "list", title: "Reporting Process", items: [
            { title: "Recognition", content: "Recognize error and assess patient impact." },
            { title: "Notification", content: "Notify Base Hospital and receiving facility of error." },
            { title: "Documentation", content: "Document error in PCR and medication error report form." },
            { title: "No Punishment", content: "Non-punitive reporting culture - errors reported for learning, not discipline." }
        ]},
        { type: "warning", content: "Do NOT hide medication errors. Early recognition and reporting allows for corrective treatment and prevents patient harm." }
    ]
  },
  {
    id: "613", refNo: "Ref. 613", title: "Audit and Compliance Review", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "fact_check", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Audit/Compliance", subtitle: "Ref. 613" }] },
        { type: "text", title: "Purpose", content: "The LA County EMS Agency conducts audits of provider agencies to ensure compliance with regulations, protocols, and standards." },
        { type: "list", title: "Audit Types", items: [
            { title: "Routine Audit", content: "Scheduled audit of records, equipment, training, and operations." },
            { title: "Focused Audit", content: "Triggered by specific concern (complaint, pattern of issues)." },
            { title: "Announced vs Unannounced", content: "Most audits are announced; unannounced audits for suspected serious violations." },
            { title: "Records Review", content: "Review of PCRs, training records, controlled substance logs, vehicle/equipment checks." }
        ]},
        { type: "accordion", title: "Provider Responsibilities", items: [
            { title: "Cooperation", content: "Provide requested records and access for auditors." },
            { title: "Corrective Action", content: "Develop and implement corrective action plan for deficiencies within specified timeframe." },
            { title: "Follow-Up", content: "EMS Agency conducts follow-up audit to verify corrective actions." },
            { title: "Non-Compliance", content: "Failure to correct deficiencies may result in probation, suspension, or revocation of provider license." }
        ]}
    ]
  },
  {
    id: "614", refNo: "Ref. 614", title: "Special Report - Cardiac Arrest", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "ecg", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Cardiac Arrest Reporting", subtitle: "Ref. 614" }] },
        { type: "text", title: "Requirement", content: "All cardiac arrest cases require detailed documentation for Utstein-style reporting and quality improvement." },
        { type: "list", title: "Required Data Elements", items: [
            { title: "Witnessed/Unwitnessed", content: "Was arrest witnessed? If yes, by whom (bystander, EMS)?" },
            { title: "Bystander CPR", content: "Was CPR performed before EMS arrival? Compression-only or with ventilations?" },
            { title: "Initial Rhythm", content: "First monitored rhythm (VF/pVT, asystole, PEA, ROSC prior to monitoring)." },
            { title: "ROSC", content: "Return of spontaneous circulation achieved? Sustained (>= 20 min)?" },
            { title: "Interventions", content: "Defibrillations, medications, advanced airway, time intervals." }
        ]},
        { type: "accordion", title: "Outcome Reporting", items: [
            { title: "EMS Outcome", content: "ROSC in field, transported with ongoing CPR, death in field." },
            { title: "Hospital Follow-Up", content: "LA County tracks hospital outcomes (survival to admission, survival to discharge, neurologic status)." },
            { title: "Utstein Criteria", content: "Standard reporting format for cardiac arrest research and benchmarking." }
        ]}
    ]
  },
  {
    id: "615", refNo: "Ref. 615", title: "Special Report - STEMI Alert", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "favorite", color: "slate",
    sections: [
        { type: "header", items: [{ title: "STEMI Reporting", subtitle: "Ref. 615" }] },
        { type: "text", title: "Purpose", content: "STEMI cases require specific documentation to track time intervals and system performance." },
        { type: "list", title: "Required Documentation", items: [
            { title: "12-Lead ECG", content: "Attach prehospital 12-lead ECG to PCR. Document interpretation and transmission to hospital." },
            { title: "Time Intervals", content: "Symptom onset time, 12-lead acquisition time, Base contact time, hospital arrival time." },
            { title: "Base Contact", content: "Document Base Hospital STEMI Alert notification and receiving SRC activation." },
            { title: "Treatment", content: "Aspirin, nitroglycerin, IV access, pain management." }
        ]},
        { type: "accordion", title: "Performance Metrics", items: [
            { title: "EMS Goal", content: "First medical contact to 12-lead acquisition < 10 minutes." },
            { title: "Hospital Goal", content: "Door-to-balloon time < 90 minutes (hospital metric, but prehospital notification reduces delays)." },
            { title: "QI Review", content: "STEMI cases reviewed by cardiology QI committee for system performance." }
        ]}
    ]
  },
  {
    id: "616", refNo: "Ref. 616", title: "Special Report - Stroke Alert", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "neurology", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Stroke Reporting", subtitle: "Ref. 616" }] },
        { type: "text", title: "Purpose", content: "Stroke alert documentation supports time-sensitive treatment and quality improvement." },
        { type: "list", title: "Required Documentation", items: [
            { title: "Stroke Screening", content: "Document mLAPSS score and LAMS score." },
            { title: "Last Known Well", content: "Time patient was last known to be at baseline (critical for tPA eligibility)." },
            { title: "Glucose", content: "Blood glucose level (hypoglycemia can mimic stroke)." },
            { title: "Stroke Center Notification", content: "Document hospital notification and acceptance." }
        ]},
        { type: "accordion", title: "Time-Critical Elements", items: [
            { title: "Onset to EMS", content: "Time from symptom onset to EMS arrival." },
            { title: "EMS Scene Time", content: "Minimize on-scene time for suspected stroke." },
            { title: "EMS to Hospital", content: "Transport time to stroke center." },
            { title: "tPA Window", content: "IV tPA must be given within 4.5 hours of symptom onset - every minute matters." }
        ]}
    ]
  },
  {
    id: "617", refNo: "Ref. 617", title: "Special Report - Trauma", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "healing", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Trauma Reporting", subtitle: "Ref. 617" }] },
        { type: "text", title: "Purpose", content: "Major trauma cases require detailed documentation for trauma registry and quality improvement." },
        { type: "list", title: "Required Documentation", items: [
            { title: "Mechanism", content: "Detailed mechanism of injury (speed, height of fall, ejection, airbag deployment, etc.)." },
            { title: "Trauma Triage", content: "Document trauma triage tool components and score (physiologic, anatomic, mechanism)." },
            { title: "Interventions", content: "Airway management, hemorrhage control, IV access, fluid resuscitation." },
            { title: "Transport Decision", content: "Why trauma center selected (or why not if excluded)." }
        ]},
        { type: "accordion", title: "Special Circumstances", items: [
            { title: "Penetrating Trauma", content: "Number of wounds, location, suspected trajectory." },
            { title: "Burns", content: "TBSA percentage, depth, inhalation injury." },
            { title: "Prolonged Extrication", content: "Document extrication time and patient condition before/after." },
            { title: "Traumatic Arrest", content: "Time of arrest, witnessed/unwitnessed, resuscitation efforts, ROSC." }
        ]}
    ]
  },
  {
    id: "618", refNo: "Ref. 618", title: "Death in Field - Documentation", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "dangerous", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Death Documentation", subtitle: "Ref. 618" }] },
        { type: "text", title: "Requirement", content: "Deaths in the field (obvious death, resuscitation terminated, DOA) require thorough documentation for medical examiner and legal purposes." },
        { type: "list", title: "Required Documentation", items: [
            { title: "Obvious Death Criteria", content: "Document criteria met (rigor mortis, dependent lividity, decomposition, decapitation, etc.)." },
            { title: "Resuscitation Details", content: "If CPR performed, document duration, interventions, reason for termination, Base Hospital contact." },
            { title: "Scene Observations", content: "Medications present, suicide note, signs of trauma/foul play, position of body." },
            { title: "Notifications", content: "Law enforcement, medical examiner, Base Hospital." }
        ]},
        { type: "accordion", title: "Special Situations", items: [
            { title: "Suspicious Death", content: "Preserve scene, document all observations, notify law enforcement (homicide/suicide investigation)." },
            { title: "DNR/POLST", content: "Document presence of valid DNR or POLST form and decision not to resuscitate." },
            { title: "Family Present", content: "Document family notification and support provided." }
        ]}
    ]
  },
  {
    id: "619", refNo: "Ref. 619", title: "Adverse Event / Complication Reporting", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "warning", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Adverse Events", subtitle: "Ref. 619" }] },
        { type: "text", title: "Purpose", content: "Complications and adverse events during EMS care must be reported for patient safety and quality improvement." },
        { type: "list", title: "Reportable Events", items: [
            { title: "Procedure Complications", content: "Failed airway requiring surgical airway, pneumothorax from needle decompression, IV infiltration/extravasation." },
            { title: "Medication Reactions", content: "Allergic reaction, adverse drug reaction, medication error." },
            { title: "Equipment Failure", content: "Defibrillator failure during arrest, monitor malfunction, IV pump error." },
            { title: "Patient Deterioration", content: "Unexpected deterioration after EMS intervention." }
        ]},
        { type: "accordion", title: "Reporting Process", items: [
            { title: "Immediate Response", content: "Treat complication immediately. Notify Base Hospital for guidance." },
            { title: "Documentation", content: "Document event, treatment, patient response in PCR. Complete adverse event report." },
            { title: "Hospital Notification", content: "Notify receiving facility of complication during handoff." },
            { title: "Follow-Up", content: "Medical director reviews all adverse events. May trigger additional training or protocol revision." }
        ]}
    ]
  },
  {
    id: "620", refNo: "Ref. 620", title: "Addendum/Supplemental Reports", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "note_add", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Addendums", subtitle: "Ref. 620" }] },
        { type: "text", title: "Purpose", content: "Addendums allow correction of errors or addition of information to completed PCRs while maintaining integrity of original record." },
        { type: "accordion", title: "When to File Addendum", items: [
            { title: "Omitted Information", content: "Forgot to document intervention, vital signs, or relevant finding." },
            { title: "Clarification", content: "QI review requests clarification of treatment decision or documentation." },
            { title: "Correction", content: "Incorrect information needs correction (wrong medication dose, wrong time)." },
            { title: "Additional Information", content: "Information learned after PCR completed (patient outcome, hospital diagnosis)." }
        ]},
        { type: "list", title: "Addendum Requirements", items: [
            { title: "Never Alter Original", content: "Never delete, overwrite, or obscure original PCR entry." },
            { title: "Date/Time Stamp", content: "Addendum must be dated/time-stamped with date of addendum (not date of original incident)." },
            { title: "Clearly Labeled", content: "Identify as 'ADDENDUM' or 'Supplemental Report'." },
            { title: "Signature", content: "Addendum must be signed/authenticated by provider making addition." }
        ]},
        { type: "warning", content: "Addendums filed after litigation/complaint should be reviewed by legal counsel to ensure appropriate content and avoid appearance of tampering." }
    ]
  },
  {
    id: "621", refNo: "Ref. 621", title: "Subpoena and Legal Request for Records", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Legal Requests", subtitle: "Ref. 621" }] },
        { type: "text", title: "Purpose", content: "EMS records may be requested via subpoena for legal proceedings. Proper response protects patient privacy while complying with legal requirements." },
        { type: "list", title: "Types of Requests", items: [
            { title: "Subpoena Duces Tecum", content: "Legal order to produce records for court/deposition." },
            { title: "Authorization for Release", content: "Patient-signed authorization to release records to attorney/insurance." },
            { title: "Court Order", content: "Judge's order to produce records." },
            { title: "Law Enforcement", content: "Request for records in criminal investigation." }
        ]},
        { type: "accordion", title: "Response Procedures", items: [
            { title: "Verify Validity", content: "Confirm subpoena/authorization is valid and properly served." },
            { title: "Legal Review", content: "Forward to agency legal counsel for review before releasing." },
            { title: "Minimum Necessary", content: "Release only records specified in request, not entire patient chart." },
            { title: "Certification", content: "Provide certified copy with affidavit of records custodian." },
            { title: "Track Release", content: "Document date, recipient, and records released in disclosure log (HIPAA requirement)." }
        ]},
        { type: "warning", content: "Do NOT release records without valid legal request or patient authorization. HIPAA violations subject to civil/criminal penalties." }
    ]
  },
  {
    id: "622", refNo: "Ref. 622", title: "Training and Continuing Education Records", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "school", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Training Records", subtitle: "Ref. 622" }] },
        { type: "text", title: "Requirement", content: "EMS agencies must maintain records of initial training, continuing education, and skills verification for all personnel." },
        { type: "list", title: "Required Documentation", items: [
            { title: "Certification", content: "Copy of current EMT, AEMT, or Paramedic certification." },
            { title: "ACLS/PALS", content: "Copies of ACLS, PALS, PHTLS, or other specialty certifications." },
            { title: "Continuing Education", content: "Documentation of all CE hours earned (certificates, sign-in sheets, online completion records)." },
            { title: "Skills Verification", content: "Annual skills competency check-offs (intubation, IV, cardiac, etc.)." }
        ]},
        { type: "accordion", title: "LA County CE Requirements", items: [
            { title: "EMTs", content: "24 hours CE every 2 years plus LA County orientation/annual updates." },
            { title: "Paramedics", content: "48 hours CE every 2 years plus LA County specific training (Trauma Course, STEMI, Stroke, etc.)." },
            { title: "Skills Maintenance", content: "Annual skills verification for critical procedures." },
            { title: "Audit", content: "LA County EMS Agency audits training records during agency inspections." }
        ]}
    ]
  },
  {
    id: "623", refNo: "Ref. 623", title: "Vehicle and Equipment Check Documentation", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "build", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Equipment Checks", subtitle: "Ref. 623" }] },
        { type: "text", title: "Requirement", content: "Daily vehicle and equipment checks must be documented to ensure readiness and identify deficiencies." },
        { type: "list", title: "Daily Check Requirements", items: [
            { title: "Vehicle", content: "Fuel, lights, siren, tires, windshield, mirrors, safety equipment." },
            { title: "Medical Equipment", content: "Defibrillator/monitor, oxygen, suction, airway equipment, immobilization devices." },
            { title: "Medications", content: "Verify all medications present, in date, proper storage temperature." },
            { title: "Controlled Substances", content: "Inventory count and seal verification." }
        ]},
        { type: "accordion", title: "Documentation Standards", items: [
            { title: "Written Record", content: "Complete daily check sheet - date, time, personnel signature." },
            { title: "Deficiencies", content: "Document any deficiencies and corrective action taken (item replaced, unit taken out of service)." },
            { title: "Supervisor Review", content: "Supervisor reviews check sheets and ensures deficiencies corrected." },
            { title: "Retention", content: "Retain equipment check records for 3 years for audit purposes." }
        ]},
        { type: "warning", content: "Unit shall not respond to calls with known equipment deficiencies that would compromise patient care (no oxygen, defibrillator failure, etc.)." }
    ]
  },
  {
    id: "624", refNo: "Ref. 624", title: "Base Hospital Contact Documentation", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "phone_in_talk", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Base Contact", subtitle: "Ref. 624" }] },
        { type: "text", title: "Requirement", content: "All Base Hospital contacts for medical direction must be documented in the PCR." },
        { type: "list", title: "Required Documentation", items: [
            { title: "Physician Name", content: "Full name of Base Hospital physician providing orders." },
            { title: "Base Hospital", content: "Name of Base Hospital facility." },
            { title: "Time of Contact", content: "Exact time of Base Hospital contact." },
            { title: "Orders Received", content: "Specific orders or recommendations provided by physician." },
            { title: "Repeat Back", content: "Document that orders were repeated back for confirmation (critical for medication orders)." }
        ]},
        { type: "accordion", title: "Types of Base Contacts", items: [
            { title: "Treatment Orders", content: "Requesting orders beyond standing orders (additional medications, procedures)." },
            { title: "Destination Consult", content: "Clarification on appropriate destination." },
            { title: "AMA Evaluation", content: "Physician evaluation of patient refusing transport." },
            { title: "STEMI/Stroke Alert", content: "Notification of specialty center activation." },
            { title: "Pronouncement", content: "Request for pronouncement of death or termination of resuscitation." }
        ]},
        { type: "warning", content: "Failure to document Base Hospital contact may result in QI review or allegations of practicing beyond scope." }
    ]
  },
  {
    id: "625", refNo: "Ref. 625", title: "Research Data Collection and Consent", category: "Record Keeping", type: "Policy", lastUpdated: "2024", icon: "science", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Research", subtitle: "Ref. 625" }] },
        { type: "text", title: "Purpose", content: "EMS agencies may participate in research studies to advance prehospital medicine. Research involving patient data or intervention requires IRB approval and appropriate consent." },
        { type: "accordion", title: "Research Requirements", items: [
            { title: "IRB Approval", content: "All research must be approved by Institutional Review Board (IRB) before initiation." },
            { title: "Informed Consent", content: "Prospective studies generally require informed consent from patients (or exception from informed consent for emergency research)." },
            { title: "Data Use Agreement", content: "Retrospective chart review requires data use agreement and HIPAA waiver or de-identification." },
            { title: "LA County Approval", content: "Research involving LA County EMS system requires Medical Director and EMS Agency approval." }
        ]},
        { type: "list", title: "Provider Participation", items: [
            { title: "Training", content: "Providers participating in research receive study-specific training on protocols and data collection." },
            { title: "Data Quality", content: "Research data must be complete and accurate - missing data may invalidate study." },
            { title: "Voluntary", content: "Provider participation in research is generally voluntary (except system-wide protocol changes)." },
            { title: "Confidentiality", content: "Research data is confidential and protected. Patient identifiers removed for analysis." }
        ]}
    ]
  }
];
