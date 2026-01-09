
import React, { useState } from 'react';

// Adult Rule of Nines
const SECTIONS_ADULT = [
  { id: 'head', name: 'Head', value: 9 },
  { id: 'chest', name: 'Ant. Torso', value: 18 },
  { id: 'back', name: 'Post. Torso', value: 18 },
  { id: 'l_arm', name: 'L Arm', value: 9 },
  { id: 'r_arm', name: 'R Arm', value: 9 },
  { id: 'l_leg', name: 'L Leg', value: 18 },
  { id: 'r_leg', name: 'R Leg', value: 18 },
  { id: 'groin', name: 'Groin', value: 1 },
];

// Pediatric Rule of Nines (Approximate)
const SECTIONS_PEDS = [
  { id: 'head', name: 'Head', value: 18 },
  { id: 'chest', name: 'Ant. Torso', value: 18 },
  { id: 'back', name: 'Post. Torso', value: 18 },
  { id: 'l_arm', name: 'L Arm', value: 9 },
  { id: 'r_arm', name: 'R Arm', value: 9 },
  { id: 'l_leg', name: 'L Leg', value: 14 },
  { id: 'r_leg', name: 'R Leg', value: 14 },
];

type PatientType = 'Adult' | 'Pediatric';

export const BurnCalculator: React.FC = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [patientType, setPatientType] = useState<PatientType>('Adult');

  const sections = patientType === 'Adult' ? SECTIONS_ADULT : SECTIONS_PEDS;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const totalTBSA: number = Array.from(selected).reduce<number>((sum, id) => {
    return sum + (sections.find(s => s.id === id)?.value || 0);
  }, 0);

  // Adult: > 20% Critical. Peds: > 10% Critical.
  const isCritical = patientType === 'Adult' ? totalTBSA > 20 : totalTBSA > 10;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-5 mb-8">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">calculate</span>
            Burn TBSA
         </h3>
         <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1">
            <button 
                onClick={() => setPatientType('Adult')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${patientType === 'Adult' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                Adult
            </button>
            <button 
                onClick={() => setPatientType('Pediatric')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${patientType === 'Pediatric' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                Peds
            </button>
         </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 transition-all ${isCritical ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
            <div className="text-center">
                <span className="block text-2xl font-black leading-none">{totalTBSA}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-60">TBSA</span>
            </div>
            {isCritical && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    <span className="material-symbols-outlined text-white text-[14px]">priority_high</span>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {sections.map(part => (
            <button
                key={part.id}
                onClick={() => toggle(part.id)}
                className={`p-3 rounded-xl text-xs font-semibold transition-all border flex justify-between items-center ${
                    selected.has(part.id)
                    ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500/50'
                }`}
            >
                <span>{part.name}</span>
                <span className={selected.has(part.id) ? 'opacity-100' : 'opacity-60'}>{part.value}%</span>
            </button>
        ))}
      </div>

      <div className={`rounded-xl p-4 transition-colors ${isCritical ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700'}`}>
         <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3 text-slate-500 dark:text-slate-400">
             {patientType} Recommendation
         </h4>
         {isCritical ? (
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">water_drop</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Fluid Resuscitation Indicated</p>
                    {patientType === 'Adult' ? (
                        <>
                            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">500mL/hr Normal Saline IV/IO</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Adult TBSA &gt; 20%</p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">20mL/kg Normal Saline Bolus</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Pediatric TBSA &gt; 10%</p>
                        </>
                    )}
                </div>
             </div>
         ) : (
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-lg">check</span>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Fluid resuscitation not indicated by Standing Order.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Treat pain. Keep warm. Monitor vitals.</p>
                </div>
             </div>
         )}
      </div>
    </div>
  );
};
