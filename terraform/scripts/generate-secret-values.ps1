# PowerShell script to generate secret values for manual entry in Azure Key Vault
# This script reads the credentials.yml file and generates the secret values
# that should be manually entered in the Azure portal

param(
    [string]$CredentialsFile = "config/credentials.yml"
)

# Read the credentials YAML file
$credentialsContent = Get-Content $CredentialsFile -Raw

Write-Host "=== EU Test Credentials - Secret Values for Manual Entry ===" -ForegroundColor Green
Write-Host ""

# Parse the YAML content manually (simple parsing for our specific format)
$lines = $credentialsContent -split "`n"
$currentCred = @{}
$credentials = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].Trim()
    
    if ($line -match "^- opco: (.+)") {
        if ($currentCred.Count -gt 0) {
            $credentials += $currentCred.Clone()
        }
        $currentCred = @{
            opco = $matches[1]
        }
    }
    elseif ($line -match "testCategory: (.+)") {
        $currentCred.testCategory = $matches[1]
    }
    elseif ($line -match "testName: (.+)") {
        $currentCred.testName = $matches[1]
    }
    elseif ($line -match "username: (.+)") {
        $currentCred.username = $matches[1]
    }
    elseif ($line -match "password: (.+)") {
        $currentCred.password = $matches[1]
    }
}

# Add the last credential
if ($currentCred.Count -gt 0) {
    $credentials += $currentCred
}

# Display the secrets
foreach ($cred in $credentials) {
    $secretName = "$($cred.opco)-$($cred.testCategory)"
    if ($cred.testName) {
        $secretName += "-$($cred.testName)"
    }
    
    Write-Host "Secret Name: $secretName" -ForegroundColor Yellow
    Write-Host "  Opco: $($cred.opco)"
    Write-Host "  Test Category: $($cred.testCategory)"
    if ($cred.testName) {
        Write-Host "  Test Name: $($cred.testName)"
    }
    Write-Host "  Username: $($cred.username)"
    Write-Host "  Password: $($cred.password)"
    Write-Host ""
}

Write-Host "=== Instructions ===" -ForegroundColor Green
Write-Host "1. Go to your Azure Key Vault in the Azure portal"
Write-Host "2. Navigate to 'Secrets' section"
Write-Host "3. For each secret above, click 'Generate/Import'"
Write-Host "4. Enter the secret name and the corresponding password value"
Write-Host "5. Set activation date to today"
Write-Host "6. Set expiration date as needed"
Write-Host "7. Click 'Create'"
Write-Host ""
Write-Host "Note: The username is stored in the secret tags for reference" 