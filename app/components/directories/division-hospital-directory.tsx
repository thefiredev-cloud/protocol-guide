'use client';

import { Phone } from 'lucide-react';
import { useState } from 'react';

import { BASE_HOSPITALS, BaseHospital, MEDICAL_ALERT_CENTER } from '@/lib/clinical/base-hospitals';

type Division = 'All' | 'Central' | 'North' | 'South' | 'East' | 'West';

const DIVISION_INFO = {
  Central: {
    color: '#dc2626',
    description: 'Downtown Los Angeles & surrounding areas',
    icon: '🏛️'
  },
  North: {
    color: '#2563eb',
    description: 'San Fernando Valley & northern regions',
    icon: '⛰️'
  },
  South: {
    color: '#059669',
    description: 'South Bay, Long Beach, Torrance areas',
    icon: '🌊'
  },
  East: {
    color: '#7c3aed',
    description: 'Pasadena & eastern regions',
    icon: '🏔️'
  },
  West: {
    color: '#ea580c',
    description: 'West LA, Santa Monica, Beverly Hills',
    icon: '🌅'
  }
};

export function DivisionHospitalDirectory() {
  const [selectedDivision, setSelectedDivision] = useState<Division>('All');

  // Group hospitals by division
  const hospitalsByDivision = {
    Central: BASE_HOSPITALS.filter(h => h.region === 'Central'),
    North: BASE_HOSPITALS.filter(h => h.region === 'North'),
    South: BASE_HOSPITALS.filter(h => h.region === 'South'),
    East: BASE_HOSPITALS.filter(h => h.region === 'East'),
    West: BASE_HOSPITALS.filter(h => h.region === 'West')
  };

  const divisions: Division[] = ['Central', 'North', 'South', 'East', 'West'];

  // Get hospitals to display based on selected division
  const getHospitalsToDisplay = () => {
    if (selectedDivision === 'All') {
      return hospitalsByDivision;
    }
    return { [selectedDivision]: hospitalsByDivision[selectedDivision] };
  };

  const hospitalsToDisplay = getHospitalsToDisplay();

  return (
    <div className="division-directory">
      {/* MAC - Always Prominent */}
      <div className="mac-card">
        <div className="mac-label">MEDICAL ALERT CENTER</div>
        <a href={`tel:${MEDICAL_ALERT_CENTER.phone}`} className="mac-button">
          <Phone size={32} strokeWidth={3} />
          <span>{MEDICAL_ALERT_CENTER.phone}</span>
        </a>
      </div>

      {/* Division Tabs */}
      <div className="division-tabs">
        {divisions.map(division => {
          const isActive = selectedDivision === division;
          const count = hospitalsByDivision[division as keyof typeof hospitalsByDivision]?.length || 0;
          const divisionColor = DIVISION_INFO[division as keyof typeof DIVISION_INFO]?.color;
          
          return (
            <button
              key={division}
              className={`division-tab ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedDivision(division)}
              style={{
                backgroundColor: isActive ? divisionColor : 'var(--card-bg)',
                color: isActive ? 'white' : 'var(--text-primary)',
                borderColor: isActive ? divisionColor : 'var(--border)'
              }}
            >
              <span className="tab-emoji">{DIVISION_INFO[division as keyof typeof DIVISION_INFO]?.icon}</span>
              <span className="tab-label">{division}</span>
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Hospital Display - Grouped by Region */}
      <div className="hospitals-container">
        {Object.entries(hospitalsToDisplay).map(([region, hospitals]) => (
          <div key={region} className="region-section">
            <h2 className="region-header" style={{
              color: DIVISION_INFO[region as keyof typeof DIVISION_INFO]?.color,
              borderLeftColor: DIVISION_INFO[region as keyof typeof DIVISION_INFO]?.color
            }}>
              <span className="region-icon">{DIVISION_INFO[region as keyof typeof DIVISION_INFO]?.icon}</span>
              {region} Division
              <span className="region-count">({hospitals.length})</span>
            </h2>
            <div className="hospitals-list">
              {hospitals.map(hospital => (
                <DivisionHospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  divisionColor={DIVISION_INFO[region as keyof typeof DIVISION_INFO]?.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .division-directory {
          min-height: 100vh;
          background: var(--surface);
          padding: 20px;
          padding-bottom: 120px;
        }

        .mac-card {
          background: var(--accent);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(196, 30, 58, 0.3);
        }

        .mac-label {
          color: white;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 1px;
          margin-bottom: 16px;
          text-align: center;
        }

        .mac-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 28px;
          background: white;
          color: var(--accent);
          border-radius: 16px;
          text-decoration: none;
          font-weight: 900;
          font-size: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          min-height: 100px;
        }

        .mac-button:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .division-tabs {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .division-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 16px;
          border: 3px solid;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 900;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          min-height: 120px;
        }

        .division-tab:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .division-tab.active {
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3);
          transform: scale(1.05);
        }

        .tab-emoji {
          font-size: 40px;
        }

        .tab-label {
          font-size: 18px;
          font-weight: 900;
          text-align: center;
        }

        .tab-count {
          font-size: 24px;
          opacity: 0.8;
          font-weight: 900;
        }

        .hospitals-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .region-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .region-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 900;
          margin: 0;
          padding: 20px;
          padding-left: 24px;
          background: var(--card-bg);
          border-left: 6px solid;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .region-icon {
          font-size: 32px;
        }

        .region-count {
          margin-left: auto;
          opacity: 0.7;
          font-size: 24px;
        }

        .hospitals-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .division-tabs {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .division-tabs {
            grid-template-columns: repeat(2, 1fr);
          }

          .division-tab {
            min-height: 100px;
            padding: 20px 12px;
          }

          .tab-emoji {
            font-size: 32px;
          }

          .tab-label {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

interface DivisionHospitalCardProps {
  hospital: BaseHospital;
  divisionColor: string;
}

function DivisionHospitalCard({ hospital, divisionColor }: DivisionHospitalCardProps) {
  const isLevel1 = hospital.capabilities.some(cap => cap.includes('Level I Trauma'));
  const hasECMO = hospital.capabilities.some(cap => cap.includes('ECMO'));
  const hasBurn = hospital.capabilities.some(cap => cap.includes('Burn'));
  
  return (
    <div className={`hospital-card ${isLevel1 ? 'level-1' : ''}`}>
      {/* Hospital Name */}
      <div className="card-header">
        <h3 className="hospital-name">{hospital.shortName}</h3>
        <div className="badges-row">
          {isLevel1 && <span className="badge level-1">⭐ LEVEL I</span>}
          {hasECMO && <span className="badge ecmo">ECMO</span>}
          {hasBurn && <span className="badge burn">🔥 BURN</span>}
        </div>
      </div>

      {/* Phone Button */}
      <a 
        href={`tel:${hospital.phone}`} 
        className="phone-button"
        aria-label={`Call ${hospital.shortName}`}
      >
        <Phone size={36} strokeWidth={3} />
        <span className="phone-number">{hospital.phone}</span>
      </a>

      <style jsx>{`
        .hospital-card {
          background: var(--card-bg);
          border: 4px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .hospital-card:hover {
          border-color: ${divisionColor};
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          transform: scale(1.02);
        }

        .hospital-card.level-1 {
          border-color: #f59e0b;
          border-width: 6px;
        }

        .card-header {
          margin-bottom: 24px;
        }

        .hospital-name {
          font-size: 36px;
          font-weight: 900;
          margin: 0 0 16px 0;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .badge.level-1 {
          background: #f59e0b;
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .badge.ecmo {
          background: #0891b2;
          color: white;
          box-shadow: 0 4px 12px rgba(8, 145, 178, 0.4);
        }

        .badge.burn {
          background: #dc2626;
          color: white;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }

        .phone-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 32px;
          background: var(--accent);
          color: white;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 900;
          box-shadow: 0 6px 20px rgba(196, 30, 58, 0.4);
          transition: all 0.2s ease;
          min-height: 120px;
        }

        .phone-button:hover {
          background: #b31e3a;
          transform: scale(1.03);
          box-shadow: 0 10px 28px rgba(196, 30, 58, 0.5);
        }

        .phone-number {
          font-size: 36px;
          letter-spacing: 1px;
        }

        @media (max-width: 768px) {
          .hospital-name {
            font-size: 32px;
          }

          .phone-number {
            font-size: 32px;
          }

          .phone-button {
            padding: 28px;
            min-height: 100px;
          }

          .badge {
            font-size: 14px;
            padding: 10px 16px;
          }
        }
      `}</style>
    </div>
  );
}

