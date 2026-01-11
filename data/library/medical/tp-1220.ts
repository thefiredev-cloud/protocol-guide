
import { Protocol } from '../../../types';

export const tp1220: Protocol = {
  id: "1220",
  refNo: "TP-1220",
  title: "Burns",
  category: "Environmental",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "local_fire_department",
  color: "green",
  sections: [
    {
      type: "header",
      items: [{ title: "Burns", subtitle: "Adult - Standing Order", icon: "local_fire_department" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "BURN", content: "Burn Injury - Thermal, chemical, or electrical" },
        { title: "MBRN", content: "Major Burn - Meeting burn center criteria" },
        { title: "INHI", content: "Inhalation Injury - Associated airway burns (see TP-1236)" },
        { title: "ELEC", content: "Electrical Injury - See also TP-1221 Electrocution" }
      ]
    },
    {
      type: "warning",
      content: "<b>STOP THE BURNING PROCESS:</b> Remove patient from heat source. Remove smoldering clothing and jewelry. Cool burns < 10% TBSA with tepid water for 3-5 minutes. Do NOT cool large burns (hypothermia risk). Do NOT apply ice directly to burns."
    },
    {
      type: "section",
      title: "Burn Classification"
    },
    {
      type: "accordion",
      title: "Burn Depth",
      items: [
        {
          title: "Superficial (1st Degree)",
          content: "<b>Depth:</b> Epidermis only<br><br><b>Appearance:</b><br>- Red, dry<br>- No blisters<br>- Painful to touch<br>- Blanches with pressure<br><br><b>Example:</b> Sunburn<br><br><b>Healing:</b> 3-5 days, no scarring<br><br><b>Note:</b> NOT included in TBSA calculation",
          icon: "visibility"
        },
        {
          title: "Partial Thickness (2nd Degree)",
          content: "<b>Superficial Partial:</b><br>- Epidermis + superficial dermis<br>- Wet, weeping, blisters<br>- Very painful<br>- Blanches with pressure<br>- Heals 10-21 days, minimal scarring<br><br><b>Deep Partial:</b><br>- Epidermis + deep dermis<br>- Waxy, wet appearance<br>- Less painful (nerve damage)<br>- Sluggish capillary refill<br>- May require grafting<br>- Heals 3-9 weeks with scarring",
          icon: "visibility"
        },
        {
          title: "Full Thickness (3rd Degree)",
          content: "<b>Depth:</b> Through entire dermis<br><br><b>Appearance:</b><br>- Leathery, dry, waxy<br>- White, brown, or black<br>- No blisters (dermis destroyed)<br>- Painless (nerves destroyed)<br>- Does not blanch<br><br><b>Healing:</b> Requires skin grafting<br><br><b>Note:</b> May appear deceptively minor initially",
          icon: "visibility"
        },
        {
          title: "4th Degree",
          content: "<b>Depth:</b> Through dermis into fat, muscle, bone<br><br><b>Appearance:</b><br>- Charred<br>- Visible structures (tendon, bone)<br>- Painless<br><br><b>Associated with:</b><br>- Prolonged flame exposure<br>- Electrical injury<br>- Contact burns<br><br><b>Management:</b> Surgical debridement/amputation often required"
        }
      ]
    },
    {
      type: "section",
      title: "TBSA Estimation"
    },
    {
      type: "calculator",
      title: "Burn TBSA Calculator"
    },
    {
      type: "accordion",
      title: "TBSA Calculation Methods",
      items: [
        {
          title: "Rule of Nines (Adult)",
          content: "<b>Standard adult percentages:</b><br><br>- Head and neck: <b>9%</b><br>- Each arm: <b>9%</b> (4.5% anterior, 4.5% posterior)<br>- Anterior trunk: <b>18%</b><br>- Posterior trunk: <b>18%</b><br>- Each leg: <b>18%</b> (9% anterior, 9% posterior)<br>- Perineum: <b>1%</b><br><br><b>Total: 100%</b><br><br><b>Note:</b> Only count 2nd and 3rd degree burns. Do NOT count 1st degree burns.",
          icon: "calculate"
        },
        {
          title: "Pediatric Rule of Nines",
          content: "<b>Children have larger head, smaller legs:</b><br><br><b>Infant:</b><br>- Head: <b>18%</b><br>- Each leg: <b>14%</b><br><br><b>Child (1-4 years):</b><br>- Head: <b>15%</b><br>- Each leg: <b>16%</b><br><br><b>Child (5-9 years):</b><br>- Head: <b>13%</b><br>- Each leg: <b>17%</b><br><br><b>Adolescent (10+):</b> Approaches adult values<br><br><b>Trunk and arms:</b> Same as adult",
          icon: "child_care"
        },
        {
          title: "Palmar Method",
          content: "<b>Patient's palm (with fingers) = ~1% TBSA</b><br><br><b>Useful for:</b><br>- Small, scattered burns<br>- Very large burns (estimate unburned area)<br><br><b>Technique:</b><br>- Use patient's palm, not yours<br>- Include fingers in measurement<br>- Count how many palms fit in burned area"
        }
      ]
    },
    {
      type: "section",
      title: "Fluid Resuscitation"
    },
    {
      type: "accordion",
      title: "Burn Fluid Management",
      items: [
        {
          title: "Parkland Formula",
          content: "<b>Crystalloid (LR or NS) in first 24 hours:</b><br><br><b>4 mL x weight (kg) x %TBSA</b><br><br>- Give 1/2 in first 8 hours from time of burn<br>- Give 1/2 in next 16 hours<br><br><b>Example:</b><br>80 kg patient with 40% TBSA burn:<br>4 x 80 x 40 = 12,800 mL in 24 hours<br>= 6,400 mL in first 8 hours<br>= 800 mL/hour for first 8 hours",
          icon: "water_drop"
        },
        {
          title: "Prehospital Simplified Approach",
          content: "<b>For burns > 20% TBSA:</b><br><br>- Adult: 500 mL/hour Lactated Ringers or NS<br>- Pediatric: 20 mL/kg bolus, then 10-20 mL/kg/hour<br><br><b>Titrate to:</b><br>- Urine output 0.5-1 mL/kg/hour (if monitored)<br>- Maintain adequate perfusion<br><br><b>Caution:</b><br>- Over-resuscitation causes edema, compartment syndrome<br>- Under-resuscitation causes organ failure<br>- Adjust rate based on patient response",
          icon: "water_drop"
        },
        {
          title: "When to Start Fluids",
          content: "<b>Indications for aggressive fluids:</b><br>- Burns > 20% TBSA adult<br>- Burns > 10% TBSA pediatric<br>- Electrical burns<br>- Signs of shock<br><br><b>Small burns (< 20%):</b><br>- May not need aggressive resuscitation<br>- Maintenance fluids adequate<br>- Oral rehydration if alert and no airway concern"
        }
      ]
    },
    {
      type: "section",
      title: "Burn Management"
    },
    {
      type: "accordion",
      title: "Specific Treatments",
      items: [
        {
          title: "Airway Assessment - CRITICAL",
          content: "<b>Always assess for inhalation injury:</b><br>- Facial burns<br>- Singed nasal hairs<br>- Carbonaceous sputum<br>- Hoarseness, stridor<br>- Burns in enclosed space<br><br><b>See TP-1236 Inhalation Injury</b><br><br><b>Key principle:</b> Intubate EARLY if any signs of airway involvement. Airway edema will worsen.",
          icon: "warning"
        },
        {
          title: "Wound Care",
          content: "<b>Prehospital wound care:</b><br>- Remove non-adherent clothing/jewelry<br>- Cool small burns (< 10%) with tepid water 3-5 min<br>- Cover with clean, dry dressings or burn sheets<br>- Keep patient warm (hypothermia prevention)<br><br><b>Do NOT:</b><br>- Apply ice (causes frostbite, vasoconstriction)<br>- Apply butter, oils, or home remedies<br>- Rupture blisters<br>- Cool large burns (hypothermia risk)"
        },
        {
          title: "Pain Management",
          content: "<b>Burns are extremely painful:</b><br><br><b>Fentanyl (preferred):</b><br>- 1-2 mcg/kg IV/IM/IN<br>- Rapid onset, short duration<br>- Titrate every 5-10 minutes<br><br><b>Morphine:</b><br>- 0.1 mg/kg IV<br>- Slower onset<br><br><b>Ketamine (for severe pain or hemodynamic instability):</b><br>- 0.2-0.5 mg/kg IV (analgesic dose)<br>- Maintains hemodynamics<br><br><b>Do NOT undertreat pain</b>",
          icon: "medication"
        },
        {
          title: "Circumferential Burns",
          content: "<b>High-risk locations:</b><br>- Circumferential extremity burns<br>- Circumferential chest burns<br>- Circumferential neck burns<br><br><b>Complications:</b><br>- Compartment syndrome (extremities)<br>- Respiratory compromise (chest)<br>- Vascular compromise<br><br><b>Signs of compartment syndrome:</b><br>- Pain out of proportion<br>- Paresthesias<br>- Pallor, pulselessness (late)<br><br><b>Treatment:</b> Escharotomy (hospital procedure)<br><br><b>Prehospital:</b> Elevate extremities, expedite transport"
        }
      ]
    },
    {
      type: "accordion",
      title: "Special Burn Types",
      items: [
        {
          title: "Chemical Burns",
          content: "<b>Immediate management:</b><br>- Remove contaminated clothing<br>- Brush off dry chemicals BEFORE water<br>- Copious water irrigation (20-30 minutes)<br>- Continue irrigation during transport<br><br><b>Special agents:</b><br>- <b>Hydrofluoric acid:</b> Calcium gluconate gel; may need IV/IA calcium<br>- <b>Phenol:</b> PEG wipe if available, then water<br>- <b>Phosphorus:</b> Keep wet (ignites when dry)<br>- <b>Cement:</b> Prolonged irrigation needed<br><br><b>Eye involvement:</b> Morgan lens or continuous irrigation",
          icon: "science"
        },
        {
          title: "Electrical Burns",
          content: "<b>See TP-1221 Electrocution for details</b><br><br><b>Key points:</b><br>- Visible burns underestimate internal injury<br>- Cardiac monitoring essential (arrhythmias)<br>- Rhabdomyolysis risk (aggressive fluids)<br>- Look for entry AND exit wounds<br>- Spine precautions if fall/tetanic contraction<br>- Consider compartment syndrome",
          icon: "bolt"
        },
        {
          title: "Tar/Asphalt Burns",
          content: "<b>Initial management:</b><br>- Cool immediately with water<br>- Do NOT try to remove tar in field<br>- Cover with moist dressings<br><br><b>Hospital treatment:</b><br>- Petroleum-based solvents soften tar<br>- Mineral oil, polysorbate<br>- Surgical debridement if needed"
        }
      ]
    },
    {
      type: "section",
      title: "Burn Center Criteria"
    },
    {
      type: "accordion",
      title: "Transport Destination",
      items: [
        {
          title: "ABA Burn Center Referral Criteria",
          content: "<b>Transfer to burn center for:</b><br><br>- Partial thickness > 10% TBSA<br>- Full thickness burns (any size)<br>- Burns to face, hands, feet, genitalia, perineum, major joints<br>- Chemical burns<br>- Electrical burns (including lightning)<br>- Inhalation injury<br>- Burn + trauma (burn center if burn is greatest risk)<br>- Burns in patients with comorbidities<br>- Burns in children (specialized centers)<br>- Burns requiring social, emotional, or rehabilitation services",
          icon: "local_hospital"
        },
        {
          title: "LA County Burn Resources",
          content: "<b>Contact base hospital for:</b><br>- Burn center bed availability<br>- Transport mode (ground vs air)<br>- Direct admission vs ED transfer<br><br><b>Considerations:</b><br>- Airway stability for transport<br>- Distance to burn center vs local ED<br>- Patient hemodynamic status"
        }
      ]
    },
    {
      type: "info",
      title: "Pediatric Considerations",
      content: "<b>TBSA estimation:</b><br>- Use pediatric Rule of Nines (larger head, smaller legs)<br>- Palmar method helpful for scattered burns<br><br><b>Fluid resuscitation:</b><br>- Same Parkland formula<br>- Add maintenance fluids (D5LR or D5NS)<br>- Watch for hypoglycemia<br><br><b>Airway:</b><br>- Smaller airway = faster obstruction from edema<br>- Lower threshold for intubation<br><br><b>Thermoregulation:</b><br>- Higher surface area:mass ratio<br>- Hypothermia develops rapidly<br>- Keep patient warm<br><br><b>Non-accidental trauma:</b><br>- Stocking/glove pattern<br>- Cigarette burns<br>- Burns inconsistent with history<br>- Delay in seeking care<br>- Document and report"
    },
    {
      type: "warning",
      content: "<b>CRITICAL ACTIONS SUMMARY:</b><br><br>1. <b>STOP</b> the burning process<br>2. <b>ASSESS</b> airway - intubate early if indicated<br>3. <b>ESTIMATE</b> TBSA using Rule of Nines<br>4. <b>START</b> fluids for burns > 20% TBSA<br>5. <b>MANAGE</b> pain aggressively<br>6. <b>PREVENT</b> hypothermia<br>7. <b>TRANSPORT</b> to appropriate facility"
    },
    {
      type: "clinical-pearl",
      title: "Clinical Pearls",
      content: "<b>The Rule of 10s:</b> For adults - if burned area is > 10%, they need IV access. If > 20%, they need aggressive fluid resuscitation.<br><br><b>First degree burns don't count:</b> Sunburn is painful but does not factor into TBSA calculations or fluid requirements.<br><br><b>Pain equals nerve intact:</b> The most painful burns (superficial partial thickness) often heal the best. Painless burns are deep and concerning.<br><br><b>Cool the burn, warm the patient:</b> Brief cooling of small burns is helpful; prolonged cooling or cooling large burns causes hypothermia.<br><br><b>What you see is not what you get (electrical):</b> Surface burns from electrical injury dramatically underestimate internal tissue damage.<br><br><b>Airway deteriorates:</b> A patient who is talking now may not be talking in an hour. If inhalation injury is suspected and transport time is long, consider early intubation."
    },
    {
      type: "link-list",
      title: "Related Protocols",
      items: [
        { title: "TP-1236 Inhalation Injury" },
        { title: "TP-1221 Electrocution" },
        { title: "TP-1238 Carbon Monoxide Exposure" },
        { title: "TP-1240 HAZMAT / Nerve Agent / Radiological" },
        { title: "PP-1304 Rapid Sequence Intubation" },
        { title: "RS-1405 Medication Reference" }
      ]
    }
  ]
};
