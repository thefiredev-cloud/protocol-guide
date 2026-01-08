import { Protocol } from '../../types';

export const series1000: Protocol[] = [
  {
    id: "1000", refNo: "Ref. 1000", title: "EMS Provider Certification Overview", category: "Training", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Certification System Overview", subtitle: "Ref. 1000" }] },
      {
        type: "section",
        title: "Certification Levels",
        content: "LA County EMS Agency maintains certification for multiple provider levels:",
        items: [
          { title: "Emergency Medical Technician (EMT)", subtitle: "Basic life support, patient assessment, oxygen therapy, basic airway management" },
          { title: "Advanced EMT (AEMT)", subtitle: "Advanced airways, IV therapy, limited pharmacology, cardiac monitoring" },
          { title: "Paramedic", subtitle: "Advanced life support, full pharmacology, cardiac interventions, advanced procedures" },
          { title: "Mobile Intensive Care Nurse (MICN)", subtitle: "Base hospital authorization, online medical control, nurse oversight" }
        ]
      },
      {
        type: "section",
        title: "General Requirements",
        content: "All LA County EMS providers must meet the following baseline requirements:",
        items: [
          { title: "Age Requirement", subtitle: "Must be 18 years or older at time of certification" },
          { title: "Background Check", subtitle: "DOJ Live Scan fingerprinting with cleared criminal history (see Ref. 1007)" },
          { title: "National/State Certification", subtitle: "Current NREMT or State of California license at appropriate level" },
          { title: "Course Completion", subtitle: "Approved training program with required clinical and field hours" },
          { title: "Skills Verification", subtitle: "Demonstration of psychomotor competency at certification level" }
        ]
      },
      {
        type: "section",
        title: "Certification Process Overview",
        content: "Standard pathway for obtaining LA County accreditation:",
        items: [
          { title: "Step 1: Complete Training", subtitle: "Finish approved EMT, AEMT, or Paramedic program with required hours" },
          { title: "Step 2: Pass National/State Exam", subtitle: "Obtain NREMT certification or CA State license" },
          { title: "Step 3: Background Clearance", subtitle: "Submit Live Scan fingerprints and await DOJ clearance" },
          { title: "Step 4: Submit Application", subtitle: "Complete LA County application with fees and documentation" },
          { title: "Step 5: Skills Testing", subtitle: "Pass LA County-specific skills verification (if required)" },
          { title: "Step 6: Receive Accreditation", subtitle: "Obtain LA County provider number and scope authorization" }
        ]
      },
      {
        type: "section",
        title: "Certification Fees",
        content: "Standard fees for LA County EMS certification (subject to change):",
        items: [
          { title: "EMT Initial Certification", subtitle: "$175 application fee, $32 Live Scan fingerprinting" },
          { title: "AEMT Initial Certification", subtitle: "$200 application fee, $32 Live Scan fingerprinting" },
          { title: "Paramedic Initial Accreditation", subtitle: "$250 application fee, $32 Live Scan fingerprinting" },
          { title: "Renewal (All Levels)", subtitle: "$150 renewal fee every 2 years" },
          { title: "Late Renewal", subtitle: "Additional $75 late fee if submitted after expiration" }
        ]
      }
    ]
  },
  {
    id: "1001", refNo: "Ref. 1001", title: "EMT Certification", category: "Training", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "EMT Certification", subtitle: "Ref. 1001" }] },
      {
        type: "section",
        title: "Eligibility Requirements",
        content: "To qualify for LA County EMT certification, applicants must:",
        items: [
          { title: "Age and Education", subtitle: "18 years or older, high school diploma or GED equivalent" },
          { title: "NREMT Certification", subtitle: "Current National Registry EMT certification (cognitive and psychomotor exams passed)" },
          { title: "Training Program", subtitle: "Completion of state-approved EMT course (minimum 160 hours) within past 2 years" },
          { title: "Clinical Experience", subtitle: "Minimum 10 patient contacts during clinical rotations documented" },
          { title: "CPR Certification", subtitle: "Current AHA BLS for Healthcare Providers or equivalent" },
          { title: "Background Clearance", subtitle: "DOJ Live Scan with no disqualifying criminal history" }
        ]
      },
      {
        type: "section",
        title: "Application Process",
        content: "Submit the following to LA County EMS Agency:",
        items: [
          { title: "Application Form", subtitle: "Complete EMT-1 Initial Certification Application (online or paper)" },
          { title: "NREMT Verification", subtitle: "Provide NREMT number and expiration date for verification" },
          { title: "Training Certificate", subtitle: "Official certificate from approved EMT program with course dates" },
          { title: "Live Scan Results", subtitle: "Submit fingerprint clearance within 30 days of application" },
          { title: "CPR Card Copy", subtitle: "Current BLS certification card (must show expiration date)" },
          { title: "Application Fee", subtitle: "$175 payable via check, money order, or online payment" }
        ]
      },
      {
        type: "section",
        title: "Skills Verification",
        content: "LA County may require demonstration of core BLS skills:",
        items: [
          { title: "Patient Assessment", subtitle: "Medical and trauma assessments following county protocols" },
          { title: "Airway Management", subtitle: "BVM ventilation, OPA/NPA insertion, suctioning techniques" },
          { title: "Oxygen Therapy", subtitle: "Proper use of NRB, NC, BVM with oxygen delivery" },
          { title: "Bleeding Control", subtitle: "Direct pressure, tourniquet application, wound management" },
          { title: "Immobilization", subtitle: "Long board, c-collar, extremity splinting per county standards" }
        ]
      },
      {
        type: "section",
        title: "Timeline and Activation",
        content: "Certification processing and activation timeline:",
        items: [
          { title: "Processing Time", subtitle: "4-6 weeks from receipt of complete application with all documentation" },
          { title: "Provisional Status", subtitle: "May work under provisional cert while awaiting final approval (max 90 days)" },
          { title: "Certification Period", subtitle: "2-year certification aligned with NREMT expiration date" },
          { title: "Provider Number", subtitle: "Unique LA County number issued upon approval for PCR documentation" },
          { title: "Scope Authorization", subtitle: "Authorized to perform EMT skills per Ref. 800 series protocols" }
        ]
      }
    ]
  },
  {
    id: "1002", refNo: "Ref. 1002", title: "AEMT Certification", category: "Training", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "AEMT Certification", subtitle: "Ref. 1002" }] },
      {
        type: "section",
        title: "Eligibility Requirements",
        content: "Advanced EMT certification prerequisites:",
        items: [
          { title: "Current EMT Status", subtitle: "Active LA County EMT certification in good standing" },
          { title: "NREMT-AEMT or State License", subtitle: "Current NREMT Advanced EMT certification or CA AEMT license" },
          { title: "Training Program", subtitle: "Completion of state-approved AEMT course (minimum 250 hours)" },
          { title: "Clinical Hours", subtitle: "Minimum 40 hours clinical experience with IV starts, medication administration" },
          { title: "Field Experience", subtitle: "Recommended 6 months active EMT field experience before AEMT training" },
          { title: "Background Current", subtitle: "Background check within past 2 years or new Live Scan required" }
        ]
      },
      {
        type: "section",
        title: "Application Process",
        content: "AEMT accreditation application requirements:",
        items: [
          { title: "Application Form", subtitle: "Complete AEMT-1 Initial Certification Application with employer endorsement" },
          { title: "NREMT Verification", subtitle: "NREMT-AEMT number or CA State AEMT license number for verification" },
          { title: "Training Documentation", subtitle: "Certificate from approved AEMT program with clinical hours documented" },
          { title: "Skills Checklist", subtitle: "Completed clinical skills verification form from training program" },
          { title: "Employer Sponsorship", subtitle: "Letter from LA County EMS provider agency sponsoring AEMT scope" },
          { title: "Application Fee", subtitle: "$200 application fee plus Live Scan fee if background expired" }
        ]
      },
      {
        type: "section",
        title: "Skills Testing and Evaluation",
        content: "LA County AEMT-specific competency verification:",
        items: [
          { title: "IV Therapy Skills", subtitle: "IV access, fluid administration, saline lock, troubleshooting complications" },
          { title: "Advanced Airway", subtitle: "King LT or i-gel supraglottic airway insertion and confirmation" },
          { title: "Pharmacology", subtitle: "Medication administration per county protocols (epinephrine, glucagon, aspirin, naloxone)" },
          { title: "Cardiac Monitoring", subtitle: "12-lead ECG acquisition and basic rhythm interpretation" },
          { title: "Protocol Integration", subtitle: "Demonstrate appropriate use of AEMT scope within county treatment protocols" }
        ]
      },
      {
        type: "section",
        title: "Activation and Scope",
        content: "AEMT certification activation and authorized procedures:",
        items: [
          { title: "Processing Time", subtitle: "6-8 weeks for application review and skills verification scheduling" },
          { title: "Field Training", subtitle: "May require agency-specific field training period before independent AEMT practice" },
          { title: "Authorized Procedures", subtitle: "IV access, advanced airways, cardiac monitoring, expanded medication list (see protocols)" },
          { title: "Base Contact", subtitle: "Must maintain base hospital contact for certain AEMT interventions per protocol" },
          { title: "Recertification", subtitle: "2-year cycle with continuing education and skills verification requirements" }
        ]
      }
    ]
  },
  {
    id: "1003", refNo: "Ref. 1003", title: "Paramedic Initial Certification", category: "Training", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Paramedic Initial Certification", subtitle: "Ref. 1003" }] },
      {
        type: "section",
        title: "Eligibility Requirements",
        content: "Prerequisites for LA County Paramedic accreditation:",
        items: [
          { title: "State License", subtitle: "Current California State Paramedic license (not expired or probationary)" },
          { title: "NREMT Certification", subtitle: "NREMT-Paramedic certification strongly recommended but not required if CA licensed" },
          { title: "Training Program", subtitle: "Completion of CoAEMSP-accredited paramedic program (minimum 1,000 hours)" },
          { title: "Clinical Experience", subtitle: "Minimum clinical hours: 200 hospital, 300 field internship with required patient contacts" },
          { title: "ACLS/PALS", subtitle: "Current AHA ACLS and PALS provider certifications" },
          { title: "Background Check", subtitle: "DOJ Live Scan clearance within past year" }
        ]
      },
      {
        type: "section",
        title: "Application and Documentation",
        content: "Required application materials for paramedic accreditation:",
        items: [
          { title: "Application Packet", subtitle: "Complete PM-1 Initial Paramedic Accreditation Application" },
          { title: "State License Verification", subtitle: "Copy of current CA Paramedic license (verify online)" },
          { title: "Program Certificate", subtitle: "Official certificate from accredited paramedic program with completion date" },
          { title: "Clinical Documentation", subtitle: "Field internship logs with minimum 50 ALS patient contacts documented" },
          { title: "ACLS/PALS Cards", subtitle: "Copies of current ACLS and PALS certification cards" },
          { title: "Employer Sponsorship", subtitle: "Letter from hiring LA County EMS provider agency" },
          { title: "Application Fee", subtitle: "$250 accreditation fee plus $32 Live Scan fingerprinting" }
        ]
      },
      {
        type: "section",
        title: "Skills Testing and Evaluation",
        content: "LA County paramedic competency assessment:",
        items: [
          { title: "Written Examination", subtitle: "County-specific protocol exam (80% passing score required)" },
          { title: "Psychomotor Stations", subtitle: "Mega Code, trauma assessment, airway management, medication administration" },
          { title: "Scenario-Based Testing", subtitle: "Critical thinking scenarios using LA County treatment protocols" },
          { title: "Base Hospital Contact", subtitle: "Demonstration of proper radio report and base hospital interaction" },
          { title: "Equipment Proficiency", subtitle: "County-specific equipment (LifePak monitors, medication kits, airway devices)" }
        ]
      },
      {
        type: "section",
        title: "Field Internship and Activation",
        content: "Transition from certification to active field status:",
        items: [
          { title: "Processing Timeline", subtitle: "8-12 weeks from application to provisional status approval" },
          { title: "Field Internship Period", subtitle: "40-80 hours agency-supervised field internship with preceptor evaluation" },
          { title: "Provisional Status", subtitle: "Provisional paramedic status during internship (maximum 6 months)" },
          { title: "Final Accreditation", subtitle: "Full accreditation upon successful internship completion and preceptor sign-off" },
          { title: "Provider Number", subtitle: "Assigned LA County paramedic number for PCR documentation and base contact" },
          { title: "Scope Authorization", subtitle: "Authorized for ALS procedures per Ref. 300-800 series treatment protocols" }
        ]
      }
    ]
  },
  {
    id: "1004", refNo: "Ref. 1004", title: "Certification Testing Standards", category: "Training", type: "Policy", lastUpdated: "2024", icon: "fact_check", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Certification Testing Standards", subtitle: "Ref. 1004" }] },
      {
        type: "section",
        title: "Testing Requirements by Level",
        content: "LA County EMS certification testing requirements:",
        items: [
          { title: "EMT Testing", subtitle: "NREMT cognitive and psychomotor exams; county skills verification as needed" },
          { title: "AEMT Testing", subtitle: "NREMT-AEMT or state exam; county AEMT skills competency verification required" },
          { title: "Paramedic Testing", subtitle: "NREMT-P or state exam; county protocol exam (80% pass); psychomotor stations required" },
          { title: "MICN Testing", subtitle: "County MICN course final exam; base hospital practical evaluation" }
        ]
      },
      {
        type: "section",
        title: "Written Examination Standards",
        content: "Cognitive testing requirements and passing criteria:",
        items: [
          { title: "Paramedic Protocol Exam", subtitle: "100-question exam covering LA County treatment protocols, base contact procedures" },
          { title: "Passing Score", subtitle: "Minimum 80% correct (80/100 questions) required for paramedic certification" },
          { title: "Exam Format", subtitle: "Multiple choice, scenario-based questions using county-specific protocols" },
          { title: "Testing Environment", subtitle: "Proctored exam at EMS Agency office or approved testing site" },
          { title: "Retesting Policy", subtitle: "One free retest; subsequent attempts require $50 fee and 30-day waiting period" },
          { title: "Time Limit", subtitle: "2 hours for protocol exam; untimed for skills stations" }
        ]
      },
      {
        type: "section",
        title: "Psychomotor Skills Testing",
        content: "Hands-on competency evaluation standards:",
        items: [
          { title: "Mega Code Station", subtitle: "Cardiac arrest management, rhythm interpretation, ACLS medications, team leadership" },
          { title: "Trauma Assessment", subtitle: "Multi-system trauma patient, C-spine, primary/secondary survey, critical interventions" },
          { title: "Airway Management", subtitle: "Failed airway scenario, advanced airway placement, confirmation, troubleshooting" },
          { title: "Medication Administration", subtitle: "Dose calculation, medication selection, route verification, documentation" },
          { title: "Scoring Criteria", subtitle: "Critical criteria must be met; major/minor errors deducted; 80% passing score" },
          { title: "Remediation", subtitle: "Immediate feedback; failed stations may be retested after remedial training" }
        ]
      },
      {
        type: "section",
        title: "Testing Accommodations and Appeals",
        content: "Special accommodations and appeals process:",
        items: [
          { title: "ADA Accommodations", subtitle: "Request accommodations 30 days prior with medical documentation" },
          { title: "Language Assistance", subtitle: "Spanish translation available; interpreter services with advance notice" },
          { title: "Appeals Process", subtitle: "Written appeal within 10 days of test failure with specific concerns documented" },
          { title: "Review Committee", subtitle: "EMS Medical Director reviews appeals with testing coordinator input" },
          { title: "Appeal Timeline", subtitle: "Response within 30 days; decision is final unless new evidence presented" }
        ]
      }
    ]
  },
  {
    id: "1005", refNo: "Ref. 1005", title: "Skills Verification Requirements", category: "Training", type: "Policy", lastUpdated: "2024", icon: "verified", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Skills Verification Requirements", subtitle: "Ref. 1005" }] },
      {
        type: "section",
        title: "Initial Certification Skills Verification",
        content: "Skills that must be verified before LA County certification:",
        items: [
          { title: "EMT Skills", subtitle: "BVM ventilation, patient assessment, splinting, bleeding control, airway adjuncts" },
          { title: "AEMT Skills", subtitle: "IV access, advanced airway, medication administration, 12-lead ECG, glucometry" },
          { title: "Paramedic Skills", subtitle: "Advanced airways, cardiac monitoring, medication calculations, IO access, cardioversion" },
          { title: "Verification Method", subtitle: "Direct observation by county evaluator or approved preceptor sign-off" },
          { title: "Documentation", subtitle: "Skills checklist with evaluator signature and date maintained in provider file" }
        ]
      },
      {
        type: "section",
        title: "Ongoing Skills Competency",
        content: "Continuing competency verification requirements:",
        items: [
          { title: "Annual Skills Review", subtitle: "All providers must complete annual skills review at employing agency" },
          { title: "Low-Frequency Skills", subtitle: "Quarterly verification for skills performed <5 times/year (pacing, cardioversion, etc.). Note: Surgical airways NOT authorized for ground ALS." },
          { title: "New Equipment", subtitle: "Competency training required within 30 days of new equipment deployment" },
          { title: "Protocol Changes", subtitle: "Skills verification required when protocols introduce new procedures or techniques" },
          { title: "Documentation", subtitle: "Agency maintains skills verification records for 4 years, available for audit" }
        ]
      },
      {
        type: "section",
        title: "Skills Verification Process",
        content: "Standard procedure for skills competency verification:",
        items: [
          { title: "Direct Observation", subtitle: "Evaluator directly observes skill performance on patient or simulation mannequin" },
          { title: "Checklist Completion", subtitle: "County-approved skills checklist completed for each skill verified" },
          { title: "Performance Standards", subtitle: "Skill must be performed per county protocol without critical errors" },
          { title: "Evaluator Qualifications", subtitle: "Evaluator must be county-approved preceptor or training officer at same or higher level" },
          { title: "Remediation", subtitle: "Failed skills require immediate remedial training and re-verification within 7 days" },
          { title: "Record Retention", subtitle: "Skills verification forms retained in provider and agency files" }
        ]
      },
      {
        type: "section",
        title: "Renewal Skills Requirements",
        content: "Skills verification required for certification renewal:",
        items: [
          { title: "BLS Skills", subtitle: "All levels: CPR, AED, airway management, patient assessment current" },
          { title: "AEMT Skills", subtitle: "IV access, advanced airway, medication administration verified within past year" },
          { title: "Paramedic Skills", subtitle: "Advanced airway, cardiac monitoring, medication administration, 12-lead interpretation current" },
          { title: "ACLS/PALS", subtitle: "Paramedics: Current ACLS and PALS with skills verification per AHA guidelines" },
          { title: "Renewal Documentation", subtitle: "Submit skills verification form with renewal application signed by training officer" }
        ]
      }
    ]
  },
  {
    id: "1006", refNo: "Ref. 1006", title: "Paramedic Accreditation", category: "Training", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Paramedic Accreditation", subtitle: "Ref. 1006" }] },
      {
        type: "section",
        title: "Accreditation vs. Licensure",
        content: "Distinction between state license and county accreditation:",
        items: [
          { title: "State License", subtitle: "CA State Paramedic license required first (obtained through EMSA)" },
          { title: "County Accreditation", subtitle: "LA County accreditation required to practice as paramedic within county EMS system" },
          { title: "Scope Differences", subtitle: "County scope may be more restrictive or specific than state scope of practice" },
          { title: "Both Required", subtitle: "Paramedic must maintain both valid state license AND county accreditation" },
          { title: "Expiration Alignment", subtitle: "County accreditation typically aligns with 2-year state license cycle" }
        ]
      },
      {
        type: "section",
        title: "Initial Accreditation Process",
        content: "Steps to obtain LA County paramedic accreditation:",
        items: [
          { title: "Verify State License", subtitle: "Ensure CA Paramedic license is current and in good standing (not probationary)" },
          { title: "Submit Application", subtitle: "Complete PM-1 form with all required documentation and fees ($250)" },
          { title: "Background Clearance", subtitle: "Live Scan fingerprinting completed within 30 days (see Ref. 1007)" },
          { title: "Protocol Exam", subtitle: "Schedule and pass county protocol written examination (80% required)" },
          { title: "Skills Testing", subtitle: "Complete psychomotor stations (Mega Code, trauma, airway, meds)" },
          { title: "Provisional Status", subtitle: "Receive provisional accreditation pending field internship completion" }
        ]
      },
      {
        type: "section",
        title: "Field Internship Requirements",
        content: "Supervised field training before full accreditation:",
        items: [
          { title: "Duration", subtitle: "Minimum 40 hours or 10 shifts; may extend to 80 hours based on performance" },
          { title: "Preceptor Requirement", subtitle: "Must work with county-approved paramedic preceptor with 2+ years experience" },
          { title: "Patient Contacts", subtitle: "Minimum 20 ALS patient contacts as primary provider under supervision" },
          { title: "Competency Areas", subtitle: "Cardiac, trauma, medical, pediatric, geriatric patient management demonstrated" },
          { title: "Base Hospital Contact", subtitle: "Multiple base hospital contacts for orders, demonstrating proper communication" },
          { title: "Preceptor Evaluation", subtitle: "Preceptor completes evaluation form recommending full accreditation or extension" }
        ]
      },
      {
        type: "section",
        title: "Full Accreditation and Maintenance",
        content: "Transition to full status and ongoing requirements:",
        items: [
          { title: "Accreditation Approval", subtitle: "Upon successful internship, receive full LA County paramedic accreditation" },
          { title: "Provider Number", subtitle: "Permanent county provider number issued for all PCR and base contact documentation" },
          { title: "Scope Authorization", subtitle: "Authorized for full ALS scope per county treatment protocols (Ref. 300-800)" },
          { title: "Continuing Education", subtitle: "48 hours CE every 2 years (see Ref. 1013)" },
          { title: "Recertification", subtitle: "Renew every 2 years aligned with state license ($150 fee)" },
          { title: "QA Participation", subtitle: "Subject to ongoing quality assurance and case review (see Ref. 1012)" }
        ]
      }
    ]
  },
  {
    id: "1007", refNo: "Ref. 1007", title: "Provider Background Check Requirements", category: "Training", type: "Policy", lastUpdated: "2024", icon: "security", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Background Checks", subtitle: "Ref. 1007" }] },
      {
        type: "section",
        title: "Background Check Requirements",
        content: "Criminal background screening for all EMS providers:",
        items: [
          { title: "Live Scan Fingerprinting", subtitle: "DOJ and FBI fingerprint-based background check required for all levels" },
          { title: "Timing", subtitle: "Must be completed within 30 days of application submission" },
          { title: "Initial Certification", subtitle: "Background clearance required before any EMS certification/accreditation issued" },
          { title: "Renewal", subtitle: "New Live Scan required every 4 years or if arrest/conviction occurs" },
          { title: "Cost", subtitle: "$32 Live Scan processing fee paid directly to fingerprint site" },
          { title: "Processing Time", subtitle: "Results typically received in 2-4 weeks; can delay certification" }
        ]
      },
      {
        type: "section",
        title: "Disqualifying Offenses",
        content: "Criminal history that may prevent EMS certification:",
        items: [
          { title: "Felony Convictions", subtitle: "Any felony conviction may result in denial; case-by-case review by Medical Director" },
          { title: "Drug/Alcohol Offenses", subtitle: "Drug possession, DUI, controlled substance violations reviewed carefully" },
          { title: "Violence/Assault", subtitle: "Crimes involving violence, assault, domestic violence may be disqualifying" },
          { title: "Sex Offenses", subtitle: "Any sex offense or requirement to register as sex offender is disqualifying" },
          { title: "Fraud/Theft", subtitle: "Healthcare fraud, identity theft, embezzlement reviewed for patient safety risk" },
          { title: "Time Factor", subtitle: "Time since offense, rehabilitation efforts, nature of crime all considered" }
        ]
      },
      {
        type: "section",
        title: "Ongoing Reporting Obligations",
        content: "Provider responsibilities for arrests and convictions:",
        items: [
          { title: "Arrest Notification", subtitle: "Notify LA County EMS Agency within 10 days of any arrest" },
          { title: "Conviction Reporting", subtitle: "Report any criminal conviction within 10 days of sentencing" },
          { title: "Traffic Violations", subtitle: "Report DUI, reckless driving, suspended license within 10 days" },
          { title: "Civil Judgments", subtitle: "Report healthcare-related civil judgments or malpractice settlements" },
          { title: "Failure to Report", subtitle: "Failure to report may result in immediate suspension or revocation" },
          { title: "Notification Method", subtitle: "Written notification to EMS Agency with case details and documentation" }
        ]
      },
      {
        type: "section",
        title: "Review and Appeal Process",
        content: "Procedure for background check denials:",
        items: [
          { title: "Denial Notification", subtitle: "Applicant notified in writing of denial with reason stated" },
          { title: "Review Process", subtitle: "EMS Medical Director reviews criminal history, nature of offense, time elapsed" },
          { title: "Mitigating Factors", subtitle: "Rehabilitation, character references, employment history may be considered" },
          { title: "Appeal Rights", subtitle: "Applicant may appeal denial within 30 days with supporting documentation" },
          { title: "Hearing Option", subtitle: "Applicant may request hearing before EMS Commission" },
          { title: "Final Decision", subtitle: "Medical Director decision is final unless overturned on appeal" }
        ]
      }
    ]
  },
  {
    id: "1008", refNo: "Ref. 1008", title: "Certification Renewal Process", category: "Training", type: "Policy", lastUpdated: "2024", icon: "refresh", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Cert Renewal", subtitle: "Ref. 1008" }] },
      {
        type: "section",
        title: "Renewal Requirements by Level",
        content: "Certification renewal criteria for each provider level:",
        items: [
          { title: "EMT Renewal", subtitle: "Current NREMT certification, 24 CE hours, CPR current, skills verification, $150 fee" },
          { title: "AEMT Renewal", subtitle: "Current NREMT-AEMT or state license, 36 CE hours, AEMT skills current, $150 fee" },
          { title: "Paramedic Renewal", subtitle: "Current CA license, 48 CE hours, ACLS/PALS current, skills verification, $150 fee" },
          { title: "MICN Renewal", subtitle: "Annual renewal, 12 CE hours, case review completion, base hospital approval" }
        ]
      },
      {
        type: "section",
        title: "Continuing Education Requirements",
        content: "CE hours required for renewal (see Ref. 1013 for details):",
        items: [
          { title: "EMT: 24 Hours", subtitle: "Over 2-year period; minimum topics: trauma, cardiac, medical, pediatric, geriatric" },
          { title: "AEMT: 36 Hours", subtitle: "Over 2-year period; includes AEMT-level topics, IV therapy, advanced airways" },
          { title: "Paramedic: 48 Hours", subtitle: "Over 2-year period; includes county-specific protocol updates, base hospital CE" },
          { title: "Approved Courses", subtitle: "Must be from county-approved CE providers or CAPCE/CECBEMS accredited" },
          { title: "Documentation", subtitle: "Retain CE certificates for 4 years; submit summary with renewal application" },
          { title: "Online Limitations", subtitle: "Maximum 50% of required hours may be online/self-study" }
        ]
      },
      {
        type: "section",
        title: "Renewal Application Process",
        content: "Steps to renew LA County EMS certification:",
        items: [
          { title: "Renewal Notice", subtitle: "County sends renewal notice 90 days before expiration via email" },
          { title: "Renewal Window", subtitle: "Submit application 60-90 days before expiration to avoid lapse" },
          { title: "Application Submission", subtitle: "Complete online renewal form or paper application with documentation" },
          { title: "Required Documents", subtitle: "CE summary, current CPR card, NREMT/state license verification, skills form" },
          { title: "Renewal Fee", subtitle: "$150 renewal fee via online payment, check, or money order" },
          { title: "Processing Time", subtitle: "2-4 weeks for renewal processing; new card mailed upon approval" }
        ]
      },
      {
        type: "section",
        title: "Late Renewal and Reinstatement",
        content: "Procedures for expired or lapsed certifications:",
        items: [
          { title: "Grace Period", subtitle: "30-day grace period after expiration; $75 late fee applies" },
          { title: "Expired Status", subtitle: "Cannot practice as EMS provider if certification expired >30 days" },
          { title: "Reinstatement", subtitle: "Expired >30 days requires reinstatement: late fee, current CE, possible retesting" },
          { title: "Expired >1 Year", subtitle: "Must complete new application as initial certification with full testing" },
          { title: "NREMT Lapsed", subtitle: "If NREMT expired, must retest with NREMT before county renewal approved" },
          { title: "Employment Impact", subtitle: "Employers must remove from field duty immediately upon expiration" }
        ]
      }
    ]
  },
  {
    id: "1009", refNo: "Ref. 1009", title: "Reciprocity and Out-of-County Providers", category: "Training", type: "Policy", lastUpdated: "2024", icon: "compare_arrows", color: "slate",
    sections: [
      { type: "header", items: [{ title: "Reciprocity", subtitle: "Ref. 1009" }] },
      {
        type: "section",
        title: "Out-of-County Provider Eligibility",
        content: "Requirements for providers certified in other California counties:",
        items: [
          { title: "Current Certification", subtitle: "Active NREMT or CA State certification/license at appropriate level" },
          { title: "Good Standing", subtitle: "No disciplinary actions, suspensions, or restrictions in other counties" },
          { title: "Experience", subtitle: "Minimum 6 months active field experience recommended for paramedics" },
          { title: "County Verification", subtitle: "Verification letter from previous county EMS agency regarding cert status" },
          { title: "Background Current", subtitle: "Background check within past 2 years or new Live Scan required" }
        ]
      },
      {
        type: "section",
        title: "Reciprocity Application Process",
        content: "Application procedure for out-of-county providers:",
        items: [
          { title: "Reciprocity Application", subtitle: "Complete reciprocity application form with county verification letter" },
          { title: "Protocol Review", subtitle: "Attend LA County protocol orientation (8-hour course for EMT/AEMT, 16 hours paramedic)" },
          { title: "County Protocol Exam", subtitle: "Paramedics must pass county protocol written exam (80% required)" },
          { title: "Skills Assessment", subtitle: "Demonstrate proficiency with county-specific equipment and procedures" },
          { title: "Base Hospital Orientation", subtitle: "Paramedics: Attend base hospital orientation, complete sample base contacts" },
          { title: "Application Fee", subtitle: "$150 reciprocity application fee (waived if hired within 90 days)" }
        ]
      },
      {
        type: "section",
        title: "Protocol Differences and Training",
        content: "Key LA County protocol variations requiring orientation:",
        items: [
          { title: "Base Hospital Contact", subtitle: "LA County requires base contact for many ALS interventions other counties may not" },
          { title: "Treatment Protocols", subtitle: "County-specific medication doses, procedures, algorithms differ from other counties" },
          { title: "Equipment Variations", subtitle: "Different monitor brands, medication concentrations, airway devices may be used" },
          { title: "Documentation", subtitle: "PCR format, required data elements, base hospital documentation specific to county" },
          { title: "Destination Policies", subtitle: "Trauma, STEMI, stroke destination policies unique to LA County system" },
          { title: "Training Requirement", subtitle: "Complete county protocol training before independent practice authorization" }
        ]
      },
      {
        type: "section",
        title: "Out-of-State Providers",
        content: "Providers from other states seeking California certification:",
        items: [
          { title: "NREMT Pathway", subtitle: "Current NREMT certification allows application for CA state license/certification" },
          { title: "CA State License First", subtitle: "Must obtain CA State EMT/Paramedic license before applying to LA County" },
          { title: "No Direct Reciprocity", subtitle: "Out-of-state certifications not directly accepted; must obtain CA credentials first" },
          { title: "State Requirements", subtitle: "Contact CA EMSA for state licensure requirements (may require additional training)" },
          { title: "Testing", subtitle: "May need to pass CA state exam even with NREMT certification" },
          { title: "Timeline", subtitle: "Plan 3-6 months for state license + county accreditation process" }
        ]
      }
    ]
  },
  {
    id: "1010", refNo: "Ref. 1010", title: "MICN Certification", category: "Training", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
      { type: "header", items: [{ title: "MICN Certification", subtitle: "Ref. 1010" }] },
      {
        type: "section",
        title: "MICN Eligibility Requirements",
        content: "Prerequisites for Mobile Intensive Care Nurse certification:",
        items: [
          { title: "RN Licensure", subtitle: "Current, unrestricted California Registered Nurse license" },
          { title: "Emergency Experience", subtitle: "Minimum 2 years emergency department or critical care nursing experience" },
          { title: "ACLS Certification", subtitle: "Current AHA ACLS Provider certification" },
          { title: "PALS Certification", subtitle: "Current AHA PALS Provider certification (or ENPC)" },
          { title: "Base Hospital Affiliation", subtitle: "Employment or affiliation with LA County designated base hospital" },
          { title: "Employer Recommendation", subtitle: "Letter of recommendation from ED Director or Nurse Manager" }
        ]
      },
      {
        type: "section",
        title: "MICN Course Requirements",
        content: "Training and education for MICN certification:",
        items: [
          { title: "MICN Course", subtitle: "Complete LA County-approved MICN course (40-hour program)" },
          { title: "Course Content", subtitle: "Prehospital care, base hospital procedures, online medical control, radio communication" },
          { title: "Protocol Training", subtitle: "Comprehensive review of LA County EMS treatment protocols" },
          { title: "Legal/Liability", subtitle: "Scope of practice, liability, medical direction, quality assurance training" },
          { title: "Communication Skills", subtitle: "Radio procedures, base contact documentation, difficult call management" },
          { title: "Final Examination", subtitle: "Written and practical exam with 80% passing score required" }
        ]
      },
      {
        type: "section",
        title: "Base Hospital Approval Process",
        content: "Steps for obtaining MICN authorization:",
        items: [
          { title: "Course Completion", subtitle: "Successfully complete approved MICN course with passing exam score" },
          { title: "Base Hospital Application", subtitle: "Apply to specific base hospital for MICN privileges" },
          { title: "Medical Director Review", subtitle: "Base hospital medical director reviews application and credentials" },
          { title: "Supervised Practice", subtitle: "5-10 supervised base hospital contacts with experienced MICN preceptor" },
          { title: "Competency Evaluation", subtitle: "Preceptor evaluation of radio skills, protocol application, clinical judgment" },
          { title: "Final Approval", subtitle: "Base hospital medical director grants MICN privileges upon successful evaluation" }
        ]
      },
      {
        type: "section",
        title: "MICN Scope and Responsibilities",
        content: "Role and duties of certified MICN:",
        items: [
          { title: "Online Medical Control", subtitle: "Provide real-time medical direction to field paramedics via radio/phone" },
          { title: "Protocol Authorization", subtitle: "Grant orders for procedures requiring base contact per county protocols" },
          { title: "Clinical Judgment", subtitle: "Assess field situations, guide treatment decisions, authorize deviations when needed" },
          { title: "Documentation", subtitle: "Complete base hospital contact logs for all field interactions" },
          { title: "Quality Assurance", subtitle: "Participate in case review, provide feedback to field providers" },
          { title: "Resource Coordination", subtitle: "Assist with hospital selection, specialty resource activation" },
          { title: "Recertification", subtitle: "Annual recertification required (see Ref. 1011)" }
        ]
      }
    ]
  },
  {
    id: "1011", refNo: "Ref. 1011", title: "MICN Recertification", category: "Training", type: "Policy", lastUpdated: "2024", icon: "refresh", color: "slate",
    sections: [
      { type: "header", items: [{ title: "MICN Recert", subtitle: "Ref. 1011" }] },
      {
        type: "section",
        title: "Annual Recertification Requirements",
        content: "MICN certification must be renewed annually:",
        items: [
          { title: "Renewal Cycle", subtitle: "MICN certification expires annually, must renew each year" },
          { title: "RN License Current", subtitle: "Maintain current, unrestricted California RN license" },
          { title: "ACLS/PALS Current", subtitle: "Keep ACLS and PALS certifications current throughout year" },
          { title: "Minimum Activity", subtitle: "Minimum 24 base hospital shifts or 96 hours base contact time per year" },
          { title: "CE Requirements", subtitle: "12 hours MICN-specific continuing education annually" },
          { title: "Case Review", subtitle: "Participate in quarterly base hospital case review sessions" }
        ]
      },
      {
        type: "section",
        title: "Continuing Education Requirements",
        content: "Annual CE hours for MICN recertification:",
        items: [
          { title: "Total Hours", subtitle: "12 hours MICN-related CE per year" },
          { title: "Protocol Updates", subtitle: "Attend county protocol update sessions when changes occur" },
          { title: "Base Hospital Training", subtitle: "Participate in base hospital-specific training programs" },
          { title: "Case Studies", subtitle: "Review complex or unusual base contact cases in group setting" },
          { title: "Communication Skills", subtitle: "Training in difficult communication scenarios, conflict resolution" },
          { title: "Documentation", subtitle: "Submit CE certificates to base hospital coordinator for tracking" }
        ]
      },
      {
        type: "section",
        title: "Quality Assurance Participation",
        content: "QA requirements for MICN recertification:",
        items: [
          { title: "Case Review Sessions", subtitle: "Attend quarterly base hospital QA meetings (minimum 3 per year)" },
          { title: "Self-Assessment", subtitle: "Review own base contact recordings and documentation for improvement" },
          { title: "Peer Review", subtitle: "Participate in peer review of other MICN base contacts" },
          { title: "Performance Metrics", subtitle: "Meet base hospital standards for contact quality, protocol compliance" },
          { title: "Remediation", subtitle: "Complete remedial training if performance deficiencies identified" },
          { title: "Medical Director Review", subtitle: "Annual performance review by base hospital medical director" }
        ]
      },
      {
        type: "section",
        title: "Recertification Process",
        content: "Steps to renew MICN certification annually:",
        items: [
          { title: "Application Submission", subtitle: "Submit recertification application 60 days before expiration" },
          { title: "Activity Log", subtitle: "Document base hospital shifts/hours worked during past year" },
          { title: "CE Documentation", subtitle: "Submit certificates for 12 hours MICN CE completed" },
          { title: "QA Participation", subtitle: "Verify attendance at required case review sessions" },
          { title: "Current Certifications", subtitle: "Provide copies of current RN license, ACLS, PALS cards" },
          { title: "Base Hospital Approval", subtitle: "Medical director signs recertification form approving renewal" },
          { title: "County Notification", subtitle: "Base hospital submits approved recertifications to county EMS agency" }
        ]
      }
    ]
  },
  {
    id: "1012", refNo: "Ref. 1012", title: "Quality Assurance and Remediation", category: "Training", type: "Policy", lastUpdated: "2024", icon: "fact_check", color: "slate",
    sections: [
      { type: "header", items: [{ title: "QA/Remediation", subtitle: "Ref. 1012" }] },
      {
        type: "section",
        title: "Quality Assurance Program Overview",
        content: "LA County EMS quality improvement system:",
        items: [
          { title: "Continuous Monitoring", subtitle: "Ongoing review of provider performance through PCR audits, base hospital feedback" },
          { title: "Case Review Process", subtitle: "Regular review of patient care reports, cardiac arrests, critical incidents" },
          { title: "Performance Standards", subtitle: "Providers expected to meet county standards for patient care, documentation, protocol compliance" },
          { title: "Educational Focus", subtitle: "QA process focused on education and improvement, not punitive action" },
          { title: "Corrective Action", subtitle: "Progressive remediation when performance issues identified" },
          { title: "Certification Impact", subtitle: "Serious or repeated violations may result in suspension or revocation" }
        ]
      },
      {
        type: "section",
        title: "Case Review and Auditing",
        content: "Methods for evaluating provider performance:",
        items: [
          { title: "PCR Audits", subtitle: "Random and targeted review of patient care reports for documentation and care quality" },
          { title: "Cardiac Arrest Review", subtitle: "All cardiac arrests reviewed for ACLS compliance, resuscitation quality" },
          { title: "Base Hospital Feedback", subtitle: "MICN reports and base hospital physician concerns trigger case review" },
          { title: "Complaint Investigation", subtitle: "Patient or hospital complaints investigated with PCR and witness interviews" },
          { title: "Critical Incidents", subtitle: "Death, serious injury, medication errors, equipment failures reviewed" },
          { title: "Peer Review", subtitle: "Cases may be reviewed by experienced providers or medical director" }
        ]
      },
      {
        type: "section",
        title: "Remedial Education Process",
        content: "Progressive remediation for identified deficiencies:",
        items: [
          { title: "Level 1: Verbal Counseling", subtitle: "Minor issues addressed with provider discussion, education, documentation" },
          { title: "Level 2: Written Plan", subtitle: "Formal remedial education plan with specific learning objectives and timeline" },
          { title: "Level 3: Skills Verification", subtitle: "Demonstration of competency through skills testing or observed patient contacts" },
          { title: "Level 4: Probation", subtitle: "Probationary status with restricted practice, supervised shifts, frequent audits" },
          { title: "Level 5: Suspension", subtitle: "Temporary suspension pending remediation completion and re-evaluation" },
          { title: "Level 6: Revocation", subtitle: "Permanent revocation for serious violations, patient harm, or failure to remediate" }
        ]
      },
      {
        type: "section",
        title: "Provider Rights and Appeals",
        content: "Due process for providers under QA review:",
        items: [
          { title: "Notification", subtitle: "Written notice of QA concerns with specific case details and deficiencies cited" },
          { title: "Response Opportunity", subtitle: "Provider may submit written response explaining circumstances within 10 days" },
          { title: "Hearing Rights", subtitle: "Provider may request hearing before EMS Medical Director for serious actions" },
          { title: "Representation", subtitle: "Provider may have union rep or attorney present during hearings" },
          { title: "Appeal Process", subtitle: "Decisions may be appealed to EMS Commission within 30 days" },
          { title: "Confidentiality", subtitle: "QA proceedings confidential, protected under peer review statutes" }
        ]
      }
    ]
  },
  {
    id: "1013", refNo: "Ref. 1013", title: "EMS Continuing Education (CE)", category: "Training", type: "Policy", lastUpdated: "2024", icon: "school", color: "slate",
    sections: [
      { type: "header", items: [{ title: "CE Requirements", subtitle: "Ref. 1013" }] },
      {
        type: "section",
        title: "CE Hours by Certification Level",
        content: "Required continuing education hours per certification cycle:",
        items: [
          { title: "EMT", subtitle: "24 hours every 2 years (12 hours per year average)" },
          { title: "AEMT", subtitle: "36 hours every 2 years (18 hours per year average)" },
          { title: "Paramedic", subtitle: "48 hours every 2 years (24 hours per year average)" },
          { title: "MICN", subtitle: "12 hours annually (MICN-specific content)" },
          { title: "Certification Alignment", subtitle: "CE cycle aligns with 2-year NREMT or state license expiration" },
          { title: "Documentation", subtitle: "Providers must maintain CE certificates and submit summary with renewal" }
        ]
      },
      {
        type: "section",
        title: "Approved CE Topics and Content",
        content: "Required and recommended CE subject areas:",
        items: [
          { title: "Core Topics", subtitle: "Cardiac, trauma, medical emergencies, pediatrics, geriatrics, airway management" },
          { title: "Protocol Updates", subtitle: "County protocol changes, new treatment guidelines, medication updates (mandatory)" },
          { title: "Skills Maintenance", subtitle: "Low-frequency skills: cardioversion, transcutaneous pacing, needle decompression" },
          { title: "Special Topics", subtitle: "Behavioral emergencies, disaster response, mass casualty, tactical EMS" },
          { title: "Professional Development", subtitle: "Communication, ethics, cultural competency, wellness/resilience" },
          { title: "Documentation", subtitle: "PCR completion, legal aspects, base hospital contact procedures" }
        ]
      },
      {
        type: "section",
        title: "CE Provider Approval and Delivery",
        content: "Acceptable sources and formats for continuing education:",
        items: [
          { title: "Approved Providers", subtitle: "County-approved CE providers, CAPCE or CECBEMS accredited courses" },
          { title: "Employer Training", subtitle: "Agency-provided CE programs approved by county EMS (in-services, skills labs)" },
          { title: "Conferences", subtitle: "EMS conferences, symposiums with CE credit (state/national organizations)" },
          { title: "Online Learning", subtitle: "Maximum 50% of required hours via online/distance learning" },
          { title: "College Courses", subtitle: "Community college EMS courses may count (must be related to scope of practice)" },
          { title: "Skills Labs", subtitle: "Hands-on skills practice sessions count toward CE requirements" }
        ]
      },
      {
        type: "section",
        title: "CE Documentation and Compliance",
        content: "Requirements for tracking and verifying CE completion:",
        items: [
          { title: "Certificate Requirements", subtitle: "Each CE course must provide certificate with date, hours, topic, provider name" },
          { title: "Record Retention", subtitle: "Providers must keep CE certificates for 4 years (2 certification cycles)" },
          { title: "Renewal Submission", subtitle: "Submit CE summary with renewal application listing all courses and hours" },
          { title: "Audit Process", subtitle: "County may audit CE records; must provide certificates within 10 days if requested" },
          { title: "Deficiency Remediation", subtitle: "If CE deficient at renewal, may receive provisional status to complete hours" },
          { title: "False Documentation", subtitle: "Submitting fraudulent CE certificates may result in certification revocation" }
        ]
      }
    ]
  }
];
