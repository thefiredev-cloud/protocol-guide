
import { Protocol } from '../../../types';

export const tp1242: Protocol = {
  id: "1242",
  refNo: "TP-1242",
  title: "Crush Injury / Syndrome",
  category: "Trauma",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "compress",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{ title: "Crush Injury", subtitle: "Adult • Standing Order", icon: "compress" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Traumatic Injury (TRMA)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Pre-Release Fluids", content: "1L NS IV/IO." },
        { title: "Sodium Bicarb", content: "50mEq IV prior to release." }
      ]
    }
  ]
};
