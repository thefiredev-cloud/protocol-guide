import React, { useState, useEffect, useRef } from 'react';
import { hospitals, Capability, Hospital } from '../data/hospitals';
import { IconHospital, renderIcon } from '../components/Icons';

type FilterType = 'All' | 'Trauma' | 'MAR' | 'STEMI' | 'Stroke' | 'Peds' | 'ECMO';
type ViewMode = 'list' | 'map';

const filters: { value: FilterType; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Trauma', label: 'Trauma' },
  { value: 'STEMI', label: 'STEMI' },
  { value: 'Stroke', label: 'Stroke' },
  { value: 'Peds', label: 'Pediatric' },
  { value: 'ECMO', label: 'ECMO' },
];

interface HospitalWithDistance extends Hospital {
  distance?: number;
}

// Global declaration for Leaflet (loaded via CDN)
declare global {
  interface Window {
    L: any;
  }
}

const Hospitals: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sortedHospitals, setSortedHospitals] = useState<HospitalWithDistance[]>(hospitals);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Map Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location access denied or unavailable:", error);
          setLocationError("Enable location for distance sorting.");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!userLocation) {
        setSortedHospitals(hospitals);
        return;
    }

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      const d = R * c; // Distance in km
      return d * 0.621371; // Convert to miles
    };

    const withDist = hospitals.map((h): HospitalWithDistance => {
        if (h.lat && h.lng) {
            return { ...h, distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng) };
        }
        return h;
    }).sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return a.name.localeCompare(b.name);
    });

    setSortedHospitals(withDist);
  }, [userLocation]);

  const getFilteredHospitals = () => {
    return sortedHospitals.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                            h.address.toLowerCase().includes(search.toLowerCase());
      
      let matchesFilter = true;
      if (activeFilter === 'Trauma') {
        matchesFilter = h.capabilities.some(c => c.includes('Trauma Level'));
      } else if (activeFilter === 'STEMI') {
        matchesFilter = h.capabilities.includes('STEMI');
      } else if (activeFilter === 'Stroke') {
        matchesFilter = h.capabilities.some(c => c.includes('Stroke'));
      } else if (activeFilter === 'Peds') {
        matchesFilter = h.capabilities.some(c => c.includes('Pediatric'));
      } else if (activeFilter === 'ECMO') {
        matchesFilter = h.capabilities.includes('ECMO');
      }

      return matchesSearch && matchesFilter;
    });
  };

  const filtered = getFilteredHospitals();

  // --- Map Logic ---

  const getPinColor = (h: Hospital) => {
    // Priority logic for pin color
    if (h.capabilities.some(c => c.includes('Trauma Level I'))) return 'bg-orange-600 border-orange-200';
    if (h.capabilities.some(c => c.includes('Trauma Level II'))) return 'bg-orange-500 border-orange-200';
    if (h.capabilities.includes('STEMI')) return 'bg-red-600 border-red-200';
    if (h.capabilities.includes('Stroke Comprehensive')) return 'bg-indigo-600 border-indigo-200';
    if (h.capabilities.some(c => c.includes('Pediatric'))) return 'bg-purple-600 border-purple-200';
    if (h.capabilities.includes('Burn')) return 'bg-yellow-500 border-yellow-200';
    return 'bg-blue-500 border-blue-200';
  };

  const getPinIcon = (h: Hospital) => {
    // Priority logic for pin icon
    if (h.capabilities.some(c => c.includes('Trauma'))) return 'personal_injury';
    if (h.capabilities.includes('STEMI')) return 'ecg_heart';
    if (h.capabilities.some(c => c.includes('Stroke'))) return 'neurology';
    if (h.capabilities.some(c => c.includes('Pediatric'))) return 'child_care';
    if (h.capabilities.includes('Burn')) return 'local_fire_department';
    return 'local_hospital';
  };

  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && window.L) {
        if (!mapInstanceRef.current) {
            const L = window.L;
            const map = L.map(mapRef.current).setView([34.0522, -118.2437], 10);
            
            // Using CartoDB Voyager tiles for a clean look
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            mapInstanceRef.current = map;
            markersLayerRef.current = L.layerGroup().addTo(map);
        }

        // Update markers
        const L = window.L;
        const layer = markersLayerRef.current;
        layer.clearLayers();

        const bounds = L.latLngBounds([]);

        filtered.forEach(h => {
            if (h.lat && h.lng) {
                const colorClass = getPinColor(h);
                const iconName = getPinIcon(h);
                
                // Custom Div Icon
                const customIcon = L.divIcon({
                    className: 'custom-map-marker',
                    html: `<div class="w-8 h-8 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-lg text-white transform -translate-x-1/2 -translate-y-1/2">
                             <span class="material-symbols-outlined text-[18px]">${iconName}</span>
                           </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                });

                const marker = L.marker([h.lat, h.lng], { icon: customIcon })
                    .bindPopup(`
                        <div class="p-3 font-sans">
                            <h3 class="font-bold text-sm text-slate-900 mb-1">${h.name}</h3>
                            <p class="text-xs text-slate-500 mb-2">${h.address}</p>
                            <a href="https://maps.google.com/?q=${encodeURIComponent(h.address)}" target="_blank" class="block w-full text-center bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors">
                                Navigate
                            </a>
                        </div>
                    `);
                
                layer.addLayer(marker);
                bounds.extend([h.lat, h.lng]);
            }
        });

        // Add user location marker if available
        if (userLocation) {
             const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: `<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg relative">
                        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                       </div>`,
                iconSize: [16, 16]
             });
             L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(layer);
             bounds.extend([userLocation.lat, userLocation.lng]);
        }

        if (filtered.length > 0) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }
  }, [viewMode, filtered, userLocation]);


  // Helper for filters and cards
  const getBadgeColor = (cap: Capability) => {
    if (cap.includes('Trauma Level I')) return 'bg-orange-600 text-white shadow-sm shadow-orange-200 dark:shadow-none';
    if (cap.includes('Trauma')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (cap === 'STEMI') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (cap.includes('Stroke Comprehensive')) return 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none';
    if (cap.includes('Stroke')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    if (cap.includes('Pediatric Trauma')) return 'bg-purple-600 text-white shadow-sm shadow-purple-200 dark:shadow-none';
    if (cap.includes('Pediatric Medical')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    if (cap === 'EDAP') return 'bg-purple-50 text-purple-600 dark:bg-purple-900/10 dark:text-purple-300';
    if (cap === 'ECMO') return 'bg-teal-600 text-white shadow-sm shadow-teal-200 dark:shadow-none';
    if (cap === 'Burn') return 'bg-yellow-500 text-white shadow-sm shadow-yellow-200 dark:shadow-none';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  const getBadges = (h: Hospital) => {
    return h.capabilities.map(cap => (
      <span key={cap} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${getBadgeColor(cap)}`}>
        {cap.replace('Level ', '').replace('Comprehensive', 'Comp').replace('Primary', 'Pri')}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-24 transition-colors duration-200 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-safe-top z-30 shrink-0">
         <div className="px-5 py-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hospitals</h1>
                    {userLocation && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Location Active</span>
                        </div>
                    )}
                </div>
                
                {/* View Toggle */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                            viewMode === 'list' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">list</span>
                        List
                    </button>
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                            viewMode === 'map' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">map</span>
                        Map
                    </button>
                </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search hospitals..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
               {filters.map(f => (
                 <button
                    key={f.value}
                    onClick={() => setActiveFilter(f.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                        activeFilter === f.value
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                 >
                    {f.label}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
         
         {/* Map View */}
         <div className={`absolute inset-0 z-10 transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div ref={mapRef} className="w-full h-full bg-slate-200 dark:bg-slate-800"></div>
            {/* Map Legend Overlay */}
            <div className="absolute bottom-6 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-[1000] flex gap-3 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Trauma</span></div>
                <div className="flex items-center gap-1.5 shrink-0"><div className="w-3 h-3 rounded-full bg-red-600"></div><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">STEMI</span></div>
                <div className="flex items-center gap-1.5 shrink-0"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Stroke</span></div>
                <div className="flex items-center gap-1.5 shrink-0"><div className="w-3 h-3 rounded-full bg-purple-600"></div><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Peds</span></div>
                <div className="flex items-center gap-1.5 shrink-0"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">General</span></div>
            </div>
         </div>

         {/* List View */}
         <div className={`absolute inset-0 z-0 overflow-y-auto pb-24 transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="px-5 py-6 max-w-3xl mx-auto space-y-4">
                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-slate-400">local_hospital</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No hospitals found</h3>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}

                {filtered.map(hospital => (
                <div key={hospital.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all group">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 pr-4">{hospital.name}</h3>
                                {hospital.distance !== undefined && (
                                    <div className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-[14px]">distance</span>
                                        <span className="text-xs font-bold">{hospital.distance.toFixed(1)} mi</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
                            {getBadges(hospital)}
                            </div>
                            <div className="flex flex-col gap-1.5">
                            <a 
                                href={`https://maps.google.com/?q=${encodeURIComponent(hospital.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors w-fit"
                            >
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                {hospital.address}
                            </a>
                            <a 
                                href={`tel:${hospital.phone.replace(/\D/g,'')}`}
                                className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors w-fit"
                            >
                                <span className="material-symbols-outlined text-[16px]">call</span>
                                {hospital.phone}
                            </a>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-600 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px]">arrow_outward</span>
                        </div>
                    </div>
                </div>
                ))}
                
                {!userLocation && !locationError && (
                    <div className="text-center py-4">
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                            Acquiring location...
                        </p>
                    </div>
                )}
                {locationError && (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                            <span className="material-symbols-outlined text-amber-500 text-[16px]">location_off</span>
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">{locationError}</p>
                        </div>
                    </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Hospitals;