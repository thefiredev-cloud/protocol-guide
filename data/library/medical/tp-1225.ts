import { Protocol } from '../../../types';

export const tp1225: Protocol = {
  id: "1225",
  refNo: "TP-1225",
  title: "Submersion / Drowning",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "pool",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Submersion / Drowning", subtitle: "Adult - Standing Order", icon: "pool" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "SUBM", content: "Submersion Injury - Water aspiration with respiratory compromise" },
        { title: "DROW", content: "Drowning - Process of respiratory impairment from submersion" },
        { title: "NFDR", content: "Non-fatal Drowning - Survived submersion event (replace term 'near-drowning')" },
        { title: "HYPO", content: "Hypothermia - Consider concurrent cold water injury (see TP-1223)" }
      ]
    },
    {
      type: "warning",
      content: "<b>DROWNING IS A HYPOXIC EVENT:</b> The primary insult is hypoxia from water aspiration and laryngospasm. Resuscitation focuses on oxygenation and ventilation. Early, aggressive airway management and rescue breathing improve survival."
    },
    {
      type: "section",
      title: "Pathophysiology"
    },
    {
      type: "accordion",
      title: "Understanding Drowning",
      items: [
        {
          title: "Definition (WHO/ILCOR)",
          content: "<b>Drowning:</b> The process of experiencing respiratory impairment from submersion/immersion in liquid<br><br><b>Outcomes:</b><br>- Death<br>- Morbidity (survival with injury)<br>- No morbidity (survival without injury)<br><br><b>Replaced terms:</b><br>- 'Near-drowning' - no longer recommended<br>- 'Dry drowning' - inaccurate, discontinued<br>- 'Secondary drowning' - misleading, not a valid entity",
          icon: "info"
        },
        {
          title: "Sequence of Events",
          content: "<b>1. Initial submersion:</b><br>- Breath-holding, struggle<br>- Laryngospasm (protective reflex)<br><br><b>2. Aspiration:</b><br>- Laryngospasm relaxes<br>- Water enters airways<br>- Pulmonary edema, surfactant washout<br>- V/Q mismatch<br><br><b>3. Hypoxia:</b><br>- Progressive oxygen desaturation<br>- Loss of consciousness<br>- Cardiac arrest (if untreated)<br><br><b>Duration matters:</b> Outcome depends on duration of hypoxia before rescue breathing",
          icon: "timeline"
        },
        {
          title: "Freshwater vs Saltwater - THE MYTH",
          content: "<b>Clinically, the distinction does NOT matter:</b><br><br><b>Historical teaching (largely obsolete):</b><br>- Freshwater: Hypotonic, absorbed into circulation<br>- Saltwater: Hypertonic, pulls fluid into lungs<br><br><b>Modern understanding:</b><br>- Volume aspirated in survivors is small (< 4 mL/kg)<br>- Electrolyte disturbances rarely clinically significant<br>- Both cause surfactant washout and pulmonary edema<br>- Both cause V/Q mismatch and hypoxia<br><br><b>Treatment is identical:</b> Focus on oxygenation and ventilation, not water type",
          icon: "science"
        }
      ]
    },
    {
      type: "section",
      title: "Scene Management"
    },
    {
      type: "accordion",
      title: "Rescue and Initial Assessment",
      items: [
        {
          title: "Scene Safety",
          content: "<b>Rescuer safety is paramount:</b><br>- Do NOT become a second victim<br>- Use reaching/throwing assists when possible<br>- Trained water rescue only<br>- Swift water = specialized rescue<br><br><b>Remove from water:</b><br>- Horizontal position if possible (prevents cardiovascular collapse)<br>- Support head/neck if trauma suspected<br>- Once on land/deck, begin assessment",
          icon: "warning"
        },
        {
          title: "Cervical Spine Considerations",
          content: "<b>C-spine precautions indicated if:</b><br>- Diving injury<br>- Water slide injury<br>- Surfing/waterskiing/boating accident<br>- Shallow water injury<br>- Signs of head/neck trauma<br>- Found unconscious in water (unknown mechanism)<br><br><b>C-spine precautions NOT routinely indicated:</b><br>- Unwitnessed submersion in pool without diving<br>- Bathtub drowning<br>- Open water submersion without trauma<br><br><b>Key point:</b> Do NOT delay airway management for C-spine immobilization. Hypoxia is the primary threat.",
          icon: "accessibility"
        },
        {
          title: "Immediate Assessment",
          content: "<b>Rapid assessment (water rescue ABC):</b><br>- A: Airway - Can they cough, speak?<br>- B: Breathing - Respiratory effort? Rate?<br>- C: Circulation - Pulse present?<br><br><b>Triage drowning victims:</b><br>- Asymptomatic (coughing, alert)<br>- Symptomatic (respiratory distress, AMS)<br>- Cardiac arrest (pulseless)<br><br><b>Do NOT:</b><br>- Attempt to drain water from lungs (Heimlich maneuver)<br>- Delay rescue breathing for anything other than airway obstruction"
        }
      ]
    },
    {
      type: "section",
      title: "Resuscitation"
    },
    {
      type: "accordion",
      title: "Drowning Resuscitation",
      items: [
        {
          title: "In-Water Rescue Breathing",
          content: "<b>If trained and safe:</b><br>- Begin rescue breathing in water<br>- Mouth-to-mouth or pocket mask<br>- 10-12 breaths per minute<br>- Remove from water as soon as possible for compressions<br><br><b>Compressions in water:</b><br>- NOT effective (no firm surface)<br>- Do NOT delay removal to attempt compressions",
          icon: "scuba_diving"
        },
        {
          title: "Airway Management - PRIORITY",
          content: "<b>Drowning is primarily a respiratory emergency:</b><br><br><b>Breathing patient:</b><br>- Supplemental O2 (NRB 15 L/min)<br>- Monitor closely for deterioration<br>- Position of comfort or recovery position<br><br><b>Apneic patient with pulse:</b><br>- Open airway (head tilt-chin lift or jaw thrust)<br>- BVM ventilation with 100% O2<br>- Suction if needed (expect vomiting)<br>- Early intubation if not responding<br><br><b>Cardiac arrest:</b><br>- Prioritize ventilation (A-B-C, not C-A-B)<br>- 5 rescue breaths before compressions<br>- Then standard CPR",
          icon: "medical_services"
        },
        {
          title: "Modified CPR for Drowning",
          content: "<b>Sequence: A-B-C (Airway-Breathing-Circulation)</b><br><br><b>Rationale:</b> Drowning is hypoxic arrest; oxygenation is priority<br><br><b>Recommended approach:</b><br>1. Open airway<br>2. Give 5 rescue breaths<br>3. Check pulse (max 10 seconds)<br>4. If no pulse, begin 30:2 CPR<br>5. Early advanced airway for ventilation<br><br><b>High-quality CPR:</b><br>- Standard compression rate/depth<br>- Minimize interruptions<br>- Watch for vomiting (common; suction and continue)",
          icon: "favorite"
        },
        {
          title: "Defibrillation",
          content: "<b>Shockable rhythms less common:</b><br>- Most drowning arrests are asystole or PEA<br>- VFib/pVT occur but are minority<br><br><b>AED use:</b><br>- Dry the chest<br>- Apply pads, analyze rhythm<br>- Shock if indicated<br>- Immediate CPR after shock<br><br><b>Water + electricity:</b><br>- Ensure rescuer and patient are out of water<br>- Dry chest before pad application<br>- Safe to defibrillate on wet deck (not in water)"
        },
        {
          title: "Advanced Airway",
          content: "<b>Early intubation recommended:</b><br>- Protects airway from aspiration<br>- Allows more effective ventilation<br>- PEEP beneficial (5-10 cmH2O)<br><br><b>Expect:</b><br>- Large amount of water/vomit<br>- Pulmonary edema (frothy secretions)<br>- Difficult ventilation (poor compliance)<br><br><b>PEEP (if available):</b><br>- Improves oxygenation<br>- Recruits collapsed alveoli<br>- Start 5-10 cmH2O, may increase to 15",
          icon: "airline_seat_flat"
        }
      ]
    },
    {
      type: "accordion",
      title: "Post-Resuscitation Care",
      items: [
        {
          title: "Oxygen and Ventilation",
          content: "<b>All symptomatic patients:</b><br>- High-flow O2 (NRB 15 L/min)<br>- Titrate to SpO2 > 94%<br>- May need continued NIPPV or invasive ventilation<br><br><b>Monitor for deterioration:</b><br>- Pulmonary edema may worsen over hours<br>- Watch for ARDS<br>- Repeat assessments",
          icon: "air"
        },
        {
          title: "Hypothermia Management",
          content: "<b>Concurrent hypothermia is common:</b><br>- Cold water submersion<br>- Prolonged exposure<br><br><b>Management:</b><br>- Remove wet clothing<br>- Warm blankets<br>- Warm IV fluids<br>- Active rewarming for severe hypothermia<br><br><b>Special consideration:</b><br>- Cold may be neuroprotective<br>- Prolonged resuscitation may be warranted<br>- Do not terminate in field if hypothermic<br><br><b>See TP-1223 Hypothermia</b>"
        },
        {
          title: "IV Access and Fluids",
          content: "<b>Establish IV access:</b><br>- May be difficult if hypothermic/vasoconstricted<br>- IO if IV unsuccessful<br><br><b>Fluid management:</b><br>- Not typically volume depleted<br>- Small boluses for hypotension<br>- Avoid aggressive fluids (pulmonary edema risk)<br><br><b>Glucose:</b><br>- Check blood glucose<br>- Treat hypoglycemia if present"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Drowning is leading cause of death ages 1-4:</b><br>- Bathtub, pools, buckets<br>- Brief unsupervised access<br><br><b>Key differences:</b><br>- Better outcomes than adults (mammalian diving reflex stronger)<br>- Cold water may be more protective<br>- Prolonged resuscitation indicated<br><br><b>Resuscitation:</b><br>- Same A-B-C approach<br>- Size-appropriate equipment<br>- 5 rescue breaths initially<br>- Compression:ventilation ratio 15:2 (2 rescuer)<br><br><b>Consider non-accidental trauma:</b><br>- Drowning in unusual circumstances<br>- History inconsistent with findings<br>- Other signs of abuse"
    },
    {
      type: "warning",
      content: "<b>PROGNOSTIC FACTORS:</b><br><br><b>Better prognosis:</b><br>- Short submersion time (< 5 minutes)<br>- Cold water (potential neuroprotection)<br>- Bystander CPR initiated<br>- Early ROSC<br>- Younger patient<br><br><b>Poor prognosis:</b><br>- Prolonged submersion (> 25 minutes)<br>- Warm water<br>- No bystander CPR<br>- Prolonged time to ROSC<br>- Initial rhythm asystole<br><br><b>However:</b> Good outcomes have occurred after prolonged submersion in cold water. When in doubt, resuscitate."
    },
    {
      type: "accordion",
      title: "Special Scenarios",
      items: [
        {
          title: "Cold Water Immersion",
          content: "<b>Cold water (< 70F / 21C):</b><br>- May provide neuroprotection<br>- Mammalian diving reflex (bradycardia, peripheral vasoconstriction, blood shunting to core)<br>- Metabolic rate decreases<br><br><b>Remarkable survivals reported:</b><br>- Prolonged submersion in cold water<br>- Full neurologic recovery possible<br>- Continue resuscitation until rewarmed<br><br><b>Cold water vs warm water:</b><br>- Cold water drowning may have better neurologic outcomes<br>- But hypothermia complicates resuscitation"
        },
        {
          title: "Contaminated Water",
          content: "<b>Pool (chlorinated):</b><br>- Chemical pneumonitis possible<br>- Generally better outcomes<br><br><b>Natural bodies of water:</b><br>- Bacterial contamination<br>- Aspiration pneumonia risk<br>- Antibiotics NOT indicated prophylactically<br><br><b>Hot tub/spa:</b><br>- Consider Pseudomonas<br>- Higher bacterial load<br><br><b>Saltwater:</b><br>- Treatment identical to freshwater<br>- May have slightly more pulmonary edema"
        },
        {
          title: "Associated Conditions",
          content: "<b>What caused the drowning?</b><br><br><b>Consider:</b><br>- Seizure (epileptics at high risk)<br>- Cardiac arrhythmia (Long QT, etc.)<br>- Alcohol/drug intoxication<br>- Trauma (diving, boating)<br>- Hypoglycemia<br>- Child abuse<br>- Suicide attempt<br><br><b>Implications:</b><br>- Treat underlying condition<br>- ECG for all survivors<br>- Tox screen as indicated"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Ventilation is king:</b> Drowning is hypoxic arrest. Prioritize airway and breathing. The A-B-C approach (not C-A-B) is correct for drowning resuscitation.<br><br><b>Freshwater vs saltwater is a myth:</b> The amount of water aspirated in survivors is too small to cause significant electrolyte disturbances. Treatment is identical. Do not get distracted by water type.<br><br><b>Heimlich is wrong:</b> Do NOT try to drain water from the lungs. It does not work and delays ventilation. The water is in alveoli, not a solid obstruction.<br><br><b>Cold water may save:</b> Prolonged submersion in cold water has produced remarkable survivals. Consider extended resuscitation, especially in children.<br><br><b>All survivors need evaluation:</b> Even asymptomatic patients may develop delayed pulmonary edema. Transport for observation and monitoring.<br><br><b>Secondary drowning is not a thing:</b> The concept of delayed drowning hours later from a small water aspiration is largely a myth. Symptomatic patients need treatment; asymptomatic patients can be observed but do not die hours later from minimal aspiration."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1223 Hypothermia / Cold Injury" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1233 Seizures" },
        { title: "PP-1304 Rapid Sequence Intubation" },
        { title: "TP-1200 General Trauma" }
      ]
    }
  ]
};
