$ErrorActionPreference = "Stop"
$newPostgresPassword = "TonNouveauMdpPostgres"
$brewflowPassword    = "TonMdpBrewflow"
$pgBin  = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$pgData = "C:\Program Files\PostgreSQL\17\data"
$hba    = Join-Path $pgData "pg_hba.conf"
$hbaBak = "$hba.bak.powershell"
$svc    = "postgresql-x64-17"

$id = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$p  = New-Object System.Security.Principal.WindowsPrincipal($id)
if (-not $p.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERREUR : pas admin." -ForegroundColor Red
    Read-Host "Appuie sur Entrée"; throw
}
if ($newPostgresPassword -match "'" -or $brewflowPassword -match "'") {
    Write-Host "ERREUR : pas d'apostrophe dans les mdp." -ForegroundColor Red
    Read-Host "Appuie sur Entrée"; throw
}

Write-Host "[1/7] Sauvegarde..."
Copy-Item -LiteralPath $hba -Destination $hbaBak -Force

Write-Host "[2/7] Auth locale en trust..."
$lines = Get-Content -LiteralPath $hba | ForEach-Object {
    if     ($_ -match '^(local\s+all\s+all\s+).*$')                    { $matches[1] + 'trust' }
    elseif ($_ -match '^(host\s+all\s+all\s+127\.0\.0\.1/32\s+).*$')  { $matches[1] + 'trust' }
    elseif ($_ -match '^(host\s+all\s+all\s+::1/128\s+).*$')           { $matches[1] + 'trust' }
    else { $_ }
}
[System.IO.File]::WriteAllLines($hba, $lines, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "[3/7] Restart service..."
Restart-Service -Name $svc -Force; Start-Sleep 3

Write-Host "[4/7] Reset + creation role/base..."
& $pgBin -U postgres -h localhost -c "ALTER USER postgres WITH PASSWORD '$newPostgresPassword';"
& $pgBin -U postgres -h localhost -c "CREATE ROLE brewflow WITH LOGIN PASSWORD '$brewflowPassword';"
& $pgBin -U postgres -h localhost -c "CREATE DATABASE brewflow OWNER brewflow;"

Write-Host "[5/7] Restauration config..."
Copy-Item -LiteralPath $hbaBak -Destination $hba -Force
Remove-Item -LiteralPath $hbaBak -Force

Write-Host "[6/7] Re-restart..."
Restart-Service -Name $svc -Force; Start-Sleep 3

Write-Host "[7/7] Verification (doit afficher 1)..."
$env:PGPASSWORD = $brewflowPassword
& $pgBin -U brewflow -h localhost -d brewflow -c "SELECT 1;"
$env:PGPASSWORD = $newPostgresPassword
& $pgBin -U postgres -h localhost -c "SELECT 1;"

Write-Host "TERMINE : postgres=$newPostgresPassword / brewflow=$brewflowPassword" -ForegroundColor Green
Read-Host "Appuie sur Entrée pour fermer"