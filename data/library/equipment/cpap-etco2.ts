import type { Protocol } from '../../../types';

export const cpapEtco2: Protocol = {
  id: "EQUIP-CPAP-ETCO2",
  refNo: "Ref. 1320",
  title: "CPAP with ETCO2 Monitoring",
  category: "Equipment",
  type: "Equipment Guide",
  lastUpdated: "Feb 2017",
  tags: ["cpap", "etco2", "capnography", "respiratory", "chf", "copd", "pulmonary edema", "respiratory distress"],
  icon: "monitor_heart",
  color: "cyan",
  sections: [
    {
      type: "header",
      items: [{ title: "CPAP with ETCO2", subtitle: "Respiratory Support" }]
    },
    {
      type: "meta",
      data: {
        "Scope": "PARAMEDIC (EMTs can assist with setup)",
        "Starting Pressure": "5 cmH2O",
        "Max Pressure": "10 cmH2O"
      }
    },
    {
      type: "accordion",
      title: "Indications",
      items: [
        { title: "Acute pulmonary edema", content: "CHF with respiratory distress, crackles, pink frothy sputum" },
        { title: "COPD exacerbation", content: "Severe dyspnea with accessory muscle use, prolonged expiratory phase" },
        { title: "Asthma", content: "Severe bronchospasm not responding to nebulized bronchodilators" },
        { title: "Near-drowning", content: "Pulmonary edema from submersion injury" }
      ]
    },
    {
      type: "accordion",
      title: "Contraindications",
      items: [
        { title: "Apnea/respiratory arrest", content: "Patient not breathing spontaneously" },
        { title: "Altered mental status", content: "GCS <10, unable to protect airway" },
        { title: "Facial trauma", content: "Unable to achieve mask seal" },
        { title: "Pneumothorax", content: "Known or suspected pneumothorax" },
        { title: "Vomiting", content: "Active vomiting or high aspiration risk" },
        { title: "Hypotension", content: "SBP <90 mmHg" }
      ]
    },
    {
      type: "clinical-pearl",
      title: "ETCO2 Monitoring",
      content: "ETCO2 monitoring during CPAP helps assess patient response and respiratory status. Decreasing ETCO2 with clinical improvement suggests positive response. Rising ETCO2 with worsening symptoms may indicate need for advanced airway."
    },
    {
      type: "step-by-step",
      title: "Application",
      steps: [
        { stepNumber: 1, title: "Position patient", description: "High Fowler's position (sitting upright) if tolerated" },
        { stepNumber: 2, title: "Explain procedure", description: "Explain mask and positive pressure sensation to patient" },
        { stepNumber: 3, title: "Start at 5 cmH2O", description: "Begin at low pressure and titrate up as needed" },
        { stepNumber: 4, title: "Monitor ETCO2", description: "Attach capnography for continuous ETCO2 monitoring" },
        { stepNumber: 5, title: "Reassess", description: "Reassess respiratory effort, SpO2, ETCO2 every 5 minutes" }
      ]
    },
    {
      type: "warning",
      content: "If patient becomes unresponsive, stops breathing, or vomits, immediately remove CPAP and manage airway with BVM or advanced airway as indicated."
    }
  ]
};
