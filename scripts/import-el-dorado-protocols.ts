/**
 * El Dorado County EMS Protocol Import
 *
 * Downloads and imports El Dorado County EMS protocols from their website.
 * Processes PDFs from multiple categories and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-el-dorado-protocols.ts
 * Options:
 *   --dry-run     Preview what would be imported
 *   --skip-embed  Skip embedding generation (faster testing)
 *   --no-clear    Don't clear existing data first
 *   --download    Force re-download of PDFs
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { chunkProtocol } from '../server/_core/protocol-chunker';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const PDF_DIR = path.join(__dirname, '../data/el-dorado-protocols');
const AGENCY_NAME = 'El Dorado County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2026;
const BASE_URL = 'https://www.eldoradocounty.ca.gov';
const SOURCE_URL = 'https://www.eldoradocounty.ca.gov/Public-Safety-Justice/Emergency-Medical-Services/Policies-Procedures-Protocols-Drug-Formulary';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// PDF URLs by Category
// ============================================================================

const PDF_SOURCES: Record<string, { url: string; category: string }[]> = {
  'Prehospital Protocols': [
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/01_preface-2013.pdf', category: 'Preface' },
    // Cardiac
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/bradycardia.pdf', category: 'Cardiac' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/302-chest-discomfort.pdf', category: 'Cardiac' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/chf-pulmonary-edema-2019.pdf', category: 'Cardiac' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/17narrow-complex-tachycardia.pdf', category: 'Cardiac' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/pulseless-arrest.pdf', category: 'Cardiac' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/306-return-of-spontaneous-circulation-rosc.pdf', category: 'Cardiac' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/305-wide-complex-tachycardia.pdf', category: 'Cardiac' },
    // General
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/32-pain-management.pdf', category: 'General' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/110-shock.pdf', category: 'General' },
    // Medical
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/101-airway-obstruction.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/102-allergic-reaction.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/altered-level-of-conciousness-aloc.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/503-bites-stings-envenomation.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/16bronchospasm-copd.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/cold-exposures.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/drowning-event.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/13dystonic-reaction.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/14glycemic-emergencies.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/heat-illness.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/112-nausea-vomiting.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/poisoning-overdose-2019.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/29seizures.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/109-sepsis.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/severely-agitated-patient.pdf', category: 'Medical' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stroke.pdf', category: 'Medical' },
    // Trauma
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/burns.pdf', category: 'Trauma' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/12crush-syndrome-suspension-injuries.pdf', category: 'Trauma' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/30general-trauma.pdf', category: 'Trauma' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/15head-trauma.pdf', category: 'Trauma' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/31hemorrhage-control.pdf', category: 'Trauma' },
    // OB/GYN Pediatric
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/brief-resolved-unexplained-event.pdf', category: 'OB/GYN Pediatric' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/childbirth.pdf', category: 'OB/GYN Pediatric' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/neonatal-resuscitation.pdf', category: 'OB/GYN Pediatric' },
  ],
  'Field Policies': [
    { url: '/files/assets/county/v/5/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/901-als-unit-minimum-inventory.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/402-assessment-of-subjects-in-law-enforcement-custody.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/bls-medication-administration-2019.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/401-comprehensive-5150-guidelines.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/controlled-substance-2018.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/determination-of-death.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/dnr.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/ems-aircraft-2018.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/exposure-determination-treatment-and-reporting.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/fireline-medic.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/909-hospice-patients.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/inter-county-emt-paramedic-response-and-transport-2018.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/malfunctioning-aicd.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/management-of-preexisting-medical-intervention.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/403-management-of-taser-stun-device-patients.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/nerve-agent-exposure-2018.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/on-scene-photography-2018.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/pandemic-epidemic-influenza-and-influenza-like-illness-ili.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/918-patient-destination.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/physical-restraint-2018.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/physician-at-scene.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/prehospital-transfer-of-care-2018.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/913-refusal-of-care-or-transportation.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/914-reporting-of-suspected-abuse.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/routine-medical-care-2019.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/safely-surrendered-baby.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/spinal-immobilization-2019.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/917-stemi-destination.pdf', category: 'Field Policies' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/verification-of-advanced-airway-placement.pdf', category: 'Field Policies' },
  ],
  'Field Procedures': [
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/12-lead-ecg.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/automatic-external-defibrillator-aed-2018.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/cpap.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/etco2-monitoring.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/epinephrine-dilution.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/gastric-tube-insertion.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/intranasal-medication-administration.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/intraosseous-infusion-io.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/needle-chest-decompression.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/needle-cricothyroidotomy.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/810-orotracheal-intubation.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/821-sct-blood-transfusions.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/820-sct-infusions.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stomal-intubation-2018.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/supraglottic-airways.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/therapeutic-hypothermia-2019.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/tourniquet-for-hemorrhage-control.pdf', category: 'Field Procedures' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/transcutaneous-pacing.pdf', category: 'Field Procedures' },
  ],
  'Administrative Policies': [
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/el-dorado-county-ems-agency-documentation-policy-2025-final-10-1-2025.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/medical-transportation-ordinance.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/edcemsa-cqi-plan-2022.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/2/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/1101-documentation-policy-2025-10-1-2025.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/downgrade-or-closure-of-hospital-emergency-services-2017.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/ems-communications-2017.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/field-internship.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/epcr-mobile-device-platform-policy.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/ground-critical-care-transport-2017.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/litter-wheelchair-van-requirements-2017.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/part-time-als-service-2017.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/public-safety-aed-program-2017.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/1106-sct-provider-agency-requirements.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/1107-sct-transferring-hospital-requirements.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stemi-plan-2021.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stemi-recieving-center-2017.pdf', category: 'Administrative' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/use-of-another-lemsa-ppps-by-contractors-and-permittees-2017.pdf', category: 'Administrative' },
  ],
  'Drug Formulary': [
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/acetaminophen.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/activated-charcoal.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/adenosine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/albuterol.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/amiodarone_2.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/aspirin.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/atropine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/atrovent-duoneb.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/calcium-chloride.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dextrose10.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dextrose50.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/diphenhydramine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dopamine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/1013-epinephrine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/fentanyl.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/glucagon.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/glucose.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ibuprofen.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ketamine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/lactated-ringers.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/levalbuterol-tartrate.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/lidocaine_.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/lidocaine-jelly.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/magnesium-sulfate.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/midazolam-hydrochloride.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/morphine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/naloxone.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/neosynephrine.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/nitroglycerin.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/nitrous-oxide.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ondansetron.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/oxygen.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/sodium-bicarbonate.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/sodium-chloride.pdf', category: 'Drug Formulary' },
    { url: '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/tranexamic-acid.pdf', category: 'Drug Formulary' },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface ChunkInsert {
  agency_name: string;
  state_code: string;
  protocol_number: string;
  protocol_title: string;
  section: string | null;
  content: string;
  source_pdf_url: string;
  protocol_year: number;
  embedding?: number[];
}

// ============================================================================
// PDF DOWNLOAD
// ============================================================================

async function downloadPDF(urlPath: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const url = BASE_URL + urlPath;
    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(true);
            });
          }).on('error', () => {
            fs.unlink(destPath, () => {});
            resolve(false);
          });
        } else {
          resolve(false);
        }
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        resolve(false);
      }
    }).on('error', () => {
      fs.unlink(destPath, () => {});
      resolve(false);
    });
  });
}

async function downloadAllPDFs(forceDownload: boolean = false): Promise<Map<string, string>> {
  const urlToFile = new Map<string, string>();
  
  // Ensure directory exists
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }

  let totalPDFs = 0;
  for (const category of Object.keys(PDF_SOURCES)) {
    totalPDFs += PDF_SOURCES[category].length;
  }

  console.log(`\nDownloading ${totalPDFs} PDFs...`);
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [categoryName, pdfs] of Object.entries(PDF_SOURCES)) {
    for (const { url } of pdfs) {
      const filename = path.basename(url);
      const destPath = path.join(PDF_DIR, filename);
      
      urlToFile.set(url, destPath);

      if (!forceDownload && fs.existsSync(destPath)) {
        skipped++;
        continue;
      }

      process.stdout.write(`\r  Downloading: ${downloaded + skipped + failed + 1}/${totalPDFs}`);
      
      const success = await downloadPDF(url, destPath);
      if (success) {
        downloaded++;
      } else {
        failed++;
      }

      // Small delay to be nice to the server
      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log(`\n  Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
  return urlToFile;
}

// ============================================================================
// PROTOCOL EXTRACTION
// ============================================================================

/**
 * Extract protocol number from filename
 */
