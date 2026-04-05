@echo off
echo ========================================================
echo STARTING HOLOMEDX AI - OPEN BIM LOCAL SERVER
echo ========================================================

echo Starting Static Web Server in the background...
start python -m http.server 3000 --directory "c:\Users\HOUSE OF COMPUTERS\OneDrive\Desktop\N.K.Orchid-1\frontend"

echo.
echo Waiting 5 seconds for the web server to start...
timeout /t 5 /nobreak >nul

echo Opening Browser...
start http://localhost:3000

echo ========================================================
echo SERVER IS RUNNING. DO NOT CLOSE THIS BLACK WINDOW!
echo ========================================================
pause
