
import { Protocol } from '../../types';

export const series400: Protocol[] = [
  {
    id: "400", refNo: "Ref. 400", title: "Provider Agency System Overview", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "business", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider Agency System", subtitle: "Ref. 400" }] },
      { type: "text", title: "Overview", content: "LA County EMS system includes both public (fire-based) and private paramedic provider agencies that deliver prehospital emergency medical care." },
      { type: "accordion", title: "Provider Types", items: [
        { title: "Public Providers", content: "Fire departments and governmental agencies providing 9-1-1 emergency response. Examples: LACoFD, LAFD, City Fire Departments." },
        { title: "Private Providers", content: "Licensed ambulance companies providing 9-1-1 response, interfacility transport, and event standby services." },
        { title: "Specialized Providers", content: "Critical Care Transport (CCT) teams, air ambulances, and specialized response units." }
      ]},
      { type: "text", title: "Accreditation", content: "All paramedic providers must be accredited by the LA County EMS Agency and operate under Base Hospital medical direction." }
    ]
  },
  {
    id: "401", refNo: "Ref. 401", title: "Public Provider Agency Directory", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "contact_phone", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Public Provider Directory", subtitle: "Ref. 401" }] },
      { type: "text", title: "Overview", content: "Directory of authorized public (governmental) paramedic provider agencies operating within LA County." },
      { type: "list", title: "Major Public Providers", items: [
        { title: "LA County Fire Department", content: "Primary 9-1-1 ALS provider for unincorporated LA County. Largest provider with 170+ fire stations." },
        { title: "Los Angeles City Fire Department", content: "9-1-1 ALS provider for City of Los Angeles. Operates as separate system within city boundaries." },
        { title: "Municipal Fire Departments", content: "City fire departments (Long Beach, Pasadena, Glendale, etc.) providing 9-1-1 ALS within their jurisdictions." }
      ]},
      { type: "text", title: "Contact Information", content: "Each provider maintains direct communication with their assigned Base Hospital and EMS Agency for operational coordination." }
    ]
  },
  {
    id: "402", refNo: "Ref. 402", title: "Private Provider Agency Directory", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "contact_phone", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Private Provider Directory", subtitle: "Ref. 402" }] },
      { type: "text", title: "Overview", content: "Directory of licensed private ambulance companies authorized to provide paramedic services in LA County." },
      { type: "text", title: "Services", content: "Private providers deliver interfacility transports, event medical coverage, and supplemental 9-1-1 response in designated service areas." }
    ]
  },
  {
    id: "403", refNo: "Ref. 403", title: "Provider Agency Operational Requirements", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "settings", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Operational Requirements", subtitle: "Ref. 403" }] },
      { type: "text", title: "Purpose", content: "Establishes operational standards that paramedic provider agencies must maintain for continued accreditation." },
      { type: "accordion", title: "Operational Standards", items: [
        { title: "24/7 Operations", content: "9-1-1 provider agencies must maintain 24/7 operational capability with sufficient units to meet response time requirements." },
        { title: "Dispatch Center", content: "Maintained dispatch center with CAD system, radio communications, and trained dispatchers using EMD protocols." },
        { title: "Supervision", content: "Field supervisors available to provide clinical oversight, quality assurance, and operational support." },
        { title: "Medical Direction", content: "Access to Base Hospital medical direction 24/7 for online medical consultation." }
      ]},
      { type: "list", title: "Facilities", items: [
        { title: "Station/Base", content: "Physical facility with adequate space for vehicles, equipment storage, crew quarters, and administrative functions." },
        { title: "Supply Management", content: "Controlled medication storage, equipment maintenance, and supply chain management systems." },
        { title: "Records Management", content: "Secure storage of patient care records, personnel files, and operational documentation per retention requirements." }
      ]}
    ]
  },
  {
    id: "404", refNo: "Ref. 404", title: "Provider Agency Application and Approval", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "verified", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider Application", subtitle: "Ref. 404" }] },
      { type: "text", title: "Process", content: "New paramedic provider agencies must apply for accreditation through the EMS Agency and meet all operational requirements." },
      { type: "accordion", title: "Application Requirements", items: [
        { title: "Business Documentation", content: "Proof of business license, insurance coverage (minimum $1M liability), and business entity formation." },
        { title: "Medical Director Agreement", content: "Signed agreement with qualified physician to serve as Provider Agency Medical Director." },
        { title: "Base Hospital Assignment", content: "Assignment to a designated Base Hospital for medical control and supervision." },
        { title: "Equipment Compliance", content: "Vehicles and equipment meet CCR Title 22 and LA County standards." },
        { title: "Personnel Verification", content: "All paramedics hold valid LA County accreditation and current certifications." }
      ]},
      { type: "list", title: "Inspection Process", items: [
        { title: "Site Visit", content: "EMS Agency conducts on-site inspection of facilities, vehicles, and operations." },
        { title: "Documentation Review", content: "Verification of policies, procedures, training records, and compliance materials." },
        { title: "Approval", content: "Upon satisfactory review, provider receives accreditation certificate valid for one year." }
      ]}
    ]
  },
  {
    id: "405", refNo: "Ref. 405", title: "Agency Medical Director Qualifications", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "medical_services", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Medical Director Qualifications", subtitle: "Ref. 405" }] },
      { type: "text", title: "Purpose", content: "Establishes minimum qualifications and responsibilities for physicians serving as Provider Agency Medical Directors." },
      { type: "accordion", title: "Required Qualifications", items: [
        { title: "Medical License", content: "Unrestricted California physician license in good standing. No history of disciplinary action related to medical practice." },
        { title: "Board Certification", content: "Board certification in Emergency Medicine preferred. Alternative specialties (Internal Medicine, Family Medicine) acceptable with documented EMS experience." },
        { title: "EMS Knowledge", content: "Demonstrated knowledge of prehospital care, EMS system operations, and LA County protocols. Minimum 2 years involvement in EMS medical direction." },
        { title: "DEA Registration", content: "Current DEA registration for controlled substance oversight and authority." }
      ]},
      { type: "list", title: "Responsibilities", items: [
        { title: "Clinical Oversight", content: "Review clinical performance data, quality metrics, and protocol compliance. Identify trends requiring intervention." },
        { title: "Personnel Review", content: "Participate in hiring decisions, clinical competency evaluations, and remedial training programs." },
        { title: "System Liaison", content: "Serve as medical advisor to agency administration. Interface with Base Hospital Medical Directors and EMS Agency Medical Director." }
      ]},
      { type: "text", title: "Appointment", content: "Medical Director appointment requires approval by the EMS Agency Medical Director. Agreement must specify scope of authority and time commitment." }
    ]
  },
  {
    id: "406", refNo: "Ref. 406", title: "Paramedic Provider Authorization", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider Authorization", subtitle: "Ref. 406" }] },
      { type: "text", title: "Purpose", content: "Establishes the process for individual paramedic authorization to practice within LA County EMS system." },
      { type: "accordion", title: "Authorization Process", items: [
        { title: "State Certification", content: "Paramedic must hold current California Paramedic License (EMT-P)." },
        { title: "LA County Accreditation", content: "Complete LA County orientation, pass local protocol exam, and skills verification." },
        { title: "Base Hospital Assignment", content: "Assigned to Base Hospital corresponding to provider agency service area." },
        { title: "Field Internship", content: "Complete supervised field internship (typically 10-20 patient contacts) before independent practice." }
      ]},
      { type: "text", title: "Recertification", content: "Paramedics must recertify every 2 years with LA County by completing continuing education and skills verification requirements." }
    ]
  },
  {
    id: "407", refNo: "Ref. 407", title: "Personnel Training Requirements", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "school", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Personnel Training Requirements", subtitle: "Ref. 407" }] },
      { type: "text", title: "Purpose", content: "Establishes mandatory training requirements for all EMS personnel employed by provider agencies." },
      { type: "accordion", title: "Initial Training", items: [
        { title: "New Hire Orientation", content: "Comprehensive orientation covering agency policies, procedures, safety protocols, and operational expectations. Minimum 40 hours including didactic and hands-on training." },
        { title: "Protocol Training", content: "LA County treatment protocol review and testing. Must demonstrate competency before independent patient care." },
        { title: "Equipment Training", content: "Hands-on training on all agency equipment including monitors, ventilators, medication administration devices, and specialized equipment." },
        { title: "Field Training", content: "Supervised field internship with experienced preceptor. Minimum 10-20 patient contacts documenting competency in assessment and treatment." }
      ]},
      { type: "list", title: "Ongoing Education", items: [
        { title: "Continuing Education", content: "48 hours CE every 2 years including 24 hours distributor education and 24 hours agency/individual education." },
        { title: "Skills Verification", content: "Annual skills testing for critical procedures: Intubation, IO access, medication administration, cardiac monitoring." },
        { title: "Protocol Updates", content: "Mandatory training when protocols are updated or new treatments added to formulary." }
      ]},
      { type: "text", title: "Documentation", content: "Training records maintained for minimum 4 years. Available for EMS Agency inspection and accreditation review." }
    ]
  },
  {
    id: "408", refNo: "Ref. 408", title: "ALS Unit Staffing Requirements", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "groups", color: "slate",
    sections: [
      { type: "header", items: [{ title: "ALS Unit Staffing", subtitle: "Ref. 408" }] },
      { type: "text", title: "Minimum Staffing", content: "Advanced Life Support (ALS) ambulances must be staffed per CCR Title 22 and LA County requirements." },
      { type: "list", title: "Staffing Standards", items: [
        { title: "Paramedic", content: "At least one LA County accredited paramedic on every ALS unit." },
        { title: "EMT Partner", content: "Second crew member must be at minimum an EMT-Basic." },
        { title: "Driver", content: "Driver must hold appropriate level certification (EMT or Paramedic) and valid California driver's license with ambulance endorsement." }
      ]},
      { type: "text", title: "Dual Paramedic Units", content: "Some provider agencies staff units with two paramedics for enhanced capability, though only one paramedic minimum is required." }
    ]
  },
  {
    id: "409", refNo: "Ref. 409", title: "Vehicle Inspection Standards", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "fact_check", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Vehicle Inspection Standards", subtitle: "Ref. 409" }] },
      { type: "text", title: "Purpose", content: "Establishes minimum inspection standards to ensure ambulance vehicles are safe, properly equipped, and ready for emergency response." },
      { type: "accordion", title: "Daily Inspections", items: [
        { title: "Vehicle Systems", content: "Check engine oil, coolant, brake fluid, transmission fluid, tire pressure, lights (emergency and warning), siren operation, fuel level, windshield wipers." },
        { title: "Medical Equipment", content: "Verify presence and functionality of all required equipment per Title 22 checklist: Airway equipment, oxygen system, suction, monitor/defibrillator, medications." },
        { title: "Documentation", content: "Complete daily vehicle inspection form documenting all checks. Report deficiencies immediately to supervisor." },
        { title: "Out of Service", content: "Remove units with safety-critical deficiencies from service until repaired and re-inspected." }
      ]},
      { type: "list", title: "Annual Inspections", items: [
        { title: "EMS Agency Inspection", content: "Comprehensive annual inspection by EMS Agency verifying vehicle and equipment compliance with all standards." },
        { title: "DMV Ambulance Inspection", content: "California Highway Patrol inspection for ambulance certification per Vehicle Code 2512." },
        { title: "Maintenance Records", content: "Maintain complete vehicle maintenance history including repairs, mileage, and service intervals." }
      ]},
      { type: "text", title: "Inspection Records", content: "Retain daily inspection checklists for minimum 2 years. Annual inspection certificates maintained for vehicle lifetime." }
    ]
  },
  {
    id: "410", refNo: "Ref. 410", title: "Provider Agency Operations Manual", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "menu_book", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Operations Manual", subtitle: "Ref. 410" }] },
      { type: "text", title: "Requirement", content: "All provider agencies must maintain a comprehensive Operations Manual documenting policies, procedures, and operational guidelines." },
      { type: "accordion", title: "Required Sections", items: [
        { title: "Clinical Policies", content: "Compliance with LA County treatment protocols and procedures." },
        { title: "Operational Procedures", content: "Response procedures, dispatch protocols, vehicle checks, and equipment maintenance." },
        { title: "Personnel Policies", content: "Hiring, training, supervision, and disciplinary procedures." },
        { title: "Safety", content: "Infection control, scene safety, hazardous materials, and injury prevention." },
        { title: "Documentation", content: "ePCR completion, data submission, and record retention policies." }
      ]}
    ]
  },
  {
    id: "411", refNo: "Ref. 411", title: "Provider Agency Medical Director", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "person", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider Medical Director", subtitle: "Ref. 411" }] },
      { type: "text", title: "Role", content: "The Provider Agency Medical Director serves as the physician advisor to the provider agency on clinical and operational matters." },
      { type: "list", title: "Responsibilities", items: [
        { title: "Clinical Oversight", content: "Review clinical performance, quality indicators, and compliance with protocols." },
        { title: "Training", content: "Participate in continuing education and skills verification programs." },
        { title: "Quality Improvement", content: "Review adverse events, complaint investigations, and remedial training needs." },
        { title: "Medical Liaison", content: "Communicate with Base Hospital Medical Director and EMS Agency on clinical matters." }
      ]},
      { type: "text", title: "Qualifications", content: "Must be a physician licensed in California with knowledge of emergency medicine and EMS systems. Board certification in Emergency Medicine preferred." }
    ]
  },
  {
    id: "412", refNo: "Ref. 412", title: "Field Supervisor Requirements", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "supervisor_account", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Field Supervisor", subtitle: "Ref. 412" }] },
      { type: "text", title: "Overview", content: "Field supervisors provide on-scene clinical oversight, quality assurance, and operational support for field paramedics." },
      { type: "accordion", title: "Qualifications", items: [
        { title: "Experience", content: "Minimum 3-5 years as LA County paramedic with demonstrated clinical excellence." },
        { title: "Training", content: "Completion of EMS supervisor training program covering leadership, clinical oversight, and incident management." },
        { title: "Scope", content: "May perform advanced procedures, provide consultation to field crews, and ensure protocol compliance." }
      ]}
    ]
  },
  {
    id: "413", refNo: "Ref. 413", title: "Equipment Maintenance", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "build", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Equipment Maintenance", subtitle: "Ref. 413" }] },
      { type: "text", title: "Purpose", content: "Establishes preventive maintenance and repair procedures to ensure all medical equipment remains safe and functional." },
      { type: "accordion", title: "Maintenance Programs", items: [
        { title: "Preventive Maintenance", content: "Follow manufacturer-recommended maintenance schedules for all equipment. Document maintenance activities, calibrations, and testing." },
        { title: "Monitor/Defibrillators", content: "Biomedical inspection every 6-12 months. Daily automated self-test verification. Battery replacement per manufacturer schedule." },
        { title: "Oxygen Equipment", content: "Hydrostatic testing of cylinders every 5 years. Regular inspection of regulators, flow meters, and delivery devices." },
        { title: "Airway Equipment", content: "Inspection and cleaning of laryngoscope blades/handles. Battery checks. Replacement of single-use components." }
      ]},
      { type: "list", title: "Equipment Failures", items: [
        { title: "Out of Service Tagging", content: "Clearly mark failed or suspect equipment as out of service. Remove from circulation immediately." },
        { title: "Repair Process", content: "Send equipment to qualified biomedical technicians or manufacturer for repair. Verify proper function before returning to service." },
        { title: "Incident Reporting", content: "Report equipment failures that impact patient care to EMS Agency within 24 hours." }
      ]},
      { type: "text", title: "Records", content: "Maintain equipment maintenance logs documenting service dates, repairs, and calibrations for minimum 4 years." }
    ]
  },
  {
    id: "414", refNo: "Ref. 414", title: "Critical Care Transport (CCT)", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "ambulance", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Critical Care Transport", subtitle: "Ref. 414" }] },
      { type: "text", content: "CCT units are staffed by an RN + EMT/Paramedic for interfacility transport of patients requiring care beyond paramedic scope of practice." },
      { type: "accordion", title: "CCT Capabilities", items: [
        { title: "Equipment", content: "Ventilators, IV pumps, cardiac monitoring, specialized medications beyond paramedic formulary." },
        { title: "Staffing", content: "Critical Care RN with ACLS, PALS, and specialized training. Partnered with EMT or Paramedic driver/assistant." },
        { title: "Patient Types", content: "Patients on ventilators, continuous IV drips (vasopressors, sedation), IABP, ECMO, or complex monitoring needs." }
      ]},
      { type: "text", title: "Authorization", content: "CCT programs require separate authorization from the EMS Agency with specific equipment and personnel requirements." }
    ]
  },
  {
    id: "415", refNo: "Ref. 415", title: "Supply Chain Management", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "inventory_2", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Supply Chain Management", subtitle: "Ref. 415" }] },
      { type: "text", title: "Purpose", content: "Establishes procedures for procurement, inventory management, and distribution of medical supplies and medications." },
      { type: "accordion", title: "Inventory Control", items: [
        { title: "Par Levels", content: "Establish minimum and maximum inventory levels for all supplies and medications. Automated reordering when stock reaches minimum threshold." },
        { title: "Controlled Substances", content: "Narcotics maintained in locked storage with dual-access controls. Daily narcotic counts documented on controlled substance logs." },
        { title: "Expiration Management", content: "Regular inspection of medications and supplies for expiration dates. First-in-first-out (FIFO) rotation. Remove expired items immediately." },
        { title: "Temperature Control", content: "Temperature-sensitive medications stored per manufacturer specifications. Daily temperature log monitoring for medication refrigerators." }
      ]},
      { type: "list", title: "Procurement", items: [
        { title: "Approved Vendors", content: "Purchase medical supplies and medications only from licensed, reputable vendors. Verify product authenticity and lot tracking." },
        { title: "Quality Verification", content: "Inspect deliveries for damage, correct items, and proper quantities. Document receipt of controlled substances." },
        { title: "Cost Management", content: "Competitive bidding for major supply contracts. Group purchasing organizations (GPO) for volume discounts." }
      ]},
      { type: "text", title: "Documentation", content: "Maintain purchasing records, inventory logs, and controlled substance documentation per DEA and state pharmacy regulations." }
    ]
  },
  {
    id: "416", refNo: "Ref. 416", title: "Neonatal/Pediatric Critical Care Transport", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Neonatal/Pediatric CCT", subtitle: "Ref. 416" }] },
      { type: "text", title: "Overview", content: "Specialized transport teams for critically ill neonates and pediatric patients requiring advanced care during interfacility transfer." },
      { type: "list", title: "Team Composition", items: [
        { title: "Neonatal", content: "NICU RN, Respiratory Therapist, and/or Neonatal Nurse Practitioner. Specialized neonatal equipment including transport isolette." },
        { title: "Pediatric", content: "PICU RN with pediatric advanced life support training. Age-appropriate equipment and medication dosing." }
      ]}
    ]
  },
  {
    id: "417", refNo: "Ref. 417", title: "Communication Equipment", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "settings_cell", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Communication Equipment", subtitle: "Ref. 417" }] },
      { type: "text", title: "Purpose", content: "Establishes standards for communications equipment to ensure reliable contact with Base Hospitals, dispatch centers, and receiving facilities." },
      { type: "accordion", title: "Required Systems", items: [
        { title: "Radio Communications", content: "800 MHz trunked radio system for Base Hospital medical control contact. All ALS units must have functional radio capable of Base contact throughout service area." },
        { title: "Backup Systems", content: "Cellular telephone as backup when radio unavailable. Satellite phone for wilderness/remote operations where cellular coverage limited." },
        { title: "Hospital Notification", content: "Capability to provide advance notification to receiving hospitals via radio, phone, or electronic means." },
        { title: "ECG Transmission", content: "12-lead ECG transmission capability to Base Hospital and STEMI receiving centers. Wireless or cellular data transmission." }
      ]},
      { type: "list", title: "Maintenance and Testing", items: [
        { title: "Daily Testing", content: "Radio check at beginning of shift to verify equipment function and signal strength." },
        { title: "Equipment Failures", content: "Units with complete communications failure must be removed from ALS service. BLS transport only until repaired." },
        { title: "Privacy Compliance", content: "HIPAA-compliant communications. Avoid transmitting patient identifiers over non-secure channels when possible." }
      ]},
      { type: "text", title: "Documentation", content: "Maintain log of communication equipment failures and repairs. Report extended outages to EMS Agency." }
    ]
  },
  {
    id: "418", refNo: "Ref. 418", title: "EMS Aircraft Authorization", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "helicopter", color: "slate",
    sections: [
      { type: "header", items: [{ title: "EMS Aircraft", subtitle: "Ref. 418" }] },
      { type: "text", content: "Air ambulances (helicopters and fixed-wing) must be authorized by the EMS Agency to operate within LA County." },
      { type: "accordion", title: "Aircraft Classifications", items: [
        { title: "Air Ambulance (Transport)", content: "Helicopter or fixed-wing aircraft configured for patient transport. Staffed by flight paramedic and/or flight nurse. Used for scene response and interfacility transport." },
        { title: "Rescue Aircraft (Hoist)", content: "Helicopter with hoist capability for technical rescue operations. May include rescue paramedic for remote/wilderness rescue." }
      ]},
      { type: "list", title: "Requirements", items: [
        { title: "Equipment", content: "Medical equipment per CCR Title 22 Air Ambulance standards. Advanced monitoring and treatment capability." },
        { title: "Crew Training", content: "Flight paramedics/nurses must complete specialized flight training including altitude physiology, aircraft safety, and confined space operations." },
        { title: "Safety", content: "Aircraft must meet FAA certification. Scene landing requires fire department approval and safety perimeter." }
      ]}
    ]
  },
  {
    id: "419", refNo: "Ref. 419", title: "Documentation Standards", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "description", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Documentation Standards", subtitle: "Ref. 419" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements for patient care documentation, operational records, and data submission to ensure quality and legal compliance." },
      { type: "accordion", title: "Patient Care Records (ePCR)", items: [
        { title: "Completion Requirements", content: "Complete ePCR for every patient contact within 24 hours. Include chief complaint, vital signs, assessment findings, treatments, medications, and patient outcome." },
        { title: "Accuracy", content: "Documentation must be accurate, complete, and legible. Corrections made using approved electronic amendment process, not deletion." },
        { title: "Electronic Signatures", content: "Paramedic and partner electronic signatures required. Refusal of care requires patient signature or documented reason for inability to sign." },
        { title: "Data Submission", content: "Submit ePCR data to LA County EMS database within 72 hours. Ensure data quality and completeness for system-wide reporting." }
      ]},
      { type: "list", title: "Operational Documentation", items: [
        { title: "Response Logs", content: "Maintain dispatch records documenting call receipt time, unit assignment, response times, and disposition." },
        { title: "Personnel Records", content: "Training documentation, certifications, performance evaluations, and disciplinary actions per retention requirements." },
        { title: "Retention", content: "Patient care records: 7 years minimum. Personnel records: 4 years after termination. Operational logs: 2 years." }
      ]},
      { type: "text", title: "Quality Assurance", content: "Regular audit of documentation quality. Feedback to personnel on deficiencies. Remedial training for persistent documentation errors." }
    ]
  },
  {
    id: "420", refNo: "Ref. 420", title: "Vehicle and Equipment Standards", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "local_shipping", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Vehicle Standards", subtitle: "Ref. 420" }] },
      { type: "text", title: "Compliance", content: "All ambulances must meet California Vehicle Code, CCR Title 22, and LA County specifications." },
      { type: "accordion", title: "Requirements", items: [
        { title: "Vehicle Design", content: "Type I, II, or III ambulance configuration per KKK-A-1822 federal specifications. Adequate patient compartment space for care during transport." },
        { title: "Equipment", content: "Full complement of BLS and ALS equipment including airway, circulation, medication, and monitoring equipment per Title 22 equipment list." },
        { title: "Inspection", content: "Annual vehicle inspection by EMS Agency. DMV ambulance inspection current. Daily unit checks documented." },
        { title: "Maintenance", content: "Regular preventive maintenance program. Out-of-service units must be removed from 9-1-1 response until repaired." }
      ]}
    ]
  },
  {
    id: "421", refNo: "Ref. 421", title: "Quality Improvement", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "trending_up", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Quality Improvement", subtitle: "Ref. 421" }] },
      { type: "text", title: "Purpose", content: "Provider agencies must implement comprehensive quality improvement programs to monitor clinical performance, identify areas for improvement, and ensure protocol compliance." },
      { type: "accordion", title: "QI Program Components", items: [
        { title: "Data Collection", content: "Systematic collection of clinical and operational data from ePCRs, response logs, and incident reports. Track key performance indicators." },
        { title: "Performance Metrics", content: "Monitor cardiac arrest survival rates, STEMI/stroke activation times, protocol compliance rates, medication error frequency, and customer satisfaction." },
        { title: "Case Review", content: "Regular review of complex cases, adverse events, and protocol deviations. Multidisciplinary case review involving Medical Director." },
        { title: "Benchmarking", content: "Compare performance to system-wide benchmarks and national standards. Identify outliers and opportunities for improvement." }
      ]},
      { type: "list", title: "Performance Improvement", items: [
        { title: "Individual Feedback", content: "Provide timely feedback to paramedics on clinical performance. Recognition of excellence and coaching for improvement areas." },
        { title: "System Changes", content: "Implement process improvements based on QI findings. Protocol modifications, training enhancements, or operational changes." },
        { title: "Reporting", content: "Submit quarterly QI reports to EMS Agency summarizing performance metrics, improvement initiatives, and outcomes." }
      ]},
      { type: "text", title: "Confidentiality", content: "QI activities protected under peer review privilege. Focus on system improvement, not individual blame." }
    ]
  },
  {
    id: "422", refNo: "Ref. 422", title: "Communications Equipment", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "wifi", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Communications Equipment", subtitle: "Ref. 422" }] },
      { type: "text", title: "Requirements", content: "All ALS units must have functional communication equipment for Base Hospital contact and hospital notification." },
      { type: "list", title: "Systems", items: [
        { title: "Radio", content: "800 MHz radio system for Base Hospital medical control. Backup UHF/VHF capabilities." },
        { title: "Telephone", content: "Cellular telephone for Base contact when radio unavailable. Must be HIPAA compliant for patient information." },
        { title: "Data", content: "12-lead ECG transmission capability. ePCR system with data connectivity." }
      ]}
    ]
  },
  {
    id: "423", refNo: "Ref. 423", title: "Incident Reporting", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "report_problem", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Incident Reporting", subtitle: "Ref. 423" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements for timely reporting of adverse events, errors, and significant incidents to the EMS Agency." },
      { type: "accordion", title: "Reportable Incidents", items: [
        { title: "Patient Safety Events", content: "Medication errors, treatment errors, delays in care, equipment failures affecting patient care, patient falls or injuries during EMS care." },
        { title: "System Events", content: "Vehicle accidents, personnel injuries, lost/stolen controlled substances, HIPAA breaches, communication system failures." },
        { title: "Clinical Events", content: "Patient death in EMS custody, cardiac arrest during transport, unexpected clinical deterioration, deviation from protocol resulting in adverse outcome." },
        { title: "Operational Events", content: "Response time failures, unit diversions, facility closures affecting operations, mutual aid activations." }
      ]},
      { type: "list", title: "Reporting Timelines", items: [
        { title: "Immediate (Within 24 Hours)", content: "Patient deaths, serious injuries to patients or personnel, medication errors, controlled substance discrepancies, major equipment failures." },
        { title: "Routine (Within 7 Days)", content: "Minor incidents, near-miss events, process improvement opportunities identified through QI review." },
        { title: "Format", content: "Submit incident reports to EMS Agency using standardized reporting form. Include detailed narrative, contributing factors, and corrective actions taken." }
      ]},
      { type: "text", title: "Non-Punitive Culture", content: "Encourage reporting of errors and near-misses without fear of retribution. Focus on system improvements rather than individual blame." }
    ]
  },
  {
    id: "424", refNo: "Ref. 424", title: "Infection Control and Decontamination", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "cleaning_services", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Infection Control", subtitle: "Ref. 424" }] },
      { type: "text", title: "Purpose", content: "Provider agencies must implement infection control policies to protect patients and personnel from communicable disease transmission." },
      { type: "accordion", title: "Standards", items: [
        { title: "PPE", content: "Adequate supply of gloves, masks, eye protection, and gowns. N95 respirators for airborne precautions." },
        { title: "Hand Hygiene", content: "Hand sanitizer and hand washing facilities available. Hand hygiene before and after patient contact." },
        { title: "Vehicle Cleaning", content: "Clean and disinfect patient contact surfaces between calls using EPA-approved disinfectant. High-level disinfection after infectious disease exposure." },
        { title: "Exposure Protocol", content: "Post-exposure prophylaxis program for blood/body fluid exposures. Occupational health services available 24/7." }
      ]}
    ]
  },
  {
    id: "425", refNo: "Ref. 425", title: "Complaint Handling", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "feedback", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Complaint Handling", subtitle: "Ref. 425" }] },
      { type: "text", title: "Purpose", content: "Establishes procedures for receiving, investigating, and resolving patient and public complaints regarding EMS services." },
      { type: "accordion", title: "Complaint Process", items: [
        { title: "Receipt", content: "Accept complaints via phone, mail, email, or in-person. Document complaint details including date, time, personnel involved, and nature of concern." },
        { title: "Investigation", content: "Assign complaints to appropriate supervisor for investigation. Interview involved personnel, review ePCR and CAD data, gather witness statements." },
        { title: "Timeline", content: "Acknowledge complaint within 48 hours. Complete investigation within 30 days. Provide written response to complainant." },
        { title: "Serious Complaints", content: "Immediately report complaints alleging patient harm, HIPAA violations, or criminal conduct to EMS Agency and appropriate authorities." }
      ]},
      { type: "list", title: "Resolution", items: [
        { title: "Findings", content: "Determine if complaint substantiated based on investigation findings. Document corrective actions taken if warranted." },
        { title: "Personnel Action", content: "If complaint substantiated, implement appropriate corrective action: Counseling, remedial training, or disciplinary action per policy." },
        { title: "Follow-Up", content: "Communicate resolution to complainant. Track complaint trends for quality improvement purposes." }
      ]},
      { type: "text", title: "Reporting", content: "Submit quarterly complaint summary to EMS Agency including complaint volume, categories, findings, and corrective actions." }
    ]
  },
  {
    id: "426", refNo: "Ref. 426", title: "Provider Agency Quality Improvement", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "query_stats", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider QI Program", subtitle: "Ref. 426" }] },
      { type: "text", title: "Overview", content: "Provider agencies must maintain an internal quality improvement program to monitor clinical performance and ensure protocol compliance." },
      { type: "list", title: "Components", items: [
        { title: "Chart Review", content: "Regular review of ePCRs for documentation quality and clinical appropriateness." },
        { title: "Performance Indicators", content: "Track key metrics: Response times, protocol compliance, medication errors, patient outcomes." },
        { title: "Feedback", content: "Provide individual and aggregate performance feedback to paramedics." },
        { title: "Remediation", content: "Identify and address performance deficiencies through counseling or additional training." }
      ]}
    ]
  },
  {
    id: "427", refNo: "Ref. 427", title: "Disciplinary Procedures", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Disciplinary Procedures", subtitle: "Ref. 427" }] },
      { type: "text", title: "Purpose", content: "Establishes fair and consistent disciplinary procedures for addressing personnel performance issues and policy violations." },
      { type: "accordion", title: "Progressive Discipline", items: [
        { title: "Verbal Counseling", content: "First response to minor policy violations or performance issues. Document conversation and expectations for improvement." },
        { title: "Written Warning", content: "For repeated minor violations or more serious first offenses. Formal written documentation placed in personnel file." },
        { title: "Suspension", content: "Temporary removal from duty for serious violations. May be paid or unpaid depending on circumstances and investigation needs." },
        { title: "Termination", content: "Dismissal from employment for egregious violations or failure to improve despite progressive discipline. Examples: Patient harm, falsification of records, substance abuse." }
      ]},
      { type: "list", title: "Due Process", items: [
        { title: "Investigation", content: "Thorough investigation before imposing discipline. Interview employee, review evidence, consider mitigating factors." },
        { title: "Notification", content: "Provide written notice of alleged violations and opportunity to respond before final disciplinary decision." },
        { title: "Appeal Rights", content: "Employee may appeal disciplinary action through agency grievance procedure or applicable union contract provisions." }
      ]},
      { type: "text", title: "EMS Agency Notification", content: "Report suspensions or terminations involving clinical performance issues to EMS Agency and Base Hospital within 24 hours." }
    ]
  },
  {
    id: "428", refNo: "Ref. 428", title: "Provider Agency Training Programs", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "school", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider Training", subtitle: "Ref. 428" }] },
      { type: "text", title: "Purpose", content: "Ensure all personnel receive initial and ongoing training to maintain clinical competency." },
      { type: "accordion", title: "Training Requirements", items: [
        { title: "Orientation", content: "New employee orientation covering agency policies, LA County protocols, and operational procedures." },
        { title: "Continuing Education", content: "48 hours CE every 2 years including protocol updates, skills verification, and specialty topics." },
        { title: "Skills Labs", content: "Hands-on training for high-risk procedures: Airway management, IO access, medication administration, 12-lead interpretation." },
        { title: "Scenario Training", content: "Simulation-based training for cardiac arrest, trauma, pediatric emergencies, and difficult airways." }
      ]}
    ]
  },
  {
    id: "429", refNo: "Ref. 429", title: "Insurance Requirements", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "shield", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Insurance Requirements", subtitle: "Ref. 429" }] },
      { type: "text", title: "Purpose", content: "Provider agencies must maintain adequate insurance coverage to protect patients, personnel, and the public." },
      { type: "accordion", title: "Required Coverage", items: [
        { title: "Professional Liability", content: "Minimum $1,000,000 per occurrence / $3,000,000 aggregate professional liability insurance covering paramedic services and medical malpractice." },
        { title: "General Liability", content: "Commercial general liability insurance minimum $1,000,000 per occurrence covering bodily injury, property damage, and personal injury." },
        { title: "Auto Liability", content: "Commercial vehicle insurance minimum $1,000,000 combined single limit for all ambulances and response vehicles." },
        { title: "Workers' Compensation", content: "Workers' compensation insurance per California Labor Code covering all employees." }
      ]},
      { type: "list", title: "Additional Requirements", items: [
        { title: "Named Insured", content: "LA County EMS Agency named as additional insured on all policies. Certificate of Insurance provided annually." },
        { title: "Notice of Cancellation", content: "Insurance carrier must provide 30-day notice to EMS Agency if coverage cancelled or significantly reduced." },
        { title: "Self-Insurance", content: "Large public agencies may self-insure with documented reserves and risk management program approved by EMS Agency." }
      ]},
      { type: "text", title: "Compliance", content: "Failure to maintain required insurance coverage may result in suspension or revocation of provider agency accreditation." }
    ]
  },
  {
    id: "430", refNo: "Ref. 430", title: "Dispatch and Response Standards", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "radio", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Dispatch Standards", subtitle: "Ref. 430" }] },
      { type: "text", title: "Overview", content: "Provider agencies must maintain dispatch and response protocols to ensure timely emergency response." },
      { type: "list", title: "Standards", items: [
        { title: "Call Processing", content: "Emergency Medical Dispatch (EMD) protocols used by dispatch centers. Pre-arrival instructions provided to callers." },
        { title: "Unit Assignment", content: "Closest available appropriate unit dispatched based on patient acuity and resource availability." },
        { title: "Response Times", content: "Track and report response time intervals: Call processing, turnout time, travel time, total response time." }
      ]}
    ]
  },
  {
    id: "431", refNo: "Ref. 431", title: "Contract Standards", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "assignment", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Contract Standards", subtitle: "Ref. 431" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements for contracts between provider agencies and facilities, municipalities, or event organizers." },
      { type: "accordion", title: "Contract Types", items: [
        { title: "9-1-1 Response", content: "Exclusive or non-exclusive area agreements for emergency 9-1-1 response. Must specify service boundaries, response time requirements, and unit deployment standards." },
        { title: "Interfacility Transport", content: "Agreements with hospitals and healthcare facilities for scheduled and urgent patient transfers. Define service levels, billing rates, and quality metrics." },
        { title: "Standby Services", content: "Contracts for special event medical coverage, facility standby, or industrial medical services. Specify staffing levels, equipment requirements, and duration." },
        { title: "CCT Services", content: "Specialized contracts for critical care transport requiring RN staffing and advanced equipment." }
      ]},
      { type: "list", title: "Required Contract Elements", items: [
        { title: "Scope of Services", content: "Clearly define services to be provided, geographic service area, hours of operation, and performance standards." },
        { title: "Quality Requirements", content: "Specify compliance with LA County protocols, reporting requirements, and quality metrics. Right to audit performance data." },
        { title: "Termination Provisions", content: "Notice requirements for termination. Transition planning to ensure continuity of patient care services." }
      ]},
      { type: "text", title: "EMS Agency Review", content: "Submit contracts affecting 9-1-1 response or system resources to EMS Agency for review and approval prior to execution." }
    ]
  },
  {
    id: "432", refNo: "Ref. 432", title: "Special Event Medical Coverage", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "event", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Special Event Coverage", subtitle: "Ref. 432" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements for medical coverage at special events (concerts, sporting events, fairs, etc.)." },
      { type: "text", title: "Staffing", content: "Events may require standby ambulances, first aid stations, or medical tents staffed by EMTs/Paramedics based on event size and risk." }
    ]
  },
  {
    id: "433", refNo: "Ref. 433", title: "Billing Practices", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "payments", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Billing Practices", subtitle: "Ref. 433" }] },
      { type: "text", title: "Purpose", content: "Establishes standards for patient billing practices to ensure transparency, accuracy, and compliance with regulations." },
      { type: "accordion", title: "Billing Requirements", items: [
        { title: "Fee Schedules", content: "Maintain published fee schedule for ambulance services. Rates must be consistently applied to all patients regardless of payment source." },
        { title: "Medicare/Medi-Cal", content: "Compliance with CMS and DHCS billing requirements for government-funded patients. Proper documentation supporting medical necessity." },
        { title: "Insurance Billing", content: "Accept assignment from insurance carriers. Bill insurance as primary payer before billing patient for remaining balance." },
        { title: "Uninsured Patients", content: "Offer payment plans and financial assistance programs for uninsured or underinsured patients. Charity care policies per community benefit requirements." }
      ]},
      { type: "list", title: "Prohibited Practices", items: [
        { title: "Balance Billing", content: "Prohibited from balance billing Medicare/Medicaid patients beyond allowed copays and deductibles." },
        { title: "Advance Payment", content: "May not require payment before providing emergency services. Treatment cannot be denied due to inability to pay." },
        { title: "Discrimination", content: "Billing rates and collection practices must be applied uniformly without discrimination based on payment source." }
      ]},
      { type: "text", title: "Transparency", content: "Provide patients with clear itemized bills explaining charges. Post fee schedules publicly and provide cost estimates upon request." }
    ]
  },
  {
    id: "434", refNo: "Ref. 434", title: "Mutual Aid Agreements", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "handshake", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Mutual Aid", subtitle: "Ref. 434" }] },
      { type: "text", title: "Overview", content: "Provider agencies may enter mutual aid agreements with neighboring jurisdictions to provide or receive emergency assistance during major incidents or disasters." },
      { type: "text", title: "Coordination", content: "Mutual aid requests coordinated through EMS Agency and regional coordination centers." }
    ]
  },
  {
    id: "435", refNo: "Ref. 435", title: "Patient Privacy", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "lock", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Patient Privacy", subtitle: "Ref. 435" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements for protecting patient privacy and confidentiality in compliance with HIPAA and California privacy laws." },
      { type: "accordion", title: "Privacy Protections", items: [
        { title: "Patient Information", content: "Limit collection and use of patient information to minimum necessary for treatment, payment, and operations. No unauthorized access or disclosure." },
        { title: "Conversations", content: "Avoid discussing patient information in public areas or where conversations may be overheard. Use patient room numbers rather than names on radio." },
        { title: "Records Access", content: "Restrict access to patient care records to authorized personnel only. Password-protected electronic systems with role-based access controls." },
        { title: "Patient Rights", content: "Inform patients of their privacy rights. Provide Notice of Privacy Practices. Honor patient requests for confidential communications." }
      ]},
      { type: "list", title: "Breach Response", items: [
        { title: "Breach Notification", content: "Report suspected privacy breaches to privacy officer immediately. Investigate scope and nature of unauthorized disclosure." },
        { title: "Patient Notification", content: "Notify affected patients of breaches involving unsecured protected health information within 60 days." },
        { title: "Regulatory Reporting", content: "Report significant breaches to HHS Office for Civil Rights. Coordinate with EMS Agency on breach response." }
      ]},
      { type: "text", title: "Training", content: "Annual HIPAA privacy training required for all personnel. Document training completion and maintain records." }
    ]
  },
  {
    id: "436", refNo: "Ref. 436", title: "Data Security and HIPAA Compliance", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "security", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Data Security", subtitle: "Ref. 436" }] },
      { type: "text", title: "HIPAA Compliance", content: "Provider agencies must maintain HIPAA-compliant policies and procedures to protect patient health information." },
      { type: "list", title: "Requirements", items: [
        { title: "ePCR Security", content: "Password-protected ePCR systems with user authentication and audit trails." },
        { title: "Data Transmission", content: "Encrypted transmission of patient data and 12-lead ECGs." },
        { title: "Training", content: "All personnel trained in HIPAA privacy and security requirements." }
      ]}
    ]
  },
  {
    id: "437", refNo: "Ref. 437", title: "Ambulance Licensing", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "verified_user", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Ambulance Licensing", subtitle: "Ref. 437" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements for obtaining and maintaining ambulance licenses from LA County and the State of California." },
      { type: "accordion", title: "Licensing Requirements", items: [
        { title: "County Business License", content: "Obtain LA County business license per County Code Title 7, Chapter 7.04. Annual renewal required with fee payment." },
        { title: "State Ambulance License", content: "Each ambulance must be licensed by California Highway Patrol per Vehicle Code 2512. Annual inspection and certification required." },
        { title: "EMS Agency Approval", content: "Provider agency accreditation from LA County EMS Agency for paramedic-level service. Separate from business license." },
        { title: "Vehicle Permits", content: "DMV commercial vehicle registration. Ambulance endorsement on driver's licenses for all drivers." }
      ]},
      { type: "list", title: "Compliance", items: [
        { title: "Inspections", content: "Annual CHP ambulance inspection verifying vehicle safety and equipment compliance. EMS Agency inspection for ALS equipment and operations." },
        { title: "Display", content: "Display current ambulance license certificate in vehicle. Maintain copies at business office." },
        { title: "Transfers", content: "Ambulance licenses non-transferable. New license required if vehicle sold or ownership changes." }
      ]},
      { type: "text", title: "Enforcement", content: "Operating ambulance without proper licenses subject to citations, fines, and vehicle impoundment. May result in loss of provider accreditation." }
    ]
  },
  {
    id: "438", refNo: "Ref. 438", title: "Provider Agency Reporting Requirements", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "summarize", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Reporting Requirements", subtitle: "Ref. 438" }] },
      { type: "text", title: "Regular Reports", content: "Provider agencies must submit regular reports to the EMS Agency including ePCR data, response statistics, and quality metrics." },
      { type: "accordion", title: "Special Incident Reporting", items: [
        { title: "Immediate", content: "Report within 24 hours: Patient deaths in EMS care, medication errors, equipment failures, provider injuries, complaints." },
        { title: "Quarterly", content: "System performance metrics, clinical indicators, and operational statistics." },
        { title: "Annual", content: "Renewal applications with updated documentation and inspection compliance." }
      ]}
    ]
  },
  {
    id: "439", refNo: "Ref. 439", title: "Special Operations", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "emergency", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Special Operations", subtitle: "Ref. 439" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements and procedures for specialized EMS operations beyond routine emergency response." },
      { type: "accordion", title: "Special Operations Categories", items: [
        { title: "Tactical EMS", content: "Medical support for law enforcement tactical teams (SWAT). Specially trained paramedics embedded with tactical units for high-risk operations." },
        { title: "Hazardous Materials", content: "Medical monitoring and treatment of hazmat incidents. Paramedics trained in hazmat awareness and decontamination procedures." },
        { title: "Urban Search and Rescue", content: "Medical support for USAR operations including confined space rescue, structural collapse, and technical rescue. Specialized training and equipment required." },
        { title: "Wilderness Medicine", content: "EMS operations in remote or wilderness areas requiring extended patient care, improvisation, and helicopter evacuation coordination." }
      ]},
      { type: "list", title: "Requirements", items: [
        { title: "Specialized Training", content: "Personnel must complete specialized training programs appropriate to their assignment. Annual continuing education in specialty areas." },
        { title: "Equipment", content: "Specialized equipment beyond standard ambulance complement. Examples: Tactical medical packs, hazmat monitoring devices, wilderness rescue equipment." },
        { title: "Coordination", content: "Operations coordinated with fire departments, law enforcement, and specialized response teams. Joint training and exercises required." }
      ]},
      { type: "text", title: "Authorization", content: "Special operations programs require EMS Agency approval and documentation of specialized training and equipment." }
    ]
  },
  {
    id: "440", refNo: "Ref. 440", title: "Ambulance Service Areas and Deployment", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "map", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Service Areas", subtitle: "Ref. 440" }] },
      { type: "text", title: "Overview", content: "LA County is divided into service areas with designated provider agencies responsible for 9-1-1 response." },
      { type: "text", title: "Deployment", content: "Providers must maintain adequate unit deployment to meet response time standards and service demand." }
    ]
  },
  {
    id: "441", refNo: "Ref. 441", title: "Provider Agency Inspections", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "fact_check", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Provider Inspections", subtitle: "Ref. 441" }] },
      { type: "text", title: "Purpose", content: "EMS Agency conducts regular inspections of provider agencies to verify compliance with operational and clinical standards." },
      { type: "list", title: "Inspection Types", items: [
        { title: "Annual Inspection", content: "Comprehensive inspection of facilities, vehicles, equipment, and documentation. Required for accreditation renewal." },
        { title: "Complaint Investigation", content: "Focused inspection in response to complaints or reported deficiencies." },
        { title: "Random Audits", content: "Unannounced spot checks of unit readiness, documentation, and operational compliance." }
      ]}
    ]
  },
  {
    id: "442", refNo: "Ref. 442", title: "Provider Agency Suspension or Revocation", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "block", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Suspension/Revocation", subtitle: "Ref. 442" }] },
      { type: "text", title: "Authority", content: "EMS Agency may suspend or revoke provider agency accreditation for serious violations or persistent non-compliance." },
      { type: "accordion", title: "Grounds for Action", items: [
        { title: "Immediate Suspension", content: "Imminent threat to patient safety, loss of medical director, failure to maintain insurance, operating without required licenses." },
        { title: "Revocation", content: "Repeated violations, fraudulent practices, conviction of crimes involving patient care, failure to correct deficiencies." }
      ]},
      { type: "text", title: "Due Process", content: "Provider entitled to notice, hearing, and appeal process before final revocation decision." }
    ]
  },
  {
    id: "443", refNo: "Ref. 443", title: "Provider Agency Staff Safety", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "health_and_safety", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Staff Safety", subtitle: "Ref. 443" }] },
      { type: "text", title: "Purpose", content: "Provider agencies must implement comprehensive safety programs to protect personnel from occupational hazards." },
      { type: "list", title: "Safety Programs", items: [
        { title: "Scene Safety", content: "Training on scene size-up, situational awareness, and threat assessment. Law enforcement coordination for violent or unsafe scenes." },
        { title: "Injury Prevention", content: "Safe patient lifting techniques, use of mechanical lift devices, proper body mechanics. Back injury prevention programs." },
        { title: "Occupational Health", content: "Immunization programs (Hepatitis B, Tdap, annual flu), TB screening, post-exposure protocols for infectious disease." }
      ]}
    ]
  },
  {
    id: "444", refNo: "Ref. 444", title: "Provider Agency Community Outreach", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "groups", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Community Outreach", subtitle: "Ref. 444" }] },
      { type: "text", title: "Purpose", content: "Provider agencies encouraged to participate in community education and public health initiatives." },
      { type: "list", title: "Programs", items: [
        { title: "CPR Training", content: "Public CPR and AED training classes. Hands-only CPR awareness campaigns." },
        { title: "Injury Prevention", content: "Fall prevention for seniors, car seat safety checks, bicycle helmet programs." },
        { title: "Public Education", content: "When to call 9-1-1, stroke and heart attack warning signs, overdose prevention." }
      ]}
    ]
  },
  {
    id: "445", refNo: "Ref. 445", title: "Provider Agency Performance Improvement Plans", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "trending_down", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Performance Improvement Plans", subtitle: "Ref. 445" }] },
      { type: "text", title: "Purpose", content: "When provider agencies fail to meet performance standards, EMS Agency may require performance improvement plan with specific corrective actions and timelines." },
      { type: "accordion", title: "Components", items: [
        { title: "Deficiency Identification", content: "Specific performance metrics or standards not being met. Examples: Response time failures, high medication error rates, documentation deficiencies." },
        { title: "Corrective Actions", content: "Detailed plan with specific steps to address deficiencies. May include additional training, process changes, or resource allocation." },
        { title: "Monitoring", content: "Regular progress reports to EMS Agency. Follow-up inspections to verify improvement." }
      ]}
    ]
  },
  {
    id: "446", refNo: "Ref. 446", title: "Provider Agency Disaster Preparedness", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "warning", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Disaster Preparedness", subtitle: "Ref. 446" }] },
      { type: "text", title: "Purpose", content: "Provider agencies must maintain disaster preparedness plans and participate in regional disaster response system." },
      { type: "list", title: "Requirements", items: [
        { title: "Emergency Plans", content: "Written disaster response plans addressing earthquakes, fires, civil unrest, and pandemics. Staff notification and recall procedures." },
        { title: "Resource Management", content: "Plans for surge capacity, mutual aid requests, and resource allocation during disasters." },
        { title: "Training and Drills", content: "Annual disaster drills and exercises. Participation in regional disaster preparedness planning." }
      ]}
    ]
  },
  {
    id: "447", refNo: "Ref. 447", title: "Provider Agency Fleet Management", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "local_shipping", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Fleet Management", subtitle: "Ref. 447" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements for ambulance fleet management including vehicle replacement, maintenance, and reserve capacity." },
      { type: "accordion", title: "Fleet Standards", items: [
        { title: "Vehicle Age", content: "Frontline ambulances should not exceed 5-7 years or 150,000 miles. Reserve vehicles may be older but must meet all safety and equipment standards." },
        { title: "Reserve Fleet", content: "Maintain reserve vehicles to ensure adequate coverage during maintenance, repairs, or surge demand. Minimum 10-15% reserve capacity recommended." },
        { title: "Replacement Planning", content: "Scheduled vehicle replacement program to maintain fleet reliability and minimize downtime." }
      ]}
    ]
  },
  {
    id: "448", refNo: "Ref. 448", title: "Provider Agency Technology Integration", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "computer", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Technology Integration", subtitle: "Ref. 448" }] },
      { type: "text", title: "Purpose", content: "Encourages adoption of advanced technologies to improve patient care and operational efficiency." },
      { type: "list", title: "Technologies", items: [
        { title: "Telemedicine", content: "Video consultation capabilities for Base Hospital medical control and specialty consultation." },
        { title: "GPS/AVL", content: "Automatic vehicle location systems for dispatch optimization and response time monitoring." },
        { title: "Mobile Data", content: "Tablets and mobile devices for ePCR completion, protocol access, and hospital bed availability." }
      ]}
    ]
  },
  {
    id: "449", refNo: "Ref. 449", title: "Provider Agency Best Practices", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "star", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Best Practices", subtitle: "Ref. 449" }] },
      { type: "text", title: "Purpose", content: "Compilation of recommended best practices for provider agency operations and clinical excellence." },
      { type: "accordion", title: "Recommended Practices", items: [
        { title: "Clinical Excellence", content: "Evidence-based protocols, ongoing education, clinical simulation training, peer review programs." },
        { title: "Operational Excellence", content: "Strategic deployment, predictive analytics for demand forecasting, efficient unit hour utilization." },
        { title: "Personnel Development", content: "Career development programs, mentorship, leadership training, employee wellness initiatives." },
        { title: "Patient Experience", content: "Patient satisfaction surveys, comfort measures, cultural competency, customer service training." }
      ]}
    ]
  },
  {
    id: "450", refNo: "Ref. 450", title: "Ambulance Ordinance", category: "Provider Agencies", type: "Policy", lastUpdated: "2024", icon: "ambulance", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Ambulance Ordinance", subtitle: "Ref. 450" }] },
      { type: "text", title: "Legal Authority", content: "LA County Code Title 7 (Business Licenses) Chapter 7.04 regulates ambulance operations within the County." },
      { type: "accordion", title: "Key Provisions", items: [
        { title: "Licensing", content: "All ambulance operators must obtain a County business license and comply with operational standards." },
        { title: "Vehicle Requirements", content: "Ambulances must meet state and local design, equipment, and safety standards." },
        { title: "Staffing", content: "Minimum staffing levels and personnel certification requirements." },
        { title: "Insurance", content: "Minimum liability insurance coverage required for all ambulance operators." }
      ]},
      { type: "text", title: "Enforcement", content: "Violations may result in license suspension or revocation by the County Business License Division and EMS Agency." }
    ]
  }
];
