import React, { useState } from 'react';

type ColorZone = 'Grey' | 'Pink' | 'Red' | 'Purple' | 'Yellow' | 'White' | 'Blue' | 'Orange' | 'Green' | 'Black';

interface WeightStep {
  weight: number;
  label: string;
  age: string;
}

const ZONES: Record<ColorZone, { colorClass: string; textClass: string; weights: WeightStep[] }> = {
  'Grey': { 
    colorClass: 'bg-slate-400', 
    textClass: 'text-white',
    weights: [
      { weight: 3, label: '3 kg', age: '< 3 months' },
      { weight: 4, label: '4 kg', age: '< 3 months' },
      { weight: 5, label: '5 kg', age: '< 3 months' }
    ]
  },
  'Pink': { 
    colorClass: 'bg-pink-400', 
    textClass: 'text-white',
    weights: [
      { weight: 6, label: '6 kg', age: '3-4 months' },
      { weight: 7, label: '7 kg', age: '5-6 months' }
    ]
  },
  'Red': { 
    colorClass: 'bg-red-500', 
    textClass: 'text-white',
    weights: [
      { weight: 8, label: '8 kg', age: '7-8 months' },
      { weight: 9, label: '9 kg', age: '9-10 months' }
    ]
  },
  'Purple': { 
    colorClass: 'bg-purple-500', 
    textClass: 'text-white',
    weights: [
      { weight: 10, label: '10 kg', age: '11-14 months' },
      { weight: 11, label: '11 kg', age: '15-18 months' }
    ]
  },
  'Yellow': { 
    colorClass: 'bg-yellow-400', 
    textClass: 'text-black',
    weights: [
      { weight: 12, label: '12 kg', age: '19-35 months' },
      { weight: 13, label: '13 kg', age: '19-35 months' },
      { weight: 14, label: '14 kg', age: '19-35 months' }
    ]
  },
  'White': { 
    colorClass: 'bg-white border-2 border-slate-200', 
    textClass: 'text-slate-800',
    weights: [
      { weight: 15, label: '15 kg', age: '3-4 years' },
      { weight: 16, label: '16 kg', age: '3-4 years' },
      { weight: 17, label: '17 kg', age: '3-4 years' },
      { weight: 18, label: '18 kg', age: '3-4 years' }
    ]
  },
  'Blue': { 
    colorClass: 'bg-blue-500', 
    textClass: 'text-white',
    weights: [
      { weight: 19, label: '19 kg', age: '5-6 years' },
      { weight: 20, label: '20 kg', age: '5-6 years' },
      { weight: 21, label: '21 kg', age: '5-6 years' },
      { weight: 22, label: '22 kg', age: '5-6 years' },
      { weight: 23, label: '23 kg', age: '5-6 years' }
    ]
  },
  'Orange': { 
    colorClass: 'bg-orange-500', 
    textClass: 'text-white',
    weights: [
      { weight: 24, label: '24 kg', age: '7-9 years' },
      { weight: 26, label: '26 kg', age: '7-9 years' },
      { weight: 28, label: '28 kg', age: '7-9 years' }
    ]
  },
  'Green': { 
    colorClass: 'bg-emerald-600', 
    textClass: 'text-white',
    weights: [
      { weight: 30, label: '30 kg', age: '10-12 years' },
      { weight: 32, label: '32 kg', age: '10-12 years' },
      { weight: 34, label: '34 kg', age: '10-12 years' },
      { weight: 36, label: '36 kg', age: '10-12 years' }
    ]
  },
  'Black': {
    colorClass: 'bg-slate-900',
    textClass: 'text-white',
    weights: [
      { weight: 50, label: 'Adult', age: '> 36 kg / Adult' }
    ]
  }
};

interface Drug {
  name: string;
  conc: string;
  doseCalc: (wt: number) => { dose: string; vol: string };
  note?: string;
}

