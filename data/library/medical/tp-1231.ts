
import { Protocol } from '../../../types';

export const tp1231: Protocol = {
  id: "1231",
  refNo: "TP-1231",
  title: "Seizure",
  category: "Neurology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "psychology",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Seizure", subtitle: "Adult • Standing Order", icon: "psychology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Seizure – Active (SEAC)", content: "Generalized tonic-clonic activity." },
        { title: "Seizure – Post (SEPI)", content: "Post-ictal state." }
      ]
    },
    {
      type: "accordion",
      title: "Active Seizure Management",
      items: [
        { title: "Protection", content: "Protect from injury. Do not restrain. Place in recovery position." },
        { title: "Midazolam (Versed)", content: "<b>5mg</b> IM/IN/IV. May repeat x1 in 3-5 min if seizure persists.<br>Max Total: 10mg." },
        { title: "Glucose", content: "Check Blood Glucose. Treat Hypoglycemia (TP-1203) if < 60 mg/dL." }
      ]
    },
    {
      type: "accordion",
      title: "Special Considerations",
      items: [
        { title: "Eclampsia", content: "Seizure in pregnant patient (>20 weeks).<br><b>Magnesium Sulfate:</b> 4g IV/IO slow push over 3-4 min (Refer to TP-1217/MCG)." },
        { title: "Febrile", content: "Passive cooling." }
      ]
    }
  ]
};