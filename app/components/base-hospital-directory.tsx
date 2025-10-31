'use client';

import { BASE_HOSPITALS, MEDICAL_ALERT_CENTER, SPECIALIZED_CONTACTS, BaseHospital } from '@/lib/clinical/base-hospitals';
import { Phone, MapPin, Star, AlertCircle } from 'lucide-react';
import { useState } from 'react';

type RegionFilter = 'All' | 'Central' | 'North' | 'South' | 'East' | 'West';

export function BaseHospitalDirectory() {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('All');

  const filteredHospitals = regionFilter === 'All' 
    ? BASE_HOSPITALS 
    : BASE_HOSPITALS.filter(h => h.region === regionFilter);

  return (
    <div className="base-hospital-directory">
      <header className="directory-header">
        <h2>Base Hospital Directory</h2>
        <p>24/7 Online Medical Direction</p>
      </header>

      {/* Critical Contacts - Always visible */}
      <section className="critical-contacts">
        <div className="contact-card priority">
          <div className="contact-header">
            <AlertCircle size={24} color="var(--error)" />
            <h3>Medical Alert Center (MAC)</h3>
          </div>
          <a href={`tel:${MEDICAL_ALERT_CENTER.phone}`} className="phone-link primary">
            <Phone size={20} />
            <span>{MEDICAL_ALERT_CENTER.phone}</span>
          </a>
          <p className="contact-usage">{MEDICAL_ALERT_CENTER.usage}</p>
        </div>
      </section>

      {/* Region Filter */}
      <div className="region-filter">
        {(['All', 'Central', 'North', 'South', 'East', 'West'] as RegionFilter[]).map(region => (
          <button
            key={region}
            className={`filter-btn ${regionFilter === region ? 'active' : ''}`}
            onClick={() => setRegionFilter(region)}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Base Hospitals Grid */}
      <section className="hospitals-grid">
        {filteredHospitals.map(hospital => (
          <BaseHospitalCard key={hospital.id} hospital={hospital} />
        ))}
      </section>

      {/* Specialized Contacts */}
      <section className="specialized-contacts">
        <h3>Specialized Emergency Contacts</h3>
        <div className="contacts-list">
          <div className="contact-item">
            <strong>{SPECIALIZED_CONTACTS.catalinaHyperbaric.name}</strong>
            <a href={`tel:${SPECIALIZED_CONTACTS.catalinaHyperbaric.phone}`} className="phone-link">
              <Phone size={18} />
              {SPECIALIZED_CONTACTS.catalinaHyperbaric.phone}
            </a>
            <span className="usage-note">{SPECIALIZED_CONTACTS.catalinaHyperbaric.usage}</span>
          </div>
          <div className="contact-item">
            <strong>{SPECIALIZED_CONTACTS.emsAgency.name}</strong>
            <a href={`tel:${SPECIALIZED_CONTACTS.emsAgency.phone}`} className="phone-link">
              <Phone size={18} />
              {SPECIALIZED_CONTACTS.emsAgency.phone}
            </a>
            <span className="usage-note">{SPECIALIZED_CONTACTS.emsAgency.usage}</span>
          </div>
        </div>
      </section>

      <style jsx>{`
        .base-hospital-directory {
          padding: 24px 16px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .directory-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .directory-header h2 {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .directory-header p {
          color: var(--text-secondary);
          font-size: 18px;
          font-weight: 600;
        }

        .critical-contacts {
          margin-bottom: 32px;
        }

        .contact-card {
          background: var(--card-bg);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }

        .contact-card.priority {
          border-color: var(--accent);
          background: linear-gradient(135deg, rgba(196, 30, 58, 0.08) 0%, rgba(196, 30, 58, 0.03) 100%);
          box-shadow: 0 4px 16px rgba(196, 30, 58, 0.15);
        }

        .contact-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .contact-header h3 {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .phone-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--button-bg);
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 20px;
          transition: all 0.2s;
          margin-bottom: 12px;
        }

        .phone-link.primary {
          background: var(--accent);
          color: white;
          font-size: 24px;
          padding: 20px 24px;
          box-shadow: 0 4px 12px rgba(196, 30, 58, 0.3);
        }

        .phone-link:hover {
          transform: translateY(-2px);
        }

        .phone-link.primary:hover {
          background: var(--accent-hover);
          box-shadow: 0 6px 20px rgba(196, 30, 58, 0.4);
        }

        .contact-usage {
          color: var(--text-secondary);
          font-size: 15px;
          margin: 0;
          line-height: 1.5;
        }

        .region-filter {
          display: flex;
          gap: 10px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-btn {
          padding: 12px 24px;
          background: var(--surface-elevated);
          border: 2px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 90px;
          font-size: 15px;
          letter-spacing: 0.3px;
        }

        .filter-btn:hover {
          background: var(--button-hover);
          border-color: var(--primary);
          transform: translateY(-1px);
        }

        .filter-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .specialized-contacts {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 24px;
          border: 2px solid var(--border);
        }

        .specialized-contacts h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .contact-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: var(--surface-elevated);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .contact-item strong {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .usage-note {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .hospitals-grid {
            grid-template-columns: 1fr;
          }

          .directory-header h2 {
            font-size: 28px;
          }

          .base-hospital-directory {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

interface BaseHospitalCardProps {
  hospital: BaseHospital;
}

function BaseHospitalCard({ hospital }: BaseHospitalCardProps) {
  const isLevel1Trauma = hospital.capabilities.some(cap => cap.includes('Level I Trauma'));
  
  return (
    <div className={`hospital-card ${isLevel1Trauma ? 'level-1' : ''}`}>
      <div className="hospital-header">
        <div className="hospital-info">
          <h3 className="hospital-name">{hospital.shortName}</h3>
          <span className="region-badge">{hospital.region}</span>
        </div>
        {isLevel1Trauma && (
          <div className="level-1-badge">
            <Star size={16} fill="currentColor" />
            Level I
          </div>
        )}
      </div>

      <a 
        href={`tel:${hospital.phone}`} 
        className="hospital-phone"
        aria-label={`Call ${hospital.shortName} at ${hospital.phone}`}
      >
        <Phone size={24} />
        <span className="phone-number">{hospital.phone}</span>
      </a>

      <div className="hospital-address">
        <MapPin size={14} />
        <span>{hospital.address}</span>
      </div>

      <div className="capabilities">
        {hospital.capabilities.map((cap, idx) => (
          <span key={idx} className="capability-badge">
            {cap}
          </span>
        ))}
      </div>

      <style jsx>{`
        .hospital-card {
          background: var(--card-bg);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.2s;
          position: relative;
        }

        .hospital-card.level-1 {
          border-color: var(--warning);
          background: linear-gradient(135deg, var(--card-bg) 0%, rgba(255, 159, 10, 0.05) 100%);
        }

        .hospital-card:hover {
          border-color: var(--accent);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .hospital-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .hospital-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .hospital-name {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
        }

        .region-badge {
          display: inline-block;
          padding: 6px 12px;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          width: fit-content;
          letter-spacing: 0.5px;
        }

        .level-1-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--warning);
          color: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .hospital-phone {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 20px;
          background: var(--accent);
          color: white;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(196, 30, 58, 0.3);
        }

        .phone-number {
          font-size: 22px;
          letter-spacing: 0.5px;
        }

        .hospital-phone:hover {
          background: var(--accent-hover);
          transform: scale(1.03);
          box-shadow: 0 6px 20px rgba(196, 30, 58, 0.4);
        }

        .hospital-address {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          padding: 8px 0;
        }

        .capabilities {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--border);
        }

        .capability-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .hospital-card {
            padding: 16px;
          }

          .hospital-name {
            font-size: 20px;
          }

          .phone-number {
            font-size: 20px;
          }

          .hospital-phone {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

