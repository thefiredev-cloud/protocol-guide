
import { Protocol } from '../../../types';

export const ref808: Protocol = {
  id: "808",
  refNo: "Ref. 808",
  title: "Base Hospital Contact",
  category: "Policies",
  type: "Policy",
  lastUpdated: "Jul 1, 2023",
  icon: "call",
  color: "slate",
  sections: [
    {
      type: "header",
      items: [{ title: "Base Hospital Contact", subtitle: "Ref. 808 • Policy", icon: "call" }]
    },
    {
      type: "text",
      title: "Principle",
      content: "Base Hospital contact is required for medical direction and patient destination decisions."
    },
    {
      type: "accordion",
      title: "Mandatory Contact Criteria",
      items: [
        { title: "Cardiac Arrest", content: "All non-traumatic cardiac arrests (unless determined dead per Ref. 814)." },
        { title: "Trauma", content: "Patients meeting Trauma Center Criteria (Ref. 506) or Guidelines." },
        { title: "Stroke", content: "Positive mLAPSS." },
        { title: "STEMI", content: "Positive 12-Lead ECG." },
        { title: "Pediatric", content: "Children < 12 months old (regardless of complaint) or BRUE." },
        { title: "High Risk Complaints (AMA)", content: "Base contact required if patient wishes to refuse care/transport and presents with:<br>• <b>Chest Pain</b> (suspected cardiac)<br>• <b>Shortness of Breath</b> / Dyspnea<br>• <b>Syncope</b> / Loss of Consciousness<br>• <b>Seizure</b> (new onset or multiple)<br>• <b>Focal Neurologic Deficits</b><br>• <b>GI Bleed</b> (symptomatic)" },
        { title: "Abnormal Vitals (AMA)", content: "Base contact required if patient wishes to refuse care/transport and vitals are:<br>• <b>HR:</b> < 60 or > 100<br>• <b>SBP:</b> < 90 or > 180<br>• <b>RR:</b> < 12 or > 30<br>• <b>SpO2:</b> < 90%" },
        { title: "Medications", content: "Prior to administering medications listed as 'Base Contact Required' (e.g., Push-dose Epi in Peds)." }
      ]
    }
  ]
};
