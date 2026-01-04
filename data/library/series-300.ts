
import { Protocol } from '../../types';

export const series300: Protocol[] = [
  {
    id: "300", refNo: "Ref. 300", title: "Base Hospital System Overview", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "local_hospital", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Base Hospital System", subtitle: "Ref. 300" }] },
      { type: "text", title: "Overview", content: "The Base Hospital system provides medical direction, supervision, and quality assurance for paramedic field operations in LA County." },
      { type: "list", title: "Base Hospital Functions", items: [
        { title: "Online Medical Direction", content: "Real-time medical consultation and authorization for paramedic interventions via radio/telephone." },
        { title: "Offline Medical Direction", content: "Protocol development, training, and quality improvement oversight." },
        { title: "Quality Assurance", content: "Review and evaluation of paramedic patient care through call audits and base station monitoring." },
        { title: "Training & Testing", content: "Paramedic continuing education, skills verification, and competency evaluation." }
      ]}
    ]
  },
  {
    id: "301", refNo: "Ref. 301", title: "Base Hospital Designation Process", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "verified_user", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Base Hospital Designation", subtitle: "Ref. 301" }] },
      { type: "text", title: "Purpose", content: "Establishes requirements and process for hospitals to become designated Base Hospitals authorized to provide medical direction to paramedics." },
      { type: "accordion", title: "Designation Requirements", items: [
        { title: "Facility Requirements", content: "Must be a licensed General Acute Care Hospital with comprehensive emergency department. 24/7 physician coverage in ED." },
        { title: "Medical Director", content: "Physician designated as Base Hospital Medical Director with responsibility for paramedic oversight, quality assurance, and protocol compliance." },
        { title: "MICN Staffing", content: "Sufficient number of trained and authorized Mobile Intensive Care Nurses to provide 24/7 medical direction coverage." },
        { title: "Communications", content: "Dedicated recorded radio and telephone lines for paramedic contact. Redundant backup systems required." },
        { title: "Quality Improvement", content: "Structured QI program to review paramedic calls, provide feedback, and ensure protocol compliance." }
      ]},
      { type: "list", title: "Application Process", items: [
        { title: "1. Application", content: "Hospital submits application to EMS Agency documenting compliance with all Base Hospital requirements." },
        { title: "2. Site Review", content: "EMS Agency conducts on-site evaluation of facilities, staffing, equipment, and QI infrastructure." },
        { title: "3. Medical Director Approval", content: "EMS Medical Director reviews application and site visit findings." },
        { title: "4. Service Area Assignment", content: "Upon approval, Base Hospital assigned to geographic service area and provider agencies." }
      ]},
      { type: "text", title: "Ongoing Requirements", content: "Base Hospital designation reviewed annually. Must maintain compliance with all standards and participate in system-wide quality improvement initiatives." }
    ]
  },
  {
    id: "302", refNo: "Ref. 302", title: "9-1-1 Receiving Hospital Requirements", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "local_hospital", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Receiving Hospital", subtitle: "Ref. 302 • Standards" }] },
      { type: "text", title: "Medical Aid Receiving (MAR) Facility", content: "A hospital designated to receive 9-1-1 emergency patients from EMS units." },
      { type: "list", title: "Minimum Standards", items: [
        { title: "Licensure", content: "Must be a General Acute Care Hospital with a Basic or Comprehensive Emergency Medical Service permit." },
        { title: "Availability", content: "Emergency Department must be open 24 hours a day, 365 days a year." },
        { title: "Staffing", content: "Physician on duty in ED 24/7. RN staffing per Title 22 requirements." },
        { title: "Specialty Services", content: "Must have ICU/CCU capabilities and basic imaging (X-ray, CT)." },
        { title: "Laboratory", content: "24/7 on-site laboratory services for emergency testing." }
      ]}
    ]
  },
  {
    id: "303", refNo: "Ref. 303", title: "MICN Training and Certification Requirements", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "school", color: "blue",
    sections: [
      { type: "header", items: [{ title: "MICN Certification", subtitle: "Ref. 303" }] },
      { type: "text", title: "Purpose", content: "Mobile Intensive Care Nurses must complete specialized training to provide competent medical direction to paramedics." },
      { type: "accordion", title: "MICN Course Requirements", items: [
        { title: "Prerequisite", content: "Current California RN license. Minimum 2 years emergency or critical care nursing experience. Current ACLS and PALS certification." },
        { title: "Didactic Training", content: "40-hour MICN course covering: Paramedic scope of practice, EMS protocols, pharmacology, communication skills, legal/ethical issues." },
        { title: "Clinical Practicum", content: "Supervised Base Hospital shifts observing experienced MICNs. Practice giving radio orders under supervision." },
        { title: "Examination", content: "Written exam and practical skills assessment. Must demonstrate competency in providing appropriate medical direction." }
      ]},
      { type: "list", title: "Authorization Process", items: [
        { title: "Course Completion", content: "Successfully complete approved MICN training program." },
        { title: "Base Hospital Approval", content: "Base Hospital Medical Director evaluates competency and authorizes MICN practice." },
        { title: "EMS Agency Registration", content: "MICN registered with LA County EMS Agency upon Base Hospital Medical Director approval." },
        { title: "Continuing Education", content: "8 hours MICN-specific CE annually. Skills verification and call review conducted regularly." }
      ]}
    ]
  },
  {
    id: "304", refNo: "Ref. 304", title: "Paramedic Base Hospital Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "emergency", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Base Hospital Standards", subtitle: "Ref. 304" }] },
      { type: "text", title: "Role", content: "A designated hospital that provides medical direction and supervision to paramedic units in their service area." },
      { type: "accordion", title: "Key Requirements", items: [
        { title: "Medical Control", content: "Must provide immediate medical direction via radio/telephone 24/7 through Mobile Intensive Care Nurses (MICNs)." },
        { title: "Staffing", content: "<b>Medical Director:</b> Physician responsible for quality of care and paramedic oversight.<br><b>Prehospital Care Coordinator (PCC):</b> RN liaison for EMS operations.<br><b>MICN:</b> Mobile Intensive Care Nurses authorized to issue radio orders under physician supervision." },
        { title: "Equipment", content: "Dedicated recorded radio/telephone line (ReddiNet) and redundant communications systems." },
        { title: "Quality Improvement", content: "Must review at least 10% of all ALS calls and 100% of high-risk calls (cardiac arrest, airway management, medication errors)." }
      ]},
      { type: "list", title: "Designation Process", items: [
        { title: "Application", content: "Hospital applies to EMS Agency for Base Hospital designation." },
        { title: "Site Review", content: "EMS Agency evaluates facilities, staffing, and capabilities." },
        { title: "Approval", content: "EMS Medical Director approves designation for specified service area." }
      ]}
    ]
  },
  {
    id: "305", refNo: "Ref. 305", title: "Emergency Department Capability Designation", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "emergency_home", color: "blue",
    sections: [
      { type: "header", items: [{ title: "ED Designation Standards", subtitle: "Ref. 305" }] },
      { type: "text", title: "Purpose", content: "Emergency department capability levels ensure appropriate patient triage and facility matching based on available resources." },
      { type: "accordion", title: "ED Capability Levels", items: [
        { title: "Basic Emergency Department", content: "Licensed to provide emergency care for general medical and traumatic conditions. May stabilize and transfer complex patients requiring specialized resources." },
        { title: "Comprehensive Emergency Department", content: "Advanced capabilities including specialty consultation, surgical services, intensive care. Can manage most emergency conditions definitively." },
        { title: "Specialty Emergency Centers", content: "Dedicated centers with specialized resources: STEMI centers (PCI capability), Stroke centers (neurology/thrombectomy), Trauma centers, Pediatric centers." }
      ]},
      { type: "list", title: "Resource Requirements", items: [
        { title: "Physician Staffing", content: "Board-certified or board-eligible emergency physician coverage 24/7 for comprehensive EDs. Basic EDs may use on-call physician model." },
        { title: "Nursing Staffing", content: "RN staffing ratios per Title 22 based on patient volume and acuity. Emergency nursing certification preferred." },
        { title: "Ancillary Services", content: "Laboratory, radiology, pharmacy available 24/7. Operating rooms and ICU required for comprehensive designation." }
      ]},
      { type: "text", title: "EMS Interface", content: "Hospitals must notify EMS of capability status changes. Diversion protocols activated when resources exhausted." }
    ]
  },
  {
    id: "306", refNo: "Ref. 306", title: "MICN Authorization and Training", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "support_agent", color: "blue",
    sections: [
      { type: "header", items: [{ title: "MICN Standards", subtitle: "Ref. 306" }] },
      { type: "text", title: "Mobile Intensive Care Nurse (MICN)", content: "A Registered Nurse specifically trained and authorized to provide online medical direction to paramedics." },
      { type: "accordion", title: "Requirements", items: [
        { title: "Qualifications", content: "Current California RN license. Minimum 2 years ED or critical care experience. Completion of MICN training program." },
        { title: "Training", content: "40-hour MICN course covering: Paramedic scope of practice, EMS protocols, Communication skills, Legal/ethical issues." },
        { title: "Authorization", content: "Must be authorized by Base Hospital Medical Director and registered with EMS Agency." },
        { title: "Continuing Education", content: "8 hours annually of MICN-specific CE. Skills verification and call review." }
      ]}
    ]
  },
  {
    id: "307", refNo: "Ref. 307", title: "Specialty Center Designation Requirements", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "domain_verification", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Specialty Center Requirements", subtitle: "Ref. 307" }] },
      { type: "text", title: "Overview", content: "Specialty centers provide advanced capabilities for specific patient populations requiring time-sensitive, specialized care." },
      { type: "accordion", title: "Designation Categories", items: [
        { title: "Cardiac Centers", content: "STEMI Receiving Centers with 24/7 PCI capability, heart failure centers, electrophysiology centers." },
        { title: "Stroke Centers", content: "Primary Stroke Centers (tPA capable) and Comprehensive Stroke Centers (thrombectomy, neurosurgery)." },
        { title: "Trauma Centers", content: "Level I/II/III trauma designation based on surgical, subspecialty, and research capabilities." },
        { title: "Specialty Pediatric Centers", content: "Pediatric Medical Centers, Pediatric Trauma Centers, Neonatal Centers with NICU capability." },
        { title: "Other Specialties", content: "Burn centers, hyperbaric centers, toxicology centers, psychiatric receiving facilities." }
      ]},
      { type: "list", title: "General Requirements", items: [
        { title: "Application", content: "Hospitals apply to EMS Agency with documentation of specialized resources, staffing, and protocols." },
        { title: "Site Verification", content: "EMS Agency or designee conducts site visit to verify capabilities meet designation standards." },
        { title: "Ongoing Compliance", content: "Annual data submission, participation in quality improvement, and re-designation process per specialty requirements." },
        { title: "No Diversion", content: "Most specialty centers required to accept patients meeting designation criteria regardless of ED saturation." }
      ]}
    ]
  },
  {
    id: "308", refNo: "Ref. 308", title: "Trauma Center Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "personal_injury", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Trauma Center Standards", subtitle: "Ref. 308" }] },
      { type: "text", title: "Designation", content: "Hospitals may be designated as Level I, II, or III Trauma Centers based on resources and capabilities." },
      { type: "accordion", title: "Trauma Center Levels", items: [
        { title: "Level I (Regional Trauma Center)", content: "Comprehensive care with 24/7 in-house trauma team, neurosurgery, orthopedic surgery, and all subspecialties. Teaching and research programs required." },
        { title: "Level II (Area Trauma Center)", content: "Definitive care for most injuries. 24/7 general surgery, orthopedics, neurosurgery (on-call acceptable). May transfer complex cases." },
        { title: "Level III (Community Trauma Center)", content: "Stabilization and initial management. May transfer to higher-level center for specialized care." }
      ]},
      { type: "list", title: "Key Requirements", items: [
        { title: "Activation Criteria", content: "Written trauma activation criteria for tiered response based on injury severity." },
        { title: "Trauma Registry", content: "Must maintain trauma registry and participate in regional data submission." },
        { title: "Performance Improvement", content: "Trauma PI program with Morbidity & Mortality review." }
      ]}
    ]
  },
  {
    id: "309", refNo: "Ref. 309", title: "Pediatric Emergency Care Facility Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "child_friendly", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Pediatric Facility Standards", subtitle: "Ref. 309" }] },
      { type: "text", title: "Purpose", content: "Ensures emergency departments have appropriate equipment, training, and protocols to care for pediatric patients (birth to age 18)." },
      { type: "accordion", title: "Pediatric Readiness Standards", items: [
        { title: "Equipment", content: "Age and weight-appropriate equipment for all pediatric ages: Airway equipment (infant/child sizes), defibrillator with pediatric pads and energy capability, Broselow tape for medication dosing." },
        { title: "Medication", content: "Pediatric formulations and dosing references available. Pre-calculated dosing charts or electronic decision support for weight-based medications." },
        { title: "Training", content: "Physicians and nurses trained in pediatric emergency care. PALS certification required for all clinical staff." },
        { title: "Policies", content: "Pediatric-specific policies for: Consent and family presence, pain management, recognition of child abuse." }
      ]},
      { type: "list", title: "EDAP Designation", items: [
        { title: "Emergency Department Approved for Pediatrics", content: "Hospitals meeting pediatric readiness standards designated as EDAP to receive 9-1-1 pediatric patients." },
        { title: "Pediatric Quality Metrics", content: "Track pediatric-specific performance indicators: Pain assessment, asthma care, sepsis recognition." },
        { title: "Pediatric Champion", content: "Designated physician and nurse champions for pediatric emergency care quality improvement." }
      ]}
    ]
  },
  {
    id: "310", refNo: "Ref. 310", title: "Pediatric Medical Center (PMC) Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "blue",
    sections: [
      { type: "header", items: [{ title: "PMC Standards", subtitle: "Ref. 310" }] },
      { type: "text", title: "Overview", content: "Pediatric Medical Centers are specialized facilities equipped to provide comprehensive emergency care for critically ill or injured children." },
      { type: "list", title: "Requirements", items: [
        { title: "Pediatric ED", content: "Dedicated pediatric emergency department or mixed ED with pediatric expertise." },
        { title: "Staffing", content: "Pediatric Emergency Medicine physicians and pediatric-trained nurses 24/7." },
        { title: "Equipment", content: "Age/weight-appropriate equipment for all pediatric patients (neonate to adolescent)." },
        { title: "Subspecialty Availability", content: "Pediatric surgery, anesthesia, and critical care available on-call or by transfer agreement." }
      ]}
    ]
  },
  {
    id: "311", refNo: "Ref. 311", title: "Trauma System Performance Improvement", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "insights", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Trauma System PI", subtitle: "Ref. 311" }] },
      { type: "text", title: "Purpose", content: "Trauma system performance improvement ensures continuous quality enhancement through systematic review of trauma care from field to definitive treatment." },
      { type: "accordion", title: "PI Components", items: [
        { title: "Trauma Registry", content: "All designated trauma centers maintain trauma registry with standardized data elements. Submitted to regional and national trauma data banks." },
        { title: "Morbidity & Mortality Review", content: "Multidisciplinary review of trauma deaths and complications. Identify opportunities for improvement in prehospital and hospital care." },
        { title: "EMS-Hospital Interface", content: "Collaborative review of field triage accuracy, transport decisions, and prehospital interventions." },
        { title: "Outcome Analysis", content: "Risk-adjusted outcome comparisons across trauma centers. Benchmarking against national standards." }
      ]},
      { type: "text", title: "System-Wide Initiatives", content: "Regional trauma committee coordinates system improvement projects: Field triage guideline updates, transfer protocols, and trauma education programs." }
    ]
  },
  {
    id: "312", refNo: "Ref. 312", title: "Pediatric Trauma Center (PTC) Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Pediatric Trauma Center", subtitle: "Ref. 312" }] },
      { type: "text", title: "Designation", content: "Hospitals designated to receive pediatric trauma patients (age <15) with specialized pediatric trauma capabilities." },
      { type: "accordion", title: "Standards", items: [
        { title: "Trauma Team", content: "Pediatric-capable trauma team available 24/7 with pediatric surgeon and anesthesiologist." },
        { title: "ICU", content: "Pediatric ICU (PICU) with appropriate monitoring and life support equipment." },
        { title: "Imaging", content: "Rapid access to CT, ultrasound, and interventional radiology." },
        { title: "Subspecialties", content: "Neurosurgery, orthopedics, and other surgical specialties available." }
      ]}
    ]
  },
  {
    id: "313", refNo: "Ref. 313", title: "Cardiac Receiving Center Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "favorite", color: "red",
    sections: [
      { type: "header", items: [{ title: "Cardiac Center Standards", subtitle: "Ref. 313" }] },
      { type: "text", title: "Overview", content: "Cardiac receiving centers provide specialized cardiac care including emergency percutaneous coronary intervention (PCI) for STEMI patients." },
      { type: "accordion", title: "Cardiac Center Capabilities", items: [
        { title: "STEMI Receiving Center", content: "24/7 PCI capability with interventional cardiologist, cath lab team, and support staff available within 30 minutes. Door-to-balloon goal <90 minutes from first medical contact." },
        { title: "Heart Failure Center", content: "Specialized inpatient and outpatient heart failure management including advanced therapies (LVAD, transplant evaluation)." },
        { title: "Electrophysiology Center", content: "EP lab for arrhythmia management, pacemaker/ICD implantation, and ablation procedures." },
        { title: "Cardiac Surgery", content: "On-site cardiac surgery capability for emergency CABG and complications of PCI." }
      ]},
      { type: "list", title: "EMS Interface", items: [
        { title: "STEMI Activation", content: "EMS 12-lead ECG transmitted to SRC for physician interpretation. Cath lab activated pre-arrival for confirmed STEMI." },
        { title: "No Diversion", content: "STEMI Receiving Centers cannot divert STEMI patients regardless of ED saturation or cath lab occupancy." },
        { title: "Quality Metrics", content: "Track door-to-balloon times, first medical contact to device times, and patient outcomes." }
      ]}
    ]
  },
  {
    id: "314", refNo: "Ref. 314", title: "Burn Center Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "whatshot", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Burn Center Standards", subtitle: "Ref. 314" }] },
      { type: "text", title: "Overview", content: "Designated facilities with specialized resources for the treatment of severe burn injuries." },
      { type: "list", title: "Capabilities", items: [
        { title: "Burn Unit", content: "Dedicated burn unit with specialized nursing and wound care." },
        { title: "Burn Surgery", content: "Surgeon with specialized training in burn management available 24/7." },
        { title: "Rehabilitation", content: "Physical therapy, occupational therapy, and psychological support for burn recovery." }
      ]},
      { type: "text", title: "Transfer Criteria", content: "Patients with >20% TBSA, inhalation injury, high-voltage electrical burns, or burns to critical areas (face, hands, feet, genitals) should be transferred to a Burn Center." }
    ]
  },
  {
    id: "315", refNo: "Ref. 315", title: "Stroke System of Care", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "neurology", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Stroke System of Care", subtitle: "Ref. 315" }] },
      { type: "text", title: "Purpose", content: "Coordinated stroke system ensures rapid identification, transport, and treatment of stroke patients to reduce disability and mortality." },
      { type: "accordion", title: "Stroke Center Levels", items: [
        { title: "Primary Stroke Center (PSC)", content: "Capability to administer IV tPA for ischemic stroke. Neurology consultation 24/7 (telemedicine acceptable). Goal: Door-to-needle time <60 minutes." },
        { title: "Comprehensive Stroke Center (CSC)", content: "Advanced capabilities including endovascular thrombectomy, neurosurgery, neuro-ICU. Can manage complex strokes and hemorrhagic complications." },
        { title: "Thrombectomy-Capable Center", content: "Intermediate level with mechanical thrombectomy capability but may not have full CSC resources." }
      ]},
      { type: "list", title: "EMS Stroke Care", items: [
        { title: "Prehospital Screening", content: "Field stroke assessment using validated tool (CPSS, LAMS). Time of symptom onset documented." },
        { title: "Destination Selection", content: "Transport to closest appropriate stroke center. Large vessel occlusion suspects may bypass PSC for CSC." },
        { title: "Hospital Notification", content: "Stroke alert called to receiving facility to mobilize stroke team pre-arrival." }
      ]},
      { type: "text", title: "Time Targets", content: "System goal: First medical contact to treatment <90 minutes for tPA, <120 minutes for thrombectomy." }
    ]
  },
  {
    id: "316", refNo: "Ref. 316", title: "EDAP Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "blue",
    sections: [
      { type: "header", items: [{ title: "EDAP Standards", subtitle: "Ref. 316" }] },
      { type: "text", title: "Emergency Department Approved for Pediatrics (EDAP)", content: "Hospitals designated to receive 9-1-1 pediatric patients based on meeting specific pediatric readiness standards." },
      { type: "accordion", title: "Requirements", items: [
        { title: "Staffing", content: "Physicians and nurses trained in pediatric emergency care. PALS certification required." },
        { title: "Equipment", content: "Pediatric-specific equipment including age/weight-appropriate airway equipment, medication dosing guides (Broselow tape), and resuscitation supplies." },
        { title: "Training", content: "Staff must complete pediatric continuing education annually." },
        { title: "Quality Improvement", content: "Pediatric-specific PI indicators and chart review process." }
      ]},
      { type: "text", title: "Transport Policy", content: "Critically ill pediatric patients should be transported to an EDAP or Pediatric Medical Center when time/distance permits." }
    ]
  },
  {
    id: "317", refNo: "Ref. 317", title: "Critical Care Center and ICU Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "icu", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Critical Care Standards", subtitle: "Ref. 317" }] },
      { type: "text", title: "Purpose", content: "Critical care centers provide intensive monitoring and life support for critically ill or injured patients." },
      { type: "accordion", title: "ICU Types", items: [
        { title: "Medical ICU (MICU)", content: "Manages medical critical illness: Sepsis, respiratory failure, multiorgan dysfunction. Intensivist-led care." },
        { title: "Surgical ICU (SICU)", content: "Post-operative critical care for major surgery patients. Trauma and general surgery coverage." },
        { title: "Cardiac ICU (CCU)", content: "Specialized cardiac monitoring and life support. Post-MI, heart failure, arrhythmias, post-cardiac surgery." },
        { title: "Neuro ICU", content: "Specialized care for stroke, brain injury, neurosurgical patients. ICP monitoring and neuro protocols." },
        { title: "Pediatric ICU (PICU)", content: "Critical care for children requiring intensive monitoring, mechanical ventilation, or vasopressor support." },
        { title: "Neonatal ICU (NICU)", content: "Specialized care for premature infants and critically ill newborns." }
      ]},
      { type: "list", title: "Staffing Requirements", items: [
        { title: "Physician Coverage", content: "Intensivist or ICU-trained physician available 24/7 (in-house or rapid response)." },
        { title: "Nursing Ratios", content: "ICU RN-to-patient ratios per Title 22: 1:2 for most ICU patients, 1:1 for unstable/complex patients." },
        { title: "Respiratory Therapy", content: "Respiratory therapist available 24/7 for ventilator management." }
      ]}
    ]
  },
  {
    id: "318", refNo: "Ref. 318", title: "Neonatal Center Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "pink",
    sections: [
      { type: "header", items: [{ title: "Neonatal Center", subtitle: "Ref. 318" }] },
      { type: "text", title: "Overview", content: "Facilities with Neonatal Intensive Care Units (NICU) capable of caring for premature infants and critically ill newborns." },
      { type: "list", title: "NICU Levels", items: [
        { title: "Level III", content: "Regional NICU with capability to care for infants <32 weeks gestation and <1500g. Neonatology 24/7." },
        { title: "Level II", content: "Intermediate care for stable premature infants. May transfer micro-preemies to Level III." }
      ]}
    ]
  },
  {
    id: "319", refNo: "Ref. 319", title: "Specialty Toxicology and Poison Control Centers", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "warning_amber", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Toxicology Centers", subtitle: "Ref. 319" }] },
      { type: "text", title: "Purpose", content: "Specialty toxicology centers provide advanced management of poisonings, overdoses, and hazardous materials exposures." },
      { type: "accordion", title: "Services", items: [
        { title: "Poison Control Center", content: "24/7 telephone consultation service staffed by certified poison information specialists and toxicologists. Provides treatment recommendations for poisonings and overdoses." },
        { title: "Toxicology Ward", content: "Specialized inpatient units for managing severe poisonings requiring continuous monitoring and antidote administration." },
        { title: "Antidote Availability", content: "Comprehensive antidote formulary including: N-acetylcysteine (acetaminophen), digoxin immune fab, antivenoms, hydroxocobalamin (cyanide), fomepizole (toxic alcohols)." },
        { title: "Extracorporeal Therapy", content: "Hemodialysis and hemoperfusion for elimination of dialyzable toxins (lithium, salicylates, toxic alcohols)." }
      ]},
      { type: "list", title: "EMS Interface", items: [
        { title: "Consultation", content: "Poison Control Center (1-800-222-1222) available for field consultation on poisonings and overdoses." },
        { title: "Specialized Transport", content: "Severe poisonings may require transport to designated toxicology center for specialized care." }
      ]}
    ]
  },
  {
    id: "320", refNo: "Ref. 320", title: "STEMI Receiving Center Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "monitor_heart", color: "red",
    sections: [
      { type: "header", items: [{ title: "STEMI Receiving Center", subtitle: "Ref. 320" }] },
      { type: "text", title: "STEMI Receiving Center (SRC)", content: "Hospitals with 24/7 Percutaneous Coronary Intervention (PCI) capability designated to receive STEMI patients directly from EMS." },
      { type: "accordion", title: "Requirements", items: [
        { title: "Cath Lab", content: "24/7 availability with interventional cardiologist, cath lab team, and support staff able to activate within 30 minutes." },
        { title: "Door-to-Balloon Time", content: "Goal: <90 minutes from first medical contact. Tracked via quality metrics." },
        { title: "STEMI Protocol", content: "Written STEMI activation protocol with single-call activation system." },
        { title: "No Diversion", content: "STEMI Receiving Centers must accept all STEMI patients regardless of ED bed status." }
      ]},
      { type: "text", title: "EMS Activation", content: "Paramedics transmit 12-lead ECG to SRC for physician interpretation. Direct transport bypasses non-PCI facilities." }
    ]
  },
  {
    id: "321", refNo: "Ref. 321", title: "Advanced Life Support and Resuscitation Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "healing", color: "red",
    sections: [
      { type: "header", items: [{ title: "ALS Resuscitation Standards", subtitle: "Ref. 321" }] },
      { type: "text", title: "Purpose", content: "Hospitals must maintain capability to receive and continue advanced life support for patients in cardiac arrest or requiring advanced airway management." },
      { type: "accordion", title: "Resuscitation Standards", items: [
        { title: "ED Resuscitation Bay", content: "Dedicated resuscitation area with advanced airway equipment, defibrillator, medications, and code cart. Immediately available for arriving critical patients." },
        { title: "ACLS Team", content: "Physician and nursing team trained in ACLS immediately available for resuscitation. Code team response <5 minutes." },
        { title: "Post-Arrest Care", content: "Capability to provide post-cardiac arrest care including targeted temperature management, hemodynamic support, and PCI for ROSC patients." },
        { title: "Equipment", content: "Mechanical CPR devices, video laryngoscopy, ultrasound for resuscitation, extracorporeal CPR (ECPR) at select centers." }
      ]},
      { type: "text", title: "EMS Coordination", content: "Pre-arrival notification for cardiac arrest patients allows team mobilization. Seamless transfer of care from EMS to ED resuscitation team." }
    ]
  },
  {
    id: "322", refNo: "Ref. 322", title: "Stroke Receiving Center Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "neurology", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Stroke Receiving Center", subtitle: "Ref. 322" }] },
      { type: "text", title: "Stroke Center Designation", content: "Hospitals certified to provide time-sensitive stroke care including thrombolysis (tPA) and/or endovascular thrombectomy." },
      { type: "accordion", title: "Stroke Center Levels", items: [
        { title: "Primary Stroke Center (PSC)", content: "Capability to administer tPA and manage most strokes. 24/7 CT, neurology consultation, and stroke protocol. Goal: Door-to-Needle <60 minutes." },
        { title: "Comprehensive Stroke Center (CSC)", content: "Advanced capabilities including endovascular thrombectomy, neurosurgery, and neuro-ICU. Able to manage complex strokes and intracerebral hemorrhage." }
      ]},
      { type: "list", title: "Requirements", items: [
        { title: "Imaging", content: "24/7 CT or MRI with rapid interpretation." },
        { title: "Neurology", content: "Neurologist available for consultation (in-house or via telemedicine acceptable for PSC)." },
        { title: "Protocols", content: "Written stroke activation protocol and time-based metrics." }
      ]}
    ]
  },
  {
    id: "323", refNo: "Ref. 323", title: "Interfacility Transfer Protocols", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "swap_horiz", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Transfer Protocols", subtitle: "Ref. 323" }] },
      { type: "text", title: "Purpose", content: "Establishes standards for interfacility transfer of patients requiring higher level of care or specialized services." },
      { type: "accordion", title: "Transfer Requirements", items: [
        { title: "EMTALA Compliance", content: "Transfers must comply with Emergency Medical Treatment and Labor Act (EMTALA). Sending facility must stabilize patient within capabilities before transfer. Receiving facility must accept if has capacity." },
        { title: "Physician Certification", content: "Transferring physician must certify that benefits of transfer outweigh risks. Documentation of medical necessity and accepting physician required." },
        { title: "Transfer Agreements", content: "Hospitals maintain written transfer agreements with specialty centers for common transfer scenarios (trauma, STEMI, stroke, high-risk OB)." },
        { title: "Mode of Transport", content: "Appropriate level of care during transport: BLS, ALS, CCT, air ambulance based on patient acuity and required interventions." }
      ]},
      { type: "list", title: "Communication Standards", items: [
        { title: "Physician-to-Physician", content: "Direct communication between sending and receiving physicians to discuss patient condition and care plan." },
        { title: "Medical Records", content: "Copy of medical records, imaging studies, and laboratory results accompany patient." },
        { title: "Transport Report", content: "Sending facility provides report to transport crew including patient condition, interventions, and anticipated needs." }
      ]}
    ]
  },
  {
    id: "324", refNo: "Ref. 324", title: "SART Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "support", color: "blue",
    sections: [
      { type: "header", items: [{ title: "SART Standards", subtitle: "Ref. 324 • Sexual Assault Response Team" }] },
      { type: "text", title: "Policy Purpose", content: "Establishes standards for hospitals designated as SART Centers to provide specialized medical/forensic exams for victims of sexual assault." },
      { type: "list", title: "SART Center Requirements", items: [
        { title: "24/7 Availability", content: "Must have a qualified SART examiner (SANE - Sexual Assault Nurse Examiner) available 24 hours a day." },
        { title: "Exam Room", content: "A private, designated area for examinations that ensures privacy and safety." },
        { title: "Evidence Collection", content: "Must maintain proper chain of custody for all forensic evidence collected (sexual assault evidence kits)." },
        { title: "Advocacy", content: "Victim advocacy services available to provide emotional support and resource referrals." }
      ]},
      { type: "accordion", title: "Patient Transport Guidelines", items: [
        { title: "Medical Stability First", content: "Patients with acute medical or traumatic emergencies (e.g., severe bleeding, unstable vitals) must be transported to the closest appropriate receiving facility (MAR/Trauma Center) for stabilization, regardless of SART status." },
        { title: "Stable Patients", content: "Medically stable patients requesting an exam should be transported directly to the nearest designated SART Center." },
        { title: "Minors (<14)", content: "Should be transported to a SART Center that is also an EDAP (Emergency Department Approved for Pediatrics)." }
      ]}
    ]
  },
  {
    id: "325", refNo: "Ref. 325", title: "Hospital Communications and Notification Requirements", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "notifications_active", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Hospital Communications", subtitle: "Ref. 325" }] },
      { type: "text", title: "Purpose", content: "Establishes standards for communication between EMS and receiving hospitals to ensure appropriate patient care coordination." },
      { type: "accordion", title: "Notification Requirements", items: [
        { title: "Pre-Arrival Notification", content: "EMS provides advance notice for: Trauma activations, STEMI alerts, Stroke alerts, Cardiac arrest/ROSC, Critical airway patients, Pediatric resuscitations." },
        { title: "Base Hospital Contact", content: "Required Base contact for interventions beyond standing orders, high-risk patients, and AMA refusals. MICN provides medical direction." },
        { title: "Specialty Center Activation", content: "Direct notification to specialty teams: Trauma team, cath lab, stroke team. Allows resource mobilization pre-arrival." },
        { title: "Hospital Status Updates", content: "Hospitals notify EMS via ReddiNet of: ED saturation/diversion, specialty center closures, disaster status changes." }
      ]},
      { type: "list", title: "Communication Systems", items: [
        { title: "Radio/Telephone", content: "800 MHz radio primary, cellular telephone backup. Recorded lines for quality assurance." },
        { title: "Data Transmission", content: "12-lead ECG transmission for STEMI activation. ePCR data sharing for continuity of care." },
        { title: "ReddiNet", content: "Regional hospital status system for real-time capacity and diversion tracking." }
      ]}
    ]
  },
  {
    id: "326", refNo: "Ref. 326", title: "Psychiatric Urgent Care Center (PUCC) Standards", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "psychology", color: "indigo",
    sections: [
      { type: "header", items: [{ title: "PUCC Standards", subtitle: "Ref. 326" }] },
      { type: "text", title: "Overview", content: "Standards for facilities designated to receive 5150 (involuntary psychiatric hold) patients directly from EMS, bypassing the Emergency Department." },
      { type: "accordion", title: "Acceptance Criteria", items: [
        { title: "Age", content: "Adults (18+) and Adolescents (13-17) if facility has adolescent authorization." },
        { title: "Medical Clearance", content: "Patient must be medically stable:<br>• HR 60-100 bpm<br>• SBP 90-180 mmHg<br>• RR 12-20/min<br>• SpO2 > 94% on room air<br>• No acute trauma or active bleeding<br>• Ambulatory (or at baseline mobility)" },
        { title: "Exclusions", content: "Cannot accept patients with: Overdose, recent seizures, chest pain, shortness of breath, pregnancy > 20 weeks, or need for IV medications/fluids." }
      ]},
      { type: "text", title: "Benefits", content: "Reduces ED overcrowding by diverting medically stable psychiatric patients to specialized psychiatric facilities for evaluation and treatment." }
    ]
  },
  {
    id: "327", refNo: "Ref. 327", title: "Hospital Quality Assurance and Performance Improvement", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "verified", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Hospital QA/PI", subtitle: "Ref. 327" }] },
      { type: "text", title: "Purpose", content: "Hospitals must maintain robust quality assurance and performance improvement programs to monitor and enhance emergency care delivery." },
      { type: "accordion", title: "QA/PI Requirements", items: [
        { title: "ED Quality Metrics", content: "Track core measures: Door-to-doctor time, patient satisfaction, left without being seen (LWBS) rates, readmission rates." },
        { title: "Specialty Metrics", content: "Time-sensitive conditions tracked: Door-to-balloon (STEMI), door-to-needle (stroke), trauma activation times, sepsis bundle compliance." },
        { title: "Morbidity & Mortality Review", content: "Multidisciplinary review of adverse events, unexpected deaths, and complications. Identify system failures and improvement opportunities." },
        { title: "EMS Interface Review", content: "Collaborative review with EMS providers on field triage accuracy, communication quality, and handoff process." }
      ]},
      { type: "list", title: "Continuous Improvement", items: [
        { title: "Plan-Do-Study-Act Cycles", content: "Systematic approach to testing and implementing process improvements." },
        { title: "Benchmarking", content: "Compare performance to regional and national standards. Participate in national quality registries." },
        { title: "Staff Education", content: "QI findings used to guide continuing education and protocol revisions." }
      ]},
      { type: "text", title: "Reporting", content: "Submit quality data to EMS Agency, state health department, and national quality organizations as required." }
    ]
  },
  {
    id: "328", refNo: "Ref. 328", title: "Hyperbaric Chamber Facilities", category: "Base Hospital", type: "Policy", lastUpdated: "2024", icon: "air", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Hyperbaric Chamber", subtitle: "Ref. 328" }] },
      { type: "text", title: "Overview", content: "Facilities with hyperbaric oxygen therapy (HBOT) chambers for treatment of carbon monoxide poisoning, decompression sickness, and other indications." },
      { type: "list", title: "Indications for HBOT", items: [
        { title: "Carbon Monoxide", content: "Severe CO poisoning (COHb >25%, neurologic symptoms, pregnancy)." },
        { title: "Decompression Illness", content: "SCUBA diving accidents (arterial gas embolism, decompression sickness)." },
        { title: "Other", content: "Necrotizing soft tissue infections, crush injuries, problem wounds." }
      ]}
    ]
  }
];
