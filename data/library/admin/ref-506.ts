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
        { title: "Mechanism", content: "Falls > 20ft, Ejection, Death in same passenger compartment, Auto vs Ped > 20mph, PSI (Passenger Space Intrusion)." },
        { title: "PSI - Passenger Space Intrusion", content: "<b>Trauma Center criteria:</b><br>• ≥12 inches intrusion at occupant site<br>• ≥18 inches intrusion anywhere in vehicle<br><br><b>Examples:</b><br>• Dashboard displacement into driver's seat area<br>• Steering wheel deformity<br>• Roof collapse<br><br><i>Example query: '59 y/o M 18 in of PSI' → Meets criteria (≥12 in at occupant)</i>" }
      ]
    }
  ]
};