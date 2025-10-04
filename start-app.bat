@echo off
echo Starting Meal Planner Application...
echo.
echo Starting backend server...
start "Meal Planner Server" cmd /c "npm run server"
echo Waiting for server to start...
timeout /t 3 /nobreak > nul
echo.
echo Starting frontend development server...
start "Meal Planner Client" cmd /c "npm run dev"
echo.
echo Both servers should be starting now.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause