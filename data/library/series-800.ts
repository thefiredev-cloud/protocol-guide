
import { Protocol } from '../../types';

export const series800: Protocol[] = [
  {
    id: "801", refNo: "Ref. 801", title: "EMS System Organization and Structure", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "account_tree", color: "slate",
    sections: [
        { type: "header", items: [{ title: "EMS System", subtitle: "Ref. 801" }] },
        { type: "text", title: "Overview", content: "The LA County EMS system is a tiered response system with BLS and ALS components, coordinated by the LA County EMS Agency." },
        { type: "list", title: "System Components", items: [
            { title: "EMS Agency", content: "LA County DHS EMS Agency provides oversight, medical direction, protocols, and quality improvement." },
            { title: "Provider Agencies", content: "Fire departments and private ambulance companies provide field response." },
            { title: "Base Hospitals", content: "Designated hospitals provide online medical direction and oversight." },
            { title: "Receiving Hospitals", content: "Emergency departments designated to receive EMS patients." }
        ]},
        { type: "accordion", title: "Provider Levels", items: [
            { title: "Basic Life Support (BLS)", content: "EMTs provide basic emergency care and transport." },
            { title: "Advanced Life Support (ALS)", content: "Paramedics provide advanced interventions under medical direction." },
            { title: "First Responders", content: "Fire engines/police may provide initial BLS care until ambulance arrives." }
        ]}
    ]
  },
  {
    id: "802", refNo: "Ref. 802", title: "EMT Scope of Practice", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
        { type: "header", items: [{ title: "EMT Scope", subtitle: "Ref. 802" }] },
        { type: "list", title: "Authorized Skills", items: [
            { title: "Airway", content: "OPA, NPA, BVM, Suction." },
            { title: "CPR", content: "Mechanical CPR devices, AED." },
            { title: "Trauma", content: "Splinting, Tourniquets, Spinal Motion Restriction." },
            { title: "Medications", content: "Oxygen, Oral Glucose, Aspirin (chest pain), Naloxone (IN/IM), Epinephrine (Auto-injector/Check & Inject for Anaphylaxis)." }
        ]}
    ]
  },
  {
    id: "803", refNo: "Ref. 803", title: "Paramedic Scope of Practice", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "badge", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Paramedic Scope", subtitle: "Ref. 803" }] },
        { type: "text", content: "Paramedics may perform all EMT skills plus advanced interventions authorized by the Local EMS Agency." },
        { type: "accordion", title: "ALS Interventions", items: [
            { title: "Vascular Access", content: "IV, IO." },
            { title: "Airway", content: "Endotracheal Intubation, Supraglottic Airway (iGel/King), Capnography." },
            { title: "Cardiac", content: "ALS Monitor, Defibrillation, Cardioversion, TCP, 12-Lead ECG." },
            { title: "Medications", content: "Full formulary (IV/IO/IM/IN/PO) as defined in Ref. 1317." },
            { title: "Procedures", content: "Needle Thoracostomy, Gastric tube insertion." }
        ]}
    ]
  },
  {
    id: "804", refNo: "Ref. 804", title: "Medical Direction - Online and Offline", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "supervisor_account", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Medical Direction", subtitle: "Ref. 804" }] },
        { type: "text", title: "Purpose", content: "Medical direction ensures EMS providers operate under physician oversight through protocols (offline) and real-time contact (online)." },
        { type: "accordion", title: "Offline Medical Direction", items: [
            { title: "Protocols", content: "Written treatment protocols (standing orders) approved by EMS Medical Director." },
            { title: "Training", content: "Initial and continuing education requirements set by Medical Director." },
            { title: "Quality Improvement", content: "Case review and performance feedback." },
            { title: "Policy Development", content: "Medical Director develops policies and procedures." }
        ]},
        { type: "list", title: "Online Medical Direction", items: [
            { title: "Base Hospital Contact", content: "Real-time physician orders via radio/phone for situations requiring medical direction." },
            { title: "When Required", content: "Treatment beyond standing orders, AMA refusals (ALS), destination clarification, termination of resuscitation." },
            { title: "Physician Authority", content: "Base physician has final authority over patient care decisions." },
            { title: "Documentation", content: "Document all Base contacts including physician name, orders, and time (Ref. 624)." }
        ]}
    ]
  },
  {
    id: "805", refNo: "Ref. 805", title: "California Poison Control System", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "call", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Poison Control", subtitle: "Ref. 805" }] },
        { type: "text", title: "Consultation", content: "Poison Control (1-800-222-1222) may be contacted for information regarding toxic exposures." },
        { type: "warning", content: "Treatment orders must come from the Base Hospital, not Poison Control. Paramedics may relay Poison Control recommendations to the Base Physician." }
    ]
  },
  {
    id: "806", refNo: "Ref. 806", title: "Scene Safety and Body Substance Isolation", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "shield", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Scene Safety", subtitle: "Ref. 806" }] },
        { type: "text", title: "Priority", content: "Scene safety is the first priority. Do not enter unsafe scenes without proper resources (law enforcement, fire, HAZMAT, etc.)." },
        { type: "list", title: "Scene Safety Considerations", items: [
            { title: "Violence/Weapons", content: "Request law enforcement for violent scenes, weapons, domestic disputes, crimes in progress." },
            { title: "Traffic", content: "Position vehicle safely, use traffic warning devices, wear high-visibility vest." },
            { title: "Fire/Smoke", content: "Do not enter burning buildings or smoke-filled areas without fire department clearance." },
            { title: "HAZMAT", content: "Stay upwind/uphill from hazardous materials. Do not enter hot zone." },
            { title: "Structural", content: "Assess building stability (earthquake, explosion, collapse risk)." }
        ]},
        { type: "accordion", title: "Body Substance Isolation (BSI)", items: [
            { title: "Standard Precautions", content: "Use appropriate PPE for all patient contacts - assume all patients are potentially infectious." },
            { title: "Minimum PPE", content: "Gloves for all patient contact. Eye protection if risk of splash." },
            { title: "Airborne Precautions", content: "N95 respirator for suspected TB, measles, chickenpox, COVID-19." },
            { title: "Hand Hygiene", content: "Wash hands or use alcohol sanitizer before and after patient contact." }
        ]}
    ]
  },
  {
    id: "807", refNo: "Ref. 807", title: "Medical Control During HazMat Exposure", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "warning", color: "slate",
    sections: [
        { type: "header", items: [{ title: "HazMat Med Control", subtitle: "Ref. 807" }] },
        { type: "text", content: "In a Hazardous Materials incident, patient care is directed by the Base Hospital. If communication fails, the Paramedic may utilize Standing Orders (Ref. 1240/1370) or specific HazMat protocols." },
        { type: "accordion", title: "Containment", items: [
            { title: "Safety", content: "Do not enter the Exclusion Zone (Hot Zone) unless trained and equipped (HazMat Team)." },
            { title: "Decontamination", content: "Gross decontamination should be performed prior to transport to prevent contamination of the ambulance and hospital." }
        ]}
    ]
  },
  {
    id: "808", refNo: "Ref. 808", title: "Response to Violent/Combative Patient", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "local_police", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Violent Patients", subtitle: "Ref. 808" }] },
        { type: "text", title: "Safety First", content: "Provider safety takes priority. Do not approach violent or combative patients without law enforcement assistance." },
        { type: "list", title: "Scene Approach", items: [
            { title: "Law Enforcement", content: "Request law enforcement for all violent/combative patients before approaching." },
            { title: "Staging", content: "Stage at safe distance until law enforcement secures scene." },
            { title: "Exit Route", content: "Always maintain clear exit route. Never allow patient to block exit." },
            { title: "De-escalation", content: "Use calm voice, non-threatening posture. Avoid arguing or confrontation." }
        ]},
        { type: "accordion", title: "Medical Considerations", items: [
            { title: "Organic Cause", content: "Violent behavior may be due to medical cause: hypoglycemia, hypoxia, head injury, psychiatric emergency." },
            { title: "Restraints", content: "If patient requires restraint for safety, use medical restraints per protocol (Ref. 824) with law enforcement present." },
            { title: "Sedation", content: "Chemical restraint (sedation) may be authorized by Base Hospital for patient/provider safety (Ref. 1245 Excited Delirium)." },
            { title: "Transport", content: "Transport with law enforcement escort if patient in custody or ongoing safety concern." }
        ]}
    ]
  },
  {
    id: "809", refNo: "Ref. 809", title: "Reportable Conditions to Public Health", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "coronavirus", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Public Health Reporting", subtitle: "Ref. 809" }] },
        { type: "text", title: "Purpose", content: "Certain communicable diseases and conditions must be reported to public health authorities for disease surveillance and outbreak control." },
        { type: "list", title: "Reportable Diseases (Examples)", items: [
            { title: "Airborne", content: "Tuberculosis (TB), measles, chickenpox, COVID-19." },
            { title: "Bloodborne", content: "HIV, Hepatitis B, Hepatitis C (if acute)." },
            { title: "Foodborne", content: "Salmonella, E. coli, botulism, suspected food poisoning outbreak." },
            { title: "Other", content: "Meningitis (bacterial), pertussis, unusual illnesses suggesting bioterrorism." }
        ]},
        { type: "accordion", title: "Reporting Process", items: [
            { title: "Hospital Notification", content: "Notify receiving hospital of suspected reportable disease." },
            { title: "Agency Notification", content: "Report to agency infection control officer or supervisor." },
            { title: "Public Health", content: "Hospital or agency typically handles formal report to public health department." },
            { title: "EMS Exposure", content: "If EMS personnel exposed, follow exposure control plan (post-exposure testing, prophylaxis if indicated)." }
        ]}
    ]
  },
  {
    id: "810", refNo: "Ref. 810", title: "Mass Casualty Incident (MCI) Declaration", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "groups", color: "slate",
    sections: [
        { type: "header", items: [{ title: "MCI Declaration", subtitle: "Ref. 810" }] },
        { type: "text", title: "Definition", content: "Mass Casualty Incident (MCI) is an event that produces more patients than available resources can manage using routine procedures." },
        { type: "accordion", title: "MCI Threshold", items: [
            { title: "Numeric", content: "Generally 5+ patients, but depends on available resources." },
            { title: "Resource-Based", content: "Number of patients exceeds number of available ambulances within reasonable time." },
            { title: "Complexity", content: "Scene complexity (HAZMAT, active shooter, building collapse) may trigger MCI even with fewer patients." }
        ]},
        { type: "list", title: "MCI Declaration Procedures", items: [
            { title: "First Arriving Unit", content: "First unit on scene sizes up and declares MCI if criteria met." },
            { title: "Notification", content: "Notify dispatch with estimated number of patients, severity, special resources needed." },
            { title: "Request Resources", content: "Request additional ambulances, fire units, supervisor, air ambulance if needed." },
            { title: "Incident Command", content: "Establish Incident Command System (ICS) per Ref. 1400 series." }
        ]}
    ]
  },
  {
    id: "811", refNo: "Ref. 811", title: "Triage in MCI", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "assignment", color: "slate",
    sections: [
        { type: "header", items: [{ title: "MCI Triage", subtitle: "Ref. 811" }] },
        { type: "text", title: "Purpose", content: "Triage in mass casualty incidents prioritizes patients to provide the greatest good for the greatest number." },
        { type: "list", title: "Triage Categories", items: [
            { title: "RED (Immediate)", content: "Life-threatening injuries requiring immediate intervention (airway compromise, severe bleeding, shock)." },
            { title: "YELLOW (Delayed)", content: "Serious injuries requiring care but can wait (stable fractures, moderate burns)." },
            { title: "GREEN (Minor)", content: "Minor injuries, walking wounded (minor lacerations, sprains)." },
            { title: "BLACK (Deceased/Expectant)", content: "Dead or injuries incompatible with survival given available resources." }
        ]},
        { type: "accordion", title: "Triage Methods", items: [
            { title: "START Triage", content: "Simple Triage And Rapid Treatment - adult triage based on ability to walk, respirations, perfusion, mental status." },
            { title: "JumpSTART", content: "Modified START for pediatric patients." },
            { title: "SALT Triage", content: "Sort, Assess, Lifesaving interventions, Treatment/Transport." },
            { title: "Re-triage", content: "Patients should be re-triaged as resources arrive and conditions change." }
        ]}
    ]
  },
  {
    id: "812", refNo: "Ref. 812", title: "Active Shooter / Tactical Emergency Casualty Care", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "gpp_bad", color: "red",
    sections: [
        { type: "header", items: [{ title: "Active Shooter", subtitle: "Ref. 812" }] },
        { type: "text", title: "Safety", content: "Active shooter incidents require specialized response. EMS personnel shall NOT enter warm or hot zones without law enforcement clearance and appropriate training/equipment." },
        { type: "accordion", title: "Response Zones", items: [
            { title: "Hot Zone", content: "Active threat area. EMS does NOT enter. Law enforcement tactical medics only." },
            { title: "Warm Zone", content: "Threat contained but not eliminated. Limited EMS access with law enforcement escort and tactical training/equipment." },
            { title: "Cold Zone", content: "No threat. EMS may operate normally. Patients evacuated to cold zone for treatment/transport." }
        ]},
        { type: "list", title: "TECC Principles (If Trained)", items: [
            { title: "Hemorrhage Control", content: "Tourniquets for extremity hemorrhage, hemostatic gauze for junctional." },
            { title: "Airway", content: "Basic airway maneuvers, NPA. Advanced airway only if BVM inadequate." },
            { title: "Breathing", content: "Needle decompression for tension pneumothorax, chest seals for open pneumothorax." },
            { title: "Circulation", content: "IV/IO access, fluid resuscitation for hemorrhagic shock (permissive hypotension)." },
            { title: "Hypothermia", content: "Prevent heat loss (hypothermia triad of trauma: hypothermia, acidosis, coagulopathy)." }
        ]},
        { type: "warning", content: "Only EMS personnel with specialized tactical training and equipment should operate in warm zone. Standard EMS operates in cold zone." }
    ]
  },
  {
    id: "813", refNo: "Ref. 813", title: "Disaster Response and Emergency Operations Center", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "crisis_alert", color: "orange",
    sections: [
        { type: "header", items: [{ title: "Disaster Response", subtitle: "Ref. 813" }] },
        { type: "text", title: "Purpose", content: "Large-scale disasters (earthquakes, wildfires, terrorism) require coordinated response through Emergency Operations Center (EOC) and Incident Command System (ICS)." },
        { type: "list", title: "Disaster Activation", items: [
            { title: "EOC Activation", content: "LA County EOC activates for major disasters to coordinate multi-agency response." },
            { title: "EMS Branch", content: "EMS Agency provides coordination through Medical Health Operational Area Coordinator (MHOAC)." },
            { title: "Provider Activation", content: "EMS agencies may activate disaster plans, recall off-duty personnel, establish treatment areas." },
            { title: "Mutual Aid", content: "Request mutual aid ambulances/resources from neighboring counties if needed." }
        ]},
        { type: "accordion", title: "Field Operations", items: [
            { title: "Incident Command", content: "All disasters use ICS structure (Incident Commander, Operations, Planning, Logistics, Finance)." },
            { title: "Medical Branch", content: "Medical Branch Director coordinates all EMS operations at incident." },
            { title: "Treatment Areas", content: "Establish casualty collection points, treatment areas, transport staging." },
            { title: "Hospital Diversion", content: "During disaster, hospital diversion lifted - all hospitals accept patients per capacity." }
        ]}
    ]
  },
  {
    id: "814", refNo: "Ref. 814", title: "Mutual Aid and Automatic Aid Agreements", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "handshake", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Mutual/Auto Aid", subtitle: "Ref. 814" }] },
        { type: "text", title: "Purpose", content: "Mutual aid and automatic aid ensure adequate EMS coverage across jurisdictional boundaries." },
        { type: "accordion", title: "Types of Aid", items: [
            { title: "Automatic Aid", content: "Pre-arranged response across boundaries based on geography (e.g., bordering fire departments respond to closest calls regardless of jurisdiction)." },
            { title: "Mutual Aid", content: "Requested assistance when local resources are insufficient (MCI, disaster, multiple calls)." },
            { title: "Medical Mutual Aid", content: "Coordinated through MHOAC for large-scale incidents or disasters." }
        ]},
        { type: "list", title: "Operational Considerations", items: [
            { title: "Protocols", content: "Mutual aid units operate under receiving agency's protocols and medical direction." },
            { title: "Communications", content: "Mutual aid units communicate on receiving agency's radio frequencies." },
            { title: "Supervision", content: "Mutual aid units report to receiving agency's Incident Commander." },
            { title: "Documentation", content: "Track mutual aid resources for cost recovery and demobilization." }
        ]}
    ]
  },
  {
    id: "815", refNo: "Ref. 815", title: "EMS Response to Law Enforcement Operations", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "security", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Law Enforcement Ops", subtitle: "Ref. 815" }] },
        { type: "text", title: "Purpose", content: "EMS may be requested to stage for law enforcement operations (SWAT, warrant service, barricaded suspect, high-risk arrest)." },
        { type: "list", title: "Staging Procedures", items: [
            { title: "Stage at Distance", content: "Stage out of line of sight and gunfire range until scene declared secure." },
            { title: "Law Enforcement Coordination", content: "Law enforcement incident commander directs when EMS may enter." },
            { title: "Communication", content: "Maintain radio contact with law enforcement and dispatch." },
            { title: "Tactical Medics", content: "If available, tactical medics may accompany law enforcement into tactical operations." }
        ]},
        { type: "accordion", title: "Patient Care Considerations", items: [
            { title: "Suspects", content: "Treat suspects the same as any other patient (medical ethics require treatment regardless of criminal activity)." },
            { title: "Custody", content: "Patient remains in law enforcement custody - officer accompanies in ambulance (Ref. 532)." },
            { title: "Evidence", content: "Preserve evidence when possible (clothing in paper bag) but patient care takes priority." },
            { title: "Documentation", content: "Document injuries objectively. Do not make assumptions about guilt/innocence." }
        ]}
    ]
  },
  {
    id: "816", refNo: "Ref. 816", title: "Physician at the Scene", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "stethoscope", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Physician Scene", subtitle: "Ref. 816" }] },
        { type: "list", title: "Requirements to Direct Care", items: [
            { title: "Identification", content: "Must show a valid California Medical License (MD/DO)." },
            { title: "Responsibility", content: "Must agree to take total responsibility for patient care." },
            { title: "Transport", content: "Must accompany the patient in the ambulance to the hospital." }
        ]},
        { type: "warning", content: "If the physician refuses to accompany the patient, they relinquish control. Paramedics revert to EMS protocols and Base Hospital direction." },
        { type: "text", title: "Patient's Physician", content: "If the patient's private physician is present, they may offer advice/orders but the Base Hospital has final authority unless the private physician accompanies the patient." }
    ]
  },
  {
    id: "817", refNo: "Ref. 817", title: "Interfacility Transfer Responsibilities", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "compare_arrows", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Interfacility Transfer", subtitle: "Ref. 817" }] },
        { type: "text", title: "Purpose", content: "Defines EMS responsibilities when transferring patients between healthcare facilities." },
        { type: "accordion", title: "Transfer Requirements", items: [
            { title: "Physician Orders", content: "Written or verbal orders from sending physician required before departure." },
            { title: "Report", content: "Obtain full report from sending nurse/physician including diagnosis, vitals, treatments, medications, allergies." },
            { title: "Medical Records", content: "Obtain copy of relevant records, labs, imaging to accompany patient." },
            { title: "Acceptance", content: "Verify receiving facility has accepted patient and bed assignment." }
        ]},
        { type: "list", title: "Level of Care", items: [
            { title: "BLS Transfer", content: "Stable patients not requiring ALS monitoring or interventions." },
            { title: "ALS Transfer", content: "Patients requiring cardiac monitoring, IV medications, ventilator management." },
            { title: "Critical Care Transfer", content: "ICU-level patients may require CCT (Critical Care Transport) with RN or higher level of care." },
            { title: "Scope Limits", content: "Paramedics may not be trained/authorized for some ICU interventions (pressors, vents) - may require CCT or sending facility RN to accompany." }
        ]},
        { type: "warning", content: "If patient condition exceeds paramedic scope (multi-drip pressors, oscillating ventilator), request CCT or sending facility personnel to accompany." }
    ]
  },
  {
    id: "818", refNo: "Ref. 818", title: "Medical Equipment Failure in the Field", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "build_circle", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Equipment Failure", subtitle: "Ref. 818" }] },
        { type: "text", title: "Purpose", content: "Procedures for managing critical equipment failures during patient care." },
        { type: "list", title: "Immediate Actions", items: [
            { title: "Backup Equipment", content: "Switch to backup device (backup monitor, AED, manual BVM if mechanical CPR fails)." },
            { title: "Alternative Methods", content: "Use alternative interventions if equipment-dependent treatment fails (manual compressions if LUCAS fails)." },
            { title: "Base Hospital", content: "Contact Base Hospital to report failure and request guidance if it affects treatment plan." },
            { title: "Transport Decision", content: "Do not delay transport for non-critical equipment failures. Manage with available resources." }
        ]},
        { type: "accordion", title: "Post-Incident Actions", items: [
            { title: "Out of Service", content: "Tag failed equipment 'Out of Service' immediately upon return." },
            { title: "Incident Report", content: "Complete equipment failure incident report (Ref. 611)." },
            { title: "Notification", content: "Notify supervisor and biomedical maintenance immediately for critical equipment (monitor, defibrillator, ventilator)." },
            { title: "Investigation", content: "Determine cause (user error, maintenance issue, equipment defect). Report defects to manufacturer." }
        ]}
    ]
  },
  {
    id: "819", refNo: "Ref. 819", title: "Ambulance Collision or Vehicle Breakdown", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "car_crash", color: "red",
    sections: [
        { type: "header", items: [{ title: "Vehicle Collision/Breakdown", subtitle: "Ref. 819" }] },
        { type: "text", title: "Purpose", content: "Procedures for ambulance collisions or mechanical breakdowns during response or patient transport." },
        { type: "accordion", title: "Ambulance Collision", items: [
            { title: "Scene Safety", content: "Park safely, activate hazard lights, deploy traffic warning devices." },
            { title: "Patient Assessment", content: "Assess/treat patient(s) in ambulance if collision occurred during transport." },
            { title: "Notifications", content: "Notify dispatch, request law enforcement, request backup ambulance for patient transfer." },
            { title: "EMS Personnel Injury", content: "EMS personnel injured in collision should be evaluated at ED and complete injury report (Ref. 611)." },
            { title: "Investigation", content: "Cooperate with law enforcement investigation. Complete agency collision report." }
        ]},
        { type: "list", title: "Vehicle Breakdown", items: [
            { title: "Pull Over Safely", content: "Move to safe location (shoulder, parking lot). Activate hazard lights." },
            { title: "Request Replacement", content: "Request replacement ambulance. Transfer patient if transport in progress." },
            { title: "Patient Care", content: "Continue patient care until replacement arrives. Do not leave patient unattended." },
            { title: "Out of Service", content: "Notify dispatch vehicle is out of service for maintenance." }
        ]}
    ]
  },
  {
    id: "820", refNo: "Ref. 820", title: "Communications Failure", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "signal_cellular_connected_no_internet_0_bar", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Communications Failure", subtitle: "Ref. 820" }] },
        { type: "text", title: "Purpose", content: "Procedures when radio or cellular communication fails during EMS operations." },
        { type: "list", title: "Radio Failure", items: [
            { title: "Troubleshoot", content: "Check volume, squelch, battery (portable). Try different channels." },
            { title: "Backup Radio", content: "Use backup radio or partner unit's radio." },
            { title: "Cell Phone", content: "Use cellular phone to contact dispatch or Base Hospital." },
            { title: "Face-to-Face", content: "For Base Hospital contact, may need to use hospital phone upon arrival." }
        ]},
        { type: "accordion", title: "Complete Communications Failure", items: [
            { title: "Standing Orders", content: "Operate under standing orders (offline protocols) if Base Hospital contact not possible." },
            { title: "Closest Facility", content: "Transport to closest appropriate facility if destination unclear." },
            { title: "Hospital Phone", content: "Use hospital phone for Base contact if radio/cell both failed." },
            { title: "Document", content: "Document communication failure and reliance on standing orders in PCR." },
            { title: "Report Failure", content: "Report communication system failure to agency for repair." }
        ]}
    ]
  },
  {
    id: "821", refNo: "Ref. 821", title: "Crime Scene Awareness and Evidence Preservation", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "location_searching", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Crime Scene", subtitle: "Ref. 821" }] },
        { type: "text", title: "Purpose", content: "EMS personnel should be aware of potential crime scenes and make reasonable efforts to preserve evidence while prioritizing patient care." },
        { type: "list", title: "Crime Scene Recognition", items: [
            { title: "Obvious Crime", content: "Shootings, stabbings, sexual assault, assault/battery." },
            { title: "Suspicious Circumstances", content: "Unexplained injuries, injuries inconsistent with story, domestic violence, child/elder abuse." },
            { title: "Death Investigation", content: "Any unexpected death may be crime scene (homicide, suicide, suspicious circumstances)." }
        ]},
        { type: "accordion", title: "Evidence Preservation", items: [
            { title: "Patient Care First", content: "Patient care always takes priority over evidence preservation." },
            { title: "Minimize Disturbance", content: "Move/touch only what is necessary for patient care. Note original positions." },
            { title: "Clothing", content: "If removing clothing, do not cut through bullet holes or knife tears. Place clothing in paper bag (not plastic - degrades DNA)." },
            { title: "Document", content: "Document scene observations in PCR (position of patient, weapons, signs of struggle, statements by patient/witnesses)." },
            { title: "Projectiles", content: "If bullets or weapons removed from patient, give to law enforcement (not hospital). Document chain of custody." },
            { title: "Law Enforcement", content: "Notify law enforcement of suspicious circumstances. Preserve scene for their investigation." }
        ]}
    ]
  },
  {
    id: "822", refNo: "Ref. 822", title: "Death Determination and Pronouncement", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "person_off", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Death Determination", subtitle: "Ref. 822" }] },
        { type: "text", title: "Authority", content: "Only physicians may legally pronounce death. Paramedics may determine obvious death or request termination of resuscitation from Base Hospital." },
        { type: "accordion", title: "Obvious Death (Do Not Resuscitate)", items: [
            { title: "Rigor Mortis", content: "Stiffening of body (occurs 2-6 hours after death)." },
            { title: "Dependent Lividity", content: "Pooling of blood in dependent areas with skin discoloration (occurs 30 min - 2 hours after death)." },
            { title: "Decomposition", content: "Obvious signs of tissue decomposition." },
            { title: "Decapitation/Dismemberment", content: "Injuries obviously incompatible with life." },
            { title: "Incineration", content: "Body burned beyond recognition." }
        ]},
        { type: "list", title: "Termination of Resuscitation", items: [
            { title: "Base Hospital Contact", content: "Contact Base Hospital to request termination of resuscitation in cardiac arrest per protocol (Ref. 1212)." },
            { title: "Physician Pronouncement", content: "Base physician pronounces death over radio/phone." },
            { title: "Documentation", content: "Document physician name, time of pronouncement, reason for termination decision." },
            { title: "Scene Management", content: "Notify law enforcement, medical examiner. Preserve scene if suspicious. Provide family support." }
        ]},
        { type: "warning", content: "Do NOT pronounce death independently. Either criteria for obvious death must be met OR Base Hospital physician pronounces." }
    ]
  },
  {
    id: "823", refNo: "Ref. 823", title: "Medical Examiner Cases and Notification", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "content_paste_search", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Medical Examiner", subtitle: "Ref. 823" }] },
        { type: "text", title: "Purpose", content: "Certain deaths require medical examiner (coroner) investigation and body release." },
        { type: "list", title: "Medical Examiner Cases", items: [
            { title: "Violent Death", content: "Homicide, suicide, accidental death (trauma, overdose, etc.)." },
            { title: "Sudden/Unexpected", content: "Unexpected death in person not under physician's care or unknown cause." },
            { title: "Suspicious Circumstances", content: "Any death with suspicious circumstances." },
            { title: "In-Custody", content: "Deaths in jail, prison, or police custody." },
            { title: "Occupational", content: "Deaths related to employment or workplace." }
        ]},
        { type: "accordion", title: "Notification and Scene Management", items: [
            { title: "Law Enforcement", content: "Notify law enforcement for all medical examiner cases." },
            { title: "ME Notification", content: "Law enforcement or hospital typically notifies medical examiner. EMS may notify if directed." },
            { title: "Body Position", content: "Do not move body unless necessary for resuscitation. Document original position if moved." },
            { title: "Scene Preservation", content: "Preserve scene for medical examiner/law enforcement investigation." },
            { title: "Family", content: "Advise family that medical examiner will be involved. Provide emotional support." }
        ]}
    ]
  },
  {
    id: "824", refNo: "Ref. 824", title: "Use of Medical Restraints", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "back_hand", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Medical Restraints", subtitle: "Ref. 824" }] },
        { type: "text", title: "Purpose", content: "Medical restraints may be necessary to protect violent or combative patients from self-harm and protect EMS personnel." },
        { type: "accordion", title: "Indications for Restraint", items: [
            { title: "Patient Safety", content: "Patient attempting to harm self (pulling out IV, jumping from gurney)." },
            { title: "Provider Safety", content: "Patient violent or combative toward EMS personnel." },
            { title: "Violent Behavior", content: "Patient behavior prevents safe assessment or treatment." },
            { title: "Medical Cause", content: "Altered mental status from medical cause (hypoglycemia, hypoxia, head injury, excited delirium) - restraint for patient safety while treating underlying cause." }
        ]},
        { type: "list", title: "Restraint Application", items: [
            { title: "Soft Restraints", content: "Use commercial soft restraints (leather, nylon) - not handcuffs, rope, or zip ties." },
            { title: "Supine Position", content: "Restrain patient in supine position. NEVER prone (face-down) - risk of positional asphyxia." },
            { title: "4-Point", content: "Restrain all 4 extremities to prevent movement." },
            { title: "Law Enforcement", content: "Have law enforcement present when applying restraints to violent patient." },
            { title: "Monitoring", content: "Continuously monitor restrained patients - airway, breathing, circulation, mental status." }
        ]},
        { type: "warning", content: "NEVER restrain patient in prone position (face-down) or hog-tie position - high risk of sudden death from positional asphyxia." }
    ]
  },
  {
    id: "825", refNo: "Ref. 825", title: "DNR Orders and POLST Forms", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "do_not_disturb", color: "purple",
    sections: [
        { type: "header", items: [{ title: "DNR/POLST", subtitle: "Ref. 825" }] },
        { type: "text", title: "Purpose", content: "Do Not Resuscitate (DNR) orders and Physician Orders for Life-Sustaining Treatment (POLST) forms allow patients to make advance decisions about resuscitation and life-sustaining treatments." },
        { type: "accordion", title: "Valid DNR/POLST Requirements", items: [
            { title: "POLST Form", content: "California uses standardized POLST form (pink or yellow form). Must be signed by physician and patient/surrogate." },
            { title: "DNR Medallion", content: "EMS DNR medallion (necklace/bracelet) issued by physician is valid DNR order." },
            { title: "Out-of-Hospital DNR", content: "Out-of-hospital DNR form signed by physician and patient." },
            { title: "NOT Valid", content: "Hospital DNR orders, living wills, verbal requests, advance directives without physician signature NOT valid for EMS - these are NOT physician orders." }
        ]},
        { type: "list", title: "POLST Treatment Options", items: [
            { title: "Section A (CPR)", content: "Full CPR or Do Not Attempt Resuscitation (DNAR)." },
            { title: "Section B (Medical Interventions)", content: "Full treatment, selective treatment, or comfort-focused treatment." },
            { title: "Section C (Antibiotics)", content: "Use antibiotics if life can be prolonged, or no antibiotics (comfort only)." },
            { title: "Section D (Nutrition)", content: "Artificially administered nutrition or no artificial nutrition." }
        ]},
        { type: "warning", content: "If valid POLST indicates 'Do Not Attempt Resuscitation', do NOT initiate CPR. Provide comfort care only. If POLST not available or validity questionable, begin resuscitation and contact Base Hospital." }
    ]
  },
  {
    id: "826", refNo: "Ref. 826", title: "Determination of Decision-Making Capacity", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "psychology", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Decision Capacity", subtitle: "Ref. 826" }] },
        { type: "text", title: "Purpose", content: "Patients must have decision-making capacity to provide informed consent or refuse medical care." },
        { type: "list", title: "Capacity Assessment", items: [
            { title: "Understand Information", content: "Patient can understand their medical condition and proposed treatment." },
            { title: "Appreciate Situation", content: "Patient appreciates how information applies to their situation." },
            { title: "Reason About Options", content: "Patient can weigh risks/benefits and articulate reasoning." },
            { title: "Communicate Choice", content: "Patient can clearly communicate their decision." }
        ]},
        { type: "accordion", title: "Factors Impairing Capacity", items: [
            { title: "Altered Mental Status", content: "Confusion, disorientation, impaired consciousness." },
            { title: "Intoxication", content: "Alcohol or drug intoxication." },
            { title: "Psychiatric Emergency", content: "Acute psychosis, suicidal ideation, severe depression/mania." },
            { title: "Medical Conditions", content: "Hypoglycemia, hypoxia, stroke, head injury, severe pain." },
            { title: "Age", content: "Minors (<18) generally lack capacity unless emancipated minor." }
        ]},
        { type: "warning", content: "If patient lacks capacity, they cannot refuse care. Transport and obtain consent from surrogate decision-maker (family, conservator) or Base Hospital physician. In emergency, implied consent applies." }
    ]
  },
  {
    id: "827", refNo: "Ref. 827", title: "Consent for Treatment - Informed, Implied, and Involuntary", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "assignment_turned_in", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Consent", subtitle: "Ref. 827" }] },
        { type: "text", title: "Purpose", content: "Defines types of consent for EMS treatment and transport." },
        { type: "accordion", title: "Types of Consent", items: [
            { title: "Informed Consent", content: "Competent adult patient with capacity gives permission after being informed of condition, treatment, risks, benefits, alternatives." },
            { title: "Implied Consent", content: "Unconscious or incapacitated patient unable to consent - law assumes they would consent to life-saving treatment." },
            { title: "Minor Consent", content: "Parent/legal guardian provides consent for minors (<18). Exception: emancipated minor or life-threatening emergency with parent unavailable." },
            { title: "Involuntary", content: "Patient on legal hold (5150 psychiatric, conservatorship) does not have right to refuse transport even if conscious and protesting." }
        ]},
        { type: "list", title: "Special Situations", items: [
            { title: "Refusal", content: "Patient with capacity may refuse any treatment/transport (Ref. 1216 AMA protocol)." },
            { title: "Surrogate", content: "If patient lacks capacity, surrogate decision-maker (spouse, adult child, etc.) may consent per California health care decision hierarchy." },
            { title: "Court Orders", content: "Court-appointed conservator has legal authority to consent for conserved adult." },
            { title: "Advance Directives", content: "POLST/DNR orders represent patient's advance consent preferences (Ref. 825)." }
        ]}
    ]
  },
  {
    id: "828", refNo: "Ref. 828", title: "Patient Refusal Against Medical Advice (AMA)", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "cancel", color: "orange",
    sections: [
        { type: "header", items: [{ title: "AMA Refusal", subtitle: "Ref. 828" }] },
        { type: "text", title: "Purpose", content: "Competent patients have the right to refuse medical care even when refusal may result in harm or death." },
        { type: "accordion", title: "Refusal Requirements", items: [
            { title: "Capacity", content: "Patient must have decision-making capacity (Ref. 826). No altered mental status, intoxication." },
            { title: "Informed", content: "Patient must be informed of findings, risks of refusal, potential consequences, benefits of transport." },
            { title: "Voluntary", content: "Decision must be voluntary, not coerced." },
            { title: "Documentation", content: "Thorough documentation of capacity assessment, informed refusal discussion, patient understanding (Ref. 605)." }
        ]},
        { type: "list", title: "AMA Process", items: [
            { title: "Assessment", content: "Complete full assessment including vital signs." },
            { title: "Inform", content: "Explain findings and risks of not going to hospital." },
            { title: "Encourage Transport", content: "Encourage patient to accept transport. Explain you cannot force them if they have capacity." },
            { title: "Base Contact (ALS)", content: "ALS refusals require Base Hospital physician evaluation via radio/phone." },
            { title: "Signature", content: "Obtain patient signature on refusal form. If refuses to sign, document this with witness." },
            { title: "Alternatives", content: "Provide alternatives (call back 911, private vehicle to ED, follow up with doctor)." }
        ]},
        { type: "warning", content: "Do NOT allow patient to refuse if they lack capacity. Patients with altered mental status, intoxication, or suicidal ideation cannot refuse - transport or obtain law enforcement assistance for 5150 hold." }
    ]
  },
  {
    id: "829", refNo: "Ref. 829", title: "Psychiatric Holds (5150) and Patient Rights", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "purple",
    sections: [
        { type: "header", items: [{ title: "5150 Holds", subtitle: "Ref. 829" }] },
        { type: "text", title: "Authority", content: "California Welfare & Institutions Code 5150 allows designated personnel to place psychiatric holds for evaluation and treatment." },
        { type: "list", title: "5150 Criteria (Must Meet One)", items: [
            { title: "Danger to Self", content: "Suicidal ideation or behavior, self-harm." },
            { title: "Danger to Others", content: "Homicidal ideation or behavior, violent toward others." },
            { title: "Gravely Disabled", content: "Unable to provide for food, clothing, shelter due to mental disorder." }
        ]},
        { type: "accordion", title: "5150 Process", items: [
            { title: "Authorized Personnel", content: "Law enforcement, designated mental health professionals, or licensed physicians may initiate 5150 hold. EMS cannot initiate 5150." },
            { title: "EMS Role", content: "EMS transports patients on 5150 hold to designated psychiatric facility per law enforcement or mental health professional's direction." },
            { title: "Medical Clearance", content: "Patients with medical issues (trauma, overdose, altered mental status from medical cause) must be medically cleared at ED before psychiatric facility." },
            { title: "Restraints", content: "Patients on 5150 hold may require restraints if violent/combative (Ref. 824)." },
            { title: "Patient Rights", content: "Patient on 5150 hold does NOT have right to refuse transport but retains right to humane treatment." }
        ]},
        { type: "warning", content: "Always have law enforcement present when transporting involuntary psychiatric patient. Do not attempt to transport combative psychiatric patient without law enforcement assistance." }
    ]
  },
  {
    id: "830", refNo: "Ref. 830", title: "Paramedic Trial Studies", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "science", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Trial Studies", subtitle: "Ref. 830" }] },
        { type: "text", content: "Paramedics may participate in Local EMS Agency approved clinical trial studies (e.g., LA-DROP blood study)." },
        { type: "accordion", title: "Requirements", items: [
            { title: "Training", content: "Specific training on the study protocol is required." },
            { title: "Consent", content: "Informed consent (or community consultation exception) must be documented." },
            { title: "Deviation", content: "Study protocols may supersede standard treatment protocols for enrolled patients." }
        ]}
    ]
  },
  {
    id: "831", refNo: "Ref. 831", title: "Good Samaritan Protections", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "volunteer_activism", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Good Samaritan", subtitle: "Ref. 831" }] },
        { type: "text", title: "Legal Protection", content: "California Good Samaritan Law provides immunity from civil liability for EMS personnel rendering emergency care." },
        { type: "list", title: "Good Samaritan Coverage", items: [
            { title: "Off-Duty Care", content: "EMS personnel providing care at scene while off-duty and not compensated are covered." },
            { title: "Emergency Scene", content: "Must be emergency situation, not routine medical care." },
            { title: "Good Faith", content: "Care must be provided in good faith without expectation of payment." },
            { title: "No Gross Negligence", content: "Protection does NOT cover gross negligence or willful misconduct." }
        ]},
        { type: "accordion", title: "On-Duty vs Off-Duty", items: [
            { title: "On-Duty", content: "On-duty EMS personnel are NOT Good Samaritans - covered by agency liability insurance and workers' compensation." },
            { title: "Off-Duty Intervention", content: "Off-duty EMS personnel may choose to intervene but not legally obligated (no duty to act when off-duty)." },
            { title: "Scope of Practice", content: "Off-duty intervention should be within scope of practice. Do not perform ALS interventions without equipment, medical direction, or legal authority." }
        ]}
    ]
  },
  {
    id: "832", refNo: "Ref. 832", title: "Mandatory Reporting - Child, Elder, Dependent Adult Abuse", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "report", color: "orange",
    sections: [
        { type: "header", items: [{ title: "Mandatory Reporting", subtitle: "Ref. 832" }] },
        { type: "text", title: "Legal Requirement", content: "EMS personnel are mandatory reporters under California law. Failure to report known or suspected abuse is a crime." },
        { type: "accordion", title: "Reporting Requirements", items: [
            { title: "Child Abuse (PC 11166)", content: "Report suspected physical abuse, sexual abuse, emotional abuse, or neglect of child <18 to Child Protective Services or law enforcement immediately (Ref. 535)." },
            { title: "Elder Abuse (WIC 15630)", content: "Report suspected abuse or neglect of elder (>=65) to Adult Protective Services or law enforcement (Ref. 534)." },
            { title: "Dependent Adult (WIC 15630)", content: "Report suspected abuse or neglect of dependent adult (18-64 with physical/mental limitations) to APS or law enforcement." }
        ]},
        { type: "list", title: "Reporting Process", items: [
            { title: "Immediate Phone Report", content: "Call APS or law enforcement immediately or as soon as safely possible." },
            { title: "Written Report", content: "Written report must be submitted within 36 hours of initial phone report." },
            { title: "Hospital Notification", content: "Notify receiving hospital of suspected abuse for their evaluation and reporting." },
            { title: "Documentation", content: "Document objective findings in PCR (injuries, environment, verbatim statements) without making accusations." },
            { title: "Confidentiality", content: "Reporter identity is confidential. Reporters are immune from civil/criminal liability if report made in good faith." }
        ]},
        { type: "warning", content: "Do NOT confront suspected abuser. Focus on patient safety and medical care. Let APS/law enforcement investigate." }
    ]
  },
  {
    id: "833", refNo: "Ref. 833", title: "Special Operations - Urban Search and Rescue", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "construction", color: "orange",
    sections: [
        { type: "header", items: [{ title: "USAR Operations", subtitle: "Ref. 833" }] },
        { type: "text", title: "Purpose", content: "Urban Search and Rescue (USAR) operations involve specialized EMS response to building collapses, confined space rescues, and structural emergencies requiring technical rescue capabilities." },
        { type: "accordion", title: "USAR Medical Operations", items: [
            { title: "Medical Team", content: "USAR medical specialists are trained paramedics with advanced rescue medicine skills integrated into FEMA USAR task forces." },
            { title: "Hazard Assessment", content: "Medical personnel assess scene hazards including structural instability, HAZMAT, confined space atmosphere, and environmental conditions." },
            { title: "Patient Access", content: "Medical care may be provided in confined spaces requiring specialized equipment (low-profile monitors, compact airway kits)." },
            { title: "Prolonged Care", content: "Entrapment may require extended patient care during extrication (hours to days). Maintain hydration, pain control, environmental protection." }
        ]},
        { type: "list", title: "USAR Medical Priorities", items: [
            { title: "Rescuer Safety", content: "USAR environment is extremely hazardous. Never compromise rescuer safety for victim access." },
            { title: "Triage", content: "Rapid assessment of multiple victims. Prioritize victims with highest survival probability and shortest extrication time." },
            { title: "Crush Syndrome", content: "Anticipate crush syndrome in prolonged entrapment >4 hours. Aggressive fluid resuscitation before extrication (Ref. 1260)." },
            { title: "Environmental", content: "Prevent hypothermia in prolonged entrapment. Provide warming, shelter from elements." },
            { title: "Amputation", content: "Field amputation may be necessary for life-saving extrication - requires physician on-scene and Base Hospital authorization." }
        ]},
        { type: "warning", content: "USAR operations require specialized training and equipment. Standard EMS personnel should not enter collapse zones without USAR team coordination." }
    ]
  },
  {
    id: "834", refNo: "Ref. 834", title: "Tactical EMS (TEMS) Operations", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "shield", color: "red",
    sections: [
        { type: "header", items: [{ title: "Tactical EMS", subtitle: "Ref. 834" }] },
        { type: "text", title: "Purpose", content: "Tactical Emergency Medical Support (TEMS) provides specialized medical care during law enforcement tactical operations including SWAT operations, active shooter response, and high-risk warrant service." },
        { type: "list", title: "TEMS Provider Requirements", items: [
            { title: "Training", content: "Tactical Combat Casualty Care (TCCC/TECC) certification, tactical operations training, weapons familiarization." },
            { title: "Physical Fitness", content: "Maintain physical fitness standards to operate in tactical environment with full gear." },
            { title: "Equipment", content: "Tactical medical equipment (individual first aid kits, hemostatic agents, tourniquets, chest seals, compact airway kits)." },
            { title: "Integration", content: "Train with law enforcement tactical teams to understand tactics, communications, and operational procedures." }
        ]},
        { type: "accordion", title: "Tactical Care Phases", items: [
            { title: "Care Under Fire", content: "Minimal medical interventions while under direct threat. Hemorrhage control with tourniquets, move to cover." },
            { title: "Tactical Field Care", content: "Limited threat. Perform life-saving interventions: tourniquet conversion, airway management, needle decompression, IV access." },
            { title: "Tactical Evacuation", content: "Patient evacuated to cold zone for full assessment and treatment per standard protocols." }
        ]},
        { type: "list", title: "TEMS Medical Priorities (MARCH)", items: [
            { title: "M - Massive Hemorrhage", content: "Immediate tourniquet application for extremity hemorrhage. Hemostatic gauze for junctional hemorrhage." },
            { title: "A - Airway", content: "Basic maneuvers, NPA. Avoid advanced airway unless BVM fails - focus on rapid evacuation." },
            { title: "R - Respirations", content: "Needle decompression for tension pneumothorax. Chest seals for open pneumothorax." },
            { title: "C - Circulation", content: "IV/IO access, fluid resuscitation. Permissive hypotension for hemorrhagic shock (SBP 80-90)." },
            { title: "H - Hypothermia", content: "Prevent heat loss. Hypothermia triad (cold, acidosis, coagulopathy) increases trauma mortality." }
        ]},
        { type: "warning", content: "TEMS operations are high-risk. Only trained tactical medics with proper equipment and law enforcement integration should operate in warm zones." }
    ]
  },
  {
    id: "835", refNo: "Ref. 835", title: "Wilderness EMS Operations", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "terrain", color: "green",
    sections: [
        { type: "header", items: [{ title: "Wilderness EMS", subtitle: "Ref. 835" }] },
        { type: "text", title: "Definition", content: "Wilderness EMS involves medical care provided in remote locations where evacuation to definitive care is delayed >1 hour due to terrain, distance, or environmental conditions." },
        { type: "accordion", title: "Wilderness Medicine Principles", items: [
            { title: "Prolonged Care", content: "Prepare for extended patient care during evacuation (hours to days). Maintain hydration, nutrition, pain control, environmental protection." },
            { title: "Limited Resources", content: "Carry only essential equipment. Improvise with available materials when necessary." },
            { title: "Environmental Hazards", content: "Assess and mitigate environmental threats: weather, wildlife, altitude, terrain hazards." },
            { title: "Self-Sufficiency", content: "Medical team must be self-sufficient for duration of mission. No resupply capability." }
        ]},
        { type: "list", title: "Wilderness Medical Considerations", items: [
            { title: "Spinal Motion Restriction", content: "Full spinal immobilization impractical for prolonged wilderness evacuation. Use focused SMR based on mechanism and exam per protocol." },
            { title: "Hypothermia Management", content: "Prevent further heat loss. Active rewarming may be limited by resources. Gentle handling of severely hypothermic patients." },
            { title: "Altitude Illness", content: "Recognize acute mountain sickness (AMS), high altitude pulmonary edema (HAPE), high altitude cerebral edema (HACE). Descent is definitive treatment." },
            { title: "Wound Care", content: "Irrigation and bandaging in field. Antibiotics may be indicated for wounds in contaminated environment with delayed evacuation." },
            { title: "Pain Management", content: "Adequate analgesia critical for prolonged care and patient movement over rough terrain." }
        ]},
        { type: "accordion", title: "Evacuation Methods", items: [
            { title: "Ground Evacuation", content: "Litter carry, wheeled litter, all-terrain vehicle. May require multiple hours and large team." },
            { title: "Air Evacuation", content: "Helicopter hoist rescue preferred when available. Weather and terrain dependent." },
            { title: "Self-Evacuation", content: "Ambulatory patients with minor injuries may self-evacuate with assistance." },
            { title: "Overnight Shelter", content: "If evacuation not feasible before dark, establish shelter and continue care until daylight/weather permits." }
        ]},
        { type: "warning", content: "Wilderness EMS providers must have specialized training in wilderness medicine, technical rescue, and survival skills. Standard urban EMS training insufficient for wilderness environment." }
    ]
  },
  {
    id: "836", refNo: "Ref. 836", title: "Maritime and Swift Water EMS", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "waves", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Maritime EMS", subtitle: "Ref. 836" }] },
        { type: "text", title: "Purpose", content: "Maritime EMS addresses medical care in aquatic environments including ocean rescue, swift water rescue, and boat-based EMS operations." },
        { type: "list", title: "Water Rescue Safety", items: [
            { title: "Personal Flotation", content: "All EMS personnel operating near water must wear appropriate personal flotation device (PFD)." },
            { title: "Swift Water", content: "Only trained swift water rescue technicians should enter moving water. EMS stages for patient delivery to shore." },
            { title: "Surf Rescue", content: "Ocean lifeguards perform water rescue. EMS receives patient at water's edge or on beach." },
            { title: "Boat Operations", content: "EMS personnel on vessels must have water safety training and appropriate safety equipment." }
        ]},
        { type: "accordion", title: "Drowning and Submersion", items: [
            { title: "Rescue Breathing", content: "If trained in water rescue, may initiate rescue breathing in water during extraction. CPR requires solid surface." },
            { title: "Resuscitation", content: "Begin full CPR immediately upon reaching solid surface. Follow standard cardiac arrest protocol (Ref. 1212)." },
            { title: "Hypothermia", content: "Drowning victims are often hypothermic. Continue resuscitation efforts and provide warming - 'not dead until warm and dead.'" },
            { title: "Spinal Injury", content: "Suspect C-spine injury in diving accidents, surf injuries, or unknown mechanism. Provide spinal motion restriction (Ref. 1260)." },
            { title: "Diving Injuries", content: "Decompression sickness (DCS) and arterial gas embolism (AGE) require hyperbaric oxygen treatment. Contact DAN (Divers Alert Network) and transport to hyperbaric facility." }
        ]},
        { type: "list", title: "Marine Envenomations", items: [
            { title: "Jellyfish Stings", content: "Rinse with vinegar (acetic acid) to inactivate nematocysts. Remove tentacles. Pain control. Do not use fresh water (activates nematocysts)." },
            { title: "Stingray", content: "Hot water immersion (as hot as tolerable) for 30-90 min for pain relief. Remove visible barbs. Pain control. Wound care." },
            { title: "Sea Urchin", content: "Remove visible spines. Vinegar or hot water immersion for pain. Embedded spines may require surgical removal." },
            { title: "Marine Toxins", content: "Shellfish poisoning, ciguatera, scombroid - supportive care, consider Base contact for severe cases." }
        ]},
        { type: "warning", content: "Never enter water for rescue without proper training, equipment, and backup. 'Reach or throw, don't go' - extend pole/rope to victim rather than entering water." }
    ]
  },
  {
    id: "837", refNo: "Ref. 837", title: "Aviation EMS and Air Medical Operations", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "flight", color: "blue",
    sections: [
        { type: "header", items: [{ title: "Air Medical EMS", subtitle: "Ref. 837" }] },
        { type: "text", title: "Purpose", content: "Air medical operations provide rapid transport for critical patients and access to remote locations. Includes helicopter EMS (HEMS) and fixed-wing air ambulance." },
        { type: "accordion", title: "Helicopter Landing Zone (LZ) Safety", items: [
            { title: "LZ Selection", content: "Minimum 100x100 ft clear area. Flat terrain, free of wires, poles, loose debris. Day operations: firm, level surface. Night operations: larger area required." },
            { title: "Ground Crew", content: "Fire department typically secures LZ. Mark corners with road flares (not facing helicopter). Control crowd and ground vehicles." },
            { title: "Approach/Departure", content: "Never approach helicopter without pilot signal. Approach from front (pilot's view), stay low. Never approach from rear (tail rotor hazard - invisible and lethal)." },
            { title: "Patient Transfer", content: "Flight crew makes all decisions about patient care and flight. Provide thorough report including vitals, treatments, mechanism." }
        ]},
        { type: "list", title: "Air Medical Indications", items: [
            { title: "Critical Trauma", content: "Multi-system trauma, severe burns, major mechanism with entrapment. Transport to trauma center." },
            { title: "Remote Location", content: "Ground transport >30 minutes to appropriate facility. Wilderness rescue." },
            { title: "Time-Critical", content: "STEMI, stroke, high-risk OB requiring specialty center." },
            { title: "Specialty Resources", content: "Pediatric critical care, burn center, reimplantation center, hyperbaric facility." },
            { title: "Scene Access", content: "Ground access limited (mountain, water, heavy traffic)." }
        ]},
        { type: "accordion", title: "Flight Physiology Considerations", items: [
            { title: "Altitude Effects", content: "Decreased barometric pressure causes gas expansion (pneumothorax, bowel obstruction, air splints). Decreased oxygen availability." },
            { title: "Pneumothorax", content: "Decompress all pneumothoraces before flight. Tension pneumo can rapidly worsen with altitude." },
            { title: "Air Splints", content: "Do not use air splints on flight. Use rigid splints instead." },
            { title: "MAST/PASG", content: "Do not use pneumatic anti-shock garment on flight due to pressure changes." },
            { title: "IV Fluid", content: "Use pressure bags for IV fluids - gravity drips unreliable due to vibration and movement." }
        ]},
        { type: "list", title: "Weather and Safety Limitations", items: [
            { title: "Weather Minimums", content: "Pilot has final authority to decline flight due to weather. VFR minimums: 1000 ft ceiling, 3 miles visibility daytime. Higher minimums at night." },
            { title: "Weight Limits", content: "Flight crew determines if patient and equipment are within weight limits. May need to remove personnel or equipment." },
            { title: "Safety First", content: "Patient care secondary to flight safety. Never pressure crew to fly in unsafe conditions." }
        ]},
        { type: "warning", content: "Helicopter tail rotors are nearly invisible and lethal. NEVER approach helicopter from rear or sides. Always approach from front within pilot's view and only when signaled." }
    ]
  },
  {
    id: "838", refNo: "Ref. 838", title: "Industrial and HAZMAT EMS", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "factory", color: "orange",
    sections: [
        { type: "header", items: [{ title: "Industrial HAZMAT EMS", subtitle: "Ref. 838" }] },
        { type: "text", title: "Purpose", content: "Industrial and HAZMAT incidents require specialized EMS response for chemical exposures, confined space rescues, and industrial accidents involving hazardous materials or environments." },
        { type: "list", title: "HAZMAT Incident Management", items: [
            { title: "Scene Zones", content: "Hot Zone (contaminated area - HAZMAT entry only), Warm Zone (decontamination corridor), Cold Zone (safe area - EMS operations)." },
            { title: "Decontamination", content: "All contaminated patients must undergo decontamination before EMS contact. HAZMAT team performs gross decon in warm zone." },
            { title: "PPE Requirements", content: "EMS operates in cold zone with standard PPE. Do NOT enter hot or warm zones without HAZMAT training and appropriate PPE (Level A/B)." },
            { title: "Medical Monitoring", content: "Monitor vital signs of HAZMAT entry team members before and after entry. Identify heat stress, dehydration, cardiac strain from PPE work." }
        ]},
        { type: "accordion", title: "Chemical Exposure Management", items: [
            { title: "Decontamination First", content: "Patient decontamination takes priority over medical treatment (except immediate life threats). Prevents contamination of ambulance and hospital." },
            { title: "Substance Identification", content: "Obtain chemical name, UN number, or reference ERG (Emergency Response Guidebook) / Safety Data Sheet (SDS) for exposure information." },
            { title: "Poison Control", content: "Contact Poison Control (1-800-222-1222) for treatment recommendations. Relay to Base Hospital physician for orders (Ref. 805)." },
            { title: "Antidotes", content: "Specific antidotes may be required: Cyanide - hydroxocobalamin, Organophosphates - atropine/2-PAM, Hydrofluoric acid - calcium." },
            { title: "Supportive Care", content: "Most exposures require supportive care: airway, oxygen, IV fluids, symptomatic treatment." }
        ]},
        { type: "list", title: "Industrial Incident Types", items: [
            { title: "Confined Space", content: "Oxygen deficiency, toxic atmosphere, engulfment hazard. Requires confined space rescue team. Monitor for hypoxia, toxic gas exposure." },
            { title: "Radiation", content: "Decontaminate patient (remove clothing removes 90% contamination). Use time/distance/shielding. Radiation emergency assistance: REAC/TS." },
            { title: "Thermal Burns", content: "Chemical burns require prolonged irrigation (20+ min). Thermal burns from industrial processes (Ref. 1230 Burn protocol)." },
            { title: "Crush Injury", content: "Heavy machinery, equipment failure. Prolonged entrapment risk for crush syndrome (Ref. 1260)." },
            { title: "Inhalation Injury", content: "Smoke, chemical vapors, toxic gases. High-flow oxygen, consider bronchodilators, monitor for respiratory failure." }
        ]},
        { type: "accordion", title: "Mass Casualty Decontamination", items: [
            { title: "Rapid Decon", content: "Large numbers of contaminated patients require rapid mass decontamination. Ambulatory patients self-decontaminate through ladder pipe shower." },
            { title: "Non-Ambulatory", content: "Non-ambulatory patients require assisted decontamination on backboard through decon corridor." },
            { title: "Triage", content: "Decontamination before medical triage. Reverse triage - ambulatory patients (walking wounded) decontaminated first to clear scene faster." },
            { title: "Hospital Notification", content: "Notify receiving hospitals early to prepare decontamination facilities and prevent hospital contamination." }
        ]},
        { type: "warning", content: "NEVER enter HAZMAT hot or warm zones without proper Level A or B PPE and HAZMAT training. Contaminated patients must be decontaminated before EMS treatment or transport." }
    ]
  },
  {
    id: "839", refNo: "Ref. 839", title: "Mass Gathering and Special Event EMS", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "festival", color: "purple",
    sections: [
        { type: "header", items: [{ title: "Mass Gathering EMS", subtitle: "Ref. 839" }] },
        { type: "text", title: "Purpose", content: "Mass gathering events (concerts, festivals, sporting events, parades) require specialized EMS planning and medical support to manage predictable patient volumes and event-specific medical issues." },
        { type: "accordion", title: "Event Medical Planning", items: [
            { title: "Risk Assessment", content: "Assess event characteristics: attendance, duration, venue type (indoor/outdoor), weather forecast, crowd demographics, alcohol availability, event type (concert, sports, religious)." },
            { title: "Medical Resources", content: "Calculate required medical resources based on patient presentation rate (PPR). Typical PPR: 1-2 patients per 1000 attendees. High-risk events (rock concerts, extreme heat) may be 5+ per 1000." },
            { title: "Treatment Areas", content: "Establish first aid stations, medical tents, or dedicated medical treatment areas. Stock with BLS/ALS supplies, cots, hydration." },
            { title: "Ambulance Staging", content: "Stage dedicated ambulances on-site or nearby for rapid transport of critical patients. Coordinate with 911 system." }
        ]},
        { type: "list", title: "Common Mass Gathering Medical Issues", items: [
            { title: "Heat Illness", content: "Outdoor summer events - heat exhaustion and heat stroke common. Cooling stations, hydration, shade areas. (Ref. 1273 Heat Illness)." },
            { title: "Alcohol Intoxication", content: "Events with alcohol - intoxication, trauma from falls, altered mental status. Monitor for aspiration, withdrawal." },
            { title: "Drug Overdose", content: "Music festivals/raves - MDMA, stimulants, hallucinogens. Hyperthermia, serotonin syndrome, sympathomimetic toxicity. Naloxone for opioids." },
            { title: "Traumatic Injuries", content: "Crowd crush, falls, fights, trip/falls. Fractures, lacerations, head injuries." },
            { title: "Medical Emergencies", content: "Cardiac arrest, chest pain, respiratory distress occur at baseline population rate regardless of event type." }
        ]},
        { type: "accordion", title: "Operational Considerations", items: [
            { title: "Medical Command", content: "Designate Medical Group Supervisor for event medical operations. Coordinates treatment areas, ambulance transport, hospital notifications." },
            { title: "Documentation", content: "Document all patient contacts with PCR or event medical record. Maintain patient tracking log." },
            { title: "Refusals", content: "High volume of minor care and refusals. Follow standard refusal protocol (Ref. 828) but may use abbreviated documentation for minor complaints." },
            { title: "Communications", content: "Dedicated radio channel for event medical. Coordinate with event security, fire department, law enforcement." },
            { title: "Hospital Coordination", content: "Notify area hospitals of event and potential for increased ED volume. Distribute transports to avoid overwhelming single facility." }
        ]},
        { type: "list", title: "Special Event Types", items: [
            { title: "Concerts/Festivals", content: "High PPR, heat illness, alcohol/drugs, crowd crush. Dense crowd delays access. Dedicated extraction teams." },
            { title: "Sporting Events", content: "Moderate PPR, trauma, cardiac events. Cold weather events - hypothermia. Heat events - heat illness." },
            { title: "Marathons/Endurance", content: "Dehydration, heat illness, hyponatremia, cardiac arrest. Medical aid stations along route. Finish line medical tent." },
            { title: "Protests/Demonstrations", content: "Variable risk. Potential for civil unrest, chemical agents (tear gas, pepper spray), trauma. Stage safely, coordinate with law enforcement." }
        ]},
        { type: "warning", content: "Mass gathering incidents can rapidly overwhelm EMS resources. Early recognition and MCI declaration critical. Implement triage and surge capacity plans." }
    ]
  },
  {
    id: "840", refNo: "Ref. 840", title: "Inter-facility Critical Care Transport Standards", category: "Policies", type: "Policy", lastUpdated: "2024", icon: "local_shipping", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Critical Care Transport", subtitle: "Ref. 840" }] },
        { type: "text", title: "Purpose", content: "Inter-facility transport of critically ill or injured patients requires higher level of care than standard paramedic transport. Critical Care Transport (CCT) provides ICU-level care during transport." },
        { type: "list", title: "CCT Indications", items: [
            { title: "Mechanical Ventilation", content: "Patients on ventilators requiring advanced settings, high PEEP, complex modes beyond basic paramedic capability." },
            { title: "Vasoactive Medications", content: "Continuous infusions of vasopressors or inotropes (dopamine, norepinephrine, epinephrine, dobutamine)." },
            { title: "Specialty Devices", content: "Intra-aortic balloon pump (IABP), ventricular assist device (VAD), ECMO, continuous renal replacement therapy (CRRT)." },
            { title: "High-Risk Patients", content: "Unstable airway, hemodynamic instability, complex cardiac arrhythmias, neurological deterioration." }
        ]},
        { type: "accordion", title: "CCT Provider Qualifications", items: [
            { title: "Critical Care Paramedic", content: "Paramedic with additional critical care training and certification (FP-C or CCP-C). Advanced pharmacology, hemodynamic monitoring, ventilator management." },
            { title: "Registered Nurse", content: "Critical care or emergency department RN with transport experience. ICU skills and advanced medication knowledge." },
            { title: "Respiratory Therapist", content: "For complex ventilator patients, RT may accompany with RN or paramedic." },
            { title: "Physician", content: "Extremely critical patients or specialized procedures may require physician to accompany transport (fellow, attending)." }
        ]},
        { type: "list", title: "CCT Equipment Requirements", items: [
            { title: "Advanced Monitor", content: "Cardiac monitor with invasive pressure monitoring capability (arterial line, central venous pressure, pulmonary artery pressure)." },
            { title: "Transport Ventilator", content: "Full-featured transport ventilator with multiple modes (assist-control, SIMV, pressure support, PEEP)." },
            { title: "Infusion Pumps", content: "Multiple IV pumps for precise medication delivery. Battery backup for duration of transport." },
            { title: "Medications", content: "Expanded formulary including sedatives (propofol, midazolam), vasopressors, antiarrhythmics." },
            { title: "Airway Equipment", content: "Advanced airway kit with video laryngoscopy, difficult airway equipment, backup supraglottic devices." }
        ]},
        { type: "accordion", title: "CCT Transfer Process", items: [
            { title: "Physician Coordination", content: "Sending and receiving physicians coordinate transfer. Sending physician provides orders and medical summary." },
            { title: "Sending Facility Report", content: "Obtain complete report from ICU nurse/physician: diagnosis, history, current treatments, drips and rates, vent settings, recent labs/imaging, anticipated problems." },
            { title: "Pre-Transport Stabilization", content: "Stabilize patient before departure. Secure airway, hemodynamic optimization, adequate IV access, appropriate sedation/analgesia." },
            { title: "Medication Preparation", content: "Ensure adequate medication supply for transport duration + 1 hour reserve. Pre-mix drips, label syringes clearly." },
            { title: "Equipment Check", content: "Verify all equipment functional and batteries charged. Oxygen supply sufficient for transport + 1 hour." },
            { title: "Family Communication", content: "Inform family of transfer plan, destination, expected arrival time, who to contact." }
        ]},
        { type: "list", title: "In-Transport Monitoring", items: [
            { title: "Continuous Assessment", content: "Monitor vital signs continuously. Assess airway, breathing, perfusion, mental status, devices every 5-15 minutes." },
            { title: "Ventilator Monitoring", content: "Monitor ventilator parameters, waveforms, capnography. Adjust settings as needed for adequate oxygenation/ventilation." },
            { title: "Medication Management", content: "Titrate vasoactive drips to maintain target blood pressure. Adjust sedation to keep patient comfortable but assessable." },
            { title: "Complication Recognition", content: "Anticipate and recognize transport complications: equipment malfunction, hemodynamic deterioration, ventilator dysynchrony, line/tube dislodgement." },
            { title: "Communication", content: "Maintain radio contact with sending and receiving facilities. Report significant changes or complications." }
        ]},
        { type: "accordion", title: "Common CCT Complications", items: [
            { title: "Ventilator Issues", content: "Tube obstruction, circuit disconnect, ventilator malfunction. Always carry manual resuscitation bag as backup." },
            { title: "Hemodynamic Instability", content: "Hypotension from sedation, hypovolemia, medication errors. Vasopressor adjustment, fluid bolus, troubleshoot." },
            { title: "IV/Line Problems", content: "Infiltrated IV, disconnected tubing, air in line. Maintain multiple IV access points. Check connections frequently." },
            { title: "Agitation/Dysynchrony", content: "Patient fighting ventilator, pulling at lines. Increase sedation, consider paralysis if severe." },
            { title: "Cardiac Arrest", content: "Initiate ACLS immediately. Manual ventilation, chest compressions. Notify receiving facility, consider closest ED." }
        ]},
        { type: "warning", content: "CCT requires specialized training beyond standard paramedic scope. Do not accept CCT transfers that exceed your clinical capabilities. Request higher level of care (RN, RT, MD) when needed." }
    ]
  }
];
