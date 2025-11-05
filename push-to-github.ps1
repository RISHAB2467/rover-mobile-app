# Quick GitHub Push Script
# This script will authenticate and push your repo to GitHub

Write-Host "=== Rover Mobile App - GitHub Push ===" -ForegroundColor Cyan
Write-Host ""

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if gh is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI not found in PATH" -ForegroundColor Red
    Write-Host "Please close and reopen PowerShell, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "GitHub CLI version:" -ForegroundColor Green
gh --version
Write-Host ""

# Check authentication
Write-Host "Checking GitHub authentication..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1 | Out-String

if ($authStatus -match "Logged in") {
    Write-Host "✓ Already authenticated!" -ForegroundColor Green
} else {
    Write-Host "Need to authenticate with GitHub..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting browser-based login..." -ForegroundColor Cyan
    Write-Host "1. A browser window will open" -ForegroundColor White
    Write-Host "2. Copy the code that appears" -ForegroundColor White
    Write-Host "3. Paste it in the browser and authorize" -ForegroundColor White
    Write-Host ""
    
    # Authenticate
    gh auth login --git-protocol https --web
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Authentication failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Creating GitHub Repository ===" -ForegroundColor Cyan

# Repository name
$repoName = "rover-mobile-app"

# Check if repo already exists
$username = gh api user --jq .login
Write-Host "GitHub username: $username" -ForegroundColor Green

$repoExists = $false
gh repo view "$username/$repoName" 2>$null
if ($LASTEXITCODE -eq 0) {
    $repoExists = $true
    Write-Host "Repository already exists: https://github.com/$username/$repoName" -ForegroundColor Yellow
    $response = Read-Host "Push to existing repo? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Cancelled." -ForegroundColor Red
        exit 0
    }
} else {
    Write-Host "Creating new public repository: $repoName" -ForegroundColor Green
    gh repo create $repoName --public --source=. --remote=origin
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create repository" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Pushing to GitHub ===" -ForegroundColor Cyan

# Push to GitHub
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓✓✓ SUCCESS! ✓✓✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL: https://github.com/$username/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening in browser..." -ForegroundColor Yellow
    Start-Process "https://github.com/$username/$repoName"
} else {
    Write-Host "ERROR: Push failed" -ForegroundColor Red
    Write-Host "You may need to set the remote manually:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/$username/$repoName.git" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    exit 1
}
