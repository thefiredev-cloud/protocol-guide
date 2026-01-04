
import React from 'react';

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

// --- Specialized EMS/Medical Icons ---

export const IconStarOfLife: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
    <path d="M10 12h4" />
    <path d="M12 10v4" /> 
  </svg>
);

export const IconHeart: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const IconHeartMonitor: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
    <path d="M4 11h3l2 5 2-8 2 5 2-2h3" />
  </svg>
);

export const IconLungs: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v10M8 5a4 4 0 0 0-4 4v2.5c0 3.5 3 6.5 6 6.5h2" />
    <path d="M16 5a4 4 0 0 1 4 4v2.5c0 3.5-3 6.5-6 6.5h-2" />
    <path d="M12 12h-2M12 12h2" />
  </svg>
);

export const IconBrain: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.5 20.5a5.5 5.5 0 0 1-5.5-5.5c0-3 2.5-5.5 5.5-5.5h.5" />
    <path d="M14 15h.5a5.5 5.5 0 0 0 5.5-5.5c0-3-2.5-5.5-5.5-5.5" />
    <path d="M12 21a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4a2 2 0 0 1-2 2z" />
    <path d="M9.5 9.5A5.5 5.5 0 0 1 12 4a5.5 5.5 0 0 1 2.5.6" />
  </svg>
);

export const IconTrauma: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
     <path d="M12 12h.01" />
     <path d="M19.07 4.93 4.93 19.07M16 5h3a2 2 0 0 1 2 2v3" />
     <path d="M5 19H2a2 2 0 0 1-2-2v-3" />
     <path d="M10 21c-2.5-1-4-4-4-7 0-3.5 3-6 6-6s6 2.5 6 6c0 3-1.5 6-4 7" />
  </svg>
);

export const IconChild: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="5" />
    <path d="M12 13v8M9 21v-3h6v3M8 17l-3 2M16 17l3 2" />
  </svg>
);

export const IconVial: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 4h10v2H7z" />
    <path d="M9 6v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6" />
    <path d="M15 11h-6" />
    <path d="M15 15h-6" />
  </svg>
);

export const IconPill: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);

export const IconIVBag: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 6h10v11a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6z" />
    <path d="M12 2v4" />
    <path d="M9 14h6" />
    <path d="M12 21v3" />
  </svg>
);

export const IconFlask: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2v7.31l-4.29 9.35a1 1 0 0 0 .9 1.34h10.78a1 1 0 0 0 .9-1.34L14 9.31V2" />
    <path d="M8.5 2h7" />
    <path d="M10 12h4" />
  </svg>
);

export const IconPolicy: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

export const IconProcedure: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

export const IconAdmin: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

// --- Hazard / Environmental Icons ---

export const IconFlame: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const IconSnowflake: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12h20M12 2v20M20 4l-8 8-8-8M4 20l8-8 8 8" />
  </svg>
);

export const IconSun: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export const IconWater: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12c.6 0 1.2.4 1.7.9.6.6 1.3.9 1.9.9.7 0 1.4-.3 1.9-.9.5-.6 1.1-.9 1.7-.9.7 0 1.4.3 1.9.9.5.6 1.1.9 1.7.9.7 0 1.4-.3 1.9-.9.5-.6 1.1-.9 1.7-.9.7 0 1.4.3 1.9.9.5.6 1.1.9 1.7.9" />
    <path d="M2 17c.6 0 1.2.4 1.7.9.6.6 1.3.9 1.9.9.7 0 1.4-.3 1.9-.9.5-.6 1.1-.9 1.7-.9.7 0 1.4.3 1.9.9.5.6 1.1.9 1.7.9.7 0 1.4-.3 1.9-.9.5-.6 1.1-.9 1.7-.9" />
  </svg>
);

export const IconSnake: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 12h2a2 2 0 0 0 2-2V7a3 3 0 0 0-3-3 3 3 0 0 0-3 3v5a3 3 0 0 1-3 3 3 3 0 0 1-3-3v-2" />
    <path d="M8 12a5 5 0 0 0 0 10h1" />
  </svg>
);

export const IconVirus: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9l-2.1 2.1M7 17l-2.1 2.1" />
  </svg>
);

// --- Action / Status Icons ---

export const IconPhone: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const IconShock: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const IconEye: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconBandage: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2h4v4h-4zM10 18h4v4h-4z" />
    <path d="M5.64 5.64l2.82 2.83-2.82 2.83zM15.54 15.54l2.82 2.83-2.82 2.83z" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