const DRUGS: Drug[] = [
  { 
    name: 'Adenosine', 
    conc: '3mg/mL', 
    doseCalc: (w) => {
        if (w >= 50) return { dose: '6 or 12mg', vol: '2 or 4mL' };
        // 0.1 mg/kg
        const d = (w * 0.1).toFixed(2).replace(/\.?0+$/, '');
        const v = (w * 0.1 / 3).toFixed(2).replace(/\.?0+$/, '');
        return { dose: `${d}mg`, vol: `${v}mL` };
    }
  },
  { 
    name: 'Albuterol', 
    conc: '2.5mg/3mL', 
    doseCalc: (w) => {
      if (w >= 50) return { dose: '5mg', vol: '6mL' };
      // <4 yrs (approx 15kg) = 2.5mg, >=4 yrs = 5mg
      if (w < 15) return { dose: '2.5mg', vol: '3mL' };
      return { dose: '5mg', vol: '6mL' };
    }
  },
  {
      name: 'Amiodarone',
      conc: '50mg/mL',
      doseCalc: (w) => {
        if (w >= 50) return { dose: '300mg', vol: '6mL' };
        const d = (w * 5).toFixed(0);
        const v = (w * 5 / 50).toFixed(1).replace(/\.?0+$/, '');
        return { dose: `${d}mg`, vol: `${v}mL` };
      }
  },
  {
      name: 'Atropine',
      conc: '0.1mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '1mg', vol: '10mL' };
          let d = w * 0.02;
          if (d < 0.1) d = 0.1; // Min dose 0.1mg
          if (d > 0.5 && w < 40) d = 0.5; // Max child dose 0.5
          const v = (d / 0.1).toFixed(1).replace(/\.?0+$/, '');
          return { dose: `${d.toFixed(2).replace(/\.?0+$/, '')}mg`, vol: `${v}mL` };
      }
  },
  {
      name: 'Calcium Chloride',
      conc: '100mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '1g', vol: '10mL' };
          const d = w * 20;
          const v = (d / 100).toFixed(1).replace(/\.?0+$/, '');
          return { dose: `${d}mg`, vol: `${v}mL` };
      }
  },
  {
      name: 'Dextrose 10%',
      conc: '0.1g/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '125-250mL', vol: '125-250mL' };
          const v = w * 5; // 5mL/kg
          return { dose: `${v}mL`, vol: `${v}mL` };
      }
  },
  {
      name: 'Diphenhydramine',
      conc: '50mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '50mg', vol: '1mL' };
          const d = w * 1; // 1mg/kg
          const v = (d / 50).toFixed(2).replace(/\.?0+$/, '');
          return { dose: `${d}mg`, vol: `${v}mL` };
      }
  },
  {
      name: 'Epi (Cardiac)',
      conc: '0.1mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '1mg', vol: '10mL' };
          const d = (w * 0.01).toFixed(2).replace(/\.?0+$/, '');
          const v = (w * 0.1).toFixed(2).replace(/\.?0+$/, ''); // 0.1mL/kg
          return { dose: `${d}mg`, vol: `${v}mL` };
      },
      note: 'IV/IO 1:10,000'
  },
  {
      name: 'Epi (IM)',
      conc: '1mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '0.5mg', vol: '0.5mL' };
          const d = (w * 0.01).toFixed(2).replace(/\.?0+$/, '');
          const v = (w * 0.01).toFixed(2).replace(/\.?0+$/, '');
          return { dose: `${d}mg`, vol: `${v}mL` };
      },
      note: 'IM Anaphylaxis'
  },
  {
      name: 'Fentanyl',
      conc: '50mcg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '50mcg', vol: '1mL' };
          const d = (w * 1).toFixed(0); // 1mcg/kg
          const v = (w * 1 / 50).toFixed(2).replace(/\.?0+$/, '');
          return { dose: `${d}mcg`, vol: `${v}mL` };
      }
  },
  {
      name: 'Glucagon',
      conc: '1mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '1mg', vol: '1mL' };
          const d = w < 20 ? 0.5 : 1; // Approx <1y cutoff usually 20kg in practice for max dose? No, Ref 1309 says 0.5mg <1yr, 1mg >=1yr. 
          // Using weight proxy: <10kg = 0.5mg, >=10kg = 1mg (rough approx for 1yr)
          // Actually let's use the explicit table values.
          // 3kg: 0.5mg. 10kg: 1mg.
          const dose = w < 10 ? 0.5 : 1;
          return { dose: `${dose}mg`, vol: `${dose}mL` };
      }
  },
  {
      name: 'Midazolam',
      conc: '5mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '5mg', vol: '1mL' };
          // IV/IO: 0.1mg/kg
          // IM/IN: 0.2mg/kg (Seizure)
          // Table usually shows Seizure dose.
          const d = (w * 0.1).toFixed(1).replace(/\.?0+$/, '');
          const v = (w * 0.1 / 5).toFixed(2).replace(/\.?0+$/, '');
          return { dose: `${d}mg`, vol: `${v}mL` };
      },
      note: 'IV/IO Dose'
  },
  {
      name: 'Morphine',
      conc: '4mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '4mg', vol: '1mL' };
          const d = (w * 0.1).toFixed(1).replace(/\.?0+$/, '');
          const v = (w * 0.1 / 4).toFixed(2).replace(/\.?0+$/, '');
          return { dose: `${d}mg`, vol: `${v}mL` };
      }
  },
  {
      name: 'Narcan',
      conc: '1mg/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '0.8-2mg', vol: '0.8-2mL' };
          const d = (w * 0.1).toFixed(1).replace(/\.?0+$/, '');
          const v = (w * 0.1).toFixed(1).replace(/\.?0+$/, '');
          return { dose: `${d}mg`, vol: `${v}mL` };
      }
  },
  {
      name: 'Normal Saline',
      conc: 'N/A',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '1L', vol: '1L' };
          const v = w * 20;
          return { dose: `${v}mL`, vol: `${v}mL` };
      }
  },
  {
      name: 'Sodium Bicarb',
      conc: '1mEq/mL',
      doseCalc: (w) => {
          if (w >= 50) return { dose: '50mEq', vol: '50mL' };
          const d = w; // 1mEq/kg
          return { dose: `${d}mEq`, vol: `${d}mL` };
      }
  }
];

