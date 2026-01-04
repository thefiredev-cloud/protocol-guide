import { Protocol } from '../../../types';

export const procTCP: Protocol = {
  id: "PROC-TCP",
  refNo: "Transcutaneous Pacing",
  title: "Transcutaneous Pacing",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jan 1, 2024",
  icon: "electric_bolt",
  color: "red",
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
};