
import { Protocol } from '../types';

import { adminProtocolsList } from './library/admin';
import { cardiacProtocols } from './library/cardiac';
import { medicalProtocols } from './library/medical';
import { pediatricProtocols } from './library/pediatric';
import { pharmacologyProtocolsList } from './library/pharmacology';
import { policyProtocolsList } from './library/policies';
import { procedureProtocolsList } from './library/procedures/index';
import { traumaProtocols } from './library/trauma';
import { curriculumProtocolsList } from './library/curriculum';
import { bulkProtocols } from './library/bulk-protocols';

// New Content Categories
import { quickReferenceList } from './library/quick-reference';
import { clinicalPearlsList } from './library/clinical-pearls';
import { lacofdProtocolsList } from './library/lacofd';
import { strokeAssessmentProtocols } from './library/stroke-assessment';
import { equipmentProtocols } from './library/equipment';

// Detailed Series Imports
import { series100 } from './library/series-100';
import { series200 } from './library/series-200';
import { series300 } from './library/series-300';
import { series400 } from './library/series-400';
import { series500 } from './library/series-500';
import { series600 } from './library/series-600';
import { series700 } from './library/series-700';
import { series800 } from './library/series-800';
import { series900 } from './library/series-900';
import { series1000 } from './library/series-1000';
import { series1100 } from './library/series-1100';
import { series1300 } from './library/series-1300';
import { series1200 as series1200Complete } from './library/series-1200-complete';
import { calculations } from './library/calculations';

// Existing Detailed Protocols
// Order matters: Category-specific protocols (expanded versions) come FIRST,
// then series files, so expanded protocols take precedence over stubs
const detailedProtocols: Protocol[] = [
  // Category-specific expanded protocols FIRST (highest priority)
  ...cardiacProtocols,
  ...medicalProtocols,
  ...pediatricProtocols,
  ...traumaProtocols,
  ...procedureProtocolsList,
  ...pharmacologyProtocolsList,
  ...policyProtocolsList,
  ...adminProtocolsList,
  ...curriculumProtocolsList,
  ...calculations,
  // Series files second (stubs will be deduplicated if already present)
  ...series100,
  ...series200,
  ...series300,
  ...series400,
  ...series500,
  ...series600,
  ...series700,
  ...series800,
  ...series900,
  ...series1000,
  ...series1100,
  ...series1200Complete,
  ...series1300,
  // New Content Categories
  ...quickReferenceList,
  ...clinicalPearlsList,
  ...lacofdProtocolsList,
];

// Deduplication Logic: Prefer detailed protocols over bulk stubs
// Also deduplicate within detailedProtocols (first occurrence wins)
// For Pharmacology: also deduplicate by title to avoid MED-xxx and 1317.x duplicates
const uniqueDetailedIds = new Set<string>();
const uniquePharmaTitles = new Set<string>();
const uniqueDetailedProtocols: Protocol[] = [];

for (const p of detailedProtocols) {
  // For Pharmacology items, deduplicate by title (case-insensitive)
  if (p.category === 'Pharmacology') {
    const titleKey = p.title.toLowerCase().trim();
    if (uniquePharmaTitles.has(titleKey)) {
      continue; // Skip duplicate medication
    }
    uniquePharmaTitles.add(titleKey);
  }

  if (!uniqueDetailedIds.has(p.id)) {
    uniqueDetailedIds.add(p.id);
    uniqueDetailedProtocols.push(p);
  }
}

// Filter bulk protocols
const uniqueBulkProtocols = bulkProtocols.filter(p => !uniqueDetailedIds.has(p.id));

export const protocols: Protocol[] = [
  ...uniqueDetailedProtocols,
  ...uniqueBulkProtocols
];

export const getProtocolById = (id: string) => protocols.find(p => p.id === id);
export const getProtocolsByCategory = (category: string) => protocols.filter(p => p.category === category);
