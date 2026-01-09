import { Hospital, Capability } from '../data/hospitals';
import { FacilityFinderType } from '../types';

// Map facility finder types to hospital capabilities
const FACILITY_CAPABILITY_MAP: Record<FacilityFinderType, Capability[]> = {
  trauma: ['Trauma Level I', 'Trauma Level II'],
  pediatric: ['Pediatric Trauma', 'Pediatric Medical'],
  stemi: ['STEMI'],
  stroke: ['Stroke Comprehensive', 'Stroke Primary'],
  burn: ['Burn'],
  ecmo: ['ECMO'],
};

export interface HospitalWithDistance extends Hospital {
  distance?: number;
}

export function filterHospitalsByFacilityTypes(
  hospitals: Hospital[],
  facilityTypes: FacilityFinderType[]
): Hospital[] {
  const requiredCapabilities = facilityTypes.flatMap(
    type => FACILITY_CAPABILITY_MAP[type] || []
  );

  return hospitals.filter(hospital =>
    hospital.capabilities.some(cap => requiredCapabilities.includes(cap))
  );
}

export function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = (to.lat - from.lat) * (Math.PI / 180);
  const dLon = (to.lng - from.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * (Math.PI / 180)) * Math.cos(to.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 0.621371; // Convert km to miles
}

export function getNearestHospitals(
  hospitals: Hospital[],
  userLocation: { lat: number; lng: number },
  limit: number = 3
): HospitalWithDistance[] {
  return hospitals
    .filter(h => h.lat && h.lng)
    .map(h => ({
      ...h,
      distance: calculateDistance(userLocation, { lat: h.lat!, lng: h.lng! })
    }))
    .sort((a, b) => (a.distance || 999) - (b.distance || 999))
    .slice(0, limit);
}

export function getCapabilityColor(capability: Capability): string {
  if (capability.includes('Trauma')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  if (capability === 'STEMI') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (capability.includes('Stroke')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
  if (capability.includes('Pediatric')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  if (capability === 'Burn') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (capability === 'ECMO') return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
}
