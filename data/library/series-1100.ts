import { Protocol } from '../../types';

export const ref1100: Protocol = {
  id: "1100",
  refNo: "Ref. 1100",
  title: "Disaster Management",
  category: "Disaster",
  type: "Policy",
  lastUpdated: "Jul 1, 2025",
  icon: "warning",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Disaster Management", subtitle: "Ref. 1100 • Policy", icon: "warning" }]
    },
    {
      type: "text",
      title: "Activation",
      content: "The EMS Agency Medical Alert Center (MAC) coordinates disaster response. Activation occurs during Multi-Casualty Incidents (MCI), Area-wide emergencies, or State of Emergency declarations."
    },
    {
      type: "accordion",
      title: "Command Structure",
      items: [
        { title: "ICS", content: "All responders shall utilize the Incident Command System (ICS)." },
        { title: "Medical Group Supervisor", content: "Responsible for Triage, Treatment, and Transport units." },
        { title: "MAC Role", content: "The MAC (Medical Alert Center) determines hospital bed availability and allocates patient destinations." }
      ]
    },
    {
      type: "list",
      title: "Provider Responsibilities",
      items: [
        { title: "Notification", content: "Notify MAC immediately via ReddiNet or VMED28 of MCI." },
        { title: "Triage", content: "Use START (Adults) and JumpSTART (Peds) triage." },
        { title: "Resources", content: "Request Disaster Management Support Units (DMSU) for large scale incidents." }
      ]
    }
  ]
};

