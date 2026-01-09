import React from 'react';
import { Link } from 'react-router-dom';
import { hospitals } from '../data/hospitals';
import { FacilityFinderType } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  filterHospitalsByFacilityTypes,
  getNearestHospitals,
  getCapabilityColor,
  HospitalWithDistance
} from '../utils/hospitalUtils';

interface FacilityFinderProps {
  facilityTypes: FacilityFinderType[];
  title?: string;
  maxResults?: number;
  showMapLink?: boolean;
}

const getFacilityLabel = (types: FacilityFinderType[]): string => {
  if (types.includes('trauma')) return 'Trauma Centers';
  if (types.includes('pediatric')) return 'Pediatric Centers';
  if (types.includes('stemi')) return 'STEMI Centers';
  if (types.includes('stroke')) return 'Stroke Centers';
  if (types.includes('burn')) return 'Burn Centers';
  if (types.includes('ecmo')) return 'ECMO Centers';
  return 'Specialty Centers';
};

export const FacilityFinder: React.FC<FacilityFinderProps> = ({
  facilityTypes,
  title,
  maxResults = 3,
  showMapLink = true
}) => {
  const { location, error, isLoading } = useGeolocation();

  const filteredHospitals = filterHospitalsByFacilityTypes(hospitals, facilityTypes);

  const nearestFacilities: HospitalWithDistance[] = location
    ? getNearestHospitals(filteredHospitals, location, maxResults)
    : filteredHospitals.slice(0, maxResults);

  const displayTitle = title || `Nearest ${getFacilityLabel(facilityTypes)}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-5 mb-8">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-red-500">location_on</span>
        {displayTitle}
      </h3>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-6 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          <span className="text-sm">Getting your location...</span>
        </div>
      )}

      {/* Location Error */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm text-amber-800 dark:text-amber-200">
          <span className="material-symbols-outlined text-amber-600">location_off</span>
          {error}
        </div>
      )}

      {/* Facility Cards */}
      {!isLoading && (
        <div className="space-y-3">
          {nearestFacilities.map((hospital) => (
            <div
              key={hospital.id}
              className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {hospital.name}
                </h4>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hospital.capabilities
                    .filter(cap =>
                      facilityTypes.some(type => {
                        if (type === 'trauma') return cap.includes('Trauma');
                        if (type === 'pediatric') return cap.includes('Pediatric');
                        if (type === 'stemi') return cap === 'STEMI';
                        if (type === 'stroke') return cap.includes('Stroke');
                        if (type === 'burn') return cap === 'Burn';
                        if (type === 'ecmo') return cap === 'ECMO';
                        return false;
                      })
                    )
                    .slice(0, 2)
                    .map(cap => (
                      <span
                        key={cap}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getCapabilityColor(cap)}`}
                      >
                        {cap}
                      </span>
                    ))}
                </div>
                {hospital.distance !== undefined && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">directions_car</span>
                    {hospital.distance.toFixed(1)} mi away
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <a
                  href={`tel:${hospital.phone.replace(/\D/g, '')}`}
                  className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
                  title="Call"
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(hospital.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm"
                  title="Navigate"
                >
                  <span className="material-symbols-outlined text-lg">navigation</span>
                </a>
              </div>
            </div>
          ))}

          {nearestFacilities.length === 0 && (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
              No facilities found matching criteria
            </div>
          )}
        </div>
      )}

      {/* View All Link */}
      {showMapLink && nearestFacilities.length > 0 && (
        <Link
          to={`/hospitals?filter=${facilityTypes.join(',')}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          View All on Map
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      )}
    </div>
  );
};
