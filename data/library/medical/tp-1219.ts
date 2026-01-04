
import { Protocol } from '../../../types';

export const tp1219: Protocol = {
  id: "1219",
  refNo: "TP-1219",
  title: "Allergy / Anaphylaxis",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "coronavirus",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Allergy", subtitle: "Adult • Standing Order", icon: "coronavirus" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Allergic Reaction (ALRX)", content: "" },
        { title: "Anaphylaxis (ANPH)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Epinephrine", content: "0.5mg (1:1,000) IM lateral thigh.", icon: "medication" },
        { title: "Diphenhydramine", content: "50mg IV/IM.", icon: "pill" },
        { title: "Albuterol", content: "5mg Nebulized for wheezing.", icon: "air" }
      ]
    }
  ]
};
