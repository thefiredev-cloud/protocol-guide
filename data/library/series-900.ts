
import { Protocol } from '../../types';

export const series900: Protocol[] = [
  {
    id: "900", refNo: "Ref. 900", title: "EMS Education and Training Overview", category: "Training", type: "Policy", lastUpdated: "2024", icon: "school", color: "slate",
    sections: [
      { type: "header", items: [{ title: "EMS Education Overview", subtitle: "Ref. 900" }] },
      { type: "text", title: "Purpose", content: "Establishes standards for all EMS education programs within LA County. All programs must be approved by the EMS Agency Medical Director and comply with California EMS Authority requirements." },
      { type: "accordion", title: "Program Types", items: [
        { title: "EMT Training", content: "Basic life support education for Emergency Medical Technician certification. Minimum 170 hours didactic and clinical training." },
        { title: "AEMT Training", content: "Advanced EMT programs build on EMT base with IV therapy, advanced airway, and limited medication administration." },
        { title: "Paramedic Training", content: "Advanced life support education leading to paramedic licensure. Requires 1000+ hours of didactic, clinical, and field training." },
        { title: "Continuing Education", content: "Ongoing education required for certification renewal and skill maintenance." }
      ]},
      { type: "list", title: "Program Approval Requirements", items: [
        { title: "Application", content: "Programs must submit application to EMS Agency including curriculum, instructor qualifications, clinical sites, equipment inventory." },
        { title: "Accreditation", content: "Programs must be approved by California EMS Authority and accredited by CoAEMSP (Committee on Accreditation of Educational Programs for EMS Professions) for paramedic programs." },
        { title: "Medical Direction", content: "All programs require designated medical director who oversees curriculum and clinical training." },
        { title: "Site Review", content: "EMS Agency conducts site visits to evaluate facilities, equipment, clinical sites, and program operations." },
        { title: "Annual Reporting", content: "Programs submit annual reports including student enrollment, completion rates, certification pass rates, instructor credentials." }
      ]},
      { type: "accordion", title: "Educational Standards", items: [
        { title: "Curriculum", content: "Programs must follow National EMS Education Standards and California EMS Authority curriculum requirements." },
        { title: "Instructor Qualifications", content: "Lead instructors must hold current certification at or above level being taught plus instructor certification and teaching experience (Ref. 905)." },
        { title: "Student Assessment", content: "Regular knowledge and skills assessments throughout program. Minimum passing score 80% on written exams, competent performance on skills." },
        { title: "Clinical Sites", content: "Approved clinical rotation sites with qualified preceptors. Must provide adequate patient exposure and skill opportunities." },
        { title: "Equipment", content: "Programs must maintain adequate training equipment including mannequins, airway trainers, monitors, medications, ambulances." }
      ]},
      { type: "list", title: "Student Requirements", items: [
        { title: "Prerequisites", content: "High school diploma or GED. Current CPR certification. Background check and physical exam." },
        { title: "Attendance", content: "Minimum 90% attendance required. Missed time must be made up." },
        { title: "Clinical Competency", content: "Students must complete required patient contacts and demonstrate competency in all required skills." },
        { title: "Professional Conduct", content: "Students must maintain professional behavior, patient confidentiality, and ethical standards throughout training." }
      ]},
      { type: "warning", content: "Programs failing to meet standards may be placed on probation or have approval revoked. Students from non-approved programs are not eligible for LA County certification." }
    ]
  },
  {
    id: "901", refNo: "Ref. 901", title: "EMT Training Program Standards", category: "Training", type: "Policy", lastUpdated: "2024", icon: "school", color: "blue",
    sections: [
      { type: "header", items: [{ title: "EMT Training", subtitle: "Ref. 901" }] },
      { type: "text", title: "Purpose", content: "Establishes minimum requirements for Emergency Medical Technician training programs preparing students for NREMT certification and LA County EMT accreditation." },
      { type: "list", title: "Program Requirements", items: [
        { title: "Total Hours", content: "Minimum 170 hours: 136 hours didactic instruction, 16 hours clinical rotation, 18 hours practical skills laboratory." },
        { title: "Class Size", content: "Maximum 30:1 student-to-instructor ratio for didactic. Maximum 6:1 for skills labs and testing." },
        { title: "Duration", content: "Program completion within 6 months for full-time programs, 12 months for part-time programs." },
        { title: "Curriculum", content: "Must follow National EMS Education Standards for EMT and California EMS Authority EMT curriculum." }
      ]},
      { type: "accordion", title: "Curriculum Content", items: [
        { title: "Preparatory Modules", content: "EMS systems, research, workforce safety, documentation, communication, therapeutic communication, medical/legal/ethical issues." },
        { title: "Anatomy & Physiology", content: "Basic A&P, pathophysiology, life span development, public health." },
        { title: "Patient Assessment", content: "Scene size-up, primary assessment, history taking, secondary assessment, monitoring devices, reassessment." },
        { title: "Airway Management", content: "Airway anatomy, oxygenation, suctioning, basic airway adjuncts (OPA/NPA), BVM ventilation, supplemental oxygen." },
        { title: "Medical Emergencies", content: "Respiratory, cardiovascular, neurologic, endocrine, allergic, GI, GU, toxicology, psychiatric, gynecologic, hematologic emergencies." },
        { title: "Trauma", content: "Bleeding, soft tissue injuries, burns, head/spine/chest/abdominal trauma, orthopedic trauma, environmental emergencies." },
        { title: "Special Populations", content: "Obstetrics, neonatal care, pediatrics, geriatrics, patients with special challenges." },
        { title: "EMS Operations", content: "Ambulance operations, incident management, MCI, air medical, vehicle extrication, HAZMAT, response to terrorism, disaster response." }
      ]},
      { type: "list", title: "Clinical Requirements", items: [
        { title: "Clinical Hours", content: "Minimum 16 hours clinical time in hospital emergency department or ambulance." },
        { title: "Patient Contacts", content: "Minimum 10 patient contacts with assessments documented and evaluated by preceptor." },
        { title: "Skills Performance", content: "Perform required skills on actual patients or high-fidelity simulation: vital signs, patient assessment, oxygen administration, bleeding control." },
        { title: "Clinical Preceptor", content: "Supervision by qualified EMT, paramedic, or RN preceptor approved by program and clinical site." }
      ]},
      { type: "accordion", title: "Skills Competency", items: [
        { title: "Airway Skills", content: "Demonstrate competency in OPA/NPA insertion, BVM ventilation, suctioning, oxygen delivery devices, pulse oximetry." },
        { title: "Patient Assessment", content: "Complete primary and secondary assessments, obtain vital signs, focused history (SAMPLE/OPQRST)." },
        { title: "CPR/AED", content: "High-quality CPR per AHA guidelines, AED operation, airway management during CPR." },
        { title: "Medical Skills", content: "Assist with medication administration (MDI, nitroglycerin, aspirin, glucose, epinephrine auto-injector), naloxone administration (IN/IM)." },
        { title: "Trauma Skills", content: "Hemorrhage control including tourniquet application, splinting, spinal motion restriction, trauma assessment." },
        { title: "Obstetrics", content: "Normal delivery, neonatal resuscitation, post-delivery care." }
      ]},
      { type: "list", title: "Program Completion Requirements", items: [
        { title: "Written Exam", content: "Pass program final exam with minimum 80%. Comprehensive exam covering all course content." },
        { title: "Skills Testing", content: "Pass all required skills stations demonstrating competent performance per NREMT skill sheets." },
        { title: "Clinical Completion", content: "Successfully complete clinical rotation with satisfactory evaluations and required patient contacts." },
        { title: "Attendance", content: "Minimum 90% attendance with all missed time made up." },
        { title: "Program Certificate", content: "Upon successful completion, program issues certificate of completion authorizing student to apply for NREMT exam." }
      ]},
      { type: "accordion", title: "Post-Program Certification", items: [
        { title: "NREMT Exam", content: "Graduates apply for National Registry EMT cognitive exam (computer adaptive test) and psychomotor exam." },
        { title: "State Certification", content: "After passing NREMT, apply for California EMT certification through state EMS Authority." },
        { title: "Local Accreditation", content: "Apply for LA County EMT accreditation (Ref. 1001) including additional local protocols training and skills verification." },
        { title: "Timeframe", content: "Complete NREMT within 12 months of program completion. Applications expire after 12 months." }
      ]},
      { type: "warning", content: "EMT training programs must be approved by California EMS Authority. Only graduates of approved programs are eligible for NREMT and state certification." }
    ]
  },
  {
    id: "902", refNo: "Ref. 902", title: "AEMT Training Program Standards", category: "Training", type: "Policy", lastUpdated: "2024", icon: "school", color: "blue",
    sections: [
      { type: "header", items: [{ title: "AEMT Training", subtitle: "Ref. 902" }] },
      { type: "text", title: "Purpose", content: "Advanced Emergency Medical Technician training builds on EMT foundation with advanced skills including IV therapy, advanced airway management, and expanded medication administration." },
      { type: "list", title: "Program Requirements", items: [
        { title: "Prerequisites", content: "Current EMT certification required prior to enrollment. CPR provider certification. High school diploma or GED." },
        { title: "Total Hours", content: "Minimum 275 hours beyond EMT: 190 hours didactic, 50 hours clinical, 35 hours skills lab." },
        { title: "Duration", content: "Program completion within 12 months of enrollment." },
        { title: "Curriculum", content: "Follow National EMS Education Standards for AEMT and California EMS Authority requirements." }
      ]},
      { type: "accordion", title: "Advanced Curriculum Content", items: [
        { title: "Advanced A&P", content: "In-depth anatomy, physiology, pathophysiology building on EMT knowledge." },
        { title: "Advanced Assessment", content: "Complex patient assessment, differential diagnosis, critical thinking, clinical decision making." },
        { title: "Advanced Airway", content: "Supraglottic airways (King LT, i-gel), blind insertion airway devices, airway adjuncts, CPAP/BiPAP." },
        { title: "Vascular Access", content: "Peripheral IV insertion, IV fluid therapy, IV medication administration, saline lock, blood draw." },
        { title: "Pharmacology", content: "Pharmacology principles, medication calculation, IV medication administration, expanded medication list." },
        { title: "Advanced Medical", content: "12-lead ECG interpretation basics, advanced cardiac care, medication administration for cardiac/respiratory/diabetic emergencies." },
        { title: "Advanced Trauma", content: "Hemorrhage control, IV fluid resuscitation, advanced splinting techniques." }
      ]},
      { type: "list", title: "Clinical Requirements", items: [
        { title: "Clinical Hours", content: "Minimum 50 hours: 30 hours emergency department, 20 hours ambulance field internship." },
        { title: "IV Starts", content: "Minimum 25 successful peripheral IV insertions on actual patients documented and verified." },
        { title: "Airway Management", content: "Minimum 10 advanced airway placements (King, i-gel, Combitube) on patients or high-fidelity simulation." },
        { title: "Patient Assessments", content: "Minimum 25 complete patient assessments with treatment plans documented and evaluated." },
        { title: "Medication Administration", content: "Administer medications via multiple routes (IV, IM, IN, PO) under preceptor supervision." }
      ]},
      { type: "accordion", title: "AEMT Skills Competency", items: [
        { title: "Vascular Access", content: "IV insertion (multiple sites), IV medication administration, saline lock, IV fluid therapy, piggyback medications, blood glucose monitoring." },
        { title: "Advanced Airway", content: "Supraglottic airway insertion (King LT-D, i-gel), CPAP application, capnography interpretation." },
        { title: "Medications", content: "Administer AEMT formulary medications: IV dextrose, glucagon, albuterol, ipratropium, nitroglycerin (SL/IV), aspirin, naloxone (all routes), epinephrine (1:1000 IM), diphenhydramine." },
        { title: "Cardiac Monitoring", content: "12-lead ECG acquisition, rhythm recognition (basic), interpretation of STEMI." },
        { title: "Advanced Assessment", content: "Comprehensive patient assessment, vital signs including manual BP, lung sounds, heart sounds, abdominal assessment." }
      ]},
      { type: "list", title: "Program Completion", items: [
        { title: "Written Exams", content: "Pass all module exams and comprehensive final with minimum 80%." },
        { title: "Skills Testing", content: "Demonstrate competency in all required AEMT skills per NREMT skill sheets." },
        { title: "Clinical Completion", content: "Meet all clinical requirements with satisfactory preceptor evaluations." },
        { title: "Scenario Evaluation", content: "Successfully manage complex patient scenarios integrating assessment, treatment, and decision-making." }
      ]},
      { type: "accordion", title: "AEMT Certification Process", items: [
        { title: "NREMT Exam", content: "Pass National Registry AEMT cognitive exam (computer adaptive) and psychomotor exam within 12 months of program completion." },
        { title: "State Certification", content: "Apply for California AEMT certification through state EMS Authority after passing NREMT." },
        { title: "Local Accreditation", content: "Apply for LA County AEMT accreditation (Ref. 1002) including local protocol orientation and skills verification." },
        { title: "Scope Authorization", content: "Receive authorization for AEMT scope of practice including IV therapy, advanced airways, and medication administration." }
      ]},
      { type: "warning", content: "AEMT scope varies by local EMS agency. LA County utilizes limited AEMT scope - verify authorized skills with EMS Agency before practice." }
    ]
  },
  {
    id: "903", refNo: "Ref. 903", title: "Paramedic Training Program Standards", category: "Training", type: "Policy", lastUpdated: "2024", icon: "school", color: "red",
    sections: [
      { type: "header", items: [{ title: "Paramedic Training", subtitle: "Ref. 903" }] },
      { type: "text", title: "Purpose", content: "Paramedic education programs prepare students for advanced life support practice, state licensure, and LA County paramedic accreditation. Represents highest level of prehospital care provider." },
      { type: "list", title: "Program Requirements", items: [
        { title: "Prerequisites", content: "Current EMT certification (minimum 6 months experience preferred). Anatomy & Physiology (college level). CPR provider. High school diploma or GED. Criminal background check." },
        { title: "Total Hours", content: "Minimum 1200 hours: 750 hours didactic, 250 hours clinical rotations, 200 hours field internship." },
        { title: "Duration", content: "12-24 months depending on full-time or part-time enrollment. Maximum 36 months for completion." },
        { title: "Accreditation", content: "Program must be accredited by CoAEMSP (Committee on Accreditation of Educational Programs for EMS Professions)." }
      ]},
      { type: "accordion", title: "Comprehensive Curriculum", items: [
        { title: "Advanced A&P/Patho", content: "In-depth anatomy, physiology, pathophysiology at college level. All body systems, disease processes, compensatory mechanisms." },
        { title: "Pharmacology", content: "Comprehensive pharmacology including drug classifications, mechanisms of action, indications, contraindications, dosing calculations, adverse effects for full paramedic formulary." },
        { title: "Cardiology", content: "Advanced cardiac assessment, 12-lead ECG interpretation, dysrhythmia recognition and treatment, STEMI recognition, cardiac pharmacology, electrical therapy, hemodynamic monitoring." },
        { title: "Airway Management", content: "Advanced airway techniques including endotracheal intubation, video laryngoscopy, supraglottic airways, difficult airway algorithms, ventilator management, capnography. Note: Surgical airways are taught in paramedic education but NOT authorized for field use in LA County." },
        { title: "Medical Emergencies", content: "Advanced assessment and management of respiratory, cardiovascular, neurologic, endocrine, GI, GU, infectious, toxicologic, psychiatric, environmental emergencies." },
        { title: "Trauma Management", content: "Trauma assessment, hemorrhage control, shock management, fluid resuscitation, chest decompression, trauma pharmacology, mechanism of injury analysis." },
        { title: "Special Populations", content: "Advanced obstetrics, neonatal resuscitation, pediatric emergencies, geriatric emergencies, special healthcare challenges, palliative care." },
        { title: "Operations", content: "EMS systems, medical direction, incident command, MCI operations, HAZMAT, rescue operations, air medical, legal/ethical issues, documentation, quality improvement." }
      ]},
      { type: "list", title: "Clinical Rotation Requirements", items: [
        { title: "Total Clinical Hours", content: "Minimum 250 hours clinical time distributed across multiple clinical sites and specialties." },
        { title: "Emergency Department", content: "100-150 hours in high-volume ED. Comprehensive patient assessments, procedures, medication administration." },
        { title: "Operating Room", content: "20-40 hours for airway management practice. Minimum 20 successful endotracheal intubations on actual patients." },
        { title: "Intensive Care Unit", content: "20-30 hours ICU rotation. Exposure to critical care monitoring, ventilators, vasoactive medications." },
        { title: "Obstetrics/Labor & Delivery", content: "8-16 hours L&D. Normal deliveries, high-risk pregnancies, neonatal care." },
        { title: "Pediatrics", content: "16-24 hours pediatric ED or clinic. Assessment and treatment of pediatric patients all ages." },
        { title: "Behavioral Health", content: "8-16 hours psychiatric facility. Psychiatric assessment, crisis intervention, chemical dependency." },
        { title: "Optional Rotations", content: "Cardiac catheterization lab, EEG lab, respiratory therapy, surgery, other specialized areas." }
      ]},
      { type: "accordion", title: "Field Internship Requirements", items: [
        { title: "Total Field Hours", content: "Minimum 200 hours ALS field internship on ambulance with paramedic preceptor." },
        { title: "ALS Assessments", content: "Minimum 50 comprehensive ALS patient assessments as team leader documented in field internship portfolio." },
        { title: "Cardiac Arrests", content: "Participate in minimum 5 cardiac arrest resuscitations (or high-fidelity simulation if actual arrests unavailable)." },
        { title: "Airway Management", content: "Perform advanced airway management on actual patients in field (intubation, supraglottic airway, difficult airway)." },
        { title: "IV Access", content: "Establish IV/IO access on actual patients. Minimum 30 successful peripheral IVs documented." },
        { title: "Medication Administration", content: "Administer medications from paramedic formulary via all routes under preceptor supervision and medical direction." },
        { title: "Team Leadership", content: "Function as team leader managing scene, crew, patient care, Base Hospital communication, transport decisions." },
        { title: "Competency Evaluation", content: "Preceptor evaluates each patient contact. Must demonstrate progressive improvement and ultimate competency." }
      ]},
      { type: "list", title: "Paramedic Skills Competency", items: [
        { title: "Advanced Airway", content: "Endotracheal intubation (adult/pediatric), video laryngoscopy, supraglottic airways (King, i-gel), capnography interpretation, ventilator management." },
        { title: "Vascular Access", content: "Peripheral IV (multiple sites), IO access (adult/pediatric sites), IV medication administration, medication calculations, IV fluid therapy." },
        { title: "Cardiac Skills", content: "12-lead ECG acquisition and interpretation, defibrillation, synchronized cardioversion, transcutaneous pacing, manual defibrillator operation." },
        { title: "Pharmacology", content: "Demonstrate competency administering entire paramedic formulary via all routes: IV, IO, IM, IN, SQ, PO, ET, nebulized." },
        { title: "Advanced Procedures", content: "Needle thoracostomy, gastric tube insertion, urinary catheterization, wound management." }
      ]},
      { type: "accordion", title: "Assessment and Evaluation", items: [
        { title: "Written Exams", content: "Regular module exams throughout program. Comprehensive final exam minimum 80% passing. National standard exam preparation." },
        { title: "Skills Testing", content: "Competency-based skills evaluation using standardized skill sheets. Must demonstrate competent performance all required skills." },
        { title: "Scenario Evaluation", content: "Complex multi-patient scenarios evaluating critical thinking, clinical decision-making, prioritization, resource management." },
        { title: "Clinical Evaluations", content: "Preceptor evaluations for all clinical rotations. Must meet competency standards and professional behavior expectations." },
        { title: "Field Internship Evaluation", content: "Progressive evaluation throughout field internship. Final competency verification by field preceptor and medical director." }
      ]},
      { type: "list", title: "Program Completion Requirements", items: [
        { title: "Academic", content: "Pass all course modules with minimum 80%. Pass comprehensive final exam. Maintain minimum GPA per program policy." },
        { title: "Clinical", content: "Complete all required clinical hours and patient contacts. Satisfactory evaluations from all clinical sites." },
        { title: "Field Internship", content: "Complete field internship hours and required patient contacts. Final competency sign-off from preceptor." },
        { title: "Skills Competency", content: "Demonstrate competent performance on all required paramedic skills." },
        { title: "Professional Behavior", content: "Maintain professional conduct, patient confidentiality, ethical behavior throughout program." },
        { title: "Graduation", content: "Upon successful completion, program issues certificate authorizing application for National Registry Paramedic exam." }
      ]},
      { type: "accordion", title: "Paramedic Certification/Licensure", items: [
        { title: "National Registry", content: "Apply for NREMT Paramedic exam within 12 months of program completion. Cognitive exam (computer adaptive) and psychomotor exam." },
        { title: "State License", content: "After passing NREMT, apply for California Paramedic License through state EMS Authority. Submit application, fingerprints, fees." },
        { title: "LA County Accreditation", content: "Complete LA County paramedic accreditation process (Ref. 1006) including orientation, protocol exam, skills verification, field internship." },
        { title: "Ongoing Requirements", content: "Maintain national registry, state license, and local accreditation through continuing education and recertification." }
      ]},
      { type: "warning", content: "Paramedic programs are rigorous and demanding. High academic standards, extensive clinical time, and professional competency required. Success requires dedication, time commitment, and clinical aptitude." }
    ]
  },
  {
    id: "904", refNo: "Ref. 904", title: "EMS Instructor Requirements", category: "Training", type: "Policy", lastUpdated: "2024", icon: "person", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Instructor Requirements", subtitle: "Ref. 904" }] },
      { type: "text", title: "Purpose", content: "Establishes qualifications and responsibilities for EMS instructors teaching EMT, AEMT, and paramedic courses in LA County approved programs." },
      { type: "list", title: "Instructor Qualifications", items: [
        { title: "Certification Level", content: "Must hold current certification/license at or above the level being taught. Paramedic license required for paramedic program instruction." },
        { title: "Clinical Experience", content: "Minimum 3 years full-time field experience at certification level. Active clinical practice preferred." },
        { title: "Instructor Certification", content: "EMS Instructor certification through approved instructor course. NAEMSE (National Association of EMS Educators) certification preferred." },
        { title: "Educational Background", content: "Lead instructors should have college degree or extensive teaching experience. Advanced degree (AS, BS, MS) preferred for paramedic programs." },
        { title: "CPR Instructor", content: "Current AHA BLS or ACLS instructor certification for teaching CPR/ACLS components." }
      ]},
      { type: "accordion", title: "Instructor Responsibilities", items: [
        { title: "Curriculum Delivery", content: "Deliver approved curriculum meeting all state and national educational standards. Stay current with updates to protocols, science, and educational standards." },
        { title: "Student Assessment", content: "Conduct regular assessments of student knowledge and skills. Provide constructive feedback and remediation when needed." },
        { title: "Skills Evaluation", content: "Evaluate student psychomotor skills using standardized skill sheets. Ensure competent performance before program completion." },
        { title: "Clinical Coordination", content: "Coordinate clinical rotations and field internships. Monitor student progress in clinical settings." },
        { title: "Documentation", content: "Maintain accurate records of student attendance, grades, skills completion, clinical hours, evaluations." },
        { title: "Professional Development", content: "Maintain clinical competency and teaching skills through continuing education. Participate in instructor development activities." }
      ]},
      { type: "list", title: "Program Medical Director", items: [
        { title: "Physician Requirement", content: "All programs must have designated physician medical director. Must be licensed MD or DO in California." },
        { title: "EMS Experience", content: "Medical director should have emergency medicine background and EMS experience. Board certification in emergency medicine preferred." },
        { title: "Curriculum Oversight", content: "Medical director oversees curriculum development, ensures medical accuracy, approves course content and protocols." },
        { title: "Clinical Oversight", content: "Approves clinical sites and preceptors. Monitors quality of clinical education." },
        { title: "Student Evaluation", content: "Reviews student performance. Makes final determination on student readiness for certification." }
      ]},
      { type: "accordion", title: "Guest Instructors and Specialists", items: [
        { title: "Subject Matter Experts", content: "Programs may use guest instructors for specialized topics (physicians, nurses, respiratory therapists, pharmacists)." },
        { title: "Qualifications", content: "Guest instructors must have expertise in topic area and appropriate credentials. Should have teaching experience or co-teach with lead instructor." },
        { title: "Supervision", content: "Guest instructors work under supervision of program coordinator and medical director." },
        { title: "Documentation", content: "Guest instructor credentials and qualifications documented in program files." }
      ]},
      { type: "list", title: "Clinical Preceptors", items: [
        { title: "Hospital Preceptors", content: "RNs, physicians, or paramedics working in clinical rotation sites who supervise students. Must have minimum 2 years experience." },
        { title: "Field Preceptors", content: "Paramedics supervising field internship students. Minimum 3 years field experience. Preceptor training required." },
        { title: "Preceptor Training", content: "Preceptors complete preceptor training course covering student supervision, evaluation, feedback, documentation." },
        { title: "Preceptor Evaluation", content: "Program evaluates preceptor performance. Provides feedback and remediation if needed. Removes ineffective preceptors." }
      ]},
      { type: "accordion", title: "Instructor Continuing Education", items: [
        { title: "Clinical CE", content: "Maintain certification/license through required continuing education. Stay current with clinical practice and protocols." },
        { title: "Teaching CE", content: "Complete continuing education in teaching methods, educational technology, assessment strategies." },
        { title: "Annual Updates", content: "Attend annual instructor updates on curriculum changes, protocol updates, educational standards." },
        { title: "Professional Organizations", content: "Participation in NAEMSE or other professional education organizations encouraged." }
      ]},
      { type: "warning", content: "Instructors who fail to maintain qualifications, clinical competency, or professional standards may be removed from teaching responsibilities. All instructors undergo background checks." }
    ]
  },
  {
    id: "905", refNo: "Ref. 905", title: "Clinical Rotation Requirements", category: "Training", type: "Policy", lastUpdated: "2024", icon: "local_hospital", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Clinical Rotation Requirements", subtitle: "Ref. 905" }] },
      { type: "text", title: "Purpose", content: "Establishes standards for clinical rotations in hospital and specialty settings for EMT, AEMT, and paramedic students to gain patient care experience under supervision." },
      { type: "list", title: "Clinical Site Requirements", items: [
        { title: "Affiliation Agreement", content: "Formal written affiliation agreement between training program and clinical site defining responsibilities, liability, student requirements." },
        { title: "Adequate Volume", content: "Clinical sites must have adequate patient volume and acuity to provide required patient experiences and skill opportunities." },
        { title: "Qualified Preceptors", content: "Sufficient number of qualified preceptors (RNs, physicians, paramedics) willing to supervise students." },
        { title: "Learning Environment", content: "Supportive learning environment that allows student participation in patient care under supervision." },
        { title: "EMS Agency Approval", content: "Clinical sites approved by EMS Agency Medical Director as appropriate for student education level." }
      ]},
      { type: "accordion", title: "Emergency Department Rotations", items: [
        { title: "Patient Volume", content: "High-volume ED with diverse patient presentations. Minimum 30,000 annual visits preferred for paramedic students." },
        { title: "Student Activities", content: "Students participate in patient assessments, procedures (IV starts, ECGs), medication administration, wound care under RN/physician supervision." },
        { title: "Supervision", content: "Direct supervision by ED RN or physician at all times. Preceptor reviews all student assessments and interventions." },
        { title: "Documentation", content: "Students document patient encounters in clinical rotation log. Preceptor signs off on each patient contact." },
        { title: "Typical Hours", content: "EMT: 8-16 hours, AEMT: 24-30 hours, Paramedic: 80-120 hours depending on program requirements." }
      ]},
      { type: "list", title: "Operating Room Rotations (Paramedic)", items: [
        { title: "Airway Focus", content: "OR time focused on advanced airway management skills, primarily endotracheal intubation." },
        { title: "Anesthesia Supervision", content: "Students work under direct supervision of anesthesiologist or CRNA." },
        { title: "Intubation Practice", content: "Students perform endotracheal intubations on actual patients undergoing anesthesia. Goal: minimum 15-25 successful intubations." },
        { title: "Video Laryngoscopy", content: "Exposure to video laryngoscopy and other advanced airway devices." },
        { title: "Patient Selection", content: "Initial intubations on optimal patients (young, healthy, good airway anatomy). Progress to more difficult airways as competency develops." },
        { title: "Typical Hours", content: "20-40 hours OR time depending on student progress toward intubation competency." }
      ]},
      { type: "accordion", title: "Specialty Rotations (Paramedic)", items: [
        { title: "Intensive Care Unit", content: "20-30 hours. Exposure to critical care monitoring, ventilators, hemodynamic monitoring, vasoactive medications, complex patients." },
        { title: "Labor & Delivery", content: "8-16 hours. Normal deliveries, high-risk pregnancies, neonatal resuscitation, postpartum care." },
        { title: "Pediatrics", content: "16-24 hours. Pediatric assessment, vital signs, medication dosing, pediatric emergencies, child interaction skills." },
        { title: "Behavioral Health", content: "8-16 hours. Psychiatric assessment, crisis intervention, de-escalation techniques, involuntary holds, chemical dependency." },
        { title: "Cardiology", content: "Optional. Cardiac catheterization lab, stress testing, echocardiography, advanced ECG interpretation." },
        { title: "Other Specialties", content: "Optional rotations may include respiratory therapy, surgery, radiology, trauma, burn center based on program and student learning needs." }
      ]},
      { type: "list", title: "Student Clinical Requirements", items: [
        { title: "Preparation", content: "Students must complete prerequisite didactic education before clinical rotations. Pass background check, health screening, immunizations, TB test." },
        { title: "Professional Appearance", content: "Students wear program uniform or scrubs. Name badge identifying student status. Professional grooming and hygiene." },
        { title: "Professional Behavior", content: "Punctuality, respect for patients and staff, confidentiality (HIPAA compliance), appropriate communication, willingness to learn." },
        { title: "Patient Confidentiality", content: "Strict adherence to HIPAA. No discussion of patient information outside clinical setting. No photos or social media posts about patients." },
        { title: "Scope of Practice", content: "Students work under preceptor license/certification. May only perform skills authorized by preceptor and within scope of training level." }
      ]},
      { type: "accordion", title: "Clinical Documentation", items: [
        { title: "Clinical Log", content: "Students maintain detailed log of all clinical encounters including patient demographics, chief complaint, assessment, treatments, skills performed." },
        { title: "Skill Tracking", content: "Document each skill performance (IV starts, intubations, ECGs, medications, procedures) with preceptor verification." },
        { title: "Preceptor Evaluation", content: "Preceptor completes evaluation form for each shift rating student performance, professionalism, clinical skills." },
        { title: "Hour Verification", content: "Clinical site or preceptor verifies hours worked with signature and date." },
        { title: "Submission", content: "Students submit clinical logs and evaluations to program coordinator for review and record keeping." }
      ]},
      { type: "list", title: "Preceptor Responsibilities", items: [
        { title: "Orientation", content: "Orient student to clinical site, policies, procedures, expectations, learning opportunities." },
        { title: "Supervision", content: "Provide direct supervision appropriate to student skill level. Never leave student unsupervised with patients." },
        { title: "Teaching", content: "Actively engage student in learning. Explain assessments, treatments, decision-making. Allow appropriate hands-on experience." },
        { title: "Evaluation", content: "Assess student performance objectively. Provide constructive feedback. Complete evaluation forms honestly." },
        { title: "Communication", content: "Communicate with program coordinator regarding student progress, concerns, or issues requiring intervention." }
      ]},
      { type: "accordion", title: "Clinical Issues and Remediation", items: [
        { title: "Unsatisfactory Performance", content: "Students with poor performance receive counseling and remediation plan. May require additional clinical hours or skills practice." },
        { title: "Professional Misconduct", content: "Breach of confidentiality, unprofessional behavior, dishonesty may result in immediate clinical dismissal and program discipline." },
        { title: "Skill Deficiency", content: "Students not meeting skill competency requirements receive additional practice and evaluation. May extend clinical time." },
        { title: "Clinical Site Removal", content: "Students removed from clinical site for safety or behavioral issues. Program coordinator determines if remediation possible or program dismissal warranted." }
      ]},
      { type: "warning", content: "Clinical rotations are essential component of EMS education. Students must successfully complete all required clinical hours and competencies to graduate. HIPAA violations result in immediate dismissal." }
    ]
  },
  {
    id: "906", refNo: "Ref. 906", title: "Field Internship Standards", category: "Training", type: "Policy", lastUpdated: "2024", icon: "airport_shuttle", color: "red",
    sections: [
      { type: "header", items: [{ title: "Field Internship Standards", subtitle: "Ref. 906" }] },
      { type: "text", title: "Purpose", content: "Field internship provides paramedic students real-world experience functioning as team leader on ALS ambulance under preceptor supervision. Represents transition from student to independent practitioner." },
      { type: "list", title: "Field Internship Requirements", items: [
        { title: "Prerequisites", content: "Complete all didactic education and majority of clinical rotations. Pass program written exams. Demonstrate competency in all required skills." },
        { title: "Total Hours", content: "Minimum 200-300 hours field internship depending on program requirements. Typically 300-400 hours to ensure adequate patient exposure." },
        { title: "Scheduling", content: "Minimum 12-hour shifts. Students work regular ambulance schedule including days, nights, weekends to experience full range of call types." },
        { title: "Agency Affiliation", content: "Field internship at affiliated EMS agency with approved preceptors and medical direction." }
      ]},
      { type: "accordion", title: "Field Preceptor Qualifications", items: [
        { title: "Experience", content: "Minimum 3-5 years paramedic field experience. Strong clinical skills and thorough knowledge of protocols." },
        { title: "Preceptor Training", content: "Completion of approved field preceptor course covering student supervision, teaching techniques, evaluation, feedback, documentation." },
        { title: "Clinical Competency", content: "Current paramedic certification without restrictions. Good standing with quality improvement - no recent significant clinical deficiencies." },
        { title: "Teaching Ability", content: "Demonstrated ability to teach, mentor, and evaluate students. Patience, communication skills, professional role model." },
        { title: "Availability", content: "Willing to commit time and effort to student education. Work schedule compatible with student availability." }
      ]},
      { type: "list", title: "Student Performance Expectations", items: [
        { title: "Team Leader Role", content: "Student functions as team leader (primary provider) for all ALS calls with preceptor oversight. Makes clinical decisions, performs assessments, administers treatments." },
        { title: "Patient Contacts", content: "Minimum 50-75 ALS patient contacts documented as team leader. Must include diverse patient presentations, age groups, acuity levels." },
        { title: "Critical Patients", content: "Manage minimum 5-10 critical patients (cardiac arrest, respiratory failure, major trauma, unstable medical) with preceptor supervision." },
        { title: "Skill Performance", content: "Perform all required ALS skills on actual patients in field: IV/IO access, advanced airways, 12-lead ECGs, medication administration, procedures." },
        { title: "Medical Direction", content: "Communicate with Base Hospital for online medical direction. Present patient professionally, obtain orders, confirm understanding." },
        { title: "Documentation", content: "Complete thorough patient care reports for all contacts. Preceptor reviews and approves each PCR." }
      ]},
      { type: "accordion", title: "Progressive Evaluation", items: [
        { title: "Initial Phase (0-25% completion)", content: "Heavy preceptor supervision. Preceptor may interrupt student management frequently to teach or correct. Student learning scene management, assessment flow, decision-making." },
        { title: "Development Phase (25-75% completion)", content: "Decreasing preceptor intervention. Student managing most calls independently with preceptor observation and occasional guidance. Increasing complexity of cases assigned." },
        { title: "Competency Phase (75-100% completion)", content: "Minimal preceptor intervention. Student manages calls independently including complex and critical patients. Preceptor observes but only intervenes for safety issues." },
        { title: "Final Evaluation", content: "Preceptor and medical director make final determination that student is competent for independent practice and ready for certification." }
      ]},
      { type: "list", title: "Field Internship Documentation", items: [
        { title: "Daily Log", content: "Student maintains log of all patient contacts including demographics, chief complaint, assessment findings, treatments provided, skills performed, transport destination." },
        { title: "Skill Tracking", content: "Document each ALS skill performance with preceptor verification: IV starts, IO placement, intubations, 12-leads, medications, procedures." },
        { title: "Shift Evaluations", content: "Preceptor completes evaluation form each shift rating student performance in multiple domains: patient assessment, clinical skills, decision-making, communication, professionalism." },
        { title: "Critical Incident Reports", content: "Detailed documentation of critical patient encounters (cardiac arrest, major trauma, difficult airway) with student management and preceptor assessment." },
        { title: "Hour Verification", content: "Preceptor or agency verifies total field hours with signatures." }
      ]},
      { type: "accordion", title: "Competency Domains Evaluated", items: [
        { title: "Patient Assessment", content: "Systematic, thorough assessment. Obtains complete history, performs appropriate physical exam, recognizes critical findings." },
        { title: "Clinical Decision-Making", content: "Develops appropriate differential diagnosis, formulates treatment plan, recognizes when Base contact needed, appropriate transport destination." },
        { title: "Technical Skills", content: "Performs ALS skills competently and safely. IV access, airway management, cardiac monitoring, medication administration, procedures." },
        { title: "Communication", content: "Professional communication with patients, family, bystanders, Base Hospital, receiving facility, partners, other responders." },
        { title: "Professionalism", content: "Punctuality, appearance, attitude, work ethic, teamwork, patient advocacy, ethical behavior, stress management." },
        { title: "Scene Management", content: "Scene safety, resource coordination, crew leadership, time management, multi-patient situations." }
      ]},
      { type: "list", title: "Field Internship Issues", items: [
        { title: "Performance Deficiencies", content: "Students not progressing adequately receive counseling, focused remediation, additional field time. May require return to lab for skills practice." },
        { title: "Critical Incidents", content: "Serious errors (wrong medication, unsafe practice, patient harm) trigger immediate review. May result in temporary suspension of field time pending investigation." },
        { title: "Preceptor Conflict", content: "Personality conflicts or learning style mismatch may require preceptor change. Program coordinator mediates issues." },
        { title: "Extended Field Time", content: "Students requiring extended time beyond program requirements to achieve competency. Maximum time limits apply." },
        { title: "Failure to Progress", content: "Students who cannot demonstrate competency after extended field time and remediation may be dismissed from program." }
      ]},
      { type: "accordion", title: "Field Internship Completion", items: [
        { title: "Hour Completion", content: "Complete minimum required field hours (typically 200-300 hours minimum, more if needed for competency)." },
        { title: "Patient Contact Completion", content: "Meet minimum patient contact requirements including diversity of patient types, ages, acuity levels." },
        { title: "Skills Completion", content: "Perform all required ALS skills on actual patients with documented competency." },
        { title: "Competency Sign-Off", content: "Final evaluation by preceptor(s) confirming student ready for independent practice." },
        { title: "Medical Director Approval", content: "Program medical director reviews field internship performance and approves student for graduation and certification eligibility." }
      ]},
      { type: "warning", content: "Field internship is most critical component of paramedic education. Students must demonstrate consistent competent independent performance to graduate. Safety is paramount - students who cannot practice safely will not complete program." }
    ]
  }
];
