import { Protocol } from '../../../types';

export const tp1238: Protocol = {
  id: "1238",
  refNo: "TP-1238",
  title: "Smoke Inhalation",
  category: "General",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "air",
  color: "gray",
  sections: [
    {
      type: "header",
      items: [{ title: "Smoke Inhalation", subtitle: "Adult • Standing Order", icon: "air" }]
    },
    {
      type: "text",
      title: "Assessment",
      content: "Assess for soot in airway, stridor, or singed nasal hairs. Monitor SpO2 and SpCO (if available)."
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "High Flow Oxygen", content: "15L via Non-Rebreather regardless of SpO2." },
        { title: "Albuterol", content: "5mg (6mL) Nebulized for wheezing/bronchospasm." },
        { title: "Cyanide Toxicity", content: "If cardiac arrest or hypotension in enclosed space fire: <b>Hydroxocobalamin (Cyanokit)</b> 5g IV over 15 min (if available/authorized)." }
      ]
    }
  ]
};