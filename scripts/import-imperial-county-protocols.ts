/**
 * Imperial County EMS Protocol Import
 *
 * Downloads Imperial County EMS protocols from icphd.org,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-imperial-county-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'Imperial County EMS Agency';
const STATE_CODE = 'CA';
const STATE_NAME = 'California';
const PROTOCOL_YEAR = 2025;

const DATA_DIR = 'data/imperial-protocols';
const BASE_URL = 'https://www.icphd.org';

// All Imperial County EMS Protocol PDFs from the policies page
const PDF_SOURCES = [
  // Administrative Policies (1000 series)
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1000-Policy-and-Protocol-Approval-Process-7.25.pdf', number: '1000', title: 'Policy and Protocol Approval Process', section: 'Administrative' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1100-Quality-Assurance-Improvement.pdf', number: '1100', title: 'Quality Assurance Improvement', section: 'Administrative' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1200-EMS-Incident-Reports.pdf', number: '1200', title: 'EMS Incident Reports', section: 'Administrative' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1300-Base-Hospital-Designation.pdf', number: '1300', title: 'Base Hospital Designation', section: 'Administrative' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1400-Certification-Review-Process.pdf', number: '1400', title: 'Certification Review Process', section: 'Administrative' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1500A-Paper-PCR-Form-7.25.pdf', number: '1500A', title: 'Paper PCR Form', section: 'Administrative' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1500B-Triage-Report-Form-7.25.pdf', number: '1500B', title: 'Triage Report Form', section: 'Administrative' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1500-Patient-Care-Record-7.25.pdf', number: '1500', title: 'Patient Care Record', section: 'Administrative' },
  
  // Provider Requirements (1600 series)
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1610-Requirements-for-Ground-Ambulance-Service-Providers-7.25.pdf', number: '1610', title: 'Requirements for Ground Ambulance Service Providers', section: 'Provider Requirements' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1620-BLS-Service-Provider-Requirements-7.25.pdf', number: '1620', title: 'BLS Service Provider Requirements', section: 'Provider Requirements' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1630-ALS-Service-Provider-Requirements-7.25.pdf', number: '1630', title: 'ALS Service Provider Requirements', section: 'Provider Requirements' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1640-CCT-Service-Provider-Requirements-7.25.pdf', number: '1640', title: 'CCT Service Provider Requirements', section: 'Provider Requirements' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/1650-Air-Ambulance-Service-Provider-Requirements-7.25.pdf', number: '1650', title: 'Air Ambulance Service Provider Requirements', section: 'Provider Requirements' },
  
  // Epinephrine & Naloxone Programs (1700-1900 series)
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1700A-Application-for-School-Epinephrine-Auto-Injector-Program.pdf', number: '1700A', title: 'Application for School Epinephrine Auto-Injector Program', section: 'Public Safety Programs' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1700B-Epinephrine-Auto-Injector-Incident-Report-Form.pdf', number: '1700B', title: 'Epinephrine Auto-Injector Incident Report Form', section: 'Public Safety Programs' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1700-Epinephrine-Auto-Injectors-for-Schools.pdf', number: '1700', title: 'Epinephrine Auto-Injectors for Schools', section: 'Public Safety Programs' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1800A-Naloxone-Application-for-Agencies.pdf', number: '1800A', title: 'Naloxone Application for Agencies', section: 'Public Safety Programs' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1800B-Naloxone-Administration-Report.pdf', number: '1800B', title: 'Naloxone Administration Report', section: 'Public Safety Programs' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1800-Intranasal-Naloxone-by-Public-Safety-First-Responders.pdf', number: '1800', title: 'Intranasal Naloxone by Public Safety First Responders', section: 'Public Safety Programs' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/1900-Imperial-County-Base-Hospital-Incident-Reports.pdf', number: '1900', title: 'Imperial County Base Hospital Incident Reports', section: 'Administrative' },
  
  // EMT Certification (2000 series)
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/2100A-EMT-Skill-Verification-Approved-Signatures.pdf', number: '2100A', title: 'EMT Skill Verification Approved Signatures', section: 'Certification' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/2100-EMT-Certification-Recertification.pdf', number: '2100', title: 'EMT Certification Recertification', section: 'Certification' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/2110-EMT-Basic-Scope-of-Practice.pdf', number: '2110', title: 'EMT Basic Scope of Practice', section: 'Scope of Practice' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/2200-EMT-Optional-Skill-Accreditation.pdf', number: '2200', title: 'EMT Optional Skill Accreditation', section: 'Certification' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/2300-AEMT-Certification-Process.pdf', number: '2300', title: 'AEMT Certification Process', section: 'Certification' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/2310-AEMT-Scope-in-Imperial-County.pdf', number: '2310', title: 'AEMT Scope in Imperial County', section: 'Scope of Practice' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/2400-EMTP-Accreditation-7.25.pdf', number: '2400', title: 'EMTP Accreditation', section: 'Certification' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/2401-Paramedic-Disciplinary-Process.pdf', number: '2401', title: 'Paramedic Disciplinary Process', section: 'Certification' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/2410-Paramedic-Scope-in-Imperial-County.pdf', number: '2410', title: 'Paramedic Scope in Imperial County', section: 'Scope of Practice' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/2500-MICN-Authorization.pdf', number: '2500', title: 'MICN Authorization', section: 'Certification' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/2600-Out-of-County-EMT-P-Internship-7.25.pdf', number: '2600', title: 'Out of County EMT-P Internship', section: 'Certification' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/2700-Out-of-County-EMT-7.25.pdf', number: '2700', title: 'Out of County EMT', section: 'Certification' },
  
  // Training Programs (3000 series)
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/3000-EMT-Training-Program-Approval.pdf', number: '3000', title: 'EMT Training Program Approval', section: 'Training' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/3010A-EMS-Training-Program-Application.pdf', number: '3010A', title: 'EMS Training Program Application', section: 'Training' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/3010B-EMS-Course-Notification.pdf', number: '3010B', title: 'EMS Course Notification', section: 'Training' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/3010-Paramedic-Training-Program-Approval.pdf', number: '3010', title: 'Paramedic Training Program Approval', section: 'Training' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/3100-Continuing-Education-Provider-Approval.pdf', number: '3100', title: 'Continuing Education Provider Approval', section: 'Training' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/3110-Continuing-Education-for-EMS-Personnel-7.25.pdf', number: '3110', title: 'Continuing Education for EMS Personnel', section: 'Training' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/3120-CE-Provider-Application-7.25.pdf', number: '3120', title: 'CE Provider Application', section: 'Training' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/3200-Public-Safety-First-Aid-CPR-Education-Training-Program.pdf', number: '3200', title: 'Public Safety First Aid CPR Education Training Program', section: 'Training' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/3300-Supraglottic-Airway-Training-Program-and-Eligibility.pdf', number: '3300', title: 'Supraglottic Airway Training Program and Eligibility', section: 'Training' },
  
  // Operational Policies (4000 series)
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4000-Supply-and-Resupply-of-EMS-Agencies.pdf', number: '4000', title: 'Supply and Resupply of EMS Agencies', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/4005A-Waiver-Request-Form-7.25.pdf', number: '4005A', title: 'Waiver Request Form', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/4005-BLS-LALS-ALS-Unit-Inventory-7.25.pdf', number: '4005', title: 'BLS LALS ALS Unit Inventory', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4010-Management-of-Controlled-Drugs.pdf', number: '4010', title: 'Management of Controlled Drugs', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/4020-Base-Hospital-Contact-7.25.pdf', number: '4020', title: 'Base Hospital Contact', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/4030-Intentional-Deviation-From-Protocol-7.25.pdf', number: '4030', title: 'Intentional Deviation From Protocol', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4040-Receiving-Facility-Contact.pdf', number: '4040', title: 'Receiving Facility Contact', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4050-Hospital-Diversion.pdf', number: '4050', title: 'Hospital Diversion', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4060-Physician-on-Scene-with-Attachment.pdf', number: '4060', title: 'Physician on Scene', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4070-Patient-Contact.pdf', number: '4070', title: 'Patient Contact', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4080-Patient-Refusal.pdf', number: '4080', title: 'Patient Refusal', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4090-Non-Transport.pdf', number: '4090', title: 'Non-Transport', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4100-Determination-of-Death-in-the-Field.pdf', number: '4100', title: 'Determination of Death in the Field', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/4110-Termination-of-Resuscitation-7.25.pdf', number: '4110', title: 'Termination of Resuscitation', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4120A-DNAR-and-POLST-Attachments.pdf', number: '4120A', title: 'DNAR and POLST Attachments', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4120-DNAR.pdf', number: '4120', title: 'DNAR', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4130-Triage-to-Appropriate-Facility.pdf', number: '4130', title: 'Triage to Appropriate Facility', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4140-First-Responder-Naloxone.pdf', number: '4140', title: 'First Responder Naloxone', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4150-Patient-Restraints.pdf', number: '4150', title: 'Patient Restraints', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4160-Lay-Rescuer-AED-Service-Provider.pdf', number: '4160', title: 'Lay Rescuer AED Service Provider', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/4170-APOD-policy-7.25.pdf', number: '4170', title: 'APOD Policy', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4180-Requests-for-En-Route-Rendezvous-with-LALS-ALS-Ambulance.pdf', number: '4180', title: 'Requests for En Route Rendezvous with LALS ALS Ambulance', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4190-Fireline-Paramedic.pdf', number: '4190', title: 'Fireline Paramedic', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4200-Prehospital-Burn-Triage-Criteria.pdf', number: '4200', title: 'Prehospital Burn Triage Criteria', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/4210-Trauma-Triage-Criteria-7.25.pdf', number: '4210', title: 'Trauma Triage Criteria', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/4220-ReddiNet-Policy-7.25.pdf', number: '4220', title: 'ReddiNet Policy', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4230-Language-Policy.pdf', number: '4230', title: 'Language Policy', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/4240-Air-Ambulance-Activation-7.25.pdf', number: '4240', title: 'Air Ambulance Activation', section: 'Operational' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/4250-ALS-to-BLS-Downgrades-7.25.pdf', number: '4250', title: 'ALS to BLS Downgrades', section: 'Operational' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/4300-Quality-Assurance-in-Imperial-County.pdf', number: '4300', title: 'Quality Assurance in Imperial County', section: 'Operational' },
  
  // Clinical Procedures (7000 series)
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/7000-Airway-Management-7.25.pdf', number: '7000', title: 'Airway Management', section: 'Clinical Procedures' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/7010-BVM-Management-7.25.pdf', number: '7010', title: 'BVM Management', section: 'Clinical Procedures' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/7020-Continuous-Capnography-7.25.pdf', number: '7020', title: 'Continuous Capnography', section: 'Clinical Procedures' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/7030-iGel-Supraglottic-Device-Insertion-7.25.pdf', number: '7030', title: 'iGel Supraglottic Device Insertion', section: 'Clinical Procedures' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/7040-NIPPV-7.25.pdf', number: '7040', title: 'NIPPV', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7050-Administration-of-ET-Medications.pdf', number: '7050', title: 'Administration of ET Medications', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7060-Push-Dose-Epinephrine.pdf', number: '7060', title: 'Push Dose Epinephrine', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7070-Spinal-Motion-Restriction.pdf', number: '7070', title: 'Spinal Motion Restriction', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7080-Pre-Existing-Vascular-Access-Device-PVAD.pdf', number: '7080', title: 'Pre-Existing Vascular Access Device PVAD', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7090-Intraosseous-Infusion.pdf', number: '7090', title: 'Intraosseous Infusion', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7100-External-Jugular-Vein-Cannulation.pdf', number: '7100', title: 'External Jugular Vein Cannulation', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7110-Defibrillation.pdf', number: '7110', title: 'Defibrillation', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7120-Needle-Thoracostomy.pdf', number: '7120', title: 'Needle Thoracostomy', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7130-Antibiotic-Continuation.pdf', number: '7130', title: 'Antibiotic Continuation', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7140-Cyanide-Toxicity-Treatment.pdf', number: '7140', title: 'Cyanide Toxicity Treatment', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7150-TXA-Administration.pdf', number: '7150', title: 'TXA Administration', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7160-Hemorrhage-Control.pdf', number: '7160', title: 'Hemorrhage Control', section: 'Clinical Procedures' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/7170-CPR-7.25.pdf', number: '7170', title: 'CPR', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/7180-Monitoring-Chest-Tubes.pdf', number: '7180', title: 'Monitoring Chest Tubes', section: 'Clinical Procedures' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/Imperial-County-EMS-Policies/7190-International-Port-of-Entry-Patient-Management.pdf', number: '7190', title: 'International Port of Entry Patient Management', section: 'Clinical Procedures' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/7200-Mechanical-CPR-Device-7.25.pdf', number: '7200', title: 'Mechanical CPR Device', section: 'Clinical Procedures' },
  
  // Trauma System (8000 series)
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/8100-Injury-Prevention-Programs.pdf', number: '8100', title: 'Injury Prevention Programs', section: 'Trauma System' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/8200-Trauma-Provider-Marketing-and-Advertising.pdf', number: '8200', title: 'Trauma Provider Marketing and Advertising', section: 'Trauma System' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/8300-Repatriation-of-Stable-Trauma-Patient.pdf', number: '8300', title: 'Repatriation of Stable Trauma Patient', section: 'Trauma System' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/8500-Trauma-System-Quality-Improvement.pdf', number: '8500', title: 'Trauma System Quality Improvement', section: 'Trauma System' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/8900-Collection-and-Management-of-Data.pdf', number: '8900', title: 'Collection and Management of Data', section: 'Trauma System' },
  
  // Treatment Protocols (9000 series)
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9000-Universal-Protocol.pdf', number: '9000', title: 'Universal Protocol', section: 'Treatment Protocols' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9010-Abdominal-Pain-Adult.pdf', number: '9010', title: 'Abdominal Pain Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9010P-Abdominal-Pain-Pediatric.pdf', number: '9010P', title: 'Abdominal Pain Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9020-Airway-Obstruction-Adult-7.25.pdf', number: '9020', title: 'Airway Obstruction Adult', section: 'Treatment Protocols - Airway' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9020P-Airway-Obstruction-Pediatric-7.25.pdf', number: '9020P', title: 'Airway Obstruction Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9030-Altered-Mental-Status-Adult-7.25.pdf', number: '9030', title: 'Altered Mental Status Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9030P-Altered-Mental-Status-Pediatric-7.25.pdf', number: '9030P', title: 'Altered Mental Status Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9040-Anaphylaxis-Allergic-Reaction-Adult-7.25.pdf', number: '9040', title: 'Anaphylaxis Allergic Reaction Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9040P-Anaphylaxis-Allergic-Reaction-Pediatric-7.25.pdf', number: '9040P', title: 'Anaphylaxis Allergic Reaction Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9050-Behavioral-Emergencies-Adult.pdf', number: '9050', title: 'Behavioral Emergencies Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9050P-Behavioral-Emergencies-Pediatric-7.25.pdf', number: '9050P', title: 'Behavioral Emergencies Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9060-Burns-Adult-7.25.pdf', number: '9060', title: 'Burns Adult', section: 'Treatment Protocols - Trauma' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9060P-Burns-Pediatric-7.25.pdf', number: '9060P', title: 'Burns Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/9070-Cardiac-Arrest-Non-Traumatic-Adult-7.25.pdf', number: '9070', title: 'Cardiac Arrest Non-Traumatic Adult', section: 'Treatment Protocols - Cardiac' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/More/9070P-Cardiac-Arrest-Non-Traumatic-Pediatric-7.25.pdf', number: '9070P', title: 'Cardiac Arrest Non-Traumatic Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9080-Chest-Pain-Suspected-Cardiac-Adult-7.25.pdf', number: '9080', title: 'Chest Pain Suspected Cardiac Adult', section: 'Treatment Protocols - Cardiac' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9080P-Chest-Pain-Pediatric-7.25.pdf', number: '9080P', title: 'Chest Pain Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9090-Drowning-Near-Drowning-Adult-7.25.pdf', number: '9090', title: 'Drowning Near Drowning Adult', section: 'Treatment Protocols - Environmental' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9090P-Drowning-Near-Drowning-Pediatric-7.25.pdf', number: '9090P', title: 'Drowning Near Drowning Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9100-Dysrhythmias-Adult-7.25.pdf', number: '9100', title: 'Dysrhythmias Adult', section: 'Treatment Protocols - Cardiac' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/New-Updates/9100P-Dysrhythmias-Pediatric-7.25.pdf', number: '9100P', title: 'Dysrhythmias Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9110-Frostbite-Hypothermia-Adult-7.25.pdf', number: '9110', title: 'Frostbite Hypothermia Adult', section: 'Treatment Protocols - Environmental' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9110P-Frostbite-Hypothermia-Pediatric-7.25.pdf', number: '9110P', title: 'Frostbite Hypothermia Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9120-Heat-Exhaustion-Heat-Stroke-Adult-7.25.pdf', number: '9120', title: 'Heat Exhaustion Heat Stroke Adult', section: 'Treatment Protocols - Environmental' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9120P-Heat-Exhaustion-Heat-Stroke-Pediatric-7.25.pdf', number: '9120P', title: 'Heat Exhaustion Heat Stroke Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9130A-Hemodialysis-Adult-7.25.pdf', number: '9130', title: 'Hemodialysis Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9130P-Hemodialysis-Pediatric-7.25.pdf', number: '9130P', title: 'Hemodialysis Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/New-Updates/9140-Obstetrical-Emergencies-7.25-1.pdf', number: '9140', title: 'Obstetrical Emergencies', section: 'Treatment Protocols - OB/GYN' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9150A-Pain-Management-Adult-7.25.pdf', number: '9150', title: 'Pain Management Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9150P-Pain-Management-Pediatric-7.25.pdf', number: '9150P', title: 'Pain Management Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9160A-Poisoning-Adult-7.25.pdf', number: '9160', title: 'Poisoning Adult', section: 'Treatment Protocols - Toxicology' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9160P-Poisoning-Pediatric-7.25.pdf', number: '9160P', title: 'Poisoning Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/9170A-Respiratory-Distress-Adult-11.25.pdf', number: '9170', title: 'Respiratory Distress Adult', section: 'Treatment Protocols - Respiratory' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/9170P-Respiratory-Distress-Pediatric-11.25.pdf', number: '9170P', title: 'Respiratory Distress Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9180-Seizures-Adult-7.25.pdf', number: '9180', title: 'Seizures Adult', section: 'Treatment Protocols - Neurological' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9180P-Seizure-Pediatric-7.25.pdf', number: '9180P', title: 'Seizure Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9190-Sexual-Assault.pdf', number: '9190', title: 'Sexual Assault', section: 'Treatment Protocols - Special Situations' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9200A-Shock-Adult-7.25.pdf', number: '9200', title: 'Shock Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9210-SIRS-Adult.pdf', number: '9210', title: 'SIRS Adult', section: 'Treatment Protocols - Medical' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9210-SIRS-Pediatric.pdf', number: '9210P', title: 'SIRS Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Emergency-Medical-Services/EMS-Policies-Protocols-Procedures-Foms/New-Updates-6.28.24/9220A-Stroke-Adult.pdf', number: '9220', title: 'Stroke Adult', section: 'Treatment Protocols - Neurological' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9220P-Stroke-Pediatric-7.25.pdf', number: '9220P', title: 'Stroke Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9230A-Trauma-Adult-7.25.pdf', number: '9230', title: 'Trauma Adult', section: 'Treatment Protocols - Trauma' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9230P-Trauma-Pediatric-7.25.pdf', number: '9230P', title: 'Trauma Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9240A-Traumatic-Cardiac-Arrest-Adult-7.25.pdf', number: '9240', title: 'Traumatic Cardiac Arrest Adult', section: 'Treatment Protocols - Trauma' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9240P-Traumatic-Cardiac-Arrest-Pediatric-7.25.pdf', number: '9240P', title: 'Traumatic Cardiac Arrest Pediatric', section: 'Treatment Protocols - Pediatric' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/9250-Post-ROSC-Protocol-Adult-7.25.pdf', number: '9250', title: 'Post ROSC Protocol Adult', section: 'Treatment Protocols - Cardiac' },
  { url: '/assets/Community-Health-Division/Emergency-Medical-Services/Forms-July-1-2025/Pediatric-Dosing-Chart-7.25.pdf', number: 'REF-001', title: 'Pediatric Dosing Chart', section: 'Reference Materials' },
];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface ChunkInsert {
  agency_name: string;
  state_code: string;
  state_name: string;
  protocol_number: string;
  protocol_title: string;
  section: string | null;
  content: string;
  source_pdf_url: string;
  protocol_year: number;
  embedding?: number[];
}

// ============================================================================
// DOWNLOAD FUNCTIONS
// ============================================================================

async function downloadPDF(url: string, filename: string): Promise<boolean> {
  const filepath = path.join(DATA_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    if (stats.size > 1000) {
      console.log(`  Already exists: ${filename}`);
      return true;
    }
    fs.unlinkSync(filepath);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.icphd.org/',
      },
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${filename}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log(`  Downloaded: ${filename} (${Math.round(buffer.byteLength / 1024)}KB)`);
    return true;
  } catch (err: any) {
    console.error(`  Error downloading ${filename}: ${err.message}`);
    return false;
  }
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return { text: result.text, numPages: result.numpages };
}

// ============================================================================
// CHUNKING
// ============================================================================

function chunkText(text: string, maxChunkSize: number = 1500): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const cleanPara = para.replace(/\s+/g, ' ').trim();
    if (!cleanPara || cleanPara.length < 20) continue;

    if (currentChunk.length + cleanPara.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = cleanPara;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + cleanPara;
    }
  }

  if (currentChunk.trim().length > 50) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY not configured');
  }

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: texts.map(t => t.substring(0, 16000)),
      input_type: 'document'
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Voyage API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingChunks(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .eq('agency_name', AGENCY_NAME)
    .eq('state_code', STATE_CODE)
    .select('id');

  if (error) {
    console.warn(`Warning: Could not clear existing chunks: ${error.message}`);
    return 0;
  }

  return data?.length || 0;
}

async function insertChunks(chunks: ChunkInsert[]): Promise<number> {
  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { error } = await supabase
      .from('manus_protocol_chunks')
      .insert(batch);

    if (error) {
      console.error(`  Batch insert error: ${error.message}`);
      for (const chunk of batch) {
        const { error: singleError } = await supabase
          .from('manus_protocol_chunks')
          .insert(chunk);
        if (!singleError) inserted++;
      }
    } else {
      inserted += batch.length;
    }

    const pct = Math.round(((i + batch.length) / chunks.length) * 100);
    process.stdout.write(`\r  Inserting: ${pct}% (${inserted}/${chunks.length})`);
  }

  console.log();
  return inserted;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('IMPERIAL COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE} (${STATE_NAME})`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipDownload = process.argv.includes('--skip-download');
  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create metadata.json
  const metadata = {
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    state_name: STATE_NAME,
    protocol_year: PROTOCOL_YEAR,
    source_url: 'https://www.icphd.org/emergency-medical-services/policy-protocol-manual',
    downloaded_at: new Date().toISOString(),
    protocol_count: PDF_SOURCES.length
  };
  fs.writeFileSync(path.join(DATA_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('Created metadata.json\n');

  // Download PDFs
  if (!skipDownload) {
    console.log('Downloading PDFs...');
    let downloaded = 0;
    for (let i = 0; i < PDF_SOURCES.length; i++) {
      const source = PDF_SOURCES[i];
      const filename = `${source.number}_${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const url = `${BASE_URL}${source.url}`;
      const success = await downloadPDF(url, filename);
      if (success) downloaded++;
      await new Promise(r => setTimeout(r, 300)); // Rate limiting
    }
    console.log(`\nDownloaded: ${downloaded}/${PDF_SOURCES.length} PDFs\n`);
  }

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing Imperial County chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);
  }

  // Process PDFs and generate chunks
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  let totalProtocols = 0;

  for (const source of PDF_SOURCES) {
    const filename = `${source.number}_${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`  SKIP: ${source.title} (file not found)`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filepath);
      const { text, numPages } = await parsePDF(buffer);
      
      if (text.length < 100) {
        console.log(`  SKIP: ${source.title} (insufficient content)`);
        continue;
      }

      const chunks = chunkText(text);
      console.log(`  ${source.number} ${source.title}: ${numPages} pages, ${chunks.length} chunks`);
      totalProtocols++;

      for (const chunk of chunks) {
        allChunks.push({
          agency_name: AGENCY_NAME,
          state_code: STATE_CODE,
          state_name: STATE_NAME,
          protocol_number: source.number,
          protocol_title: source.title,
          section: source.section,
          content: chunk,
          source_pdf_url: `${BASE_URL}${source.url}`,
          protocol_year: PROTOCOL_YEAR,
        });
      }
    } catch (err: any) {
      console.error(`  ERROR: ${source.title} - ${err.message}`);
    }
  }

  console.log(`\nTotal protocols: ${totalProtocols}`);
  console.log(`Total chunks: ${allChunks.length}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    return;
  }

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
    console.log('\nGenerating embeddings (voyage-large-2, 1536 dims)...');
    const batchSize = 100;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);

      try {
        const embeddings = await generateEmbeddingsBatch(texts);
        for (let j = 0; j < batch.length; j++) {
          batch[j].embedding = embeddings[j];
        }
      } catch (error: any) {
        console.error(`\n  Embedding error at batch ${i}: ${error.message}`);
      }

      const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
      process.stdout.write(`\r  Progress: ${pct}%`);
      await new Promise(r => setTimeout(r, 200));
    }
    console.log();
  }

  // Insert chunks
  console.log('\nInserting into database...');
  const inserted = await insertChunks(allChunks);

  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`  Agency: ${AGENCY_NAME}`);
  console.log(`  State: ${STATE_CODE} (${STATE_NAME})`);
  console.log(`  Protocols processed: ${totalProtocols}`);
  console.log(`  Chunks inserted: ${inserted}`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
