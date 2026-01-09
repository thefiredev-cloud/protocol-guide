import { Protocol } from '../../../types';

export const ttCpapEtco2: Protocol = {
  id: "TT-CPAP-ETCO2",
  refNo: "Ref. 1320",
  title: "CPAP with ETCO2 Monitoring",
  category: "Quick Reference",
  type: "Tailboard Talk",
  lastUpdated: "Feb 2017",
  tags: ["CPAP", "ETCO2", "capnography", "respiratory", "tailboard talk", "quick reference", "airway"],
  icon: "monitor_heart",
  color: "cyan",
  sections: [
    {
      type: "header",
      items: [{ title: "CPAP with ETCO2", subtitle: "Tailboard Talk • Ref. 1320", icon: "monitor_heart" }]
    },
    {
      type: "pdf-reference",
      title: "Source",
      content: "LACoFD Tailboard Talk: CPAP with ETCO2, February 2017"
    },
    {
      type: "meta",
      data: {
        "Scope": "PARAMEDIC (EMTs can ASSIST with set-up)",
        "Max Pressure": "10 cmH2O"
      }
    },
    {
      type: "accordion",
      title: "CPAP Indications",
      items: [
        {
          title: "Patient Must Meet ALL FOUR Criteria",
          content: "<b>1.</b> Greater than 14 years of age<br><b>2.</b> Awake<br><b>3.</b> Cooperative<br><b>4.</b> Able to follow commands"
        },
        {
          title: "Approved For",
          content: "Patients with <b>moderate-to-severe respiratory distress</b>"
        }
      ]
    },
    {
      type: "warning",
      title: "CPAP Contraindications",
      content: "• Age 14 years or younger<br>• Uncooperative or unable to follow instructions<br>• Respiratory or cardiac arrest<br>• Suspected pneumothorax<br>• Tracheostomy<br>• Facial, head, or chest trauma<br>• Vomiting<br>• Moderate to severe epistaxis (nosebleed)<br>• Hypotension (<b>SBP < 90 mmHg</b>)"
    },
    {
      type: "accordion",
      title: "ETCO2 Interpretation with CPAP",
      items: [
        {
          title: "Normal (35-45 mmHg)",
          content: "Adequate ventilation. Continue CPAP at current settings."
        },
        {
          title: "Low (<35 mmHg)",
          content: "Hyperventilation OR poor mask seal. Check mask fit and reassure patient."
        },
        {
          title: "High (>45 mmHg)",
          content: "Hypoventilation OR worsening distress. Consider increasing support or transitioning to BVM/intubation."
        },
        {
          title: "Absent Waveform",
          content: "<b>No ventilation OR complete obstruction.</b> Remove CPAP immediately and reassess airway."
        }
      ]
    },
    {
      type: "list",
      title: "Administration Notes",
      items: [
        { content: "Titrate pressure to improvement of signs/symptoms" },
        { content: "Maximum pressure: <b>10 cmH2O</b>" },
        { content: "ETCO2 monitors respiratory status continuously" },
        { content: "Can be used with in-line nebulizer for bronchodilator administration" }
      ]
    },
    {
      type: "info",
      title: "Related Protocols",
      content: "See <b>Ref. 1320 CPAP Protocol</b> for complete indications and procedures."
    }
  ]
};
