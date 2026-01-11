import { Protocol } from '../../../types';

export const tp1223: Protocol = {
  id: "1223",
  refNo: "TP-1223",
  title: "Hypothermia / Cold Injury",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "ac_unit",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Hypothermia / Cold Injury", subtitle: "Adult - Standing Order", icon: "ac_unit" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "HYPO", content: "Hypothermia - Core temperature < 95F (35C)" },
        { title: "FSTB", content: "Frostbite - Local cold injury with tissue freezing" },
        { title: "COLD", content: "Cold Exposure - Environmental cold emergency" },
        { title: "SUBM", content: "Submersion/Drowning - See TP-1225 if associated" }
      ]
    },
    {
      type: "warning",
      content: "<b>NO ONE IS DEAD UNTIL WARM AND DEAD:</b> Hypothermic patients may appear dead (no pulse, no respirations, fixed pupils). Prolonged resuscitation may be successful. Do NOT pronounce death until patient is rewarmed to at least 86-90F (30-32C) or resuscitation has been truly prolonged."
    },
    {
      type: "section",
      title: "Hypothermia Classification"
    },
    {
      type: "accordion",
      title: "Severity Staging",
      items: [
        {
          title: "Mild Hypothermia: 90-95F (32-35C)",
          content: "<b>Physiologic response:</b><br>- Shivering (maximal heat production)<br>- Tachycardia, tachypnea<br>- Vasoconstriction<br>- Cold diuresis<br><br><b>Clinical presentation:</b><br>- Alert but may have poor judgment<br>- Shivering vigorously<br>- Tachycardia<br>- Mildly impaired coordination<br><br><b>Prognosis:</b> Excellent with passive rewarming",
          icon: "thermostat"
        },
        {
          title: "Moderate Hypothermia: 82-90F (28-32C)",
          content: "<b>Physiologic response:</b><br>- Shivering stops (cannot generate heat)<br>- Progressive bradycardia<br>- Decreased cardiac output<br>- Atrial fibrillation common<br><br><b>Clinical presentation:</b><br>- Altered mental status (confusion, lethargy, combativeness)<br>- Paradoxical undressing (feels warm)<br>- Slurred speech<br>- Loss of shivering<br>- Muscle rigidity<br>- Dilated pupils<br><br><b>Prognosis:</b> Good with active rewarming",
          icon: "thermostat"
        },
        {
          title: "Severe Hypothermia: < 82F (< 28C)",
          content: "<b>Physiologic response:</b><br>- Profound bradycardia or asystole<br>- Hypotension<br>- Decreased cerebral blood flow<br>- VFib threshold lowered<br><br><b>Clinical presentation:</b><br>- Unresponsive or comatose<br>- Absent reflexes<br>- Fixed, dilated pupils<br>- May appear dead<br>- Areflexic, rigid<br>- Undetectable vital signs<br><br><b>Prognosis:</b> Survival possible with aggressive rewarming",
          icon: "thermostat"
        }
      ]
    },
    {
      type: "section",
      title: "Recognition"
    },
    {
      type: "accordion",
      title: "Assessment",
      items: [
        {
          title: "Temperature Measurement",
          content: "<b>Core temperature essential:</b><br>- Standard thermometers may not read low enough<br>- Hypothermia thermometers read to 77F (25C)<br><br><b>Measurement sites:</b><br>- Rectal (preferred prehospital if available)<br>- Esophageal (most accurate, hospital)<br>- Tympanic (may underestimate)<br>- Oral (unreliable in hypothermia)<br><br><b>Clinical staging:</b><br>- If unable to measure, use clinical signs<br>- Shivering present = likely > 90F<br>- Shivering absent + AMS = likely < 90F<br>- Unresponsive = likely < 82F",
          icon: "thermostat"
        },
        {
          title: "ECG Findings",
          content: "<b>Osborn wave (J wave):</b><br>- Positive deflection at J-point (end of QRS)<br>- Pathognomonic for hypothermia<br>- Height correlates with degree of hypothermia<br><br><b>Other ECG changes:</b><br>- Sinus bradycardia (most common)<br>- Atrial fibrillation (moderate hypothermia)<br>- PR, QRS, QT prolongation<br>- Muscle artifact (shivering)<br>- Ventricular fibrillation (< 82F)<br>- Asystole (profound hypothermia)",
          icon: "monitor_heart"
        },
        {
          title: "Risk Factors",
          content: "<b>Environmental:</b><br>- Cold exposure (obvious or occult)<br>- Wet clothing, immersion<br>- Wind chill<br>- Inadequate shelter/clothing<br><br><b>Patient factors:</b><br>- Age extremes (elderly, neonates)<br>- Alcohol intoxication (vasodilation, impaired judgment)<br>- Drug intoxication<br>- Trauma<br>- Homelessness<br>- Psychiatric illness<br>- Hypoglycemia<br>- Sepsis<br>- Hypothyroidism<br>- Adrenal insufficiency"
        }
      ]
    },
    {
      type: "section",
      title: "Rewarming Methods"
    },
    {
      type: "accordion",
      title: "Rewarming Strategies",
      items: [
        {
          title: "Passive External Rewarming",
          content: "<b>Method:</b><br>- Remove wet clothing<br>- Cover with warm, dry blankets<br>- Move to warm environment<br>- Prevent further heat loss<br><br><b>Indication:</b><br>- Mild hypothermia (> 90F)<br>- Patient is still shivering<br><br><b>Rate:</b> 0.5-2C per hour<br><br><b>Key principle:</b> Patient generates own heat through shivering",
          icon: "dry_cleaning"
        },
        {
          title: "Active External Rewarming",
          content: "<b>Methods:</b><br>- Forced warm air blankets (Bair Hugger)<br>- Warm water bottles/heating pads to trunk<br>- Warm water immersion (hospital)<br><br><b>Application areas (trunk focus):</b><br>- Axillae<br>- Groin<br>- Chest/abdomen<br>- Avoid extremities initially (afterdrop concern)<br><br><b>Indication:</b><br>- Moderate hypothermia (82-90F)<br>- Mild hypothermia not responding to passive<br><br><b>Caution:</b> Do NOT apply heat directly to skin (burns)",
          icon: "hot_tub"
        },
        {
          title: "Active Internal Rewarming",
          content: "<b>Prehospital options:</b><br>- Warm humidified oxygen (42-46C)<br>- Warm IV fluids (40-42C / 104-108F)<br><br><b>Hospital options:</b><br>- Peritoneal lavage<br>- Pleural lavage<br>- ECMO/cardiopulmonary bypass (most effective)<br><br><b>Indication:</b><br>- Severe hypothermia (< 82F)<br>- Cardiac instability<br>- Cardiac arrest",
          icon: "medical_services"
        },
        {
          title: "IV Fluid Warming",
          content: "<b>Warm all IV fluids:</b><br>- 40-42C (104-108F)<br>- Use commercial warmers if available<br>- Hot water bath, then check temp<br><br><b>Rate:</b><br>- Bolus 250-500 mL warm NS or LR<br>- Contributes to core warming<br><br><b>Caution:</b><br>- Cold fluids worsen hypothermia<br>- Room temperature fluids are still cold relative to patient<br>- Avoid aggressive fluid resuscitation (heart is irritable)"
        }
      ]
    },
    {
      type: "section",
      title: "Cardiac Considerations"
    },
    {
      type: "accordion",
      title: "Cardiac Management in Hypothermia",
      items: [
        {
          title: "Arrhythmia Risk",
          content: "<b>The hypothermic heart is irritable:</b><br>- VFib threshold lowered (especially < 82F)<br>- Mechanical stimulation can trigger VFib<br>- Drug metabolism severely impaired<br><br><b>Minimizing risk:</b><br>- Handle patient gently (no rough movement)<br>- Avoid aggressive procedures if possible<br>- Core rewarming before invasive procedures<br><br><b>Common rhythm progression:</b><br>Sinus bradycardia -> A-fib -> VFib -> Asystole",
          icon: "warning"
        },
        {
          title: "Cardiac Arrest in Hypothermia",
          content: "<b>Modified ACLS approach:</b><br><br><b>If VFib/pVT:</b><br>- Defibrillate ONCE<br>- If patient remains in VFib, may attempt one more shock<br>- If still refractory, defer further shocks until temp > 86F (30C)<br>- Continue CPR<br><br><b>Medications:</b><br>- Epinephrine: Withhold until temp > 86F (30C)<br>- Then give at LONGER intervals (doubled)<br>- Antiarrhythmics often ineffective until rewarmed<br><br><b>Rationale:</b><br>- Cold heart does not respond to drugs<br>- Drugs accumulate, may cause toxicity on rewarming",
          icon: "favorite"
        },
        {
          title: "CPR Considerations",
          content: "<b>Pulse check:</b><br>- Check for 60 seconds (slow circulation)<br>- May have organized rhythm with no palpable pulse<br>- Use Doppler or ETCO2 if available<br><br><b>Start CPR if:</b><br>- No pulse after 60-second check<br>- Unwitnessed arrest with unclear rhythm<br><br><b>CPR quality:</b><br>- Standard compression rate and depth<br>- May need longer resuscitation<br>- ECMO/bypass is definitive treatment<br><br><b>When to stop:</b><br>- Do NOT terminate in field<br>- Transport for hospital rewarming<br>- Warm first, then reassess"
        },
        {
          title: "Afterdrop Phenomenon",
          content: "<b>Definition:</b> Continued drop in core temperature after removal from cold environment<br><br><b>Mechanism:</b><br>- Cold blood from extremities returns to core<br>- Peripheral vasodilation during rewarming<br>- Can cause cardiac arrest during rewarming<br><br><b>Prevention:</b><br>- Rewarm trunk before extremities<br>- Keep patient horizontal<br>- Gentle handling<br>- Avoid active extremity rewarming initially"
        }
      ]
    },
    {
      type: "section",
      title: "Frostbite (Local Cold Injury)"
    },
    {
      type: "accordion",
      title: "Frostbite Management",
      items: [
        {
          title: "Classification",
          content: "<b>Superficial (1st degree):</b><br>- Numbness, pallor<br>- No tissue loss<br>- Complete recovery expected<br><br><b>Superficial (2nd degree):</b><br>- Clear blisters<br>- Surrounding erythema/edema<br>- Sensory loss<br>- Usually heals without surgery<br><br><b>Deep (3rd degree):</b><br>- Hemorrhagic blisters<br>- Skin necrosis<br>- May require debridement<br><br><b>Deep (4th degree):</b><br>- Through skin into muscle/bone<br>- Mummification<br>- Amputation often required",
          icon: "visibility"
        },
        {
          title: "Field Treatment",
          content: "<b>Prehospital management:</b><br>- Remove wet/constrictive clothing<br>- Protect from further cold<br>- Do NOT rub or massage affected area<br>- Do NOT apply direct heat<br>- Do NOT break blisters<br>- Elevate affected extremity<br><br><b>If no risk of refreezing:</b><br>- Rapid rewarming in warm water bath (98-102F / 37-39C)<br>- Takes 15-30 minutes<br>- Very painful (analgesia needed)<br><br><b>If refreezing possible:</b><br>- Do NOT thaw in field<br>- Freeze-thaw-refreeze causes worse injury<br>- Splint and protect, transport frozen",
          icon: "medical_services"
        },
        {
          title: "Important Considerations",
          content: "<b>Delayed demarcation:</b><br>- Final extent of injury may not be clear for weeks<br>- Early appearance often worse than outcome<br><br><b>Hospital therapies (reference):</b><br>- TPA for severe cases (within 24 hours)<br>- Iloprost (prostacyclin)<br>- Surgical debridement/amputation delayed<br><br><b>Pain management:</b><br>- Frostbite rewarming is extremely painful<br>- IV opioids often needed<br>- Fentanyl 1-2 mcg/kg IV"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Increased risk:</b><br>- Higher surface area to mass ratio<br>- Less subcutaneous fat<br>- Limited shivering capacity in infants<br>- Depend on adults for environment control<br><br><b>Presentation differences:</b><br>- May not shiver (especially neonates)<br>- May be bradycardic without shivering<br>- Lethargy, poor feeding<br><br><b>Treatment:</b><br>- Same principles, more aggressive rewarming<br>- Warm IV fluids: 20 mL/kg bolus<br>- Maintain glucose (hypoglycemia common)<br>- ECMO more available in pediatric centers"
    },
    {
      type: "warning",
      content: "<b>SPECIAL SCENARIOS:</b><br><br><b>Avalanche burial:</b><br>- Air pocket = potential survival<br>- No air pocket > 35 min = low survival<br>- Asystole with potassium > 12 = death<br><br><b>Submersion:</b><br>- Cold water may be protective (diving reflex)<br>- Prolonged CPR may be warranted<br>- See TP-1225 Submersion<br><br><b>Urban hypothermia:</b><br>- Consider underlying cause (OD, sepsis, hypoglycemia, trauma)<br>- May occur at temperatures that seem warm enough"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>No one is dead until warm and dead:</b> The record for survival from accidental hypothermia with full neurological recovery is core temperature of 56.7F (13.7C). Do not give up on hypothermic arrests.<br><br><b>Shivering tells you a lot:</b> If the patient is shivering, they are generating heat and are likely > 90F. Loss of shivering is ominous - they can no longer warm themselves.<br><br><b>The heart hates cold:</b> The hypothermic heart is extremely irritable. Rough handling, aggressive procedures, or cold IV fluids can trigger lethal arrhythmias. Be gentle.<br><br><b>Drugs don't work when cold:</b> Medications accumulate in hypothermia because they are not metabolized. They may cause toxicity when the patient rewarms. Space out doses.<br><br><b>Look for the cause:</b> In urban settings, hypothermia is usually secondary to something else - intoxication, overdose, trauma, sepsis, or metabolic derangement. Treat the underlying cause.<br><br><b>Afterdrop kills:</b> Temperature may continue to fall after rescue due to cold blood returning from extremities. Rewarm the core first, keep patient horizontal, handle gently."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1222 Hyperthermia / Heat Illness" },
        { title: "TP-1225 Submersion (Drowning)" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1241 Overdose / Poisoning" },
        { title: "TP-1202 Altered Level of Consciousness" }
      ]
    }
  ]
};
