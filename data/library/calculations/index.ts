import { Protocol } from '../../../types';

// Rule of 9s - Burn TBSA Calculation
export const ruleOf9s: Protocol = {
  id: "CALC-RULE-OF-9S",
  refNo: "REF-BURNS",
  title: "Rule of 9s - Burn TBSA Calculation",
  category: "Procedures",
  type: "Reference",
  lastUpdated: "Jan 1, 2026",
  icon: "local_fire_department",
  color: "orange",
  sections: [
    {
      type: "header",
      items: [{
        title: "Rule of 9s",
        subtitle: "Total Body Surface Area (TBSA) Calculation for Burns",
        icon: "local_fire_department"
      }]
    },
    {
      type: "info",
      title: "Purpose",
      content: "Quick estimation of burn size to guide fluid resuscitation and triage decisions. Only count partial-thickness (2nd degree) and full-thickness (3rd degree) burns."
    },
    {
      type: "list",
      title: "Adult Rule of 9s",
      items: [
        { title: "Head & Neck", content: "<b>9%</b> of TBSA<br>Front and back of head combined" },
        { title: "Each Arm", content: "<b>9%</b> of TBSA per arm<br>Includes front and back of entire arm" },
        { title: "Anterior Chest", content: "<b>18%</b> of TBSA<br>Front of torso (chest + abdomen)" },
        { title: "Posterior Back", content: "<b>18%</b> of TBSA<br>Back of torso (upper back + lower back)" },
        { title: "Each Leg", content: "<b>18%</b> of TBSA per leg<br>Includes front and back of entire leg" },
        { title: "Perineum/Genitals", content: "<b>1%</b> of TBSA" }
      ]
    },
    {
      type: "list",
      title: "Pediatric Rule of 9s (<10 years old)",
      items: [
        { title: "Head & Neck", content: "<b>18%</b> of TBSA<br>Larger proportion due to bigger head size in children" },
        { title: "Each Arm", content: "<b>9%</b> of TBSA per arm<br>Same as adults" },
        { title: "Anterior Chest", content: "<b>18%</b> of TBSA<br>Same as adults" },
        { title: "Posterior Back", content: "<b>18%</b> of TBSA<br>Same as adults" },
        { title: "Each Leg", content: "<b>14%</b> of TBSA per leg<br>Smaller proportion due to shorter legs in children" }
      ]
    },
    {
      type: "info",
      title: "Palm Method (Alternative)",
      content: "<b>Patient's palm (including fingers) = ~1% TBSA</b><br><br>Use for scattered or irregular burn patterns. Count how many 'palms' would cover the burned area.<br><br><b>Example:</b> If 15 palm-sized areas are burned = ~15% TBSA"
    },
    {
      type: "warning",
      content: "<b>Do NOT include first-degree burns (superficial/sunburn-like)</b> in TBSA calculation. Only count:<br>• Partial-thickness (2nd degree) - blisters, red, painful<br>• Full-thickness (3rd degree) - white/charred, painless<br><br><b>Critical Burns:</b><br>• >20% TBSA in adults<br>• >10% TBSA in children/elderly<br>• Face, hands, feet, genitals, joints<br>• Circumferential burns<br>• Inhalation injury"
    }
  ]
};

