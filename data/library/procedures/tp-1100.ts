import { Protocol } from '../../../types';

export const tp1100: Protocol = {
  id: "1100",
  refNo: "TP-1100",
  title: "MCI Triage",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jul 1, 2025",
  icon: "groups",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "MCI Triage", subtitle: "START / JumpSTART", icon: "groups" }]
    },
    {
      type: "text",
      title: "Principles",
      content: "Triage is the process of sorting patients to do the greatest good for the greatest number. <br><b>START:</b> Simple Triage And Rapid Treatment (Adults).<br><b>JumpSTART:</b> Pediatric patients."
    },
    {
      type: "list",
      title: "Triage Categories",
      items: [
        { title: "IMMEDIATE (Red)", content: "Life-threatening injuries. Treatable with rapid intervention." },
        { title: "DELAYED (Yellow)", content: "Serious but not immediately life-threatening. Can wait." },
        { title: "MINOR (Green)", content: "Walking wounded." },
        { title: "DECEASED/EXPECTANT (Black)", content: "Dead or non-survivable injury." }
      ]
    },
    {
      type: "accordion",
      title: "START Algorithm (Adult)",
      items: [
        { title: "1. Walking?", content: "If patient can walk -> <b>GREEN</b> (Minor)." },
        { title: "2. Respirations (R)", content: "<b>No Breathing:</b> Open airway. If still none -> <b>BLACK</b>. If starts -> <b>RED</b>.<br><b>> 30/min:</b> -> <b>RED</b>.<br><b>< 30/min:</b> Move to Perfusion." },
        { title: "3. Perfusion (P)", content: "<b>No Radial Pulse OR Cap Refill > 2s:</b> -> <b>RED</b>.<br><b>Pulse present / CR < 2s:</b> Move to Mental Status." },
        { title: "4. Mental Status (M)", content: "<b>Can't Follow Commands:</b> -> <b>RED</b>.<br><b>Follows Commands:</b> -> <b>YELLOW</b>." }
      ]
    },
    {
      type: "accordion",
      title: "JumpSTART Algorithm (Pediatric)",
      items: [
        { title: "Apnea Check", content: "If apneic, open airway. If still apneic + pulse palpable -> Give 5 rescue breaths. If still apneic -> <b>BLACK</b>. If breathing resumes -> <b>RED</b>." },
        { title: "Respiratory Rate", content: "<b>< 15 or > 45:</b> -> <b>RED</b>." },
        { title: "Perfusion", content: "<b>No Pulse:</b> -> <b>BLACK</b>." },
        { title: "AVPU", content: "<b>P (Pain) or U (Unresponsive):</b> -> <b>RED</b>.<br><b>A (Alert) or V (Voice):</b> -> <b>YELLOW</b>." }
      ]
    }
  ]
};