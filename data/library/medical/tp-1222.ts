
import { Protocol } from '../../../types';

export const tp1222: Protocol = {
  id: "1222",
  refNo: "TP-1222",
  title: "Hyperthermia / Heat Illness",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "wb_sunny",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Hyperthermia / Heat Illness", subtitle: "Adult - Standing Order", icon: "wb_sunny" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "HEAT", content: "Heat Illness - Environmental hyperthermia" },
        { title: "HEXH", content: "Heat Exhaustion - Volume depletion, intact thermoregulation" },
        { title: "HSTK", content: "Heat Stroke - Thermoregulatory failure, life-threatening" },
        { title: "HCRM", content: "Heat Cramps - Muscle cramping from electrolyte loss" }
      ]
    },
    {
      type: "warning",
      content: "<b>HEAT STROKE IS A TRUE EMERGENCY:</b> Core temperature > 104F (40C) with altered mental status = heat stroke until proven otherwise. Immediate aggressive cooling is lifesaving. Every minute of delay increases mortality and neurological morbidity."
    },
    {
      type: "section",
      title: "Heat Illness Spectrum"
    },
    {
      type: "accordion",
      title: "Classification",
      items: [
        {
          title: "Heat Cramps",
          content: "<b>Pathophysiology:</b><br>- Electrolyte depletion (sodium, potassium)<br>- Dehydration<br>- Usually during or after exertion<br><br><b>Presentation:</b><br>- Painful muscle cramps (calves, thighs, abdomen)<br>- Normal mental status<br>- Normal or mildly elevated temperature<br>- Profuse sweating<br><br><b>Treatment:</b><br>- Rest in cool environment<br>- Oral rehydration with electrolytes<br>- Gentle stretching",
          icon: "fitness_center"
        },
        {
          title: "Heat Exhaustion",
          content: "<b>Pathophysiology:</b><br>- Volume depletion and electrolyte loss<br>- Thermoregulation still intact<br>- Core temp typically 100-104F (37.8-40C)<br><br><b>Presentation:</b><br>- Profuse sweating (key differentiator)<br>- Weakness, fatigue, malaise<br>- Headache, nausea, vomiting<br>- Dizziness, orthostatic hypotension<br>- Tachycardia<br>- Normal or near-normal mental status<br>- Skin may be cool and clammy<br><br><b>Progression:</b> Can progress to heat stroke if untreated",
          icon: "thermostat"
        },
        {
          title: "Heat Stroke - LIFE-THREATENING",
          content: "<b>Definition:</b> Core temperature > 104F (40C) + Altered mental status<br><br><b>Two types:</b><br><br><b>Classic (Non-Exertional):</b><br>- Elderly, chronically ill, no A/C<br>- Develops over days during heat waves<br>- Hot, DRY skin (anhidrosis)<br>- Mortality 10-65%<br><br><b>Exertional:</b><br>- Young, healthy individuals<br>- Develops over hours during exercise<br>- May still be sweating<br>- Athletes, military, laborers<br>- Mortality 3-5% with rapid treatment<br><br><b>Complications:</b><br>- Multi-organ failure<br>- Rhabdomyolysis<br>- DIC<br>- Acute kidney injury<br>- ARDS<br>- Seizures, cerebral edema",
          icon: "warning"
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
          title: "Key Differentiating Features",
          content: "<table style='width:100%; border-collapse: collapse;'><tr><th style='border:1px solid #ccc; padding:8px;'>Feature</th><th style='border:1px solid #ccc; padding:8px;'>Heat Exhaustion</th><th style='border:1px solid #ccc; padding:8px;'>Heat Stroke</th></tr><tr><td style='border:1px solid #ccc; padding:8px;'>Mental Status</td><td style='border:1px solid #ccc; padding:8px;'>Normal or mild confusion</td><td style='border:1px solid #ccc; padding:8px;'>ALTERED (confusion, combativeness, seizures, coma)</td></tr><tr><td style='border:1px solid #ccc; padding:8px;'>Temperature</td><td style='border:1px solid #ccc; padding:8px;'>< 104F (40C)</td><td style='border:1px solid #ccc; padding:8px;'>> 104F (40C)</td></tr><tr><td style='border:1px solid #ccc; padding:8px;'>Sweating</td><td style='border:1px solid #ccc; padding:8px;'>Profuse</td><td style='border:1px solid #ccc; padding:8px;'>May be absent (classic) or present (exertional)</td></tr><tr><td style='border:1px solid #ccc; padding:8px;'>Skin</td><td style='border:1px solid #ccc; padding:8px;'>Cool, clammy</td><td style='border:1px solid #ccc; padding:8px;'>Hot (dry or moist)</td></tr></table>",
          icon: "compare"
        },
        {
          title: "Temperature Measurement",
          content: "<b>Core temperature is critical:</b><br><br><b>Most accurate (hospital):</b><br>- Rectal temperature (gold standard)<br>- Esophageal probe<br><br><b>Prehospital options:</b><br>- Rectal (if available, preferred)<br>- Tympanic (may underestimate)<br>- Oral (unreliable if mouth-breathing)<br>- Temporal/axillary (significant underestimate)<br><br><b>Clinical decision:</b><br>- Do not delay cooling to obtain temperature<br>- If AMS + hot + history of exposure = treat as heat stroke"
        },
        {
          title: "Risk Factors",
          content: "<b>Individual factors:</b><br>- Age extremes (elderly, very young)<br>- Chronic illness (cardiac, pulmonary, diabetes)<br>- Obesity<br>- Dehydration<br>- Prior heat illness<br>- Poor physical conditioning<br>- Sleep deprivation<br><br><b>Medications:</b><br>- Anticholinergics (impair sweating)<br>- Beta blockers (impair cardiac response)<br>- Diuretics (volume depletion)<br>- Stimulants (increase heat production)<br>- Antipsychotics (impair thermoregulation)<br><br><b>Environmental:</b><br>- High temperature and humidity<br>- No A/C access<br>- Heat waves<br>- Encapsulating PPE/clothing"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment - Heat Exhaustion"
    },
    {
      type: "accordion",
      title: "Heat Exhaustion Management",
      items: [
        {
          title: "Cooling Measures",
          content: "<b>Remove from hot environment:</b><br>- Move to shade or air-conditioned space<br>- Remove excess clothing<br><br><b>Passive cooling:</b><br>- Fan<br>- Ice packs to neck, axillae, groin<br>- Mist and fan<br><br><b>Active cooling usually not needed</b> if patient responds to above",
          icon: "ac_unit"
        },
        {
          title: "Rehydration",
          content: "<b>If alert and tolerating PO:</b><br>- Oral rehydration with electrolyte solution<br>- Sports drinks, oral rehydration salts<br>- Water alone may worsen hyponatremia<br><br><b>IV Fluids:</b><br>- NS or LR 500 mL - 1 L bolus<br>- Reassess and repeat as needed<br>- Goal: Restore perfusion, resolve orthostasis",
          icon: "water_drop"
        },
        {
          title: "Disposition",
          content: "<b>May not require transport if:</b><br>- Symptoms fully resolve<br>- Normal vital signs<br>- Able to tolerate oral fluids<br>- Has safe environment to go to<br>- Reliable adult supervision<br><br><b>Transport for:</b><br>- Persistent symptoms despite treatment<br>- Abnormal vital signs<br>- Elderly or comorbid patients<br>- Uncertainty about diagnosis<br>- Cannot maintain hydration"
        }
      ]
    },
    {
      type: "section",
      title: "Treatment - Heat Stroke"
    },
    {
      type: "accordion",
      title: "Heat Stroke Emergency Management",
      items: [
        {
          title: "Immediate Cooling - PRIORITY",
          content: "<b>COOL FIRST, TRANSPORT SECOND</b><br><br><b>Goal:</b> Reduce core temperature to < 102F (39C) within 30 minutes<br><br><b>Most effective methods:</b><br><br><b>1. Ice water immersion (gold standard if available):</b><br>- Immerse in ice water bath to neck<br>- Cooling rate: 0.15-0.35C/minute<br>- Most rapid cooling method<br><br><b>2. Evaporative cooling (practical prehospital):</b><br>- Remove all clothing<br>- Continuously mist with tepid water<br>- Fan vigorously<br>- Cooling rate: 0.05-0.1C/minute<br><br><b>3. Ice packs:</b><br>- Apply to high-flow vascular areas<br>- Neck, axillae, groin, behind knees<br>- Less effective than above methods",
          icon: "ac_unit"
        },
        {
          title: "Cooling Adjuncts",
          content: "<b>Cold IV fluids:</b><br>- 1-2 L cold (4C) NS or LR<br>- Provides internal cooling<br>- Also treats dehydration and hypotension<br><br><b>Cold water lavage (hospital):</b><br>- Gastric, bladder, peritoneal lavage<br>- Reserved for refractory cases<br><br><b>Avoid:</b><br>- Ice water immersion if combative (drowning risk)<br>- Alcohol rubs (absorbed, toxic)<br>- Antipyretics (do NOT work - different mechanism)",
          icon: "medication"
        },
        {
          title: "Airway and Breathing",
          content: "<b>Protect airway:</b><br>- High risk for aspiration (AMS, seizures)<br>- Position of comfort if possible<br>- Suction ready<br><br><b>Intubation indications:</b><br>- GCS < 8<br>- Inability to protect airway<br>- Respiratory failure<br><br><b>Supplemental oxygen:</b><br>- Apply O2 as needed<br>- Monitor SpO2",
          icon: "medical_services"
        },
        {
          title: "Seizure Management",
          content: "<b>Seizures common in heat stroke:</b><br><br><b>Benzodiazepines:</b><br>- Midazolam 5-10 mg IM/IV/IN<br>- Diazepam 5-10 mg IV<br>- Lorazepam 2-4 mg IV<br><br><b>Benefits:</b><br>- Stops seizure activity<br>- Reduces muscle heat production<br>- Decreases shivering (which generates heat)<br><br><b>Note:</b> Avoid paralysis unless intubated (masks shivering reflex)"
        },
        {
          title: "IV Access and Fluids",
          content: "<b>Establish large-bore IV access</b><br><br><b>Cold crystalloid:</b><br>- 1-2 L NS or LR bolus<br>- Cold/iced if possible<br>- Titrate to blood pressure<br><br><b>Caution with fluids:</b><br>- Rhabdomyolysis may cause acute kidney injury<br>- But initial fluid resuscitation usually indicated<br>- Watch for pulmonary edema in elderly<br><br><b>Check glucose:</b><br>- Hypoglycemia may contribute to AMS<br>- Treat if < 60 mg/dL"
        }
      ]
    },
    {
      type: "warning",
      content: "<b>DO NOT DELAY COOLING FOR TRANSPORT:</b><br><br>Begin cooling immediately on scene. Cooling during transport is essential. Mortality doubles for each 30-minute delay in cooling. If possible, achieve significant temperature reduction before departure."
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>Children at higher risk:</b><br>- Less efficient sweating<br>- Higher metabolic rate<br>- Depend on adults for hydration<br>- May not recognize symptoms<br><br><b>Special scenarios:</b><br>- Children left in hot vehicles (temperature rises rapidly)<br>- Sports/activity in heat<br><br><b>Treatment adjustments:</b><br>- Weight-based fluid dosing: 20 mL/kg bolus<br>- Midazolam: 0.1 mg/kg IM/IV (max 5 mg)<br>- Be aggressive with cooling<br><br><b>Prevention education:</b><br>- Never leave children in vehicles<br>- Mandatory rest breaks during activities<br>- Liberal hydration"
    },
    {
      type: "accordion",
      title: "Special Populations",
      items: [
        {
          title: "Elderly Patients",
          content: "<b>Increased risk factors:</b><br>- Decreased thermoregulation<br>- Medications affecting heat response<br>- Chronic illness<br>- Social isolation (no A/C, no one checking)<br>- Decreased thirst sensation<br><br><b>Presentation may be atypical:</b><br>- Lower baseline temperature<br>- AMS may be attributed to baseline dementia<br>- May not appear as sick as they are<br><br><b>Treatment considerations:</b><br>- More cautious fluid administration<br>- Watch for cardiac complications<br>- Lower threshold for transport"
        },
        {
          title: "Exertional Heat Stroke",
          content: "<b>Common scenarios:</b><br>- Military training<br>- Athletes (football, distance running)<br>- Laborers<br>- First responder training<br><br><b>Key differences:</b><br>- Young, healthy individuals<br>- May still be sweating<br>- Often have prodrome (ignored or pushed through)<br>- Rhabdomyolysis very common<br><br><b>Treatment:</b><br>- Same aggressive cooling<br>- Aggressive fluid resuscitation<br>- Monitor for myoglobinuria"
        },
        {
          title: "Drug-Induced Hyperthermia",
          content: "<b>Consider in differential:</b><br>- Sympathomimetics (cocaine, meth, MDMA)<br>- Serotonin syndrome<br>- Neuroleptic malignant syndrome<br>- Malignant hyperthermia<br>- Anticholinergic toxicity<br><br><b>Key points:</b><br>- May occur without environmental exposure<br>- Treatment: Cooling + benzodiazepines<br>- Specific antidotes for some (dantrolene for MH)<br><br><b>See TP-1241 Overdose/Poisoning</b>"
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Altered mental status is the key:</b> The critical distinction between heat exhaustion and heat stroke is mental status change. Temperature alone does not make the diagnosis.<br><br><b>Sweating does NOT rule out heat stroke:</b> Exertional heat stroke patients often still sweat. Anhidrosis is more common in classic (non-exertional) heat stroke.<br><br><b>Antipyretics don't work:</b> Heat stroke is not a fever - the hypothalamic set point is normal but the body cannot dissipate heat. Acetaminophen and ibuprofen are useless and may be harmful.<br><br><b>Shivering is counterproductive:</b> If cooling causes shivering, give benzodiazepines. Shivering generates heat and defeats cooling efforts.<br><br><b>Field temp may underestimate:</b> Tympanic and temporal temperatures significantly underestimate core temperature. Treat the clinical picture, not the number.<br><br><b>Stop cooling at 102F:</b> Continue until temp < 102F (39C) then stop to prevent overshoot hypothermia. Temperature may continue to drift down."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1223 Hypothermia / Cold Injury" },
        { title: "TP-1241 Overdose / Poisoning" },
        { title: "TP-1229 Behavioral Emergencies" },
        { title: "TP-1233 Seizures" },
        { title: "TP-1210 Cardiac Arrest" }
      ]
    }
  ]
};
