import React from 'react';
import { useWidgetMode } from '../../contexts/WidgetModeContext';

interface WidgetButtonProps {
  className?: string;
}

const WidgetButton: React.FC<WidgetButtonProps> = ({ className = '' }) => {
  const { isExpanded, toggleExpanded } = useWidgetMode();

  return (
    <button
      onClick={toggleExpanded}
      className={`
        fixed bottom-6 right-6 z-[9999]
        w-16 h-16 rounded-full
        bg-primary hover:bg-[#7A1628]
        shadow-2xl shadow-[#9B1B30]/40
        flex items-center justify-center
        transition-all duration-300 ease-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-primary/30
        ${isExpanded ? 'rotate-45' : 'rotate-0'}
        ${className}
      `}
      aria-label={isExpanded ? 'Close Protocol Guide' : 'Open Protocol Guide'}
      aria-expanded={isExpanded}
    >
      <span
        className="material-symbols-outlined text-white text-3xl"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
      >
        {isExpanded ? 'close' : 'medical_services'}
      </span>
    </button>
  );
};

export default WidgetButton;
