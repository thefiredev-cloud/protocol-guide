import { Protocol } from '../../../types';

export const pearlAtypicalSTEMI: Protocol = {
  id: "PEARL-ATYPICAL-STEMI",
  refNo: "Clinical Pearl",
  title: "Atypical STEMI Presentations",
  category: "Clinical Pearls",
  type: "Clinical Decision Support",
  lastUpdated: "Jan 2026",
  tags: ["STEMI", "atypical", "diabetic", "elderly", "female", "12-lead", "cardiac", "silent MI", "pearl"],
  icon: "lightbulb",
  color: "amber",
  sections: [
    {
      type: "header",
      items: [{ title: "Atypical STEMI Presentations", subtitle: "Clinical Pearl • Cardiac", icon: "lightbulb" }]
    },
    {
      type: "warning",
      content: "<b>Critical Teaching Point:</b> STEMIs can present WITHOUT typical chest pain. 'Silent' MI or ischemia occurs in <b>1/3 to 1/2 of acute MIs</b>."
    },
    {
      type: "scoring-tool",
      title: "Atypical Presentations Include",
      items: [
        { title: "Isolated Upper Extremity Discomfort", content: "Right, left, or bilateral arm discomfort without chest pain" },
        { title: "Shortness of Breath", content: "New onset dyspnea without wheezing or respiratory history" },
        { title: "Total Body Weakness/Fatigue", content: "Unexplained generalized weakness or profound fatigue" },
        { title: "Nausea, Vomiting, Indigestion", content: "GI symptoms especially with diaphoresis - consider inferior MI" },
        { title: "Unexplained Diaphoresis", content: "Cold, clammy skin without exertion, fever, or environmental cause" },
        { title: "Jaw Pain", content: "Isolated jaw discomfort without dental cause" },
        { title: "Interscapular Back Pain", content: "Pain between shoulder blades - posterior MI presentation" },
        { title: "Anxiety", content: "Unexplained sense of impending doom" }
      ]
    },
    {
      type: "accordion",
      title: "High-Risk Populations for Atypical Presentation",
      items: [
        {
          title: "Elderly Patients (>65)",
          content: "Often present with weakness, confusion, or syncope rather than chest pain. New AMS in elderly = cardiac until proven otherwise."
        },
        {
          title: "Diabetic Patients",
          content: "Autonomic neuropathy masks typical anginal symptoms. <b>30-40% higher rates of 'silent MI'</b>. Low threshold for 12-lead."
        },
        {
          title: "Female Patients",
          content: "More likely to present with fatigue, nausea, back pain, or jaw pain. Women often disregard early signs. May report difficulty sleeping for <b>weeks before cardiac event</b>."
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Field Impression Tip",
      content: "<b>When in doubt, do the 12-lead.</b> Trust your gut - if something seems wrong with this patient, it probably is. The cost of a 12-lead is low; the cost of missing a STEMI is devastating."
    },
    {
      type: "info",
      title: "Related Protocols",
      content: "See <b>TP-1211 Cardiac Chest Pain</b> and <b>Ref. 504 STEMI Destination Criteria</b>"
    }
  ]
};
