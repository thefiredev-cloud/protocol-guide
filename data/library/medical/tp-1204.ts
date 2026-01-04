
import { Protocol } from '../../../types';

export const tp1204: Protocol = {
  id: "1204",
  refNo: "TP-1204",
  title: "Fever / Sepsis",
  category: "General Medical",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "thermostat",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Fever / Sepsis", subtitle: "Adult • Standing Order", icon: "thermostat" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Fever (FEVR)", content: "" },
        { title: "Sepsis (SEPS)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Sepsis Criteria",
      items: [
        { title: "Indicators", content: "Suspected infection + 2 or more:<br>• Temp > 100.4F or < 96.8F<br>• HR > 90<br>• RR > 20<br>• EtCO2 < 25 mmHg" }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Fluid Resuscitation", content: "<b>Normal Saline:</b> 1L IV/IO rapid bolus. Reassess. Repeat x1 if SBP < 90.", icon: "water_drop" },
        { title: "Push-dose Epinephrine", content: "If shock persists after 2L: 1mL (10mcg) IV/IO q 1-3 min.", icon: "medication" },
        { title: "Cooling", content: "Active cooling measures for high fever." }
      ]
    }
  ]
};
