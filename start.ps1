# Bareeq Al-Yusr - Quick Start Script
# Run this to start both backend and frontend servers

Write-Host "🚀 Starting Bareeq Al-Yusr Platform..." -ForegroundColor Green
Write-Host ""

$projectRoot = "c:\Programming\Django Projects\breek alysr(3.0)"

# Start Backend
Write-Host "📡 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; Write-Host '🔧 Backend Server' -ForegroundColor Yellow; & '.venv\Scripts\python.exe' run.py"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "💻 Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; Write-Host '⚡ Frontend Server' -ForegroundColor Yellow; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Servers Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor White
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Test Credentials:" -ForegroundColor White
Write-Host "   Customer: customer@test.com / password123" -ForegroundColor Yellow
Write-Host "   Merchant: merchant@test.com / password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏱️  Waiting 5 seconds before opening browser..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Open Frontend in Browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "🎉 All Done! The application is now running!" -ForegroundColor Green
Write-Host "   Press Ctrl+C in each PowerShell window to stop servers" -ForegroundColor Gray
