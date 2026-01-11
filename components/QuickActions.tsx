/**
 * QuickActions Component
 *
 * 8 emergency shortcut buttons for rapid protocol access.
 * Shown when conversation is empty. One-tap sends pre-built query.
 */

import React from 'react';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  query: string;
  color: string;
  protocols: string[];
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'cardiac-arrest',
    label: 'Cardiac Arrest',
    icon: 'heart_broken',
    query: 'Adult cardiac arrest protocol with medication doses and sequence',
    color: 'red',
    protocols: ['1210', '518']
  },
  {
    id: 'chest-pain',
    label: 'Chest Pain',
    icon: 'vital_signs',
    query: 'Chest pain ACS protocol and 12-lead STEMI criteria',
    color: 'orange',
    protocols: ['1203', '503']
  },
  {
    id: 'stroke',
    label: 'Stroke',
    icon: 'psychology',
    query: 'Stroke protocol with LAMS score and CSC/PSC criteria',
    color: 'purple',
    protocols: ['1232', '521']
  },
  {
    id: 'respiratory',
    label: 'Respiratory',
    icon: 'air',
    query: 'Respiratory distress protocol and treatment algorithm',
    color: 'blue',
    protocols: ['1219', '1220']
  },
  {
    id: 'anaphylaxis',
    label: 'Anaphylaxis',
    icon: 'warning',
    query: 'Anaphylaxis protocol with epinephrine dose adult and pediatric',
    color: 'pink',
    protocols: ['1225']
  },
  {
    id: 'seizure',
    label: 'Seizure',
    icon: 'flash_on',
    query: 'Seizure protocol with midazolam dosing adult and pediatric',
    color: 'yellow',
    protocols: ['1223']
  },
  {
    id: 'overdose',
    label: 'Overdose',
    icon: 'medication_liquid',
    query: 'Overdose protocol with naloxone dose and route',
    color: 'green',
    protocols: ['1241']
  },
  {
    id: 'trauma',
    label: 'Trauma',
    icon: 'healing',
    query: 'Major trauma protocol and trauma center criteria',
    color: 'slate',
    protocols: ['1301']
  }
];

// Tailwind color classes mapped by color name
const colorClasses: Record<string, { bg: string; hover: string; text: string; icon: string }> = {
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    hover: 'hover:bg-red-100 dark:hover:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-300',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    hover: 'hover:bg-pink-100 dark:hover:bg-pink-900/40',
    text: 'text-pink-700 dark:text-pink-300',
    icon: 'text-pink-600 dark:text-pink-400'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400'
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    hover: 'hover:bg-slate-200 dark:hover:bg-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    icon: 'text-slate-600 dark:text-slate-400'
  }
};

interface QuickActionsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="mb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
        Quick Access
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_ACTIONS.map(action => {
          const colors = colorClasses[action.color] || colorClasses.slate;
          return (
            <button
              key={action.id}
              onClick={() => onSelect(action.query)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95
                ${colors.bg} ${colors.hover}
                disabled:opacity-50 disabled:cursor-not-allowed
                min-h-[80px] touch-manipulation border border-transparent
                hover:border-slate-200 dark:hover:border-slate-700`}
            >
              <span className={`material-symbols-outlined text-2xl ${colors.icon}`}>
                {action.icon}
              </span>
              <span className={`text-[10px] font-bold ${colors.text} text-center leading-tight`}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
