
import { Protocol } from '../../../types';

export const tp1222: Protocol = {
  id: "1222",
  refNo: "TP-1222",
  title: "Hyperthermia (Environmental)",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "wb_sunny",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Hyperthermia", subtitle: "Adult • Standing Order", icon: "wb_sunny" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Hyperthermia – Environmental (HEAT)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Cooling", content: "Remove clothing. Mist & Fan. Ice packs to axilla/groin." },
        { title: "Fluids", content: "1L Normal Saline IV bolus.", icon: "water_drop" }
      ]
    }
  ]
};
