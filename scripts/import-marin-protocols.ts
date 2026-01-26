/**
 * Marin County EMS Protocol Import
 *
 * Downloads Marin County EMS protocols from ems.marinhhs.org,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-marin-protocols.ts
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

const AGENCY_NAME = 'Marin County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const DATA_DIR = 'data/marin-protocols';
const BASE_URL = 'https://ems.marinhhs.org/sites/default/files/policy_procedure';

// All Marin County EMS Protocol PDFs from ems.marinhhs.org
const PDF_SOURCES = [
  // Interim Policy Memos
  { filename: 'Interim_Policy_Memo%202017-4_DRUG.pdf', number: 'Memo-2017-4', title: 'Interim Policy Memo - Drug Shortages', section: 'Interim Policy Memos' },
  { filename: 'InterimMemo2014-4_EBOLA.pdf', number: 'Memo-2014-4', title: 'Interim Policy Memo - Ebola Procedures', section: 'Interim Policy Memos' },
  
  // Memos/Guides
  { filename: 'Memo_Fentanyl%20and%20Analogs_5-1-21.pdf', number: 'Memo-Fentanyl', title: 'Fentanyl and Analogs', section: 'Memos/Guides' },
  
  // 2000 - Quality Improvement
  { filename: '2000.pdf', number: '2000', title: 'Quality Improvement References', section: 'Quality Improvement' },
  { filename: '2003_Provider_MD_Resp_JUL17.pdf', number: '2003', title: 'Provider Medical Director Functions/Responsibilities', section: 'Quality Improvement' },
  { filename: '2004_CQI_Providers_Resp_JUL17.pdf', number: '2004', title: 'Quality Improvement Provider Agency Responsibilities', section: 'Quality Improvement' },
  { filename: '2005.pdf', number: '2005', title: 'Prehospital Care Record Audit', section: 'Quality Improvement' },
  { filename: '2010-%20Event%20Reporting%202024.pdf', number: '2010', title: 'Event Reporting', section: 'Quality Improvement' },
  
  // 3000 - Certification/Accreditation
  { filename: '3101.pdf', number: '3101', title: 'Fee Schedule', section: 'Certification/Accreditation' },
  { filename: '3102_Cert_Review_Process_For_EMT_Personnel.pdf', number: '3102', title: 'Certificate Review Process for EMT Personnel', section: 'Certification/Accreditation' },
  { filename: '3103.pdf', number: '3103', title: 'Continuing Education', section: 'Certification/Accreditation' },
  { filename: '3200_EMT_Certification.pdf', number: '3200', title: 'EMT Certification/Recertification', section: 'Certification/Accreditation' },
  { filename: '3300_Paramedic_Accreditation_JUL17.pdf', number: '3300', title: 'Paramedic Accreditation/Continued Accreditation', section: 'Certification/Accreditation' },
  
  // 4100 - AED Programs
  { filename: '4100_EMTAED_0.pdf', number: '4100', title: 'EMT AED Service Provider', section: 'AED Programs' },
  { filename: '4110_PublicSafetyAEDProvider_JAN17.pdf', number: '4110', title: 'Public Safety Early Defibrillation', section: 'AED Programs' },
  { filename: '4120_PublicAccessAEDProvider_JUL17.pdf', number: '4120', title: 'Public Access Early Defibrillation Program', section: 'AED Programs' },
  
  // 4200 - Emergency Medical Dispatch
  { filename: '4200_EMD_JULY17.pdf', number: '4200', title: 'Emergency Medical Dispatch Policy', section: 'Emergency Medical Dispatch' },
  { filename: '4201pro_0.pdf', number: '4201', title: 'Emergency Medical Dispatch Certification', section: 'Emergency Medical Dispatch' },
  { filename: '4202pro_0.pdf', number: '4202', title: 'Emergency Medical Dispatch Recertification', section: 'Emergency Medical Dispatch' },
  { filename: '4203pro_0.pdf', number: '4203', title: 'Emergency Medical Dispatch Training Program Approval', section: 'Emergency Medical Dispatch' },
  { filename: '4204pro_0.pdf', number: '4204', title: 'Emergency Medical Dispatch Quality Assurance', section: 'Emergency Medical Dispatch' },
  
  // 4600 - Trauma System
  { filename: '4600_TS_Trauma_System_JUL17.pdf', number: '4600', title: 'Trauma System', section: 'Trauma System' },
  { filename: '4602_TS_Marketing_Advertising_JULY17.pdf', number: '4602', title: 'Marketing and Advertising', section: 'Trauma System' },
  { filename: '4603_TS_Service_Areas_Hospitals_JULY17.pdf', number: '4603', title: 'Service Areas for Hospitals', section: 'Trauma System' },
  { filename: '4604.pdf', number: '4604', title: 'EMS Dispatching', section: 'Trauma System' },
  { filename: '4605_Trauma%20System_Communication.pdf', number: '4605', title: 'EMS Communication', section: 'Trauma System' },
  { filename: '4606-%20Patient%20Transfer%20and%20Transportation_APR22.pdf', number: '4606', title: 'Patient Transfer and Transportation', section: 'Trauma System' },
  { filename: '4606A_Trauma_ReTriage_Adult_Jan2020_finalDraft.pdf', number: '4606A', title: 'Trauma Re-Triage Adult', section: 'Trauma System' },
  { filename: '4606B_Trauma_ReTriage_Peds_Jan2020_FinalDraft.pdf', number: '4606B', title: 'Trauma Re-Triage Pediatric', section: 'Trauma System' },
  { filename: '4608_TS_Training_Trauma_System_Personnel_JULY17.pdf', number: '4608', title: 'Training of Trauma System Personnel', section: 'Trauma System' },
  { filename: '4609_TS_Jurisdiction_Coord_JULY17.pdf', number: '4609', title: 'Jurisdictional Coordination', section: 'Trauma System' },
  { filename: '4610_TS_Coord_With_NonMedEmergServ_JULY17.pdf', number: '4610', title: 'Coordination with Non-medical Emergency Services', section: 'Trauma System' },
  { filename: '4611_TS_Trauma_SystemFees_JULY2016.pdf', number: '4611', title: 'Trauma System Fees', section: 'Trauma System' },
  { filename: '4612_TS_Medical_Control_Accountability_JULY17.pdf', number: '4612', title: 'Medical Control and Accountability', section: 'Trauma System' },
  { filename: '4613_Trauma_Triage_and_Destination_APR22.pdf', number: '4613', title: 'Trauma Triage and Destination', section: 'Trauma System' },
  { filename: '4613a-Trauma%20Triage%20Tool%202024%20.pdf', number: '4613a', title: 'Trauma Triage Tool', section: 'Trauma System' },
  { filename: '4613b-Pediatric%20Trauma%20Triage%20Tool%202024.pdf', number: '4613b', title: 'Pediatric Trauma Triage Tool', section: 'Trauma System' },
  { filename: '4614_TS_Designation%20Process_JULY17.pdf', number: '4614', title: 'Trauma Center Designation Process', section: 'Trauma System' },
  { filename: '4615_TS_Data%20Collection_JULY2016.pdf', number: '4615', title: 'Data Collection and Management (Trauma)', section: 'Trauma System' },
  { filename: '4616_TS_CQI_Evaluation_JULY17.pdf', number: '4616', title: 'Quality Improvement and System Evaluation (Trauma)', section: 'Trauma System' },
  { filename: '4618_TS_Organization_Management_JULY17.pdf', number: '4618', title: 'System Organization and Management', section: 'Trauma System' },
  
  // 5000 - Providers
  { filename: '5001_General_System_Operations_JULY17.pdf', number: '5001', title: 'General System Operations', section: 'Providers' },
  { filename: '5002_%20Ambulance_Equipment_JUL17_0.pdf', number: '5002', title: 'Ambulance Supply and Equipment Requirements', section: 'Providers' },
  { filename: '5003_Drug%20Security_JUL18.pdf', number: '5003', title: 'Drug Security', section: 'Providers' },
  { filename: '5004_Descriptions%20of%20ALS_%20CCT_JUL17_0.pdf', number: '5004', title: 'Description and Function of BLS ALS and Paramedic Transport Units', section: 'Providers' },
  { filename: '5005_ALS_Nontransport_Equipment_JUL18.pdf', number: '5005', title: 'ALS Nontransport Supply/Equipment Requirements', section: 'Providers' },
  { filename: '5006_ALS_First_Responder_JUL18.pdf', number: '5006', title: 'ALS First Responder', section: 'Providers' },
  { filename: '5007_Fireline_Personnel_JUL17_0.pdf', number: '5007', title: 'Fireline Medic', section: 'Providers' },
  { filename: '5008_Paramedic_Internships_JULY16.pdf', number: '5008', title: 'Paramedic Internships', section: 'Providers' },
  { filename: '5010%20EMS%20Provider%20Equipment%20List%20April%202025%20v2.0.pdf', number: '5010', title: 'EMS Equipment List', section: 'Providers' },
  { filename: '5012_Interfacility%20Transfers_APR23.pdf', number: '5012', title: 'Interfacility Transfers', section: 'Providers' },
  { filename: '5100-EMS%20Aircraft%202024.pdf', number: '5100', title: 'EMS Aircraft', section: 'Providers' },
  { filename: '5200_Medical%20Mutual%20Aid_July2018.pdf', number: '5200', title: 'Medical Mutual Aid', section: 'Providers' },
  { filename: '5201_Non_Medical_Mutual_Aid_JUL18.pdf', number: '5201', title: 'Non-Medical Mutual Aid Paramedic Function', section: 'Providers' },
  { filename: '5202_UnifiedResponsetoViolentIncidents_JULY16.pdf', number: '5202', title: 'Unified Response to Violent Incident', section: 'Providers' },
  { filename: '5203_Tactical_Medic_Personnel_JULY16.pdf', number: '5203', title: 'Tactical Medic', section: 'Providers' },
  { filename: '5300_GGB_GGNRA_Response_JUL17_0.pdf', number: '5300', title: 'GGB and GGNRA Response Policy', section: 'Providers' },
  { filename: '5301_Response%20to%20San%20Quentin_July2018.pdf', number: '5301', title: 'Response to San Quentin Prison', section: 'Providers' },
  { filename: '5400-%20Ambulance%20DIversion%20Policy_APR22.pdf', number: '5400', title: 'Ambulance Diversion Policy', section: 'Providers' },
  { filename: 'HOSPITAL%20DIVERSION%20QUICK%20REFERENCE%20Jan2020_FinalDraft.pdf', number: '5400-QR', title: 'Hospital Diversion Quick Reference', section: 'Providers' },
  { filename: '5500_Program%20Approvals_JUL17.pdf', number: '5500', title: 'Program Approvals', section: 'Providers' },
  { filename: '5600_Specialty%20Care%20Designation_JUL17_0.pdf', number: '5600', title: 'Specialty Care Designation', section: 'Providers' },
  { filename: '5700-%20EMS%20Distribution%20of%20Naloxone%20Kits_APR22.pdf', number: '5700', title: 'Distribution of Naloxone Kits', section: 'Providers' },
  
  // 7000 - Communications
  { filename: '7001_Hospital_Report_Consult_APR23.pdf', number: '7001', title: 'Hospital Report Consult', section: 'Communications' },
  { filename: '7002_Comm%20Failure_JUL18.pdf', number: '7002', title: 'Communication Failure', section: 'Communications' },
  { filename: '7003%20RadioCommunications_March2020.pdf', number: '7003', title: 'Radio Communications', section: 'Communications' },
  { filename: '7004_EMS%20Communications_JUL18_0.pdf', number: '7004', title: 'EMS Communication', section: 'Communications' },
  { filename: '7005%20Reddinet_Policy_APR23.pdf', number: '7005', title: 'REDDINET Policy', section: 'Communications' },
  { filename: '11%20-%207006%20-%20Patient%20Care%20Record%20%282025%29_0.pdf', number: '7006', title: 'Patient Care Record', section: 'Communications' },
  { filename: '7006a_Field_Transfer_Form_JUL18.pdf', number: '7006a', title: 'Field Transfer Form', section: 'Communications' },
  { filename: '7006b_Medical_Abbreviations_JUL18.pdf', number: '7006b', title: 'Approved Medical Abbreviations', section: 'Communications' },
  { filename: '7007_Interim_Policy_Memo.pdf', number: '7007', title: 'Interim Policy Memo', section: 'Communications' },
  { filename: '7008-%20Language%20Barrier%20Policy%202024.pdf', number: '7008', title: 'Language Barrier', section: 'Communications' },
  
  // General Patient Care (GPC)
  { filename: '13%20-%20GPC%201%20-%20Cancellation%20of%20ALS%20%282025%29.pdf', number: 'GPC 01', title: 'Cancellation of ALS Response', section: 'General Patient Care' },
  { filename: 'GPC%202-%20Against%20Medical%20Advice%20%202024.pdf', number: 'GPC 02', title: 'AMA (Against Medical Advice)', section: 'General Patient Care' },
  { filename: 'GPC%203-%20Release%20at%20Scene%202024.pdf', number: 'GPC 03', title: 'RAS (Release at Scene)', section: 'General Patient Care' },
  { filename: 'GPC%204-%20Destination%20Guidelines%202024.pdf', number: 'GPC 04', title: 'Destination Guidelines', section: 'General Patient Care' },
  { filename: 'GPC%205-%20Interfacility%20transfer_APR22.pdf', number: 'GPC 05', title: 'Interfacility Transfer Procedure', section: 'General Patient Care' },
  { filename: 'GPC%206-%20Medical%20Personnel%20on%20Scene_APR22.pdf', number: 'GPC 06', title: 'Medical Personnel on Scene', section: 'General Patient Care' },
  { filename: 'GPC06A_MD_onscene_card.pdf', number: 'GPC 06A', title: 'MD on Scene Card', section: 'General Patient Care' },
  { filename: 'GPC7_DNR_POLST_APR23.pdf', number: 'GPC 07', title: 'DNR/POLST', section: 'General Patient Care' },
  { filename: 'GPC%208-%20Anatomical%20gift_Donor%20card%20search_APR22.pdf', number: 'GPC 08', title: 'Anatomical Gift/Donor Card Search', section: 'General Patient Care' },
  { filename: '21%20-%20GPC%209%20-%20Suspected%20Abuse-Neglect%20Inflicted%20Physical%20Injury%20%282025%29.pdf', number: 'GPC 09', title: 'Suspected Child/Elder Abuse', section: 'General Patient Care' },
  { filename: 'GPC09A_SuspectedChildAbuseForm.pdf', number: 'GPC 09A', title: 'Child Abuse Form', section: 'General Patient Care' },
  { filename: 'SUSPECTED_DEPENDENT_ADULT-ELDER_ABUSE_FORM_3-2015.pdf', number: 'GPC 09B', title: 'Suspected Elder Abuse Form', section: 'General Patient Care' },
  { filename: 'GPC_9C_Suspicious_Injury_Report_Form.pdf', number: 'GPC 09C', title: 'Suspicious Injury Form', section: 'General Patient Care' },
  { filename: 'GPC%2010-%20Sexual%20Assault-Human%20trafficking%202024.pdf', number: 'GPC 10', title: 'Sexual Assault Human Trafficking', section: 'General Patient Care' },
  { filename: 'GPC%2011-%20Patient%20Restraint%202024.pdf', number: 'GPC 11', title: 'Patient Restraint', section: 'General Patient Care' },
  { filename: 'GPC12_Multi_Casualty_Incident_APR23.pdf', number: 'GPC 12', title: 'Multi-Casualty Incident (MCI)', section: 'General Patient Care' },
  { filename: 'GPC%2013-%20Spinal%20Motion%20Restriction%20%28SMR%29_APR22.pdf', number: 'GPC 13', title: 'Spinal Motion Restriction', section: 'General Patient Care' },
  { filename: 'GPC%2013a-%20Spinal%20Injury%20Assessment_APR22.pdf', number: 'GPC 13A', title: 'Spinal Injury Assessment', section: 'General Patient Care' },
  { filename: 'GPC%2014-%20Bariatric%20Patient%20Transport%20Procedure_APR22.pdf', number: 'GPC 14', title: 'Bariatric Patient Transport Procedure', section: 'General Patient Care' },
  { filename: 'GPC%2015-%20Specialty%20Patient_APR22.pdf', number: 'GPC 15', title: 'Specialty Patient', section: 'General Patient Care' },
  { filename: 'GPC%2016-%20Pediatric%20Patient%20Transport%202024.pdf', number: 'GPC 16', title: 'Pediatric Patient Transports', section: 'General Patient Care' },
  { filename: 'GPC%2016a-%20Marin%20County%20Safe%20child%20transport%20flow%20chart_APR22.pdf', number: 'GPC 16A', title: 'Marin County Safe Child Transport Flow Chart', section: 'General Patient Care' },
  
  // BLS Treatment Guidelines
  { filename: 'BTG1_BLS%20Routine%20Medical%20Care_March2020.pdf', number: 'BTG 1', title: 'Routine Medical Care BLS', section: 'BLS Treatment Guidelines' },
  { filename: 'BTG%202-%20BLS%20Determination%20of%20Death%202024.pdf', number: 'BTG 2', title: 'Determination of Death BLS', section: 'BLS Treatment Guidelines' },
  { filename: 'BTG3_Early%20Transport%20Decisions%20BLS_March%202020.pdf', number: 'BTG 3', title: 'Early Transport Decisions BLS', section: 'BLS Treatment Guidelines' },
  { filename: '34%20-%20BLS%20C%201%20-%20Cardiac%20Arrest%20BLS%20April%20%282025%29.pdf', number: 'BLS C1', title: 'Cardiac Arrest BLS', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20C2_Chest%20PainAcute%20Coronary%20Syndrome%20BLS_March%202020.pdf', number: 'BLS C2', title: 'Chest Pain/Acute Coronary Syndrome BLS', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20E1_Environmental%20Emergencies_March%202020.pdf', number: 'BLS E1', title: 'Environmental Emergencies', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS_E2-%20Burns_APR22.pdf', number: 'BLS E2', title: 'Burns', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20M1_Allergic%20ReactionAnaphylaxis%20BLS_March%202020.pdf', number: 'BLS M1', title: 'Allergic Reaction/Anaphylaxis BLS', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20M2_Abdominal%20pain_March%202020.pdf', number: 'BLS M2', title: 'Abdominal Pain', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20N1_Neurological%20Emergencies_March%202020.pdf', number: 'BLS N1', title: 'Neurological Emergencies', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20N2_Seizure_March%202020.pdf', number: 'BLS N2', title: 'Seizure', section: 'BLS Treatment Guidelines' },
  { filename: '42%20-%20BLS%20O1%20-%20Obstetrical%20Emergencies%20%282025%29.pdf', number: 'BLS O1', title: 'Obstetrical Emergencies', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20R1_Shortness%20of%20Breath%20BLS_March%202020_0.pdf', number: 'BLS R1', title: 'Shortness of Breath BLS', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20T1_Traumatic%20Emergencies-%20Head%2C%20Eye%2C%20and%20Spine_March%202020.pdf', number: 'BLS T1', title: 'Traumatic Emergencies - Head Eye and Spine', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20T2_Traumatic%20Emergencies-%20Chest%20and%20Abdomen_March%202020.pdf', number: 'BLS T2', title: 'Traumatic Emergencies - Chest and Abdomen', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20T3_Traumatic%20Emergencies-Extremities_March%202020.pdf', number: 'BLS T3', title: 'Traumatic Emergencies - Extremities', section: 'BLS Treatment Guidelines' },
  { filename: 'BLS%20T4_Traumatic%20Emergencies%20Impaled%20Objects_March%202020.pdf', number: 'BLS T4', title: 'Traumatic Emergencies Impaled Objects', section: 'BLS Treatment Guidelines' },
  
  // BLS Procedures
  { filename: '121%20-%20BLS%20PR%201%20-%20Authorized%20Procedures%20for%20EMT%20Personnel%20%282025%29.pdf', number: 'BLS PR 1', title: 'Authorized Procedures for EMTs', section: 'BLS Procedures' },
  { filename: 'BLS%20PR2_Oxygen%20Therapy%20BLS%20Procedure_March%202020_0.pdf', number: 'BLS PR 2', title: 'BLS Oxygen Therapy', section: 'BLS Procedures' },
  { filename: 'BLS%20PR3_Administration%20of%20Oral%20Glucose%20BLS%20Procedure_March%202020_0.pdf', number: 'BLS PR 3', title: 'Administration of Oral Glucose', section: 'BLS Procedures' },
  { filename: 'BLS%20PR4_Administration%20of%20Epi-Pen%20BLS%20Procedure_March%202020_0.pdf', number: 'BLS PR 4', title: 'Auto-Injector Epi-Pen', section: 'BLS Procedures' },
  { filename: 'BLS%20PR4a_Check%20and%20Inject%20BLS%20Procedure_March%202020_0.pdf', number: 'BLS PR 4a', title: 'Check and Inject', section: 'BLS Procedures' },
  { filename: '126%20-%20BLS%20PR%209%20-%20Self-Administration%20of%20Nerve%20Gas%20Auto-Injector%20%282025%29.pdf', number: 'BLS PR 9', title: 'Self Administration of Nerve Gas Auto Injector', section: 'BLS Procedures' },
  { filename: 'BLS%20PR10_Blood%20Glucose%20Monitoring%20BLS%20Procedure_March%202020_0.pdf', number: 'BLS PR 10', title: 'Glucose Monitoring', section: 'BLS Procedures' },
  { filename: 'BLS%20PR11_Administration%20of%20Narcan%20Nasal%20Spray%20BLS%20Procedure_March%202020.pdf', number: 'BLS PR 11', title: 'Narcan Nasal Spray Administration', section: 'BLS Procedures' },
  { filename: 'BLS%20PR%2012-%20Pelvic%20Binder%20Application%20Procedure%202024.pdf', number: 'BLS PR 12', title: 'Pelvic Binder Application', section: 'BLS Procedures' },
  { filename: '130%20-%20BLS%20PR%2013%20-%20Adult%20i-gel%20Airway%20Procedure%20%282025%29.pdf', number: 'BLS PR 13', title: 'Adult iGel Airway Procedure', section: 'BLS Procedures' },
  
  // ALS Treatment Guidelines
  { filename: 'ATG%201-%20Routine%20Medical%20Care%20ALS_APR22.pdf', number: 'ATG 1', title: 'Routine Medical Care ALS', section: 'ALS Treatment Guidelines' },
  { filename: '49%20-%20ATG%202%20-%20Adult%20Pain%20Management%20%282025%29.pdf', number: 'ATG 2', title: 'Adult Pain Management', section: 'ALS Treatment Guidelines' },
  { filename: 'ATG2A_ADULT_PAIN_MANAGEMENT_ADDENDUM.pdf', number: 'ATG 2A', title: 'Adult Pain Addendum', section: 'ALS Treatment Guidelines' },
  { filename: 'ATG3_Adult%20Sedation_March2020.pdf', number: 'ATG 3', title: 'Adult Sedation', section: 'ALS Treatment Guidelines' },
  { filename: '51%20-%20ATG%204%20-%20ALS%20to%20BLS%20Transfer%20of%20Care%20%282025%29.pdf', number: 'ATG 4', title: 'ALS to BLS Transfer of Care', section: 'ALS Treatment Guidelines' },
  { filename: 'ATG%205-%20Adult%20Intraosseous%20Infusion_APR22.pdf', number: 'ATG 5', title: 'Adult Intraosseous Infusion Policy', section: 'ALS Treatment Guidelines' },
  { filename: '53%20-%20ATG%206%20-%20Determination%20of%20Death%20ALS%20%282025%29.pdf', number: 'ATG 6', title: 'ALS Determination of Death', section: 'ALS Treatment Guidelines' },
  { filename: '54%20-%20ATG%207%20-%20Adult%20Medication%20Standard%20Dosages%20%282025%29.pdf', number: 'ATG 7', title: 'Adult Medication Standard Dosages', section: 'ALS Treatment Guidelines' },
  { filename: 'ATG%208-%20Ventricular%20Assist%20Device_APR22.pdf', number: 'ATG 8', title: 'Ventricular Assist Device (VAD)', section: 'ALS Treatment Guidelines' },
  
  // ALS Procedures
  { filename: 'ALS%20PR%201-%20Pelvic%20Binder%20Application%20Procedure_APR22.pdf', number: 'ALS PR 01', title: 'Pelvic Binder Application Procedure', section: 'ALS Procedures' },
  { filename: '132%20-%20ALS%20PR%202%20-%20Adult%20Intraosseous%20Procedure%20%282025%29.pdf', number: 'ALS PR 02', title: 'Adult Intraosseous Infusion Procedure', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%203-%20Oral%20endotracheal%20intubation%20procedure_APR22.pdf', number: 'ALS PR 03', title: 'Oral Intubation', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%204-%20Endotracheal%20Tube%20Introducer%20%28ETTI%29%20Procedure_APR22.pdf', number: 'ALS PR 04', title: 'ETTI', section: 'ALS Procedures' },
  { filename: '135%20-%20ALS%20PR%205%20-%20Adult%20I-gel%20Airway%20Procedure%20%282025%29.pdf', number: 'ALS PR 05', title: 'Adult i-gel Airway Procedure', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%207-%20Intranasal%20medications%20procedure_APR22.pdf', number: 'ALS PR 07', title: 'Intranasal Medications (Versed/Narcan)', section: 'ALS Procedures' },
  { filename: '137%20-%20ALS%20PR%208%20-%20Needle%20Thoracostomy%20Pleural%20Decompression%20%282025%29.pdf', number: 'ALS PR 08', title: 'Needle Thoracostomy/Pleural Decompression Procedure', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%209-%20Verification%20of%20tube%20placement%20procedure_APR22.pdf', number: 'ALS PR 09', title: 'Verification of Tube Placement', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%2010-%20IV%20access%20procedure_APR22.pdf', number: 'ALS PR 10', title: 'IV Access', section: 'ALS Procedures' },
  { filename: '140%20-%20ALS%20PR%2011%20-%20External%20Cardiac%20Pacing%20%282025%29.pdf', number: 'ALS PR 11', title: 'External Cardiac Pacing Procedure', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%2012-%2012-Lead%20ECG%20Procedure_APR22.pdf', number: 'ALS PR 12', title: '12 Lead ECG', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%2013-%20Continuous%20Positive%20Airway%20Pressure%20%28CPAP%29%20Procedure_APR22.pdf', number: 'ALS PR 13', title: 'Continuous Positive Airway Pressure', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%2014-%20King%20airway%20procedure_APR22.pdf', number: 'ALS PR 14', title: 'King Airway', section: 'ALS Procedures' },
  { filename: 'ALS%20PR%2016-%20Metered%20Dose%20Inhaler%20%28MDI%29%20fireline%20medicine%20procedure_APR22.pdf', number: 'ALS PR 16', title: 'MDI', section: 'ALS Procedures' },
  { filename: '145%20-%20ALS%20P%20PR%201%20-%20Pediatric%20Intraosseous%20Infusion%20Procedure%20%282025%29.pdf', number: 'ALS P PR1', title: 'Pediatric Intraosseous Infusion Procedure', section: 'ALS Procedures' },
  { filename: '146%20-%20ALS%20P%20PR%202%20-%20Pediatric%20Igel%20Airway%20Procedure%20%282025%29.pdf', number: 'ALS P PR2', title: 'Pediatric i-gel Airway Procedure', section: 'ALS Procedures' },
  
  // Cardiac
  { filename: '56%20-%20C%200%20%20-%20Adult%20Cardiac%20Arrest%20%282025%29.pdf', number: 'C0', title: 'Adult Cardiac Arrest', section: 'Cardiac' },
  { filename: 'C%201-%20VF-pVT%20%202024%20.pdf', number: 'C1', title: 'V-Fib Pulseless V-Tach', section: 'Cardiac' },
  { filename: '58%20-%20C%202%20-%20Asystole%20-%20PEA%20%282025%29.pdf', number: 'C2', title: 'Asystole/PEA', section: 'Cardiac' },
  { filename: '59%20-%20C%204%20-%20Bradycardia%20%282025%29.pdf', number: 'C4', title: 'Bradycardia', section: 'Cardiac' },
  { filename: '60%20-%20C%206%20-%20Wide%20Complex%20Tachycardia%20%282025%29.pdf', number: 'C6', title: 'Wide Complex Tachycardia', section: 'Cardiac' },
  { filename: '61%20-%20C%207%20-%20Narrow%20Complex%20Tachycardia%20%282025%29.pdf', number: 'C7', title: 'Narrow Complex Tachycardia', section: 'Cardiac' },
  { filename: '62%20-%20C%208%20-%20Chest%20Pain-Acute%20Coronary%20Syndrome%20%282025%29.pdf', number: 'C8', title: 'Chest Pain/Acute Coronary Syndrome', section: 'Cardiac' },
  { filename: '63%20-%20C%209%20-%20STEMI%20%282025%29.pdf', number: 'C9', title: 'ST Elevation Myocardial Infarction (STEMI)', section: 'Cardiac' },
  { filename: '64%20-%20C%2010%20-%20ROSC%20%282025%29.pdf', number: 'C10', title: 'Return of Spontaneous Circulation (ROSC)', section: 'Cardiac' },
  
  // Environmental
  { filename: 'E1_Heat%20Illness_March2020.pdf', number: 'E1', title: 'Heat Illness', section: 'Environmental' },
  { filename: 'E%202-%20Cold%20induced%20injury_APR22.pdf', number: 'E2', title: 'Cold Induced Injury', section: 'Environmental' },
  { filename: 'E3_Envenomation_March2020.pdf', number: 'E3', title: 'Envenomation', section: 'Environmental' },
  { filename: 'E4_Burns_March2020.pdf', number: 'E4', title: 'Burns', section: 'Environmental' },
  { filename: '69%20-%20E%205%20-%20Drowning-Submersion%20%282025%29.pdf', number: 'E5', title: 'Drowning/Submersion', section: 'Environmental' },
  
  // Medical
  { filename: '70%20-%20M%201%20-%20Non-Traumatic%20Shock%20%282025%29.pdf', number: 'M1', title: 'Non-Traumatic Shock', section: 'Medical' },
  { filename: '71%20-%20M%203%20-%20Allergic%20Reaction%20Anaphylaxis%20%282025%29.pdf', number: 'M3', title: 'Allergic Reaction/Anaphylaxis', section: 'Medical' },
  { filename: '72%20-%20M%204%20-%20Poisons-Drugs%20%282025%29.pdf', number: 'M4', title: 'Poisons/Drugs', section: 'Medical' },
  { filename: 'M5_Severe%20NauseaVomiting_March2020.pdf', number: 'M5', title: 'Severe Nausea/Vomiting', section: 'Medical' },
  { filename: '74%20-%20M%206%20-%20Sepsis%20%282025%29.pdf', number: 'M6', title: 'Sepsis', section: 'Medical' },
  
  // Neurological
  { filename: '75%20-%20N%201%20-%20Coma%20-%20ALOC%20%282025%29.pdf', number: 'N1', title: 'Coma/ALOC', section: 'Neurological' },
  { filename: 'N2_Seizure_APR23.pdf', number: 'N2', title: 'Seizure', section: 'Neurological' },
  { filename: 'N3_Syncope_March2020.pdf', number: 'N3', title: 'Syncope', section: 'Neurological' },
  { filename: '78%20-%20N%204%20-%20Stroke%20-TIA%20%282025%29.pdf', number: 'N4', title: 'Stroke/TIA', section: 'Neurological' },
  { filename: 'N4_CVA_March2020%20%282%29.pdf', number: 'N4a', title: 'CVA', section: 'Neurological' },
  
  // OB/GYN
  { filename: 'O1_Vaginal%20hemmorhage_March2020.pdf', number: 'O1', title: 'Vaginal Hemorrhage', section: 'OB/GYN' },
  { filename: '80%20-%20O%202%20-%20Imminent%20Delivery%20%28Normal%29%20%282025%29.pdf', number: 'O2', title: 'Imminent Delivery - Normal', section: 'OB/GYN' },
  { filename: 'O3_Imminent%20Delivery-%20Complications_March2020.pdf', number: 'O3', title: 'Imminent Delivery - Complications', section: 'OB/GYN' },
  { filename: 'O%204-%20Severe%20Pre-Eclampsia-Eclampsia%202024.pdf', number: 'O4', title: 'Severe Eclampsia/Preeclampsia', section: 'OB/GYN' },
  
  // Respiratory
  { filename: 'R1-Respiratory_Arrest_APR23.pdf', number: 'R1', title: 'Respiratory Arrest', section: 'Respiratory' },
  { filename: '84%20-%20R%202%20-%20Airway%20Obstruction%20%282025%29.pdf', number: 'R2', title: 'Airway Obstruction', section: 'Respiratory' },
  { filename: 'R3_Acute%20Respiratory%20Distress_March2020.pdf', number: 'R3', title: 'Acute Respiratory Distress', section: 'Respiratory' },
  { filename: 'R4-%20Bronchospasm_Asthma_COPD_APR22.pdf', number: 'R4', title: 'Bronchospasm/Asthma/COPD', section: 'Respiratory' },
  { filename: '87%20-%20R%205%20-%20Acute%20Pulmonary%20Edema%20%282025%29.pdf', number: 'R5', title: 'Acute Pulmonary Edema', section: 'Respiratory' },
  { filename: '88%20-%20R%206%20-%20Pneumothorax%20%282025%29.pdf', number: 'R6', title: 'Pneumothorax', section: 'Respiratory' },
  { filename: '89%20-%20R%207%20-%20Toxic%20Inhalation%20%282025%29.pdf', number: 'R7', title: 'Toxic Inhalation', section: 'Respiratory' },
  
  // Traumatic
  { filename: 'T1-Traumatic_Injury_APR23.pdf', number: 'T1', title: 'Traumatic Injury', section: 'Traumatic' },
  { filename: 'T3_Crush%20Syndrome_March2020.pdf', number: 'T3', title: 'Crush Syndrome', section: 'Traumatic' },
  { filename: 'T4_Less-than-lethal%20interventions_March2020.pdf', number: 'T4', title: 'Less-Than-Lethal Interventions', section: 'Traumatic' },
  
  // Pediatric
  { filename: '93%20-%20PC%201%20-%20Pediatric%20Cardiac%20Arrest%20%282025%29.pdf', number: 'PC 1', title: 'Pediatric Cardiac Arrest', section: 'Pediatric' },
  { filename: '94%20-%20PC%202%20-%20Newborn%20Resuscitation%20%282025%29.pdf', number: 'PC 2', title: 'Newborn Resuscitation', section: 'Pediatric' },
  { filename: '95%20-%20PC%203%20-%20Pediatric%20Bradycardia%20%282025%29.pdf', number: 'PC 3', title: 'Pediatric Bradycardia', section: 'Pediatric' },
  { filename: 'PC4_Pediatric_Tachycardia_APR23.pdf', number: 'PC 4', title: 'Pediatric Tachycardia', section: 'Pediatric' },
  { filename: 'PE%201-%20Pediatric%20Burns%202024.pdf', number: 'PE 1', title: 'Pediatric Burns', section: 'Pediatric' },
  { filename: 'PM%201-%20Pediatric%20Shock_APR22.pdf', number: 'PM 1', title: 'Pediatric Shock', section: 'Pediatric' },
  { filename: 'PM%202-%20Pediatric%20Allergic%20Reaction_APR22.pdf', number: 'PM 2', title: 'Pediatric Allergic Reaction', section: 'Pediatric' },
  { filename: 'PM%203-%20Pediatric%20Toxic%20Exposure_APR22.pdf', number: 'PM 3', title: 'Pediatric Toxic Exposure', section: 'Pediatric' },
  { filename: 'PM%204-%20BRUE_APR22.pdf', number: 'PM 4', title: 'BRUE', section: 'Pediatric' },
  { filename: 'P%20M5_Pediatric%20Sexual%20Assault_March%202020.pdf', number: 'PM 5', title: 'Pediatric Sexual Assault', section: 'Pediatric' },
  { filename: 'PM%206-%20Pediatric%20Nausea_Vomiting_APR22.pdf', number: 'PM 6', title: 'Pediatric Nausea Vomiting', section: 'Pediatric' },
  { filename: 'PN%201-%20Pediatric%20Seizure_APR22.pdf', number: 'PN 1', title: 'Pediatric Seizure', section: 'Pediatric' },
  { filename: 'PN%202-%20Pedi%20ALOC_APR22.pdf', number: 'PN 2', title: 'Pediatric ALOC', section: 'Pediatric' },
  { filename: '106%20-%20PR%201%20-%20Pedi%20Respiratory%20Distress%20%282025%29.pdf', number: 'PR 1', title: 'Pediatric Respiratory Distress', section: 'Pediatric' },
  { filename: 'PT_1_PEDIATRIC%20TRAUMA_APR22.pdf', number: 'PT 1', title: 'Pediatric Trauma', section: 'Pediatric' },
  { filename: '108%20-%20PTG%201%20-%20Pediatric%20Pain%20Management%20%282025%29.pdf', number: 'PTG 1', title: 'Pediatric Pain Management', section: 'Pediatric' },
  { filename: '109%20-%20PTG%202%20-%20Pediatric%20Sedation%20%282025%29.pdf', number: 'PTG 2', title: 'Pediatric Sedation', section: 'Pediatric' },
  { filename: '110%20-%20PTG%203%20-%20Pediatric%20Medication%20Standard%20Dosages%20%282025%29.pdf', number: 'PTG 3', title: 'Pediatric Medication Standard Dosages', section: 'Pediatric' },
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

async function downloadPDF(filename: string, localFilename: string): Promise<boolean> {
  const filepath = path.join(DATA_DIR, localFilename);
  
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    if (stats.size > 1000) {
      console.log(`  Already exists: ${localFilename}`);
      return true;
    }
    fs.unlinkSync(filepath);
  }

  const url = `${BASE_URL}/${filename}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://ems.marinhhs.org/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${localFilename}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    
    // Verify it's actually a PDF
    const pdfHeader = Buffer.from(buffer.slice(0, 5)).toString();
    if (!pdfHeader.startsWith('%PDF')) {
      console.error(`  Not a PDF: ${localFilename}`);
      return false;
    }
    
    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log(`  Downloaded: ${localFilename} (${Math.round(buffer.byteLength / 1024)}KB)`);
    return true;
  } catch (err: any) {
    console.error(`  Error downloading ${localFilename}: ${err.message}`);
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

function chunkText(text: string, maxChunkSize: number = 1500, overlap: number = 150): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const cleanPara = para.replace(/\s+/g, ' ').trim();
    if (!cleanPara || cleanPara.length < 20) continue;

    if (currentChunk.length + cleanPara.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Add overlap from the end of the previous chunk
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + cleanPara;
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
  console.log('MARIN COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
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
    protocol_year: PROTOCOL_YEAR,
    source_url: 'https://ems.marinhhs.org/policies-and-procedures',
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
      const localFilename = `${source.number.replace(/[^a-zA-Z0-9]/g, '_')}_${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const success = await downloadPDF(source.filename, localFilename);
      if (success) downloaded++;
      await new Promise(r => setTimeout(r, 300)); // Rate limiting
    }
    console.log(`\nDownloaded: ${downloaded}/${PDF_SOURCES.length} PDFs\n`);
  }

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing Marin County chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);
  }

  // Process PDFs and generate chunks
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  let totalProtocols = 0;
  let totalPages = 0;

  for (const source of PDF_SOURCES) {
    const localFilename = `${source.number.replace(/[^a-zA-Z0-9]/g, '_')}_${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(DATA_DIR, localFilename);

    if (!fs.existsSync(filepath)) {
      console.log(`  SKIP: ${source.title} (file not found)`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filepath);
      const { text, numPages } = await parsePDF(buffer);
      totalPages += numPages;
      
      if (text.length < 100) {
        console.log(`  SKIP: ${source.title} (insufficient content)`);
        continue;
      }

      const chunks = chunkText(text, 1500, 150);
      console.log(`  ${source.number} ${source.title}: ${numPages} pages, ${chunks.length} chunks`);
      totalProtocols++;

      for (const chunk of chunks) {
        allChunks.push({
          agency_name: AGENCY_NAME,
          state_code: STATE_CODE,
          protocol_number: source.number,
          protocol_title: source.title,
          section: source.section,
          content: chunk,
          source_pdf_url: `${BASE_URL}/${source.filename}`,
          protocol_year: PROTOCOL_YEAR,
        });
      }
    } catch (err: any) {
      console.error(`  ERROR: ${source.title} - ${err.message}`);
    }
  }

  console.log(`\nTotal protocols: ${totalProtocols}`);
  console.log(`Total pages: ${totalPages}`);
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
  console.log(`  Protocols processed: ${totalProtocols}`);
  console.log(`  Total pages: ${totalPages}`);
  console.log(`  Chunks inserted: ${inserted}`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
