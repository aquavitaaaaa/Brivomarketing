# Brivo Auto-Poster -- one-click installer for Windows (Khaelyx host agent).
#
# Run from PowerShell (NOT Command Prompt):
#   irm https://brivomarketing.com/agent-host/install.ps1 | iex
#
# Or with the pair code prefilled:
#   $env:BRIVO_CODE="123456"; $env:BRIVO_NAME="ASUS"; irm https://brivomarketing.com/agent-host/install.ps1 | iex

[CmdletBinding()]
param(
    [string]$Code     = $env:BRIVO_CODE,
    [string]$Name     = $env:BRIVO_NAME,
    [string]$Backend  = $(if ($env:BRIVO_BACKEND_URL) { $env:BRIVO_BACKEND_URL } else { "https://brivomarketing.com" })
)

$ErrorActionPreference = "Stop"

$AppHome     = Join-Path $env:LOCALAPPDATA "BrivoAgent"
$VenvPython  = Join-Path $AppHome "venv\Scripts\python.exe"
$VenvPip     = Join-Path $AppHome "venv\Scripts\pip.exe"
$AgentPy     = Join-Path $AppHome "agent.py"
$LoginPs1    = Join-Path $AppHome "login.ps1"
$TaskName    = "BrivoMarketingAgent"

function Write-Stage($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok   ($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn2($msg) { Write-Host "[!] $msg" -ForegroundColor Yellow }

Write-Host "BrivoMarketing Auto-Poster -- Windows installer" -ForegroundColor White
Write-Host "  Backend:    $Backend"
Write-Host "  Install at: $AppHome"

# ---- 1. Python 3.11 via winget (or check existing) ---------------------------
Write-Stage "Checking for Python 3.11+"
$python = $null
foreach ($cmd in @("python", "py", "python3.11", "python3")) {
    try {
        $v = & $cmd --version 2>$null
        if ($v -match "Python 3\.(1[1-9]|[2-9][0-9])") { $python = $cmd; break }
    } catch {}
}

if (-not $python) {
    Write-Stage "Installing Python 3.11 via winget"
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "winget is not available. Install Python 3.11+ manually from https://www.python.org/downloads/ then re-run this script."
    }
    winget install -e --id Python.Python.3.11 --accept-source-agreements --accept-package-agreements --silent
    $env:Path = "$env:LOCALAPPDATA\Programs\Python\Python311;$env:LOCALAPPDATA\Programs\Python\Python311\Scripts;" + $env:Path
    $python = "python"
}
Write-Ok "Python: $(& $python --version)"

# ---- 2. App dir + venv -------------------------------------------------------
New-Item -ItemType Directory -Force -Path $AppHome | Out-Null
if (-not (Test-Path $VenvPython)) {
    Write-Stage "Creating venv"
    & $python -m venv (Join-Path $AppHome "venv")
}

Write-Stage "Installing Python deps"
& $VenvPip install --quiet --upgrade pip
& $VenvPip install --quiet websockets httpx playwright

Write-Stage "Installing Chromium (~150 MB, one-time)"
& $VenvPython -m playwright install chromium

# ---- 3. Drop agent.py + login.ps1 -------------------------------------------
Write-Stage "Downloading latest agent.py"
Invoke-WebRequest -Uri "$Backend/agent-host/agent.py" -OutFile $AgentPy -UseBasicParsing

@"
# Open the persistent Chromium so you can manually log into IG/X/LinkedIn.
& "$VenvPython" - <<'PY'
import asyncio, os
from playwright.async_api import async_playwright
async def main():
    profile = os.path.expanduser('~/.brivo_agent/chromium-profile')
    os.makedirs(profile, exist_ok=True)
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            profile, headless=False,
            viewport={'width': 1280, 'height': 900},
        )
        page = await ctx.new_page()
        await page.goto('https://x.com/login')
        print('Log into X / Instagram / LinkedIn in this window.')
        print('Close the window when done.')
        try: await ctx.wait_for_event('close', timeout=0)
        except Exception: pass
asyncio.run(main())
PY
"@ | Set-Content -Path $LoginPs1 -Encoding UTF8

# ---- 4. Pair --------------------------------------------------------------
if (-not $Code) {
    Write-Stage "Pair this PC with the BrivoMarketing dashboard"
    $Code = Read-Host "  Enter the 6-digit pair code from /admin/social"
}
if (-not $Name) {
    $Name = $env:COMPUTERNAME
}

Write-Stage "Pairing as `"$Name`""
$env:BRIVO_BACKEND_URL = $Backend
& $VenvPython $AgentPy --backend $Backend --pair $Code $Name
if ($LASTEXITCODE -ne 0) { throw "pairing failed" }

# ---- 5. Scheduled Task -- run at logon, auto-restart on failure ------------
Write-Stage "Installing scheduled task `"$TaskName`""
$action  = New-ScheduledTaskAction -Execute $VenvPython -Argument $AgentPy -WorkingDirectory $AppHome
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 9999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Days 0) `
    -Hidden

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Set environment variable for the task
$envCmd = "powershell -WindowStyle Hidden -Command `"`$env:BRIVO_BACKEND_URL='$Backend'; & '$VenvPython' '$AgentPy'`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-WindowStyle Hidden -Command `"`$env:BRIVO_BACKEND_URL='$Backend'; & '$VenvPython' '$AgentPy'`"" `
    -WorkingDirectory $AppHome

Register-ScheduledTask -TaskName $TaskName `
    -Action $action -Trigger $trigger -Principal $principal -Settings $settings | Out-Null

Start-ScheduledTask -TaskName $TaskName

# ---- 6. Anti-sleep ---------------------------------------------------------
Write-Stage "Disabling sleep / display sleep on AC power"
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0

Write-Ok ""
Write-Ok "Install complete."
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. Run: powershell -ExecutionPolicy Bypass -File `"$LoginPs1`""
Write-Host "       (a Chromium window opens -- log into Instagram, X, LinkedIn,"
Write-Host "        finish any 2FA, then close the window)"
Write-Host ""
Write-Host "    2. Watch the dashboard at $Backend/admin/social --"
Write-Host "       your PC will go ONLINE within ~30s."
Write-Host ""
Write-Host "  Stop:    Stop-ScheduledTask  -TaskName $TaskName"
Write-Host "  Restart: Start-ScheduledTask -TaskName $TaskName"
