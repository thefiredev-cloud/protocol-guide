# Santa Clara County EMS Protocols URL Scraper
# This script uses curl to fetch all pages and extract PDF URLs

$baseUrl = "https://ems.santaclaracounty.gov/services/find-ems-policies-protocols-and-plans"
$outputFile = "C:\Users\Tanner\Protocol-Guide\data\santa-clara-protocols\protocol-urls.json"

# Create output directory if it doesn't exist
$dir = Split-Path $outputFile
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force
}

# Fetch the page and extract URLs using regex
$allUrls = @()

Write-Host "Fetching Santa Clara County EMS protocols page..."

try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -Headers @{
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # Extract all PDF URLs from files.santaclaracounty.gov
    $pattern = 'href="(https://files\.santaclaracounty\.gov/[^"]+\.pdf[^"]*)"[^>]*>([^<]+)'
    $matches = [regex]::Matches($response.Content, $pattern)
    
    foreach ($match in $matches) {
        $url = $match.Groups[1].Value
        $title = $match.Groups[2].Value.Trim()
        
        # Skip fee schedule
        if ($title -notlike "*Fee Schedule*") {
            $allUrls += @{
                url = $url
                title = $title
            }
        }
    }
    
    Write-Host "Found $($allUrls.Count) protocol URLs on first page"
    
} catch {
    Write-Host "Error fetching page: $_"
}

# Save to JSON
$allUrls | ConvertTo-Json -Depth 3 | Set-Content $outputFile -Encoding UTF8

Write-Host "Saved $($allUrls.Count) URLs to $outputFile"
