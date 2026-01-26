$DestDir = "C:\Users\Tanner\Protocol-Guide\data\la-county-protocols"

# REF 800 Field Protocol / Procedures
$protocols = @(
    # Scope of Practice
    @{url="https://file.lacounty.gov/dhs/cms1_206315.pdf"; name="802-EMT-ScopeOfPractice.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1163509_802.1EMTFieldReference2024-07-01.pdf"; name="802.1-EMT-FieldReference.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179850_803ParamedicScopeofPractice.pdf"; name="803-Paramedic-ScopeOfPractice.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179851_803.1ParamedicFieldReference.pdf"; name="803.1-Paramedic-FieldReference.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206319.pdf"; name="804-FEMP.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206320.pdf"; name="805-PoisonControlSystem.pdf"},
    
    # HazMat
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179852_807HazMatExposure.pdf"; name="807-HazMatExposure.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179853_807.1HazmatFlowchart.pdf"; name="807.1-HazmatFlowchart.pdf"},
    
    # Death/DNR/POLST
    @{url="https://file.lacounty.gov/SDSInter/dhs/206332_Ref.No.814_DeterminationofDeath_06-21-16.pdf"; name="814-DeterminationOfDeath.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206335_Ref.No.815_DNR_POLST_2016-06-21.pdf"; name="815-DNR-POLST.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206333_815.12-28-15.pdf"; name="815.1-DNR-Form.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206334_815.209-01-15.pdf"; name="815.2-POLST-Form.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/245631_RefNo8153SampleAttestation_2016-06-21_00000002_.pdf"; name="815.3-EndOfLifeGuide.pdf"},
    
    # Other Field Protocols
    @{url="https://file.lacounty.gov/dhs/cms1_206336.pdf"; name="816-PhysicianAtScene.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179854_817RegionalMobileResponseTeam.pdf"; name="817-RegionalMobileResponseTeam.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206339.pdf"; name="819-OrganDonorIdentification.pdf"},
    
    # Child Abuse
    @{url="https://file.lacounty.gov/dhs/cms1_206344.pdf"; name="822-ChildAbuseGuidelines.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206341_822.17-1-14.pdf"; name="822.1-ChildAbuseReportingGuide.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206342_822-2.pdf"; name="822.2-ChildAbuseReportForm.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1034666_822.2a08-01-17.pdf"; name="822.2a-ChildAbuseDefinitions.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/224999_822.37-1-14.pdf"; name="822.3-EmployeeAcknowledgment.pdf"},
    
    # Elder Abuse
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179855_823ElderAbuseGuidelines.pdf"; name="823-ElderAbuseGuidelines.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179856_823.1ReportofSuspectedDependentAdult_ElderAbuseForm.pdf"; name="823.1-ElderAbuseReportForm.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179857_823.1aSOC341GeneralInstructions.pdf"; name="823.1a-ElderAbuseInstructions.pdf"},
    
    # Studies, Minors, Refusals
    @{url="https://file.lacounty.gov/dhs/cms1_206348.pdf"; name="830-EMSPilotStudies.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206349.pdf"; name="832-TreatmentOfMinors.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206350.pdf"; name="834-PatientRefusal.pdf"},
    @{url="http://file.lacounty.gov/SDSInter/dhs/1112993_834.1-AMAQuickReferenceGuide.pdf"; name="834.1-AMA-QuickReference.pdf"},
    
    # Communicable Disease
    @{url="https://file.lacounty.gov/dhs/cms1_206354.pdf"; name="836-CommunicableDisease.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206351.pdf"; name="836.1-CDFlowchart.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206352.pdf"; name="836.2-CDReportForm.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206353_836-3.pdf"; name="836.3-CourtPetition.pdf"},
    
    # Restraints, Tactical, Mass Gatherings
    @{url="https://file.lacounty.gov/SDSInter/dhs/1028376_838.pdf"; name="838-PatientRestraints.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206356.pdf"; name="840-TacticalOperations.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_206357.pdf"; name="842-MassGatherings.pdf"},
    @{url="https://file.lacounty.gov/dhs/cms1_246111.pdf"; name="842.1-MassGatheringsGuidelines.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/246112_842.27116.pdf"; name="842.2-MedicalActionPlan.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/246113_842.37116.pdf"; name="842.3-EventStaffingRoster.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1005363_8424.pdf"; name="842.4-PatientCareLog.pdf"},
    
    # Index
    @{url="https://file.lacounty.gov/SDSInter/dhs/207223_800TableofContentsCP09-01-15.pdf"; name="800-TableOfContents.pdf"}
)

$success = 0
$failed = @()

foreach ($p in $protocols) {
    $outPath = Join-Path $DestDir $p.name
    try {
        Write-Host "Downloading $($p.name)..."
        Invoke-WebRequest -Uri $p.url -OutFile $outPath -ErrorAction Stop
        $success++
    } catch {
        Write-Host "FAILED: $($p.name) - $($_.Exception.Message)" -ForegroundColor Red
        $failed += $p.name
    }
}

Write-Host "`n=== REF 800 DOWNLOAD COMPLETE ==="
Write-Host "Success: $success"
Write-Host "Failed: $($failed.Count)"
if ($failed.Count -gt 0) {
    Write-Host "Failed files:"
    $failed | ForEach-Object { Write-Host "  - $_" }
}
