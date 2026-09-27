$ErrorActionPreference = "Stop"

Write-Host "CRAI 2.0 frontend installer" -ForegroundColor Green

$frontend = Get-Location
if (-not (Test-Path ".\package.json")) {
    throw "Run this script from your CRAI-private\frontend folder."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\src-backup-$stamp"

if (Test-Path ".\src") {
    Copy-Item ".\src" $backup -Recurse -Force
    Write-Host "Backup created: $backup" -ForegroundColor Cyan
}

$zip = Join-Path $PSScriptRoot "CRAI_2.0_src.zip"
if (-not (Test-Path $zip)) {
    throw "CRAI_2.0_src.zip not found beside this installer."
}

if (Test-Path ".\src") {
    Remove-Item ".\src" -Recurse -Force
}

$temp = Join-Path $env:TEMP "crai20-src-install"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
Expand-Archive $zip $temp -Force
Copy-Item (Join-Path $temp "src") ".\src" -Recurse -Force
Remove-Item $temp -Recurse -Force

Write-Host ""
Write-Host "CRAI 2.0 src installed." -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Yellow
Write-Host "1. Ensure .env contains VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_API_URL."
Write-Host "2. Run: npm run dev"
Write-Host "3. Open: http://127.0.0.1:5173"
Write-Host ""
Write-Host "Routes:"
Write-Host "/           Farmer Home"
Write-Host "/fields     My Fields"
Write-Host "/alerts     Alerts"
Write-Host "/ask-crai   Ask CRAI"
Write-Host "/expert     Expert Console"
Write-Host "/demo       SIH Demo Mode"
Write-Host "/settings   Settings"
