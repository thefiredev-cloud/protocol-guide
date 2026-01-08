
import { Protocol } from '../../types';

export const series700: Protocol[] = [
  {
    id: "701", refNo: "Ref. 701", title: "Supply and Resupply", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "inventory", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Supply", subtitle: "Ref. 701" }] },
        { type: "text", title: "Purpose", content: "Establishes procedures for obtaining and restocking ambulance supplies and medications." },
        { type: "list", title: "Resupply Procedures", items: [
            { title: "After Each Call", content: "Replace all used supplies immediately after patient transfer to hospital." },
            { title: "Approved Sources", content: "Obtain supplies only from LA County approved vendors or hospital supply systems." },
            { title: "Expiration Dates", content: "Check expiration dates when restocking. Use FIFO (First In, First Out) rotation." },
            { title: "Documentation", content: "Document controlled substance replacement in narcotic log." }
        ]}
    ]
  },
  {
    id: "702", refNo: "Ref. 702", title: "Controlled Drugs Carried on ALS Units", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "medication", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Controlled Drugs", subtitle: "Ref. 702" }] },
        { type: "text", content: "Regulations for storage, security, and inventory of Fentanyl, Morphine, Midazolam." },
        { type: "list", title: "Required Controlled Substances", items: [
            { title: "Fentanyl", content: "Minimum quantity as specified by LA County formulary." },
            { title: "Morphine", content: "For pain management." },
            { title: "Midazolam", content: "For seizures and sedation." }
        ]},
        { type: "accordion", title: "Storage and Security", items: [
            { title: "Locked Container", content: "Controlled substances stored in locked container within locked ambulance." },
            { title: "Tamper Evident Seal", content: "Narcotic box secured with numbered tamper-evident seal." },
            { title: "Seal Log", content: "Document seal number on daily check sheet and narcotic log." },
            { title: "Access", content: "Only authorized paramedics may access controlled substances." }
        ]}
    ]
  },
  {
    id: "703", refNo: "Ref. 703", title: "ALS Unit Inventory", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "inventory_2", color: "slate",
    sections: [
        { type: "header", items: [{ title: "ALS Inventory", subtitle: "Ref. 703" }] },
        { type: "text", title: "Requirement", content: "ALS units must carry minimum equipment and medication inventory as specified by LA County EMS Agency." },
        { type: "accordion", title: "Required Equipment Categories", items: [
            { title: "Airway", content: "OPA, NPA, BVM (adult/ped), suction, ETT, King/iGel airways, capnography. Note: Surgical airways NOT authorized for ground ALS field use." },
            { title: "Cardiac", content: "ALS monitor/defibrillator with 12-lead, AED (if monitor failure backup), TCP capability." },
            { title: "Vascular Access", content: "IV catheters (multiple sizes), IO device, IV fluids (NS, LR), administration sets." },
            { title: "Medications", content: "Full formulary per Ref. 1317 including cardiac drugs, analgesics, respiratory, antidotes." }
        ]}
    ]
  },
  {
    id: "704", refNo: "Ref. 704", title: "ALS Monitor/Defibrillator Requirements", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "monitor_heart", color: "slate",
    sections: [
        { type: "header", items: [{ title: "ALS Monitor", subtitle: "Ref. 704" }] },
        { type: "text", title: "Purpose", content: "Specifies minimum capabilities and maintenance requirements for ALS cardiac monitors/defibrillators." },
        { type: "list", title: "Required Capabilities", items: [
            { title: "Defibrillation", content: "Biphasic defibrillator with adult and pediatric capability (360J adult, appropriate ped doses)." },
            { title: "12-Lead ECG", content: "12-lead ECG acquisition and interpretation capability." },
            { title: "Transmission", content: "Ability to transmit 12-lead to receiving hospital." },
            { title: "Pacing", content: "Transcutaneous pacing (TCP) with demand and fixed rate modes." },
            { title: "Capnography", content: "ETCO2 monitoring capability (waveform, not just numeric)." }
        ]},
        { type: "accordion", title: "Maintenance and Testing", items: [
            { title: "Daily Test", content: "Daily automated self-test and visual inspection." },
            { title: "Defibrillator Test", content: "Monthly defibrillator energy output test using dosimeter or analyzer." },
            { title: "Preventive Maintenance", content: "Annual preventive maintenance by qualified biomedical technician." },
            { title: "Backup", content: "Backup monitor or AED available if primary unit fails." }
        ]}
    ]
  },
  {
    id: "705", refNo: "Ref. 705", title: "Oxygen Systems and Equipment", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "air", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Oxygen Equipment", subtitle: "Ref. 705" }] },
        { type: "text", title: "Requirement", content: "All EMS units must carry adequate oxygen supply and delivery devices." },
        { type: "list", title: "Required Oxygen Equipment", items: [
            { title: "Fixed System", content: "Main oxygen system (M or larger cylinder) with minimum 3000L capacity." },
            { title: "Portable", content: "Portable oxygen (D or E cylinder) for use during transport to/from vehicle." },
            { title: "Delivery Devices", content: "Nasal cannula, non-rebreather mask (adult/ped), BVM with O2 reservoir." },
            { title: "Regulators", content: "Pin-index regulators with flowmeter (0-25 LPM minimum)." }
        ]},
        { type: "accordion", title: "Safety and Maintenance", items: [
            { title: "Daily Check", content: "Check oxygen levels, verify adequate supply for shift. Minimum 50% capacity." },
            { title: "Storage", content: "Secure cylinders to prevent rolling/falling. Keep away from heat sources." },
            { title: "Testing", content: "Hydrostatic testing of cylinders per DOT requirements (every 5-10 years depending on cylinder type)." },
            { title: "Refill", content: "Refill cylinders through approved medical oxygen supplier only." }
        ]}
    ]
  },
  {
    id: "706", refNo: "Ref. 706", title: "Suction Equipment", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "settings_input_component", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Suction Equipment", subtitle: "Ref. 706" }] },
        { type: "text", title: "Purpose", content: "Specifies suction equipment requirements for airway management." },
        { type: "list", title: "Required Equipment", items: [
            { title: "Fixed Suction", content: "Vehicle-mounted suction unit capable of 30 LPM flow at end of tube." },
            { title: "Portable Suction", content: "Battery-powered portable suction for use outside vehicle." },
            { title: "Catheters", content: "Rigid tonsil-tip (Yankauer) and flexible suction catheters (multiple sizes)." },
            { title: "Collection Container", content: "Disposable collection canister with overflow protection." }
        ]},
        { type: "accordion", title: "Testing and Maintenance", items: [
            { title: "Daily Test", content: "Test suction units daily - verify adequate vacuum pressure (>300 mmHg)." },
            { title: "Battery", content: "Ensure portable suction battery fully charged." },
            { title: "Disposables", content: "Replace collection canisters and tubing after each patient use or when contaminated." },
            { title: "Cleaning", content: "Clean and disinfect reusable components per infection control protocols." }
        ]}
    ]
  },
  {
    id: "707", refNo: "Ref. 707", title: "Intravenous Fluid and Administration Sets", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "water_drop", color: "slate",
    sections: [
        { type: "header", items: [{ title: "IV Fluids", subtitle: "Ref. 707" }] },
        { type: "text", title: "Purpose", content: "Specifies IV fluid types, quantities, and administration equipment required on ALS units." },
        { type: "list", title: "Required IV Fluids", items: [
            { title: "Normal Saline 0.9%", content: "Primary crystalloid fluid. Minimum 2000mL per ALS unit." },
            { title: "Lactated Ringers", content: "Alternative crystalloid. Minimum 1000mL." },
            { title: "D10 (Dextrose 10%)", content: "For hypoglycemia treatment. Multiple 250mL or 500mL bags." },
            { title: "Pediatric Consideration", content: "Smaller bags (250-500mL) available for pediatric dosing precision." }
        ]},
        { type: "accordion", title: "Administration Sets and Supplies", items: [
            { title: "IV Tubing", content: "Macro-drip (10-15 gtts/mL) and micro-drip (60 gtts/mL) administration sets." },
            { title: "Catheters", content: "IV catheters in multiple sizes (14g-24g). Include pediatric sizes (22-24g)." },
            { title: "Tourniquets", content: "Multiple tourniquets, IV start kits with antiseptic." },
            { title: "Saline Flushes", content: "Pre-filled saline flush syringes for line maintenance." }
        ]}
    ]
  },
  {
    id: "708", refNo: "Ref. 708", title: "Intraosseous (IO) Devices", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "healing", color: "slate",
    sections: [
        { type: "header", items: [{ title: "IO Devices", subtitle: "Ref. 708" }] },
        { type: "text", title: "Purpose", content: "IO access provides rapid vascular access when IV access is difficult or impossible, particularly in cardiac arrest and pediatric emergencies." },
        { type: "list", title: "Required IO Equipment", items: [
            { title: "IO Device", content: "Manual or powered IO device (EZ-IO, BIG, FAST, etc.)." },
            { title: "Needles", content: "Multiple needle sizes for adult and pediatric patients." },
            { title: "Sites", content: "Proximal tibia, distal tibia, humeral head approved insertion sites." },
            { title: "Backup", content: "Minimum 2 IO needles/cartridges per ALS unit." }
        ]},
        { type: "accordion", title: "Use and Maintenance", items: [
            { title: "Indications", content: "Cardiac arrest, shock with failed IV attempts (2 attempts or 90 seconds), status epilepticus with no IV access." },
            { title: "Training", content: "Annual skills verification required for IO insertion." },
            { title: "Battery", content: "If powered device, ensure battery charged and backup battery available." },
            { title: "Expiration", content: "Check needle expiration dates during daily equipment check." }
        ]}
    ]
  },
  {
    id: "709", refNo: "Ref. 709", title: "Blood Glucose Monitoring Devices", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "bloodtype", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Glucometers", subtitle: "Ref. 709" }] },
        { type: "text", title: "Purpose", content: "Point-of-care blood glucose testing is essential for identifying and treating hypoglycemia and hyperglycemia." },
        { type: "list", title: "Equipment Requirements", items: [
            { title: "Glucometer", content: "FDA-approved blood glucose meter for professional use." },
            { title: "Test Strips", content: "Adequate supply of test strips (check expiration dates)." },
            { title: "Lancets", content: "Single-use safety lancets for finger stick." },
            { title: "Quality Control", content: "Control solution for meter calibration/QC testing." }
        ]},
        { type: "accordion", title: "Use and Maintenance", items: [
            { title: "Indications", content: "Altered mental status, diabetic history, seizure, syncope, focal neurologic deficit." },
            { title: "QC Testing", content: "Perform quality control test per manufacturer recommendations (typically weekly or monthly)." },
            { title: "Calibration", content: "Calibrate meter when opening new vial of strips or per manufacturer." },
            { title: "Documentation", content: "Document blood glucose level in PCR with time obtained." }
        ]}
    ]
  },
  {
    id: "710", refNo: "Ref. 710", title: "Basic Life Support Ambulance Equipment", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "medical_services", color: "slate",
    sections: [
        { type: "header", items: [{ title: "BLS Inventory", subtitle: "Ref. 710" }] },
        { type: "text", title: "Purpose", content: "Establishes minimum equipment requirements for BLS ambulances." },
        { type: "accordion", title: "Required BLS Equipment", items: [
            { title: "Airway/Oxygen", content: "OPA, NPA, BVM (adult/ped), oxygen system, suction, nasal cannula, NRB masks." },
            { title: "Cardiac", content: "AED with adult and pediatric capability." },
            { title: "Bleeding Control", content: "Trauma dressings, roller gauze, triangular bandages, tourniquets (CAT or SOF-T)." },
            { title: "Splinting", content: "Rigid splints (various sizes), traction splint, cervical collars (multiple sizes), spinal motion restriction devices." },
            { title: "Patient Assessment", content: "BP cuffs (multiple sizes), stethoscope, penlight, thermometer." }
        ]}
    ]
  },
  {
    id: "711", refNo: "Ref. 711", title: "Airway Equipment - BLS and ALS", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "air", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Airway Equipment", subtitle: "Ref. 711" }] },
        { type: "text", title: "Purpose", content: "Specifies basic and advanced airway equipment requirements for all EMS units." },
        { type: "accordion", title: "BLS Airway Equipment", items: [
            { title: "Oropharyngeal Airways", content: "OPAs in multiple sizes (0, 1, 2, 3, 4, 5 for adult/child range)." },
            { title: "Nasopharyngeal Airways", content: "NPAs in multiple sizes (small, medium, large adult; pediatric)." },
            { title: "Bag-Valve-Mask", content: "BVM with oxygen reservoir - adult and pediatric sizes." },
            { title: "Pocket Mask", content: "Pocket mask with one-way valve for rescue breathing." }
        ]},
        { type: "list", title: "ALS Advanced Airway (in addition to BLS)", items: [
            { title: "Endotracheal Tubes", content: "ETT sizes 2.5-8.5, stylets, 10cc syringe, tape/securing device." },
            { title: "Supraglottic Airways", content: "King LT-D or iGel airways (multiple sizes)." },
            { title: "Laryngoscopes", content: "Laryngoscope handles (backup battery), Miller and Macintosh blades (sizes 0-4)." },
            { title: "Video Laryngoscopy", content: "Optional but recommended for difficult airways." },
            { title: "Rescue Airways", content: "Bougie, gum elastic bougie for difficult intubation." },
            { title: "Capnography", content: "ETCO2 monitoring (waveform) for all intubated patients." }
        ]}
    ]
  },
  {
    id: "712", refNo: "Ref. 712", title: "Immobilization and Spinal Motion Restriction", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "accessible", color: "slate",
    sections: [
        { type: "header", items: [{ title: "SMR Equipment", subtitle: "Ref. 712" }] },
        { type: "text", title: "Purpose", content: "Equipment for spinal motion restriction (SMR) and patient immobilization." },
        { type: "list", title: "Required Equipment", items: [
            { title: "Cervical Collars", content: "Adjustable or sized collars (small, medium, large, pediatric)." },
            { title: "Long Spine Board", content: "Rigid long backboard with head blocks and straps (transitioning to scoop stretcher/vacuum mattress)." },
            { title: "Scoop Stretcher", content: "Preferred for SMR - easier patient transfer, less pressure injuries." },
            { title: "Vacuum Mattress", content: "Optional but provides superior immobilization and comfort." },
            { title: "Extrication Device", content: "KED (Kendrick Extrication Device) or equivalent for seated patient extrication." }
        ]},
        { type: "warning", content: "Current evidence suggests selective spinal motion restriction based on criteria (Ref. 1106), not routine boarding of all trauma patients." }
    ]
  },
  {
    id: "713", refNo: "Ref. 713", title: "Hemorrhage Control Equipment", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "bloodtype", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Bleeding Control", subtitle: "Ref. 713" }] },
        { type: "text", title: "Purpose", content: "Hemorrhage is the leading cause of preventable death in trauma. Proper equipment is essential." },
        { type: "list", title: "Required Equipment", items: [
            { title: "Tourniquets", content: "Minimum 2 CAT (Combat Application Tourniquet) or SOF-T tourniquets per unit." },
            { title: "Hemostatic Dressings", content: "QuikClot, Celox, or similar hemostatic gauze for junctional hemorrhage." },
            { title: "Pressure Dressings", content: "Israeli bandages, compression dressings, ABD pads." },
            { title: "Occlusive Dressings", content: "Vented chest seals for open pneumothorax." }
        ]},
        { type: "accordion", title: "Special Considerations", items: [
            { title: "Junctional Hemorrhage", content: "Bleeding from neck, axilla, groin not amenable to tourniquet - use hemostatic gauze with direct pressure." },
            { title: "Tourniquet Application", content: "Apply high and tight on extremity, above injury site. Tighten until bleeding stops." },
            { title: "Time Documentation", content: "Document tourniquet application time (write on tourniquet with permanent marker)." }
        ]}
    ]
  },
  {
    id: "714", refNo: "Ref. 714", title: "Pediatric Equipment", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Pediatric Equipment", subtitle: "Ref. 714" }] },
        { type: "text", title: "Purpose", content: "All EMS units must carry appropriate equipment for pediatric patients from neonate to adolescent." },
        { type: "accordion", title: "Pediatric Airway", items: [
            { title: "BVM", content: "Pediatric and infant BVM with appropriate masks." },
            { title: "Airways", content: "Pediatric OPA/NPA sizes." },
            { title: "ETT (ALS)", content: "Uncuffed tubes 2.5-5.5, cuffed 5.5-6.5 for older children." },
            { title: "Suction", content: "Pediatric suction catheters (6Fr-14Fr)." }
        ]},
        { type: "list", title: "Other Pediatric Equipment", items: [
            { title: "Length-Based Tape", content: "Broselow tape or similar for weight-based drug dosing and equipment sizing." },
            { title: "IV/IO", content: "Pediatric IV catheters (22-24g), pediatric IO needles." },
            { title: "Cervical Collars", content: "Pediatric collar sizes (infant, child)." },
            { title: "BP Cuffs", content: "Infant, child, and large child blood pressure cuffs." },
            { title: "Warming", content: "Method to prevent hypothermia (blankets, warming pads)." }
        ]}
    ]
  },
  {
    id: "715", refNo: "Ref. 715", title: "Infection Control Supplies", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "clean_hands", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Infection Control", subtitle: "Ref. 715" }] },
        { type: "text", title: "Purpose", content: "Personal protective equipment (PPE) and supplies to prevent disease transmission." },
        { type: "list", title: "Required PPE", items: [
            { title: "Gloves", content: "Adequate supply of exam gloves (nitrile preferred for latex allergy). Multiple sizes." },
            { title: "Eye Protection", content: "Safety glasses or goggles, face shields." },
            { title: "Masks", content: "Surgical masks, N95 respirators (fit-tested for each provider)." },
            { title: "Gowns", content: "Disposable gowns for high-risk exposures." }
        ]},
        { type: "accordion", title: "Disinfection Supplies", items: [
            { title: "Hand Hygiene", content: "Alcohol-based hand sanitizer, antimicrobial wipes." },
            { title: "Surface Disinfection", content: "EPA-approved disinfectant for ambulance surfaces (intermediate level)." },
            { title: "Sharps Container", content: "Puncture-resistant sharps disposal container within reach." },
            { title: "Biohazard Bags", content: "Red biohazard bags for contaminated waste disposal." }
        ]}
    ]
  },
  {
    id: "716", refNo: "Ref. 716", title: "Stretchers and Patient Moving Devices", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "airline_seat_flat", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Patient Moving", subtitle: "Ref. 716" }] },
        { type: "text", title: "Purpose", content: "Proper patient moving equipment reduces injury risk to patients and providers." },
        { type: "list", title: "Required Equipment", items: [
            { title: "Main Stretcher", content: "Wheeled ambulance stretcher with variable height, minimum 450 lb capacity, multiple safety straps." },
            { title: "Stair Chair", content: "Stair chair for confined spaces and stairway evacuations." },
            { title: "Scoop Stretcher", content: "Scoop (orthopedic) stretcher for patient with suspected spinal injury." },
            { title: "Slide Board", content: "Transfer board for lateral patient transfers." }
        ]},
        { type: "accordion", title: "Bariatric Considerations", items: [
            { title: "Weight Capacity", content: "Standard stretcher minimum 450 lbs. Consider bariatric stretcher (800+ lbs) for obese patients." },
            { title: "Lifting Devices", content: "Mechanical lift equipment or additional personnel for safe bariatric patient handling." },
            { title: "Mattress", content: "Bariatric mattress width to prevent patient from rolling off standard stretcher." }
        ]}
    ]
  },
  {
    id: "717", refNo: "Ref. 717", title: "Communication Equipment", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "radio", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Communications", subtitle: "Ref. 717" }] },
        { type: "text", title: "Purpose", content: "Reliable communication equipment is essential for dispatch coordination, medical direction, and hospital notification." },
        { type: "list", title: "Required Communication Devices", items: [
            { title: "Mobile Radio", content: "VHF or UHF mobile radio in ambulance for dispatch communication." },
            { title: "Portable Radio", content: "Handheld portable radio for use outside vehicle and at scene." },
            { title: "Medical Radio", content: "Dedicated medical radio for Base Hospital contact (may be integrated with dispatch radio)." },
            { title: "Cellular Phone", content: "Backup cellular phone for communication if radio fails." }
        ]},
        { type: "accordion", title: "Maintenance and Testing", items: [
            { title: "Daily Test", content: "Test all radios daily and document functionality." },
            { title: "Battery", content: "Ensure portable radio batteries fully charged. Carry spare battery." },
            { title: "Signal Check", content: "Verify radio communication with dispatch at start of shift." },
            { title: "Backup", content: "Cell phone serves as backup if radio communication fails." }
        ]}
    ]
  },
  {
    id: "718", refNo: "Ref. 718", title: "Ambulance Vehicle Standards", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "local_shipping", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Vehicle Standards", subtitle: "Ref. 718" }] },
        { type: "text", title: "Purpose", content: "Ambulances must meet federal KKK-A-1822 specifications and California Title 22 requirements." },
        { type: "list", title: "Vehicle Requirements", items: [
            { title: "Type", content: "Type I (truck chassis/modular box), Type II (van), or Type III (van chassis/modular box)." },
            { title: "Patient Compartment", content: "Minimum interior dimensions per KKK standards, climate control, adequate lighting." },
            { title: "Safety", content: "Seat belts for all occupants, crash-tested equipment mounts, patient restraint system." },
            { title: "Emergency Lighting", content: "Red lights, siren, scene lighting, traffic warning devices." }
        ]},
        { type: "accordion", title: "Vehicle Inspection and Maintenance", items: [
            { title: "Daily Inspection", content: "Pre-shift vehicle inspection (fluids, tires, lights, brakes)." },
            { title: "Preventive Maintenance", content: "Regular maintenance per manufacturer schedule (oil changes, inspections)." },
            { title: "Annual Inspection", content: "California Highway Patrol ambulance inspection annually." },
            { title: "Out of Service", content: "Take vehicle out of service immediately for safety defects." }
        ]}
    ]
  },
  {
    id: "719", refNo: "Ref. 719", title: "Medication Storage and Temperature Control", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "ac_unit", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Medication Storage", subtitle: "Ref. 719" }] },
        { type: "text", title: "Purpose", content: "Medications must be stored within manufacturer-specified temperature ranges to maintain potency and safety." },
        { type: "list", title: "Temperature Requirements", items: [
            { title: "Standard Storage", content: "Most medications: 68-77°F (20-25°C). Excursions permitted 59-86°F." },
            { title: "Refrigerated", content: "Some biologics require 36-46°F (2-8°C) - maintain cooler/refrigerator in ambulance." },
            { title: "Monitoring", content: "Temperature log for medication storage areas. Digital min/max thermometer recommended." },
            { title: "Extreme Temps", content: "In hot climates, medication storage may require insulated boxes or powered cooling." }
        ]},
        { type: "accordion", title: "Medication Management", items: [
            { title: "Expiration Dates", content: "Check medication expiration dates during daily equipment check. Remove expired medications." },
            { title: "Lot Numbers", content: "Document medication lot numbers for recall tracking." },
            { title: "Storage Location", content: "Store medications in secure, organized location. Separate look-alike/sound-alike drugs." },
            { title: "Light Protection", content: "Some medications (nitro, epi) sensitive to light - store in opaque containers." }
        ]}
    ]
  },
  {
    id: "720", refNo: "Ref. 720", title: "Specialized Equipment for Special Operations", category: "Equipment", type: "Policy", lastUpdated: "2024", icon: "construction", color: "slate",
    sections: [
        { type: "header", items: [{ title: "Special Ops Equipment", subtitle: "Ref. 720" }] },
        { type: "text", title: "Purpose", content: "Specialized EMS operations require additional equipment beyond standard ambulance inventory." },
        { type: "accordion", title: "Special Operations Categories", items: [
            { title: "Tactical EMS", content: "Ballistic vests, helmets, tactical medical packs, junctional hemorrhage control devices for law enforcement operations." },
            { title: "Wilderness/Remote", content: "Extended medical packs, hypothermia prevention, improvised litters, satellite communication." },
            { title: "Water Rescue", content: "Personal flotation devices, waterproof medical equipment, hypothermia treatment." },
            { title: "Confined Space", content: "Compact equipment, remote patient monitoring, specialized extrication tools." },
            { title: "HAZMAT", content: "Chemical protective equipment, decontamination supplies, antidote auto-injectors (DuoDote, AtroPen)." }
        ]},
        { type: "list", title: "Training Requirements", items: [
            { title: "Certification", content: "Personnel must have specialized training/certification for special operations roles." },
            { title: "Equipment Familiarity", content: "Regular training and drills with specialized equipment." },
            { title: "Maintenance", content: "Specialized equipment requires specific maintenance schedules." }
        ]}
    ]
  }
];
