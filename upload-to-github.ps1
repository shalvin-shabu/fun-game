param(
    [string]$RepoUrl = 'https://github.com/shalvin-shabu/fun-game.git'
)

function Write-Info($m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn($m) { Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err($m) { Write-Host "[ERROR] $m" -ForegroundColor Red }

Write-Info "Script started. Target remote: $RepoUrl"

# Resolve repository directory (script location)
$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $RepoDir
Write-Info "Working directory: $RepoDir"

function GitAvailable {
    try { git --version > $null 2>&1; return $true } catch { return $false }
}

if (-not (GitAvailable)) {
    Write-Warn "Git CLI not found in PATH. Attempting to install using winget if available..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        $confirm = Read-Host "winget is available. Install Git for Windows now? (Y/N)"
        if ($confirm -match '^[Yy]') {
            Write-Info "Running: winget install --id Git.Git -e --source winget"
            winget install --id Git.Git -e --source winget
            Write-Info "Install finished. You may need to restart your shell before git is available. Re-checking..."
            Start-Sleep -Seconds 2
        } else {
            Write-Err "Git must be installed to continue. Install Git manually from https://git-scm.com/download/win and re-run this script."
            exit 1
        }
    } else {
        Write-Err "winget not found. Please install Git for Windows from https://git-scm.com/download/win and re-run this script."
        exit 1
    }
}

if (-not (GitAvailable)) {
    Write-Err "Git still not available. Please open a new PowerShell window (so PATH is refreshed) or install Git manually, then re-run this script."
    exit 1
}

Write-Info "Git found: $(git --version)"

# Create helpful files if missing
if (-not (Test-Path -Path .gitignore)) {
    @"# Ignore common files
node_modules/
.vscode/
.DS_Store
*.log

# Build artifacts
dist/
build/
"@ | Out-File -FilePath .gitignore -Encoding utf8
    Write-Info "Created .gitignore"
}

if (-not (Test-Path -Path README.md)) {
    @"# fun

Small static web game. This repository was uploaded from a local workspace using upload-to-github.ps1.

Files:
- index.html
- game.js
- style.css
- sounds/
"@ | Out-File -FilePath README.md -Encoding utf8
    Write-Info "Created README.md"
}

# Initialize repo if needed
if (-not (Test-Path -Path .git\config)) {
    Write-Info "Initializing new git repository (branch: main)"
    git init -b main
} else {
    Write-Info "Existing git repository detected"
}

# Set remote
try { git remote remove origin 2>$null } catch {}
git remote add origin $RepoUrl 2>$null
Write-Info "Remote 'origin' set to $RepoUrl"

# Stage and commit
git add .
try {
    git commit -m "Initial commit from local workspace"
    Write-Info "Committed local files"
} catch {
    Write-Warn "No changes to commit or commit failed: $($_.Exception.Message)"
}

# Ensure branch name
git branch -M main 2>$null

Write-Info "Pushing to remote 'origin' (main). This may prompt for GitHub credentials or PAT."
try {
    git push -u origin main
    Write-Info "Push appears to have completed. Verify repository on GitHub: $RepoUrl"
} catch {
    Write-Err "Push failed: $($_.Exception.Message)"
    Write-Host "If authentication failed, use a Personal Access Token (PAT) instead of password. See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
    Write-Host "Or set up SSH and use the SSH remote: git@github.com:shalvin-shabu/fun-game.git"
    exit 1
}

Write-Info "Done."
