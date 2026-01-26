#!/usr/bin/env python3
"""Download El Dorado County EMS protocols from their website."""

import os
import requests
from urllib.parse import urljoin

BASE_URL = "https://www.eldoradocounty.ca.gov"

# Prehospital Protocols
PROTOCOLS = [
    # Preface
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/01_preface-2013.pdf",
    
    # Cardiac
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/bradycardia.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/302-chest-discomfort.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/chf-pulmonary-edema-2019.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/17narrow-complex-tachycardia.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/pulseless-arrest.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/306-return-of-spontaneous-circulation-rosc.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/305-wide-complex-tachycardia.pdf",
    
    # General
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/32-pain-management.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/110-shock.pdf",
    
    # Medical
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/101-airway-obstruction.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/102-allergic-reaction.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/altered-level-of-conciousness-aloc.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/503-bites-stings-envenomation.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/16bronchospasm-copd.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/cold-exposures.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/drowning-event.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/13dystonic-reaction.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/14glycemic-emergencies.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/heat-illness.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/112-nausea-vomiting.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/poisoning-overdose-2019.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/29seizures.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/109-sepsis.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/severely-agitated-patient.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stroke.pdf",
    
    # Trauma
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/burns.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/12crush-syndrome-suspension-injuries.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/30general-trauma.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/15head-trauma.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/31hemorrhage-control.pdf",
    
    # OB/GYN Pediatric
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/brief-resolved-unexplained-event.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/childbirth.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/neonatal-resuscitation.pdf",
]

# Drug Formulary
DRUG_FORMULARY = [
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/acetaminophen.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/activated-charcoal.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/adenosine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/albuterol.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/amiodarone_2.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/aspirin.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/atropine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/atrovent-duoneb.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/calcium-chloride.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dextrose10.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dextrose50.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/diphenhydramine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dopamine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/1013-epinephrine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/fentanyl.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/glucagon.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/glucose.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ibuprofen.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ketamine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/lactated-ringers.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/levalbuterol-tartrate.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/lidocaine_.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/lidocaine-jelly.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/magnesium-sulfate.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/midazolam-hydrochloride.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/morphine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/naloxone.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/neosynephrine.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/nitroglycerin.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/nitrous-oxide.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ondansetron.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/oxygen.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/sodium-bicarbonate.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/sodium-chloride.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/tranexamic-acid.pdf",
]

# Field Procedures
FIELD_PROCEDURES = [
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/12-lead-ecg.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/automatic-external-defibrillator-aed-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/cpap.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/etco2-monitoring.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/epinephrine-dilution.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/gastric-tube-insertion.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/intranasal-medication-administration.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/intraosseous-infusion-io.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/needle-chest-decompression.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/needle-cricothyroidotomy.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/810-orotracheal-intubation.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/821-sct-blood-transfusions.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/820-sct-infusions.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stomal-intubation-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/supraglottic-airways.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/therapeutic-hypothermia-2019.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/tourniquet-for-hemorrhage-control.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/transcutaneous-pacing.pdf",
]

# Field Policies
FIELD_POLICIES = [
    "/files/assets/county/v/5/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/901-als-unit-minimum-inventory.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/402-assessment-of-subjects-in-law-enforcement-custody.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/bls-medication-administration-2019.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/401-comprehensive-5150-guidelines.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/controlled-substance-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/determination-of-death.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/dnr.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/ems-aircraft-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/exposure-determination-treatment-and-reporting.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/fireline-medic.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/909-hospice-patients.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/inter-county-emt-paramedic-response-and-transport-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/malfunctioning-aicd.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/management-of-preexisting-medical-intervention.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/403-management-of-taser-stun-device-patients.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/nerve-agent-exposure-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/on-scene-photography-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/pandemic-epidemic-influenza-and-influenza-like-illness-ili.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/918-patient-destination.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/physical-restraint-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/physician-at-scene.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/prehospital-transfer-of-care-2018.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/913-refusal-of-care-or-transportation.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/914-reporting-of-suspected-abuse.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/routine-medical-care-2019.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/safely-surrendered-baby.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/spinal-immobilization-2019.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/917-stemi-destination.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/verification-of-advanced-airway-placement.pdf",
]

def download_file(url, save_dir, category=""):
    """Download a single file."""
    full_url = urljoin(BASE_URL, url)
    filename = os.path.basename(url)
    
    if category:
        save_path = os.path.join(save_dir, category, filename)
        os.makedirs(os.path.join(save_dir, category), exist_ok=True)
    else:
        save_path = os.path.join(save_dir, filename)
    
    if os.path.exists(save_path):
        print(f"  Already exists: {filename}")
        return save_path
    
    try:
        response = requests.get(full_url, timeout=30)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"  Downloaded: {filename}")
        return save_path
    except Exception as e:
        print(f"  ERROR downloading {filename}: {e}")
        return None

def main():
    save_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Downloading El Dorado County EMS Protocols...")
    print(f"Save directory: {save_dir}\n")
    
    downloaded = []
    
    print("=== Prehospital Protocols ===")
    for url in PROTOCOLS:
        result = download_file(url, save_dir, "protocols")
        if result:
            downloaded.append(result)
    
    print("\n=== Drug Formulary ===")
    for url in DRUG_FORMULARY:
        result = download_file(url, save_dir, "drug-formulary")
        if result:
            downloaded.append(result)
    
    print("\n=== Field Procedures ===")
    for url in FIELD_PROCEDURES:
        result = download_file(url, save_dir, "field-procedures")
        if result:
            downloaded.append(result)
    
    print("\n=== Field Policies ===")
    for url in FIELD_POLICIES:
        result = download_file(url, save_dir, "field-policies")
        if result:
            downloaded.append(result)
    
    print(f"\n\nTotal downloaded: {len(downloaded)} files")
    return downloaded

if __name__ == "__main__":
    main()
