import { Protocol } from '../../../types';

export const ref832: Protocol = {
  id: "832",
  refNo: "Ref. 832",
  title: "Refusal of Medical Assistance (AMA)",
  category: "Policies",
  type: "Policy",
  lastUpdated: "Jul 1, 2023",
  icon: "cancel",
  color: "slate",
  sections: [
    {
      type: "header",
      items: [{ title: "AMA Process", subtitle: "Ref. 832 • Policy", icon: "cancel" }]
    },
    {
      type: "warning",
      content: "Capacity is Key. Patient must be Oriented x3 (Person, Place, Time), have no ALOC, no evidence of intoxication/poisoning, and understand risks/consequences."
    },
    {
      type: "accordion",
      title: "Base Contact Required",
      items: [
        { title: "High Risk Complaints", content: "Chest Pain, Shortness of Breath, Syncope, Seizure, Stroke symptoms." },
        { title: "Abnormal Vitals", content: "HR < 60 or > 100, SBP < 90 or > 180, RR < 12 or > 30, SpO2 < 90%." },
        { title: "Mechanism", content: "Significant mechanism of injury (e.g., rollover, auto vs ped)." }
      ]
    },
    {
      type: "text",
      title: "Documentation",
      content: "Clearly document the patient's capacity, the advice given (risks of non-transport), the patient's understanding of those risks, and the plan for follow-up."
    }
  ]
};