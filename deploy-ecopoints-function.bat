@echo off
REM EcoPoints Cloud Function Deployment Script for Windows

echo ==========================================
echo   EcoPoints Cloud Function Deployment
echo ==========================================
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Firebase CLI not found!
    echo Install it with: npm install -g firebase-tools
    pause
    exit /b 1
)

echo [OK] Firebase CLI found
echo.

REM Check if logged in
echo Checking Firebase login status...
firebase projects:list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Not logged in to Firebase
    echo Run: firebase login
    pause
    exit /b 1
)

echo [OK] Logged in to Firebase
echo.

REM Show current project
echo Current Firebase project:
firebase use
echo.

REM Confirm deployment
set /p CONFIRM="Deploy calculateEcoPointsOnCompletion function? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled
    pause
    exit /b 0
)

echo.
echo Deploying function...
echo.

REM Deploy the function
firebase deploy --only functions:calculateEcoPointsOnCompletion

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   [OK] Deployment Successful!
    echo ==========================================
    echo.
    echo Next steps:
    echo 1. Test by completing a waste request
    echo 2. Check logs: firebase functions:log
    echo 3. Verify ecoPoints are awarded
    echo.
) else (
    echo.
    echo ==========================================
    echo   X Deployment Failed
    echo ==========================================
    echo.
    echo Common issues:
    echo 1. Project not on Blaze plan
    echo 2. Missing permissions
    echo 3. Syntax errors in function code
    echo.
    echo Check the error message above for details
    echo.
)

pause