// Parkland Formula - Burn Fluid Resuscitation
export const parklandFormula: Protocol = {
  id: "CALC-PARKLAND",
  refNo: "REF-PARKLAND",
  title: "Parkland Formula - Burn Fluid Resuscitation",
  category: "Procedures",
  type: "Reference",
  lastUpdated: "Jan 1, 2026",
  icon: "water_drop",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{
        title: "Parkland Formula",
        subtitle: "Fluid Resuscitation for Major Burns",
        icon: "water_drop"
      }]
    },
    {
      type: "info",
      title: "Formula",
      content: "<div style='background: #1e40af; color: white; padding: 16px; border-radius: 8px; font-size: 18px; text-align: center; margin: 16px 0;'><b>4 mL × Weight (kg) × %TBSA = Total 24-hour fluid requirement</b></div><br><b>Fluid:</b> Lactated Ringer's (LR) preferred<br><b>Time starts:</b> From time of burn injury (not hospital arrival)"
    },
    {
      type: "list",
      title: "Administration Schedule",
      items: [
        {
          title: "First 8 Hours",
          content: "<b>Give 50% of total calculated volume</b><br><br>Administer <b>half</b> of the 24-hour total in the <b>first 8 hours</b> from time of injury.<br><br><b>Example:</b> If total = 8000 mL, give 4000 mL in first 8 hours (500 mL/hr)"
        },
        {
          title: "Next 16 Hours",
          content: "<b>Give remaining 50% of total calculated volume</b><br><br>Administer the other <b>half</b> over the <b>next 16 hours</b>.<br><br><b>Example:</b> If total = 8000 mL, give 4000 mL over next 16 hours (250 mL/hr)"
        }
      ]
    },
    {
      type: "info",
      title: "Calculation Example",
      content: "<b>Patient:</b> 80 kg adult with 30% TBSA burns<br><br><b>Step 1:</b> Calculate total 24-hour fluid<br>4 mL × 80 kg × 30% = 9,600 mL<br><br><b>Step 2:</b> First 8 hours (50%)<br>9,600 mL ÷ 2 = 4,800 mL in first 8 hours<br>Rate: 4,800 mL ÷ 8 hours = <b>600 mL/hr</b><br><br><b>Step 3:</b> Next 16 hours (50%)<br>9,600 mL ÷ 2 = 4,800 mL in next 16 hours<br>Rate: 4,800 mL ÷ 16 hours = <b>300 mL/hr</b>"
    },
    {
      type: "warning",
      content: "<b>Important Considerations:</b><br>• Formula is a <u>starting point</u> - titrate to urine output<br>• <b>Goal urine output:</b> 0.5-1 mL/kg/hr (adults), 1-2 mL/kg/hr (children)<br>• Over-resuscitation → pulmonary edema, compartment syndrome<br>• Under-resuscitation → shock, organ failure<br>• <b>Do NOT use for burns <15% TBSA</b> (oral hydration sufficient)<br>• Adjust time if delayed presentation (start from time of injury, not arrival)<br><br><b>Prehospital:</b> Start 2 large-bore IVs, run wide open initially, then adjust to formula rate if transport >1 hour"
    },
    {
      type: "list",
      title: "Monitoring & Adjustment",
      items: [
        { title: "Urine Output", content: "<b>Primary endpoint</b><br>• Adults: 0.5-1 mL/kg/hr<br>• Children: 1-2 mL/kg/hr<br>• If low → increase rate<br>• If high → decrease rate" },
        { title: "Vital Signs", content: "Monitor HR, BP, mental status<br>Tachycardia/hypotension → increase fluids" },
        { title: "Avoid", content: "• Colloids in first 24 hours<br>• Dextrose solutions (unless hypoglycemic)<br>• Excessive fluid (>6 mL/kg/%TBSA)" }
      ]
    }
  ]
};

