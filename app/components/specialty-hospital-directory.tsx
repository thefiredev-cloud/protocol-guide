'use client';

import { BASE_HOSPITALS, MEDICAL_ALERT_CENTER, BaseHospital } from '@/lib/clinical/base-hospitals';
import { Phone, Heart, Zap, Brain, Activity, Flame, AlertCircle } from 'lucide-react';
import { useState } from 'react';

type SpecialtyFilter = 'All' | 'Trauma' | 'STEMI' | 'Stroke' | 'ECMO' | 'Burn';

interface SpecialtyCategory {
  id: SpecialtyFilter;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const SPECIALTY_CATEGORIES: SpecialtyCategory[] = [
  {
    id: 'All',
    name: 'All Hospitals',
    icon: <Heart size={20} />,
    color: '#2563eb',
    description: 'View all 13 base hospitals'
  },
  {
    id: 'Trauma',
    name: 'Trauma Centers',
    icon: <AlertCircle size={20} />,
    color: '#dc2626',
    description: 'Level I & II trauma centers'
  },
  {
    id: 'STEMI',
    name: 'STEMI Centers',
    icon: <Zap size={20} />,
    color: '#ea580c',
    description: 'ST-Elevation MI treatment'
  },
  {
    id: 'Stroke',
    name: 'Stroke Centers',
    icon: <Brain size={20} />,
    color: '#7c3aed',
    description: 'Comprehensive stroke care'
  },
  {
    id: 'ECMO',
    name: 'ECMO Centers',
    icon: <Activity size={20} />,
    color: '#0891b2',
    description: 'Advanced cardiac support'
  },
  {
    id: 'Burn',
    name: 'Burn Center',
    icon: <Flame size={20} />,
    color: '#f59e0b',
    description: 'Specialized burn treatment'
  }
];

export function SpecialtyHospitalDirectory() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyFilter>('All');

  const filterBySpecialty = (hospital: BaseHospital): boolean => {
    if (selectedSpecialty === 'All') return true;
    
    const capabilityMap: Record<SpecialtyFilter, string[]> = {
      'All': [],
      'Trauma': ['Trauma Center', 'Level I Trauma Center', 'Level II Trauma Center'],
      'STEMI': ['STEMI Center'],
      'Stroke': ['Stroke Center'],
      'ECMO': ['ECMO Center'],
      'Burn': ['Burn Center']
    };

    const keywords = capabilityMap[selectedSpecialty] || [];
    return hospital.capabilities.some(cap => 
      keywords.some(keyword => cap.includes(keyword))
    );
  };

  const filteredHospitals = BASE_HOSPITALS.filter(filterBySpecialty);
  const selectedCategory = SPECIALTY_CATEGORIES.find(c => c.id === selectedSpecialty);

