
import { Protocol } from '../../../types';

export const procCPAP: Protocol = {
  id: "PROC-CPAP",
  refNo: "CPAP",
  title: "Continuous Positive Airway Pressure",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jul 1, 2025",
  icon: "air",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "CPAP", subtitle: "Procedure", icon: "air" }]
    },
    {
      type: "list",
      title: "Indications",
      items: [
        { title: "Respiratory Distress", content: "Moderate to severe distress due to:" },
        { title: "CHF / Pulmonary Edema", content: "Most effective indication." },
        { title: "COPD / Asthma", content: "Bronchospasm." },
        { title: "Drowning", content: "If patient is awake and breathing." },
        { title: "Pneumonia", content: "Severe respiratory infection." }
      ]
    },
    {
      type: "warning",
      content: "<b>Contraindications:</b><br>• Respiratory/Cardiac Arrest<br>• Agonal respirations<br>• Unconscious/Unresponsive (GCS < 8)<br>• Shock (SBP < 90)<br>• Facial trauma/burns preventing seal<br>• Vomiting or GI Bleed"
    },
    {
      type: "list",
      title: "Procedure",
      items: [
        { title: "1. Equipment", content: "Connect circuit to O2 source (50 psi). Attach mask to circuit." },
        { title: "2. Explanation", content: "Explain procedure to patient. It will feel like 'head out the car window'." },
        { title: "3. Application", content: "Apply mask firmly to face. Secure head straps." },
        { title: "4. Titration", content: "Start at <b>5 cmH2O</b>. Titrate up to <b>10 cmH2O</b> if needed for hypoxia/effort." },
        { title: "5. Meds", content: "Inline nebulizer (Albuterol) can be used with CPAP." }
      ]
    },
    {
      type: "info",
      title: "Troubleshooting",
      content: "If patient deteriorates or cannot tolerate CPAP, remove immediately and assist ventilations with BVM or consider intubation."
    }
  ]
};
