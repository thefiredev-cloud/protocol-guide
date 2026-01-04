
import { Protocol } from '../../../types';

export const tp1211: Protocol = {
  id: "1211",
  refNo: "TP-1211",
  title: "Cardiac Chest Pain",
  category: "Cardiovascular",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "monitor_heart",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Cardiac Chest Pain", subtitle: "Adult • Standing Order", icon: "monitor_heart" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Chest Pain – Suspected Cardiac (CPSC)", content: "Typical angina, pressure, radiation to jaw/arm." },
        { title: "Chest Pain – STEMI (CPMI)", content: "ST-elevation > 1mm in 2 contiguous leads." }
      ]
    },
    {
      type: "accordion",
      title: "Assessment",
      items: [
        { title: "12-Lead ECG", content: "Perform within <b>10 minutes</b> of patient contact. Transmit if STEMI." },
        { title: "Vitals", content: "Monitor BP, HR, SpO2. Treat for shock if SBP < 90." }
      ]
    },
    {
      type: "accordion",
      title: "Treatment",
      items: [
        { title: "Aspirin", content: "<b>324mg</b> (4 x 81mg) Chewable PO. Give if not taken in last 24h. Contraindicated if active GI bleed or allergy." },
        { title: "Nitroglycerin", content: "<b>0.4mg</b> SL Spray/Tablet. May repeat q 5 min x2 (Max 3 doses).<br><b>Contraindications:</b> SBP < 100, PDE-5 inhibitors (Viagra/Cialis) in last 48h, Inferior MI with RV involvement." },
        { title: "Fentanyl", content: "<b>50mcg</b> IV/IM/IN for persistent pain. May repeat x1 in 5 min.", icon: "medication" },
        { title: "STEMI Destination", content: "Transport to STEMI Receiving Center (SRC)." }
      ]
    }
  ]
};