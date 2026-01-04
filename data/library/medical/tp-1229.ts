
import { Protocol } from '../../../types';

export const tp1229: Protocol = {
  id: "1229",
  refNo: "TP-1229",
  title: "ALOC",
  category: "Neurology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "psychology",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "ALOC", subtitle: "Adult • Standing Order", icon: "psychology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "ALOC – Not Hypoglycemia or Seizure (ALOC)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Interventions",
      items: [
        { title: "Blood Glucose", content: "Check and treat." },
        { title: "Naloxone", content: "2-4mg IN for suspected opioid OD.", icon: "medication" }
      ]
    }
  ]
};
