
import { Protocol } from '../../../types';

export const tp1207: Protocol = {
  id: "1207",
  refNo: "TP-1207",
  title: "Shock / Hypotension",
  category: "General Medical",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "low_density_kpi",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Shock / Hypotension", subtitle: "Adult • Standing Order", icon: "low_density_kpi" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Hypotension (HOTN)", content: "SBP < 90 mmHg (asymptomatic)." },
        { title: "Shock (SHOK)", content: "Hypotension with signs of poor perfusion (ALOC, cool/clammy skin, tachycardia)." }
      ]
    },
    {
      type: "accordion",
      title: "Assessment",
      items: [
        { title: "Signs of Shock", content: "Tachycardia, Tachypnea, Hypotension, Altered Mental Status, Pale/Cool/Diaphoretic skin, Delayed Capillary Refill." },
        { title: "Etiology", content: "Consider Hypovolemic, Cardiogenic, Distributive (Sepsis/Anaphylaxis), or Obstructive causes." }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Positioning", content: "Supine with legs elevated (shock position) unless contraindicated." },
        { title: "Fluid Resuscitation", content: "<b>Normal Saline:</b> 1L IV/IO rapid bolus. Reassess lung sounds. Repeat x1 if needed." },
        { title: "Push-Dose Epinephrine", content: "<b>1mL (10mcg)</b> IV/IO q 1-3 min.<br>Indicated for refractory hypotension after 2L fluids (or if fluids contraindicated, e.g., CHF)." },
        { title: "Cardiogenic Shock", content: "If rales present (CHF), avoid fluids. Go straight to Push-Dose Epinephrine." }
      ]
    }
  ]
};