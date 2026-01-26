# Download Riverside County EMS Protocols
# Source: rivcoready.org and Google Drive

$outputDir = "C:\Users\Tanner\Protocol-Guide\data\riverside-protocols"
$baseUrl = "https://rivcoready.org/sites/g/files/aldnop181/files"

# Known protocol PDFs from search results and website
$protocols = @(
    # Treatment Protocols (4000 series)
    @{ num = "4101"; name = "Introduction to Treatment Protocols"; folder = "2023-10" }
    @{ num = "4102"; name = "Adult Assessment"; folder = "2023-10" }
    @{ num = "4103"; name = "Pediatric Assessment"; folder = "2023-10" }
    @{ num = "4104"; name = "Patient Assessment Trauma"; folder = "2023-10" }
    @{ num = "4201"; name = "Cardiac Arrest"; folder = "2023-10" }
    @{ num = "4202"; name = "Ventricular Fibrillation"; folder = "2023-10" }
    @{ num = "4203"; name = "Pulseless Electrical Activity"; folder = "2023-10" }
    @{ num = "4204"; name = "Asystole"; folder = "2023-10" }
    @{ num = "4301"; name = "Respiratory Distress"; folder = "2023-10" }
    @{ num = "4302"; name = "Airway Management"; folder = "2023-10" }
    @{ num = "4401"; name = "Chest Pain ACS"; folder = "2023-10" }
    @{ num = "4402"; name = "Bradycardia"; folder = "2023-10" }
    @{ num = "4403"; name = "Tachycardia"; folder = "2023-10" }
    @{ num = "4501"; name = "Altered Mental Status"; folder = "2023-10" }
    @{ num = "4502"; name = "Seizure"; folder = "2023-10" }
    @{ num = "4503"; name = "Stroke"; folder = "2023-10" }
    @{ num = "4601"; name = "Trauma"; folder = "2023-10" }
    @{ num = "4602"; name = "Burns"; folder = "2023-10" }
    @{ num = "4701"; name = "Allergic Reaction Anaphylaxis"; folder = "2023-10" }
    @{ num = "4702"; name = "Overdose Poisoning"; folder = "2023-10" }
    @{ num = "4801"; name = "Obstetrics"; folder = "2023-10" }
    @{ num = "4901"; name = "Pediatric"; folder = "2023-10" }
)

Write-Host "Downloading Riverside County EMS Protocols..."
Write-Host "Output directory: $outputDir"

$downloaded = 0
$failed = 0

foreach ($p in $protocols) {
    $url = "$baseUrl/$($p.folder)/$($p.num).pdf"
    $output = "$outputDir\$($p.num)-$($p.name -replace '[^\w\s-]','').pdf"
    
    Write-Host "  Trying $($p.num)..." -NoNewline
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing -ErrorAction Stop
        $size = (Get-Item $output).Length
        Write-Host " OK ($size bytes)"
        $downloaded++
    } catch {
        Write-Host " Not found or error"
        $failed++
        # Try alternate folder patterns
        $altFolders = @("2024-01", "2024-06", "2025-01", "2025-06")
        foreach ($alt in $altFolders) {
            $altUrl = "$baseUrl/$alt/$($p.num).pdf"
            try {
                Invoke-WebRequest -Uri $altUrl -OutFile $output -UseBasicParsing -ErrorAction Stop
                $size = (Get-Item $output).Length
                Write-Host "    Found in $alt ($size bytes)"
                $downloaded++
                $failed--
                break
            } catch {}
        }
    }
}

Write-Host "`n=== Download Summary ==="
Write-Host "Downloaded: $downloaded"
Write-Host "Failed: $failed"

# List all downloaded files
Write-Host "`nDownloaded files:"
Get-ChildItem $outputDir -Filter "*.pdf" | ForEach-Object {
    Write-Host "  $($_.Name) - $($_.Length) bytes"
}
