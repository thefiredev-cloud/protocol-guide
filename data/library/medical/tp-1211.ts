import { Protocol } from '../../../types';

export const tp1211: Protocol = {
  id: "1211",
  refNo: "TP-1211",
  title: "Cardiac Dysrhythmia - Tachycardia",
  category: "Cardiac",
  type: "Standing Order",
  lastUpdated: "Jan 1, 2024",
  icon: "timeline",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Tachycardia", subtitle: "Adult • Standing Order", icon: "timeline" }]
    },
    {
      type: "warning",
      content: "Determine Stability. Unstable = Hypotension, ALOC, Ischemic Chest Pain, Acute Heart Failure."
    },
    {
      type: "accordion",
      title: "Unstable Tachycardia",
      items: [
        { title: "Synchronized Cardioversion", content: "<b>Procedure:</b> Sync mode ON. Select energy (e.g. 100J, 200J). Sedate with Midazolam if conscious." }
      ]
    },
    {
      type: "accordion",
      title: "Stable - Narrow Complex (SVT)",
      items: [
        { title: "Vagal Maneuvers", content: "Valsalva." },
        { title: "Adenosine", content: "<b>First Dose:</b> 6mg IV rapid push.<br><b>Second Dose:</b> 12mg IV rapid push." }
      ]
    },
    {
      type: "accordion",
      title: "Stable - Wide Complex (VT)",
      items: [
        { title: "Amiodarone", content: "150mg IV over 10 min." },
        { title: "12-Lead", content: "Document rhythm." }
      ]
    }
  ]
};