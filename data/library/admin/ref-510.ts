
import { Protocol } from '../../../types';

export const ref510: Protocol = {
  id: "510",
  refNo: "Ref. 510",
  title: "Pediatric Patient Destination",
  category: "Administrative",
  type: "Policy",
  lastUpdated: "Jan 1, 2023",
  icon: "child_care",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Pediatric Destination", subtitle: "Ref. 510 • Policy", icon: "child_care" }]
    },
    {
      type: "definitions",
      title: "Definitions",
      items: [
        { title: "Pediatric Patient", content: "Children <b>14 years</b> of age or younger." },
        { title: "PMC", content: "<b>Pediatric Medical Center</b>: Designated for critically ill pediatric patients." },
        { title: "PTC", content: "<b>Pediatric Trauma Center</b>: Designated for critically injured pediatric patients." },
        { title: "EDAP", content: "<b>Emergency Department Approved for Pediatrics</b>: Licensed basic/comprehensive ED designated to receive peds via 9-1-1." },
        { title: "Newly Born", content: "Birth to two hours after birth." },
        { title: "BRUE", content: "<b>Brief Resolved Unexplained Event</b> (<= 12mo): Episode of absent/irregular breathing, color change (cyanosis/pallor), muscle tone change (limp/hypertonic), or altered responsiveness." }
      ]
    },
    {
      type: "text",
      title: "Principle",
      content: "The health and well-being of the patient is the overriding consideration. Factors: severity, stability, facility status, transport time, and judgment."
    },
    {
      type: "list",
      title: "II. PMC Referral Criteria (Critically Ill)",
      items: [
        { title: "A. Cardiac Dysrhythmia", content: "" },
        { title: "B. Severe Respiratory Distress", content: "" },
        { title: "C. Cyanosis", content: "" },
        { title: "D. Altered Mental Status", content: "Without signs of improvement." },
        { title: "E. Status Epilepticus", content: "" },
        { title: "F. BRUE", content: "<= 12 months of age." },
        { title: "G. Focal Neurologic Signs", content: "Not associated with trauma (e.g. stroke, atypical migraine, petit mal seizures)." },
        { title: "H. Post-Arrest ROSC", content: "Return of spontaneous circulation achieved." }
      ]
    },
    {
      type: "accordion",
      title: "I. Transport Guidelines",
      items: [
        { title: "General Rule", content: "Patients not meeting PMC/PTC criteria should be transported to the most accessible EDAP." },
        { title: "Critically Ill (PMC Criteria)", content: "If Section II criteria met:<br>• Transport to PMC if ground time <b><= 30 mins</b>.<br>• If > 30 mins, may go to accessible EDAP." },
        { title: "Trauma (PTC Criteria)", content: "If Trauma Criteria met (Ref. 506):<br>• Transport to PTC if ground time <b><= 30 mins</b>.<br>• If PTC inaccessible, go to Trauma Center.<br>• If neither accessible, go to PMC or EDAP." },
        { title: "Newly Born", content: "• <b>With Distress:</b> Most accessible EDAP that is also Perinatal Center with NICU.<br>• <b>No Distress:</b> Nearest EDAP that is also Perinatal Center." },
        { title: "Uncontrollable Situation", content: "Unmanageable airway or hemorrhage: Transport to most accessible EDAP." },
        { title: "Non-EDAP", content: "May transport to non-EDAP ONLY if requested by patient/family/physician AND they are informed facility is not an EDAP." }
      ]
    },
    {
      type: "link-list",
      title: "Cross References",
      items: [
         { title: "Ref. 316 EDAP Standards" },
         { title: "Ref. 318 PMC Standards" },
         { title: "Ref. 502 Patient Destination" },
         { title: "Ref. 506 Trauma Triage" },
         { title: "Ref. 832 Minors" },
         { title: "Ref. 834 Refusal" }
      ]
    }
  ]
};
