
import { Protocol } from '../../../types';

export const tp1220: Protocol = {
  id: "1220",
  refNo: "TP-1220",
  title: "Burns",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "local_fire_department",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Burns", subtitle: "Adult • Standing Order", icon: "local_fire_department" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Burn (BURN)", content: "" }
      ]
    },
    {
      type: "calculator",
      title: "Burn TBSA"
    },
    {
      type: "accordion",
      title: "Management",
      items: [
        { title: "Stop Process", content: "Extinguish flames. Cool < 5 mins." },
        { title: "Fluids", content: "If > 20% TBSA: 500mL/hr Normal Saline.", icon: "water_drop" },
        { title: "Pain", content: "Manage aggressively." }
      ]
    }
  ]
};
