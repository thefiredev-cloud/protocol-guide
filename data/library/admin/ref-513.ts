import { Protocol } from '../../../types';

export const ref513: Protocol = {
  id: "513",
  refNo: "Ref. 513",
  title: "STEMI Patient Destination",
  category: "Administrative",
  type: "Policy",
  lastUpdated: "Jul 1, 2023",
  icon: "local_hospital",
  color: "red",
  sections: [
    { type: "header", items: [{ title: "STEMI Destination", subtitle: "Ref. 513 • Admin" }] },
    { type: "text", title: "Requirement", content: "Patients with a diagnostic prehospital 12-lead ECG indicating STEMI shall be transported to the nearest STEMI Receiving Center (SRC)." },
    { type: "info", title: "Diversion", content: "If ground transport > 30 mins, consider air transport or closest MAR (contact Base)." }
  ]
};