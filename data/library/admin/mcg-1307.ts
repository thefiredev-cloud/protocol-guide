
import { Protocol } from '../../../types';

/**
 * MCG 1307 - Agitation / Excited Delirium Syndrome
 * Source: LA County DHS EMS Agency - Effective July 1, 2025
 * https://dhs.lacounty.gov/emergency-medical-services-agency/
 *
 * CRITICAL: Excited delirium is a medical emergency with high mortality
 */
export const mcg1307: Protocol = {
  id: "1307",
  refNo: "MCG 1307",
  title: "Agitation / Excited Delirium Syndrome",
  category: "Behavioral",
  type: "Medical Control Guideline",
  lastUpdated: "Jul 1, 2025",
  tags: ["excited delirium", "ExDS", "agitation", "ketamine", "sedation", "restraint", "hyperthermia", "behavioral", "chemical restraint", "EMS", "psychiatric", "stimulant"],
  icon: "psychology",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Agitation / Excited Delirium", subtitle: "MCG 1307 • Medical Control Guideline • CRITICAL", icon: "psychology" }]
    },
    {
      type: "warning",
      content: "<b>EXCITED DELIRIUM SYNDROME (ExDS) IS A MEDICAL EMERGENCY</b><br><br>ExDS has a HIGH mortality rate. This is NOT a psychiatric emergency - it is a medical emergency with physiologic derangement that can lead to sudden cardiac arrest.<br><br><b>Immediate sedation and aggressive cooling may be life-saving.</b>"
    },
    {
      type: "section",
      title: "Recognition"
    },
    {
      type: "accordion",
      title: "Excited Delirium Features (Classic Presentation)",
      items: [
        {
          title: "Core Features (3+ = HIGH suspicion)",
          content: "<b>1. Extreme agitation</b> - Combative, violent, uncontrollable<br><b>2. Hyperthermia</b> - Often >104°F (40°C), hot to touch<br><b>3. Diaphoresis</b> - Profuse sweating<br><b>4. Superhuman strength</b> - Unusual strength despite size<br><b>5. Imperviousness to pain</b> - No response to pain stimuli, Taser, OC spray<br><b>6. Bizarre behavior</b> - Disoribing, public nudity, paranoia<br><b>7. Delirium</b> - Confusion, disorientation, incoherent speech"
        },
        {
          title: "Associated Findings",
          content: "• Tachycardia (often >120 bpm)<br>• Dilated pupils<br>• Rapid, shallow breathing<br>• Acidosis (metabolic)<br>• Elevated lactate<br>• Risk of rhabdomyolysis<br>• Sudden collapse / cardiac arrest"
        },
        {
          title: "Common Causes / Associations",
          content: "<b>Stimulant intoxication:</b> Cocaine, methamphetamine, bath salts (cathinones), MDMA, PCP<br><b>Psychiatric:</b> Acute psychosis, mania<br><b>Medical:</b> Hypoglycemia, hyperthyroidism, head trauma, CNS infection<br><br><b>Often:</b> History of recent drug use (known or suspected)"
        },
        {
          title: "Warning Signs of Imminent Collapse",
          content: "<b>Sudden Cessation of Struggle:</b> Patient who was combative suddenly becomes quiet<br><b>Decreased responsiveness</b><br><b>Apnea or agonal breathing</b><br><b>Cardiac arrest</b><br><br>This transition can be abrupt - be prepared for immediate resuscitation."
        }
      ]
    },
    {
      type: "section",
      title: "Treatment Algorithm"
    },
    {
      type: "list",
      title: "Management Priorities",
      items: [
        { title: "1. Scene Safety", content: "Request law enforcement if not already present. Ensure adequate personnel for safe restraint (minimum 4-5 people)." },
        { title: "2. Recognize ExDS", content: "If patient has hyperthermia, extreme agitation, and apparent superhuman strength - treat as ExDS, not routine behavioral." },
        { title: "3. Rapid Sedation - PRIORITY", content: "Chemical sedation is first-line treatment. Do NOT delay for IV access. IM Ketamine is preferred." },
        { title: "4. Avoid Prolonged Struggle", content: "Prolonged physical restraint increases metabolic demand, hyperthermia, and mortality risk. Sedate early." },
        { title: "5. Active Cooling", content: "Remove clothing, apply ice packs to axillae/groin/neck, cold saline if available. Target temp <102°F (39°C)." },
        { title: "6. Monitor for Collapse", content: "Continuous cardiac monitoring. Be prepared for sudden cardiac arrest." }
      ]
    },
    {
      type: "accordion",
      title: "Sedation Protocol",
      items: [
        {
          title: "Ketamine - FIRST LINE for ExDS",
          content: "<b>Indication:</b> Excited delirium or severe agitation with ExDS features<br><br><b>Dose:</b> <b>4 mg/kg IM</b> (round to nearest 50 mg)<br>• 50 kg patient = 200 mg IM<br>• 75 kg patient = 300 mg IM<br>• 100 kg patient = 400 mg IM<br><br><b>Maximum single dose:</b> 500 mg<br><br><b>Onset:</b> 3-5 minutes<br><b>Duration:</b> 15-30 minutes<br><br><b>May repeat:</b> 2 mg/kg IM x1 if inadequate response after 5 min"
        },
        {
          title: "Ketamine Administration",
          content: "<b>IM Injection Sites:</b><br>• Deltoid (up to 4 mL)<br>• Vastus lateralis (up to 5 mL)<br>• May use multiple sites for larger volumes<br><br><b>Concentration:</b> Use 100 mg/mL concentration for IM (500 mg/5 mL)<br><br><b>IV Administration:</b> 1-2 mg/kg IV over 1-2 min if IV access available"
        },
        {
          title: "Post-Ketamine Management",
          content: "<b>MANDATORY:</b><br>• Continuous SpO2 monitoring<br>• Continuous cardiac monitoring<br>• Suction ready at all times<br>• BVM at bedside<br>• Lateral positioning (recovery position) if possible<br><br><b>Emergence reactions:</b> May occur as ketamine wears off (15-30 min). Patient may become agitated again - have additional sedation ready."
        },
        {
          title: "Alternative: Midazolam",
          content: "<b>If ketamine unavailable or contraindicated:</b><br><br><b>Midazolam 10 mg IM</b><br>• May repeat 5 mg IM in 5 minutes if needed<br>• Maximum 20 mg total<br><br>Midazolam has longer onset (5-15 min vs 3-5 min for ketamine) and may be less effective in extreme agitation."
        }
      ]
    },
    {
      type: "section",
      title: "Cooling Protocol"
    },
    {
      type: "accordion",
      title: "Aggressive Cooling Measures",
      items: [
        {
          title: "Immediate Actions",
          content: "• Remove all clothing<br>• Move to cool environment (air conditioned ambulance)<br>• Maximize air circulation (fans, open windows)"
        },
        {
          title: "Active Cooling",
          content: "• Apply ice packs to axillae, groin, and neck<br>• Wet patient with cool water and fan<br>• Cold IV fluids (room temperature or cooled if available)<br>• Avoid shivering - if patient shivers, slow cooling"
        },
        {
          title: "Target Temperature",
          content: "• Goal: Core temperature <102°F (39°C)<br>• Avoid hypothermia (<95°F)<br>• Monitor temperature continuously if possible"
        }
      ]
    },
    {
      type: "section",
      title: "Restraint Considerations"
    },
    {
      type: "warning",
      content: "<b>POSITIONAL ASPHYXIA WARNING</b><br><br><b>NEVER restrain patient in prone (face down) position.</b><br><br>Prone restraint + ExDS = High risk of death from positional asphyxia.<br><br>If physical restraint is necessary, place patient supine or lateral recovery position as soon as possible."
    },
    {
      type: "accordion",
      title: "Restraint Guidance",
      items: [
        {
          title: "Restraint Priorities",
          content: "<b>1. Chemical restraint first</b> - Physical restraint is bridge until sedation takes effect<br><b>2. Use adequate personnel</b> - Minimum 4-5 people for safe takedown<br><b>3. Control limbs, not neck/chest</b> - Avoid compressing airway or chest<br><b>4. Transition to supine ASAP</b> - If prone during takedown, roll to supine/lateral immediately"
        },
        {
          title: "Monitoring While Restrained",
          content: "• Continuous respiratory monitoring<br>• Check level of consciousness frequently<br>• CMS checks every 5 minutes<br>• Cardiac monitoring<br>• Watch for sudden cessation of struggling (bad sign)"
        },
        {
          title: "Medical Restraint vs Physical Restraint",
          content: "Once chemically sedated, physical restraints may be loosened or removed if patient is adequately sedated. Continue monitoring closely."
        }
      ]
    },
    {
      type: "section",
      title: "Cardiac Arrest Considerations"
    },
    {
      type: "info",
      title: "Sudden Collapse / Arrest in ExDS",
      content: "<b>ExDS patients are at high risk for sudden cardiac arrest</b><br><br><b>If arrest occurs:</b><br>• Immediate high-quality CPR<br>• Rapid defibrillation if shockable rhythm<br>• Consider reversible causes (H's and T's)<br>• Early epinephrine<br>• Continue cooling<br><br><b>Prognosis:</b> Poor if arrest occurs, but attempt resuscitation unless obvious death criteria met."
    },
    {
      type: "section",
      title: "Special Considerations"
    },
    {
      type: "accordion",
      title: "Pediatric ExDS",
      items: [
        {
          title: "Pediatric Presentation",
          content: "Rare but can occur, especially with stimulant ingestion or severe psychiatric illness."
        },
        {
          title: "Pediatric Dosing",
          content: "<b>Ketamine:</b> 4 mg/kg IM (same mg/kg as adult)<br><b>Midazolam:</b> 0.2 mg/kg IM (max 10 mg)"
        }
      ]
    },
    {
      type: "accordion",
      title: "Differential Diagnosis",
      items: [
        {
          title: "Conditions Mimicking ExDS",
          content: "• <b>Hypoglycemia</b> - Always check glucose<br>• <b>Hypoxia</b> - Check SpO2<br>• <b>Postictal state</b> - History of seizure<br>• <b>Head trauma</b> - Look for signs of injury<br>• <b>Sepsis</b> - Especially in elderly<br>• <b>Thyroid storm</b> - Known thyroid history<br>• <b>Serotonin syndrome</b> - Recent medication changes, SSRI use"
        },
        {
          title: "Always Check",
          content: "• Blood glucose<br>• SpO2<br>• Temperature<br>• Brief trauma assessment"
        }
      ]
    },
    {
      type: "section",
      title: "Transport and Destination"
    },
    {
      type: "list",
      title: "Transport Priorities",
      items: [
        { title: "Destination", content: "Transport to nearest ED capable of managing critically ill patient. This is NOT a routine psychiatric transport." },
        { title: "Pre-notification", content: "Call ahead: \"Incoming ExDS patient, sedated with ketamine, hyperthermia, actively cooling, preparing for potential arrest.\"" },
        { title: "Ongoing Monitoring", content: "Continuous SpO2, cardiac monitor, frequent reassessment. Have resuscitation equipment ready." },
        { title: "Documentation", content: "Document: ExDS features present, sedation given and response, temperature trend, restraint type and duration, any complications." }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Time Matters:</b> Prolonged struggle = increased mortality. Sedate early and aggressively.<br><br><b>Don't Wait for IV:</b> IM ketamine works. Don't delay sedation trying to get IV access on combative patient.<br><br><b>Prone = Death:</b> Never leave patient prone. This is a known cause of death in ExDS.<br><br><b>Sudden Quiet:</b> A combative patient who suddenly becomes quiet is a bad sign. Check for pulse and prepare for arrest.<br><br><b>This is Medical:</b> ExDS is a medical emergency, not a behavioral problem. Treat the hyperthermia and metabolic crisis.<br><br><b>Cool Aggressively:</b> Hyperthermia kills. Cool the patient even while managing agitation."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1209 Behavioral / Psychiatric Crisis" },
        { title: "TP-1238 Hyperthermia / Heat Stroke" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1204 Overdose / Poisoning" },
        { title: "TP-1229 Altered Level of Consciousness" }
      ]
    }
  ]
};
