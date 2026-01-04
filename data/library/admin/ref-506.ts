import { Protocol } from '../../../types';

export const ref506: Protocol = {
  id: "506",
  refNo: "Ref. 506",
  title: "Trauma Triage",
  category: "Administrative",
  type: "Policy",
  lastUpdated: "Jul 1, 2023",
  icon: "personal_injury",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Trauma Triage Criteria", subtitle: "Ref. 506 • Admin" }]
    },
    {
      type: "accordion",
      title: "Criteria",
      items: [
        { title: "Physiologic", content: "SBP < 90, GCS < 14, RR < 10 or > 29." },
        { title: "Anatomic", content: "Penetrating trauma (head/neck/torso), Flail chest, Pelvic fracture, 2+ proximal long bone fractures, Amputation, Paralysis." },
        { title: "Mechanism", content: "Falls > 20ft, Ejection, Death in same passenger compartment, Auto vs Ped > 20mph." }
      ]
    }
  ]
};