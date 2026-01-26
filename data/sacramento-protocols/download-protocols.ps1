# Sacramento County EMS Protocol Downloader
# Metadata: agency_name='Sacramento County EMS Agency', state_code='CA'

$baseUrl = "https://dhs.saccounty.gov"
$outputDir = "C:\Users\Tanner\Protocol-Guide\data\sacramento-protocols"

# PDF URLs collected from the website
$pdfUrls = @(
    # Drug Reference Guide
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/Drug%20Reference%20Guide%202024-%20Effective%2011.1.2025.pdf",
    
    # 2000 EMS System
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2001%20Document%20Management%20System.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2002%20Naloxone%20Leave%20Behind.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2003%20BLS%20Tiered%20Response%20System.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2004%20Patient%20Privacy.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2007%20Trauma%20Hospital%20Data%20Elements.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2010%20Medical%20Advisory%20Committee.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2020%20Operational%20Advisory%20Committee.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2026%20Trauma%20Improvement%20Committee.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2027%20Stroke%20Care%20Committee.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2028%20STEMI%20Care%20Committee.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2030%20Advanced%20Life%20Support%20Inventories.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2032%20Controlled%20Substance.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2033%20Determination%20of%20Death.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2036%20Medical%20Scene%20Authority.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2039%20Physician%20and-or%20Registered%20Nurse%20at%20the%20Scene.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2055%20On-Viewing%20Medical%20Emergencies%20by%20ALS%20and%20BLS%20Providers.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2060%20Hospital%20Services.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2080%20EMS%20Organ%20Donor%20Information.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2085%20Do%20Not%20Resuscitate%20%28DNR%29.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2101%20Patient%20Initiated%20Refusal%20of%20Service%20and-or%20Transport.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2105%20Patient%20Elopement%20After%20Arrival%20to%20Hospital%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2200%20Medical%20Oversight.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2210%20EMR%20Scope%20of%20Practice.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2220%20EMT%20Scope%20of%20Practice.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2221%20Paramedic%20Scope%20of%20Practice.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2223%20Paramedic%20Scope%20of%20Practice%20Utilization.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2305%20EMS%20Patient%20Care%20Report-%20Completion%20and%20Distribution.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2500%20EMS%20Aircraft%20Designation%20Requirements.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2501%20Emergency%20Medical%20Dispatch%20%28EMD%29%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2510%20Designation%20Requirements%20for%20Ground%20Based%20Advanced%20Life%20Support%20%28ALS%29%20Service%20Providers.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2511%20Infectious%20Disease%20Ambulance%20Response%20Team%20%28IDART%29.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2512%20Designation%20Requirements%20for%20Administration%20of%20Naloxone%20by%20Law%20Enforcement%20First%20Responders.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2520%20Hospital%20Emergency%20Service%20Downgrade%20or%20Closure%20Impact%20Evaluation%20Report.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2521%20Ambulance%20Patient%20Offload%20Time%20%28APOT%29.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2523%20Administration%20of%20Naloxone.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2524%20Extended%20Ambulance%20Patient%20Off-Load%20Times%20%28APOT%29.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2525%20Prehospital%20Notification.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2526%20STEMI%20Receiving%20Center%20Designation.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2527%20STEMI%20System%20Data%20Elements.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2528%20Stroke%20System%20Data%20Elements.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2529%20Stroke%20Receiving%20Center%20Designation.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/2000/PP-2530%20Trauma%20Center%20Designation.pdf",
    
    # 4000 Accreditation/Certification
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4003%20Emergency%20Medical%20Services%20Liaison%20Officer%20%28ELO%29.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4006%20Reporting%20Responsibilities%20of%20Relevant%20Employers.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4050%20Certification-Accreditation%20Review%20Process.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4055%20Criminal%20Background%20Checks.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4100%20EMT%20Certification.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4150%20EMT%20Certification%20Renewal.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4160%20EMR%20Initial%20Certification%20and%20Recertification.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4200%20Mobile%20Intensive%20Care%20Nurse%20%28MICN%29%20Certification.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4201%20Mobile%20Intensive%20Care%20Nurse%20%28MICN%29-Recertification.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-%204202%20Mobile%20Intensive%20Care%20Nurse%20%28MICN%29%20Course.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4302%20Continuing%20Education%20Provider.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4303%20EMR%20Program%20Requirements%20and%20Approval.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4400%20Paramedic%20Accreditation%20to%20Practice.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4503%20Public%20Safety%20EMT%20AED%20Service%20Provider%20Approval.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4504%20AED%20Medical%20Control.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4510%20EMT%20Training%20Program.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4520%20Paramedic%20Training%20Program.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/PP-4521%20Triage%20to%20Alternate%20Destination%20Training%20Curriculum.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/4000/4525.01%20-%20PSFA%20and%20Optional%20Skills%20Provider%20Approval%20-%20Requirements.pdf",
    
    # 5000 Transportation/Patient Destination
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5001%20Equipment%20and%20Supply%20Shortages.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5010%20Transfer%20of%20Care%20Non-Transporting%20Paramedic%20to%20Transporting%20EMTParamedic%201.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5050%20Destination.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5052%20Trauma%20Destination.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5053%20Trauma%20Triage%20Criteria.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5057%20MIH%20Buprenorphine.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5060%20Hospital%20Status%20Change.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5070%20Hospital%20Transfer%20Agreements.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5100%20Interfacility%20Transfers-ALS-CCT%20Program%20Requirements.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5101%20Interfacility%20Transfers-%20Medical%20Control.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5102%20Interfacility%20Transfers.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5200%20Triage%20to%20Alternated%20Destination%20Program%20Requirements.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5201%20Triage%20Paramedic%20Eligibility%20Requirements.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5202%20Sobering%20Center%20Designation%20Policy.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5203%20Transport%20Guidelines%20to%20Sobering%20Center.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5204%20Mental%20Health%20Facility%20Designation%20Policy.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/5000/PP-5205%20Transportation%20Guideline%20-%20Mental%20Health%20Facility.pdf",
    
    # 8000 Adult Treatment Policies
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8001%20Allergic%20Reaction%20%20Anaphylaxis%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8002%20Diabetic%20Emergencies.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8003%20Seizures.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8004%20Suspected%20Narcotic%20Overdose.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8007%20Abdominal%20Pain%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8015%20Trauma%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8017%20Dystonic%20Reaction%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8018%20Overdose%20and-or%20Poison%20Ingestion%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8020%20Respiratory%20Distress-Airway%20Management-Respiratory%20Failure.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8024%20Cardiac%20Dysrhythmias%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8025%20Burns.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8026%20Respiratory%20Distress.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8027%20Nerve%20Agent%20Treatment.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8028%20Environmental%20Emergencies.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8029%20Hazardous%20Materials%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8030%20Discomfort-Pain%20of%20Suspected%20Cardiac%20Origin.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8031%20Non-Traumatic%20Cardiac%20Arrest.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8032%20Traumatic%20Cardiac%20Arrest.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8038%20Shock%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8042%20Childbirth.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8060%20Stroke.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8062%20Behavioral%20Crisis-Restraint%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8063.11%20Nausea-Vomiting.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8065.13-Hemorrhage.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8066%20Pain%20Managment.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8067%20Sepsis-Septic%20Shock.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8068%20General%20Medical%20Complaint.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8000/PP-8069%20Buprenorphine.pdf",
    
    # 8800 Skills
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8805%20Intubation-%20Stomal.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8808%20Vascular%20Access%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8810%20Transcutaneous%20Cardiac%20Pacing.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8827%2012-Lead%20ECG%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8829%20Noninvasive%20Ventilation%20%28NIV%29.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8830%20Supraglottic%20Airway%20%28iGel%29.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8831%20Intranasal%20Medication%20Administration.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8833%20Ventricular%20Assist%20Device%20%28VAD%29.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8837%20Pediatric%20Airway%20Managment.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/8800/PP-8844%20Spinal%20Motion%20Restriction%20%28SMR%29%201.pdf",
    
    # 9000 Pediatric Treatment Policies
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9001%20Pediatric%20Airway%20Obstruction%20by%20Foreign%20Body%20and%20Respiratory%20Arrest.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9002%20Pediatric%20Allergic%20%20Reaction_Anaphylaxis.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9003%20Pediatric%20Respiratory%20Distress%20Reactive%20Airway%20Disease-%20Asthma-Bronchospasm-Croup%20or%20Stridor.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9004%20Pediatric%20Burns.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9004%20Pediatric%20Burns%20FLOWCHART.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9005%20Pediatric%20Traumatic%20Cardiac%20Arrest.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9005%20FLOWCHART%20Pediatric%20Traumatic%20Cardiac%20Arrest.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9006%20Pediatric%20Medical%20Cardiac%20Arrest.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9007%20Pediatric%20Diabetic%20Emergencies.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9008%20Pediatric%20Seizures.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9009%20Pediatric%20Neonatal%20Resuscitation.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9011%20Pediatric%20Overdose.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9013%20Pediatric%20Shock.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9014%20Pediatric%20Cardiac%20Dysrhythmias.pdf",
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9016%20Pediatric%20Parameters%201.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9017%20Pediatric%20Trauma.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9018%20Pediatric-%20Pain%20Managment.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9019%20Brief%20Resolved%20Unexplained%20Event%20%28BRUE%29.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9019%20FLOWCHART%20Pediatric%20BRUE.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9020%20Pediatric%20Nausea%20and%20or%20Vomiting.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9020%20FLOWCHART%20Pediatric%20Nausea%20Vomiting.pdf",
    "/PUB/EMS/Documents/PoliciesProceduresProtocols/9000/PP-9021%20Pediatric%20Behavioral%20Crisis-Restraint.pdf"
)

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

$downloaded = 0
$failed = 0
$failedUrls = @()

foreach ($url in $pdfUrls) {
    # Normalize URL
    if ($url.StartsWith("/")) {
        $fullUrl = $baseUrl + $url
    } else {
        $fullUrl = $url
    }
    
    # Get filename from URL
    $filename = [System.Uri]::UnescapeDataString(($url -split "/")[-1])
    $outputPath = Join-Path $outputDir $filename
    
    Write-Host "Downloading: $filename"
    
    try {
        Invoke-WebRequest -Uri $fullUrl -OutFile $outputPath -UseBasicParsing
        $downloaded++
        Write-Host "  SUCCESS" -ForegroundColor Green
    } catch {
        $failed++
        $failedUrls += $fullUrl
        Write-Host "  FAILED: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Download Summary ===" -ForegroundColor Cyan
Write-Host "Downloaded: $downloaded"
Write-Host "Failed: $failed"
Write-Host "Total: $($downloaded + $failed)"

if ($failedUrls.Count -gt 0) {
    Write-Host "`nFailed URLs:" -ForegroundColor Yellow
    $failedUrls | ForEach-Object { Write-Host "  $_" }
}
