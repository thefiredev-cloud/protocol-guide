

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { protocols } from '../data/protocols';
import { ProtocolCategory, Protocol } from '../types';
import { renderIcon } from '../components/Icons';

const Browse: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProtocolCategory | 'All'>('All'); 
  const [recentProtocols, setRecentProtocols] = useState<Protocol[]>([]);

  useEffect(() => {
    try {
        const storedRecents = localStorage.getItem('recent_protocols');
        if (storedRecents) {
            const ids: string[] = JSON.parse(storedRecents);
            const found = ids.map(id => protocols.find(p => p.id === id)).filter(Boolean) as Protocol[];
            setRecentProtocols(found);
        }
    } catch(e) { console.error(e); }
  }, []);

  // Categories based on LA County Manual structure
  const categories: { name: ProtocolCategory; color: string }[] = [
    { name: 'Pharmacology', color: 'teal' }, // Prioritized
    { name: 'General Medical', color: 'blue' },
    { name: 'Cardiovascular', color: 'red' },
    { name: 'Trauma', color: 'orange' },
    { name: 'Respiratory', color: 'cyan' },
    { name: 'Neurology', color: 'indigo' },
    { name: 'Pediatric', color: 'purple' },
    { name: 'Environmental', color: 'green' },
    { name: 'Toxicology', color: 'yellow' },
    { name: 'OB/GYN', color: 'pink' },
    { name: 'ENT', color: 'teal' },
    { name: 'Procedures', color: 'gray' },
    { name: 'Policies', color: 'slate' },
    { name: 'Administrative', color: 'slate' },
    { name: 'Base Hospital', color: 'slate' },
    { name: 'Provider Agencies', color: 'slate' },
    { name: 'Record Keeping', color: 'slate' },
    { name: 'Equipment', color: 'slate' },
    { name: 'Training', color: 'slate' },
    { name: 'Disaster', color: 'red' },
  ];

  const getSortValue = (p: Protocol) => {
      const match = p.refNo.match(/\d+/);
      return match ? parseInt(match[0]) : 999999;
  };

  const filteredProtocols = protocols
    .filter(p => {
      const matchesSearch = search === '' || 
                            p.title.toLowerCase().includes(search.toLowerCase()) || 
                            p.refNo.toLowerCase().includes(search.toLowerCase()) ||
                            p.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Priority 1: Pharmacology top
      const isPharmaA = a.category === 'Pharmacology';
      const isPharmaB = b.category === 'Pharmacology';
      if (isPharmaA && !isPharmaB) return -1;
      if (!isPharmaA && isPharmaB) return 1;
      
      // Priority 2: Alphabetical by Title for Pharma
      if (isPharmaA && isPharmaB) return a.title.localeCompare(b.title);

      // Priority 3: Numerical Ref No for others
      return getSortValue(a) - getSortValue(b);
    });

  const getColorClass = (color: string) => {
      const map: Record<string, string> = {
          blue: 'text-blue-600 dark:text-blue-500',
          red: 'text-red-600 dark:text-red-500',
          orange: 'text-orange-600 dark:text-orange-500',
          cyan: 'text-cyan-600 dark:text-cyan-500',
          indigo: 'text-indigo-600 dark:text-indigo-500',
          purple: 'text-purple-600 dark:text-purple-500',
          green: 'text-emerald-600 dark:text-emerald-500',
          yellow: 'text-yellow-600 dark:text-yellow-500',
          pink: 'text-pink-600 dark:text-pink-500',
          teal: 'text-teal-600 dark:text-teal-500',
          slate: 'text-slate-500 dark:text-slate-400',
          gray: 'text-gray-500 dark:text-gray-400',
      };
      return map[color] || 'text-slate-500 dark:text-slate-400';
  };

  const getIconBgClass = (color: string) => {
    const map: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500',
        red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500',
        cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-500',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-500',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500',
        green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-500',
        pink: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-500',
        teal: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-500',
        slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400',
        gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400',
    };
    return map[color] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-24 font-sans text-slate-900 dark:text-slate-200 transition-colors duration-200">
      <header className="sticky top-12 z-40 bg-white/80 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between px-5 pt-8 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                LA County DHS<br/>Prehospital Care Manual
              </h1>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">ImageTrend Elite™ Integrated</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{protocols.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Protocols</span>
              </div>
              <a
                href="https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
              >
                <span className="material-symbols-outlined text-red-500 dark:text-red-500 text-[24px] group-hover:scale-110 transition-transform">menu_book</span>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-500 tracking-wider">OFFICIAL</span>
              </a>
            </div>
          </div>
          
          <div className="px-5 pb-6">
            <div className="relative group mb-5">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[22px]">search</span>
              </div>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-100 dark:bg-[#1e293b] border border-transparent dark:border-slate-700/50 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-[#1e293b] transition-all shadow-sm focus:outline-none" 
                placeholder="Search protocols (e.g. 1202, Sepsis)" 
                type="text" 
              />
              {search !== '' && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    selectedCategory === 'All' 
                    ? 'bg-slate-800 text-white border-slate-900 dark:bg-slate-700 dark:text-white dark:border-slate-600' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-[#1e293b] dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:border-slate-700'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                      selectedCategory === cat.name 
                      ? 'bg-slate-800 text-white border-slate-900 dark:bg-slate-700 dark:text-white dark:border-slate-600' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-[#1e293b] dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-5xl mx-auto px-5 pt-4">
         
         {/* Recently Viewed - Only show when no search */}
         {recentProtocols.length > 0 && search === '' && selectedCategory === 'All' && (
             <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Recently Viewed
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 no-scrollbar snap-x">
                   {recentProtocols.map(p => (
                      <button 
                        key={`recent-${p.id}`}
                        onClick={() => navigate(`/protocol/${p.id}`)}
                        className="snap-start min-w-[160px] max-w-[160px] flex flex-col items-start p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 dark:hover:border-primary/30 transition-all text-left"
                      >
                         <div className={`w-8 h-8 rounded-lg ${getIconBgClass(p.color)} flex items-center justify-center mb-2`}>
                            {renderIcon(p.icon, "w-4 h-4")}
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono mb-0.5">{p.refNo.replace(/^(Ref\.|TP-|Ref|TP)\s*/, '')}</span>
                         <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight line-clamp-2">{p.title}</span>
                      </button>
                   ))}
                </div>
             </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
           {filteredProtocols.map(protocol => {
             // Extract plain ID number for display by removing 'Ref.', 'TP-', and spaces
             let displayId = protocol.refNo.replace(/^(Ref\.|TP-|Ref|TP)\s*/, '');
             
             // Special display for Pharmacology to avoid long names in the ID box
             if (protocol.category === 'Pharmacology') {
                displayId = 'Rx';
             }
             
             return (
               <button 
                key={protocol.id}
                onClick={() => navigate(`/protocol/${protocol.id}`)}
                className="group flex items-center w-full p-4 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md dark:hover:bg-[#253248] transition-all text-left relative overflow-hidden shadow-sm"
               >
                 {/* Icon Box */}
                 <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${getIconBgClass(protocol.color)} shrink-0`}>
                    {renderIcon(protocol.icon, "w-6 h-6")}
                 </div>
                 
                 <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-mono">
                            {displayId}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${getColorClass(protocol.color)} truncate`}>
                          {protocol.category}
                      </span>
                    </div>
                    <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary dark:group-hover:text-teal-400 transition-colors pr-2 truncate">
                        {protocol.title}
                    </h4>
                 </div>
                 
                 <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors text-[20px]">chevron_right</span>
                 </div>
               </button>
             );
           })}

           {filteredProtocols.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-white/50 dark:bg-[#1e293b]/50 border border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-600">search_off</span>
               </div>
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No results found</h3>
               <p className="text-sm text-slate-500 max-w-xs mx-auto">Try adjusting your search or category filter.</p>
               <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="mt-4 text-sm font-bold text-primary dark:text-teal-500 hover:opacity-80 transition-opacity">Clear Filters</button>
             </div>
           )}
         </div>
      </div>
    </main>
  );
};

export default Browse;