function extractProtocolNumber(filename: string): string {
  // Match number patterns like "302-", "101-", "1013-"
  const numMatch = filename.match(/^(\d+(?:-\d+)?)/);
  if (numMatch) {
    return numMatch[1];
  }
  
  // Use sanitized filename
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_\s]+/g, '-')
    .substring(0, 30);
}

/**
 * Extract protocol title from filename
 */
function extractProtocolTitle(filename: string): string {
  let title = filename
    .replace(/\.pdf$/i, '')
    .replace(/^\d+[-_\s]*/i, '') // Remove leading numbers
    .replace(/[-_]/g, ' ')
    .replace(/\s+\d{4}$/, '') // Remove year suffix
    .replace(/\s+/g, ' ')
    .trim();

  // Title case
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    console.warn('No VOYAGE_API_KEY - skipping embeddings');
    return texts.map(() => []);
  }

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: texts.map((t) => t.substring(0, 16000)),
      input_type: 'document',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Voyage API error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

// ============================================================================
// PDF PROCESSING
// ============================================================================

async function processPDF(filePath: string, urlPath: string, category: string): Promise<ChunkInsert[]> {
  const filename = path.basename(filePath);
  const protocolNumber = extractProtocolNumber(filename);
  const protocolTitle = extractProtocolTitle(filename);

  // Read and parse PDF
  const dataBuffer = fs.readFileSync(filePath);

  let text: string;
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const pdfData = await pdfParse(dataBuffer);
    text = pdfData.text;
  } catch (error: any) {
    return [];
  }

  // Clean text
  text = text
    .replace(/\f/g, '\n')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (text.length < 50) {
    return [];
  }

  // Chunk using existing protocol chunker
  const fullTitle = protocolTitle ? `${protocolNumber} - ${protocolTitle}` : protocolNumber;
  const chunks = chunkProtocol(text, protocolNumber, fullTitle);

  return chunks.map((chunk) => ({
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_number: protocolNumber,
    protocol_title: fullTitle,
    section: category,
    content: chunk.content,
    source_pdf_url: `${BASE_URL}${urlPath}`,
    protocol_year: PROTOCOL_YEAR,
  }));
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingChunks(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .eq('agency_name', AGENCY_NAME)
    .select('id');

  if (error) {
    console.error('Error clearing existing data:', error.message);
    return 0;
  }
  return data?.length || 0;
}

