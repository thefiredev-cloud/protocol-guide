
import { Protocol } from '../../../types';

export const tp1245: Protocol = {
  id: "1245",
  refNo: "TP-1245",
  title: "Crush Injury / Syndrome",
  category: "Trauma",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "compress",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Crush Injury", subtitle: "Adult • Standing Order", icon: "compress" }]
    },
    {
      type: "warning",
      content: "Crush Syndrome risk exists for entrapment > 4 hours (or less if severe). Reperfusion can cause cardiac arrest due to Hyperkalemia."
    },
    {
      type: "accordion",
      title: "Pre-Release Treatment",
      items: [
        { title: "Fluid Loading", content: "<b>Normal Saline:</b> 1L IV/IO rapid bolus <b>PRIOR</b> to release of compressive force.", icon: "water_drop" },
        { title: "Pain Management", content: "Treat per Pain Management Protocol (Fentanyl)." },
        { title: "Cardiac Monitoring", content: "Apply pads prior to release." }
      ]
    },
    {
      type: "accordion",
      title: "Post-Release / Hyperkalemia",
      items: [
        { title: "Sodium Bicarbonate", content: "<b>50mEq</b> IV push immediately prior to or during release." },
        { title: "Calcium Chloride", content: "<b>1g</b> IV slow push if QRS widens or peaked T-waves appear." },
        { title: "Albuterol", content: "<b>10mg</b> (continuous neb) to shift potassium." }
      ]
    }
  ]
};