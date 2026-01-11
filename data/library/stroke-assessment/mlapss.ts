import type { Protocol } from '../../../types';

export const mLAPSS: Protocol = {
  id: "STROKE-MLAPSS",
  refNo: "Ref. 521",
  title: "Modified Los Angeles Prehospital Stroke Screen (mLAPSS)",
  category: "Neurology",
  type: "Assessment Tool",
  lastUpdated: "Jan 2024",
  tags: ["stroke", "mLAPSS", "LAMS", "LVO", "assessment", "posterior circulation", "stroke screen", "neuro"],
  icon: "psychology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "mLAPSS", subtitle: "Stroke Assessment Tool" }]
    },
    {
      type: "warning",
      content: "Perform mLAPSS even when intoxication suspected - posterior circulation strokes often mimic intoxication"
    },
    {
      type: "scoring-tool",
      title: "Assessment Criteria",
      items: [
        { title: "Facial Droop", content: "Asymmetric smile or facial weakness - have patient smile or show teeth" },
        { title: "Arm Drift", content: "Arm weakness or drift when extended - arms out, palms up, eyes closed for 10 seconds" },
        { title: "Grip Strength", content: "Unilateral grip weakness - compare both hands simultaneously" }
      ]
    },
    {
      type: "accordion",
      title: "HAM Assessment",
      items: [
        { title: "History", content: "Chief complaint, onset time (exact if possible), witnessed vs unwitnessed, symptoms progression, recent surgery or trauma" },
        { title: "Allergies", content: "Medication allergies, contrast dye allergies (important for potential CT/CTA)" },
        { title: "Medications", content: "Anticoagulants (warfarin, Eliquis, Xarelto), antiplatelets (aspirin, Plavix), blood pressure medications, diabetes medications" }
      ]
    },
    {
      type: "clinical-pearl",
      title: "LKWT Critical",
      content: "Last Known Well Time is critical for treatment decisions. Document exact time patient was last seen normal. If patient woke with symptoms, LKWT is when they went to sleep."
    },
    {
      type: "info",
      title: "Stroke Center Notification",
      content: "Early notification to receiving stroke center allows activation of stroke team prior to arrival. Transmit 12-lead if available."
    }
  ]
};