  return (
    <div className="specialty-hospital-directory">
      {/* Header */}
      <header className="specialty-header">
        <div className="header-icon-wrapper">
          <Heart size={40} strokeWidth={2.5} />
        </div>
        <h1 className="specialty-title">Base Hospital Directory</h1>
        <p className="specialty-subtitle">Categorized by Specialty Capabilities</p>
      </header>

      {/* Medical Alert Center - Always Visible */}
      <section className="mac-section">
        <div className="mac-card">
          <div className="mac-header">
            <AlertCircle size={28} />
            <div>
              <h2>Medical Alert Center (MAC)</h2>
              <p className="mac-description">24/7 specialized consultations</p>
            </div>
          </div>
          <a href={`tel:${MEDICAL_ALERT_CENTER.phone}`} className="mac-phone-button">
            <Phone size={24} />
            <span className="phone-text">{MEDICAL_ALERT_CENTER.phone}</span>
          </a>
          <p className="mac-usage">{MEDICAL_ALERT_CENTER.usage}</p>
        </div>
      </section>

      {/* Specialty Filter Tabs */}
      <section className="specialty-filters">
        {SPECIALTY_CATEGORIES.map(category => {
          const isActive = selectedSpecialty === category.id;
          const count = category.id === 'All' 
            ? BASE_HOSPITALS.length 
            : BASE_HOSPITALS.filter(h => filterBySpecialty(h)).length;
          
          return (
            <button
              key={category.id}
              className={`specialty-tab ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedSpecialty(category.id)}
              style={{
                '--tab-color': category.color,
                backgroundColor: isActive ? category.color : 'var(--card-bg)',
                color: isActive ? 'white' : 'var(--text-primary)',
                borderColor: isActive ? category.color : 'var(--border)'
              } as React.CSSProperties}
            >
              <span className="tab-icon">{category.icon}</span>
              <div className="tab-content">
                <span className="tab-name">{category.name}</span>
                <span className="tab-count">{count} {count === 1 ? 'hospital' : 'hospitals'}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* Category Description */}
      {selectedCategory && (
        <div className="category-banner" style={{ borderLeftColor: selectedCategory.color }}>
          <div className="banner-icon" style={{ color: selectedCategory.color }}>
            {selectedCategory.icon}
          </div>
          <div>
            <h3 style={{ color: selectedCategory.color }}>{selectedCategory.name}</h3>
            <p>{selectedCategory.description}</p>
          </div>
        </div>
      )}

      {/* Hospital Cards */}
      <section className="hospitals-list">
        {filteredHospitals.length === 0 ? (
          <div className="no-results">
            <AlertCircle size={48} />
            <h3>No hospitals found</h3>
            <p>No hospitals match the selected specialty</p>
          </div>
        ) : (
          filteredHospitals.map(hospital => (
            <SpecialtyHospitalCard 
              key={hospital.id} 
              hospital={hospital}
              highlightSpecialty={selectedSpecialty}
            />
          ))
        )}
      </section>

      <style jsx>{`
        .specialty-hospital-directory {
          min-height: 100vh;
          background: linear-gradient(to bottom, var(--surface) 0%, var(--bg-secondary) 100%);
          padding: 24px 16px 100px;
        }

        .specialty-header {
          text-align: center;
          margin-bottom: 32px;
          padding: 24px;
          background: var(--card-bg);
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .header-icon-wrapper {
          display: inline-flex;
          padding: 16px;
          background: linear-gradient(135deg, var(--accent) 0%, #dc2626 100%);
          border-radius: 50%;
          color: white;
          margin-bottom: 16px;
        }

        .specialty-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, var(--accent) 0%, #dc2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .specialty-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
          font-weight: 600;
        }

        .mac-section {
          margin-bottom: 32px;
        }

        .mac-card {
          background: linear-gradient(135deg, rgba(196, 30, 58, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
          border: 3px solid var(--accent);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(196, 30, 58, 0.2);
        }

        .mac-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          color: var(--accent);
        }

        .mac-header h2 {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
        }

        .mac-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 4px 0 0 0;
          font-weight: 600;
        }

        .mac-phone-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 20px;
          background: var(--accent);
          color: white;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 800;
          font-size: 24px;
          box-shadow: 0 6px 20px rgba(196, 30, 58, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 16px;
        }

        .mac-phone-button:hover {
          background: #b31e3a;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(196, 30, 58, 0.5);
        }

        .mac-phone-button:active {
          transform: translateY(-1px);
        }

        .phone-text {
          letter-spacing: 1px;
        }

        .mac-usage {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
          text-align: center;
        }

        .specialty-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .specialty-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border: 2px solid;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .specialty-tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }

        .specialty-tab.active {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .tab-icon {
          display: flex;
          flex-shrink: 0;
        }

        .tab-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          flex: 1;
        }

        .tab-name {
          font-size: 15px;
          font-weight: 700;
        }

        .tab-count {
          font-size: 12px;
          opacity: 0.85;
          font-weight: 600;
        }

        .category-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: var(--card-bg);
          border-left: 4px solid;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .banner-icon {
          font-size: 32px;
          display: flex;
        }

        .category-banner h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 4px 0;
        }

        .category-banner p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .hospitals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .no-results h3 {
          font-size: 24px;
          font-weight: 700;
          margin: 16px 0 8px 0;
        }

        .no-results p {
          font-size: 16px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .specialty-filters {
            grid-template-columns: 1fr;
          }

          .specialty-title {
            font-size: 28px;
          }

          .mac-phone-button {
            font-size: 20px;
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}

interface SpecialtyHospitalCardProps {
  hospital: BaseHospital;
  highlightSpecialty: SpecialtyFilter;
}

function SpecialtyHospitalCard({ hospital, highlightSpecialty }: SpecialtyHospitalCardProps) {
  const isLevel1 = hospital.capabilities.some(cap => cap.includes('Level I'));
  
  const getSpecialtyColor = (specialty: SpecialtyFilter): string => {
    const category = SPECIALTY_CATEGORIES.find(c => c.id === specialty);
    return category?.color || '#2563eb';
  };

  return (
    <div className={`specialty-hospital-card ${isLevel1 ? 'level-1' : ''}`}>
      <div className="card-header">
        <div className="hospital-main-info">
          <h3 className="hospital-name">{hospital.shortName}</h3>
          <span className="hospital-region">{hospital.region} Region</span>
        </div>
        {isLevel1 && (
          <div className="level-1-badge">
            <AlertCircle size={16} fill="currentColor" />
            Level I Trauma
          </div>
        )}
      </div>

      <a 
        href={`tel:${hospital.phone}`} 
        className="hospital-call-button"
        aria-label={`Call ${hospital.shortName}`}
      >
        <Phone size={24} strokeWidth={2.5} />
        <span className="button-phone-number">{hospital.phone}</span>
      </a>

      <div className="hospital-address-line">
        <span className="address-icon">📍</span>
        <span>{hospital.address}</span>
      </div>

      <div className="capabilities-grid">
        {hospital.capabilities.map((capability, idx) => {
          let capColor = '#64748b';
          if (capability.includes('Trauma')) capColor = '#dc2626';
          else if (capability.includes('STEMI')) capColor = '#ea580c';
          else if (capability.includes('Stroke')) capColor = '#7c3aed';
          else if (capability.includes('ECMO')) capColor = '#0891b2';
          else if (capability.includes('Burn')) capColor = '#f59e0b';

          return (
            <div 
              key={idx} 
              className="capability-chip"
              style={{ 
                borderColor: capColor,
                backgroundColor: `${capColor}15`,
                color: capColor
              }}
            >
              <span className="chip-dot" style={{ backgroundColor: capColor }} />
              {capability}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .specialty-hospital-card {
          background: var(--card-bg);
          border: 2px solid var(--border);
          border-radius: 18px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .specialty-hospital-card:hover {
          border-color: var(--accent);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        .specialty-hospital-card.level-1 {
          border-color: #f59e0b;
          background: linear-gradient(135deg, var(--card-bg) 0%, rgba(245, 158, 11, 0.08) 100%);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .hospital-main-info {
          flex: 1;
        }

        .hospital-name {
          font-size: 26px;
          font-weight: 900;
          margin: 0 0 6px 0;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .hospital-region {
          display: inline-block;
          padding: 6px 14px;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .level-1-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #f59e0b;
          color: white;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .hospital-call-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 20px 24px;
          background: var(--accent);
          color: white;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
          box-shadow: 0 6px 20px rgba(196, 30, 58, 0.35);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 20px;
        }

        .hospital-call-button:hover {
          background: #b31e3a;
          transform: scale(1.03);
          box-shadow: 0 10px 30px rgba(196, 30, 58, 0.5);
        }

        .hospital-call-button:active {
          transform: scale(1.01);
        }

        .button-phone-number {
          font-size: 24px;
          letter-spacing: 1px;
        }

        .hospital-address-line {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: var(--surface-elevated);
          border-radius: 10px;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 20px;
          border: 1px solid var(--border);
        }

        .address-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .capabilities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .capability-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
        }

        .capability-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .chip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .hospital-name {
            font-size: 22px;
          }

          .button-phone-number {
            font-size: 20px;
          }

          .hospital-call-button {
            padding: 18px 20px;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .level-1-badge {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

