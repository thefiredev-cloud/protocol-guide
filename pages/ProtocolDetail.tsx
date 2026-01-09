
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getProtocolById } from '../data/protocols';
import { ProtocolSection } from '../types';
import { renderIcon } from '../components/Icons';
import { BurnCalculator } from '../components/BurnCalculator';
import { ColorCodeReference } from '../components/ColorCodeReference';
import { StepByStepSection } from '../components/StepByStepSection';
import { FacilityFinder } from '../components/FacilityFinder';
import { ProtocolImage } from '../components/ProtocolImage';

// Sanitize HTML content to prevent XSS attacks
const sanitizeHTML = (html: string | undefined): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
};

// Safe HTML rendering component
const SafeHTML: React.FC<{ html: string | undefined; className?: string }> = ({ html, className }) => {
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }} />;
};

const ProtocolDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const protocol = id ? getProtocolById(id) : undefined;

  useEffect(() => {
    if (protocol) {
      try {
        const storedRecents = localStorage.getItem('recent_protocols');
        let recentIds: string[] = storedRecents ? JSON.parse(storedRecents) : [];
        recentIds = recentIds.filter(pid => pid !== protocol.id);
        recentIds.unshift(protocol.id);
        if (recentIds.length > 5) recentIds = recentIds.slice(0, 5);
        localStorage.setItem('recent_protocols', JSON.stringify(recentIds));
      } catch (e) {
        console.error("Failed to update recent protocols", e);
      }
    }
  }, [protocol]);

  if (!protocol) {
    return (
      <div className="pt-20 px-5 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Protocol Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary">Go Home</button>
      </div>
    );
  }

  const getColorClass = (color: string, type: 'bg' | 'text' | 'border' | 'light-bg' | 'gradient' | 'badge-bg' | 'icon-bg') => {
    switch (type) {
      case 'bg': return `bg-${color}-500`;
      case 'text': return `text-${color}-700 dark:text-${color}-400`;
      case 'border': return `border-${color}-200 dark:border-${color}-800`;
      case 'light-bg': return `bg-${color}-50 dark:bg-${color}-900/20`;
      case 'icon-bg': return `bg-${color}-50 dark:bg-${color}-900/30`;
      case 'badge-bg': return `bg-${color}-100 dark:bg-${color}-900/40`;
      case 'gradient': return `from-${color}-50 to-white dark:from-${color}-900/10 dark:to-slate-800`;
      default: return '';
    }
  };

  const dhsUrl = `https://dhs.lacounty.gov/?s=${encodeURIComponent(protocol.refNo)}`;

  const renderSection = (section: ProtocolSection, index: number) => {
    switch (section.type) {
      case 'header':
        const headerItem = section.items?.[0];
        if (!headerItem) return null;
        return (
          <div key={index} className="relative w-full mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] overflow-hidden relative border border-slate-100 dark:border-slate-700/50">

              {/* Decorative Top Right Corner */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${getColorClass(protocol.color, 'light-bg')} opacity-60 pointer-events-none`}></div>

              <div className="p-8 pb-10 flex flex-col items-center text-center relative z-10">
                {/* Icon Container */}
                <div className="relative mb-5">
                   <div className={`w-20 h-20 rounded-full ${getColorClass(protocol.color, 'icon-bg')} flex items-center justify-center relative shadow-sm`}>
                      {renderIcon(headerItem.icon || protocol.icon, `w-9 h-9 ${getColorClass(protocol.color, 'text')}`)}

                      {/* Info Badge */}
                      <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-blue-600 rounded-full p-[3px] border-[3px] border-white dark:border-slate-800 shadow-sm">
                         <span className="material-symbols-outlined text-white text-[12px] font-bold block">info</span>
                      </div>
                   </div>
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{headerItem.title}</h1>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-wide text-[11px]">{headerItem.subtitle}</p>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 justify-center">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getColorClass(protocol.color, 'badge-bg')} ${getColorClass(protocol.color, 'text')}`}>
                      {protocol.category}
                   </span>
                   {protocol.type && (
                     <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {protocol.type}
                     </span>
                   )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'calculator': return <BurnCalculator key={index} />;
      case 'pediatric-dosing': return <ColorCodeReference key={index} />;

      case 'list':
        // Custom styling for Provider Impressions to match screenshot
        const isImpressions = section.title?.toLowerCase().includes('impression');
        return (
          <div key={index} className="mb-6">
            {section.title && (
              <h3 className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1 ${isImpressions ? '' : 'ml-1'}`}>
                {section.title}
              </h3>
            )}
            <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 overflow-hidden`}>
              {section.items?.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 items-center">
                   {item.icon && (
                     <div className="flex-shrink-0">
                       {renderIcon(item.icon, "w-5 h-5 text-slate-400 dark:text-slate-500")}
                     </div>
                   )}
                   <div className="flex-1">
                      <p className={`text-sm font-bold text-slate-900 dark:text-white ${isImpressions ? 'text-[15px]' : ''}`}>{item.title}</p>
                      <SafeHTML html={item.content} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed" />
                   </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'meta':
        return (
          <div key={index} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4 mb-8">
             {Object.entries(section.data || {}).map(([key, value]) => (
                <div key={key} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{key}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
             ))}
          </div>
        );

      case 'warning':
        return (
          <div key={index} className="mb-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500 text-2xl shrink-0 mt-0.5">warning</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-yellow-600 dark:text-yellow-500 font-bold mb-1">Critical Consideration</p>
                <SafeHTML html={section.content} className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed" />
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
           <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 mb-6 overflow-hidden">
            <div className={`p-5 ${section.className || ''}`}>
              {section.title && <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">{section.title}</h3>}
              <SafeHTML html={section.content} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed" />
            </div>
          </div>
        );

      case 'info':
        return (
           <div key={index} className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 mb-6">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 shrink-0">info</span>
              <div>
                {section.title && <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">{section.title}</h3>}
                <SafeHTML html={section.content} className="text-sm text-blue-900 dark:text-blue-200 leading-normal" />
              </div>
            </div>
          </div>
        );

      case 'accordion':
        return (
          <div key={index} className="mb-8">
            {section.title && <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1">{section.title}</h3>}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700/50">
              {section.items?.map((item, i) => (
                <details key={i} className="group" open={i === 0}>
                  <summary className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-4 cursor-pointer select-none`}>
                    <div className={`w-8 h-8 rounded-full ${getColorClass(item.color || 'gray', 'light-bg')} flex items-center justify-center ${getColorClass(item.color || 'gray', 'text')}`}>
                      {item.icon ? renderIcon(item.icon, "w-4 h-4") : <span className="material-symbols-outlined text-[16px]">circle</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.subtitle}</p>}
                    </div>
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="px-4 pb-5 pt-1 pl-[4.5rem] text-sm text-slate-600 dark:text-slate-300">
                     <SafeHTML html={item.content} className="prose prose-sm dark:prose-invert max-w-none leading-relaxed" />
                  </div>
                </details>
              ))}
            </div>
          </div>
        );

      case 'definitions':
        return (
           <div key={index} className="mb-6">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1 flex items-center gap-2">
               {section.title}
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700/50">
               {section.items?.map((item, i) => (
                <details key={i} className="group">
                  <summary className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${getColorClass(item.color || 'gray', 'light-bg')} flex items-center justify-center ${getColorClass(item.color || 'gray', 'text')} text-[10px] font-bold`}>
                        {item.title?.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="px-4 pb-4 pt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">
                     {item.subtitle && <p className="mb-2 font-semibold text-slate-800 dark:text-slate-200">{item.subtitle}</p>}
                     <SafeHTML html={item.content} />
                  </div>
                </details>
               ))}
            </div>
           </div>
        );

      case 'link-list':
        return (
          <div key={index} className="mt-6 mb-8">
             <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 text-center">{section.title}</h3>
             <div className="flex flex-wrap gap-2 justify-center">
               {section.items?.map((item, i) => (
                 <a
                    key={i}
                    href={dhsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-1.5 hover:border-primary/50 transition-colors"
                 >
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    {item.title}
                 </a>
               ))}
             </div>
          </div>
        );

      case 'step-by-step':
        return (
          <StepByStepSection
            key={index}
            title={section.title}
            steps={section.steps || []}
            color={protocol.color}
          />
        );

      case 'facility-finder':
        return (
          <FacilityFinder
            key={index}
            facilityTypes={section.facilityTypes || ['trauma']}
            title={section.title}
            showMapLink={true}
          />
        );

      default: return null;
    }
  };

  return (
    <div className="pb-32 px-5 max-w-xl mx-auto w-full">
      {/* Navbar */}
      <div className="sticky top-12 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md -mx-5 px-5 mb-4 border-b border-transparent dark:border-slate-800/50">
        <header className="flex justify-between items-center h-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 group p-2 -ml-2 rounded-xl active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">arrow_back</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">{protocol.refNo}</span>
          </button>

          <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-red-500">
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
          </button>
        </header>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {protocol.sections.map((section, index) => renderSection(section, index))}

        <div className="mt-8">
          <a
              href={dhsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm py-4 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm group"
          >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[20px]">open_in_new</span>
              View Official Document on DHS
          </a>

          {(protocol.category === 'Cardiac' || protocol.category === 'Trauma') && (
              <button className="mt-4 text-white font-bold text-sm py-4 px-6 rounded-xl hover:bg-red-700 transition-colors w-full bg-primary shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">timer</span>
                Start Resuscitation Timer
              </button>
          )}

          <div className="mt-8 text-center">
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
              Reference: LA County Prehospital Care Manual
            </p>
            <p className="text-[11px] text-slate-400/80 mt-1">
              Always defer to base hospital for deviation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolDetail;
