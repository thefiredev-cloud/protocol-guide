
import { Protocol } from '../../../types';

export const tp1360: Protocol = {
  id: "1360",
  refNo: "TP-1360",
  title: "Trauma MCG - Pediatrics",
  category: "Trauma",
  type: "Medical Control",
  lastUpdated: "2025",
  icon: "personal_injury",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Trauma MCG", subtitle: "Pediatric • Base Contact", icon: "child_care" }]
    },
    {
      type: "warning",
      content: "<b>Base Hospital Contact Required.</b> Prioritize rapid transport to PTC (Pediatric Trauma Center)."
    },
    {
      type: "accordion",
      title: "Authorized Interventions",
      items: [
        { title: "Tranexamic Acid (TXA)", content: "Consider for signs of hemorrhagic shock. Consult Base for dosing (typically 15mg/kg, max 1g).", icon: "medication" },
        { title: "Needle Thoracostomy", content: "Authorization for chest decompression if signs of tension pneumothorax are present (hypotension, absent breath sounds).", icon: "medical_services" },
        { title: "Fluid Resuscitation", content: "Guidance on permissive hypotension vs aggressive fluid loading based on injury pattern." }
      ]
    }
  ]
};
