import { Protocol } from '../../../types';

/**
 * MCG 1318 - ECPR (Extracorporeal Cardiopulmonary Resuscitation)
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 */
export const mcg1318: Protocol = {
  id: "1318",
  refNo: "MCG 1318",
  title: "ECPR - Extracorporeal CPR",
  category: "Administrative",
  type: "Medical Control Guideline",
  lastUpdated: "Jul 1, 2025",
  icon: "cardiology",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "ECPR Patient Criteria", subtitle: "MCG 1318 • Medical Control Guideline", icon: "cardiology" }]
    },
    {
      type: "section",
      title: "Overview"
    },
    {
      type: "text",
      content: "ECPR (Extracorporeal Cardiopulmonary Resuscitation) is an advanced resuscitation technique using ECMO to provide circulatory support during refractory cardiac arrest. LA County ECPR program went live April 1, 2025."
    },
    {
      type: "section",
      title: "Ideal ECPR Candidate"
    },
    {
      type: "list",
      title: "Patient Selection Criteria",
      items: [
        { title: "Age", content: "<b>≤75 years old</b>" },
        { title: "Initial Rhythm", content: "<b>Shockable rhythm (VF/VT)</b> - Initial and refractory" },
        { title: "Witnessed Arrest", content: "<b>Witnessed cardiac arrest</b> with immediate bystander CPR" },
        { title: "Refractory VF/VT", content: "Continued VF despite <b>2 defibrillations</b>" },
        { title: "Transport Time", content: "Within <b>30 minutes transport time</b> to ECPR center" }
      ]
    },
    {
      type: "warning",
      content: "<b>SCENE TIME ≤15 MINUTES</b> - Prioritize rapid transport for refractory VF/VT patients meeting ECPR criteria."
    },
    {
      type: "section",
      title: "Pre-Transport Requirements"
    },
    {
      type: "list",
      title: "Required Before Transport",
      items: [
        { title: "1. Pulse Checks", content: "Perform at least <b>2 pulse checks</b> confirming persistent arrest" },
        { title: "2. Mechanical Compression Device", content: "Place <b>LUCAS or AutoPulse</b> - ensure proper positioning in lower third of sternum" },
        { title: "3. Advanced Airway", content: "Place <b>i-gel airway</b> or endotracheal intubation" },
        { title: "4. Waveform Capnography", content: "Confirm airway placement with <b>waveform EtCO2</b>" },
        { title: "5. Base Contact", content: "Contact base for destination guidance - <b>do NOT delay transport</b> for base order" }
      ]
    },
    {
      type: "section",
      title: "Quality Monitoring During Transport"
    },
    {
      type: "accordion",
      title: "EtCO2 Monitoring",
      items: [
        { title: "Expected EtCO2", content: "Waveform EtCO2 should be used to evaluate quality compressions and MCD positioning." },
        { title: "Low/Decreasing EtCO2", content: "If EtCO2 lower than expected or decreasing, evaluate for:<br>• Hyperventilation<br>• Advanced airway displacement<br>• Poor perfusion due to MCD migration" },
        { title: "LUCAS Repositioning", content: "Initial positioning should be in lower third of sternum. Monitor piston location continuously." }
      ]
    },
    {
      type: "section",
      title: "Contraindications"
    },
    {
      type: "list",
      title: "Do NOT transport for ECPR if:",
      items: [
        { title: "Traumatic Arrest", content: "Cardiac arrest due to trauma" },
        { title: "DNR/POLST", content: "Valid Do Not Resuscitate order or POLST limiting resuscitation" },
        { title: "Unwitnessed Arrest", content: "No witness to arrest and no immediate CPR" },
        { title: "Non-Shockable Rhythm", content: "Initial rhythm PEA or asystole (not VF/VT)" },
        { title: "Prolonged Downtime", content: "Extended time without CPR before EMS arrival" },
        { title: "Transport Time >30 min", content: "No ECPR center accessible within 30 minutes" }
      ]
    },
    {
      type: "section",
      title: "Communication"
    },
    {
      type: "text",
      content: "Contact ECPR center as early as possible. Provide: patient age, initial rhythm, number of shocks delivered, CPR quality indicators (EtCO2), and ETA. <b>Do NOT delay transport initiation for base order.</b>"
    },
    {
      type: "link-list",
      title: "Cross References",
      items: [
        { title: "TP-1210 Cardiac Arrest" },
        { title: "Ref. 518 Post-Arrest Care" },
        { title: "MCG 1375 Vascular Access" },
        { title: "MCG 1302 Oxygen Administration" }
      ]
    }
  ]
};
