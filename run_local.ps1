# Multi-Language Code Translator - Windows Unified Runner
param (
    [switch]$Dev # Pass -Dev to run separate Vite HMR dev server
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Multi-Language Code Translator — Runner" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot

if ($Dev) {
    Write-Host "Mode: Dual-Process Development (Vite HMR + FastAPI)" -ForegroundColor Magenta
    # 1. Start FastAPI Backend Server
    Write-Host "[1/2] Launching Backend Server on http://127.0.0.1:8000..." -ForegroundColor Green
    $BackendCmd = "cd `"$WorkspaceRoot\backend`"; ..\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "$BackendCmd"

    # 2. Start Vite Frontend Server
    Write-Host "[2/2] Launching Vite Frontend Server on http://127.0.0.1:5173..." -ForegroundColor Green
    $FrontendCmd = "cd `"$WorkspaceRoot\frontend`"; npm run dev -- --host 127.0.0.1 --port 5173"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "$FrontendCmd"

    Write-Host "`nServers running:" -ForegroundColor Green
    Write-Host "Frontend Dev (HMR): http://127.0.0.1:5173" -ForegroundColor Yellow
    Write-Host "Backend API & Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
} else {
    Write-Host "Mode: Single Unified Server (Frontend + Backend + API in One)" -ForegroundColor Magenta
    
    # Check if frontend is built
    if (-not (Test-Path "$WorkspaceRoot\frontend\dist\index.html")) {
        Write-Host "Building frontend assets..." -ForegroundColor Yellow
        Push-Location "$WorkspaceRoot\frontend"
        npm run build
        Pop-Location
    }

    Write-Host "`nLaunching Unified Server on http://127.0.0.1:8000..." -ForegroundColor Green
    Write-Host "-> Frontend Web App: http://127.0.0.1:8000" -ForegroundColor Cyan
    Write-Host "-> API Endpoints:    http://127.0.0.1:8000/api/v1" -ForegroundColor Cyan
    Write-Host "-> Swagger UI:       http://127.0.0.1:8000/docs" -ForegroundColor Cyan
    Write-Host "-> Health Check:     http://127.0.0.1:8000/health" -ForegroundColor Cyan
    Write-Host "`nPress Ctrl+C to stop the server.`n" -ForegroundColor Yellow

    & "$WorkspaceRoot\venv\Scripts\uvicorn.exe" --app-dir "$WorkspaceRoot\backend" app.main:app --host 127.0.0.1 --port 8000 --reload
}
