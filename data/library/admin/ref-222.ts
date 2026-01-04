import { Protocol } from '../../../types';

export const ref222: Protocol = {
  id: "222",
  refNo: "Ref. 222",
  title: "Sexual Harassment / Discrimination",
  category: "Administrative",
  type: "Policy",
  lastUpdated: "Jul 1, 2025",
  icon: "security",
  color: "slate",
  sections: [
    {
      type: "header",
      items: [{ title: "Sexual Harassment", subtitle: "Ref. 222 • Policy", icon: "security" }]
    },
    {
      type: "text",
      title: "Policy Statement",
      content: "The EMS Agency maintains a zero-tolerance policy regarding sexual harassment or discrimination by any EMS personnel. All personnel have the right to a work environment free from harassment."
    },
    {
      type: "accordion",
      title: "Definitions",
      items: [
        { title: "Sexual Harassment", content: "Unwelcome sexual advances, requests for sexual favors, and other verbal, visual, or physical conduct of a sexual nature." },
        { title: "Discrimination", content: "Treating individuals differently based on race, color, religion, sex, gender, national origin, age, disability, or sexual orientation." }
      ]
    },
    {
      type: "list",
      title: "Reporting Procedure",
      items: [
        { title: "1. Immediate Notification", content: "Report incident verbally to immediate supervisor or Base Hospital Physician/MICN immediately." },
        { title: "2. Written Report", content: "Submit a written report to the EMS Agency within <b>3 working days</b>." },
        { title: "3. Confidentiality", content: "All complaints will be handled with strict confidentiality to the extent permitted by law." },
        { title: "4. Non-Retaliation", content: "Retaliation against any individual for filing a complaint or participating in an investigation is strictly prohibited." }
      ]
    },
    {
      type: "info",
      title: "Provider Agency Responsibility",
      content: "Provider agencies must have their own internal policies and training regarding sexual harassment prevention. Ref. 222 applies specifically to interactions involving the EMS system, patients, and multi-agency incidents."
    }
  ]
};