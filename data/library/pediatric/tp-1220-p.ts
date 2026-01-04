
import { Protocol } from '../../../types';

export const tp1220p: Protocol = {
  id: "1220-P",
  refNo: "TP-1220-P",
  title: "Burns - Pediatrics",
  category: "Pediatric",
  type: "Standing Order",
  lastUpdated: "2025",
  icon: "local_fire_department",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Burns (Peds)", subtitle: "Pediatric • Standing Order", icon: "child_care" }]
    },
    {
      type: "warning",
      content: "Stop the burning process. Remove jewelry/clothing. Do not apply ice."
    },
    {
      type: "text",
      title: "Pediatric Rule of Nines (Approx)",
      content: "<b>Head:</b> 18%<br><b>Torso (Front):</b> 18%<br><b>Torso (Back):</b> 18%<br><b>Arms:</b> 9% each<br><b>Legs:</b> 14% each"
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Thermal Burns", content: "Cool with saline < 5 mins. Cover with dry sterile dressing. Keep warm to prevent hypothermia." },
        { title: "Fluid Resuscitation", content: "If signs of shock OR > 10% TBSA deep burns:<br><b>Normal Saline 20mL/kg</b> IV/IO bolus.", icon: "water_drop" },
        { title: "Pain Management", content: "<b>Fentanyl 1mcg/kg</b> IV/IM/IN (Max 50mcg).", icon: "healing" }
      ]
    },
    {
      type: "info",
      title: "Destination",
      content: "Transport to Pediatric Trauma Center (PTC) or Burn Center based on criteria."
    }
  ]
};