// Glasgow Coma Scale
export const glasgowComaScale: Protocol = {
  id: "CALC-GCS",
  refNo: "REF-GCS",
  title: "Glasgow Coma Scale (GCS)",
  category: "Neurology",
  type: "Reference",
  lastUpdated: "Jan 1, 2026",
  icon: "psychology",
  color: "purple",
  sections: [
    {
      type: "header",
      items: [{
        title: "Glasgow Coma Scale",
        subtitle: "Neurological Assessment Tool",
        icon: "psychology"
      }]
    },
    {
      type: "info",
      title: "Purpose & Scoring",
      content: "<b>Assess level of consciousness in trauma and medical patients</b><br><br><div style='background: #7c3aed; color: white; padding: 16px; border-radius: 8px; font-size: 18px; text-align: center; margin: 16px 0;'><b>Total Score: 3-15 points</b><br>Eye Opening (1-4) + Verbal Response (1-5) + Motor Response (1-6)</div><br><b>Interpretation:</b><br>• <b>13-15:</b> Mild brain injury<br>• <b>9-12:</b> Moderate brain injury<br>• <b>≤8:</b> Severe brain injury (intubation threshold)<br>• <b>3:</b> Completely unresponsive (worst possible score)"
    },
    {
      type: "list",
      title: "Eye Opening Response (E1-E4)",
      items: [
        { title: "4 - Spontaneous", content: "Eyes open spontaneously without stimulation<br><b>Best response</b>" },
        { title: "3 - To Voice", content: "Eyes open to verbal command<br>'Open your eyes'" },
        { title: "2 - To Pain", content: "Eyes open only to painful stimulus<br>Trapezius squeeze, supraorbital pressure" },
        { title: "1 - None", content: "No eye opening despite painful stimulus<br><b>Worst response</b>" }
      ]
    },
    {
      type: "list",
      title: "Verbal Response (V1-V5)",
      items: [
        { title: "5 - Oriented", content: "Oriented to person, place, time, and situation<br>Appropriate conversation<br><b>Best response</b>" },
        { title: "4 - Confused", content: "Disoriented, confused conversation<br>Answers questions but confused" },
        { title: "3 - Inappropriate Words", content: "Intelligible words but nonsensical<br>Random or inappropriate exclamations" },
        { title: "2 - Incomprehensible Sounds", content: "Moaning, groaning, unintelligible sounds<br>No recognizable words" },
        { title: "1 - None", content: "No verbal response despite stimulation<br><b>Worst response</b>" }
      ]
    },
    {
      type: "list",
      title: "Motor Response (M1-M6)",
      items: [
        { title: "6 - Obeys Commands", content: "Follows simple motor commands<br>'Squeeze my hand', 'Hold up two fingers'<br><b>Best response</b>" },
        { title: "5 - Localizes to Pain", content: "Purposeful movement toward painful stimulus<br>Hand crosses midline to remove painful stimulus" },
        { title: "4 - Withdraws from Pain", content: "Normal flexion, withdraws from pain<br>Pulls limb away from painful stimulus but does not cross midline" },
        { title: "3 - Abnormal Flexion (Decorticate)", content: "Flexion to pain with adduction<br>Arms flexed at elbows, wrists flexed, legs extended<br>Indicates severe brain injury" },
        { title: "2 - Extension (Decerebrate)", content: "Extension to painful stimulus<br>Arms and legs extended, wrists pronated<br>Indicates brainstem involvement" },
        { title: "1 - None", content: "No motor response to painful stimulus<br>Flaccid<br><b>Worst response</b>" }
      ]
    },
    {
      type: "warning",
      content: "<b>GCS ≤8 = Severe Brain Injury</b><br><br><b>Indications for immediate intervention:</b><br>• Consider intubation (unable to protect airway)<br>• Hyperventilate if signs of herniation<br>• Elevate head of bed 30°<br>• Avoid hypotension and hypoxia<br>• Rapid transport to trauma center<br><br><b>Special Considerations:</b><br>• <b>Intubated patients:</b> Score verbal as 'T' (e.g., 8T = E2 V-T M6)<br>• <b>Eye swelling:</b> Score eye as 'C' if cannot assess<br>• Document best response, not worst<br>• Serial GCS monitoring essential (trend more important than single value)<br>• Decrease of ≥2 points = concerning"
    },
    {
      type: "info",
      title: "Painful Stimulus Techniques",
      content: "<b>Central (preferred for accurate assessment):</b><br>• <b>Trapezius squeeze:</b> Pinch trapezius muscle between thumb and fingers<br>• <b>Supraorbital pressure:</b> Press under eyebrow ridge<br>• <b>Sternal rub:</b> Knuckles rubbed on sternum (avoid if chest trauma)<br><br><b>Peripheral (less reliable):</b><br>• Nail bed pressure with pen<br>• May elicit spinal reflex without brain involvement<br><br><b>Apply for 5-10 seconds, increase gradually</b>"
    },
    {
      type: "list",
      title: "GCS Scoring Examples",
      items: [
        { title: "GCS 15 (Normal)", content: "<b>E4 V5 M6</b><br>Eyes open spontaneously<br>Oriented and conversing<br>Follows commands" },
        { title: "GCS 12 (Moderate)", content: "<b>E3 V4 M5</b><br>Eyes open to voice<br>Confused conversation<br>Localizes to pain" },
        { title: "GCS 8 (Severe)", content: "<b>E2 V2 M4</b><br>Eyes open to pain<br>Incomprehensible sounds<br>Withdraws from pain<br><b>Intubation threshold</b>" },
        { title: "GCS 3 (Worst)", content: "<b>E1 V1 M1</b><br>No eye opening<br>No verbal response<br>No motor response<br><b>Completely unresponsive</b>" }
      ]
    }
  ]
};

