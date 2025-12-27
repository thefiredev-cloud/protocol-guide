'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Calendar,
  ChevronDown,
  Droplets,
  Globe,
  Heart,
  HeartPulse,
  Pill,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock protocol data (will be replaced with real API data)
const MOCK_PROTOCOL = {
  id: 'tp-1244',
  tpCode: 'TP-1244',
  title: 'Cardiac Arrest',
  subtitle: 'Adult Medical • Standing Order',
  category: 'Cardiac',
  priority: 'ALS Priority',
  effectiveDate: 'Jan 1, 2024',
  scope: 'County-Wide',
  criticalConsideration: 'Minimize interruptions in chest compressions',
  isSaved: true,
  treatmentSequence: [
    {
      id: 'assessment',
      title: 'Initial Assessment',
      subtitle: 'CPR, Defibrillation, Airway',
      icon: MonitorHeart,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      content: [
        'Confirm pulselessness and apnea',
        'Begin high-quality CPR immediately',
        'Attach defibrillator and analyze rhythm',
        'If VF/VT: Defibrillate at maximum energy',
        'Resume CPR immediately after shock',
      ],
    },
    {
      id: 'vascular',
      title: 'Vascular Access',
      subtitle: 'IV/IO Establishment',
      icon: Droplets,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
      content: [
        'Establish IV access during CPR',
        'If IV unsuccessful after 2 attempts, establish IO',
        'Preferred IO sites: proximal tibia, proximal humerus',
        'Confirm placement with flush',
      ],
    },
    {
      id: 'medications',
      title: 'Medication Administration',
      subtitle: 'Epinephrine, Amiodarone details',
      icon: Pill,
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-100 dark:bg-purple-900/30',
      content: [
        'Epinephrine 1mg IV/IO every 3-5 minutes',
        'For VF/VT: Amiodarone 300mg IV/IO first dose',
        'Second dose Amiodarone: 150mg IV/IO',
        'Consider Lidocaine if Amiodarone unavailable',
      ],
    },
  ],
  pharmacology: [
    {
      name: 'Epinephrine 1:10,000',
      dose: '1mg IV/IO q3-5min',
      route: 'IV/IO',
    },
    {
      name: 'Amiodarone',
      dose: '300mg, then 150mg',
      route: 'IV/IO',
    },
    {
      name: 'Sodium Bicarbonate',
      dose: '1 mEq/kg',
      route: 'IV/IO',
    },
  ],
  relatedProtocols: [
    { id: 'tp-1210', code: 'TP-1210', title: 'STEMI' },
    { id: 'tp-1212', code: 'TP-1212', title: 'Cardiac Arrhythmias' },
    { id: 'tp-1244-p', code: 'TP-1244-P', title: 'Pediatric Cardiac Arrest' },
  ],
};

function CollapsibleSection({
  section,
}: {
  section: (typeof MOCK_PROTOCOL.treatmentSequence)[number];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4 group"
      >
        <div
          className={`w-10 h-10 rounded-full ${section.bgClass} flex items-center justify-center ${section.colorClass}`}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className="text-base font-medium text-[var(--text-primary)]">
            {section.title}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {section.subtitle}
          </p>
        </div>
        <ChevronDown
          size={20}
          className={`text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pl-[72px]">
          <ul className="space-y-2">
            {section.content.map((item, idx) => (
              <li
                key={idx}
                className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
              >
                <span className="text-[var(--accent)] mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(MOCK_PROTOCOL.isSaved);

  // In real implementation, fetch protocol by params.id
  const protocol = MOCK_PROTOCOL;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] pb-28">
      {/* Header */}
      <div className="pt-16 pb-4 px-5 max-w-md mx-auto w-full">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-8 h-8 -ml-2 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[var(--text-secondary)]"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {protocol.tpCode}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm ${isSaved ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
            aria-label={isSaved ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </header>
      </div>

      <main className="px-5 max-w-md mx-auto w-full">
        {/* Protocol Card */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)] mb-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 border-4 border-white dark:border-gray-600 shadow-sm flex items-center justify-center">
                <Heart
                  size={40}
                  className="text-[var(--accent)]"
                  fill="currentColor"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                <AlertTriangle size={12} className="text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {protocol.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium">
              {protocol.subtitle}
            </p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {protocol.priority}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1 flex items-center justify-center gap-1">
                <Calendar size={10} />
                Effective Date
              </p>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {protocol.effectiveDate}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1 flex items-center justify-center gap-1">
                <Globe size={10} />
                Scope
              </p>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {protocol.scope}
              </p>
            </div>
          </div>

          {/* Critical Consideration */}
          <div className="mt-4 text-center p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30">
            <p className="text-[10px] uppercase tracking-wider text-yellow-600 dark:text-yellow-500 font-semibold mb-1">
              Critical Consideration
            </p>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {protocol.criticalConsideration}
            </p>
          </div>
        </div>

        {/* Treatment Sequence */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 ml-1">
            Treatment Sequence
          </h3>
          <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            {protocol.treatmentSequence.map((section) => (
              <CollapsibleSection key={section.id} section={section} />
            ))}
          </div>
        </div>

        {/* Pharmacology */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 ml-1">
            Pharmacology
          </h3>
          <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            {protocol.pharmacology.map((med, idx) => (
              <div key={idx} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Pill size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-[var(--text-primary)]">
                    {med.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {med.dose} • {med.route}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Protocols */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 ml-1">
            Related Protocols
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {protocol.relatedProtocols.map((related) => (
              <Link
                key={related.id}
                href={`/protocols/${related.id}`}
                className="shrink-0 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
              >
                <p className="text-xs font-semibold text-[var(--accent)]">
                  {related.code}
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">
                  {related.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
