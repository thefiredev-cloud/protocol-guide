import { Protocol } from '../../../types';

export const ref520: Protocol = {
  id: "520",
  refNo: "Ref. 520",
  title: "Cardiac Arrest Management",
  category: "Policies",
  type: "Policy",
  lastUpdated: "Jul 1, 2023",
  icon: "monitor_heart",
  color: "slate",
  sections: [
    { type: "header", items: [{ title: "Cardiac Arrest Mgmt", subtitle: "Ref. 520 • Policy" }] },
    { type: "text", title: "Roles", content: "Team Leader should be designated. Roles: Compressor, Airway, Meds/Monitor." },
    { type: "warning", content: "Do not interrupt CPR for > 10 seconds. Change compressor every 2 minutes." },
    { type: "accordion", title: "Transport", items: [
      { title: "ROSC", content: "Transport to STEMI Center (SRC) regardless of 12-lead findings." },
      { title: "Refractory VF", content: "Consider transport after 20 mins if persistent VF/VT." },
      { title: "Asystole/PEA", content: "Pronounce on scene if criteria met (Ref. 814)." }
    ]}
  ]
};