async function insertChunks(
  chunks: ChunkInsert[]
): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { error } = await supabase.from('manus_protocol_chunks').insert(batch);

    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize)}: ${error.message}`);
      // Try individual inserts
      for (const chunk of batch) {
        const { error: singleError } = await supabase
          .from('manus_protocol_chunks')
          .insert(chunk);

        if (!singleError) {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
    }

    const pct = Math.round(((i + batch.length) / chunks.length) * 100);
    process.stdout.write(`\r  Inserting: ${pct}% (${inserted} rows)`);
  }

  console.log();
  return { inserted, errors };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('EL DORADO COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`PDF Directory: ${PDF_DIR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');
  const noClear = process.argv.includes('--no-clear');
  const forceDownload = process.argv.includes('--download');

  // Download PDFs
  const urlToFile = await downloadAllPDFs(forceDownload);

  // Clear existing data
  if (!noClear && !dryRun) {
    console.log('\nClearing existing El Dorado County data...');
    const deleted = await clearExistingChunks();
    console.log(`  Deleted ${deleted} existing chunks\n`);
  }

  // Process all PDFs
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  const failedFiles: string[] = [];
  const protocolCounts = new Map<string, number>();

  let processed = 0;
  const totalPDFs = urlToFile.size;

  for (const [categoryName, pdfs] of Object.entries(PDF_SOURCES)) {
    for (const { url, category } of pdfs) {
      const filePath = urlToFile.get(url);
      if (!filePath || !fs.existsSync(filePath)) {
        failedFiles.push(url);
        continue;
      }

      const chunks = await processPDF(filePath, url, category);
      if (chunks.length === 0) {
        failedFiles.push(url);
      } else {
        allChunks.push(...chunks);
        protocolCounts.set(category, (protocolCounts.get(category) || 0) + 1);
      }

      processed++;
      process.stdout.write(`\r  Processing: ${processed}/${totalPDFs}`);
    }
  }

  console.log('\n');
  console.log(`Total chunks: ${allChunks.length}`);
  console.log(`Failed files: ${failedFiles.length}`);
  console.log('\nProtocols by category:');
  for (const [cat, count] of protocolCounts.entries()) {
    console.log(`  ${cat}: ${count}`);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Would insert chunks to database');
    return;
  }

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY) {
    console.log('\nGenerating embeddings...');
    const batchSize = 20;
    let embeddingCount = 0;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const texts = batch.map((c) => `${c.protocol_title}\n${c.content}`);

      try {
        const embeddings = await generateEmbeddingsBatch(texts);
        for (let j = 0; j < batch.length; j++) {
          batch[j].embedding = embeddings[j];
          embeddingCount++;
        }
      } catch (error: any) {
        console.error(`\n  Embedding error at batch ${Math.floor(i / batchSize)}: ${error.message}`);
      }

      const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
      process.stdout.write(`\r  Embeddings: ${pct}% (${embeddingCount}/${allChunks.length})`);

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    }
    console.log();
  }

  // Insert into database
  console.log('\nInserting into database...');
  const { inserted, errors } = await insertChunks(allChunks);

  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`Total PDFs processed: ${processed}`);
  console.log(`Total chunks created: ${allChunks.length}`);
  console.log(`Chunks inserted: ${inserted}`);
  console.log(`Failed files: ${failedFiles.length}`);

  if (errors.length > 0) {
    console.log(`\nDatabase errors: ${errors.length}`);
    errors.slice(0, 5).forEach((e) => console.log(`  - ${e}`));
  }

  if (failedFiles.length > 0) {
    console.log('\nFailed files:');
    failedFiles.slice(0, 10).forEach((f) => console.log(`  - ${f}`));
  }
}

main().catch(console.error);
