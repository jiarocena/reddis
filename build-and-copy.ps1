# ============================================================
# Build & Deploy Script — REDDIS
# Builds React frontend and copies into Spring Boot static dir
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " REDDIS — Build & Package" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$frontendDir = "c:\Users\Usuario\Desktop\REDDIS"
$backendDir = "c:\Users\Usuario\Desktop\SistemaRegistroDiscapacidad"
$staticDir = "$backendDir\src\main\resources\static"

# Step 1: Build React Frontend
Write-Host "`n[1/3] Building React frontend..." -ForegroundColor Yellow
Push-Location $frontendDir
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Step 2: Copy to Spring Boot static
Write-Host "`n[2/3] Copying to Spring Boot static resources..." -ForegroundColor Yellow
if (Test-Path $staticDir) {
    Remove-Item -Recurse -Force "$staticDir\*" -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path $staticDir -Force | Out-Null
}
Copy-Item -Recurse "$frontendDir\dist\*" $staticDir
Write-Host "  Copied $(Get-ChildItem -Recurse $staticDir | Measure-Object).Count files" -ForegroundColor Green

# Step 3: Package JAR
Write-Host "`n[3/3] Building Spring Boot JAR..." -ForegroundColor Yellow
Push-Location $backendDir
mvn package -DskipTests -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Maven build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

$jar = Get-ChildItem "$backendDir\target\*.jar" -Exclude "*-sources*" | Select-Object -First 1
Write-Host "`n========================================" -ForegroundColor Green
Write-Host " BUILD COMPLETE!" -ForegroundColor Green
Write-Host " JAR: $($jar.Name) ($([math]::Round($jar.Length/1MB, 1)) MB)" -ForegroundColor Green
Write-Host ""
Write-Host " Run locally with:" -ForegroundColor White
Write-Host "   java -jar $($jar.FullName)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
