import { Protocol } from '../../../types';

export const tp1228: Protocol = {
  id: "1228",
  refNo: "TP-1228",
  title: "Psychiatric / Behavioral Emergencies",
  category: "General",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "psychology",
  color: "indigo",
  sections: [
    {
      type: "header",
      items: [{ title: "Behavioral Emergency", subtitle: "Adult • Standing Order", icon: "psychology" }]
    },
    {
      type: "warning",
      content: "Ensure Scene Safety. Consider law enforcement support. Rule out medical causes (Hypoglycemia, Hypoxia, Head Injury, Drugs)."
    },
    {
      type: "accordion",
      title: "Agitated Delirium / Severe Agitation",
      items: [
        { title: "Safety", content: "Use least restrictive means necessary. Do not restrain in prone position." },
        { title: "Midazolam (Versed)", content: "<b>5mg IM/IN/IV</b> for severe agitation posing danger to self or others. May repeat x1 in 5 min (<b>up to 10mg total</b> prior to Base Contact).<br><br>For patients >100kg with severe agitation: May administer <b>10mg IM/IN</b> as single dose." },
        { title: "Cooling", content: "If hyperthermia suspected (excited delirium), active cooling measures are critical." }
      ]
    }
  ]
};