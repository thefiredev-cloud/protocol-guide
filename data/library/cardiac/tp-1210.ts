
import { Protocol } from '../../../types';

export const tp1210: Protocol = {
  id: "1210",
  refNo: "TP-1210",
  title: "Cardiac Arrest",
  category: "Cardiovascular",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Arrest", subtitle: "Adult • Standing Order", icon: "monitor_heart" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Cardiac Arrest – Non-Traumatic (CANT)", content: "" },
        { title: "DOA – Obvious Death (DEAD)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "CPR", content: "High-quality compressions. Minimize interruptions.", icon: "monitor_heart" },
        { title: "Defibrillation", content: "Shockable Rhythms: Shock immediately.", icon: "electric_bolt" },
        { title: "Epinephrine", content: "1mg (1:10,000) IV/IO q 3-5 min.", icon: "medication" },
        { title: "Amiodarone", content: "300mg IV/IO first dose. 150mg second dose.", icon: "pill" }
      ]
    }
  ]
};
