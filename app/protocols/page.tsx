'use client';

import Link from 'next/link';
import { useState } from 'react';

import { MaterialIcon } from '../components/ui/material-icon';

// Protocol category definitions with icons and colors
const CATEGORIES = [
  {
    id: 'cardiac',
    name: 'Cardiac',
    icon: 'cardiology',
    count: 15,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-500/10',
  },
  {
    id: 'trauma',
    name: 'Trauma / Burns',
    icon: 'personal_injury',
    count: 8,
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-500/10',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    icon: 'child_care',
    count: 12,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    id: 'medical',
    name: 'General Medical',
    icon: 'medical_services',
    count: 24,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    icon: 'pill',
    count: 50,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    id: 'procedures',
    name: 'Procedures',
    icon: 'vaccines',
    count: 18,
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    id: 'admin',
    name: 'Admin Policies',
    icon: 'policy',
    count: 0,
    colorClass: 'text-slate-600 dark:text-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-700/50',
  },
] as const;

// Mock recently viewed protocols (will be replaced with real data)
const RECENT_PROTOCOLS = [
  {
    id: 'tp-1244',
    tpCode: 'TP 1244',
    title: 'Traumatic Cardiac Arrest',
    category: 'Trauma',
    categoryColor: 'text-orange-600 dark:text-orange-400',
    categoryBg: 'bg-orange-100 dark:bg-orange-500/20',
    icon: 'personal_injury',
    viewedAt: '2m ago',
  },
  {
    id: 'tp-1210',
    tpCode: 'TP 1210',
    title: 'STEMI (ST-Elevation MI)',
    category: 'Cardiac',
    categoryColor: 'text-red-600 dark:text-red-400',
    categoryBg: 'bg-red-100 dark:bg-red-500/20',
    icon: 'ecg_heart',
    viewedAt: '1h ago',
  },
  {
    id: 'epinephrine',
    tpCode: 'Rx',
    title: 'Epinephrine (Adrenaline)',
    category: 'Meds',
    categoryColor: 'text-emerald-600 dark:text-emerald-400',
    categoryBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    icon: 'pill',
    viewedAt: '4h ago',
  },
];

function CategoryTile({
  category,
}: {
  category: (typeof CATEGORIES)[number];
}) {
  return (
    <Link
      href={`/protocols?category=${category.id}`}
      className="flex items-center w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 active:bg-slate-50 dark:active:bg-slate-800 transition-all hover:shadow-md hover:border-primary/20 group"
    >
      <div
        className={`flex items-center justify-center w-11 h-11 rounded-lg ${category.bgClass} ${category.colorClass} shrink-0 transition-transform duration-300`}
      >
        <MaterialIcon name={category.icon} size={24} />
      </div>
      <div className="ml-4 flex-1 text-left">
        <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white">
          {category.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {category.count > 0
            ? `${category.count} ${category.id === 'pharmacology' ? 'Medications' : 'Protocols'}`
            : 'Department Standards'}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
        <MaterialIcon
          name="chevron_right"
          size={20}
          className="text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors"
        />
      </div>
    </Link>
  );
}

function RecentProtocolCard({
  protocol,
}: {
  protocol: (typeof RECENT_PROTOCOLS)[number];
}) {
  return (
    <Link
      href={`/protocols/${protocol.id}`}
      className="snap-start shrink-0 w-64 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 active:scale-[0.98] transition-transform text-left group hover:border-primary/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${protocol.categoryBg} ${protocol.categoryColor}`}
          >
            <MaterialIcon name={protocol.icon} size={18} />
          </div>
          <span
            className={`text-[11px] font-bold ${protocol.categoryColor} uppercase tracking-wide`}
          >
            {protocol.category}
          </span>
        </div>
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {protocol.tpCode}
        </span>
      </div>
      <h4 className="font-bold text-base leading-snug mb-1 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
        {protocol.title}
      </h4>
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
        <MaterialIcon name="schedule" size={14} />
        <span>{protocol.viewedAt}</span>
      </div>
    </Link>
  );
}

export default function ProtocolsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Protocol Library
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                LA County DHS • Online
              </p>
            </div>
          </div>
          <button
            type="button"
            className="p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            aria-label="Notifications"
          >
            <MaterialIcon name="notifications" size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MaterialIcon
                  name="search"
                  size={20}
                  className="text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search protocols..."
                className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium placeholder:text-gray-400/70 dark:placeholder:text-gray-500/70 text-gray-900 dark:text-white transition-all shadow-sm"
              />
            </div>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary active:bg-slate-200 dark:active:bg-slate-700 transition-colors shadow-sm"
              aria-label="Filter options"
            >
              <MaterialIcon name="tune" size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto flex-1">
        {/* Recently Viewed Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between px-5 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Recently Viewed
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto px-5 pb-6 no-scrollbar snap-x snap-mandatory">
            {RECENT_PROTOCOLS.map((protocol) => (
              <RecentProtocolCard key={protocol.id} protocol={protocol} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full px-5">
          <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
        </div>

        {/* All Categories Section */}
        <div className="pt-6 px-5 pb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            All Categories
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {CATEGORIES.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 pb-6 flex justify-center opacity-40">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            LA County EMS Protocols
          </div>
        </div>
      </main>
    </div>
  );
}
