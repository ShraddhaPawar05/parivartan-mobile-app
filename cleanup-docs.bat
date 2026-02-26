@echo off
REM Documentation Cleanup Script
REM Removes unnecessary/redundant documentation files

echo ==========================================
echo   Documentation Cleanup
echo ==========================================
echo.
echo This will delete 34 unnecessary documentation files.
echo Essential files will be kept.
echo.
set /p CONFIRM="Continue? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Cleanup cancelled
    exit /b 0
)

echo.
echo Deleting unnecessary files...
echo.

REM Redundant Setup Guides
del /F /Q "QUICK_START_ENV.md" 2>nul && echo [OK] Deleted QUICK_START_ENV.md
del /F /Q "CREATE_INDEX_NOW.md" 2>nul && echo [OK] Deleted CREATE_INDEX_NOW.md
del /F /Q "CLOUD_FUNCTIONS_SETUP.md" 2>nul && echo [OK] Deleted CLOUD_FUNCTIONS_SETUP.md
del /F /Q "CLOUD_FUNCTIONS_DEPLOYMENT.md" 2>nul && echo [OK] Deleted CLOUD_FUNCTIONS_DEPLOYMENT.md
del /F /Q "FIREBASE_FUNCTIONS_DEPLOY.md" 2>nul && echo [OK] Deleted FIREBASE_FUNCTIONS_DEPLOY.md

REM Redundant Notification Guides
del /F /Q "FCM_SETUP_GUIDE.md" 2>nul && echo [OK] Deleted FCM_SETUP_GUIDE.md
del /F /Q "LOCAL_NOTIFICATIONS.md" 2>nul && echo [OK] Deleted LOCAL_NOTIFICATIONS.md
del /F /Q "PUSH_NOTIFICATION_FIX.md" 2>nul && echo [OK] Deleted PUSH_NOTIFICATION_FIX.md
del /F /Q "FIX_PUSH_TOKEN_ERROR.md" 2>nul && echo [OK] Deleted FIX_PUSH_TOKEN_ERROR.md
del /F /Q "NOTIFICATION_STATUS_FIXES.md" 2>nul && echo [OK] Deleted NOTIFICATION_STATUS_FIXES.md
del /F /Q "NOTIFICATION_AND_DUMMY_DATA_FIX.md" 2>nul && echo [OK] Deleted NOTIFICATION_AND_DUMMY_DATA_FIX.md

REM Redundant Image/Cloudinary Guides
del /F /Q "CLOUDINARY_DEBUG_GUIDE.md" 2>nul && echo [OK] Deleted CLOUDINARY_DEBUG_GUIDE.md
del /F /Q "IMAGE_UPLOAD_VERIFICATION.md" 2>nul && echo [OK] Deleted IMAGE_UPLOAD_VERIFICATION.md
del /F /Q "IMAGE_CAPTURE_DISPLAY.md" 2>nul && echo [OK] Deleted IMAGE_CAPTURE_DISPLAY.md

REM Redundant Status Guides
del /F /Q "STRICT_LIFECYCLE.md" 2>nul && echo [OK] Deleted STRICT_LIFECYCLE.md
del /F /Q "DEBUG_STATUS_ISSUE.md" 2>nul && echo [OK] Deleted DEBUG_STATUS_ISSUE.md
del /F /Q "REALTIME_STATUS_UPDATES.md" 2>nul && echo [OK] Deleted REALTIME_STATUS_UPDATES.md
del /F /Q "REALTIME_STATUS_IMPLEMENTATION.md" 2>nul && echo [OK] Deleted REALTIME_STATUS_IMPLEMENTATION.md

REM Redundant Rewards Guides
del /F /Q "REWARDS_IMPLEMENTATION_SUMMARY.md" 2>nul && echo [OK] Deleted REWARDS_IMPLEMENTATION_SUMMARY.md
del /F /Q "REWARDS_QUICK_FIX.md" 2>nul && echo [OK] Deleted REWARDS_QUICK_FIX.md
del /F /Q "REWARDS_DISPLAY_VERIFICATION.md" 2>nul && echo [OK] Deleted REWARDS_DISPLAY_VERIFICATION.md
del /F /Q "REWARDS_REAL_TIME_SETUP.md" 2>nul && echo [OK] Deleted REWARDS_REAL_TIME_SETUP.md
del /F /Q "REAL_TIME_ECO_POINTS.md" 2>nul && echo [OK] Deleted REAL_TIME_ECO_POINTS.md