// Pediatric Weight Estimation
export const pediatricWeight: Protocol = {
  id: "CALC-PED-WEIGHT",
  refNo: "REF-PED-WEIGHT",
  title: "Pediatric Weight Estimation",
  category: "Pediatric",
  type: "Reference",
  lastUpdated: "Jan 1, 2026",
  icon: "child_care",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{
        title: "Pediatric Weight Estimation",
        subtitle: "Age-Based Weight Calculation",
        icon: "child_care"
      }]
    },
    {
      type: "info",
      title: "When to Use",
      content: "When child's weight is unknown and no scale available. Critical for medication dosing, fluid resuscitation, and equipment sizing in emergencies.<br><br><b>Note:</b> These are estimates only. Use actual weight whenever possible."
    },
    {
      type: "list",
      title: "Weight Estimation by Age",
      items: [
        {
          title: "Age 1-10 Years",
          content: "<div style='background: #ec4899; color: white; padding: 16px; border-radius: 8px; font-size: 18px; text-align: center; margin: 16px 0;'><b>Weight (kg) = (Age × 2) + 8</b></div><br><b>Examples:</b><br>• 2 years: (2 × 2) + 8 = <b>12 kg</b><br>• 5 years: (5 × 2) + 8 = <b>18 kg</b><br>• 8 years: (8 × 2) + 8 = <b>24 kg</b>"
        },
        {
          title: "Age <1 Year (Infants)",
          content: "<b>Use Broselow Tape or weight chart</b><br><br>Formula less accurate for infants due to rapid growth variation.<br><br><b>Approximate Guide:</b><br>• Birth: 3-4 kg<br>• 3 months: 5-6 kg<br>• 6 months: 7-8 kg<br>• 9 months: 9 kg<br>• 12 months: 10 kg<br><br><b>Alternative:</b> Weight (kg) = (Age in months + 9) ÷ 2"
        },
        {
          title: "Age >10 Years",
          content: "<b>Formula becomes less accurate</b><br><br>Adolescents vary widely in size. Consider:<br>• Visual estimation<br>• Parent report<br>• Use adult dosing if clearly adult-sized<br><br><b>Rough guide:</b><br>• 11 years: ~35 kg<br>• 14 years: ~50 kg<br>• Adult size: >50 kg"
        }
      ]
    },
    {
      type: "info",
      title: "Broselow Tape (Preferred for <1 year)",
      content: "<b>Length-based resuscitation tape</b><br><br>Measures child's length and provides:<br>• Estimated weight in kg<br>• Pre-calculated medication doses<br>• Equipment sizes (ETT, IV cath, etc.)<br><br><b>How to use:</b><br>1. Lay child supine<br>2. Place tape from head to heel<br>3. Read color zone at heel<br>4. Use zone's weight and dosing recommendations<br><br><b>Most accurate for children <14 kg or <143 cm</b>"
    },
    {
      type: "warning",
      content: "<b>Limitations of Weight Estimation:</b><br>• Formulas based on average weights - individual variation<br>• Obesity/underweight not accounted for<br>• Prematurity affects infant weights<br>• Always use actual weight if available<br>• When in doubt, estimate conservatively (lower dose safer)<br><br><b>Critical medications (narrow therapeutic index):</b><br>• Electricity (defibrillation/cardioversion)<br>• Sedatives (Midazolam)<br>• Vasopressors<br><br>Extra caution with dosing estimates. Note: Paralytics NOT in LA County formulary."
    },
    {
      type: "list",
      title: "Quick Reference Weight Table",
      items: [
        { title: "Newborn", content: "3-4 kg (7-9 lbs)" },
        { title: "6 months", content: "7-8 kg (15-18 lbs)" },
        { title: "1 year", content: "10 kg (22 lbs)" },
        { title: "2 years", content: "12 kg (26 lbs)<br><b>Formula:</b> (2×2)+8=12" },
        { title: "3 years", content: "14 kg (31 lbs)<br><b>Formula:</b> (3×2)+8=14" },
        { title: "4 years", content: "16 kg (35 lbs)<br><b>Formula:</b> (4×2)+8=16" },
        { title: "5 years", content: "18 kg (40 lbs)<br><b>Formula:</b> (5×2)+8=18" },
        { title: "6 years", content: "20 kg (44 lbs)<br><b>Formula:</b> (6×2)+8=20" },
        { title: "7 years", content: "22 kg (48 lbs)<br><b>Formula:</b> (7×2)+8=22" },
        { title: "8 years", content: "24 kg (53 lbs)<br><b>Formula:</b> (8×2)+8=24" },
        { title: "9 years", content: "26 kg (57 lbs)<br><b>Formula:</b> (9×2)+8=26" },
        { title: "10 years", content: "28 kg (62 lbs)<br><b>Formula:</b> (10×2)+8=28" }
      ]
    }
  ]
};

