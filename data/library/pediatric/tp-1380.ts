
import { Protocol } from '../../../types';

export const tp1380: Protocol = {
  id: "1380",
  refNo: "TP-1380",
  title: "Burn MCG - Pediatrics",
  category: "Pediatric",
  type: "Medical Control",
  lastUpdated: "2025",
  icon: "local_fire_department",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Burn MCG", subtitle: "Pediatric • Base Contact", icon: "child_care" }]
    },
    {
      type: "warning",
      content: "<b>Base Hospital Contact Required.</b> This guideline authorizes interventions beyond Standing Orders for critical pediatric burns."
    },
    {
      type: "calculator",
      title: "Pediatric Burn TBSA Calculator"
    },
    {
      type: "accordion",
      title: "Authorized Interventions",
      items: [
        {
            title: "Advanced Airway Management",
            content: "Authorization for early endotracheal intubation or supraglottic airway if signs of airway burns (stridor, soot, singed hairs) or impending airway obstruction are present. <b>Use Broselow tape for ETT sizing:</b> 3.0-3.5mm (infant), 4.0-4.5mm (toddler), 5.0-6.5mm (child). Consider one size smaller ETT due to potential airway edema.",
            icon: "pulmonology"
        },
        { 
            title: "Fluid Resuscitation Adjustments", 
            content: "Authorization to adjust fluid resuscitation volumes based on transport time > 1 hour or specific physiologic needs (e.g., Parkland Formula: 3-4mL x kg x %TBSA).", 
            icon: "water_drop" 
        },
        { 
            title: "Advanced Pain Management", 
            content: "Authorization for additional doses of Fentanyl or Morphine exceeding Standing Order maximums for severe pain.", 
            icon: "healing" 
        }
      ]
    },
    {
      type: "info",
      title: "Destination",
      content: "Consider transport to Pediatric Trauma Center (PTC) or Burn Center if criteria met (Ref. 512)."
    }
  ]
};