export const IconCancel: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.93 4.93 14.14 14.14" />
  </svg>
);

export const IconWarning: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const IconHospital: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21h18M5 21V7l8-4 8 4v14" />
    <path d="M8 9a2 2 0 0 1 2 2v10" />
    <path d="M14 21V11a2 2 0 0 1 2-2" />
    <path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
  </svg>
);

export const IconTraffic: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="7" y="2" width="10" height="20" rx="5" />
    <path d="M12 6h.01" />
    <path d="M12 12h.01" />
    <path d="M12 18h.01" />
  </svg>
);

// --- Navigation / App Icons ---

export const IconChat: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const IconBook: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

export const IconHistory: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconMic: React.FC<IconProps> = ({ className, strokeWidth = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// --- Master Render Function ---

export const renderIcon = (name: string, className: string = "") => {
  const props = { className, strokeWidth: 1.5 };
  const n = name?.toLowerCase().trim() || "";

  if (n.includes('cardiac') || n.includes('monitor') || n.includes('ecg')) return <IconHeartMonitor {...props} />;
  if (n.includes('heart')) return <IconHeart {...props} />;
  if (n.includes('lung') || n.includes('pulmon') || n.includes('air') || n.includes('smoke')) return <IconLungs {...props} />;
  if (n.includes('neuro') || n.includes('psych') || n.includes('brain') || n.includes('head') || n.includes('face')) return <IconBrain {...props} />;
  if (n.includes('trauma') || n.includes('injury') || n.includes('crash')) return <IconTrauma {...props} />;
  if (n.includes('child') || n.includes('ped') || n.includes('baby')) return <IconChild {...props} />;
  
  if (n.includes('virus') || n.includes('bug') || n.includes('sepsis') || n.includes('infection') || n.includes('corona')) return <IconVirus {...props} />;
  if (n.includes('snake') || n.includes('pets') || n.includes('bite')) return <IconSnake {...props} />;
  if (n.includes('burn') || n.includes('fire') || n.includes('flame') || n.includes('hot')) return <IconFlame {...props} />;
  if (n.includes('cold') || n.includes('snow') || n.includes('ice') || n.includes('unit')) return <IconSnowflake {...props} />;
  if (n.includes('sun') || n.includes('heat') || n.includes('sunny')) return <IconSun {...props} />;
  if (n.includes('water') || n.includes('drown') || n.includes('fluids') || n.includes('drop')) return <IconIVBag {...props} />; // Contextual: water_drop often fluids

  if (n.includes('shock') || n.includes('hypotension') || n.includes('density') || n.includes('trend')) return <IconShock {...props} />;
  if (n.includes('eye') || n.includes('visib')) return <IconEye {...props} />;
  if (n.includes('pain') || n.includes('heal') || n.includes('band')) return <IconBandage {...props} />;
  
  if (n.includes('med') || n.includes('drug') || n.includes('vial') || n.includes('vaccine') || n.includes('syringe')) return <IconVial {...props} />;
  if (n.includes('pill') || n.includes('tablet')) return <IconPill {...props} />;
  if (n.includes('science') || n.includes('flask') || n.includes('poison') || n.includes('overdose')) return <IconFlask {...props} />;
  
  if (n.includes('call') || n.includes('phone')) return <IconPhone {...props} />;
  if (n.includes('cancel') || n.includes('no') || n.includes('block') || n.includes('stop')) return <IconCancel {...props} />;
  if (n.includes('warn') || n.includes('alert') || n.includes('disaster')) return <IconWarning {...props} />;
  
  if (n.includes('hosp') || n.includes('building') || n.includes('depart') || n.includes('apartment')) return <IconHospital {...props} />;
  if (n.includes('traffic') || n.includes('divert')) return <IconTraffic {...props} />;
  if (n.includes('admin') || n.includes('shield') || n.includes('badge')) return <IconAdmin {...props} />;
  if (n.includes('policy') || n.includes('doc') || n.includes('file') || n.includes('article') || n.includes('paper')) return <IconPolicy {...props} />;
  if (n.includes('proc') || n.includes('clip') || n.includes('list') || n.includes('assign')) return <IconProcedure {...props} />;

  if (n.includes('general') || n.includes('star')) return <IconStarOfLife {...props} />;

  // Specific fallbacks
  if (n === 'timeline') return <IconHeartMonitor {...props} />;
  if (n === 'church') return <IconStarOfLife {...props} />; 
  if (n === 'compress') return <IconTrauma {...props} />;
  if (n === 'groups') return <IconProcedure {...props} />;

  // Default fallback for unknown icons
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
};