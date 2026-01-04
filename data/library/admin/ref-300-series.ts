import { Protocol } from '../../../types';

export const ref300: Protocol = {
  id: "300",
  refNo: "Ref. 300",
  title: "Base Hospital Standards",
  category: "Base Hospital",
  type: "Policy",
  lastUpdated: "Jul 1, 2025",
  icon: "local_hospital",
  color: "blue",
  sections: [
    { type: "header", items: [{ title: "Base Hospital Standards", subtitle: "Ref. 300", icon: "local_hospital" }] },
    { type: "text", content: "Designation requirements for Base Hospitals providing medical direction to prehospital personnel." },
    { type: "accordion", title: "Requirements", items: [
      { title: "Staffing", content: "Must have a Prehospital Care Coordinator (PCC) and Medical Director. 24/7 coverage by certified MICNs and Physicians authorized to give radio orders." },
      { title: "Communication", content: "Maintain ReddiNet, telephone, and radio recording capabilities (records kept for 2 years)." },
      { title: "Quality Improvement", content: "Must hold monthly QI meetings and audit at least 10% of ALS runs." }
    ]}
  ]
};

export const ref302: Protocol = {
  id: "302",
  refNo: "Ref. 302",
  title: "9-1-1 Receiving Hospital Standards",
  category: "Base Hospital",
  type: "Policy",
  lastUpdated: "Jul 1, 2025",
  icon: "local_hospital",
  color: "blue",
  sections: [
    { type: "header", items: [{ title: "Receiving Hospital", subtitle: "Ref. 302", icon: "emergency" }] },
    { type: "list", title: "Key Requirements", items: [
      { title: "Licensure", content: "Must be a licensed General Acute Care Hospital with a Basic or Comprehensive Emergency Medical Service permit." },
      { title: "Availability", content: "Emergency Department open 24 hours/day, 365 days/year." },
      { title: "Staffing", content: "Physician on duty in ED 24/7. RN staffing per Title 22." },
      { title: "Capacity", content: "Must have ICU/CCU capabilities." },
      { title: "Helipad", content: "Preferred, but not mandatory for basic receiving status (Mandatory for Trauma Centers)." }
    ]}
  ]
};

export const ref306: Protocol = {
  id: "306",
  refNo: "Ref. 306",
  title: "Hospital Diversion Requests",
  category: "Base Hospital",
  type: "Policy",
  lastUpdated: "Jul 1, 2025",
  icon: "traffic",
  color: "red",
  sections: [
    { type: "header", items: [{ title: "Diversion Requests", subtitle: "Ref. 306", icon: "traffic" }] },
    { type: "warning", content: "Hospitals may only request diversion when the ability to provide safe patient care is compromised." },
    { type: "accordion", title: "Diversion Categories", items: [
      { title: "ED Saturation (ED Sat)", content: "ED resources fully committed. Request valid for <b>1 hour</b>. Must be updated in ReddiNet." },
      { title: "CT Scanner Failure", content: "CT unavailable. Diverts Stroke and Trauma patients requiring CT." },
      { title: "Trauma Center Overload", content: "Trauma team/OR fully committed. Diverts trauma patients only." },
      { title: "Internal Disaster", content: "Facility physical plant compromised (Fire, Flood, Power Failure, Bomb Threat). <b>CLOSED</b> to all traffic." }
    ]},
    { type: "text", title: "re-Opening", content: "Hospitals must update ReddiNet immediately when the diversion cause is resolved. Forced reopen policies apply if all regional hospitals are on diversion." }
  ]
};