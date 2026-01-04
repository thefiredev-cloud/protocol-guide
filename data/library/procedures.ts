import { Protocol } from '../../types';

export const procedures: Protocol[] = [
  {
    id: "PROC-AIRWAY", refNo: "Airway Management", title: "Airway Management", category: "Procedures", type: "Procedure", lastUpdated: "Jan 1, 2024", icon: "pulmonology", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Airway Management", subtitle: "Procedure", icon: "pulmonology" }] },
      { type: "accordion", title: "Methods", items: [
        { title: "BLS", content: "OPA/NPA, BVM Ventilation." },
        { title: "ALS - Intubation", content: "Endotracheal Intubation for failure of oxygenation/ventilation. Confirm with Capnography." },
        { title: "ALS - Rescue", content: "iGel/King Airway for failed intubation." }
      ]}
    ]
  },
  {
    id: "PROC-IO", refNo: "IO Access", title: "Intraosseous Access", category: "Procedures", type: "Procedure", lastUpdated: "Jan 1, 2024", icon: "vaccines", color: "blue",
    sections: [
      { type: "header", items: [{ title: "Intraosseous Access", subtitle: "Procedure", icon: "vaccines" }] },
      { type: "text", title: "Indications", content: "Shock, Cardiac Arrest, or urgent need for fluids/meds when IV access fails." },
      { type: "accordion", title: "Sites", items: [
        { title: "Proximal Tibia", content: "2cm below patella, medial flat surface." },
        { title: "Proximal Humerus", content: "Greater tubercle (preferred for adults)." }
      ]}
    ]
  },
  {
    id: "PROC-TCP", refNo: "Transcutaneous Pacing", title: "Transcutaneous Pacing", category: "Procedures", type: "Procedure", lastUpdated: "Jan 1, 2024", icon: "electric_bolt", color: "red",
    sections: [
      { type: "header", items: [{ title: "TCP", subtitle: "Procedure", icon: "electric_bolt" }] },
      { type: "text", title: "Indications", content: "Symptomatic Bradycardia unresponsive to Atropine." },
      { type: "list", title: "Steps", items: [
        { title: "1. Pads", content: "Apply Anterior-Posterior." },
        { title: "2. Mode", content: "Select Pacer mode on monitor." },
        { title: "3. Rate", content: "Set rate 70-80 ppm." },
        { title: "4. Current", content: "Increase mA until capture (electrical + mechanical)." }
      ]}
    ]
  },
  {
    id: "PROC-CPAP", refNo: "CPAP", title: "CPAP", category: "Procedures", type: "Procedure", lastUpdated: "Jan 1, 2024", icon: "air", color: "blue",
    sections: [{ type: "header", items: [{ title: "CPAP", subtitle: "Procedure" }] }, { type: "text", content: "For CHF/COPD/Asthma. Start 5 cmH2O." }]
  },
  {
    id: "PROC-NDL", refNo: "Needle Thoracostomy", title: "Needle Thoracostomy", category: "Procedures", type: "Procedure", lastUpdated: "Jan 1, 2024", icon: "medical_services", color: "red",
    sections: [{ type: "header", items: [{ title: "Needle Decompression", subtitle: "Procedure" }] }, { type: "text", content: "2nd ICS Mid-clavicular or 5th ICS Mid-axillary." }]
  }
];