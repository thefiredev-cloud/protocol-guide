$DestDir = "C:\Users\Tanner\Protocol-Guide\data\la-county-protocols"

# REF 1200 Treatment Protocols
$protocols = @(
    # Table of Contents and Instructions
    @{url="https://file.lacounty.gov/SDSInter/dhs/1187409_1200.0TableofContents.pdf"; name="1200.0-TableofContents.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1053470_1200.1GeneralInstructions2018-07-01.pdf"; name="1200.1-GeneralInstructions.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040504_1200.2BaseContactRequirements.pdf"; name="1200.2-BaseContactRequirements.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179866_1200.3ProviderImpression.pdf"; name="1200.3-ProviderImpressions.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040361_1200.4BLSUpgradetoALSAssessment2018-04-30.pdf"; name="1200.4-BLSUpgradetoALS.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040378_1201Assessment2018-04-30.pdf"; name="1201-Assessment.pdf"},
    
    # General Medical
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040379_1202GeneralMedical2018-04-25.pdf"; name="1202-GeneralMedical.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040455_1202-PGeneralMedical2018-04-25.pdf"; name="1202-P-GeneralMedical.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040380_1203DiabeticEmergencies2018-05-30.pdf"; name="1203-DiabeticEmergencies.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040456_1203-PDiabeticEmergencies2018-05-30.pdf"; name="1203-P-DiabeticEmergencies.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040381_1204FeverSepsis2018-04-24.pdf"; name="1204-FeverSepsis.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040457_1204-PFeverSepsis2018-04-24.pdf"; name="1204-P-FeverSepsis.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040382_1205GIGU2018-04-24.pdf"; name="1205-GIGU.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040458_1205-PGI-GUEmergencies2018-04-24.pdf"; name="1205-P-GIGUEmergencies.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040383_1206MedicalDeviceMalfunction2018-04-24.pdf"; name="1206-MedicalDeviceMalfunction.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040459_1206-PMedicalDeviceMalfunction2018-04-24.pdf"; name="1206-P-MedicalDeviceMalfunction.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040509_1207Shock-Hypotension.pdf"; name="1207-ShockHypotension.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040510_1207-PShock-Hypotension.pdf"; name="1207-P-ShockHypotension.pdf"},
    
    # Behavioral
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040386_1209Behavioral_PsychiatricCrisis2018-04-25.pdf"; name="1209-BehavioralPsychiatricCrisis.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040462_1209-PBehavioralPsychCrisis2018-04-24.pdf"; name="1209-P-BehavioralPsychCrisis.pdf"},
    
    # Cardiovascular/Chest Pain
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040387_1210CardiacArrest2018-05-30.pdf"; name="1210-CardiacArrest.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179867_1210-PCardiacArrest.pdf"; name="1210-P-CardiacArrest.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040388_1211CardiacChestPain2018-04-25.pdf"; name="1211-CardiacChestPain.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040389_1212CardiacDysrhythmia-Bradycardia2018-04-25.pdf"; name="1212-CardiacBradycardia.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040512_1212-PCardiacDysrhythmia-Bradycardia.pdf"; name="1212-P-CardiacBradycardia.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040391_1213CardiacDysrhythmia-Tachycardia2018-04-29.pdf"; name="1213-CardiacTachycardia.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179868_1213-PCardiacDysrhythmia-Tachycardia.pdf"; name="1213-P-CardiacTachycardia.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040395_1214PulmonaryEdema2018-04-25.pdf"; name="1214-PulmonaryEdema.pdf"},
    
    # Childbirth/Pregnancy
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040396_1215ChildbirthMother2018-04-29.pdf"; name="1215-ChildbirthMother.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040466_1215-PChildbirthMother2018-04-29.pdf"; name="1215-P-ChildbirthMother.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040513_1216-PNewborn_NeonatalResus.pdf"; name="1216-P-NeonatalResuscitation.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040397_1217PregnancyComplication2018-04-29.pdf"; name="1217-PregnancyComplication.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040468_1217-PPregnancyComplication2018-04-29.pdf"; name="1217-P-PregnancyComplication.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040469_1218PregnancyLabor2018-04-25.pdf"; name="1218-PregnancyLabor.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1053878_1218-PPregnancyLabor2018-06-01.pdf"; name="1218-P-PregnancyLabor.pdf"},
    
    # Environmental
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040399_1219Allergy2018-05-30.pdf"; name="1219-Allergy.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040515_1219-PAllergy.pdf"; name="1219-P-Allergy.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040400_1220Burns2018-04-24.pdf"; name="1220-Burns.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040471_1220-PBurns2018-04-24.pdf"; name="1220-P-Burns.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206100_1221.pdf"; name="1221-Electrocution.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040472_1221-PElectrocution2018-04-25.pdf"; name="1221-P-Electrocution.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040402_1222Hyperthermia_Environmental2018-04-24.pdf"; name="1222-Hyperthermia.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040473_1222-PHyperthermia_Environmental_2018-04-24.pdf"; name="1222-P-Hyperthermia.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040403_1223Hypothermia_ColdInjury2018-04-24.pdf"; name="1223-HypothermiaColdInjury.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040474_1223-PHypothermia-ColdInjury2018-04-24.pdf"; name="1223-P-HypothermiaColdInjury.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040404_1224Stings_VenomousBites2018-04-24.pdf"; name="1224-StingsVenomousBites.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040475_1224-PStings-VenomousBites2018-04-24.pdf"; name="1224-P-StingsVenomousBites.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040405_1225Submersion2018-04-24.pdf"; name="1225-Submersion.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040476_1225-PSubmersion2018-04-24.pdf"; name="1225-P-Submersion.pdf"},
    
    # ENT
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040406_1226ENTDentalEmergencies2018-04-24.pdf"; name="1226-ENTDental.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040477_1226-PENTDentalEmergencies2018-04-24.pdf"; name="1226-P-ENTDental.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040407_1228EyeProblem-Unspecified2018-04-24.pdf"; name="1228-EyeProblem.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040479_1228-PEyeProblem2018-04-24.pdf"; name="1228-P-EyeProblem.pdf"},
    
    # Neurology
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040408_1229ALOC2018-04-25.pdf"; name="1229-ALOC.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040480_1229-PALOC2018-04-25.pdf"; name="1229-P-ALOC.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040409_1230Dizziness_Vertigo2018-04-24.pdf"; name="1230-DizzinessVertigo.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040481_1230-PDizziness_Vertigo2018-04-24.pdf"; name="1230-P-DizzinessVertigo.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040410_1231Seizure2018-04-25.pdf"; name="1231-Seizure.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179869_1231-PSeizure.pdf"; name="1231-P-Seizure.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040516_1232StrokeCVATIA.pdf"; name="1232-StrokeCVATIA.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040483_1232-PStroke_CVA_TIA2018-04-25.pdf"; name="1232-P-StrokeCVATIA.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206106_1233.pdf"; name="1233-SyncopeNearSyncope.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040484_1233-PSyncope_NearSyncope2018-04-24.pdf"; name="1233-P-SyncopeNearSyncope.pdf"},
    
    # Respiratory
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040413_1234Airwayobstruction2018-04-24.pdf"; name="1234-AirwayObstruction.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040485_1234-PAirwayObstruction2018-04-25.pdf"; name="1234-P-AirwayObstruction.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040486_1235-PBRUE2018-04-29.pdf"; name="1235-P-BRUE.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179870_1236InhalationInjury.pdf"; name="1236-InhalationInjury.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179871_1236-PInhalationInjury.pdf"; name="1236-P-InhalationInjury.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179872_1237RespDistress.pdf"; name="1237-RespiratoryDistress.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179873_1237-PRespiratoryDistress.pdf"; name="1237-P-RespiratoryDistress.pdf"},
    
    # Toxicology
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179874_1238CarbonMonoxidePoisoning.pdf"; name="1238-CarbonMonoxide.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179875_1238-PCarbonMonoxideExposure.pdf"; name="1238-P-CarbonMonoxide.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040417_1239DystonicReaction2018-04-24.pdf"; name="1239-DystonicReaction.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040490_1239-PDystonicReaction2018-04-24.pdf"; name="1239-P-DystonicReaction.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179876_1240HAZMAT.pdf"; name="1240-HAZMAT.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179877_1240-PHAZMAT.pdf"; name="1240-P-HAZMAT.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/206108_1241.pdf"; name="1241-OverdosePoisoning.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040492_1241-POverdose_Poisoning_Ingestion2018-04-25.pdf"; name="1241-P-OverdosePoisoning.pdf"},
    
    # Trauma
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179878_1242CrushInjury.pdf"; name="1242-CrushInjury.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179879_1242-PCrushInjury-Syndrome.pdf"; name="1242-P-CrushInjury.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040421_1243TraumaticArrest2018-04-25.pdf"; name="1243-TraumaticArrest.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1040494_1243-PTraumaticArrest2018-04-25.pdf"; name="1243-P-TraumaticArrest.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179880_1244TraumaticInjury.pdf"; name="1244-TraumaticInjury.pdf"},
    @{url="https://file.lacounty.gov/SDSInter/dhs/1179881_1244-PTraumaticInjury.pdf"; name="1244-P-TraumaticInjury.pdf"}
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

Write-Host "`n=== DOWNLOAD COMPLETE ==="
Write-Host "Success: $success"
Write-Host "Failed: $($failed.Count)"
if ($failed.Count -gt 0) {
    Write-Host "Failed files:"
    $failed | ForEach-Object { Write-Host "  - $_" }
}
