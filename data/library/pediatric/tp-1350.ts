
import { Protocol } from '../../../types';

export const tp1350: Protocol = {
  id: "1350",
  refNo: "TP-1350",
  title: "General Medical MCG - Pediatrics",
  category: "Pediatric",
  type: "Medical Control",
  lastUpdated: "2025",
  icon: "medical_services",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "General Medical MCG", subtitle: "Pediatric • Base Contact", icon: "child_care" }]
    },
    {
      type: "warning",
      content: "<b>Base Hospital Contact Required</b> prior to initiating these treatments unless otherwise specified."
    },
    {
      type: "text",
      title: "Principle",
      content: "This guideline is utilized for complex pediatric medical cases that do not fit into specific Standing Orders or require interventions beyond standard scope."
    },
    {
      type: "accordion",
      title: "Authorized Interventions",
      items: [
        { title: "Fluid Resuscitation", content: "Additional Normal Saline boluses (20mL/kg) beyond Standing Order (Max 60mL/kg total).", icon: "water_drop" },
        { title: "Push-Dose Epinephrine", content: "<b>0.1 - 1 mcg/kg</b> IV/IO (Diluted 10mcg/mL) for refractory hypotension.", icon: "medication" },
        { title: "Calcium Chloride", content: "<b>20 mg/kg</b> (0.2 mL/kg) IV/IO for Calcium Channel Blocker OD or Hyperkalemia.", icon: "medication" },
        { title: "Glucagon", content: "<b>0.5 mg</b> (<10kg) or <b>1 mg</b> (>=10kg) IV/IM for Beta Blocker OD.", icon: "medication" },
        { title: "Sodium Bicarbonate", content: "<b>1 mEq/kg</b> IV/IO for TCA OD or Hyperkalemia.", icon: "medication" },
        { title: "Dextrose", content: "Repeat dosing for persistent hypoglycemia.", icon: "water_drop" }
      ]
    }
  ]
};
