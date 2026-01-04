
import { Protocol } from '../../../types';

export const tp1251: Protocol = {
  id: "1251",
  refNo: "TP-1251",
  title: "Burns",
  category: "Trauma",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "local_fire_department",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Burns", subtitle: "Adult • Standing Order", icon: "local_fire_department" }]
    },
    {
      type: "calculator",
      title: "Burn TBSA & Fluid Calculator",
      content: "Estimate TBSA to determine fluid resuscitation needs."
    },
    {
      type: "text",
      title: "General Care",
      content: "Stop the burning process. Remove jewelry. Cool thermal burns with saline < 5 mins. Cover with dry sterile dressing. Keep patient warm."
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Fluid Resuscitation", content: "If > 20% TBSA: <b>500mL/hr</b> Normal Saline IV/IO.", icon: "water_drop" },
        { title: "Pain Management", content: "Treat aggressively per Pain Management Protocol (Fentanyl).", icon: "healing" },
        { title: "Destination", content: "Transport to Burn Center if criteria met (Ref. 512).", icon: "ambulance" }
      ]
    }
  ]
};