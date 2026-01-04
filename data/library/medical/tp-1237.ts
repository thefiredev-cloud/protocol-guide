
import { Protocol } from '../../../types';

export const tp1237: Protocol = {
  id: "1237",
  refNo: "TP-1237",
  title: "Respiratory Distress",
  category: "Respiratory",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "pulmonology",
  color: "cyan",
  sections: [
    {
      type: "header",
      items: [{ title: "Respiratory Distress", subtitle: "Adult • Standing Order", icon: "pulmonology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Respiratory Distress / Bronchospasm (SOBB)", content: "" },
        { title: "Respiratory Distress / Other (RDOT)", content: "" },
        { title: "Respiratory Arrest / Respiratory Failure (RARF)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Bronchospasm",
      items: [
        { title: "Albuterol", content: "5mg Nebulized." },
        { title: "Epinephrine", content: "0.5mg IM for severe distress." }
      ]
    }
  ]
};
