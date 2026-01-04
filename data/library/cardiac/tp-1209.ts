
import { Protocol } from '../../../types';

export const tp1209: Protocol = {
  id: "1209",
  refNo: "TP-1209",
  title: "Behavioral / Psychiatric Crisis",
  category: "General Medical",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "psychology",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Behavioral Crisis", subtitle: "Adult • Standing Order", icon: "psychology" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Behavioral / Psychiatric Crisis (PSYC)", content: "" },
        { title: "Severe Agitation with ALOC (SAAL)", content: "" }
      ]
    },
    {
      type: "warning",
      content: "Ensure scene safety. Use least restrictive means necessary."
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Midazolam (Versed)", content: "<b>5mg</b> IM/IN/IV for severe agitation. Repeat x1 in 5 min.", icon: "medication" },
        { title: "Olanzapine (Zyprexa)", content: "<b>10mg</b> ODT.", icon: "pill" },
        { title: "Restraints", content: "Soft restraints only. Check CMS q 15 min." }
      ]
    }
  ]
};
