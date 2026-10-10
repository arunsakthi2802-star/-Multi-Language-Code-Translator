# Multi-Language Code Translator - Windows Development Runner
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Multi-Language Code Translator on Windows" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot

# 1. Start FastAPI Backend Server
Write-Host "[1/2] Launching Backend Development Server on http://127.0.0.1:8000..." -ForegroundColor Green
$BackendCmd = "cd `"$WorkspaceRoot\backend`"; ..\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$BackendCmd"

# 2. Start Vite Frontend Server
Write-Host "[2/2] Launching Frontend Development Server on http://127.0.0.1:5173..." -ForegroundColor Green
$FrontendCmd = "cd `"$WorkspaceRoot\frontend`"; npm run dev -- --host 127.0.0.1 --port 5173"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$FrontendCmd"

Write-Host "`nAll servers initiated in separate terminals!" -ForegroundColor Green
Write-Host "Frontend Application: http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "Backend API & OpenAPI Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
