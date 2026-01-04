
import { Protocol } from '../../../types';

export const tp1241: Protocol = {
  id: "1241",
  refNo: "TP-1241",
  title: "Overdose / Poisoning",
  category: "Toxicology",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "science",
  color: "yellow",
  sections: [
    {
      type: "header",
      items: [{ title: "Overdose", subtitle: "Adult • Standing Order", icon: "science" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Overdose / Poisoning (ODPO)", content: "" },
        { title: "Alcohol Intoxication (ETOH)", content: "" }
      ]
    },
    {
      type: "accordion",
      title: "Opioid Overdose",
      items: [
        { title: "Signs", content: "Respiratory depression (< 8/min), pinpoint pupils, ALOC." },
        { title: "Naloxone (Narcan)", content: "<b>2-4mg</b> IN<br>OR<br><b>0.4mg - 2mg</b> IV/IM.<br>Goal is adequate respiration, not full wakefulness. Titrate to effect." }
      ]
    },
    {
      type: "accordion",
      title: "Other Toxidromes",
      items: [
        { title: "Tricyclic Antidepressants (TCA)", content: "Signs: Wide QRS, hypotension, tachycardia.<br><b>Sodium Bicarbonate:</b> 50mEq IV push." },
        { title: "Calcium Channel Blockers", content: "Signs: Bradycardia, hypotension.<br><b>Calcium Chloride:</b> 1g slow IV push." },
        { title: "Organophosphates", content: "Signs: SLUDGE-M (Salivation, Lacrimation, Urination, Defecation, GI upset, Emesis, Miosis).<br><b>Atropine:</b> 2mg IV q 5 min until dry." },
        { title: "Stimulants", content: "Treat agitation with Midazolam per TP-1229. Treat chest pain per TP-1211." }
      ]
    }
  ]
};