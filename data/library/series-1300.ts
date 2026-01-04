
import { Protocol } from '../../types';

export const series1300: Protocol[] = [
  {
    id: "1301", refNo: "Ref. 1301", title: "General Medical Control Guidelines", category: "General Medical", type: "Medical Control", lastUpdated: "2024", icon: "stethoscope", color: "blue",
    sections: [
      { type: "header", items: [{ title: "General Medical Control", subtitle: "Ref. 1301" }] },
      { type: "text", title: "Purpose", content: "Establish framework for medical direction, oversight, and quality assurance in the LA County EMS system. Define roles and responsibilities for base hospital physicians, paramedics, and EMS personnel." },
      { type: "text", title: "Medical Control Authority", content: "Base hospital physicians provide online medical direction for paramedic care. Authority includes approving medications, procedures, and destination decisions. Physicians may modify or override standing orders based on patient-specific factors." },
      { type: "list", title: "Indications for Base Contact", items: [
        { title: "Required Base Contact", content: "Termination of resuscitation, pronouncement of death in field, medication orders beyond standing protocols, destination diversions, patient refusal against medical advice." },
        { title: "Optional Base Contact", content: "Complex patient presentations, multiple treatment options, unclear protocol application, quality improvement feedback." }
      ]},
      { type: "text", title: "Standing Orders vs Base Contact", content: "Paramedics may administer approved medications and perform procedures under standing orders without base contact when patient meets clear protocol criteria. Documentation must support clinical decision-making." },
      { type: "warning", content: "When patient presentation is atypical or protocols unclear, contact base hospital before proceeding. Medical control physician has final authority." },
      { type: "list", title: "QA Process", items: [
        { title: "Chart Review", content: "All ALS patient contacts reviewed for protocol compliance, documentation quality, and clinical appropriateness." },
        { title: "Performance Improvement", content: "Feedback provided to paramedics and agencies. Trending analysis identifies system-wide training needs." }
      ]}
    ]
  },
  {
    id: "1302", refNo: "Ref. 1302", title: "Airway Management and Monitoring", category: "General Medical", type: "Medical Control", lastUpdated: "2024", icon: "pulmonology", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Airway MCG", subtitle: "Ref. 1302" }] },
      { type: "text", title: "Purpose", content: "Medical control guidelines for advanced airway management including endotracheal intubation, supraglottic airways, surgical airways, and airway adjuncts." },
      { type: "list", title: "Airway Assessment", items: [
        { title: "Indications for Advanced Airway", content: "Cardiac arrest, respiratory failure, inability to protect airway, anticipated clinical deterioration, facial trauma preventing BVM." },
        { title: "Predictors of Difficult Airway", content: "Limited mouth opening, short neck, obesity, facial trauma, foreign body obstruction, anatomical abnormalities." }
      ]},
      { type: "list", title: "Airway Device Selection", items: [
        { title: "Endotracheal Intubation", content: "Gold standard for definitive airway. Sedation with Midazolam for conscious patients when indicated. Video laryngoscopy preferred when available." },
        { title: "Supraglottic Airways", content: "King LT, i-gel, or LMA as alternative when ETI unsuccessful or inappropriate. Faster placement, less training required." },
        { title: "Rescue Devices", content: "Bougie for difficult intubation. Consider supraglottic airway for failed intubation." }
      ]},
      { type: "warning", content: "Maximum 2 intubation attempts or 30 seconds per attempt. Return to BVM ventilation between attempts. Consider supraglottic airway after failed attempts." },
      { type: "list", title: "Confirmation and Monitoring", items: [
        { title: "Primary Confirmation", content: "Direct visualization of tube passing through cords, continuous waveform capnography with ETCO2 35-45 mmHg." },
        { title: "Secondary Confirmation", content: "Bilateral breath sounds, chest rise, absence of gastric sounds, oxygen saturation maintenance." }
      ]},
      { type: "text", title: "Post-Intubation Care", content: "Secure tube at cm marking documented. Continuous waveform capnography mandatory. Reassess tube position after every move. Target ETCO2 35-40 mmHg in most patients, 30-35 mmHg in head injury." }
    ]
  },
  {
    id: "1303", refNo: "Ref. 1303", title: "Airway Management Medical Control", category: "General Medical", type: "Medical Control", lastUpdated: "2024", icon: "pulmonology", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Airway Management MCG", subtitle: "Ref. 1303" }] },
      { type: "text", title: "Purpose", content: "Replaces previous 1303. Medical control guidelines for advanced airway management including endotracheal intubation, supraglottic airways, surgical airways, and RSI procedures." },
      { type: "list", title: "Indications for Advanced Airway", items: [
        { title: "Cardiac Arrest", content: "After initial BVM ventilation and CPR established. Do not delay compressions for intubation." },
        { title: "Respiratory Failure", content: "Inadequate oxygenation/ventilation despite BVM, anticipated deterioration during transport." },
        { title: "Airway Protection", content: "Decreased LOC (GCS ≤8), inability to protect airway, risk of aspiration." }
      ]},
      { type: "warning", content: "BVM with OPA/NPA is acceptable airway management. Advanced airway is NOT required for every cardiac arrest or altered patient." }
    ]
  },
  {
    id: "1304", refNo: "Ref. 1304", title: "Ventilation Management Medical Control", category: "General Medical", type: "Medical Control", lastUpdated: "2024", icon: "air", color: "cyan",
    sections: [
      { type: "header", items: [{ title: "Ventilation Management MCG", subtitle: "Ref. 1304" }] },
      { type: "text", title: "Purpose", content: "Guidelines for mechanical ventilation in intubated patients, CPAP/BiPAP use, and ventilation strategies for specific conditions." },
      { type: "list", title: "Ventilation Parameters", items: [
        { title: "Normal Patient", content: "Rate 10-12/min adults, Tidal volume 6-8 mL/kg ideal body weight, ETCO2 target 35-40 mmHg." },
        { title: "Head Injury", content: "Rate 10-12/min, ETCO2 target 30-35 mmHg. Avoid hyperventilation except for signs of herniation." },
        { title: "COPD/Asthma", content: "Allow adequate expiratory time. Avoid breath stacking. Lower rate 8-10/min may be needed." },
        { title: "Cardiac Arrest", content: "10 breaths/min, minimize interruptions to compressions, avoid hyperventilation." }
      ]},
      { type: "warning", content: "Hyperventilation causes decreased cerebral perfusion and worse outcomes. Monitor ETCO2 continuously and adjust rate accordingly." }
    ]
  },
  {
    id: "1305", refNo: "Ref. 1305", title: "Vascular Access Medical Control", category: "Procedures", type: "Medical Control", lastUpdated: "2024", icon: "vaccines", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Vascular Access MCG", subtitle: "Ref. 1305" }] },
      { type: "text", title: "Purpose", content: "Medical control guidelines for IV, IO, and central line access. Site selection, troubleshooting, and fluid administration principles." },
      { type: "list", title: "Access Route Selection", items: [
        { title: "Peripheral IV", content: "First line for stable patients. 18-20g preferred for adults. Antecubital, forearm, hand sites." },
        { title: "Intraosseous (IO)", content: "First line for cardiac arrest, second line after failed IV attempts. Proximal tibia, proximal humerus, distal femur sites." },
        { title: "External Jugular", content: "Alternative when peripheral access difficult. Requires patient positioning and skill." }
      ]},
      { type: "list", title: "Fluid Administration", items: [
        { title: "Crystalloid", content: "Normal Saline preferred for most indications. Avoid excessive fluid in CHF, pulmonary edema, head injury." },
        { title: "Hypotension/Shock", content: "250-500 mL boluses, reassess after each bolus. Target SBP >90 mmHg in trauma, >100 mmHg in medical." },
        { title: "Medication Delivery", content: "Saline lock acceptable if no fluid indication. Flush after medication administration." }
      ]}
    ]
  },
  {
    id: "1306", refNo: "Ref. 1306", title: "Cardiac Care Medical Control", category: "Cardiovascular", type: "Medical Control", lastUpdated: "2024", icon: "ecg_heart", color: "red",
    sections: [
      { type: "header", items: [{ title: "Cardiac Care MCG", subtitle: "Ref. 1306" }] },
      { type: "text", title: "Purpose", content: "Medical control guidelines for cardiac emergencies: chest pain, ACS, dysrhythmias, cardiac arrest, and cardiogenic shock." },
      { type: "list", title: "Acute Coronary Syndrome", items: [
        { title: "12-Lead ECG", content: "Obtain within 10 minutes of patient contact. Repeat if symptoms change. Pre-hospital STEMI notification." },
        { title: "Medication Sequence", content: "Aspirin 324mg chewed, Nitroglycerin 0.4mg SL (if SBP >100), consider Fentanyl for pain control." },
        { title: "STEMI Destination", content: "Direct transport to PCI-capable facility when STEMI criteria met and within system time standards." }
      ]},
      { type: "list", title: "Cardiac Arrest", items: [
        { title: "High-Quality CPR", content: "Compressions 100-120/min, depth 2-2.4 inches, minimize interruptions. Continuous capnography." },
        { title: "Rhythm Analysis", content: "Every 2 minutes. Defibrillation for VF/pVT. Epinephrine 1mg q3-5min. Amiodarone 300mg then 150mg for refractory VF/VT." },
        { title: "Reversible Causes", content: "Search for and treat H's and T's. Consider ultrasound if available." }
      ]}
    ]
  },
  {
    id: "1307", refNo: "Ref. 1307", title: "Medication Administration Medical Control", category: "General Medical", type: "Medical Control", lastUpdated: "2024", icon: "medication", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Medication Administration MCG", subtitle: "Ref. 1307" }] },
      { type: "text", title: "Purpose", content: "Safe medication administration practices including six rights, dosing calculations, route selection, and error prevention." },
      { type: "list", title: "Six Rights of Medication Administration", items: [
        { title: "Right Patient", content: "Verify patient identity. Match medication order to patient presentation and assessment findings." },
        { title: "Right Drug", content: "Verify medication name, concentration. Check expiration date. Inspect for discoloration or particles." },
        { title: "Right Dose", content: "Calculate dose based on patient weight when indicated. Use appropriate measuring devices. Double-check high-risk medications." },
        { title: "Right Route", content: "Verify route is appropriate for medication and patient condition. IV/IO/IM/IN/PO/SL as ordered." },
        { title: "Right Time", content: "Administer at appropriate interval. Monitor for onset and duration of effect." },
        { title: "Right Documentation", content: "Document medication, dose, route, time, patient response. Include vital signs before and after." }
      ]},
      { type: "warning", content: "High-risk medications require independent double-check: Epinephrine concentrations (1:1000 vs 1:10,000), paralytics, pediatric doses." }
    ]
  },
  {
    id: "1308", refNo: "Ref. 1308", title: "Pain Management Medical Control", category: "General Medical", type: "Medical Control", lastUpdated: "2024", icon: "healing", color: "purple",
    sections: [
      { type: "header", items: [{ title: "Pain Management MCG", subtitle: "Ref. 1308" }] },
      { type: "text", title: "Purpose", content: "Pain assessment and management guidelines including analgesic selection, dosing, monitoring, and safety considerations." },
      { type: "list", title: "Pain Assessment", items: [
        { title: "Pain Scale", content: "0-10 numeric scale for adults, FLACC or Wong-Baker for pediatrics. Reassess after each intervention." },
        { title: "Characteristics", content: "Location, quality, radiation, severity, onset, duration, alleviating/aggravating factors." }
      ]},
      { type: "list", title: "Analgesic Selection", items: [
        { title: "Fentanyl", content: "First-line opioid. 1 mcg/kg IV/IN. Rapid onset, short duration. Titrate to effect. Fewer hemodynamic effects than morphine." },
        { title: "Morphine", content: "Alternative opioid. 0.1 mg/kg IV. Longer duration. May cause hypotension and histamine release." },
        { title: "Ketorolac", content: "NSAID for moderate pain. 15-30mg IV/IM. Contraindicated in GI bleeding, renal disease, pregnancy. Age >65 use 15mg dose." }
      ]},
      { type: "warning", content: "Monitor respiratory rate and SpO2 after opioid administration. Naloxone readily available. Avoid masking pain that requires surgical evaluation (e.g., acute abdomen)." }
    ]
  },
  {
    id: "1309", refNo: "Ref. 1309", title: "Pediatric Care Medical Control", category: "Pediatric", type: "Medical Control", lastUpdated: "2024", icon: "child_care", color: "purple",
    sections: [
      { type: "header", items: [{ title: "Pediatric Care MCG", subtitle: "Ref. 1309" }] },
      { type: "text", title: "Purpose", content: "Age-specific medical control guidelines for pediatric patients including assessment, medication dosing, equipment sizing, and family-centered care." },
      { type: "list", title: "Pediatric Assessment", items: [
        { title: "Pediatric Assessment Triangle", content: "Appearance, Work of Breathing, Circulation to Skin. Rapid general impression before detailed exam." },
        { title: "Vital Signs by Age", content: "Newborn HR 120-160, Infant HR 100-160, Child HR 70-120, Adolescent HR 60-100. RR decreases with age. BP increases with age." },
        { title: "Weight Estimation", content: "Age-based: (Age × 2) + 8 = kg. Length-based tape (Broselow) preferred when available." }
      ]},
      { type: "list", title: "Medication Dosing", items: [
        { title: "Weight-Based Dosing", content: "Most pediatric medications dosed per kg. Maximum dose caps prevent overdose. Use Broselow tape or length-based dosing guide." },
        { title: "High-Risk Medications", content: "Epinephrine, RSI drugs, sedatives require double-check of weight and calculation. Pre-calculated doses reduce errors." }
      ]},
      { type: "text", title: "Family-Centered Care", content: "Allow parent presence during procedures when safe. Explain procedures in age-appropriate language. Minimize parent-child separation. Consider child life specialist at receiving facility." }
    ]
  },
  {
    id: "1310", refNo: "Ref. 1310", title: "OB/GYN Medical Control", category: "OB/GYN", type: "Medical Control", lastUpdated: "2024", icon: "pregnant_woman", color: "pink",
    sections: [
      { type: "header", items: [{ title: "OB/GYN MCG", subtitle: "Ref. 1310" }] },
      { type: "text", title: "Purpose", content: "Medical control guidelines for obstetrical emergencies including pre-eclampsia, eclampsia, vaginal bleeding, and emergency delivery." },
      { type: "list", title: "Pregnancy-Related Emergencies", items: [
        { title: "Pre-eclampsia/Eclampsia", content: "SBP >160 or DBP >110 after 20 weeks gestation. Seizure activity = eclampsia. Magnesium sulfate 4g IV over 20min. Left lateral tilt positioning." },
        { title: "Vaginal Bleeding", content: "Obtain pad count, clot size. Never perform vaginal exam if bleeding. Consider placenta previa, abruption. Rapid transport for severe bleeding." },
        { title: "Imminent Delivery", content: "Prepare for field delivery if crowning or delivery imminent. Do not delay transport for stable labor." }
      ]},
      { type: "list", title: "Emergency Delivery", items: [
        { title: "Newborn Care", content: "Warm, dry, stimulate. Suction mouth then nose. APGAR at 1 and 5 minutes. Initiate NRP if needed." },
        { title: "Post-Delivery", content: "Monitor for postpartum hemorrhage. Fundal massage. Consider oxytocin for hemorrhage. Deliver placenta if occurs, transport with mother." }
      ]}
    ]
  },
  {
    id: "1311", refNo: "Ref. 1311", title: "Behavioral Health Medical Control", category: "Behavioral", type: "Medical Control", lastUpdated: "2024", icon: "psychology", color: "teal",
    sections: [
      { type: "header", items: [{ title: "Behavioral Health MCG", subtitle: "Ref. 1311" }] },
      { type: "text", title: "Purpose", content: "Medical control guidelines for psychiatric emergencies, agitation, violent behavior, and medical clearance for behavioral patients." },
      { type: "list", title: "Medical Clearance", items: [
        { title: "Exclude Medical Causes", content: "Hypoglycemia, hypoxia, head injury, infection, toxicity, metabolic derangement must be ruled out before attributing to psychiatric cause." },
        { title: "Vital Signs", content: "Obtain full set including temperature, blood glucose. Abnormal vitals suggest medical rather than purely psychiatric emergency." }
      ]},
      { type: "list", title: "Agitation Management", items: [
        { title: "Verbal De-escalation", content: "First-line approach. Calm voice, non-threatening posture, give space, avoid confrontation. Remove stimuli." },
        { title: "Chemical Restraint", content: "Midazolam 5mg IM for severe agitation. May repeat in 10 minutes if needed. Or Olanzapine 10mg IM." },
        { title: "Physical Restraint", content: "Last resort with adequate personnel. Avoid prone positioning. Monitor airway and breathing. Consider chemical sedation if prolonged restraint needed." }
      ]},
      { type: "warning", content: "Excited delirium is medical emergency. Risk of sudden cardiac arrest. Recognize: hyperthermia, agitation, superhuman strength, incoherent speech. Sedate quickly, cool patient, transport emergently." }
    ]
  },
  {
    id: "1312", refNo: "Ref. 1312", title: "Trauma Medical Control", category: "Trauma", type: "Medical Control", lastUpdated: "2024", icon: "personal_injury", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Trauma MCG", subtitle: "Ref. 1312" }] },
      { type: "text", title: "Purpose", content: "Medical control for trauma including triage, hemorrhage control, trauma destination decisions, and special trauma situations." },
      { type: "list", title: "Trauma Triage", items: [
        { title: "Step 1: Vital Signs", content: "SBP <90, RR <10 or >29, GCS ≤13 → Trauma Center" },
        { title: "Step 2: Anatomy of Injury", content: "Penetrating torso/neck/head, flail chest, pelvic fracture, amputation, paralysis → Trauma Center" },
        { title: "Step 3: Mechanism", content: "Falls >20 feet, high-speed MVC, ejection, death in same vehicle, pedestrian struck → Consider Trauma Center" },
        { title: "Step 4: Special Considerations", content: "Age >55 or <15, anticoagulation, pregnancy >20 weeks, EMS provider judgment → Consider Trauma Center" }
      ]},
      { type: "list", title: "Hemorrhage Control", items: [
        { title: "External Hemorrhage", content: "Direct pressure first. Tourniquet for life-threatening extremity hemorrhage. Hemostatic gauze for junctional hemorrhage. TXA 1g IV for major trauma." },
        { title: "Internal Hemorrhage", content: "Rapid transport. Pelvic binder for unstable pelvis. Permissive hypotension (SBP 80-90) if no head injury. Limit crystalloid resuscitation." }
      ]},
      { type: "text", title: "Tranexamic Acid", content: "1 gram IV over 10 minutes for major trauma within 3 hours of injury. Second dose 1 gram over 8 hours at hospital. Improves mortality in hemorrhagic shock." }
    ]
  },
  {
    id: "1313", refNo: "Ref. 1313", title: "Environmental Medical Control", category: "Environmental", type: "Medical Control", lastUpdated: "2024", icon: "thermostat", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Environmental MCG", subtitle: "Ref. 1313" }] },
      { type: "text", title: "Purpose", content: "Medical control for environmental emergencies: heat illness, hypothermia, drowning, electrical injury, and altitude illness." },
      { type: "list", title: "Heat-Related Illness", items: [
        { title: "Heat Exhaustion", content: "Core temp <104°F. Nausea, weakness, dizziness. Treatment: Move to cool environment, oral hydration if alert, IV fluids." },
        { title: "Heat Stroke", content: "Core temp >104°F, altered mental status. MEDICAL EMERGENCY. Aggressive cooling: Remove clothing, mist and fan, ice packs to neck/axilla/groin. Rapid transport." }
      ]},
      { type: "list", title: "Hypothermia", items: [
        { title: "Mild (32-35°C)", content: "Shivering, tachycardia, tachypnea. Remove wet clothing, passive rewarming, warm fluids PO if alert." },
        { title: "Moderate (28-32°C)", content: "Shivering stops, bradycardia, hypotension, altered mental status. Active external rewarming, warm IV fluids." },
        { title: "Severe (<28°C)", content: "Coma, absent reflexes, ventricular arrhythmias. Gentle handling, avoid jostling. CPR if no pulse after 30-45 seconds. 'Not dead until warm and dead.'" }
      ]},
      { type: "warning", content: "Hypothermic patients in cardiac arrest: Continue resuscitation during transport and rewarming. Consider withholding medications until core temp >30°C. Transport to facility capable of ECMO rewarming." }
    ]
  },
  {
    id: "1314", refNo: "Ref. 1314", title: "Toxicology Medical Control", category: "Toxicology", type: "Medical Control", lastUpdated: "2024", icon: "science", color: "green",
    sections: [
      { type: "header", items: [{ title: "Toxicology MCG", subtitle: "Ref. 1314" }] },
      { type: "text", title: "Purpose", content: "Medical control for poisoning and overdose including specific antidotes, toxic syndromes, and decontamination." },
      { type: "list", title: "Toxidromes", items: [
        { title: "Opioid", content: "Respiratory depression, miosis, decreased LOC. Naloxone 0.4-2mg IV/IM/IN. Goal: Adequate respirations, not full consciousness." },
        { title: "Sympathomimetic", content: "Tachycardia, hypertension, hyperthermia, agitation, mydriasis. Cocaine, methamphetamine. Benzodiazepines for agitation/seizures." },
        { title: "Anticholinergic", content: "'Mad as a hatter, red as a beet, dry as a bone, blind as a bat, hot as a hare.' Supportive care, cooling, benzodiazepines for agitation." },
        { title: "Cholinergic", content: "SLUDGE: Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis. Organophosphate poisoning. Atropine 2-5mg IV, DuoDote for severe cases." }
      ]},
      { type: "list", title: "Specific Antidotes", items: [
        { title: "Naloxone", content: "Opioid antagonist. 0.4-2mg IV/IN/IM. Repeat dosing may be needed for long-acting opioids." },
        { title: "Glucagon", content: "Beta-blocker or calcium channel blocker overdose. 3-5mg IV for toxicologic indication (higher than hypoglycemia dose)." },
        { title: "Hydroxocobalamin", content: "Cyanide poisoning (house fire, industrial exposure). 5 grams IV over 15 minutes." },
        { title: "DuoDote", content: "Organophosphate/nerve agent exposure. Atropine 2.1mg + Pralidoxime 600mg auto-injector IM." }
      ]},
      { type: "text", title: "Poison Control", content: "1-800-222-1222 available 24/7 for toxicology consultation. Provide patient age, substance, amount, time, symptoms. Can guide antidote use and disposition." }
    ]
  },
  {
    id: "1315", refNo: "Ref. 1315", title: "Geriatric Medical Control", category: "General Medical", type: "Medical Control", lastUpdated: "2024", icon: "elderly", color: "purple",
    sections: [
      { type: "header", items: [{ title: "Geriatric MCG", subtitle: "Ref. 1315" }] },
      { type: "text", title: "Purpose", content: "Medical control guidelines for geriatric patients including age-related physiologic changes, medication considerations, and fall assessment." },
      { type: "list", title: "Age-Related Considerations", items: [
        { title: "Cardiovascular", content: "Decreased cardiac reserve, blunted HR response. Beta blockers prevent tachycardia. Atypical presentation of ACS." },
        { title: "Respiratory", content: "Decreased lung compliance, weaker cough. Higher risk of pneumonia and respiratory failure." },
        { title: "Medication Sensitivity", content: "Reduced renal/hepatic clearance. Start low, go slow with medication dosing. Consider 50% dose reduction for opioids, sedatives." }
      ]},
      { type: "list", title: "Fall Assessment", items: [
        { title: "Injury Assessment", content: "Head injury, hip fracture, spinal injury. Low threshold for c-spine precautions. Anticoagulants increase bleeding risk." },
        { title: "Cause of Fall", content: "Syncope, stroke, seizure, infection, medication effect. Vital signs, glucose, ECG. Fall is symptom, not diagnosis." }
      ]},
      { type: "text", title: "Polypharmacy", content: "Obtain medication list. Reconcile with patient history. Consider adverse drug reactions, drug-drug interactions, medication non-compliance as cause of presentation." }
    ]
  },
  {
    id: "1316", refNo: "Ref. 1316", title: "Base Hospital Contact Guidelines", category: "Base Hospital", type: "Guideline", lastUpdated: "2024", icon: "call", color: "blue",
    sections: [{ type: "text", title: "Purpose", content: "Indications for base hospital contact, communication procedures, and standing order versus base contact decision making." }]
  },
  {
    id: "1317", refNo: "Ref. 1317", title: "Drug Reference - Table of Contents", category: "Pharmacology", type: "Reference", lastUpdated: "2024", icon: "menu_book", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Drug Reference", subtitle: "Ref. 1317" }] },
        { type: "list", title: "References", items: [
            { title: "1317.1 Adenosine", content: "" },
            { title: "1317.3 Albuterol", content: "" },
            { title: "1317.5 Amiodarone", content: "" },
            { title: "1317.7 Aspirin", content: "" },
            { title: "1317.9 Atropine", content: "" },
            { title: "1317.11 Calcium Chloride", content: "" },
            { title: "1317.13 Dextrose", content: "" },
            { title: "1317.15 Diphenhydramine", content: "" },
            { title: "1317.17 Epinephrine", content: "" },
            { title: "1317.19 Fentanyl", content: "" },
            { title: "1317.21 Glucagon", content: "" },
            { title: "1317.22 Ketorolac", content: "" },
            { title: "1317.23 Lidocaine", content: "" },
            { title: "1317.25 Midazolam", content: "" },
            { title: "1317.27 Morphine Sulfate", content: "" },
            { title: "1317.29 Naloxone", content: "" },
            { title: "1317.31 Nitroglycerin", content: "" },
            { title: "1317.33 Ondansetron", content: "" },
            { title: "1317.35 Oxygen", content: "" },
            { title: "1317.37 Pralidoxime (DuoDote)", content: "" },
            { title: "1317.39 Sodium Bicarbonate", content: "" }
        ]}
    ]
  },
  {
    id: "1317.1", refNo: "Ref. 1317.1", title: "Adenosine", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication_liquid", color: "indigo",
    sections: [
      { type: "header", items: [{ title: "Adenosine", subtitle: "Ref. 1317.1" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Antiarrhythmic, endogenous nucleoside" },
        { title: "Mechanism", content: "Slows conduction through AV node, interrupts reentry pathways. Causes transient AV block. Extremely short half-life (<10 seconds)." },
        { title: "Indications", content: "Stable narrow-complex supraventricular tachycardia (SVT) with regular rhythm" },
        { title: "Contraindications", content: "2nd or 3rd degree AV block, sick sinus syndrome, known WPW with atrial fibrillation, bronchospasm/asthma (relative)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "6 mg rapid IV/IO push followed by 20 mL saline flush, elevate arm. May repeat 12 mg x 2 if no response after 1-2 minutes." },
        { title: "Pediatric Dose", content: "0.1 mg/kg (max 6 mg) rapid IV/IO push with flush. Second dose 0.2 mg/kg (max 12 mg)." },
        { title: "Route", content: "IV/IO only. Must be rapid push (<3 seconds) via proximal port with immediate flush." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "10-20 seconds" },
        { title: "Duration", content: "<10 seconds due to rapid metabolism" },
        { title: "Side Effects", content: "Transient asystole, facial flushing, chest tightness, dyspnea, sense of impending doom (very brief). Warn patient before administration." }
      ]},
      { type: "warning", content: "Rhythm strip must be running during administration to capture conversion or identify rhythm. Brief asystole is expected. Have defibrillator ready." },
      { type: "text", title: "Preparation", content: "6 mg/2 mL vial. Draw up full dose, have second dose ready. Ensure large bore IV closest to heart. Prime extension tubing with adenosine so medication reaches circulation immediately." }
    ]
  },
  {
    id: "1317.2", refNo: "Ref. 1317.2", title: "Albuterol", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "air", color: "cyan",
    sections: [
      { type: "header", items: [{ title: "Albuterol", subtitle: "Ref. 1317.2" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Selective beta-2 adrenergic agonist, bronchodilator" },
        { title: "Mechanism", content: "Stimulates beta-2 receptors in bronchial smooth muscle causing bronchodilation. Also decreases mast cell degranulation." },
        { title: "Indications", content: "Bronchospasm: asthma, COPD exacerbation, reactive airway disease, anaphylaxis with wheezing" },
        { title: "Contraindications", content: "None in emergency. Use caution with tachycardia, cardiac disease." }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "2.5-5 mg (1-2 unit dose vials) via nebulizer. May repeat every 20 minutes. Continuous nebulization for severe bronchospasm." },
        { title: "Pediatric Dose", content: "2.5 mg via nebulizer. May repeat every 20 minutes. Weight <20 kg may use 1.25 mg." },
        { title: "Route", content: "Nebulized (preferred), MDI with spacer alternative" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "5-15 minutes" },
        { title: "Peak", content: "30-60 minutes" },
        { title: "Duration", content: "3-6 hours" },
        { title: "Side Effects", content: "Tachycardia, tremor, nervousness, hypokalemia. Generally well tolerated." }
      ]},
      { type: "text", title: "Preparation", content: "2.5 mg/3 mL unit dose vial. Connect to nebulizer with oxygen at 6-8 L/min. Patient should breathe normally through mouthpiece or mask." }
    ]
  },
  {
    id: "1317.3", refNo: "Ref. 1317.3", title: "Amiodarone", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "ecg_heart", color: "red",
    sections: [
      { type: "header", items: [{ title: "Amiodarone", subtitle: "Ref. 1317.3" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Class III antiarrhythmic" },
        { title: "Mechanism", content: "Blocks potassium channels, prolongs action potential and refractory period. Also has alpha/beta blocker properties." },
        { title: "Indications", content: "VF/pulseless VT (after defibrillation and epinephrine), stable VT, atrial fibrillation with RVR" },
        { title: "Contraindications", content: "Cardiogenic shock, marked sinus bradycardia, 2nd/3rd degree AV block (without pacemaker)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Cardiac Arrest (VF/VT)", content: "300 mg IV/IO push. Second dose 150 mg if persistent VF/VT." },
        { title: "Stable VT", content: "150 mg IV over 10 minutes. May repeat 150 mg every 10 minutes. Max 2.2 grams/24 hours." },
        { title: "Pediatric Dose", content: "5 mg/kg IV/IO bolus for cardiac arrest. Max 300 mg. May repeat up to 15 mg/kg total." },
        { title: "Route", content: "IV/IO. Use filter needle from vial. Flush line after." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "10-15 minutes" },
        { title: "Duration", content: "Variable, long half-life (weeks)" },
        { title: "Side Effects", content: "Hypotension (especially with rapid infusion), bradycardia, QT prolongation. Phlebitis if peripheral IV." }
      ]},
      { type: "warning", content: "Slow infusion for stable rhythms to minimize hypotension. May cause tissue necrosis if extravasation occurs. Foaming when mixed - allow bubbles to settle." },
      { type: "text", title: "Preparation", content: "150 mg/3 mL vial. Mix in D5W for infusion (not compatible with normal saline). For bolus, may give undiluted. Light sensitive - protect from light." }
    ]
  },
  {
    id: "1317.4", refNo: "Ref. 1317.4", title: "Aspirin", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "pill", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Aspirin (ASA)", subtitle: "Ref. 1317.4" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Antiplatelet agent, non-steroidal anti-inflammatory (NSAID)" },
        { title: "Mechanism", content: "Irreversibly inhibits cyclooxygenase, preventing platelet aggregation. Reduces mortality in acute coronary syndrome." },
        { title: "Indications", content: "Suspected cardiac chest pain, acute coronary syndrome, STEMI" },
        { title: "Contraindications", content: "Known aspirin allergy, active GI bleeding, hemophilia, recent stroke (relative)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "324 mg PO chewed (4 × 81mg baby aspirin or 1-2 × 162mg tablets)" },
        { title: "Pediatric Dose", content: "Not typically indicated in pediatric cardiac events. Consult medical control." },
        { title: "Route", content: "Oral - must be chewed, not swallowed whole" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "15-30 minutes (faster if chewed)" },
        { title: "Peak", content: "1-2 hours" },
        { title: "Duration", content: "Platelet inhibition lasts 7-10 days (life of platelet)" },
        { title: "Side Effects", content: "GI upset, bleeding, allergic reaction (rare)" }
      ]},
      { type: "text", title: "Administration", content: "Patient must chew tablets thoroughly for rapid absorption. May take with small amount of water. Do not give if already took aspirin today. Document time of last aspirin dose." }
    ]
  },
  {
    id: "1317.5", refNo: "Ref. 1317.5", title: "Atropine", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "heart_plus", color: "red",
    sections: [
      { type: "header", items: [{ title: "Atropine Sulfate", subtitle: "Ref. 1317.5" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Anticholinergic, parasympatholytic" },
        { title: "Mechanism", content: "Blocks acetylcholine at muscarinic receptors. Increases SA node rate, enhances AV node conduction, increases cardiac output." },
        { title: "Indications", content: "Symptomatic bradycardia, organophosphate/nerve agent poisoning, preparation for intubation (drying agent)" },
        { title: "Contraindications", content: "None in emergency. Avoid in hypothermic bradycardia, 2nd degree type II or 3rd degree AV block (may worsen)." }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Symptomatic Bradycardia", content: "0.5-1 mg IV/IO every 3-5 minutes. Max 3 mg total." },
        { title: "Organophosphate Poisoning", content: "2-5 mg IV/IO. Repeat 2 mg every 5-10 minutes until secretions dry. May require massive doses (>100 mg)." },
        { title: "Pediatric Dose", content: "0.02 mg/kg IV/IO (minimum 0.1 mg, maximum single dose 0.5 mg). May repeat to max 1 mg." },
        { title: "Route", content: "IV/IO preferred. IM/ET acceptable in chemical exposure when IV access delayed." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "1-2 minutes IV" },
        { title: "Duration", content: "2-6 hours" },
        { title: "Side Effects", content: "Tachycardia, dry mouth, blurred vision, urinary retention, confusion (especially elderly), pupil dilation" }
      ]},
      { type: "warning", content: "Doses <0.5 mg can cause paradoxical bradycardia. Atropine ineffective for infranodal blocks (wide QRS). Consider pacing instead. Tachycardia may worsen ischemia in ACS." },
      { type: "text", title: "Preparation", content: "1 mg/10 mL or 0.4 mg/mL concentration. For organophosphate poisoning, draw up multiple syringes in advance." }
    ]
  },
  {
    id: "1317.6", refNo: "Ref. 1317.6", title: "Calcium Chloride", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication_liquid", color: "indigo",
    sections: [
      { type: "header", items: [{ title: "Calcium Chloride", subtitle: "Ref. 1317.6" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Electrolyte, calcium salt" },
        { title: "Mechanism", content: "Essential for cardiac contractility, nerve transmission, muscle contraction. Stabilizes cardiac membranes. Antagonizes hyperkalemia and calcium channel blocker toxicity." },
        { title: "Indications", content: "Hyperkalemia with ECG changes, calcium channel blocker overdose, hypocalcemia, hypermagnesemia" },
        { title: "Contraindications", content: "Hypercalcemia, digitalis toxicity (relative), VF during cardiac arrest (no proven benefit)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "500 mg to 1 gram (5-10 mL of 10% solution) slow IV push over 5-10 minutes. May repeat as needed." },
        { title: "Pediatric Dose", content: "20 mg/kg (0.2 mL/kg of 10% solution) slow IV push. Max single dose 1 gram." },
        { title: "Route", content: "IV/IO only. Must use central line or large bore peripheral IV. Highly vesicant." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "1-5 minutes" },
        { title: "Duration", content: "30-60 minutes" },
        { title: "Side Effects", content: "Bradycardia, hypotension, arrhythmias if given too rapidly. Tissue necrosis if extravasation. Coronary/cerebral vasospasm." }
      ]},
      { type: "warning", content: "NEVER give calcium chloride in same IV line as bicarbonate - will precipitate. Slow IV push only - rapid push can cause cardiac arrest. Confirm IV placement before and during administration. Severe tissue damage if infiltrates." },
      { type: "text", title: "Preparation", content: "10% solution = 100 mg/mL (1 gram per 10 mL vial). Three times more elemental calcium than calcium gluconate. Dilute in 50-100 mL NS if time permits for peripheral IV." }
    ]
  },
  {
    id: "1317.7", refNo: "Ref. 1317.7", title: "Dextrose 10%", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "glucose", color: "yellow",
    sections: [
      { type: "header", items: [{ title: "Dextrose 10% (D10)", subtitle: "Ref. 1317.7" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Hypertonic carbohydrate, antihypoglycemic" },
        { title: "Mechanism", content: "Rapidly increases blood glucose concentration. Provides calories and fluid. D10 safer than D50 with less risk of rebound hypoglycemia." },
        { title: "Indications", content: "Hypoglycemia (blood glucose <60 mg/dL with symptoms), altered mental status with suspected hypoglycemia" },
        { title: "Contraindications", content: "Intracranial hemorrhage (relative), hyperglycemia" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "25 grams (250 mL of D10) IV. Recheck glucose in 10 minutes. Additional doses PRN to maintain glucose >80 mg/dL." },
        { title: "Pediatric Dose", content: "0.5-1 gram/kg (5-10 mL/kg of D10) IV. Max 25 grams per dose." },
        { title: "Neonate", content: "2-4 mL/kg D10 IV (0.2-0.4 g/kg). Use lower concentration to avoid osmotic injury." },
        { title: "Route", content: "IV/IO. Flush line after administration." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "1-3 minutes" },
        { title: "Duration", content: "Variable depending on cause of hypoglycemia. Monitor and treat underlying cause." },
        { title: "Side Effects", content: "Tissue necrosis if extravasation (less risk than D50). Hyperglycemia if excessive dose. May worsen cerebral edema." }
      ]},
      { type: "warning", content: "Always check blood glucose before and after administration. Thiamine 100mg should be given if chronic alcoholism/malnutrition suspected (give before or with dextrose). Pediatric patients very sensitive to concentration - use D10 not D50." },
      { type: "text", title: "Preparation", content: "D10 = 10 grams per 100 mL. 25g dose = 250 mL bag. Can mix from D50 and NS if D10 unavailable: Mix 100 mL D50 with 400 mL NS = 500 mL D10." }
    ]
  },
  {
    id: "1317.8", refNo: "Ref. 1317.8", title: "Diphenhydramine", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Diphenhydramine (Benadryl)", subtitle: "Ref. 1317.8" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "First-generation H1 antihistamine" },
        { title: "Mechanism", content: "Blocks histamine at H1 receptors, preventing vasodilation and increased permeability. Anticholinergic and sedative properties." },
        { title: "Indications", content: "Allergic reaction, anaphylaxis (adjunct to epinephrine), urticaria, pruritus, extrapyramidal symptoms from antipsychotics" },
        { title: "Contraindications", content: "Acute asthma attack (anticholinergic dries secretions), narrow angle glaucoma, bladder neck obstruction" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "25-50 mg slow IV/IM. Oral option 25-50 mg for mild reactions." },
        { title: "Pediatric Dose", content: "1 mg/kg IV/IM/PO (max 50 mg). Use 12.5-25 mg for children <12 years." },
        { title: "Route", content: "IV (slow push over 2-3 min), IM, PO" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IV: 5-10 min, IM: 20-30 min, PO: 30-60 min" },
        { title: "Duration", content: "4-6 hours" },
        { title: "Side Effects", content: "Sedation, dry mouth, urinary retention, confusion (especially elderly), paradoxical excitation in children, hypotension if rapid IV push" }
      ]},
      { type: "text", title: "Notes", content: "NOT first line for anaphylaxis - give epinephrine first. Diphenhydramine is adjunct therapy. Sedation may interfere with patient assessment. Slow IV push to prevent hypotension." }
    ]
  },
  {
    id: "1317.9", refNo: "Ref. 1317.9", title: "DuoDote", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "vaccines", color: "red",
    sections: [
      { type: "header", items: [{ title: "DuoDote Auto-Injector", subtitle: "Ref. 1317.9" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Combination antidote: Atropine (anticholinergic) + Pralidoxime (cholinesterase reactivator)" },
        { title: "Mechanism", content: "Atropine blocks muscarinic effects of excess acetylcholine. Pralidoxime reactivates cholinesterase enzyme, breaking organophosphate bond." },
        { title: "Indications", content: "Organophosphate poisoning (pesticides), nerve agent exposure (chemical warfare), carbamate poisoning" },
        { title: "Contraindications", content: "None in life-threatening poisoning" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "1 auto-injector IM (Atropine 2.1mg + Pralidoxime 600mg). May repeat every 10-15 minutes based on symptoms. Severe poisoning may require multiple doses." },
        { title: "Pediatric Dose", content: ">40 kg: Adult dose. 15-40 kg: Pediatric dose (Atropine 1mg + Pralidoxime 300mg). <15 kg: Atropine 0.5mg + Pralidoxime 150mg." },
        { title: "Route", content: "IM auto-injector (anterolateral thigh)" }
      ]},
      { type: "list", title: "Recognition of Poisoning", items: [
        { title: "SLUDGE Symptoms", content: "Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis - muscarinic effects" },
        { title: "DUMBELS", content: "Diarrhea, Urination, Miosis, Bradycardia, Emesis, Lacrimation, Salivation" },
        { title: "Nicotinic Effects", content: "Muscle fasciculations, weakness, paralysis, hypertension, tachycardia" }
      ]},
      { type: "warning", content: "Provider safety first - use PPE, decontaminate patient. Auto-injector spring-loaded - hold firmly against thigh for 10 seconds. May need many doses for severe poisoning. Transport to facility capable of prolonged atropine/pralidoxime infusion." },
      { type: "text", title: "Endpoint", content: "Give atropine until secretions dry (skin, lungs). Pupils may remain pinpoint. Pralidoxime most effective if given within hours of exposure but beneficial up to 48 hours." }
    ]
  },
  {
    id: "1317.10", refNo: "Ref. 1317.10", title: "Epinephrine 1:1,000", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "syringe", color: "red",
    sections: [
      { type: "header", items: [{ title: "Epinephrine 1:1,000 (1 mg/mL)", subtitle: "Ref. 1317.10" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Sympathomimetic, catecholamine (alpha and beta agonist)" },
        { title: "Mechanism", content: "Alpha-1: Vasoconstriction, reverses hypotension and angioedema. Beta-1: Increases heart rate and contractility. Beta-2: Bronchodilation." },
        { title: "Indications", content: "Anaphylaxis (first-line), severe asthma/bronchospasm unresponsive to albuterol" },
        { title: "Contraindications", content: "None in anaphylaxis. Relative: Hypertension, coronary disease, but don't withhold in true anaphylaxis." }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Anaphylaxis", content: "0.3-0.5 mg IM (0.3-0.5 mL of 1:1,000). May repeat every 5-15 minutes if no improvement. Max 3 doses." },
        { title: "Pediatric Anaphylaxis", content: "0.01 mg/kg IM (0.01 mL/kg of 1:1,000). Max single dose 0.3 mg. May repeat every 5-15 minutes." },
        { title: "Route", content: "IM anterolateral thigh (vastus lateralis) - fastest absorption. NEVER give 1:1,000 IV." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "3-5 minutes IM" },
        { title: "Peak", content: "10-20 minutes" },
        { title: "Duration", content: "1-4 hours" },
        { title: "Side Effects", content: "Anxiety, tremor, palpitations, headache, hypertension, tachycardia, arrhythmias, pulmonary edema (rare)" }
      ]},
      { type: "warning", content: "CRITICAL: 1:1,000 is for IM/SQ use only - NEVER IV. IV administration of 1:1,000 concentration can cause severe hypertension, stroke, MI, death. For IV use, must use 1:10,000 concentration. Do not delay epinephrine in anaphylaxis - it's the ONLY medication that prevents death." },
      { type: "text", title: "Preparation", content: "1:1,000 = 1 mg/mL. Draw up 0.3 mL for typical adult dose. Pre-filled syringes or ampules. Protect from light. Patient may have own EpiPen - assist with auto-injector if needed." }
    ]
  },
  {
    id: "1317.11", refNo: "Ref. 1317.11", title: "Epinephrine 1:10,000", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "syringe", color: "red",
    sections: [
      { type: "header", items: [{ title: "Epinephrine 1:10,000 (0.1 mg/mL)", subtitle: "Ref. 1317.11" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Sympathomimetic, catecholamine (alpha and beta agonist)" },
        { title: "Mechanism", content: "Alpha: Increases systemic vascular resistance and coronary perfusion pressure. Beta-1: Increases cardiac contractility and automaticity. Improves ROSC in cardiac arrest." },
        { title: "Indications", content: "Cardiac arrest (VF, pVT, asystole, PEA), symptomatic bradycardia unresponsive to atropine, severe hypotension/shock" },
        { title: "Contraindications", content: "None in cardiac arrest" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Cardiac Arrest", content: "1 mg (10 mL of 1:10,000) IV/IO every 3-5 minutes. No maximum dose. Continue until ROSC or termination." },
        { title: "Bradycardia", content: "2-10 mcg/min IV infusion, titrate to effect. For push-dose pressors: 10 mcg (0.1 mL of 1:10,000) slow IV push." },
        { title: "Pediatric Cardiac Arrest", content: "0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO every 3-5 minutes. Max single dose 1 mg." },
        { title: "Route", content: "IV/IO preferred. Endotracheal 2-2.5 mg diluted in 10 mL NS if no vascular access." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "1-2 minutes IV" },
        { title: "Duration", content: "5-10 minutes" },
        { title: "Side Effects", content: "Tachyarrhythmias, hypertension, myocardial ischemia, pulmonary edema. Post-ROSC hypertension common." }
      ]},
      { type: "warning", content: "CRITICAL: 1:10,000 is for IV/IO use only. Do NOT confuse with 1:1,000 concentration (10x difference). Verify concentration before drawing up. In cardiac arrest, epinephrine is essential - do not withhold due to theoretical concerns." },
      { type: "text", title: "Preparation", content: "1:10,000 = 0.1 mg/mL. Cardiac arrest dose = 10 mL. Pre-filled syringes available. May need to dilute 1:1,000 with NS to make 1:10,000 if needed: 1 mL of 1:1,000 + 9 mL NS = 10 mL of 1:10,000." }
    ]
  },
  {
    id: "1317.13", refNo: "Ref. 1317.13", title: "Fentanyl", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "healing", color: "purple",
    sections: [
      { type: "header", items: [{ title: "Fentanyl", subtitle: "Ref. 1317.13" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Synthetic opioid analgesic, mu-receptor agonist" },
        { title: "Mechanism", content: "Binds mu-opioid receptors in CNS and peripheral nervous system, altering pain perception and emotional response to pain." },
        { title: "Indications", content: "Moderate to severe pain, adjunct for RSI, pain management in chest pain protocols" },
        { title: "Contraindications", content: "Known allergy, respiratory depression, hypotension (relative)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Pain Management", content: "1 mcg/kg (typical 50-100 mcg) slow IV/IO. May repeat 0.5-1 mcg/kg every 5-10 min. IN route: 1-2 mcg/kg." },
        { title: "Adult RSI Adjunct", content: "3 mcg/kg IV 3 minutes before induction to blunt sympathetic response." },
        { title: "Pediatric Dose", content: "1 mcg/kg slow IV/IO or 1.5-2 mcg/kg IN. May repeat 0.5 mcg/kg." },
        { title: "Route", content: "IV/IO (titrate), IM, Intranasal (atomizer)" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IV: 1-2 min, IN: 5-10 min, IM: 5-15 min" },
        { title: "Peak", content: "3-5 minutes IV" },
        { title: "Duration", content: "30-60 minutes (single dose)" },
        { title: "Side Effects", content: "Respiratory depression, hypotension, bradycardia, nausea, chest wall rigidity (high dose), sedation" }
      ]},
      { type: "warning", content: "Monitor respiratory rate and SpO2. Naloxone must be immediately available. Chest wall rigidity can occur with rapid high-dose IV push - treat with paralytic if occurs during RSI. Use caution in elderly, COPD, head injury. Potent - 100x morphine potency." },
      { type: "text", title: "Preparation", content: "50 mcg/mL (0.05 mg/mL) in 2 mL or 5 mL vials. For IN administration, use MAD atomizer. Titrate to pain relief, not to zero pain. Goal: Comfort without respiratory depression." }
    ]
  },
  {
    id: "1317.14", refNo: "Ref. 1317.14", title: "Glucagon", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "glucose", color: "yellow",
    sections: [
      { type: "header", items: [{ title: "Glucagon", subtitle: "Ref. 1317.14" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Pancreatic hormone, antihypoglycemic" },
        { title: "Mechanism", content: "Stimulates hepatic glycogenolysis and gluconeogenesis, raising blood glucose. Positive inotropic and chronotropic effects independent of beta-receptors." },
        { title: "Indications", content: "Hypoglycemia without IV access, beta-blocker overdose, calcium channel blocker overdose" },
        { title: "Contraindications", content: "Pheochromocytoma, known allergy" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Hypoglycemia (Adult)", content: "1 mg IM/IN/SQ. May repeat in 15 minutes if no response." },
        { title: "Hypoglycemia (Pediatric)", content: "<20 kg or <5 years: 0.5 mg IM. >20 kg or >5 years: 1 mg IM." },
        { title: "Beta-Blocker/CCB Overdose", content: "3-5 mg IV bolus, then 3-5 mg/hr infusion (not typically available prehospital - give bolus only)." },
        { title: "Route", content: "IM preferred for hypoglycemia, IV for overdose, IN acceptable" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IM: 5-15 minutes, IV: 1-3 minutes" },
        { title: "Duration", content: "60-90 minutes" },
        { title: "Side Effects", content: "Nausea/vomiting (very common), hyperglycemia, hypokalemia, hypertension, tachycardia" }
      ]},
      { type: "warning", content: "Nausea and vomiting almost universal - position patient to prevent aspiration. Ineffective if liver glycogen depleted (chronic alcoholism, malnutrition, prolonged hypoglycemia). Give oral glucose or IV dextrose once patient conscious. For overdose indication, doses much higher than hypoglycemia." },
      { type: "text", title: "Preparation", content: "Supplied as powder requiring reconstitution. 1 mg powder + diluent. Mix thoroughly, use immediately. Unstable in solution. Draw up 1 mL after mixing. For IN use, use entire reconstituted dose with atomizer." }
    ]
  },
  {
    id: "1317.15", refNo: "Ref. 1317.15", title: "Oral Glucose", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "glucose", color: "yellow",
    sections: [
      { type: "header", items: [{ title: "Oral Glucose Gel", subtitle: "Ref. 1317.15" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Oral carbohydrate, antihypoglycemic" },
        { title: "Mechanism", content: "Rapidly absorbed simple sugar raises blood glucose through GI absorption." },
        { title: "Indications", content: "Hypoglycemia in alert patient able to swallow and protect airway" },
        { title: "Contraindications", content: "Decreased LOC, inability to swallow, risk of aspiration" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "15-20 grams PO (1 tube glucose gel). May repeat in 15 minutes if glucose <80." },
        { title: "Pediatric Dose", content: "0.5-1 gram/kg PO (max 20 grams)" },
        { title: "Route", content: "Oral only. Place gel between cheek and gum if patient cannot swallow well." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "10-20 minutes" },
        { title: "Duration", content: "Variable, depends on cause of hypoglycemia" },
        { title: "Side Effects", content: "Nausea, aspiration if given to patient unable to protect airway" }
      ]},
      { type: "warning", content: "Patient must be alert enough to swallow. If any doubt about airway protection, use IV dextrose or IM glucagon instead. Recheck glucose 15 minutes after administration. Patient should eat complex carbs once glucose normalized." },
      { type: "text", title: "Preparation", content: "15-20 gram tubes of gel. Alternative: Orange juice, regular soda, glucose tablets. Avoid diet drinks (no sugar). Honey NOT recommended for prehospital use." }
    ]
  },
  {
    id: "1317.16", refNo: "Ref. 1317.16", title: "Hydroxocobalamin", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication_liquid", color: "red",
    sections: [
      { type: "header", items: [{ title: "Hydroxocobalamin (Cyanokit)", subtitle: "Ref. 1317.16" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Cyanide antidote, vitamin B12a precursor" },
        { title: "Mechanism", content: "Binds with cyanide to form cyanocobalamin (vitamin B12), which is renally excreted. Rapidly detoxifies cyanide." },
        { title: "Indications", content: "Known or suspected cyanide poisoning: house fire with smoke inhalation, industrial exposure, altered mental status with unexplained lactic acidosis" },
        { title: "Contraindications", content: "None in life-threatening poisoning" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "5 grams IV over 15 minutes. Second dose 5 grams may be given for inadequate response or severe poisoning." },
        { title: "Pediatric Dose", content: "70 mg/kg IV (max 5 grams) over 15 minutes" },
        { title: "Route", content: "IV infusion. Use large bore IV due to volume and viscosity." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "Immediate as infusion starts" },
        { title: "Duration", content: "Variable based on cyanide level" },
        { title: "Side Effects", content: "Red discoloration of skin, urine, mucous membranes (expected, benign). Hypertension, nausea, headache. Interferes with lab values (colorimetric assays)." }
      ]},
      { type: "warning", content: "Dramatic red color of patient and all body fluids is expected - warn patient and receiving facility. May interfere with pulse oximetry and lab tests. Large volume infusion - use pressure bag. Do not wait for confirmation before treating suspected cyanide poisoning in fire victims." },
      { type: "text", title: "Preparation", content: "5 gram vial requires reconstitution with 200 mL NS. Invert gently to mix (do not shake - causes foam). Results in dark red solution. Infuse over 15 minutes. Use inline filter if available." },
      { type: "list", title: "Cyanide Exposure Clues", items: [
        { title: "Fire Scene", content: "Enclosed space, plastics/synthetic materials burning, patients with soot in airway" },
        { title: "Clinical", content: "Altered mental status, seizures, unexplained lactic acidosis, cardiovascular collapse despite normal SpO2" },
        { title: "Industrial", content: "Electroplating, mining, chemical plants, fumigation, laboratory exposure" }
      ]}
    ]
  },
  {
    id: "1317.18", refNo: "Ref. 1317.18", title: "Ketorolac", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "pill", color: "orange",
    sections: [
      { type: "header", items: [{ title: "Ketorolac (Toradol)", subtitle: "Ref. 1317.18" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Non-steroidal anti-inflammatory drug (NSAID), COX inhibitor" },
        { title: "Mechanism", content: "Inhibits prostaglandin synthesis (COX-1 and COX-2), reducing inflammation and pain. Non-narcotic analgesic." },
        { title: "Indications", content: "Moderate to severe pain, especially musculoskeletal, renal colic, headache. Alternative to opioids." },
        { title: "Contraindications", content: "Active GI bleeding, renal insufficiency, pregnancy (3rd trimester), bleeding disorder, allergy to NSAIDs/aspirin, age >65 (relative)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult <65 years", content: "30 mg IV/IO or 60 mg IM" },
        { title: "Adult ≥65 years or <50 kg", content: "15 mg IV/IO or 30 mg IM (reduced dose for safety)" },
        { title: "Pediatric", content: "0.5 mg/kg IV/IM (max 30 mg). Not recommended <2 years." },
        { title: "Route", content: "IV/IO (slow push over 1-2 min), IM" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IV: 10 min, IM: 30 min" },
        { title: "Peak", content: "1-2 hours" },
        { title: "Duration", content: "4-6 hours" },
        { title: "Side Effects", content: "GI upset, bleeding, renal impairment, hypertension, headache, edema" }
      ]},
      { type: "warning", content: "Avoid in suspected GI bleed, elderly, renal disease, anticoagulated patients. May mask fever. Does NOT cause respiratory depression (advantage over opioids). Question patients about NSAID allergies, bleeding history, renal disease. Reduce dose in elderly and low weight patients." },
      { type: "text", title: "Administration", content: "Good option for pain when opioid side effects/respiratory depression concerns. Particularly effective for renal colic, orthopedic injuries. Can be combined with opioids for multimodal analgesia. Slow IV push to minimize pain on injection." }
    ]
  },
  {
    id: "1317.19", refNo: "Ref. 1317.19", title: "Lidocaine", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "ecg_heart", color: "red",
    sections: [
      { type: "header", items: [{ title: "Lidocaine", subtitle: "Ref. 1317.19" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Class IB antiarrhythmic, local anesthetic" },
        { title: "Mechanism", content: "Blocks sodium channels, suppresses ventricular ectopy. Raises VF threshold. Local anesthetic effect blocks pain transmission." },
        { title: "Indications", content: "Stable VT, VF/pVT refractory to defibrillation (alternative to amiodarone), local anesthesia for procedures" },
        { title: "Contraindications", content: "2nd or 3rd degree AV block, severe bradycardia, known allergy" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "VF/Pulseless VT", content: "1-1.5 mg/kg IV/IO push. May repeat 0.5-0.75 mg/kg every 5-10 min. Max 3 mg/kg total." },
        { title: "Stable VT", content: "1-1.5 mg/kg IV/IO over 2-3 minutes. May repeat 0.5 mg/kg. Follow with infusion 1-4 mg/min if effective." },
        { title: "Pediatric", content: "1 mg/kg IV/IO push for VF/VT. May repeat 0.5 mg/kg. Max 3 mg/kg." },
        { title: "Route", content: "IV/IO. Topical/local infiltration for anesthesia." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "1-2 minutes IV" },
        { title: "Duration", content: "10-20 minutes (bolus), 60-90 minutes (infusion)" },
        { title: "Side Effects", content: "CNS toxicity (confusion, seizures at high dose), bradycardia, hypotension, heart block, metallic taste, paresthesias" }
      ]},
      { type: "warning", content: "Amiodarone preferred over lidocaine in cardiac arrest. Reduce dose in elderly, liver disease, CHF. CNS toxicity with high doses or rapid administration. Have benzodiazepine available for seizures. Do not use lidocaine with epinephrine for local anesthesia in areas with end-arteries (fingers, toes, nose, ears, penis)." },
      { type: "text", title: "Preparation", content: "Cardiac use: 100 mg in 5 mL (20 mg/mL) or pre-filled syringes. Local anesthesia: 1% (10 mg/mL) or 2% (20 mg/mL) solutions. Note concentration carefully. Max local infiltration dose 4.5 mg/kg without epi, 7 mg/kg with epinephrine." }
    ]
  },
  {
    id: "1317.20", refNo: "Ref. 1317.20", title: "Magnesium Sulfate", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication_liquid", color: "indigo",
    sections: [
      { type: "header", items: [{ title: "Magnesium Sulfate", subtitle: "Ref. 1317.20" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Electrolyte, mineral, anticonvulsant" },
        { title: "Mechanism", content: "Essential mineral for enzyme systems. Membrane stabilizer. Anticonvulsant effect. Bronchodilator. Decreases neuromuscular transmission." },
        { title: "Indications", content: "Torsades de pointes, eclamptic seizures, severe asthma (refractory to albuterol), hypomagnesemia" },
        { title: "Contraindications", content: "Heart block, renal failure (relative), hypotension" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Torsades de Pointes", content: "2 grams IV/IO over 2-5 minutes. May repeat if Torsades recurs." },
        { title: "Eclampsia", content: "4-6 grams IV over 20 minutes, then 1-2 gram/hr infusion" },
        { title: "Severe Asthma", content: "2 grams IV over 20 minutes" },
        { title: "Pediatric", content: "25-50 mg/kg IV/IO (max 2 grams) over 10-20 minutes" },
        { title: "Route", content: "IV/IO infusion (slow)" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "Immediate IV" },
        { title: "Duration", content: "30 minutes (bolus)" },
        { title: "Side Effects", content: "Hypotension (especially if rapid), flushing, sweating, bradycardia, respiratory depression, decreased DTRs, cardiac arrest at high levels" }
      ]},
      { type: "warning", content: "Slow infusion to prevent hypotension. Monitor BP during administration. High doses can cause respiratory depression and cardiac arrest. Calcium chloride is antidote if magnesium toxicity occurs. Do not confuse grams with milligrams - massive dosing error potential." },
      { type: "text", title: "Preparation", content: "50% solution = 500 mg/mL (5 grams per 10 mL). For 2 gram dose = 4 mL. Dilute in 50-100 mL NS for infusion. May give slower over 10-20 minutes to reduce side effects. Mix well before administration." }
    ]
  },
  {
    id: "1317.21", refNo: "Ref. 1317.21", title: "Midazolam", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "neurology", color: "teal",
    sections: [
      { type: "header", items: [{ title: "Midazolam (Versed)", subtitle: "Ref. 1317.21" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Benzodiazepine, sedative-hypnotic, anticonvulsant" },
        { title: "Mechanism", content: "GABA agonist causing CNS depression. Provides sedation, anxiolysis, amnesia, muscle relaxation, and anticonvulsant effects." },
        { title: "Indications", content: "Seizures (status epilepticus), sedation for agitation, RSI facilitation, procedural sedation, cardioversion" },
        { title: "Contraindications", content: "Known allergy, acute narrow angle glaucoma (relative)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Seizures (Adult)", content: "5-10 mg IN/IM or 2-5 mg slow IV. May repeat once." },
        { title: "Seizures (Pediatric)", content: "0.2 mg/kg IN/IM/IV (max 10 mg). Intranasal: 0.2-0.3 mg/kg (5 mg <6 years, 10 mg >6 years)" },
        { title: "Sedation (Adult)", content: "1-2.5 mg slow IV, titrate to effect. IM: 5 mg." },
        { title: "RSI Premedication", content: "0.03 mg/kg IV (2-3 mg typical) for amnesia" },
        { title: "Route", content: "IV/IO/IM/IN (atomizer)" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IV: 1-3 min, IM: 5-15 min, IN: 5-10 min" },
        { title: "Peak", content: "3-5 minutes IV" },
        { title: "Duration", content: "1-6 hours (dose dependent)" },
        { title: "Side Effects", content: "Respiratory depression, hypotension, paradoxical agitation (especially children/elderly), amnesia, hiccups" }
      ]},
      { type: "warning", content: "Respiratory depression, especially when combined with opioids. Monitor SpO2 and respiratory rate. Have airway equipment ready. Reversal agent flumazenil available but rarely indicated. Slow IV push to prevent apnea/hypotension. IN route very effective for seizures without IV access." },
      { type: "text", title: "Preparation", content: "5 mg/mL or 1 mg/mL concentrations. Check vial carefully. For IN use, divide dose between both nostrils using MAD atomizer. Maximum 1 mL per nostril for absorption. Onset faster with 5 mg/mL concentration." }
    ]
  },
  {
    id: "1317.22", refNo: "Ref. 1317.22", title: "Morphine", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "healing", color: "purple",
    sections: [
      { type: "header", items: [{ title: "Morphine Sulfate", subtitle: "Ref. 1317.22" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Opioid analgesic, mu-receptor agonist" },
        { title: "Mechanism", content: "Binds mu-opioid receptors altering pain perception. Also causes venodilation reducing preload in CHF." },
        { title: "Indications", content: "Moderate to severe pain, acute pulmonary edema/CHF" },
        { title: "Contraindications", content: "Respiratory depression, hypotension, head injury (relative), hypersensitivity" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Pain", content: "2-4 mg slow IV every 5-15 minutes, titrate to effect. Alternative: 5-10 mg IM." },
        { title: "Adult CHF/Pulmonary Edema", content: "2-4 mg slow IV. May repeat 2-4 mg every 5-15 min." },
        { title: "Pediatric", content: "0.1 mg/kg slow IV/IM (max 10 mg). May repeat 0.05 mg/kg." },
        { title: "Route", content: "IV/IO/IM/SQ" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IV: 5-10 min, IM: 10-30 min" },
        { title: "Peak", content: "20 minutes IV, 30-60 min IM" },
        { title: "Duration", content: "3-5 hours" },
        { title: "Side Effects", content: "Respiratory depression, hypotension, nausea/vomiting, bradycardia, histamine release, pruritis" }
      ]},
      { type: "warning", content: "Monitor respiratory rate and SpO2. Naloxone must be available. More hypotension and histamine release than fentanyl. Fentanyl generally preferred in prehospital setting. Do not give rapidly - can cause apnea. Slow IV push over 2-3 minutes minimum." },
      { type: "text", title: "Notes", content: "Historical choice for CHF/pulmonary edema but evidence questionable - CPAP and nitrates more effective. Fentanyl preferred for pain management due to faster onset, less hemodynamic effects, easier titration. Morphine still useful when IM route needed." }
    ]
  },
  {
    id: "1317.23", refNo: "Ref. 1317.23", title: "Naloxone", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "emergency", color: "red",
    sections: [
      { type: "header", items: [{ title: "Naloxone (Narcan)", subtitle: "Ref. 1317.23" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Opioid antagonist, antidote" },
        { title: "Mechanism", content: "Competitive antagonist at mu, kappa, and delta opioid receptors. Rapidly reverses opioid effects including respiratory depression." },
        { title: "Indications", content: "Opioid-induced respiratory depression (RR <10 or apneic), altered mental status from suspected opioid overdose" },
        { title: "Contraindications", content: "None in life-threatening respiratory depression" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Respiratory Depression", content: "0.4-2 mg IV/IM/IN. May repeat every 2-3 minutes. Goal: Adequate respirations, NOT full consciousness." },
        { title: "Cardiac Arrest", content: "2 mg IV/IO/IN rapid. May not reverse opioid-related arrest but no harm." },
        { title: "Pediatric", content: "0.1 mg/kg IV/IM/IN (max 2 mg). May repeat every 2-3 minutes." },
        { title: "Route", content: "IV/IO/IM/IN (atomizer)/SQ. IN route very effective and convenient." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IV: 1-2 min, IM: 3-5 min, IN: 2-5 min" },
        { title: "Duration", content: "30-90 minutes (shorter than most opioids)" },
        { title: "Side Effects", content: "Acute withdrawal (agitation, vomiting, tachycardia, hypertension), pulmonary edema (rare), seizures (rare), violent behavior" }
      ]},
      { type: "warning", content: "Goal is adequate respirations, NOT full consciousness. Reversing all opioid effect causes acute withdrawal and patient may become combative. May need repeated doses as naloxone wears off before long-acting opioids (methadone, fentanyl analogs). Patient can refuse further care once awake - high risk for re-sedation. Titrate carefully." },
      { type: "text", title: "Preparation", content: "0.4 mg/mL or 1 mg/mL concentrations. IN auto-injector 4 mg available (Narcan nasal spray). For IN use, can use 2 mg/2 mL with MAD atomizer (1 mL per nostril). Start with lower doses (0.4 mg) and titrate up rather than giving large dose causing withdrawal." },
      { type: "list", title: "Dosing Strategy", items: [
        { title: "Mild Respiratory Depression", content: "Start 0.4 mg, repeat every 2-3 min until RR >10" },
        { title: "Severe/Apneic", content: "Give 2 mg immediately while assisting ventilation" },
        { title: "Synthetic Opioids", content: "Fentanyl, carfentanil may require higher doses, longer treatment" }
      ]}
    ]
  },
  {
    id: "1317.24", refNo: "Ref. 1317.24", title: "Nitroglycerin", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "favorite", color: "pink",
    sections: [
      { type: "header", items: [{ title: "Nitroglycerin", subtitle: "Ref. 1317.24" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Nitrate vasodilator, antianginal" },
        { title: "Mechanism", content: "Releases nitric oxide causing smooth muscle relaxation. Dilates veins (decreases preload), dilates coronary arteries (improves myocardial O2 supply), mild arterial dilation." },
        { title: "Indications", content: "Chest pain suggestive of cardiac ischemia, acute pulmonary edema/CHF, hypertensive emergency" },
        { title: "Contraindications", content: "SBP <100 mmHg, RV infarct (inferior STEMI), phosphodiesterase inhibitor use within 24-48 hrs (Viagra, Cialis), severe aortic stenosis" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "0.4 mg (1/150 grain) SL spray or tablet. May repeat every 5 minutes x3 doses. Reassess BP before each dose." },
        { title: "Pediatric", content: "Not typically used in pediatrics" },
        { title: "Route", content: "Sublingual spray or tablet (preferred), transdermal paste (0.5-2 inches)" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "SL: 1-3 minutes, Paste: 20-30 minutes" },
        { title: "Peak", content: "5-10 minutes SL" },
        { title: "Duration", content: "SL: 20-30 minutes, Paste: 4-8 hours" },
        { title: "Side Effects", content: "Hypotension (especially orthostatic), headache (very common), reflex tachycardia, syncope, methemoglobinemia (massive overdose)" }
      ]},
      { type: "warning", content: "CRITICAL: Ask about phosphodiesterase inhibitor use (Viagra, Levitra, Cialis) - life-threatening hypotension if given together. Check BP before EACH dose. Patient should be sitting or supine. Headache common and expected. Avoid if signs of RV infarct (inferior MI + JVD, clear lungs)." },
      { type: "text", title: "Preparation", content: "Spray: 0.4 mg/spray. Spray under tongue, patient should not inhale. Tablets: 0.4 mg (1/150 grain), must be fresh (degrades with light/air). Patient may have own prescription - assist with administration. Document number of doses and response. Paste: Measure in inches on paper, apply to chest (rarely used prehospital)." }
    ]
  },
  {
    id: "1317.25", refNo: "Ref. 1317.25", title: "Normal Saline", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "water_drop", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Normal Saline (0.9% NaCl)", subtitle: "Ref. 1317.25" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Isotonic crystalloid, IV fluid" },
        { title: "Mechanism", content: "Expands intravascular volume. Isotonic with plasma (308 mOsm/L). Distributes to all fluid compartments." },
        { title: "Indications", content: "Hypovolemia, hypotension, shock, dehydration, medication diluent, IV line maintenance" },
        { title: "Contraindications", content: "Pulmonary edema, CHF (relative - use cautiously), hypernatremia, fluid overload" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Hypovolemia", content: "250-500 mL bolus, reassess. Repeat PRN to achieve SBP >90 mmHg. Titrate to clinical response." },
        { title: "Adult Maintenance", content: "KVO (10-30 mL/hr) or saline lock" },
        { title: "Pediatric Hypovolemia", content: "20 mL/kg bolus over 10-20 minutes. May repeat. Max 60 mL/kg total without medical control." },
        { title: "Medication Dilution", content: "Per medication protocol" },
        { title: "Route", content: "IV/IO" }
      ]},
      { type: "warning", content: "Avoid fluid overload - reassess after each bolus. Listen to lungs for crackles. Large volume resuscitation can cause dilutional coagulopathy and hypothermia. In trauma, permissive hypotension (SBP 80-90) acceptable if no head injury. Stop fluids when BP adequate. Consider blood products for hemorrhagic shock rather than crystalloid alone." },
      { type: "list", title: "Fluid Resuscitation Guidelines", items: [
        { title: "Hemorrhagic Shock", content: "Limit crystalloid. Goal SBP 80-90 in trauma without head injury. Permissive hypotension until hemorrhage controlled." },
        { title: "Septic Shock", content: "Aggressive fluid resuscitation. 30 mL/kg initial bolus. Goal SBP >90, MAP >65." },
        { title: "Dehydration", content: "Moderate bolus approach. Assess mucous membranes, skin turgor, vital signs." }
      ]},
      { type: "text", title: "Preparation", content: "1000 mL bags, 500 mL bags, 250 mL bags, 100 mL bags, 50 mL vials (flush). 0.9% = 9 grams NaCl per liter. Preferred crystalloid in prehospital setting. Lactated Ringers acceptable alternative but less commonly used. Warm fluids if possible for large volume resuscitation." }
    ]
  },
  {
    id: "1317.26", refNo: "Ref. 1317.26", title: "Olanzapine", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "neurology", color: "teal",
    sections: [
      { type: "header", items: [{ title: "Olanzapine (Zyprexa)", subtitle: "Ref. 1317.26" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Second-generation (atypical) antipsychotic" },
        { title: "Mechanism", content: "Antagonizes dopamine and serotonin receptors causing sedation and antipsychotic effects. Less extrapyramidal side effects than typical antipsychotics." },
        { title: "Indications", content: "Acute agitation in psychiatric patients, chemical restraint for violent/combative patients" },
        { title: "Contraindications", content: "Known allergy, concurrent benzodiazepine administration (IM formulation - increased respiratory depression risk)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Agitation", content: "10 mg IM. May repeat 5-10 mg in 2 hours if needed." },
        { title: "Elderly/Debilitated", content: "5 mg IM" },
        { title: "Pediatric", content: "Not typically used in prehospital pediatrics. Consult medical control." },
        { title: "Route", content: "IM only (IM formulation cannot be given IV)" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "15-30 minutes IM" },
        { title: "Peak", content: "15-45 minutes" },
        { title: "Duration", content: "2-4 hours" },
        { title: "Side Effects", content: "Sedation, hypotension (orthostatic), tachycardia, dizziness, akathisia, dry mouth, extrapyramidal symptoms (less than typical antipsychotics)" }
      ]},
      { type: "warning", content: "DO NOT mix with benzodiazepines in same syringe or give concurrently IM - increased risk of excessive sedation and respiratory depression. Monitor for hypotension. Patient should remain supine/seated for 30 minutes after administration. Less respiratory depression than sedatives. Slower onset than ketamine/midazolam but longer duration." },
      { type: "text", title: "Preparation", content: "10 mg vial as powder for IM injection only. Reconstitute with 2.1 mL sterile water to yield 5 mg/mL. Use within 1 hour of reconstitution. IM injection only - deep muscle injection. Good option for agitation when longer duration desired. Monitor vital signs after administration." }
    ]
  },
  {
    id: "1317.27", refNo: "Ref. 1317.27", title: "Ondansetron", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Ondansetron (Zofran)", subtitle: "Ref. 1317.27" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "5-HT3 serotonin receptor antagonist, antiemetic" },
        { title: "Mechanism", content: "Blocks serotonin receptors in chemoreceptor trigger zone and GI tract, preventing nausea and vomiting." },
        { title: "Indications", content: "Nausea and vomiting from any cause" },
        { title: "Contraindications", content: "Known allergy, congenital long QT syndrome (relative)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "4 mg slow IV/IM or 4-8 mg ODT (orally disintegrating tablet)" },
        { title: "Pediatric Dose", content: "6 months to 12 years: 0.15 mg/kg IV (max 4 mg). >12 years: 4 mg IV. ODT: 4 mg for >12 years." },
        { title: "Route", content: "IV/IO/IM/PO (ODT)" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "IV: 5-10 min, PO: 30 min" },
        { title: "Peak", content: "15-30 minutes" },
        { title: "Duration", content: "4-8 hours" },
        { title: "Side Effects", content: "Headache, constipation, QT prolongation (rare), dizziness, serotonin syndrome (rare, when combined with other serotonergic drugs)" }
      ]},
      { type: "text", title: "Administration", content: "Very effective antiemetic with minimal side effects. Well tolerated. Slow IV push over 2-3 minutes. ODT dissolves rapidly on tongue without water - useful for vomiting patients. May repeat dose if needed. Consider for patients receiving opioids to prevent nausea." }
    ]
  },
  {
    id: "1317.28", refNo: "Ref. 1317.28", title: "Oxygen", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "air", color: "cyan",
    sections: [
      { type: "header", items: [{ title: "Oxygen (O2)", subtitle: "Ref. 1317.28" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Medical gas, therapeutic agent" },
        { title: "Mechanism", content: "Increases arterial oxygen content and tissue oxygenation. Reverses hypoxemia." },
        { title: "Indications", content: "Hypoxemia (SpO2 <94%), respiratory distress, chest pain, shock, trauma, carbon monoxide poisoning, any patient requiring supplemental oxygen" },
        { title: "Contraindications", content: "None in emergency. Use cautiously in COPD (target SpO2 88-92% to avoid hypercapnia)" }
      ]},
      { type: "list", title: "Delivery Devices and Flow Rates", items: [
        { title: "Nasal Cannula", content: "1-6 L/min. Delivers approximately 24-44% FiO2. Comfortable for alert patients." },
        { title: "Simple Face Mask", content: "6-10 L/min. Delivers 35-60% FiO2. Minimum 6 L/min to prevent CO2 rebreathing." },
        { title: "Non-Rebreather Mask", content: "10-15 L/min. Delivers 60-90% FiO2. Highest concentration for spontaneously breathing patient." },
        { title: "BVM", content: "10-15 L/min. Delivers near 100% FiO2 when properly sealed." },
        { title: "High-Flow Nasal Cannula", content: "Up to 60 L/min heated and humidified. Delivers precise FiO2 up to 100%." }
      ]},
      { type: "list", title: "Special Considerations", items: [
        { title: "COPD Patients", content: "Target SpO2 88-92%. Chronic CO2 retainers may have hypoxic drive - monitor for respiratory depression with high-flow O2." },
        { title: "Neonates", content: "Use blended oxygen when available. Excessive O2 can cause retinopathy of prematurity. Target SpO2 90-95% in preterm infants." },
        { title: "Carbon Monoxide Poisoning", content: "100% oxygen via NRB or BVM. Increases CO elimination. Consider hyperbaric oxygen at hospital." },
        { title: "Cluster Headache", content: "100% oxygen 12-15 L/min via NRB can abort attack." }
      ]},
      { type: "warning", content: "Do NOT withhold oxygen from hypoxemic patients due to COPD concerns - hypoxemia more dangerous than potential CO2 retention. Titrate to target SpO2. Monitor respiratory rate. Support ventilation if respiratory depression occurs. Oxygen supports combustion - no smoking or open flames." },
      { type: "text", title: "Administration", content: "Assess baseline SpO2 before and after oxygen therapy. Titrate flow rate to target SpO2 (typically >94% in most patients, 88-92% in COPD). Use humidification for prolonged high-flow therapy when available. Ensure proper mask seal for NRB and BVM. Document oxygen delivery device and flow rate." }
    ]
  },
  {
    id: "1317.29", refNo: "Ref. 1317.29", title: "Pralidoxime", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication_liquid", color: "red",
    sections: [
      { type: "header", items: [{ title: "Pralidoxime (2-PAM)", subtitle: "Ref. 1317.29" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Cholinesterase reactivator, antidote" },
        { title: "Mechanism", content: "Breaks bond between organophosphate and cholinesterase enzyme, reactivating the enzyme. Reverses nicotinic effects (muscle weakness, paralysis). Must be given with atropine." },
        { title: "Indications", content: "Organophosphate poisoning, nerve agent exposure. Always given with atropine." },
        { title: "Contraindications", content: "None in life-threatening poisoning" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Dose", content: "1-2 grams IV over 15-30 minutes OR 600 mg IM via DuoDote auto-injector. May repeat." },
        { title: "Pediatric Dose", content: "25-50 mg/kg IV over 15-30 minutes OR weight-based DuoDote auto-injector" },
        { title: "Route", content: "IV infusion (preferred) or IM auto-injector (DuoDote)" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "Minutes after IV infusion starts" },
        { title: "Duration", content: "Variable, may need repeated doses or continuous infusion" },
        { title: "Side Effects", content: "Tachycardia, hypertension, dizziness, blurred vision, muscle rigidity if given too rapidly" }
      ]},
      { type: "warning", content: "Most effective if given within hours of exposure but beneficial up to 48 hours. ALWAYS give with atropine - pralidoxime alone is insufficient. Atropine treats muscarinic effects, pralidoxime treats nicotinic effects (weakness, respiratory muscle paralysis). Severe poisoning requires hospital admission for continuous infusion." },
      { type: "text", title: "Organophosphate Poisoning", content: "Combined therapy: Atropine reverses SLUDGE symptoms (muscarinic), Pralidoxime reverses muscle weakness and respiratory paralysis (nicotinic). Prehospital: DuoDote auto-injector contains both. Hospital: Separate IV infusions for precise dosing." },
      { type: "list", title: "Endpoint of Treatment", items: [
        { title: "Atropine Endpoint", content: "Dry skin and lungs. May require massive doses (>100 mg)." },
        { title: "Pralidoxime Endpoint", content: "Improved muscle strength, able to lift head. Reversal of fasciculations." },
        { title: "Duration", content: "Organophosphates can be stored in fat and slowly released. May need days of treatment." }
      ]}
    ]
  },
  {
    id: "1317.31", refNo: "Ref. 1317.31", title: "Sodium Bicarbonate", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication_liquid", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Sodium Bicarbonate", subtitle: "Ref. 1317.31" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Alkalinizing agent, electrolyte, antacid" },
        { title: "Mechanism", content: "Buffers excess hydrogen ions, raising pH. Shifts potassium intracellularly (temporarily lowers serum K+). Alkalinizes urine." },
        { title: "Indications", content: "Severe metabolic acidosis (pH <7.1), hyperkalemia with cardiac effects, tricyclic antidepressant overdose, prolonged cardiac arrest (controversial)" },
        { title: "Contraindications", content: "Metabolic/respiratory alkalosis, hypocalcemia, inadequate ventilation" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Cardiac Arrest", content: "1 mEq/kg (50-100 mEq typical adult) IV push after adequate ventilation established. May repeat 0.5 mEq/kg every 10 minutes." },
        { title: "Hyperkalemia", content: "1 mEq/kg IV over 5 minutes" },
        { title: "TCA Overdose", content: "1-2 mEq/kg IV bolus. Goal: Serum pH 7.45-7.55. Monitor ECG for QRS narrowing." },
        { title: "Pediatric", content: "1 mEq/kg slow IV push" },
        { title: "Route", content: "IV/IO. Central line preferred due to vesicant properties." }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "Immediate" },
        { title: "Duration", content: "30-60 minutes" },
        { title: "Side Effects", content: "Metabolic alkalosis, hypernatremia, hyperosmolality, tissue necrosis if extravasation, paradoxical CNS acidosis, hypokalemia" }
      ]},
      { type: "warning", content: "CRITICAL: Adequate ventilation must be established before giving bicarbonate - requires CO2 elimination to be effective. Do NOT give in same IV line as calcium (will precipitate). Flush line before and after. Tissue necrosis if infiltrates - ensure patent IV. Not routine in cardiac arrest - only after prolonged arrest with adequate ventilation. Can worsen intracellular acidosis if ventilation inadequate." },
      { type: "text", title: "Preparation", content: "8.4% solution = 1 mEq/mL (50 mEq in 50 mL syringe). For cardiac arrest: Give 50-100 mEq (1-2 syringes) IV push. Flush line well. Reconstituted solution is hypertonic and caustic." },
      { type: "list", title: "Evidence-Based Use", items: [
        { title: "Strong Indication", content: "TCA overdose, hyperkalemia, certain toxidromes (ASA, methanol)" },
        { title: "Weak/Controversial", content: "Cardiac arrest (only after prolonged arrest, NOT routine), severe metabolic acidosis" },
        { title: "NOT Indicated", content: "Routine cardiac arrest, hypercarbic acidosis (need ventilation not bicarb), lactic acidosis from hypoperfusion (fix perfusion)" }
      ]}
    ]
  },
  {
    id: "1317.33", refNo: "Ref. 1317.33", title: "Tranexamic Acid", category: "Pharmacology", type: "Drug Reference", lastUpdated: "2024", icon: "medication_liquid", color: "red",
    sections: [
      { type: "header", items: [{ title: "Tranexamic Acid (TXA)", subtitle: "Ref. 1317.33" }] },
      { type: "list", title: "Drug Information", items: [
        { title: "Class", content: "Antifibrinolytic, hemostatic agent" },
        { title: "Mechanism", content: "Competitively inhibits plasminogen activation, preventing fibrinolysis (clot breakdown). Stabilizes formed clots." },
        { title: "Indications", content: "Major trauma with hemorrhage (SBP <90 or HR >110), hemorrhagic shock. Most effective if given within 3 hours of injury." },
        { title: "Contraindications", content: "Isolated head injury without hemorrhage (relative), thromboembolic disease (relative), seizure history (high dose)" }
      ]},
      { type: "list", title: "Dosing", items: [
        { title: "Adult Trauma", content: "1 gram IV over 10 minutes. Second dose 1 gram IV over 8 hours (hospital dose)." },
        { title: "Pediatric Trauma", content: "15 mg/kg IV over 10 minutes (max 1 gram)" },
        { title: "Route", content: "IV infusion" }
      ]},
      { type: "list", title: "Pharmacokinetics", items: [
        { title: "Onset", content: "Minutes" },
        { title: "Duration", content: "3-8 hours" },
        { title: "Side Effects", content: "Seizures (high dose, rapid administration), thromboembolic events (DVT, PE, MI - rare), hypotension if given too rapidly, nausea" }
      ]},
      { type: "warning", content: "Time-sensitive medication - most benefit if given within 1 hour of injury, significant benefit up to 3 hours. NO benefit and potential harm if given >3 hours after injury. Do not give rapidly - slow infusion over 10 minutes to prevent seizures and hypotension. Evidence strongest for traumatic hemorrhage. Benefit in isolated TBI unclear." },
      { type: "text", title: "Evidence", content: "CRASH-2 trial showed mortality reduction in trauma patients with or at risk of significant hemorrhage when TXA given within 3 hours. CRASH-3 showed possible benefit in mild-moderate TBI. Standard of care for hemorrhagic trauma. Minimal side effects when given appropriately." },
      { type: "list", title: "Inclusion Criteria", items: [
        { title: "Major Trauma", content: "High-energy mechanism: MVC, fall, penetrating trauma, crush" },
        { title: "Evidence of Hemorrhage", content: "SBP <90 mmHg OR HR >110 bpm OR suspected internal bleeding" },
        { title: "Time Window", content: "Within 3 hours of injury (earlier is better)" }
      ]},
      { type: "list", title: "Exclusion Criteria", items: [
        { title: "Time", content: ">3 hours since injury" },
        { title: "Isolated Head Injury", content: "TBI without other injuries (controversial, some protocols allow)" }
      ]},
      { type: "text", title: "Preparation", content: "1 gram/10 mL (100 mg/mL) vial or ampule. Draw up 10 mL (1 gram). Dilute in 100 mL NS and infuse over 10 minutes. Alternatively, slow IV push over 10 minutes acceptable. Document time of injury and time of TXA administration. Notify receiving facility of TXA administration for second dose." }
    ]
  },
  // 1350 removed (duplicate of pediatric TP-1350)
  // 1360 removed (duplicate of pediatric TP-1360)
  {
    id: "1373", refNo: "Ref. 1373", title: "Fallout Data Dictionary", category: "Administrative", type: "Reference", lastUpdated: "2024", icon: "analytics", color: "gray",
    sections: [{ type: "header", items: [{ title: "Data Dictionary", subtitle: "Ref. 1373" }] }]
  }
];
