import type { Protocol } from '../../../types';

export const posteriorStroke: Protocol = {
  id: "STROKE-POSTERIOR",
  refNo: "Ref. 522",
  title: "Posterior Circulation Stroke Recognition",
  category: "Neurology",
  type: "Clinical Pearl",
  lastUpdated: "Jan 2024",
  tags: ["stroke", "posterior", "vertebral", "basilar", "ataxia", "vertigo", "diplopia", "dysarthria", "LVO", "neuro"],
  icon: "psychology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{ title: "Posterior Circulation Stroke", subtitle: "Recognition Guide" }]
    },
    {
      type: "warning",
      content: "Posterior strokes present atypically - often mistaken for intoxication, vertigo, or inner ear problems. These strokes can be rapidly fatal."
    },
    {
      type: "list",
      title: "Key Findings - 5 D's of Posterior Stroke",
      items: [
        { title: "Dizziness/Vertigo", content: "Severe dizziness, room spinning sensation, worse than typical vertigo" },
        { title: "Diplopia", content: "Double vision, visual disturbances" },
        { title: "Dysarthria", content: "Slurred speech WITHOUT facial droop (unique to posterior stroke)" },
        { title: "Dysphagia", content: "Difficulty swallowing" },
        { title: "Dystaxia/Ataxia", content: "Difficulty with coordination, unsteady gait, limb ataxia" }
      ]
    },
    {
      type: "accordion",
      title: "Additional Findings",
      items: [
        { title: "Nystagmus", content: "Abnormal, jerky eye movements - particularly vertical nystagmus" },
        { title: "Visual Field Deficits", content: "Homonymous hemianopia, cortical blindness" },
        { title: "Altered Mental Status", content: "Confusion, decreased level of consciousness" },
        { title: "Headache", content: "Sudden severe headache, especially occipital" }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Case Example",
      content: "Patient presenting as 'intoxicated' - unsteady gait, slurred speech, but denies alcohol use. Vitals: BP 179/89, HR 88, SpO2 98%, BG 156. This is posterior circulation stroke until proven otherwise."
    },
    {
      type: "warning",
      content: "Standard stroke screens (LAMS, mLAPSS) may be NEGATIVE in posterior strokes. Maintain high index of suspicion with dizziness + any neurological finding."
    },
    {
      type: "info",
      title: "Transport Decision",
      content: "Suspected posterior circulation stroke should be transported to Comprehensive Stroke Center (CSC) capable of endovascular intervention when available."
    }
  ]
};
