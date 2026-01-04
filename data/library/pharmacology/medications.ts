import { Protocol } from '../../../types';

export const medications: Protocol[] = [
  {
    id: "MED-EPI",
    refNo: "Epinephrine",
    title: "Epinephrine",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "medication",
    color: "red",
    sections: [
      {
        type: "header",
        items: [{ title: "Epinephrine", subtitle: "Sympathomimetic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Sympathomimetic, Catecholamine, Vasopressor"
          },
          {
            title: "Mechanism",
            content: "Direct alpha and beta adrenergic agonist. Alpha-1 effects cause vasoconstriction and increased peripheral vascular resistance. Beta-1 effects increase cardiac contractility and heart rate. Beta-2 effects cause bronchodilation."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Cardiac arrest (VF/VT, PEA, Asystole)<br>• Anaphylaxis<br>• Severe bronchospasm<br>• Symptomatic bradycardia (refractory)<br>• Severe hypotension/shock"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• None in cardiac arrest<br>• Relative: Hypertensive crisis, pulmonary edema from heart failure<br>• Caution in cocaine/stimulant toxicity"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Cardiac Arrest:</b> 1mg (10mL of 1:10,000) IV/IO every 3-5 minutes<br><br><b>Anaphylaxis:</b> 0.3-0.5mg (0.3-0.5mL of 1:1,000) IM lateral thigh, may repeat every 5-15 minutes<br><br><b>Severe Bronchospasm:</b> 0.3-0.5mg IM<br><br><b>Push-Dose Pressor:</b> 10-20mcg IV (1-2mL of 10mcg/mL dilution) every 2-5 minutes"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Cardiac Arrest:</b> 0.01mg/kg (0.1mL/kg of 1:10,000) IV/IO every 3-5 minutes (Max single dose: 1mg)<br><br><b>Anaphylaxis:</b> 0.01mg/kg (0.01mL/kg of 1:1,000) IM lateral thigh (Max: 0.5mg), may repeat every 5-15 minutes"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Tachycardia, dysrhythmias, hypertension, increased myocardial oxygen demand, anxiety, tremor, headache, pulmonary edema. May cause tissue necrosis if extravasated."
          }
        ]
      }
    ]
  },
  {
    id: "MED-AMIO",
    refNo: "Amiodarone",
    title: "Amiodarone",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "monitor_heart",
    color: "purple",
    sections: [
      {
        type: "header",
        items: [{ title: "Amiodarone", subtitle: "Antiarrhythmic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Class III Antiarrhythmic"
          },
          {
            title: "Mechanism",
            content: "Blocks potassium channels prolonging action potential duration and refractory period. Also has beta-blocker properties and blocks sodium and calcium channels. Slows conduction and prolongs refractoriness in AV node."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Ventricular fibrillation (VF)<br>• Pulseless ventricular tachycardia (VT)<br>• Stable ventricular tachycardia<br>• Atrial fibrillation with rapid ventricular response<br>• SVT refractory to adenosine"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Cardiogenic shock (relative in arrest)<br>• Severe sinus node dysfunction<br>• 2nd or 3rd degree AV block (without pacemaker)<br>• Known hypersensitivity<br>• Caution with other QT-prolonging drugs"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Cardiac Arrest (VF/Pulseless VT):</b> 300mg IV/IO rapid push, may give second dose of 150mg IV/IO<br><br><b>Stable VT/Wide-Complex Tachycardia:</b> 150mg IV over 10 minutes, may repeat 150mg every 10 minutes as needed<br><br><b>Infusion:</b> 1mg/min for 6 hours, then 0.5mg/min for 18 hours"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Cardiac Arrest (VF/Pulseless VT):</b> 5mg/kg IV/IO rapid push (Max: 300mg), may repeat up to 15mg/kg total<br><br><b>Perfusing Tachycardia:</b> 5mg/kg IV/IO over 20-60 minutes (Max: 300mg)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Hypotension (most common with IV), bradycardia, AV block, QT prolongation, phlebitis. With chronic use: pulmonary toxicity, thyroid dysfunction, hepatotoxicity, corneal deposits, photosensitivity."
          }
        ]
      }
    ]
  },
  {
    id: "MED-ADEN",
    refNo: "Adenosine",
    title: "Adenosine",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "science",
    color: "purple",
    sections: [
      {
        type: "header",
        items: [{ title: "Adenosine", subtitle: "Antiarrhythmic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Endogenous Nucleoside, Antiarrhythmic"
          },
          {
            title: "Mechanism",
            content: "Slows conduction through AV node and interrupts reentry pathways. Activates potassium channels causing hyperpolarization and depression of calcium-dependent action potentials. Very short half-life (< 10 seconds)."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Supraventricular tachycardia (SVT)<br>• Paroxysmal supraventricular tachycardia (PSVT)<br>• AV nodal reentrant tachycardia (AVNRT)<br>• Diagnostic aid for wide-complex tachycardia"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• 2nd or 3rd degree AV block<br>• Sick sinus syndrome (without pacemaker)<br>• Known hypersensitivity<br>• Atrial fibrillation/flutter with pre-excitation (WPW)<br>• Severe asthma or COPD (relative)<br>• Recent dipyridamole use"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Initial:</b> 6mg rapid IV push over 1-2 seconds, followed immediately by 20mL saline flush and arm elevation<br><br><b>Second Dose:</b> 12mg rapid IV push if no response after 1-2 minutes<br><br><b>Third Dose:</b> 12mg rapid IV push if needed<br><br><b>Note:</b> Higher doses (12mg initial) may be needed with central line administration or patients on theophylline/caffeine"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Initial:</b> 0.1mg/kg rapid IV push (Max: 6mg), followed immediately by saline flush<br><br><b>Second Dose:</b> 0.2mg/kg rapid IV push (Max: 12mg) if no response after 1-2 minutes"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Transient asystole (expected), flushing, chest pain/pressure, dyspnea, bronchospasm, headache, dizziness, nausea. Most effects resolve within 1-2 minutes. May precipitate atrial fibrillation."
          }
        ]
      }
    ]
  },
  {
    id: "MED-ATROP",
    refNo: "Atropine",
    title: "Atropine Sulfate",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "monitor_heart",
    color: "red",
    sections: [
      {
        type: "header",
        items: [{ title: "Atropine", subtitle: "Anticholinergic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Anticholinergic, Parasympatholytic, Antimuscarinic"
          },
          {
            title: "Mechanism",
            content: "Blocks acetylcholine at muscarinic receptors, inhibiting parasympathetic stimulation. Increases heart rate by blocking vagal effects on SA and AV nodes. Also decreases secretions and causes bronchodilation."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Symptomatic bradycardia<br>• Bradycardia with hypotension/shock<br>• AV block (Mobitz I)<br>• Organophosphate/nerve agent poisoning<br>• Bradycardia post-cardiac arrest"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Tachycardia<br>• Acute MI with heart rate > 60 (may increase ischemia)<br>• Hypothermic bradycardia<br>• 2nd degree Type II or 3rd degree AV block (may worsen)<br>• Use with caution in glaucoma, urinary retention"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Bradycardia:</b> 0.5mg IV/IO every 3-5 minutes as needed (Max total: 3mg)<br><br><b>Organophosphate Poisoning:</b> 2-5mg IV/IO every 5 minutes until secretions dry, may require large cumulative doses<br><br><b>Note:</b> Doses < 0.5mg may cause paradoxical bradycardia"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Bradycardia:</b> 0.02mg/kg IV/IO (Minimum: 0.1mg, Maximum single dose: 0.5mg), may repeat once<br><br><b>Maximum total dose:</b> 1mg (child), 3mg (adolescent)<br><br><b>Organophosphate Poisoning:</b> 0.05mg/kg IV/IO every 10-20 minutes until secretions controlled"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Tachycardia, palpitations, dry mouth, blurred vision, mydriasis, urinary retention, confusion/delirium (especially elderly), hyperthermia, paradoxical bradycardia with low doses. May worsen myocardial ischemia."
          }
        ]
      }
    ]
  },
  {
    id: "MED-MID",
    refNo: "Midazolam",
    title: "Midazolam",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "psychology",
    color: "purple",
    sections: [
      {
        type: "header",
        items: [{ title: "Midazolam (Versed)", subtitle: "Benzodiazepine" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Benzodiazepine, Sedative-Hypnotic, Anticonvulsant"
          },
          {
            title: "Mechanism",
            content: "Enhances GABA activity in the CNS, producing anxiolysis, sedation, amnesia, muscle relaxation, and anticonvulsant effects. Short-acting with rapid onset."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Seizures (status epilepticus)<br>• Procedural sedation<br>• Agitation/combative patients<br>• Anxiolysis<br>• Pre-intubation sedation<br>• Alcohol withdrawal seizures"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Acute narrow-angle glaucoma<br>• Known hypersensitivity<br>• Use with extreme caution in respiratory depression, COPD, sleep apnea<br>• Avoid in pregnancy (especially 1st trimester)<br>• Caution with concurrent CNS depressants/alcohol"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Seizures:</b> 5mg IM/IN or 2.5mg slow IV, may repeat once after 10 minutes<br><br><b>Sedation (Procedural):</b> 2-2.5mg IV slowly over 2-3 minutes, titrate to effect (Max: 5mg)<br><br><b>Agitation:</b> 5mg IM, may repeat every 10-15 minutes<br><br><b>Intranasal:</b> 0.2mg/kg (Max: 10mg), divide dose between nostrils"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Seizures IV:</b> 0.1mg/kg slow IV/IO (Max: 5mg)<br><br><b>Seizures IM/IN:</b> 0.2mg/kg IM/IN (Max: 10mg)<br><br><b>Sedation IV:</b> 0.05-0.1mg/kg IV slowly (Max: 2.5mg)<br><br><b>Age < 6 months:</b> Use with extreme caution, higher risk respiratory depression"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Respiratory depression (especially with IV route), hypotension, paradoxical agitation (children/elderly), amnesia, confusion, nausea. Reversal: Flumazenil (0.2mg IV). Have airway equipment ready."
          }
        ]
      }
    ]
  },
  {
    id: "MED-FENT",
    refNo: "Fentanyl",
    title: "Fentanyl",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "medication",
    color: "purple",
    sections: [
      {
        type: "header",
        items: [{ title: "Fentanyl", subtitle: "Opioid Analgesic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Synthetic Opioid Analgesic, Controlled Substance (Schedule II)"
          },
          {
            title: "Mechanism",
            content: "Potent mu-opioid receptor agonist in CNS and peripheral tissues. Produces analgesia, euphoria, and respiratory depression. 50-100 times more potent than morphine with faster onset and shorter duration."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Moderate to severe pain<br>• Trauma pain<br>• Procedural analgesia<br>• Chest pain (cardiac)<br>• Burns<br>• Adjunct to intubation (RSI)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity<br>• Respiratory depression without airway support<br>• Acute or severe asthma (unmonitored setting)<br>• Caution in elderly, renal/hepatic impairment<br>• Head injury with altered mental status (relative)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>IV/IM:</b> 50-100mcg (1-2mcg/kg) slow IV over 1-2 minutes, may repeat every 5-10 minutes as needed<br><br><b>Intranasal:</b> 100-200mcg (1-2mcg/kg), divide dose between nostrils using mucosal atomizer<br><br><b>Maximum:</b> Titrate to pain relief and respiratory status, typically max 500mcg prehospital"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>IV/IM:</b> 1mcg/kg slow IV/IM (Max: 50mcg), may repeat every 5-10 minutes<br><br><b>Intranasal:</b> 1-2mcg/kg IN (Max: 100mcg), divide between nostrils<br><br><b>Age < 2 years:</b> Use with extreme caution"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Respiratory depression, hypotension, bradycardia, chest wall rigidity (high/rapid doses), nausea/vomiting, sedation, dizziness, pruritus. Reversal: Naloxone. Monitor respiratory rate, SpO2, and blood pressure."
          }
        ]
      }
    ]
  },
  {
    id: "MED-MOR",
    refNo: "Morphine",
    title: "Morphine Sulfate",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "medication",
    color: "purple",
    sections: [
      {
        type: "header",
        items: [{ title: "Morphine", subtitle: "Opioid Analgesic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Opioid Analgesic, Controlled Substance (Schedule II)"
          },
          {
            title: "Mechanism",
            content: "Mu-opioid receptor agonist producing analgesia, euphoria, sedation, and respiratory depression. Also causes venodilation reducing preload (beneficial in pulmonary edema). Longer duration than fentanyl."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Moderate to severe pain<br>• Acute coronary syndrome (ACS) with chest pain<br>• Pulmonary edema (reduces preload)<br>• Trauma pain<br>• Burns<br>• Post-operative pain"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity<br>• Respiratory depression without airway support<br>• Acute or severe asthma (unmonitored setting)<br>• Hypotension/shock (relative for analgesia)<br>• Head injury with altered mental status (relative)<br>• Acute abdomen (relative)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Pain Management:</b> 2-4mg slow IV over 1-2 minutes, repeat every 5-10 minutes as needed (Max: 10-20mg prehospital)<br><br><b>Alternative IM:</b> 5-10mg IM<br><br><b>Pulmonary Edema:</b> 2-4mg IV slowly, repeat as needed for dyspnea relief"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>IV/IM:</b> 0.1mg/kg slow IV or IM (Max single dose: 5mg)<br><br><b>Repeat dosing:</b> May repeat every 10-15 minutes as needed<br><br><b>Age < 6 months:</b> Generally not recommended prehospital"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Respiratory depression, hypotension, bradycardia, nausea/vomiting, sedation, dizziness, pruritus, urinary retention, constipation, histamine release. Reversal: Naloxone. Monitor vital signs and respiratory status closely."
          }
        ]
      }
    ]
  },
  {
    id: "MED-NAL",
    refNo: "Naloxone",
    title: "Naloxone (Narcan)",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "medication",
    color: "orange",
    sections: [
      {
        type: "header",
        items: [{ title: "Naloxone", subtitle: "Opioid Antagonist" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Opioid Antagonist, Antidote"
          },
          {
            title: "Mechanism",
            content: "Competitive antagonist at mu, kappa, and delta opioid receptors. Rapidly displaces opioids from receptors, reversing respiratory depression, sedation, and hypotension. No effect if opioids not present."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Opioid overdose with respiratory depression<br>• Reversal of opioid-induced respiratory depression<br>• Suspected opioid toxicity<br>• Altered mental status with suspected opioid involvement<br>• Iatrogenic opioid overdose"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity<br>• Use caution in opioid-dependent patients (may precipitate withdrawal)<br>• Caution in patients with cardiac disease (withdrawal may cause arrhythmias)<br>• No absolute contraindications in life-threatening overdose"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Intranasal:</b> 2-4mg (1-2 sprays) IN, may repeat every 2-3 minutes as needed<br><br><b>IV/IM:</b> 0.4-2mg IV/IM/IO, may repeat every 2-3 minutes (Max: 10mg total)<br><br><b>Titration Strategy:</b> Start with lower doses (0.4mg) to avoid precipitating severe withdrawal; goal is adequate respirations, not full consciousness<br><br><b>Infusion:</b> May require continuous infusion for long-acting opioids (e.g., methadone)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>IV/IM/IN/IO:</b> 0.1mg/kg (Max: 2mg single dose)<br><br><b>Age < 5 years or < 20kg:</b> 0.1mg/kg<br><br><b>Age ≥ 5 years or ≥ 20kg:</b> 2mg<br><br>May repeat every 2-3 minutes as needed"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Acute opioid withdrawal (agitation, tachycardia, hypertension, vomiting, diarrhea), pulmonary edema (rare), ventricular arrhythmias, seizures (rare). Short duration (30-90 min) may require re-dosing. Monitor for re-sedation with long-acting opioids."
          }
        ]
      }
    ]
  },
  {
    id: "MED-ALB",
    refNo: "Albuterol",
    title: "Albuterol",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "air",
    color: "blue",
    sections: [
      {
        type: "header",
        items: [{ title: "Albuterol", subtitle: "Beta-2 Agonist Bronchodilator" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Short-Acting Beta-2 Adrenergic Agonist (SABA), Bronchodilator"
          },
          {
            title: "Mechanism",
            content: "Selective beta-2 adrenergic agonist that stimulates receptors in bronchial smooth muscle, causing relaxation and bronchodilation. Also inhibits release of inflammatory mediators from mast cells. Onset 5-15 minutes, peak 30-60 minutes."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Asthma exacerbation<br>• Bronchospasm<br>• COPD exacerbation<br>• Anaphylaxis with bronchospasm<br>• Hyperkalemia (adjunct)<br>• Reactive airway disease"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity<br>• Use with caution in cardiac disease (may cause tachycardia, dysrhythmias)<br>• Caution in hypertension, hyperthyroidism, diabetes<br>• No absolute contraindications in severe bronchospasm"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Nebulized:</b> 2.5-5mg (0.5-1mL of 0.5% solution) in 3mL normal saline via nebulizer over 5-15 minutes<br><br><b>Severe Bronchospasm:</b> May use continuous nebulization (10-15mg/hour)<br><br><b>MDI:</b> 4-8 puffs (90mcg/puff) via spacer every 20 minutes as needed<br><br>May repeat every 20 minutes x3, then hourly"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Nebulized < 1 year:</b> 1.25-2.5mg in 3mL NS<br><br><b>Nebulized ≥ 1 year:</b> 2.5-5mg in 3mL NS<br><br><b>Weight-based:</b> 0.15mg/kg (Max: 5mg)<br><br><b>MDI:</b> 4-8 puffs every 20 minutes via spacer/mask"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Tachycardia, palpitations, tremor, nervousness/anxiety, headache, hypokalemia, hyperglycemia, paradoxical bronchospasm (rare), hypertension. Cardiac dysrhythmias with excessive dosing. Monitor heart rate and rhythm."
          }
        ]
      }
    ]
  },
  {
    id: "MED-ASA",
    refNo: "Aspirin",
    title: "Aspirin",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "pill",
    color: "red",
    sections: [
      {
        type: "header",
        items: [{ title: "Aspirin (ASA)", subtitle: "Antiplatelet Agent" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Antiplatelet Agent, Nonsteroidal Anti-Inflammatory Drug (NSAID), Salicylate"
          },
          {
            title: "Mechanism",
            content: "Irreversibly inhibits cyclooxygenase (COX-1 and COX-2) enzymes, preventing thromboxane A2 synthesis. This reduces platelet aggregation and clot formation. In acute coronary syndrome, reduces mortality and reinfarction. Also has anti-inflammatory and antipyretic properties."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Acute coronary syndrome (ACS)<br>• Suspected myocardial infarction (MI)<br>• Unstable angina<br>• STEMI or NSTEMI<br>• Ischemic stroke (within parameters)<br>• Suspected cardiac chest pain"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Active gastrointestinal bleeding or peptic ulcer<br>• Known aspirin/NSAID allergy or severe asthma with ASA sensitivity<br>• Hemorrhagic stroke or suspected intracranial hemorrhage<br>• Severe bleeding disorder (hemophilia)<br>• Recent major trauma with bleeding risk<br>• Children < 12 years (Reye's syndrome risk)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Acute Coronary Syndrome:</b> 162-324mg PO chewed and swallowed (NOT enteric-coated)<br><br><b>Standard dose:</b> 324mg (four 81mg chewable tablets)<br><br><b>Alternative:</b> 162mg if already on daily aspirin<br><br><b>Administration:</b> MUST be chewed for rapid absorption, then swallowed with water. Chewing achieves therapeutic levels within 5 minutes vs 30 minutes if swallowed whole."
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Generally NOT indicated in pediatrics</b> due to Reye's syndrome risk<br><br><b>Kawasaki Disease (hospital only):</b> 80-100mg/kg/day divided<br><br>Consult medical control for any pediatric aspirin use"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Gastrointestinal upset, nausea, dyspepsia, GI bleeding, allergic reactions (bronchospasm, urticaria, angioedema), tinnitus (high doses), increased bleeding time, Reye's syndrome (children with viral illness). Generally well-tolerated in acute single dose."
          }
        ]
      }
    ]
  },
  {
    id: "MED-NTG",
    refNo: "Nitroglycerin",
    title: "Nitroglycerin",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "favorite",
    color: "red",
    sections: [
      {
        type: "header",
        items: [{ title: "Nitroglycerin", subtitle: "Vasodilator" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Nitrate, Vasodilator, Antianginal"
          },
          {
            title: "Mechanism",
            content: "Releases nitric oxide causing smooth muscle relaxation. Dilates venous capacitance vessels (reducing preload) and coronary arteries (improving myocardial oxygen supply). Decreases myocardial oxygen demand and increases oxygen delivery."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Acute coronary syndrome (ACS)<br>• Angina pectoris<br>• Chest pain of cardiac origin<br>• Acute pulmonary edema/CHF<br>• Hypertensive emergency (select cases)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Hypotension (SBP < 90-100 mmHg)<br>• Right ventricular infarction<br>• Severe bradycardia or tachycardia<br>• Increased intracranial pressure/head trauma<br>• Phosphodiesterase inhibitor use within 24-48 hours (sildenafil/Viagra, tadalafil/Cialis)<br>• Severe aortic stenosis"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Sublingual:</b> 0.4mg (1 tablet or spray) SL every 5 minutes as needed (Max: 3 doses)<br><br><b>Administration:</b> Place tablet under tongue or spray under tongue. Patient should sit or lie down. Recheck BP before each dose.<br><br><b>IV Infusion:</b> Start 10-20mcg/min, titrate by 5-10mcg/min every 3-5 minutes (hospital setting)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Generally not used in pediatric prehospital setting</b><br><br>Consult medical control if considering for adolescent with confirmed cardiac pathology"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Hypotension (most common), reflex tachycardia, headache (common), dizziness, syncope, flushing, nausea. Severe hypotension if combined with phosphodiesterase inhibitors. Monitor BP closely after each dose."
          }
        ]
      }
    ]
  },
  {
    id: "MED-ONDAN",
    refNo: "Ondansetron",
    title: "Ondansetron (Zofran)",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "medication",
    color: "green",
    sections: [
      {
        type: "header",
        items: [{ title: "Ondansetron", subtitle: "Antiemetic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Serotonin 5-HT3 Receptor Antagonist, Antiemetic"
          },
          {
            title: "Mechanism",
            content: "Selectively blocks serotonin 5-HT3 receptors in the chemoreceptor trigger zone and vagal nerve terminals. Prevents nausea and vomiting by blocking signals to the vomiting center. Does not cause sedation or extrapyramidal effects."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Nausea and vomiting (any cause)<br>• Motion sickness<br>• Post-operative nausea<br>• Gastroenteritis<br>• Opioid-induced nausea<br>• Food poisoning"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity<br>• Congenital long QT syndrome<br>• Concurrent use of apomorphine<br>• Caution in patients with electrolyte abnormalities (hypokalemia, hypomagnesemia)<br>• Caution with other QT-prolonging medications"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>IV/IM:</b> 4mg slow IV push over 2-5 minutes or IM<br><br><b>ODT (Orally Disintegrating Tablet):</b> 4-8mg PO, place on tongue to dissolve<br><br><b>Maximum dose:</b> 8mg per dose<br><br>May repeat once after 10-15 minutes if needed"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Age 6 months - 12 years:</b> 0.15mg/kg IV/IM (Max: 4mg)<br><br><b>Age > 12 years:</b> 4mg IV/IM<br><br><b>Weight-based dosing:</b><br>• 8-15kg: 2mg<br>• 15-30kg: 4mg<br>• > 30kg: 4mg"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Headache, dizziness, constipation, QT prolongation (rare but serious), serotonin syndrome (with other serotonergic drugs), extrapyramidal reactions (rare). Generally very well-tolerated with minimal side effects."
          }
        ]
      }
    ]
  },
  {
    id: "MED-DIPH",
    refNo: "Diphenhydramine",
    title: "Diphenhydramine (Benadryl)",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "medication",
    color: "pink",
    sections: [
      {
        type: "header",
        items: [{ title: "Diphenhydramine", subtitle: "Antihistamine" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "H1 Antihistamine, Anticholinergic"
          },
          {
            title: "Mechanism",
            content: "Competitive H1 receptor antagonist blocking histamine effects. Prevents vasodilation, increased vascular permeability, and smooth muscle contraction caused by histamine. Also has anticholinergic and sedative properties due to CNS penetration."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Allergic reactions (mild to moderate)<br>• Anaphylaxis (adjunct to epinephrine)<br>• Urticaria (hives)<br>• Pruritus (itching)<br>• Angioedema<br>• Dystonic reactions (from antipsychotics)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity<br>• Acute asthma attack (may thicken secretions)<br>• Narrow-angle glaucoma<br>• Prostatic hypertrophy/urinary retention<br>• Use caution in elderly (increased fall risk, confusion)<br>• Caution in young children (paradoxical excitation)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>IV/IM:</b> 25-50mg slow IV push over 2 minutes or deep IM<br><br><b>PO:</b> 25-50mg PO<br><br><b>Severe allergic reaction:</b> 50mg IV/IM<br><br>Maximum single dose: 50mg<br>May repeat every 4-6 hours as needed"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>IV/IM/PO:</b> 1mg/kg IV/IM/PO (Max: 50mg)<br><br><b>Alternative dosing by age:</b><br>• 2-5 years: 6.25-12.5mg<br>• 6-11 years: 12.5-25mg<br>• ≥ 12 years: 25-50mg<br><br>Not recommended for children < 2 years without medical control"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Sedation (common), drowsiness, dizziness, dry mouth, urinary retention, blurred vision, confusion (especially elderly), paradoxical excitation (children), hypotension with rapid IV administration, tachycardia. Warn patient about sedation; avoid driving/operating machinery."
          }
        ]
      }
    ]
  },
  {
    id: "MED-D10",
    refNo: "Dextrose10",
    title: "Dextrose 10% (D10)",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "water_drop",
    color: "yellow",
    sections: [
      {
        type: "header",
        items: [{ title: "Dextrose 10%", subtitle: "Antihypoglycemic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Carbohydrate, Antihypoglycemic, Hypertonic Solution"
          },
          {
            title: "Mechanism",
            content: "Simple sugar (glucose) that rapidly increases blood glucose levels when administered IV. Provides immediate fuel for cellular metabolism, particularly critical for brain function. D10 is preferred over D50 due to lower osmolarity and reduced risk of extravasation injury."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Hypoglycemia (blood glucose < 60-70 mg/dL)<br>• Altered mental status with confirmed hypoglycemia<br>• Diabetic emergency with low blood sugar<br>• Seizures due to hypoglycemia<br>• Unconsciousness from insulin/oral hypoglycemic overdose"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Intracranial hemorrhage (relative)<br>• Hyperglycemia<br>• Delirium tremens with adequate glucose<br>• Caution in stroke patients (check glucose first)<br>• No absolute contraindications in confirmed severe hypoglycemia"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>D10:</b> 250mL (25g dextrose) IV over 10-15 minutes<br><br><b>Alternative D50:</b> 25g (50mL of D50) IV push if D10 unavailable<br><br><b>Titration:</b> Recheck glucose after 10 minutes, repeat if needed<br><br><b>Goal:</b> Blood glucose > 80 mg/dL or symptom resolution"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>D10 (preferred):</b> 5mL/kg (0.5g/kg) IV over 5-10 minutes<br><br><b>Alternative dosing:</b><br>• Neonate: 2.5-5mL/kg of D10<br>• Infant/Child: 2-4mL/kg of D25<br>• Adolescent: May use adult dosing<br><br>Maximum single dose: 25g<br>Recheck glucose and repeat as needed"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Extravasation causing tissue necrosis (especially D50), hyperglycemia with excessive dosing, phlebitis, venous irritation, hypokalemia, hypophosphatemia. Use large vein when possible. D10 has significantly lower risk of extravasation injury compared to D50."
          }
        ]
      }
    ]
  },
  {
    id: "MED-GLUC",
    refNo: "Glucagon",
    title: "Glucagon",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "science",
    color: "orange",
    sections: [
      {
        type: "header",
        items: [{ title: "Glucagon", subtitle: "Antihypoglycemic Hormone" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Pancreatic Hormone, Antihypoglycemic, Hyperglycemic Agent"
          },
          {
            title: "Mechanism",
            content: "Peptide hormone that stimulates hepatic glycogenolysis and gluconeogenesis, increasing blood glucose. Works by mobilizing glucose from liver glycogen stores. Also has positive inotropic and chronotropic effects. Useful when IV access unavailable. Takes 10-20 minutes to work."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Hypoglycemia without IV access<br>• Severe hypoglycemia unresponsive or unable to take PO<br>• Beta-blocker overdose (refractory to other therapies)<br>• Calcium channel blocker overdose (adjunct)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Pheochromocytoma (may cause hypertensive crisis)<br>• Known hypersensitivity<br>• Less effective in chronic alcoholics, malnourished patients, or those with depleted glycogen stores<br>• Not effective in starvation or adrenal insufficiency"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Hypoglycemia:</b> 1mg IM or subcutaneous<br><br><b>Beta-blocker/CCB overdose:</b> 3-5mg IV bolus, then infusion of 2-5mg/hour (hospital setting)<br><br><b>Repeat:</b> May repeat 1mg dose after 15 minutes if no response<br><br><b>Note:</b> Position patient on side (nausea/vomiting common). Give oral carbohydrates when patient alert."
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Weight < 20kg (or age < 5 years):</b> 0.5mg IM/SC<br><br><b>Weight ≥ 20kg (or age ≥ 5 years):</b> 1mg IM/SC<br><br>May repeat after 15 minutes if needed<br><br>Follow with oral glucose when awake and able to swallow"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Nausea and vomiting (very common - position patient on side), hyperglycemia, hypokalemia, hypersensitivity reactions, hypertension, tachycardia. Transient increase in blood pressure and pulse. Less reliable than IV dextrose but useful when IV access not available."
          }
        ]
      }
    ]
  },
  {
    id: "MED-CACL",
    refNo: "CalciumChloride",
    title: "Calcium Chloride",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "science",
    color: "gray",
    sections: [
      {
        type: "header",
        items: [{ title: "Calcium Chloride", subtitle: "Electrolyte Replacement" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Electrolyte Supplement, Antidote, Cardiotonic"
          },
          {
            title: "Mechanism",
            content: "Provides ionized calcium essential for cardiac contractility, neuromuscular function, and cellular membrane stability. Antagonizes hyperkalemia effects on cardiac membrane. Reverses calcium channel blocker toxicity. Stabilizes cardiac membranes in hyperkalemia and other electrolyte emergencies."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Hyperkalemia with cardiac toxicity (widened QRS, peaked T waves)<br>• Calcium channel blocker overdose<br>• Hypocalcemia (symptomatic)<br>• Magnesium sulfate toxicity<br>• Hydrofluoric acid exposure<br>• Beta-blocker overdose (adjunct)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Hypercalcemia<br>• Ventricular fibrillation during cardiac resuscitation (controversial)<br>• Digitalis toxicity (may worsen)<br>• Caution in patients on digoxin<br>• Do NOT mix with sodium bicarbonate (precipitates)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Hyperkalemia/CCB overdose:</b> 1g (10mL of 10% solution) slow IV push over 5-10 minutes<br><br><b>May repeat:</b> Every 10-15 minutes as needed<br><br><b>Administration:</b> Give through large vein or central line. Flush line before and after. Monitor ECG during administration.<br><br><b>Note:</b> Causes severe tissue necrosis if extravasated"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>IV:</b> 20mg/kg (0.2mL/kg of 10% solution) slow IV over 5-10 minutes<br><br><b>Maximum single dose:</b> 1g (10mL)<br><br>May repeat as needed based on response and ECG changes<br><br>Use with extreme caution in neonates"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Severe tissue necrosis if extravasated, bradycardia, hypotension, cardiac arrest (if given too rapidly), arrhythmias, hypercalcemia, peripheral vasodilation, sensation of heat/warmth. Potentiates digoxin toxicity. MUST give slowly through good IV. Monitor ECG continuously."
          }
        ]
      }
    ]
  },
  {
    id: "MED-BICARB",
    refNo: "SodiumBicarbonate",
    title: "Sodium Bicarbonate",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "science",
    color: "blue",
    sections: [
      {
        type: "header",
        items: [{ title: "Sodium Bicarbonate", subtitle: "Alkalinizing Agent" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Alkalinizing Agent, Electrolyte, Antacid, Antidote"
          },
          {
            title: "Mechanism",
            content: "Buffers metabolic acidosis by combining with hydrogen ions to form water and CO2. Increases blood pH and serum bicarbonate. In tricyclic antidepressant toxicity, increases protein binding and reduces free drug. Alkalinizes urine promoting excretion of certain toxins."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Tricyclic antidepressant overdose (with QRS widening)<br>• Severe metabolic acidosis (pH < 7.1)<br>• Hyperkalemia (adjunct)<br>• Prolonged cardiac arrest with adequate ventilation<br>• Aspirin/salicylate overdose<br>• Certain toxin ingestions (phenobarbital, methotrexate)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Metabolic or respiratory alkalosis<br>• Hypocalcemia (may worsen)<br>• Inadequate ventilation (will worsen respiratory acidosis)<br>• Use caution in CHF (sodium load)<br>• Do NOT mix with calcium (precipitates)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Metabolic acidosis:</b> 1mEq/kg (50-100mEq) slow IV push<br><br><b>TCA overdose with wide QRS:</b> 1-2mEq/kg IV bolus, repeat until QRS narrows or pH 7.45-7.55<br><br><b>Cardiac arrest:</b> 1mEq/kg IV/IO after adequate ventilation established<br><br><b>Preparation:</b> 8.4% solution = 1mEq/mL (50mL = 50mEq)"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Metabolic acidosis:</b> 1mEq/kg slow IV/IO<br><br><b>Cardiac arrest:</b> 1mEq/kg IV/IO (only if prolonged arrest with adequate ventilation)<br><br><b>Neonates:</b> Use 4.2% solution (0.5mEq/mL) to reduce osmolarity<br><br>Maximum rate: 10mEq/min"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Metabolic alkalosis, hypernatremia, hyperosmolality, hypokalemia, hypocalcemia (ionized), paradoxical intracellular acidosis if inadequate ventilation, tissue necrosis with extravasation, seizures (neonates with rapid infusion). May inactivate catecholamines - flush line between drugs."
          }
        ]
      }
    ]
  },
  {
    id: "MED-LIDO",
    refNo: "Lidocaine",
    title: "Lidocaine",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "monitor_heart",
    color: "purple",
    sections: [
      {
        type: "header",
        items: [{ title: "Lidocaine", subtitle: "Antiarrhythmic/Local Anesthetic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Class IB Antiarrhythmic, Sodium Channel Blocker, Local Anesthetic"
          },
          {
            title: "Mechanism",
            content: "Blocks sodium channels in cardiac tissue, decreasing automaticity and suppressing ventricular arrhythmias. Shortens action potential duration and refractory period in Purkinje fibers and ventricles. Alternative to amiodarone for VF/VT. Also provides local/regional anesthesia and IO pain relief."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Ventricular fibrillation (VF)<br>• Pulseless ventricular tachycardia (VT)<br>• Stable ventricular tachycardia<br>• PVCs with hemodynamic compromise<br>• IO access pain (2% preservative-free)<br>• Local anesthesia for procedures"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity to amide local anesthetics<br>• High-grade AV block (without pacemaker)<br>• Severe sinus node dysfunction<br>• Stokes-Adams syndrome<br>• Prophylactic use in MI no longer recommended<br>• Wide-complex escape rhythms"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>Cardiac arrest (VF/VT):</b> 1-1.5mg/kg IV/IO initial bolus, may give additional 0.5-0.75mg/kg every 5-10 minutes (Max total: 3mg/kg)<br><br><b>Stable VT:</b> 1-1.5mg/kg IV over 2-3 minutes<br><br><b>Infusion:</b> 1-4mg/min continuous IV (after loading dose)<br><br><b>IO pain:</b> 40mg (2mL of 2% preservative-free) slow IO push prior to infusion"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Cardiac arrest (VF/VT):</b> 1mg/kg IV/IO initial bolus (Max: 100mg)<br><br><b>Infusion:</b> 20-50mcg/kg/min continuous IV<br><br><b>IO pain:</b> 0.5mg/kg (Max: 40mg) of 2% preservative-free lidocaine slow IO push"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "CNS toxicity: paresthesias, dizziness, confusion, seizures, slurred speech. Cardiovascular: hypotension, bradycardia, heart block, asystole (with toxicity). Tinnitus, metallic taste, drowsiness, muscle twitching. Toxic dose > 3mg/kg. Reduce dose in liver disease, CHF, elderly."
          }
        ]
      }
    ]
  },
  {
    id: "MED-KETO",
    refNo: "Ketorolac",
    title: "Ketorolac (Toradol)",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "medication",
    color: "blue",
    sections: [
      {
        type: "header",
        items: [{ title: "Ketorolac", subtitle: "NSAID Analgesic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Nonsteroidal Anti-Inflammatory Drug (NSAID), Non-opioid Analgesic"
          },
          {
            title: "Mechanism",
            content: "Non-selective COX-1 and COX-2 inhibitor that reduces prostaglandin synthesis, providing analgesia and anti-inflammatory effects. Potent analgesic comparable to opioids for certain pain types (musculoskeletal, renal colic) without respiratory depression or addiction potential."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Moderate to severe acute pain<br>• Musculoskeletal pain<br>• Renal colic/kidney stones<br>• Post-traumatic pain<br>• Migraine headache (adjunct)<br>• Post-operative pain"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Active GI bleeding or peptic ulcer disease<br>• Known NSAID or aspirin allergy<br>• Renal impairment or failure<br>• Bleeding disorders or anticoagulation<br>• Pregnancy (especially 3rd trimester)<br>• Age > 65 years (relative)<br>• Recent or scheduled surgery<br>• Suspected intracranial hemorrhage"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>IV:</b> 15-30mg slow IV push over 1-2 minutes<br><br><b>IM:</b> 30-60mg deep IM<br><br><b>Age < 65, Weight > 50kg:</b> 30mg IV or 60mg IM<br><b>Age ≥ 65, Weight < 50kg, or renal impairment:</b> 15mg IV or 30mg IM<br><br><b>Maximum duration:</b> 5 days total therapy<br>Single doses only in prehospital setting"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Age ≥ 2 years:</b> 0.5mg/kg IV or 1mg/kg IM<br><br><b>Maximum single dose:</b> 15mg IV or 30mg IM<br><br><b>Not recommended:</b> Children < 2 years<br><br>Use only for short-term pain management"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "GI bleeding/ulceration, renal impairment, bleeding/prolonged bleeding time, hypersensitivity reactions, headache, dizziness, drowsiness, hypertension, edema, injection site pain. Increased risk cardiovascular events with prolonged use. Monitor for GI upset and allergic reactions."
          }
        ]
      }
    ]
  },
  {
    id: "MED-OLAN",
    refNo: "Olanzapine",
    title: "Olanzapine (Zyprexa)",
    category: "Pharmacology",
    type: "Formulary",
    lastUpdated: "Jan 1, 2026",
    icon: "psychology",
    color: "green",
    sections: [
      {
        type: "header",
        items: [{ title: "Olanzapine", subtitle: "Atypical Antipsychotic" }]
      },
      {
        type: "accordion",
        title: "Classification & Mechanism",
        items: [
          {
            title: "Class",
            content: "Second-Generation (Atypical) Antipsychotic"
          },
          {
            title: "Mechanism",
            content: "Antagonist at dopamine D2 and serotonin 5-HT2A receptors, with additional effects on other neurotransmitter systems. Reduces agitation and psychotic symptoms with lower risk of extrapyramidal effects compared to typical antipsychotics. Effective for acute agitation in psychiatric emergencies."
          }
        ]
      },
      {
        type: "accordion",
        title: "Indications",
        items: [
          {
            title: "Indications",
            content: "• Acute agitation (psychosis, bipolar disorder)<br>• Severe behavioral emergencies<br>• Combative patient management<br>• Schizophrenia with agitation<br>• Bipolar mania<br>• Alternative to benzodiazepines for agitation"
          }
        ]
      },
      {
        type: "accordion",
        title: "Contraindications",
        items: [
          {
            title: "Contraindications",
            content: "• Known hypersensitivity<br>• Do NOT combine with parenteral benzodiazepines (severe cardiorespiratory depression)<br>• Dementia-related psychosis (increased mortality)<br>• Unstable medical conditions<br>• Use caution in cardiovascular disease, seizure history"
          }
        ]
      },
      {
        type: "accordion",
        title: "Adult Dosing",
        items: [
          {
            title: "Adult Dose",
            content: "<b>IM (acute agitation):</b> 5-10mg IM<br><br><b>Standard dose:</b> 10mg IM for most patients<br><b>Lower dose:</b> 5mg IM for elderly or debilitated patients<br><br><b>Repeat dosing:</b> May give additional 5-10mg after 2-4 hours if needed (Max: 30mg/24 hours)<br><br><b>WARNING:</b> Do NOT give with benzodiazepines - wait at least 1 hour"
          }
        ]
      },
      {
        type: "accordion",
        title: "Pediatric Dosing",
        items: [
          {
            title: "Pediatric Dose",
            content: "<b>Not FDA approved for pediatric IM use</b><br><br>Consult medical control for adolescents with severe agitation<br><br>Alternative options: benzodiazepines preferred in pediatric population"
          }
        ]
      },
      {
        type: "accordion",
        title: "Side Effects",
        items: [
          {
            title: "Adverse Effects",
            content: "Sedation (common), hypotension (postural), dizziness, anticholinergic effects (dry mouth, constipation), extrapyramidal symptoms (rare vs typical antipsychotics), QT prolongation, neuroleptic malignant syndrome (rare), hyperglycemia. CRITICAL: Life-threatening cardiorespiratory depression if combined with benzodiazepines."
          }
        ]
      }
    ]
  }
];