// MAP Calculation
export const mapCalculation: Protocol = {
  id: "CALC-MAP",
  refNo: "REF-MAP",
  title: "Mean Arterial Pressure (MAP) Calculation",
  category: "General Medical",
  type: "Reference",
  lastUpdated: "Jan 1, 2026",
  icon: "favorite",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{
        title: "Mean Arterial Pressure (MAP)",
        subtitle: "Perfusion Pressure Calculation",
        icon: "favorite"
      }]
    },
    {
      type: "info",
      title: "What is MAP?",
      content: "<b>Mean Arterial Pressure = Average pressure in arteries during one cardiac cycle</b><br><br>Better indicator of tissue perfusion than systolic BP alone. MAP represents the average pressure pushing blood through the circulatory system.<br><br><b>Why it matters:</b><br>• Organ perfusion depends on MAP<br>• More accurate than SBP for assessing shock<br>• Target for vasopressor therapy<br>• Critical in sepsis, trauma, neurological injuries"
    },
    {
      type: "info",
      title: "MAP Formula",
      content: "<div style='background: #dc2626; color: white; padding: 16px; border-radius: 8px; font-size: 20px; text-align: center; margin: 16px 0;'><b>MAP = (SBP + 2×DBP) ÷ 3</b></div><br><b>Where:</b><br>• <b>SBP</b> = Systolic Blood Pressure<br>• <b>DBP</b> = Diastolic Blood Pressure<br><br><b>Why weighted toward diastolic?</b><br>The heart spends about 2/3 of the cardiac cycle in diastole (relaxation), so diastolic pressure contributes more to average arterial pressure."
    },
    {
      type: "list",
      title: "Calculation Examples",
      items: [
        {
          title: "Normal BP: 120/80",
          content: "<b>MAP = (120 + 2×80) ÷ 3</b><br>MAP = (120 + 160) ÷ 3<br>MAP = 280 ÷ 3<br><b>MAP = 93 mmHg</b> ✓ Normal"
        },
        {
          title: "Hypertensive: 180/110",
          content: "<b>MAP = (180 + 2×110) ÷ 3</b><br>MAP = (180 + 220) ÷ 3<br>MAP = 400 ÷ 3<br><b>MAP = 133 mmHg</b> ⚠️ Elevated"
        },
        {
          title: "Hypotensive: 90/60",
          content: "<b>MAP = (90 + 2×60) ÷ 3</b><br>MAP = (90 + 120) ÷ 3<br>MAP = 210 ÷ 3<br><b>MAP = 70 mmHg</b> ⚠️ Borderline low"
        },
        {
          title: "Shock: 80/50",
          content: "<b>MAP = (80 + 2×50) ÷ 3</b><br>MAP = (80 + 100) ÷ 3<br>MAP = 180 ÷ 3<br><b>MAP = 60 mmHg</b> ⚠️ Inadequate perfusion"
        }
      ]
    },
    {
      type: "info",
      title: "MAP Normal Values & Interpretation",
      content: "<b>Normal MAP: 70-105 mmHg</b><br><br><b>Target MAP by Condition:</b><br><br><div style='background: #10b981; color: white; padding: 12px; border-radius: 8px; margin: 8px 0;'><b>General Target: ≥65 mmHg</b><br>Minimum for adequate organ perfusion</div><br><div style='background: #3b82f6; color: white; padding: 12px; border-radius: 8px; margin: 8px 0;'><b>Septic Shock: ≥65 mmHg</b><br>Initial resuscitation target (may increase to 75-85 in elderly)</div><br><div style='background: #8b5cf6; color: white; padding: 12px; border-radius: 8px; margin: 8px 0;'><b>Traumatic Brain Injury: 80-100 mmHg</b><br>Maintain cerebral perfusion pressure (CPP = MAP - ICP)</div><br><div style='background: #f59e0b; color: white; padding: 12px; border-radius: 8px; margin: 8px 0;'><b>Spinal Cord Injury: 85-90 mmHg</b><br>First 7 days post-injury to optimize spinal cord perfusion</div>"
    },
    {
      type: "warning",
      content: "<b>Critical MAP Values:</b><br><br><b>MAP <60 mmHg:</b><br>• Inadequate organ perfusion<br>• Risk of acute kidney injury<br>• Risk of myocardial ischemia<br>• Immediate intervention required<br><br><b>MAP <50 mmHg:</b><br>• Severe hypoperfusion<br>• High mortality risk<br>• Aggressive resuscitation needed<br><br><b>MAP >130 mmHg:</b><br>• Hypertensive emergency (if with end-organ damage)<br>• Risk of stroke, MI, aortic dissection<br>• Controlled BP reduction needed"
    },
    {
      type: "list",
      title: "Clinical Applications",
      items: [
        {
          title: "Sepsis/Septic Shock",
          content: "<b>Goal MAP ≥65 mmHg</b><br><br>Surviving Sepsis Campaign guidelines:<br>1. Fluid resuscitation (30 mL/kg crystalloid)<br>2. If MAP <65 after fluids → vasopressors<br>3. Norepinephrine first-line<br>4. Titrate to MAP ≥65 mmHg"
        },
        {
          title: "Traumatic Brain Injury",
          content: "<b>Goal MAP 80-100 mmHg</b><br><br>Maintain cerebral perfusion pressure (CPP):<br><b>CPP = MAP - ICP</b><br>Goal CPP: 60-70 mmHg<br><br>Avoid hypotension (SBP <90, MAP <65)<br>Single episode of hypotension doubles mortality in TBI"
        },
        {
          title: "Hemorrhagic Shock",
          content: "<b>Permissive hypotension</b><br><br>Target MAP 60-65 mmHg initially<br>Avoid excessive fluids until hemorrhage controlled<br>Balance perfusion vs. clot disruption<br><br>Exception: Concurrent head injury → maintain MAP 80+"
        },
        {
          title: "Vasopressor Therapy",
          content: "<b>Titrate to MAP target</b><br><br>Most vasopressors dosed to MAP:<br>• Norepinephrine: Start 0.05-0.1 mcg/kg/min, titrate to MAP ≥65<br>• Epinephrine: Similar dosing<br>• Vasopressin: Fixed 0.03-0.04 units/min<br>• Phenylephrine: 0.5-1.5 mcg/kg/min"
        }
      ]
    },
    {
      type: "info",
      title: "Quick Mental Math Shortcut",
      content: "<b>Approximate MAP without calculator:</b><br><br><b>Method 1: Diastolic + 1/3 Pulse Pressure</b><br>1. Calculate pulse pressure: SBP - DBP<br>2. Divide by 3<br>3. Add to DBP<br><br><b>Example: 120/80</b><br>Pulse pressure = 120 - 80 = 40<br>40 ÷ 3 ≈ 13<br>MAP ≈ 80 + 13 = 93 mmHg<br><br><b>Method 2: Round and estimate</b><br>MAP ≈ DBP + 40 (works for normal BP)<br>Example: 120/80 → 80 + 40 = 120... wait that's not right<br>Better: <b>MAP ≈ DBP + (SBP-DBP)÷3</b>"
    }
  ]
};

// Export all calculations as an array
export const calculations: Protocol[] = [
  ruleOf9s,
  parklandFormula,
  glasgowComaScale,
  pediatricWeight,
  mapCalculation
];
