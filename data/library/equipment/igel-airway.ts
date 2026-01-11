import type { Protocol } from '../../../types';

export const igelAirway: Protocol = {
  id: "EQUIP-IGEL",
  refNo: "Ref. 1101",
  title: "iGel Supraglottic Airway",
  category: "Equipment",
  type: "Equipment Guide",
  lastUpdated: "Jan 2022",
  tags: ["igel", "supraglottic", "airway", "biad", "advanced airway", "cardiac arrest", "airway management"],
  icon: "air",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "iGel Airway", subtitle: "Supraglottic Device" }]
    },
    {
      type: "meta",
      data: {
        "Scope": "PARAMEDIC",
        "Size Selection": "Based on patient weight"
      }
    },
    {
      type: "list",
      title: "Size Selection",
      items: [
        { title: "Size 3 (Yellow)", content: "30-60 kg (small adult)" },
        { title: "Size 4 (Green)", content: "50-90 kg (medium adult)" },
        { title: "Size 5 (Orange)", content: ">90 kg (large adult)" }
      ]
    },
    {
      type: "accordion",
      title: "Indications",
      items: [
        { title: "Cardiac arrest", content: "Primary airway device for cardiac arrest management" },
        { title: "Failed intubation", content: "Rescue airway after failed endotracheal intubation" },
        { title: "Respiratory failure", content: "Patient requiring advanced airway with decreased level of consciousness" }
      ]
    },
    {
      type: "step-by-step",
      title: "Insertion Technique",
      steps: [
        { stepNumber: 1, title: "Pre-oxygenate", description: "BVM with high-flow O2, maintain oxygen saturations" },
        { stepNumber: 2, title: "Position patient", description: "Sniffing position if no c-spine concern, neutral if immobilized" },
        { stepNumber: 3, title: "Lubricate", description: "Apply water-based lubricant to posterior surface of cuff" },
        { stepNumber: 4, title: "Insert", description: "Insert with firm continuous pressure along hard palate until resistance felt" },
        { stepNumber: 5, title: "Confirm placement", description: "Confirm with ETCO2 waveform, bilateral breath sounds, chest rise" },
        { stepNumber: 6, title: "Secure", description: "Secure device and note depth marking at teeth/gums" }
      ]
    },
    {
      type: "warning",
      content: "Troubleshooting: If air leak present during ventilation, reposition head/neck, check size selection, consider upsizing. Do not over-inflate cuff - the iGel is a non-inflating cuff design."
    },
    {
      type: "clinical-pearl",
      title: "Gastric Access",
      content: "The iGel has a gastric channel allowing for gastric decompression and suctioning. Insert orogastric tube through the gastric port if gastric distension present."
    }
  ]
};
