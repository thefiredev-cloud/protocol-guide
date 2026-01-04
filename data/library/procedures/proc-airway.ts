import { Protocol } from '../../../types';

export const procAirway: Protocol = {
  id: "PROC-AIRWAY",
  refNo: "Airway Management",
  title: "Airway Management",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jan 1, 2024",
  icon: "pulmonology",
  color: "blue",
  sections: [
    { type: "header", items: [{ title: "Airway Management", subtitle: "Procedure", icon: "pulmonology" }] },
    { type: "accordion", title: "Methods", items: [
      { title: "BLS", content: "OPA/NPA, BVM Ventilation." },
      { title: "ALS - Intubation", content: "Endotracheal Intubation for failure of oxygenation/ventilation. Confirm with Capnography." },
      { title: "ALS - Rescue", content: "iGel/King Airway for failed intubation." }
    ]}
  ]
};