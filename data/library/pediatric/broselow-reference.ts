/**
 * Broselow Color-Coded Pediatric Dosing Reference
 * Complete pediatric emergency dosing tables organized by color zone
 * Based on length-based resuscitation tape system
 */

export type BroselowColorZone = 'Grey' | 'Pink' | 'Red' | 'Purple' | 'Yellow' | 'White' | 'Blue' | 'Orange' | 'Green';

export interface VitalSigns {
  heartRate: string;
  respiratoryRate: string;
  systolicBP: string;
}

export interface Defibrillation {
  initial: string;      // 2 J/kg
  subsequent: string;   // 4 J/kg
}

export interface Cardioversion {
  synchronized: string; // 0.5-1 J/kg
  subsequent: string;   // 2 J/kg
}

export interface Medication {
  name: string;
  dose: string;
  concentration: string;
  volume: string;
  route?: string;
  notes?: string;
}

export interface Equipment {
  // Airway - Supraglottic
  iGel: string;
  lmaClassic?: string;

  // Airway - ETT
  ettCuffed: string;
  ettUncuffed: string;

  // Laryngoscope Blades
  millerBlade: string;
  macBlade?: string;  // Not available for smallest sizes

  // IV Access
  ivCatheter: string;

  // Suction
  suctionCatheter: string;

  // Chest/Tubes
  chestTube: string;
  ngOgTube: string;
  foleyCatheter: string;

  // Monitoring
  bpCuff: string;
}

export interface BroselowZoneData {
  color: BroselowColorZone;
  weightRange: string;
  weightKg: number;  // Representative weight for calculations
  ageRange: string;
  vitalSigns: VitalSigns;
  defibrillation: Defibrillation;
  cardioversion: Cardioversion;
  medications: Medication[];
  equipment: Equipment;
  colorClass: string;  // Tailwind color class
  textClass: string;   // Tailwind text color class
}

