
import { Protocol } from '../../../types';

export const tp1217: Protocol = {
  id: "1217",
  refNo: "TP-1217",
  title: "Pregnancy Complication",
  category: "OB/GYN",
  type: "Standing Order",
  lastUpdated: "Oct 1, 2025",
  icon: "pregnant_woman",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Pregnancy Complication", subtitle: "Adult • Standing Order", icon: "pregnant_woman" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "PREG", content: "Pregnancy Complication – use for any high-risk pregnancy presentation" },
        { title: "ECLM", content: "Eclampsia – seizure activity in pregnancy > 20 weeks" },
        { title: "VTBL", content: "Vaginal Bleeding – antepartum hemorrhage" }
      ]
    },
    {
      type: "warning",
      content: "<b>TWO PATIENTS:</b> Mother and fetus. Maternal resuscitation takes priority – a dead mother means a dead fetus.<br><br><b>Left Lateral Tilt:</b> After 20 weeks, place mother on LEFT side (or tilt spine board 15-30°) to relieve IVC compression from gravid uterus."
    },
    {
      type: "section",
      title: "Eclampsia / Hypertensive Emergencies"
    },
    {
      type: "accordion",
      title: "Eclampsia (Seizures in Pregnancy)",
      items: [
        {
          title: "Recognition",
          content: "<b>Definition:</b> New-onset seizures in patient with preeclampsia (pregnancy > 20 weeks, or up to 6 weeks postpartum).<br><br><b>Preeclampsia signs:</b><br>• Hypertension (SBP ≥ 140 or DBP ≥ 90)<br>• Edema (facial, hands, generalized)<br>• Headache, visual changes, RUQ pain<br>• Proteinuria (if urinalysis available)<br><br><b>Severe features:</b> SBP ≥ 160, DBP ≥ 110, altered mental status, pulmonary edema",
          icon: "warning"
        },
        {
          title: "Treatment",
          content: "<b>1. Protect airway</b> – Left lateral position, suction as needed<br><br><b>2. Magnesium Sulfate (FIRST LINE):</b><br>• <b>4 g IV over 10-15 minutes</b><br>• Dilute in 100 mL NS or give slow IV push<br>• Prevents recurrent seizures<br>• Continue monitoring for respiratory depression<br><br><b>3. Benzodiazepine (if active seizure):</b><br>• <b>Midazolam 5 mg IM/IN</b> or <b>2 mg IV</b><br>• May repeat x1 if seizure continues<br><br><b>4. Oxygen</b> – High flow if hypoxic<br><br><b>5. Monitor fetal heart tones</b> if possible",
          icon: "medication"
        },
        {
          title: "Magnesium Toxicity",
          content: "<b>Monitor for:</b><br>• Loss of deep tendon reflexes (first sign)<br>• Respiratory depression (RR < 12)<br>• Hypotension<br>• Cardiac arrhythmias<br><br><b>Antidote:</b> Calcium Gluconate 1 g IV slow push",
          icon: "warning"
        }
      ]
    },
    {
      type: "accordion",
      title: "Severe Hypertension (SBP ≥ 160 or DBP ≥ 110)",
      items: [
        {
          title: "Treatment",
          content: "<b>Goal:</b> Reduce BP to < 160/110 to prevent stroke and placental abruption.<br><br><b>Labetalol:</b> 20 mg IV over 2 minutes. May repeat with 40 mg, then 80 mg every 10 minutes. Max 300 mg.<br><br><b>Hydralazine:</b> 5-10 mg IV every 20 minutes. Max 20 mg.<br><br><b>Caution:</b> Avoid rapid drops – may compromise placental perfusion.",
          icon: "favorite"
        }
      ]
    },
    {
      type: "section",
      title: "Hemorrhage / Vaginal Bleeding"
    },
    {
      type: "accordion",
      title: "Antepartum Hemorrhage",
      items: [
        {
          title: "Placenta Previa",
          content: "<b>Definition:</b> Placenta covering or near cervical os.<br><br><b>Presentation:</b><br>• Painless vaginal bleeding (classically)<br>• Often recurrent episodes<br>• Soft, non-tender uterus<br><br><b>Treatment:</b><br>• High-flow O2<br>• Two large-bore IVs<br>• Fluid resuscitation for shock<br>• Left lateral position<br>• <b>DO NOT perform vaginal exam</b><br>• Emergent transport to hospital with OB",
          icon: "water_drop"
        },
        {
          title: "Placental Abruption",
          content: "<b>Definition:</b> Premature separation of placenta from uterine wall.<br><br><b>Presentation:</b><br>• Painful vaginal bleeding (may be concealed)<br>• Rigid, tender, \"board-like\" uterus<br>• Fetal distress or absent heart tones<br>• Signs of shock out of proportion to visible bleeding<br><br><b>Causes:</b> Trauma, hypertension, cocaine, rapid decompression of uterus<br><br><b>Treatment:</b><br>• High-flow O2<br>• Two large-bore IVs, aggressive fluid resuscitation<br>• Left lateral position<br>• Emergent transport – this is a surgical emergency<br>• Prepare for maternal and neonatal resuscitation",
          icon: "warning"
        },
        {
          title: "Uterine Rupture",
          content: "<b>Risk factors:</b> Prior cesarean, uterine surgery, trauma, prolonged labor, high-dose oxytocin<br><br><b>Presentation:</b><br>• Sudden severe abdominal pain (may decrease after rupture)<br>• Vaginal bleeding<br>• Fetal parts palpable through abdomen<br>• Loss of fetal heart tones<br>• Signs of hemorrhagic shock<br><br><b>Treatment:</b><br>• Immediate transport to trauma/OB-capable hospital<br>• Aggressive resuscitation<br>• Prepare for emergent cesarean delivery",
          icon: "emergency"
        }
      ]
    },
    {
      type: "accordion",
      title: "Postpartum Hemorrhage",
      items: [
        {
          title: "Definition and Causes (4 T's)",
          content: "<b>Definition:</b> Blood loss > 500 mL vaginal delivery or > 1000 mL cesarean.<br><br><b>Causes (4 T's):</b><br>• <b>Tone</b> (70%) – Uterine atony (most common)<br>• <b>Trauma</b> (20%) – Lacerations, hematoma<br>• <b>Tissue</b> (10%) – Retained placenta<br>• <b>Thrombin</b> (<1%) – Coagulopathy",
          icon: "water_drop"
        },
        {
          title: "Treatment",
          content: "<b>Uterine Atony (Boggy Uterus):</b><br>• <b>Fundal massage</b> – Vigorous bimanual massage<br>• Empty bladder (Foley if needed)<br>• Oxytocin 10 units IM (if available)<br><br><b>General Measures:</b><br>• Two large-bore IVs<br>• Aggressive fluid resuscitation<br>• TXA 1 g IV if hemorrhage and < 3 hours from delivery<br>• Keep patient warm<br>• Emergent transport",
          icon: "medication"
        }
      ]
    },
    {
      type: "section",
      title: "Cord Emergencies"
    },
    {
      type: "accordion",
      title: "Prolapsed Umbilical Cord",
      items: [
        {
          title: "Management",
          content: "<b>LIFE-THREATENING EMERGENCY</b><br><br><b>1. Position:</b> Knee-chest position OR steep Trendelenburg (head down)<br><br><b>2. Elevate presenting part:</b><br>• Insert gloved hand into vagina<br>• Lift fetal head or presenting part OFF the cord<br>• Maintain manual elevation continuously<br><br><b>3. Protect cord:</b><br>• Keep cord warm and moist with saline-soaked gauze<br>• Do NOT attempt to replace cord into uterus<br>• Do NOT compress or handle cord excessively<br><br><b>4. Transport:</b><br>• Emergent transport to closest hospital with cesarean capability<br>• Notify hospital early<br>• Maintain manual elevation until surgical delivery",
          icon: "emergency"
        }
      ]
    },
    {
      type: "section",
      title: "Other Complications"
    },
    {
      type: "accordion",
      title: "Ectopic Pregnancy",
      items: [
        {
          title: "Recognition and Treatment",
          content: "<b>Definition:</b> Pregnancy implanted outside uterus (usually fallopian tube).<br><br><b>Presentation:</b><br>• Lower abdominal/pelvic pain (unilateral)<br>• Vaginal bleeding (often light)<br>• Positive pregnancy test or history of missed period<br>• Symptoms 6-8 weeks after LMP<br>• Signs of shock if ruptured<br><br><b>Ruptured Ectopic (Surgical Emergency):</b><br>• Severe abdominal pain, guarding, rebound<br>• Hypotension, tachycardia<br>• Shoulder pain (referred from diaphragmatic irritation)<br><br><b>Treatment:</b><br>• Two large-bore IVs<br>• Aggressive fluid resuscitation<br>• Emergent transport to surgical center",
          icon: "warning"
        }
      ]
    },
    {
      type: "accordion",
      title: "Supine Hypotensive Syndrome",
      items: [
        {
          title: "Recognition and Treatment",
          content: "<b>Cause:</b> Gravid uterus compresses IVC when mother is supine (after ~20 weeks).<br><br><b>Presentation:</b><br>• Hypotension, dizziness, nausea<br>• Pallor, diaphoresis<br>• Fetal bradycardia<br><br><b>Treatment:</b><br>• <b>Left lateral decubitus position</b><br>• Manual uterine displacement to left<br>• If on backboard, tilt 15-30° to left<br>• Symptoms typically resolve rapidly with repositioning",
          icon: "info"
        }
      ]
    },
    {
      type: "section",
      title: "Cardiac Arrest in Pregnancy"
    },
    {
      type: "warning",
      content: "<b>PERIMORTEM CESAREAN DELIVERY:</b><br><br>If maternal cardiac arrest and no ROSC after 4 minutes of CPR:<br>• Prepare for perimortem cesarean (hospital only)<br>• Goal: Deliver within 5 minutes of arrest<br>• Improves maternal resuscitation by relieving aortocaval compression<br>• May save viable fetus (> 23-24 weeks)<br><br><b>Field Management:</b><br>• High-quality CPR with manual left uterine displacement<br>• Defibrillation as indicated (safe in pregnancy)<br>• Standard ACLS medications at normal doses<br>• Rapid transport to hospital with OB capability<br>• Notify hospital: \"Pregnant patient in cardiac arrest, consider perimortem cesarean\""
    },
    {
      type: "info",
      title: "Medication Safety in Pregnancy",
      content: "<b>Safe to use:</b><br>• Epinephrine (standard doses)<br>• Amiodarone<br>• Magnesium sulfate<br>• Lidocaine<br>• Fentanyl (avoid near delivery)<br>• Ondansetron<br>• Normal saline, Lactated Ringer's<br><br><b>Avoid if possible:</b><br>• NSAIDs (third trimester)<br>• ACE inhibitors<br><br><b>Note:</b> Do not withhold life-saving medications due to pregnancy concerns."
    },
    {
      type: "facility-finder",
      title: "Nearest Perinatal / OB Center",
      facilityTypes: ["pediatric"]
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>Physiologic changes in pregnancy:</b><br>• Increased blood volume (30-50%) – may mask hemorrhage<br>• Increased HR (10-15 bpm higher)<br>• Decreased BP (5-15 mmHg lower)<br>• Delayed gastric emptying – aspiration risk<br>• Elevated diaphragm – lower FRC<br><br><b>Signs of shock appear late</b> in pregnancy due to increased blood volume.<br><br><b>Concealed hemorrhage:</b> Always consider abruption if shock out of proportion to visible bleeding."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1215 Childbirth (Normal Delivery)" },
        { title: "TP-1216 Newborn Resuscitation" },
        { title: "TP-1218 Pregnancy/Labor" },
        { title: "TP-1210 Cardiac Arrest" },
        { title: "TP-1231 Seizure" }
      ]
    }
  ]
};
