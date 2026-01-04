
import { Protocol } from '../../../types';

export const tp1240: Protocol = {
  id: "1240",
  refNo: "TP-1240",
  title: "HAZMAT",
  category: "Toxicology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "warning",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "HAZMAT", subtitle: "Adult • Standing Order", icon: "warning" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "HAZMAT Exposure (DCON)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Nerve Agent",
      items: [
        { title: "Atropine", content: "2mg IV/IM repeated until dry." },
        { title: "Pralidoxime", content: "If available." }
      ]
    }
  ]
};