export const BROSELOW_DATA: Record<BroselowColorZone, BroselowZoneData> = {
  'Grey': {
    color: 'Grey',
    weightRange: '3-5 kg',
    weightKg: 4,
    ageRange: '< 3 months',
    vitalSigns: {
      heartRate: '120-160',
      respiratoryRate: '30-50',
      systolicBP: '60-90'
    },
    defibrillation: {
      initial: '8 J',      // 2 J/kg × 4 kg
      subsequent: '16 J'   // 4 J/kg × 4 kg
    },
    cardioversion: {
      synchronized: '2-4 J',   // 0.5-1 J/kg × 4 kg
      subsequent: '8 J'        // 2 J/kg × 4 kg
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.04 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '0.4 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.04 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.04 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '20 mg',
        concentration: '50 mg/mL',
        volume: '0.4 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '0.4 mg',
        concentration: '3 mg/mL',
        volume: '0.13 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.1 mg',
        concentration: '0.1 mg/mL',
        volume: '1 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, minimum 0.1 mg'
      },
      {
        name: 'Midazolam IV',
        dose: '0.4 mg',
        concentration: '5 mg/mL',
        volume: '0.08 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '0.8 mg',
        concentration: '5 mg/mL',
        volume: '0.16 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '80 mL',
        concentration: 'N/A',
        volume: '80 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 1',
      lmaClassic: 'Size 1',
      ettCuffed: '3.0 mm',
      ettUncuffed: '3.0 mm',
      millerBlade: '0-1',
      ivCatheter: '24G',
      suctionCatheter: '6-8 Fr',
      chestTube: '10-12 Fr',
      ngOgTube: '6-8 Fr',
      foleyCatheter: '6 Fr',
      bpCuff: 'Newborn'
    },
    colorClass: 'bg-slate-400',
    textClass: 'text-white'
  },

  'Pink': {
    color: 'Pink',
    weightRange: '6-7 kg',
    weightKg: 6.5,
    ageRange: '3-6 months',
    vitalSigns: {
      heartRate: '120-160',
      respiratoryRate: '30-50',
      systolicBP: '70-100'
    },
    defibrillation: {
      initial: '13 J',
      subsequent: '26 J'
    },
    cardioversion: {
      synchronized: '3-7 J',
      subsequent: '13 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.065 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '0.65 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.065 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.065 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '33 mg',
        concentration: '50 mg/mL',
        volume: '0.66 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '0.65 mg',
        concentration: '3 mg/mL',
        volume: '0.22 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.13 mg',
        concentration: '0.1 mg/mL',
        volume: '1.3 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, minimum 0.1 mg'
      },
      {
        name: 'Midazolam IV',
        dose: '0.65 mg',
        concentration: '5 mg/mL',
        volume: '0.13 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '1.3 mg',
        concentration: '5 mg/mL',
        volume: '0.26 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '130 mL',
        concentration: 'N/A',
        volume: '130 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 1.5',
      lmaClassic: 'Size 1.5',
      ettCuffed: '3.5 mm',
      ettUncuffed: '3.5 mm',
      millerBlade: '1',
      ivCatheter: '24G',
      suctionCatheter: '8 Fr',
      chestTube: '12 Fr',
      ngOgTube: '8 Fr',
      foleyCatheter: '8 Fr',
      bpCuff: 'Infant'
    },
    colorClass: 'bg-pink-400',
    textClass: 'text-white'
  },

  'Red': {
    color: 'Red',
    weightRange: '8-9 kg',
    weightKg: 8.5,
    ageRange: '7-10 months',
    vitalSigns: {
      heartRate: '110-160',
      respiratoryRate: '24-40',
      systolicBP: '70-100'
    },
    defibrillation: {
      initial: '17 J',
      subsequent: '34 J'
    },
    cardioversion: {
      synchronized: '4-9 J',
      subsequent: '17 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.085 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '0.85 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.085 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.085 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '43 mg',
        concentration: '50 mg/mL',
        volume: '0.86 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '0.85 mg',
        concentration: '3 mg/mL',
        volume: '0.28 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.17 mg',
        concentration: '0.1 mg/mL',
        volume: '1.7 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, minimum 0.1 mg'
      },
      {
        name: 'Midazolam IV',
        dose: '0.85 mg',
        concentration: '5 mg/mL',
        volume: '0.17 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '1.7 mg',
        concentration: '5 mg/mL',
        volume: '0.34 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '170 mL',
        concentration: 'N/A',
        volume: '170 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 1.5',
      lmaClassic: 'Size 1.5',
      ettCuffed: '3.5 mm',
      ettUncuffed: '3.5-4.0 mm',
      millerBlade: '1',
      macBlade: '1',
      ivCatheter: '22-24G',
      suctionCatheter: '8 Fr',
      chestTube: '14 Fr',
      ngOgTube: '8 Fr',
      foleyCatheter: '8 Fr',
      bpCuff: 'Infant'
    },
    colorClass: 'bg-red-500',
    textClass: 'text-white'
  },

  'Purple': {
    color: 'Purple',
    weightRange: '10-11 kg',
    weightKg: 10.5,
    ageRange: '11-18 months',
    vitalSigns: {
      heartRate: '100-150',
      respiratoryRate: '24-40',
      systolicBP: '75-105'
    },
    defibrillation: {
      initial: '21 J',
      subsequent: '42 J'
    },
    cardioversion: {
      synchronized: '5-11 J',
      subsequent: '21 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.105 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '1.05 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.105 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.105 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '53 mg',
        concentration: '50 mg/mL',
        volume: '1.06 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '1.05 mg',
        concentration: '3 mg/mL',
        volume: '0.35 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.21 mg',
        concentration: '0.1 mg/mL',
        volume: '2.1 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, minimum 0.1 mg'
      },
      {
        name: 'Midazolam IV',
        dose: '1.05 mg',
        concentration: '5 mg/mL',
        volume: '0.21 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '2.1 mg',
        concentration: '5 mg/mL',
        volume: '0.42 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '210 mL',
        concentration: 'N/A',
        volume: '210 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 2',
      lmaClassic: 'Size 2',
      ettCuffed: '4.0 mm',
      ettUncuffed: '4.0 mm',
      millerBlade: '1-2',
      macBlade: '1',
      ivCatheter: '22G',
      suctionCatheter: '10 Fr',
      chestTube: '14-16 Fr',
      ngOgTube: '10 Fr',
      foleyCatheter: '8-10 Fr',
      bpCuff: 'Child Small'
    },
    colorClass: 'bg-purple-500',
    textClass: 'text-white'
  },

  'Yellow': {
    color: 'Yellow',
    weightRange: '12-14 kg',
    weightKg: 13,
    ageRange: '19-35 months',
    vitalSigns: {
      heartRate: '90-140',
      respiratoryRate: '22-34',
      systolicBP: '80-110'
    },
    defibrillation: {
      initial: '26 J',
      subsequent: '52 J'
    },
    cardioversion: {
      synchronized: '7-14 J',
      subsequent: '26 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.13 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '1.3 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.13 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.13 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '65 mg',
        concentration: '50 mg/mL',
        volume: '1.3 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '1.3 mg',
        concentration: '3 mg/mL',
        volume: '0.43 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.26 mg',
        concentration: '0.1 mg/mL',
        volume: '2.6 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, minimum 0.1 mg'
      },
      {
        name: 'Midazolam IV',
        dose: '1.3 mg',
        concentration: '5 mg/mL',
        volume: '0.26 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '2.6 mg',
        concentration: '5 mg/mL',
        volume: '0.52 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '260 mL',
        concentration: 'N/A',
        volume: '260 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 2',
      lmaClassic: 'Size 2',
      ettCuffed: '4.5 mm',
      ettUncuffed: '4.5 mm',
      millerBlade: '2',
      macBlade: '2',
      ivCatheter: '22G',
      suctionCatheter: '10 Fr',
      chestTube: '16-20 Fr',
      ngOgTube: '10 Fr',
      foleyCatheter: '10 Fr',
      bpCuff: 'Child Small'
    },
    colorClass: 'bg-yellow-400',
    textClass: 'text-black'
  },

  'White': {
    color: 'White',
    weightRange: '15-18 kg',
    weightKg: 16.5,
    ageRange: '3-4 years',
    vitalSigns: {
      heartRate: '80-130',
      respiratoryRate: '20-30',
      systolicBP: '85-115'
    },
    defibrillation: {
      initial: '33 J',
      subsequent: '66 J'
    },
    cardioversion: {
      synchronized: '8-17 J',
      subsequent: '33 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.165 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '1.65 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.165 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.165 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '83 mg',
        concentration: '50 mg/mL',
        volume: '1.66 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '1.65 mg',
        concentration: '3 mg/mL',
        volume: '0.55 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.33 mg',
        concentration: '0.1 mg/mL',
        volume: '3.3 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, minimum 0.1 mg'
      },
      {
        name: 'Midazolam IV',
        dose: '1.65 mg',
        concentration: '5 mg/mL',
        volume: '0.33 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '3.3 mg',
        concentration: '5 mg/mL',
        volume: '0.66 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '330 mL',
        concentration: 'N/A',
        volume: '330 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 2.5',
      lmaClassic: 'Size 2.5',
      ettCuffed: '5.0 mm',
      ettUncuffed: '5.0 mm',
      millerBlade: '2',
      macBlade: '2',
      ivCatheter: '20-22G',
      suctionCatheter: '10 Fr',
      chestTube: '20-24 Fr',
      ngOgTube: '10-12 Fr',
      foleyCatheter: '10 Fr',
      bpCuff: 'Child'
    },
    colorClass: 'bg-white border-2 border-slate-200',
    textClass: 'text-slate-800'
  },

  'Blue': {
    color: 'Blue',
    weightRange: '19-23 kg',
    weightKg: 21,
    ageRange: '5-6 years',
    vitalSigns: {
      heartRate: '70-120',
      respiratoryRate: '18-26',
      systolicBP: '90-120'
    },
    defibrillation: {
      initial: '42 J',
      subsequent: '84 J'
    },
    cardioversion: {
      synchronized: '11-23 J',
      subsequent: '42 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.21 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '2.1 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.21 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.21 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '105 mg',
        concentration: '50 mg/mL',
        volume: '2.1 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '2.1 mg',
        concentration: '3 mg/mL',
        volume: '0.7 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.42 mg',
        concentration: '0.1 mg/mL',
        volume: '4.2 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, minimum 0.1 mg'
      },
      {
        name: 'Midazolam IV',
        dose: '2.1 mg',
        concentration: '5 mg/mL',
        volume: '0.42 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '4.2 mg',
        concentration: '5 mg/mL',
        volume: '0.84 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '420 mL',
        concentration: 'N/A',
        volume: '420 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 3',
      lmaClassic: 'Size 2.5-3',
      ettCuffed: '5.5 mm',
      ettUncuffed: '5.5 mm',
      millerBlade: '2',
      macBlade: '2-3',
      ivCatheter: '20G',
      suctionCatheter: '12 Fr',
      chestTube: '24-28 Fr',
      ngOgTube: '12 Fr',
      foleyCatheter: '10-12 Fr',
      bpCuff: 'Child'
    },
    colorClass: 'bg-blue-500',
    textClass: 'text-white'
  },

  'Orange': {
    color: 'Orange',
    weightRange: '24-29 kg',
    weightKg: 26.5,
    ageRange: '7-9 years',
    vitalSigns: {
      heartRate: '65-115',
      respiratoryRate: '16-24',
      systolicBP: '95-125'
    },
    defibrillation: {
      initial: '53 J',
      subsequent: '106 J'
    },
    cardioversion: {
      synchronized: '13-27 J',
      subsequent: '53 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.265 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '2.65 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.265 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.265 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '133 mg',
        concentration: '50 mg/mL',
        volume: '2.66 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '2.65 mg',
        concentration: '3 mg/mL',
        volume: '0.88 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.5 mg',
        concentration: '0.1 mg/mL',
        volume: '5 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, max 0.5 mg child'
      },
      {
        name: 'Midazolam IV',
        dose: '2.65 mg',
        concentration: '5 mg/mL',
        volume: '0.53 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '5.3 mg',
        concentration: '5 mg/mL',
        volume: '1.06 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '530 mL',
        concentration: 'N/A',
        volume: '530 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 3',
      lmaClassic: 'Size 3',
      ettCuffed: '6.0 mm',
      ettUncuffed: '6.0 mm',
      millerBlade: '2-3',
      macBlade: '3',
      ivCatheter: '18-20G',
      suctionCatheter: '14 Fr',
      chestTube: '28-32 Fr',
      ngOgTube: '12 Fr',
      foleyCatheter: '10-12 Fr',
      bpCuff: 'Child Large'
    },
    colorClass: 'bg-orange-500',
    textClass: 'text-white'
  },

  'Green': {
    color: 'Green',
    weightRange: '30-36 kg',
    weightKg: 33,
    ageRange: '10-12 years',
    vitalSigns: {
      heartRate: '60-110',
      respiratoryRate: '14-22',
      systolicBP: '100-130'
    },
    defibrillation: {
      initial: '66 J',
      subsequent: '132 J'
    },
    cardioversion: {
      synchronized: '17-36 J',
      subsequent: '66 J'
    },
    medications: [
      {
        name: 'Epinephrine IV/IO',
        dose: '0.33 mg',
        concentration: '0.1 mg/mL (1:10,000)',
        volume: '3.3 mL',
        route: 'IV/IO',
        notes: '0.01 mg/kg'
      },
      {
        name: 'Epinephrine IM',
        dose: '0.33 mg',
        concentration: '1 mg/mL (1:1,000)',
        volume: '0.33 mL',
        route: 'IM',
        notes: '0.01 mg/kg for anaphylaxis'
      },
      {
        name: 'Amiodarone',
        dose: '165 mg',
        concentration: '50 mg/mL',
        volume: '3.3 mL',
        route: 'IV/IO',
        notes: '5 mg/kg'
      },
      {
        name: 'Adenosine',
        dose: '3.3 mg',
        concentration: '3 mg/mL',
        volume: '1.1 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg, max 6 mg first dose'
      },
      {
        name: 'Atropine',
        dose: '0.5 mg',
        concentration: '0.1 mg/mL',
        volume: '5 mL',
        route: 'IV/IO',
        notes: '0.02 mg/kg, max 0.5 mg child'
      },
      {
        name: 'Midazolam IV',
        dose: '3.3 mg',
        concentration: '5 mg/mL',
        volume: '0.66 mL',
        route: 'IV/IO',
        notes: '0.1 mg/kg'
      },
      {
        name: 'Midazolam IN',
        dose: '6.6 mg',
        concentration: '5 mg/mL',
        volume: '1.32 mL',
        route: 'Intranasal',
        notes: '0.2 mg/kg for seizures'
      },
      {
        name: 'Normal Saline Bolus',
        dose: '660 mL',
        concentration: 'N/A',
        volume: '660 mL',
        route: 'IV/IO',
        notes: '20 mL/kg'
      }
    ],
    equipment: {
      iGel: 'Size 4',
      lmaClassic: 'Size 3-4',
      ettCuffed: '6.5 mm',
      ettUncuffed: '6.5 mm',
      millerBlade: '3',
      macBlade: '3',
      ivCatheter: '18G',
      suctionCatheter: '14 Fr',
      chestTube: '32-36 Fr',
      ngOgTube: '12 Fr',
      foleyCatheter: '12 Fr',
      bpCuff: 'Adult Small'
    },
    colorClass: 'bg-emerald-600',
    textClass: 'text-white'
  }
};

/**
 * Get dosing data for a specific color zone
 */
export const getBroselowZoneData = (color: BroselowColorZone): BroselowZoneData => {
  return BROSELOW_DATA[color];
};

/**
 * Get all color zones in order
 */
export const getAllBroselowZones = (): BroselowColorZone[] => {
  return ['Grey', 'Pink', 'Red', 'Purple', 'Yellow', 'White', 'Blue', 'Orange', 'Green'];
};

/**
 * Get medication dose for specific weight and medication name
 */
export const getMedicationDose = (color: BroselowColorZone, medicationName: string): Medication | undefined => {
  const zoneData = BROSELOW_DATA[color];
  return zoneData.medications.find(med => med.name === medicationName);
};

/**
 * Get all medications for a specific color zone
 */
export const getAllMedications = (color: BroselowColorZone): Medication[] => {
  return BROSELOW_DATA[color].medications;
};
