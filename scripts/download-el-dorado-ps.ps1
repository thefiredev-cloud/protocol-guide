
# Download El Dorado County PDFs from Wayback Machine
# PowerShell script that handles redirects properly

$PDF_DIR = "C:\Users\Tanner\Protocol-Guide\data\el-dorado-protocols"
$BASE_URL = "https://www.eldoradocounty.ca.gov"
$ARCHIVE_PREFIX = "https://web.archive.org/web/2024/"

# Create directory if it doesn't exist
if (-not (Test-Path $PDF_DIR)) {
    New-Item -ItemType Directory -Path $PDF_DIR | Out-Null
}

# PDF URL paths
$PDF_URLS = @(
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/bradycardia.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/pulseless-arrest.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/32-pain-management.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/burns.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/30general-trauma.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/childbirth.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/dnr.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stroke.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/29seizures.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/heat-illness.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/cold-exposures.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/drowning-event.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/cpap.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/12-lead-ecg.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/15head-trauma.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/31hemorrhage-control.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/neonatal-resuscitation.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/14glycemic-emergencies.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/naloxone.pdf",
    "/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/epinephrine.pdf"
)

Write-Host "Downloading El Dorado County PDFs from Wayback Machine"
Write-Host "======================================================="

$downloaded = 0
$skipped = 0
$failed = 0
$total = $PDF_URLS.Count

foreach ($i in 0..($PDF_URLS.Count - 1)) {
    $urlPath = $PDF_URLS[$i]
    $filename = [System.IO.Path]::GetFileName($urlPath)
    $destPath = Join-Path $PDF_DIR $filename
    $archiveUrl = $ARCHIVE_PREFIX + $BASE_URL + $urlPath

    # Skip if already downloaded
    if ((Test-Path $destPath) -and ((Get-Item $destPath).Length -gt 1000)) {
        Write-Host "[$($i + 1)/$total] $filename - SKIP (exists)"
        $skipped++
        continue
    }

    Write-Host -NoNewline "[$($i + 1)/$total] $filename - downloading..."

    try {
        Invoke-WebRequest -Uri $archiveUrl -OutFile $destPath -TimeoutSec 30 -ErrorAction Stop
        $fileSize = (Get-Item $destPath).Length
        
        if ($fileSize -gt 1000) {
            Write-Host " OK ($fileSize bytes)"
            $downloaded++
        } else {
            Write-Host " FAIL (too small)"
            Remove-Item $destPath -ErrorAction SilentlyContinue
            $failed++
        }
    } catch {
        Write-Host " FAIL ($_)"
        $failed++
    }

    # Rate limit
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "============================================"
Write-Host "Complete!"
Write-Host "Downloaded: $downloaded"
Write-Host "Skipped: $skipped"
Write-Host "Failed: $failed"
Write-Host "============================================"
