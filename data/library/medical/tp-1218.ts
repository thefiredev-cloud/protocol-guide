import { Protocol } from '../../../types';

export const tp1218: Protocol = {
  id: "1218",
  refNo: "TP-1218",
  title: "Drowning / Submersion",
  category: "General",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "water",
  color: "cyan",
  sections: [
    {
      type: "header",
      items: [{ title: "Drowning", subtitle: "Adult • Standing Order", icon: "water" }]
    },
    {
      type: "warning",
      content: "Ensure Scene Safety. Do not become a victim. Consider Spinal Motion Restriction only if history of diving, water slide, or signs of trauma."
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Airway", content: "Suction is critical. Manage airway aggressively." },
        { title: "CPAP", content: "Consider for conscious patients with respiratory distress/pulmonary edema." },
        { title: "Hypothermia", content: "Remove wet clothing. Warm patient per TP-1219." },
        { title: "Cardiac Arrest", content: "Manage per TP-1210. Hypoxic arrest: Prioritize Oxygenation/Ventilation." }
      ]
    }
  ]
};