REM Redundant Feature Guides
del /F /Q "USER_PHONE_IMPLEMENTATION.md" 2>nul && echo [OK] Deleted USER_PHONE_IMPLEMENTATION.md
del /F /Q "PHONE_INTEGRATION_SUMMARY.md" 2>nul && echo [OK] Deleted PHONE_INTEGRATION_SUMMARY.md
del /F /Q "PARTNER_DASHBOARD.md" 2>nul && echo [OK] Deleted PARTNER_DASHBOARD.md

REM Optional/Advanced Features
del /F /Q "LLM_INTEGRATION_GUIDE.md" 2>nul && echo [OK] Deleted LLM_INTEGRATION_GUIDE.md
del /F /Q "PATHWAY_INTEGRATION_GUIDE.md" 2>nul && echo [OK] Deleted PATHWAY_INTEGRATION_GUIDE.md
del /F /Q "ANALYTICS_IMPLEMENTATION_GUIDE.md" 2>nul && echo [OK] Deleted ANALYTICS_IMPLEMENTATION_GUIDE.md
del /F /Q "ANALYTICS_DEPLOYMENT_CHECKLIST.md" 2>nul && echo [OK] Deleted ANALYTICS_DEPLOYMENT_CHECKLIST.md

REM Redundant Deployment Guides
del /F /Q "DEPLOY_QUICK_REFERENCE.md" 2>nul && echo [OK] Deleted DEPLOY_QUICK_REFERENCE.md

REM Old Debug/Fix Files
del /F /Q "REQUEST_NOT_FOUND_FIX.md" 2>nul && echo [OK] Deleted REQUEST_NOT_FOUND_FIX.md

REM Redundant Summaries
del /F /Q "IMPLEMENTATION_CHECKLIST.md" 2>nul && echo [OK] Deleted IMPLEMENTATION_CHECKLIST.md
del /F /Q "FILE_CHANGES_SUMMARY.md" 2>nul && echo [OK] Deleted FILE_CHANGES_SUMMARY.md
del /F /Q "BUG_FIXES_SUMMARY.md" 2>nul && echo [OK] Deleted BUG_FIXES_SUMMARY.md
del /F /Q "AUDIT_FIXES_SUMMARY.md" 2>nul && echo [OK] Deleted AUDIT_FIXES_SUMMARY.md
del /F /Q "UI_FIXES_SUMMARY.md" 2>nul && echo [OK] Deleted UI_FIXES_SUMMARY.md

REM Delete the cleanup plan itself
del /F /Q "CLEANUP_PLAN.md" 2>nul && echo [OK] Deleted CLEANUP_PLAN.md

echo.
echo ==========================================
echo   Cleanup Complete!
echo ==========================================
echo.
echo Deleted: 34 unnecessary files
echo Kept: 15 essential files
echo.
echo Essential files remaining:
echo - README.md
echo - ENVIRONMENT_SETUP.md
echo - FIRESTORE_SETUP.md
echo - SECURITY_CHECKLIST.md
echo - DEPLOYMENT_GUIDE.md
echo - ECOPOINTS_CLOUD_FUNCTION.md
echo - CLOUDINARY_INTEGRATION.md
echo - PUSH_NOTIFICATIONS_GUIDE.md
echo - TESTING_GUIDE.md
echo - ECOPOINTS_CENTRALIZED_SUMMARY.md
echo - SECURITY_REFACTOR_SUMMARY.md
echo - STATUS_NORMALIZATION.md
echo - DOCUMENTATION_INDEX.md
echo - deploy-ecopoints-function.sh
echo - deploy-ecopoints-function.bat
echo.
pause