export const series1100: Protocol[] = [
  ref1100,
  {
    id: "1101", refNo: "Ref. 1101", title: "Multi-Casualty Incident (MCI) Operations", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "warning", color: "red",
    sections: [
      { type: "header", items: [{ title: "MCI Operations", subtitle: "Ref. 1101" }] },
      { type: "text", content: "Operational guidelines for Multi-Casualty Incidents (5+ patients). Implement ICS, establish command, notify MAC, request additional resources, and activate START/JumpSTART triage." }
    ]
  },
  {
    id: "1102", refNo: "Ref. 1102", title: "Disaster Resource Center (DRC)", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "store", color: "red",
    sections: [
      { type: "header", items: [{ title: "DRC", subtitle: "Ref. 1102" }] },
      { type: "text", content: "Designated hospitals with enhanced surge capacity (pharmaceuticals, ventilators, tents) to support the region during disasters." }
    ]
  },
  {
    id: "1103", refNo: "Ref. 1103", title: "Field Triage Area Operations", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "medical_services", color: "red",
    sections: [
      { type: "header", items: [{ title: "Triage Area", subtitle: "Ref. 1103" }] },
      { type: "text", content: "Establishment and operation of field triage areas at MCI scenes. Designate RED (immediate), YELLOW (delayed), GREEN (minor), and BLACK (deceased) treatment zones." }
    ]
  },
  {
    id: "1104", refNo: "Ref. 1104", title: "Field Treatment Area Supervisor", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "assignment_ind", color: "red",
    sections: [
      { type: "header", items: [{ title: "Treatment Supervisor", subtitle: "Ref. 1104" }] },
      { type: "text", content: "Responsibilities of Treatment Area Supervisor including resource allocation, treatment prioritization, and coordination with Transport Supervisor." }
    ]
  },
  {
    id: "1105", refNo: "Ref. 1105", title: "Transportation Supervisor", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "local_shipping", color: "red",
    sections: [
      { type: "header", items: [{ title: "Transport Supervisor", subtitle: "Ref. 1105" }] },
      { type: "text", content: "Coordinates patient transportation from MCI scene. Maintains tracking of ambulance availability, patient destinations, and hospital capacity via MAC coordination." }
    ]
  },
  {
    id: "1106", refNo: "Ref. 1106", title: "START Triage (Adult)", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "person_search", color: "red",
    sections: [
      { type: "header", items: [{ title: "START Triage", subtitle: "Ref. 1106" }] },
      { type: "text", content: "Simple Triage And Rapid Treatment for adult patients. Uses RPM criteria: Respirations (over 30/min = RED), Perfusion (cap refill >2 sec = RED), Mental status (unable to follow commands = RED)." }
    ]
  },
  {
    id: "1107", refNo: "Ref. 1107", title: "JumpSTART Triage (Pediatric)", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "red",
    sections: [
      { type: "header", items: [{ title: "JumpSTART Triage", subtitle: "Ref. 1107" }] },
      { type: "text", content: "Pediatric triage modification of START. Accounts for pediatric vital sign differences. Walking = GREEN. Not breathing after airway positioning = BLACK. Breathing rate, perfusion, AVPU determine color." }
    ]
  },
  {
    id: "1108", refNo: "Ref. 1108", title: "Chempack Deployment", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "science", color: "red",
    sections: [
      { type: "header", items: [{ title: "Chempack", subtitle: "Ref. 1108" }] },
      { type: "text", content: "Deployment of CDC nerve agent antidotes (Atropine/2-PAM/Diazepam) stored at DRCs. Activation via MAC." }
    ]
  },
  {
    id: "1109", refNo: "Ref. 1109", title: "Disaster Management Support Unit (DMSU)", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "rv_hookup", color: "red",
    sections: [
      { type: "header", items: [{ title: "DMSU", subtitle: "Ref. 1109" }] },
      { type: "text", content: "Mobile disaster response units equipped with medical supplies, communications equipment, and triage materials. Request via MAC for large-scale incidents." }
    ]
  },
  {
    id: "1110", refNo: "Ref. 1110", title: "Hospital Surge Capacity Activation", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "local_hospital", color: "red",
    sections: [
      { type: "header", items: [{ title: "Surge Capacity", subtitle: "Ref. 1110" }] },
      { type: "text", content: "Protocols for activating hospital surge capacity during disasters including opening closed units, canceling elective procedures, and early discharge planning." }
    ]
  },
  {
    id: "1111", refNo: "Ref. 1111", title: "Medical Alert Center (MAC) Operations", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "support_agent", color: "red",
    sections: [
      { type: "header", items: [{ title: "MAC Operations", subtitle: "Ref. 1111" }] },
      { type: "text", content: "Central coordination center for disaster response. Monitors hospital bed availability, coordinates patient distribution, activates disaster resources, and provides incident command support." }
    ]
  },
  {
    id: "1112", refNo: "Ref. 1112", title: "Earthquake Response", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "warning", color: "red",
    sections: [
      { type: "header", items: [{ title: "Earthquake Response", subtitle: "Ref. 1112" }] },
      { type: "text", content: "Specific protocols for earthquake disasters including structural safety assessment, utility hazards, crush syndrome treatment, and extended field care." }
    ]
  },
  {
    id: "1113", refNo: "Ref. 1113", title: "Wildfire/Mass Burn Incident", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "local_fire_department", color: "red",
    sections: [
      { type: "header", items: [{ title: "Wildfire Response", subtitle: "Ref. 1113" }] },
      { type: "text", content: "Response to wildfire disasters with multiple burn victims. Coordinate with Burn Resource Centers, apply burn triage criteria, and manage smoke inhalation casualties." }
    ]
  },
  {
    id: "1114", refNo: "Ref. 1114", title: "Hazardous Materials (HAZMAT) MCI", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "warning", color: "red",
    sections: [
      { type: "header", items: [{ title: "HAZMAT MCI", subtitle: "Ref. 1114" }] },
      { type: "text", content: "MCI involving hazardous materials. Establish hot/warm/cold zones, decontamination corridor, and coordinate with HAZMAT teams. Treat only after decontamination." }
    ]
  },
  {
    id: "1115", refNo: "Ref. 1115", title: "Terrorism/Active Shooter Response", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "security", color: "red",
    sections: [
      { type: "header", items: [{ title: "Active Shooter", subtitle: "Ref. 1115" }] },
      { type: "text", content: "Response to terrorism or active shooter incidents. Stage in cold zone until law enforcement secures scene. Implement Rescue Task Force (RTF) for warm zone operations when authorized." }
    ]
  },
  {
    id: "1116", refNo: "Ref. 1116", title: "Biological Agent Response", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "coronavirus", color: "red",
    sections: [
      { type: "header", items: [{ title: "Biological Agent", subtitle: "Ref. 1116" }] },
      { type: "text", content: "Response to suspected biological agent exposure. Implement infection control, isolate patients, notify public health, and coordinate prophylaxis distribution." }
    ]
  },
  {
    id: "1117", refNo: "Ref. 1117", title: "Radiological/Nuclear Incident", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "nuclear", color: "red",
    sections: [
      { type: "header", items: [{ title: "Radiological Event", subtitle: "Ref. 1117" }] },
      { type: "text", content: "Response to radiological or nuclear incidents. Monitor radiation exposure, decontamination procedures, treatment of radiation sickness, and potassium iodide distribution." }
    ]
  },
  {
    id: "1118", refNo: "Ref. 1118", title: "Pandemic Response", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "masks", color: "red",
    sections: [
      { type: "header", items: [{ title: "Pandemic Response", subtitle: "Ref. 1118" }] },
      { type: "text", content: "EMS operations during pandemic including PPE requirements, infection control, modified resuscitation protocols, and alternative care sites." }
    ]
  },
  {
    id: "1119", refNo: "Ref. 1119", title: "Civil Unrest/Riot Response", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "report_problem", color: "red",
    sections: [
      { type: "header", items: [{ title: "Civil Unrest", subtitle: "Ref. 1119" }] },
      { type: "text", content: "EMS operations during civil unrest including scene safety, law enforcement coordination, treatment of riot control agent exposure, and mass arrest medical screening." }
    ]
  },
  {
    id: "1120", refNo: "Ref. 1120", title: "Flooding/Water Rescue MCI", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "flood", color: "red",
    sections: [
      { type: "header", items: [{ title: "Flood Response", subtitle: "Ref. 1120" }] },
      { type: "text", content: "Response to flooding disasters with multiple victims. Coordinate with water rescue teams, treat hypothermia and near-drowning, and ensure provider water safety." }
    ]
  },
  {
    id: "1121", refNo: "Ref. 1121", title: "Transportation Accident MCI", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "car_crash", color: "red",
    sections: [
      { type: "header", items: [{ title: "Transportation MCI", subtitle: "Ref. 1121" }] },
      { type: "text", content: "Mass casualty transportation incidents (bus, train, aircraft). Implement ICS, establish triage, coordinate with specialty rescue teams (urban search & rescue, aviation)." }
    ]
  },
  {
    id: "1122", refNo: "Ref. 1122", title: "Structural Collapse/USAR", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "domain_disabled", color: "red",
    sections: [
      { type: "header", items: [{ title: "Structural Collapse", subtitle: "Ref. 1122" }] },
      { type: "text", content: "Response to building collapse requiring Urban Search and Rescue (USAR). Medical support to USAR teams, confined space medicine, and prolonged extrication care." }
    ]
  },
  {
    id: "1130", refNo: "Ref. 1130", title: "Patient Tracking and Documentation", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "description", color: "red",
    sections: [
      { type: "header", items: [{ title: "Patient Tracking", subtitle: "Ref. 1130" }] },
      { type: "text", content: "Methods for tracking patients during disasters including triage tags, patient tracking forms, and documentation requirements for MCI/disaster incidents." }
    ]
  },
  {
    id: "1131", refNo: "Ref. 1131", title: "Staging Area Operations", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "local_parking", color: "red",
    sections: [
      { type: "header", items: [{ title: "Staging Operations", subtitle: "Ref. 1131" }] },
      { type: "text", content: "Establishment and management of resource staging areas during disasters. Staging Manager coordinates ambulance deployment, equipment distribution, and personnel assignments." }
    ]
  },
  {
    id: "1132", refNo: "Ref. 1132", title: "Ambulance Strike Team Operations", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "airport_shuttle", color: "red",
    sections: [
      { type: "header", items: [{ title: "Strike Teams", subtitle: "Ref. 1132" }] },
      { type: "text", content: "Formation and deployment of ambulance strike teams (5 ambulances + supervisor) for large-scale incidents. Strike team leader coordinates tactical operations." }
    ]
  },
  {
    id: "1133", refNo: "Ref. 1133", title: "Mutual Aid Coordination", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "handshake", color: "red",
    sections: [
      { type: "header", items: [{ title: "Mutual Aid", subtitle: "Ref. 1133" }] },
      { type: "text", content: "Requesting and coordinating mutual aid resources from neighboring counties during disasters. MAC coordinates resource requests through California EMS Authority." }
    ]
  },
  {
    id: "1134", refNo: "Ref. 1134", title: "Emergency Medical Services (EMS) Task Force", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "groups", color: "red",
    sections: [
      { type: "header", items: [{ title: "EMS Task Force", subtitle: "Ref. 1134" }] },
      { type: "text", content: "Deployment of EMS Task Forces for extended operations. Includes ambulances, DMSU, command vehicle, and personnel for 24-hour operational periods." }
    ]
  },
  {
    id: "1135", refNo: "Ref. 1135", title: "Alternate Care Sites (ACS)", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "domain", color: "red",
    sections: [
      { type: "header", items: [{ title: "Alternate Care Sites", subtitle: "Ref. 1135" }] },
      { type: "text", content: "Establishment of Alternate Care Sites when hospitals exceed capacity. Medical shelter operations, minor treatment areas, and patient holding facilities." }
    ]
  },
  {
    id: "1136", refNo: "Ref. 1136", title: "Disaster Medical Supply Cache", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "inventory_2", color: "red",
    sections: [
      { type: "header", items: [{ title: "Supply Cache", subtitle: "Ref. 1136" }] },
      { type: "text", content: "Deployment and management of disaster medical supply caches. Pre-positioned equipment and pharmaceuticals for mass casualty response." }
    ]
  },
  {
    id: "1137", refNo: "Ref. 1137", title: "Communications During Disasters", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "cell_tower", color: "red",
    sections: [
      { type: "header", items: [{ title: "Disaster Comms", subtitle: "Ref. 1137" }] },
      { type: "text", content: "Communication systems during disasters including ReddiNet, VMED28, 800MHz radio, amateur radio, and satellite phone backup systems." }
    ]
  },
  {
    id: "1138", refNo: "Ref. 1138", title: "Burn Resource Center", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "local_fire_department", color: "red",
    sections: [
      { type: "header", items: [{ title: "Burn Resources", subtitle: "Ref. 1138" }] },
      { type: "text", content: "Specialized burn centers with enhanced capacity for mass burn incidents. Coordinate burn patient distribution via MAC to prevent overwhelming single facility." }
    ]
  },
  {
    id: "1139", refNo: "Ref. 1139", title: "Pediatric Disaster Preparedness", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "child_care", color: "red",
    sections: [
      { type: "header", items: [{ title: "Pediatric Disaster", subtitle: "Ref. 1139" }] },
      { type: "text", content: "Special considerations for pediatric patients during disasters including JumpSTART triage, pediatric equipment caches, and pediatric-capable receiving facilities." }
    ]
  },
  {
    id: "1140", refNo: "Ref. 1140", title: "Mental Health Support in Disasters", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "psychology", color: "red",
    sections: [
      { type: "header", items: [{ title: "Mental Health", subtitle: "Ref. 1140" }] },
      { type: "text", content: "Mental health resources during disasters including Critical Incident Stress Management (CISM), psychological first aid, and provider wellness programs." }
    ]
  },
  {
    id: "1141", refNo: "Ref. 1141", title: "Family Reunification Centers", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "family_restroom", color: "red",
    sections: [
      { type: "header", items: [{ title: "Reunification", subtitle: "Ref. 1141" }] },
      { type: "text", content: "Establishment of Family Reunification Centers for separated families during disasters. Coordinate with law enforcement and Red Cross." }
    ]
  },
  {
    id: "1142", refNo: "Ref. 1142", title: "Evacuation and Sheltering Operations", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "exit_to_app", color: "red",
    sections: [
      { type: "header", items: [{ title: "Evacuation/Shelter", subtitle: "Ref. 1142" }] },
      { type: "text", content: "EMS support for evacuation operations including medical support at evacuation sites, ambulance bus operations, and medical sheltering for special needs populations." }
    ]
  },
  {
    id: "1143", refNo: "Ref. 1143", title: "Fatality Management", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "personal_injury", color: "red",
    sections: [
      { type: "header", items: [{ title: "Fatality Management", subtitle: "Ref. 1143" }] },
      { type: "text", content: "Management of deceased patients during disasters including morgue operations, body tracking, coordination with Coroner, and temporary morgue facilities." }
    ]
  },
  {
    id: "1144", refNo: "Ref. 1144", title: "Recovery and After-Action", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "assignment_turned_in", color: "red",
    sections: [
      { type: "header", items: [{ title: "Recovery/After-Action", subtitle: "Ref. 1144" }] },
      { type: "text", content: "Post-disaster recovery operations and after-action reporting requirements. Incident debriefing, lessons learned, and improvement plan development." }
    ]
  },
  {
    id: "1145", refNo: "Ref. 1145", title: "Training and Exercises", category: "Disaster", type: "Policy", lastUpdated: "2024", icon: "fitness_center", color: "red",
    sections: [
      { type: "header", items: [{ title: "Disaster Training", subtitle: "Ref. 1145" }] },
      { type: "text", content: "Required disaster preparedness training and exercise participation for EMS providers. Annual MCI drills, ICS training, and disaster response competencies." }
    ]
  }
];