
import { Protocol } from '../../types';

export const series200: Protocol[] = [
  {
    id: "200", refNo: "Ref. 200", title: "Local EMS Agency Authority", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "apartment", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Local EMS Agency", subtitle: "Ref. 200" }] },
      { type: "text", title: "Authority", content: "LA County Department of Health Services, Emergency Medical Services Agency (LEMSA) is designated as the Local EMS Agency per California H&S Code §1797.200." },
      { type: "list", title: "Responsibilities", items: [
        { title: "System Planning", content: "Develop and implement the EMS System Plan and Medical Control Plan." },
        { title: "Policy Development", content: "Establish prehospital care policies, protocols, and procedures." },
        { title: "Quality Improvement", content: "Monitor and evaluate the quality of EMS care through QI programs." },
        { title: "Certification", content: "Certify paramedics and accredit providers within LA County." }
      ]}
    ]
  },
  {
    id: "201", refNo: "Ref. 201", title: "Medical Management of Prehospital Care", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "medical_services", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Medical Management", subtitle: "Ref. 201" }] },
      { type: "text", content: "Outlines the medical control hierarchy and responsibilities." },
      { type: "accordion", title: "Medical Control Structure", items: [
        { title: "EMS Medical Director", content: "Physician responsible for all aspects of medical care in the EMS system. Oversees policy development and quality assurance." },
        { title: "Base Hospital Medical Director", content: "Physician at designated Base Hospital responsible for direct medical control and paramedic training/evaluation." },
        { title: "Provider Agency Medical Director", content: "Physician advisor to provider agencies on clinical and operational matters." }
      ]}
    ]
  },
  {
    id: "202", refNo: "Ref. 202", title: "Policy Development and Revision Process", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "policy", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Policy Development", subtitle: "Ref. 202" }] },
      { type: "text", title: "Process", content: "EMS policies are developed through a collaborative process involving medical direction, provider agencies, and the EMS Commission." },
      { type: "list", title: "Steps", items: [
        { title: "1. Proposal", content: "Policy changes may be initiated by EMS Agency staff, Medical Director, Base Hospitals, or provider agencies." },
        { title: "2. Review", content: "Draft policies are reviewed by stakeholder committees and medical advisory groups." },
        { title: "3. Approval", content: "Final policies are approved by the EMS Medical Director and/or EMS Commission." },
        { title: "4. Distribution", content: "Policies are distributed to all affected parties with effective dates specified." }
      ]}
    ]
  },
  {
    id: "203", refNo: "Ref. 203", title: "EMS System Policies and Procedures", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "description", color: "slate",
    sections: [
      { type: "header", items: [{ title: "EMS System Policies", subtitle: "Ref. 203" }] },
      { type: "text", title: "Overview", content: "The EMS Agency maintains comprehensive system-wide policies governing all aspects of prehospital care delivery in LA County." },
      { type: "accordion", title: "Policy Categories", items: [
        { title: "Clinical Protocols", content: "Treatment protocols and standing orders that define paramedic scope of practice and patient care procedures." },
        { title: "Operational Policies", content: "Standards for response, transport, communications, and field operations." },
        { title: "Administrative Policies", content: "Provider accreditation, personnel certification, quality improvement, and compliance requirements." },
        { title: "Special Circumstances", content: "Disaster response, hazardous materials, mass casualty incidents, and terrorism response procedures." }
      ]},
      { type: "text", title: "Compliance", content: "All provider agencies, paramedics, and Base Hospitals must adhere to published EMS policies. Violations may result in disciplinary action including suspension or revocation of certification/accreditation." }
    ]
  },
  {
    id: "204", refNo: "Ref. 204", title: "EMS Agency Contact Information", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "contact_phone", color: "slate",
    sections: [
      { type: "header", items: [{ title: "EMS Agency Contact", subtitle: "Ref. 204" }] },
      { type: "text", title: "Main Office", content: "LA County EMS Agency - Department of Health Services<br>5555 Ferguson Drive, Commerce, CA 90022" },
      { type: "list", title: "Divisions", items: [
        { title: "Administration", content: "Policy, planning, and general inquiries." },
        { title: "Training & Certification", content: "Paramedic accreditation, course approvals, provider authorization." },
        { title: "Quality Improvement", content: "Clinical audits, base station monitoring, complaint investigation." },
        { title: "Data & Technology", content: "ePCR systems, ReddiNet, data reporting." }
      ]}
    ]
  },
  {
    id: "205", refNo: "Ref. 205", title: "Medical Direction Standards", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "medical_information", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Medical Direction", subtitle: "Ref. 205" }] },
      { type: "text", title: "Overview", content: "Medical direction is the oversight of patient care by physicians and involves both online (direct) and offline (indirect) medical control." },
      { type: "accordion", title: "Types of Medical Direction", items: [
        { title: "Online Medical Direction", content: "Real-time physician or MICN guidance provided via radio or telephone. Required for interventions beyond standing orders and high-risk situations." },
        { title: "Offline Medical Direction", content: "Indirect oversight through protocol development, training, quality improvement, and system design. Provided by EMS Medical Director and Base Hospital Medical Directors." },
        { title: "Standing Orders", content: "Pre-approved treatment protocols that allow paramedics to initiate specific interventions without direct Base contact." }
      ]},
      { type: "list", title: "Medical Director Qualifications", items: [
        { title: "Licensure", content: "Current unrestricted California medical license." },
        { title: "Experience", content: "Board certification in Emergency Medicine, Internal Medicine, or Family Medicine. Experience in prehospital care preferred." },
        { title: "Responsibilities", content: "Protocol development, quality assurance, training oversight, and clinical leadership." }
      ]}
    ]
  },
  {
    id: "206", refNo: "Ref. 206", title: "EMS Commission Ordinance", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "policy", color: "slate",
    sections: [
      { type: "header", items: [{ title: "EMS Commission", subtitle: "Ref. 206" }] },
      { type: "text", title: "Purpose", content: "The EMS Commission advises the Board of Supervisors on EMS matters and reviews policies, standards, and system performance." },
      { type: "list", title: "Composition", items: [
        { title: "Membership", content: "Physicians, nurses, paramedics, fire chiefs, hospital administrators, and public representatives." },
        { title: "Meetings", content: "Quarterly public meetings to review system issues and policy recommendations." },
        { title: "Authority", content: "Advisory body with no direct operational control, but significant influence on policy direction." }
      ]}
    ]
  },
  {
    id: "207", refNo: "Ref. 207", title: "Quality Improvement Program Structure", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "assessment", color: "slate",
    sections: [
      { type: "header", items: [{ title: "QI Program Structure", subtitle: "Ref. 207" }] },
      { type: "text", title: "Overview", content: "The LA County EMS Quality Improvement Program is a comprehensive system for monitoring, evaluating, and improving prehospital care." },
      { type: "accordion", title: "Program Components", items: [
        { title: "Prospective Review", content: "Protocol development, education programs, and preventive measures implemented before patient care occurs." },
        { title: "Concurrent Review", content: "Real-time monitoring including Base Hospital oversight, field supervisor observation, and online medical direction quality." },
        { title: "Retrospective Review", content: "Post-event analysis through ePCR audits, outcome studies, and clinical performance indicator tracking." }
      ]},
      { type: "list", title: "QI Activities", items: [
        { title: "Case Review", content: "Individual case audits for high-risk situations: Cardiac arrest, trauma, pediatric emergencies, airway management." },
        { title: "Trend Analysis", content: "System-wide data analysis to identify patterns and opportunities for improvement." },
        { title: "Feedback Loop", content: "Results communicated to providers through individual counseling, aggregate reports, and continuing education." }
      ]}
    ]
  },
  {
    id: "208", refNo: "Ref. 208", title: "Medical Advisory Committee", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "groups", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Medical Advisory Committee", subtitle: "Ref. 208" }] },
      { type: "text", content: "The Medical Advisory Committee (MAC) provides clinical expertise and recommendations to the EMS Medical Director on protocol development and quality improvement initiatives." },
      { type: "text", title: "Membership", content: "Includes Base Hospital Medical Directors, Emergency Physicians, and specialty consultants." }
    ]
  },
  {
    id: "209", refNo: "Ref. 209", title: "Data Collection and Reporting Requirements", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "database", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Data Collection", subtitle: "Ref. 209" }] },
      { type: "text", title: "Purpose", content: "Comprehensive data collection enables system monitoring, quality improvement, research, and regulatory compliance." },
      { type: "accordion", title: "Data Elements", items: [
        { title: "Patient Demographics", content: "Age, sex, chief complaint, location. Collected per NEMSIS 3.4 national standards." },
        { title: "Clinical Data", content: "Vital signs, assessment findings, interventions performed, medications administered, patient outcomes." },
        { title: "System Performance", content: "Response times, unit utilization, hospital destination, transport disposition." },
        { title: "Quality Indicators", content: "Cardiac arrest survival rates, STEMI/Stroke activation times, protocol compliance metrics." }
      ]},
      { type: "list", title: "Reporting Requirements", items: [
        { title: "ePCR Submission", content: "All patient care reports submitted electronically within 24 hours to EMS Agency database." },
        { title: "Special Incidents", content: "Immediate notification for: Deaths in EMS care, medication errors, equipment failures, critical incidents." },
        { title: "Aggregate Reports", content: "Quarterly system performance reports to EMS Commission and stakeholders." }
      ]}
    ]
  },
  {
    id: "210", refNo: "Ref. 210", title: "EMS Agency Organizational Chart", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "account_tree", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Org Chart", subtitle: "Ref. 210" }] },
      { type: "text", title: "Structure", content: "The EMS Agency operates under the LA County Department of Health Services. The EMS Director reports to the Chief Medical Officer." },
      { type: "list", title: "Key Positions", items: [
        { title: "EMS Director", content: "Administrative head of the Agency." },
        { title: "EMS Medical Director", content: "Physician responsible for medical oversight." },
        { title: "Assistant Directors", content: "Oversee Training, Quality Improvement, and Operations divisions." }
      ]}
    ]
  },
  {
    id: "211", refNo: "Ref. 211", title: "Communications Systems and Standards", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "broadcast_on_home", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Communications Standards", subtitle: "Ref. 211" }] },
      { type: "text", title: "Overview", content: "Reliable communications infrastructure is essential for coordinated emergency response and medical direction." },
      { type: "accordion", title: "Communication Systems", items: [
        { title: "Radio System", content: "800 MHz trunked radio system provides primary communications between field units, dispatch, and Base Hospitals. Regional interoperability with adjacent counties." },
        { title: "Telephone Systems", content: "Cellular and landline backup for Base contact. Encrypted systems for HIPAA-compliant patient information transmission." },
        { title: "Data Systems", content: "12-lead ECG transmission, ePCR connectivity, hospital status updates via ReddiNet." },
        { title: "Emergency Backup", content: "Redundant systems ensure communications during disasters. Satellite phones available for major incidents." }
      ]},
      { type: "list", title: "Standards", items: [
        { title: "Equipment Testing", content: "Daily radio checks required. Equipment failures reported immediately to dispatch and Base Hospital." },
        { title: "Communication Protocols", content: "Clear, concise radio reports using standard terminology. HIPAA compliance maintained for all patient information." },
        { title: "Interoperability", content: "Compatible systems allow mutual aid with neighboring EMS systems and public safety agencies." }
      ]}
    ]
  },
  {
    id: "212", refNo: "Ref. 212", title: "Provider Agency Accreditation", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "verified", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider Accreditation", subtitle: "Ref. 212" }] },
      { type: "text", title: "Purpose", content: "All paramedic provider agencies must be accredited by the EMS Agency to operate within LA County." },
      { type: "accordion", title: "Requirements", items: [
        { title: "Application", content: "Submit application with proof of business license, insurance, and medical director agreement." },
        { title: "Site Inspection", content: "Facility, vehicles, equipment, and operational procedures are inspected." },
        { title: "Personnel Verification", content: "All paramedics must hold valid LA County accreditation." },
        { title: "Annual Renewal", content: "Accreditation must be renewed annually with updated documentation." }
      ]}
    ]
  },
  {
    id: "213", refNo: "Ref. 213", title: "Dispatch and Call Processing Protocols", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "call", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Dispatch Protocols", subtitle: "Ref. 213" }] },
      { type: "text", title: "Emergency Medical Dispatch (EMD)", content: "All 9-1-1 dispatch centers use certified Emergency Medical Dispatch protocols to systematically assess caller information and provide pre-arrival instructions." },
      { type: "accordion", title: "EMD Functions", items: [
        { title: "Call Triage", content: "Systematically determine patient acuity using standardized questioning protocols. Assign appropriate response priority (Code 2 or Code 3)." },
        { title: "Pre-Arrival Instructions", content: "Provide lifesaving instructions to caller before unit arrival: CPR coaching, hemorrhage control, airway positioning, childbirth assistance." },
        { title: "Resource Deployment", content: "Dispatch appropriate resources based on complaint: ALS vs BLS, single vs multiple units, specialty resources (rescue, hazmat)." },
        { title: "Time Stamping", content: "Document critical time intervals: Call received, units dispatched, en route, on scene, patient contact, hospital arrival." }
      ]},
      { type: "text", title: "Quality Assurance", content: "All 9-1-1 calls recorded and audited for EMD protocol compliance, accuracy, and customer service." }
    ]
  },
  {
    id: "214", refNo: "Ref. 214", title: "Base Hospital Reporting Requirements", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "report", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Base Reporting", subtitle: "Ref. 214" }] },
      { type: "text", content: "Paramedics must contact Base Hospital for all patients meeting Base Contact criteria (Ref. 808). Report includes: Age, Sex, Chief Complaint, Vitals, Treatment, and ETA." },
      { type: "list", title: "Base Contact Required For", items: [
        { title: "Standing Orders", content: "All interventions beyond standing order scope require Base contact." },
        { title: "High-Risk Patients", content: "STEMI, Stroke, Major Trauma, Cardiac Arrest, Airway Management." },
        { title: "Refusal of Care", content: "AMA refusals for patients with abnormal vitals or altered mental status." }
      ]}
    ]
  },
  {
    id: "215", refNo: "Ref. 215", title: "Response Time Standards and Monitoring", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "timer", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Response Time Standards", subtitle: "Ref. 215" }] },
      { type: "text", title: "Purpose", content: "Response time standards ensure timely access to emergency medical care and are monitored system-wide for performance improvement." },
      { type: "accordion", title: "Time Intervals", items: [
        { title: "Call Processing Time", content: "Time from 9-1-1 call answered to unit dispatch. Goal: <90 seconds for emergency calls." },
        { title: "Turnout Time", content: "Time from dispatch to unit en route. Goal: <60 seconds for fire-based units, <90 seconds for private ambulances." },
        { title: "Travel Time", content: "Time from en route to on scene. Varies based on geography and traffic. Urban goal: <8 minutes 90th percentile." },
        { title: "Total Response Time", content: "Call received to unit arrival on scene. Urban goal: <10 minutes for ALS response 90th percentile." }
      ]},
      { type: "list", title: "Monitoring and Reporting", items: [
        { title: "Data Collection", content: "All response time intervals tracked via CAD systems and submitted to EMS Agency monthly." },
        { title: "System Analysis", content: "Response time data analyzed by geographic area, time of day, and provider agency." },
        { title: "Performance Improvement", content: "Units with prolonged response times may require deployment adjustments or additional resources." }
      ]}
    ]
  },
  {
    id: "216", refNo: "Ref. 216", title: "Quality Improvement Program", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "trending_up", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Quality Improvement", subtitle: "Ref. 216" }] },
      { type: "text", title: "Overview", content: "The QI Program monitors and evaluates EMS care through prospective, concurrent, and retrospective review activities." },
      { type: "accordion", title: "Components", items: [
        { title: "Base Station Monitoring", content: "Review of radio/telephone medical direction. Minimum 10% of all ALS calls reviewed." },
        { title: "PCR Audits", content: "Electronic Patient Care Reports audited for documentation quality and protocol compliance." },
        { title: "Clinical Performance Indicators", content: "Tracked metrics include: Cardiac arrest survival, STEMI/Stroke activation times, Airway success rates." },
        { title: "Complaint Investigation", content: "All complaints regarding paramedic care are investigated and documented." }
      ]}
    ]
  },
  {
    id: "217", refNo: "Ref. 217", title: "Mutual Aid and Regional Coordination", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "compare_arrows", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Mutual Aid Agreements", subtitle: "Ref. 217" }] },
      { type: "text", title: "Overview", content: "Mutual aid agreements enable neighboring EMS systems to share resources during high-demand periods, major incidents, and disasters." },
      { type: "accordion", title: "Mutual Aid Types", items: [
        { title: "Automatic Aid", content: "Pre-planned response of closest appropriate unit regardless of jurisdictional boundaries. Common in border areas." },
        { title: "Requested Mutual Aid", content: "Assistance requested when local resources are exhausted. Coordinated through dispatch centers and EMS Agency." },
        { title: "Disaster Mutual Aid", content: "Large-scale resource sharing during declared disasters through California Emergency Management Agency (CalEMA) and regional coordination." }
      ]},
      { type: "list", title: "Regional Coordination", items: [
        { title: "Medical Task Force", content: "LA County coordinates regional EMS Medical Task Forces for disaster deployment statewide." },
        { title: "Interoperability", content: "Compatible communications equipment and standardized protocols facilitate mutual aid operations." },
        { title: "Reimbursement", content: "Mutual aid costs may be reimbursed through disaster declarations and FEMA assistance programs." }
      ]}
    ]
  },
  {
    id: "218", refNo: "Ref. 218", title: "Continuing Education Requirements", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "school", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Continuing Education", subtitle: "Ref. 218" }] },
      { type: "text", title: "Purpose", content: "Maintain clinical competency and knowledge of current protocols through ongoing education." },
      { type: "list", title: "Requirements", items: [
        { title: "Hours", content: "48 hours of approved CE every 2 years for LA County paramedic recertification." },
        { title: "Topics", content: "Must include Trauma, Medical, Pediatrics, and Pharmacology components." },
        { title: "Skills Verification", content: "Annual competency testing for high-risk skills (intubation, IO access, 12-lead interpretation)." }
      ]}
    ]
  },
  {
    id: "219", refNo: "Ref. 219", title: "Disaster Preparedness and Response Planning", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "emergency", color: "red",
    sections: [
      { type: "header", items: [{ title: "Disaster Planning", subtitle: "Ref. 219" }] },
      { type: "text", title: "Overview", content: "Comprehensive disaster planning ensures coordinated EMS response to natural disasters, terrorism, and mass casualty incidents." },
      { type: "accordion", title: "Disaster Response Elements", items: [
        { title: "Emergency Operations Center (EOC)", content: "County EOC coordinates multi-agency disaster response. EMS Agency provides EMS Branch Director and operational coordination." },
        { title: "Incident Command System (ICS)", content: "All EMS personnel trained in NIMS/ICS. Field operations organized under Incident Command structure." },
        { title: "Medical Task Forces", content: "Pre-designated ambulance strike teams and medical task forces available for rapid deployment." },
        { title: "Hospital Surge Capacity", content: "Hospitals maintain surge plans and participate in disaster drills. ReddiNet tracks regional capacity during disasters." }
      ]},
      { type: "list", title: "Disaster Types", items: [
        { title: "Natural Disasters", content: "Earthquakes, wildfires, floods. EMS maintains earthquake disaster plans and wildfire evacuation protocols." },
        { title: "Mass Casualty Incidents", content: "Multi-patient events requiring triage, treatment, and transport coordination. Field triage using START/JumpSTART." },
        { title: "Terrorism/CBRNE", content: "Chemical, Biological, Radiological, Nuclear, Explosive incidents. Specialized response teams and decontamination protocols." }
      ]}
    ]
  },
  {
    id: "220", refNo: "Ref. 220", title: "Equipment Standards", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "medical_services", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Equipment Standards", subtitle: "Ref. 220" }] },
      { type: "text", content: "ALS units must carry equipment as specified in CCR Title 22 and LA County EMS requirements." },
      { type: "text", title: "Monitoring", content: "Annual equipment inspections verify compliance. Deficiencies must be corrected immediately." }
    ]
  },
  {
    id: "221", refNo: "Ref. 221", title: "Public Education and Community Outreach", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "campaign", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Public Education", subtitle: "Ref. 221" }] },
      { type: "text", title: "Purpose", content: "Public education programs promote injury prevention, CPR training, and appropriate 9-1-1 utilization." },
      { type: "accordion", title: "Programs", items: [
        { title: "CPR/AED Training", content: "Community CPR classes and public access defibrillation programs increase bystander intervention for cardiac arrest." },
        { title: "Injury Prevention", content: "Fire safety, fall prevention, car seat safety, and drowning prevention education programs targeted to high-risk populations." },
        { title: "9-1-1 Education", content: "Appropriate 9-1-1 use campaigns to reduce non-emergency calls and improve system efficiency." },
        { title: "School Programs", content: "Age-appropriate safety education in schools including choking prevention, bicycle safety, and anti-bullying." }
      ]},
      { type: "text", title: "Community Partnerships", content: "EMS Agency collaborates with fire departments, hospitals, schools, and community organizations to deliver public education programs county-wide." }
    ]
  },
  {
    id: "222", refNo: "Ref. 222", title: "Medication Formulary", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "medication", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Medication Formulary", subtitle: "Ref. 222" }] },
      { type: "text", title: "Approved Medications", content: "The LA County paramedic medication formulary includes drugs approved for standing order and base hospital order administration." },
      { type: "list", title: "Categories", items: [
        { title: "Cardiac", content: "Epinephrine, Amiodarone, Atropine, Lidocaine, Adenosine, Aspirin, Nitroglycerin." },
        { title: "Respiratory", content: "Albuterol, Atrovent (Ipratropium)." },
        { title: "Pain/Sedation", content: "Fentanyl, Morphine, Midazolam." },
        { title: "Other", content: "Dextrose 10%, Naloxone, Ondansetron, Diphenhydramine, Glucagon, Calcium Chloride, Sodium Bicarbonate." }
      ]},
      { type: "text", title: "Changes", content: "Medication additions or deletions require EMS Medical Director approval and provider notification." }
    ]
  },
  {
    id: "223", refNo: "Ref. 223", title: "Medical Accountability and Oversight", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Medical Accountability", subtitle: "Ref. 223" }] },
      { type: "text", title: "Purpose", content: "Medical accountability ensures paramedics provide care consistent with protocols, maintain competency, and adhere to professional standards." },
      { type: "accordion", title: "Accountability Mechanisms", items: [
        { title: "Quality Assurance Review", content: "Regular review of patient care reports, Base Hospital recordings, and clinical performance metrics identify practice patterns and deviations." },
        { title: "Peer Review", content: "Clinical cases reviewed by medical directors and peer paramedics to assess appropriateness of care and adherence to protocols." },
        { title: "Remedial Training", content: "Paramedics with identified deficiencies may be required to complete additional education, skills verification, or supervised field internships." },
        { title: "Disciplinary Action", content: "Serious violations may result in temporary suspension, probation, or revocation of LA County accreditation." }
      ]},
      { type: "text", title: "Due Process", content: "Paramedics have the right to review findings, respond to allegations, and appeal disciplinary actions through established grievance procedures." }
    ]
  },
  {
    id: "224", refNo: "Ref. 224", title: "Documentation Standards", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "description", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Documentation Standards", subtitle: "Ref. 224" }] },
      { type: "text", title: "Electronic Patient Care Report (ePCR)", content: "All patient contacts must be documented using an approved ePCR system in compliance with NEMSIS 3.4 standards." },
      { type: "accordion", title: "Requirements", items: [
        { title: "Timeliness", content: "ePCRs must be completed and submitted within 24 hours of patient contact." },
        { title: "Accuracy", content: "All required fields must be completed. Narrative must describe assessment, treatment, and patient response." },
        { title: "Base Contact", content: "Document Base Hospital name, MICN name, orders received, and times." },
        { title: "Signatures", content: "Electronic signature required by paramedic and receiving RN/MD." }
      ]}
    ]
  },
  {
    id: "225", refNo: "Ref. 225", title: "Clinical Protocol Compliance Monitoring", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "rule", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Protocol Compliance", subtitle: "Ref. 225" }] },
      { type: "text", title: "Purpose", content: "Systematic monitoring of protocol compliance ensures standardized, evidence-based patient care across the EMS system." },
      { type: "accordion", title: "Compliance Monitoring", items: [
        { title: "Automated Audits", content: "ePCR systems flag potential protocol violations: Missing required Base contacts, contraindicated medications, vital signs outside parameters." },
        { title: "Manual Review", content: "EMS Agency and Base Hospital QI staff review flagged cases for actual vs. perceived protocol deviations." },
        { title: "Variance Reporting", content: "Justified protocol variances (clinical judgment, patient safety) documented and reviewed separately from true protocol violations." },
        { title: "Trend Analysis", content: "Aggregate compliance data identifies system-wide patterns requiring protocol clarification or additional training." }
      ]},
      { type: "text", title: "Performance Targets", content: "System-wide protocol compliance goal: >95% for critical interventions (12-lead acquisition, appropriate destination, medication dosing)." }
    ]
  },
  {
    id: "226", refNo: "Ref. 226", title: "Data Reporting", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "analytics", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Data Reporting", subtitle: "Ref. 226" }] },
      { type: "text", content: "Provider agencies must submit ePCR data to the EMS Agency on a regular schedule for system monitoring and quality improvement." },
      { type: "text", title: "Special Reports", content: "Certain events require immediate reporting: Cardiac arrest survival, medication errors, equipment failures, provider injuries." }
    ]
  },
  {
    id: "227", refNo: "Ref. 227", title: "Personnel Certification and Credentialing Standards", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "card_membership", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Personnel Standards", subtitle: "Ref. 227" }] },
      { type: "text", title: "Overview", content: "All prehospital personnel must maintain appropriate certification and meet county-specific credentialing requirements." },
      { type: "accordion", title: "Certification Levels", items: [
        { title: "EMT-Basic", content: "State certification requires NREMT exam or state practical exam. Valid for 2 years. Continuing education: 24 hours per renewal cycle." },
        { title: "Advanced EMT (AEMT)", content: "State certification with expanded scope including IV therapy and advanced airways. CE: 36 hours per 2 years." },
        { title: "Paramedic (EMT-P)", content: "State paramedic license plus LA County accreditation. CE: 48 hours per 2 years. Annual skills verification required." },
        { title: "Mobile Intensive Care Nurse (MICN)", content: "RN license plus 40-hour MICN course and Base Hospital authorization." }
      ]},
      { type: "list", title: "LA County Requirements", items: [
        { title: "Accreditation", content: "Paramedics must complete LA County orientation, protocol exam, and field internship for county accreditation." },
        { title: "Background", content: "Criminal background check required for all field personnel." },
        { title: "Health Screening", content: "Physical exam, immunizations (Hepatitis B, MMR, Tdap, flu), TB testing." }
      ]}
    ]
  },
  {
    id: "228", refNo: "Ref. 228", title: "ReddiNet Utilization", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "wifi_tethering", color: "slate",
    sections: [
      { type: "header", items: [{ title: "ReddiNet", subtitle: "Ref. 228" }] },
      { type: "text", content: "ReddiNet is the regional hospital status and communication system used for MCI management and hospital diversion status tracking." },
      { type: "list", title: "Functions", items: [
        { title: "Hospital Status", content: "Real-time updates on ED saturation, trauma diversion, CT diversion, and specialty center availability." },
        { title: "MCI Management", content: "During Mass Casualty Incidents, ReddiNet coordinates patient distribution among hospitals." },
        { title: "Resource Requests", content: "Hospitals can request specialized resources (ventilators, burn beds, etc.) system-wide." }
      ]}
    ]
  },
  {
    id: "229", refNo: "Ref. 229", title: "Paramedic Continuing Education Programs", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "local_library", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Continuing Education Programs", subtitle: "Ref. 229" }] },
      { type: "text", title: "Purpose", content: "Structured continuing education ensures paramedics maintain current knowledge and competency throughout their careers." },
      { type: "accordion", title: "CE Program Types", items: [
        { title: "Protocol Updates", content: "Mandatory training when protocols change. All paramedics must complete update training before implementation." },
        { title: "Skills Labs", content: "Hands-on practice for high-risk procedures: Advanced airway management, IO access, 12-lead interpretation, medication calculations." },
        { title: "Case Reviews", content: "Analysis of actual cases (cardiac arrest, trauma, pediatric emergencies) to reinforce decision-making and protocol application." },
        { title: "Simulation Training", content: "High-fidelity simulation scenarios for team-based resuscitation, communication, and crisis resource management." }
      ]},
      { type: "list", title: "Approval Process", items: [
        { title: "Course Approval", content: "CE courses must be approved by EMS Agency or state-accredited continuing education providers." },
        { title: "Documentation", content: "Completion certificates maintained by paramedic and provider agency. Submitted with recertification application." },
        { title: "Audit", content: "EMS Agency may audit CE records to verify compliance with requirements." }
      ]}
    ]
  },
  {
    id: "230", refNo: "Ref. 230", title: "Communication Systems", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "radio", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Communication Systems", subtitle: "Ref. 230" }] },
      { type: "text", title: "Requirements", content: "All ALS units must have operational radio and telephone communication capabilities to contact Base Hospitals and receiving facilities." },
      { type: "list", title: "Systems", items: [
        { title: "800 MHz Radio", content: "Primary communication system for Base Hospital medical direction." },
        { title: "Cellular Telephone", content: "Backup for Base contact and facility notification." },
        { title: "Data Systems", content: "ePCR and 12-lead ECG transmission capability required." }
      ]}
    ]
  },
  {
    id: "231", refNo: "Ref. 231", title: "Infection Control and Prevention Standards", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "sanitizer", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Infection Control Standards", subtitle: "Ref. 231" }] },
      { type: "text", title: "Purpose", content: "Comprehensive infection control practices protect patients and EMS personnel from transmission of infectious diseases." },
      { type: "accordion", title: "Standard Precautions", items: [
        { title: "Hand Hygiene", content: "Hand washing with soap and water or alcohol-based hand sanitizer before and after every patient contact. Critical for preventing pathogen transmission." },
        { title: "Personal Protective Equipment", content: "Use appropriate PPE based on exposure risk: Gloves for all patient contact, masks/eye protection for respiratory symptoms or splashing risk, gowns for heavy contamination." },
        { title: "Respiratory Hygiene", content: "Surgical masks for coughing patients. N95 respirators for suspected TB, measles, or other airborne diseases." },
        { title: "Safe Injection Practices", content: "One needle, one syringe, one patient. Never reuse needles or syringes. Dispose in sharps containers immediately after use." }
      ]},
      { type: "list", title: "Vehicle Decontamination", items: [
        { title: "Routine Cleaning", content: "Clean and disinfect patient contact surfaces between calls using EPA-approved hospital-grade disinfectant." },
        { title: "High-Level Disinfection", content: "Extended contact time disinfection after exposure to known infectious diseases (C. diff, norovirus, TB, COVID-19)." },
        { title: "Equipment Processing", content: "Reusable equipment cleaned, disinfected, or sterilized per manufacturer specifications." }
      ]}
    ]
  },
  {
    id: "232", refNo: "Ref. 232", title: "Disaster Preparedness", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "warning", color: "red",
    sections: [
      { type: "header", items: [{ title: "Disaster Preparedness", subtitle: "Ref. 232" }] },
      { type: "text", content: "All provider agencies must maintain disaster response plans and participate in regional disaster drills." },
      { type: "text", title: "Activation", content: "EMS Agency coordinates regional EMS disaster response through the EMS Operational Area Coordinator (OAC)." }
    ]
  },
  {
    id: "233", refNo: "Ref. 233", title: "HIPAA Privacy and Confidentiality Compliance", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "privacy_tip", color: "slate",
    sections: [
      { type: "header", items: [{ title: "HIPAA Compliance", subtitle: "Ref. 233" }] },
      { type: "text", title: "Purpose", content: "HIPAA regulations protect patient privacy and confidentiality of protected health information (PHI)." },
      { type: "accordion", title: "HIPAA Requirements", items: [
        { title: "Privacy Rule", content: "PHI may only be disclosed for treatment, payment, or healthcare operations without patient authorization. All other disclosures require written consent." },
        { title: "Security Rule", content: "Electronic PHI must be protected through technical safeguards: Password-protected ePCR systems, encrypted data transmission, audit logs of access." },
        { title: "Breach Notification", content: "Unauthorized disclosure of PHI must be reported to patients, EMS Agency, and federal authorities per breach notification requirements." },
        { title: "Minimum Necessary", content: "Disclose only the minimum PHI necessary to accomplish the intended purpose. Avoid discussing patient information in public areas." }
      ]},
      { type: "list", title: "EMS-Specific Considerations", items: [
        { title: "Scene Privacy", content: "Maintain patient privacy during scene operations when feasible. Limit bystander exposure to patient information." },
        { title: "Radio Communications", content: "Avoid using patient names or other identifiers on radio transmissions. Use unit number and incident number for identification." },
        { title: "Training", content: "All EMS personnel must complete HIPAA training annually and sign confidentiality agreements." }
      ]}
    ]
  },
  {
    id: "234", refNo: "Ref. 234", title: "Infection Control", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "vaccines", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Infection Control", subtitle: "Ref. 234" }] },
      { type: "text", title: "Purpose", content: "Prevent transmission of infectious diseases to patients and EMS personnel through proper infection control practices." },
      { type: "accordion", title: "Standards", items: [
        { title: "Standard Precautions", content: "Use appropriate PPE (gloves, masks, eye protection, gowns) based on anticipated exposure." },
        { title: "Hand Hygiene", content: "Hand washing or alcohol-based hand sanitizer before and after patient contact." },
        { title: "Exposure Protocol", content: "Immediate reporting and post-exposure prophylaxis per CDC guidelines for blood/body fluid exposure." },
        { title: "Vehicle Disinfection", content: "Clean and disinfect patient contact surfaces between calls. High-level disinfection after known infectious disease." }
      ]}
    ]
  },
  {
    id: "235", refNo: "Ref. 235", title: "EMS Research and Evidence-Based Practice Standards", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "science", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Research Standards", subtitle: "Ref. 235" }] },
      { type: "text", title: "Purpose", content: "EMS research advances prehospital care through evidence-based protocol development and system improvement initiatives." },
      { type: "accordion", title: "Research Activities", items: [
        { title: "Institutional Review Board (IRB)", content: "All research involving human subjects requires IRB approval from LA County or academic institution. Protects patient rights and ensures ethical conduct." },
        { title: "Informed Consent", content: "Patient consent required for research participation except for exception from informed consent (EFIC) studies approved for emergency research." },
        { title: "Data Use Agreements", content: "Researchers must execute data use agreements with EMS Agency to access de-identified system data for analysis." },
        { title: "Publication", content: "Research findings may be published in peer-reviewed journals. EMS Agency collaboration acknowledged." }
      ]},
      { type: "list", title: "Evidence-Based Practice", items: [
        { title: "Protocol Development", content: "New protocols based on published evidence, expert consensus, and system-specific feasibility assessments." },
        { title: "Outcome Monitoring", content: "Key clinical outcomes tracked to measure protocol effectiveness and guide future revisions." },
        { title: "Partnerships", content: "Collaboration with academic institutions (USC, UCLA, Harbor-UCLA) supports research infrastructure." }
      ]}
    ]
  },
  {
    id: "236", refNo: "Ref. 236", title: "Complaint Process", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "report_problem", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Complaint Process", subtitle: "Ref. 236" }] },
      { type: "text", title: "Filing", content: "Complaints regarding paramedic care may be filed by patients, families, hospitals, or other healthcare providers to the EMS Agency." },
      { type: "list", title: "Investigation Steps", items: [
        { title: "1. Receipt", content: "Complaint is logged and assigned to QI staff." },
        { title: "2. Review", content: "ePCR, Base Hospital recording, and witness statements reviewed." },
        { title: "3. Determination", content: "Findings documented and provided to Medical Director." },
        { title: "4. Action", content: "May result in counseling, remedial training, or disciplinary action." }
      ]}
    ]
  },
  {
    id: "237", refNo: "Ref. 237", title: "Medical Equipment Maintenance and Calibration", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "build", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Equipment Maintenance", subtitle: "Ref. 237" }] },
      { type: "text", title: "Purpose", content: "Regular equipment maintenance and calibration ensures reliable operation of life-saving medical devices." },
      { type: "accordion", title: "Maintenance Requirements", items: [
        { title: "Daily Checks", content: "Crews perform daily equipment checks at shift start: Monitor/defibrillator function test, oxygen system pressure, medication expiration dates, battery charge status." },
        { title: "Preventive Maintenance", content: "Biomedical equipment (monitors, defibrillators, ventilators) serviced per manufacturer schedule, typically annually. Documentation maintained." },
        { title: "Calibration", content: "Equipment requiring calibration (glucometers, capnography, pulse oximetry) calibrated per manufacturer specifications or when accuracy questioned." },
        { title: "Repair", content: "Malfunctioning equipment immediately removed from service. Backup equipment used until repair or replacement." }
      ]},
      { type: "list", title: "Documentation", items: [
        { title: "Equipment Logs", content: "Daily check sheets, preventive maintenance records, and calibration certificates maintained by provider agency." },
        { title: "Failure Reporting", content: "Equipment failures reported to EMS Agency within 24 hours. Serious failures triggering patient harm investigated immediately." },
        { title: "Inspection", content: "EMS Agency may inspect equipment maintenance records during annual provider site visits." }
      ]}
    ]
  },
  {
    id: "238", refNo: "Ref. 238", title: "Credentialing and Privileging", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Credentialing", subtitle: "Ref. 238" }] },
      { type: "text", content: "Paramedics practicing in LA County must hold both State certification and LA County accreditation." },
      { type: "text", title: "Scope of Practice", content: "Privileges are defined by the paramedic scope of practice and treatment protocols. Additional skills (RSI, ultrasound) require special authorization." }
    ]
  },
  {
    id: "239", refNo: "Ref. 239", title: "Ambulance and Vehicle Specifications", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "airport_shuttle", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Vehicle Specifications", subtitle: "Ref. 239" }] },
      { type: "text", title: "Purpose", content: "Ambulance design and equipment standards ensure safe, effective patient care during transport." },
      { type: "accordion", title: "Vehicle Types", items: [
        { title: "Type I Ambulance", content: "Truck chassis with modular ambulance body. Provides maximum patient compartment space. Common for ALS ambulances." },
        { title: "Type II Ambulance", content: "Van-style ambulance. More maneuverable in urban environments but limited headroom." },
        { title: "Type III Ambulance", content: "Van chassis with box-style patient compartment. Balance of space and maneuverability." },
        { title: "Specialty Vehicles", content: "Bariatric ambulances (heavy-duty lift systems), critical care units (advanced equipment), neonatal ambulances (isolettes)." }
      ]},
      { type: "list", title: "Required Features", items: [
        { title: "Patient Compartment", content: "Climate control, adequate lighting, oxygen and suction systems, medical equipment storage, CPR-capable stretcher mounting." },
        { title: "Safety", content: "All occupants must have seat belts. Equipment securely mounted to prevent projectiles during collision." },
        { title: "Communications", content: "Two-way radio, cellular phone, data transmission capability for 12-lead ECG." },
        { title: "Emergency Equipment", content: "Warning lights, siren, reflective striping per vehicle code. GPS/AVL for unit tracking." }
      ]},
      { type: "text", title: "Compliance", content: "Ambulances must meet federal KKK-A-1822 specifications, California Vehicle Code, and CCR Title 22 requirements. Annual inspection by EMS Agency verifies compliance." }
    ]
  },
  {
    id: "240", refNo: "Ref. 240", title: "Legal and Liability", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Legal & Liability", subtitle: "Ref. 240" }] },
      { type: "text", title: "Good Samaritan Protection", content: "Paramedics acting within their scope of practice under medical direction are protected by Good Samaritan provisions (CA H&S Code §1799.102)." },
      { type: "list", title: "Key Principles", items: [
        { title: "Duty to Act", content: "Paramedics on duty have a legal duty to provide care to patients within their service area." },
        { title: "Standard of Care", content: "Must provide care consistent with training, protocols, and reasonable paramedic standards." },
        { title: "Mandatory Reporting", content: "Child abuse, elder abuse, communicable diseases, assault, and gunshot wounds must be reported per state law." }
      ]}
    ]
  }
];