export const ColorCodeReference: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<ColorZone | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

  const handleZoneClick = (zone: ColorZone) => {
    setSelectedZone(zone);
    setSelectedWeight(null); // Reset weight when changing zones
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Zone Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(ZONES) as ColorZone[]).map((zone) => (
          <button
            key={zone}
            onClick={() => handleZoneClick(zone)}
            className={`p-4 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center gap-1 border-2 ${
              selectedZone === zone 
                ? 'border-slate-800 scale-[1.02] ring-2 ring-slate-300 dark:ring-slate-600' 
                : 'border-transparent hover:scale-[1.02]'
            } ${ZONES[zone].colorClass}`}
          >
            <span className={`text-lg font-black uppercase tracking-wider ${ZONES[zone].textClass}`}>
              {zone}
            </span>
            <span className={`text-[10px] font-bold opacity-90 ${ZONES[zone].textClass}`}>
              {ZONES[zone].weights[0].weight} - {ZONES[zone].weights[ZONES[zone].weights.length - 1].weight} kg
            </span>
          </button>
        ))}
      </div>

      {/* Weight Selector */}
      {selectedZone && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">Select Precise Weight</h3>
           <div className="flex flex-wrap gap-2 justify-center">
             {ZONES[selectedZone].weights.map((w) => (
               <button
                  key={w.weight}
                  onClick={() => setSelectedWeight(w.weight)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    selectedWeight === w.weight
                      ? 'bg-slate-800 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                  }`}
               >
                 {w.weight} kg
               </button>
             ))}
           </div>
           {selectedWeight && (
              <div className="mt-3 text-center">
                 <span className="text-xs text-slate-400">Approx. Age: </span>
                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {ZONES[selectedZone].weights.find(w => w.weight === selectedWeight)?.age}
                 </span>
              </div>
           )}
        </div>
      )}

      {/* Drug Table */}
      {selectedWeight && (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft bg-white dark:bg-slate-800">
           <div className={`px-4 py-2 ${ZONES[selectedZone!].colorClass} ${ZONES[selectedZone!].textClass} flex justify-between items-center`}>
              <span className="font-bold text-lg">{selectedWeight} kg</span>
              <span className="text-xs font-semibold opacity-90 uppercase tracking-wider">Ref. 1309</span>
           </div>
           <div className="divide-y divide-slate-100 dark:divide-slate-700">
              <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 py-2 px-4 tracking-wider">
                 <div className="col-span-5">Medication</div>
                 <div className="col-span-3 text-right">Dose</div>
                 <div className="col-span-4 text-right">Volume</div>
              </div>
              {DRUGS.map((drug) => {
                 const { dose, vol } = drug.doseCalc(selectedWeight);
                 return (
                   <div key={drug.name} className="grid grid-cols-12 py-3 px-4 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className="col-span-5 pr-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{drug.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{drug.conc}</p>
                        {drug.note && <p className="text-[9px] text-red-500 mt-0.5">{drug.note}</p>}
                      </div>
                      <div className="col-span-3 text-right">
                         <span className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{dose}</span>
                      </div>
                      <div className="col-span-4 text-right">
                         <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{vol}</span>
                      </div>
                   </div>
                 );
              })}
           </div>
        </div>
      )}
    </div>
  );
};
