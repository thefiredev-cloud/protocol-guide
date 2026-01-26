$ErrorActionPreference = "Continue"
$baseUrl = "https://dhs.saccounty.gov"
$outputDir = "C:\Users\Tanner\Protocol-Guide\data\sacramento-protocols"

# Policy section pages to scrape
$sectionPages = @(
    "/PUB/EMS/Pages/Policy%20Pages/GI-2000-EMS-SYSTEM.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-4000-ACCREDITATION-CERTIFICATION-PROGRAM-APPROVAL.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-5000-TRANSPORTATION-PATIENT-DESTINATION.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-5500-EQUIPMENT-SUPPLIES-VEHICLES.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-6000-CRITICAL-CARE-SYSTEMS.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-7500-DISASTER-MEDICAL-SERVICE.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-7600-Quality-Improvment.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-8000-ADULT-TREATMENT-POLICIES.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-8800-OPTIONAL-SKILLS.aspx",
    "/PUB/EMS/Pages/Policy%20Pages/GI-9000-PEDIATRIC-TREATMENT-POLICIES.aspx",
    "/PUB/EMS/Pages/Trial-Study-Policies.aspx"
)

# Direct PDF links from main page
$directPdfs = @(
    "https://dhs.saccounty.gov/PUB/EMS/Documents/PoliciesProceduresProtocols/Drug%20Reference%20Guide%202024-%20Effective%2011.1.2025.pdf"
)

$allPdfUrls = @()

# Collect PDFs from section pages
foreach ($page in $sectionPages) {
    $url = "$baseUrl$page"
    Write-Host "Scraping: $url"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
        $links = $response.Links | Where-Object { $_.href -match "\.pdf$" }
        foreach ($link in $links) {
            $pdfUrl = $link.href
            if ($pdfUrl -notmatch "^https?://") {
                $pdfUrl = "$baseUrl$pdfUrl"
            }
            $allPdfUrls += $pdfUrl
        }
        Write-Host "  Found $($links.Count) PDFs"
    } catch {
        Write-Host "  Error: $_"
    }
    Start-Sleep -Milliseconds 500
}

# Add direct PDFs
$allPdfUrls += $directPdfs

# Remove duplicates
$allPdfUrls = $allPdfUrls | Sort-Object -Unique

Write-Host "`nTotal unique PDFs found: $($allPdfUrls.Count)"

# Download each PDF
$downloaded = 0
$failed = @()

foreach ($pdfUrl in $allPdfUrls) {
    $fileName = [System.Web.HttpUtility]::UrlDecode(($pdfUrl -split "/")[-1])
    $outputPath = Join-Path $outputDir $fileName
    
    if (Test-Path $outputPath) {
        Write-Host "  Skipping (exists): $fileName"
        $downloaded++
        continue
    }
    
    Write-Host "Downloading: $fileName"
    try {
        Invoke-WebRequest -Uri $pdfUrl -OutFile $outputPath -UseBasicParsing -TimeoutSec 60
        $downloaded++
        Write-Host "  Saved: $fileName"
    } catch {
        Write-Host "  Failed: $_"
        $failed += @{ Url = $pdfUrl; Error = $_.ToString() }
    }
    Start-Sleep -Milliseconds 300
}

Write-Host "`n=== Download Summary ==="
Write-Host "Total PDFs: $($allPdfUrls.Count)"
Write-Host "Downloaded: $downloaded"
Write-Host "Failed: $($failed.Count)"

if ($failed.Count -gt 0) {
    Write-Host "`nFailed downloads:"
    foreach ($f in $failed) {
        Write-Host "  $($f.Url)"
    }
}

# Save manifest
$manifest = @{
    agency_name = "Sacramento County EMS Agency"
    state_code = "CA"
    source_url = "https://dhs.saccounty.net/PUB/EMS/Pages/Policy%20Pages/Policies.aspx"
    scraped_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    total_files = $allPdfUrls.Count
    downloaded = $downloaded
    failed = $failed.Count
    files = $allPdfUrls | ForEach-Object { [System.Web.HttpUtility]::UrlDecode(($_ -split "/")[-1]) }
}
$manifest | ConvertTo-Json -Depth 3 | Out-File (Join-Path $outputDir "manifest.json") -Encoding UTF8

Write-Host "`nManifest saved to manifest.json"
