
import { Protocol } from '../../../types';

export const tp1233: Protocol = {
  id: "1233",
  refNo: "TP-1233",
  title: "Syncope / Near Syncope",
  category: "Neurology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "accessibility_new",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Syncope", subtitle: "Adult • Standing Order", icon: "accessibility_new" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Syncope / Near Syncope (SYNC)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Management",
      items: [
        { title: "12-Lead ECG", content: "Mandatory." },
        { title: "Glucose", content: "Check BG." },
        { title: "Fluids", content: "1L Normal Saline if orthostatic." }
      ]
    }
  ]
};
