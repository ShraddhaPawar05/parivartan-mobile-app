# Documentation Cleanup Plan

## ✅ KEEP - Essential Files (15)

### Core Setup & Configuration
1. **README.md** - Main project overview
2. **ENVIRONMENT_SETUP.md** - Environment variables setup
3. **FIRESTORE_SETUP.md** - Database setup

### Security
4. **SECURITY_CHECKLIST.md** - Security guidelines

### Deployment
5. **DEPLOYMENT_GUIDE.md** - Complete deployment guide
6. **ECOPOINTS_CLOUD_FUNCTION.md** - EcoPoints Cloud Function deployment

### Key Implementation Guides
7. **CLOUDINARY_INTEGRATION.md** - Image upload setup
8. **PUSH_NOTIFICATIONS_GUIDE.md** - Notifications setup
9. **TESTING_GUIDE.md** - Testing procedures

### Important Summaries
10. **ECOPOINTS_CENTRALIZED_SUMMARY.md** - EcoPoints implementation
11. **SECURITY_REFACTOR_SUMMARY.md** - Security implementation
12. **STATUS_NORMALIZATION.md** - Status handling

### Reference
13. **DOCUMENTATION_INDEX.md** - Master index (just created)

### Deployment Scripts
14. **deploy-ecopoints-function.sh** - Deployment script (Linux/Mac)
15. **deploy-ecopoints-function.bat** - Deployment script (Windows)

---

## ❌ DELETE - Unnecessary/Redundant Files (34)

### Redundant Setup Guides
- QUICK_START_ENV.md (covered in ENVIRONMENT_SETUP.md)
- CREATE_INDEX_NOW.md (covered in FIRESTORE_SETUP.md)
- CLOUD_FUNCTIONS_SETUP.md (covered in ECOPOINTS_CLOUD_FUNCTION.md)
- CLOUD_FUNCTIONS_DEPLOYMENT.md (redundant)
- FIREBASE_FUNCTIONS_DEPLOY.md (redundant)

### Redundant Notification Guides
- FCM_SETUP_GUIDE.md (covered in PUSH_NOTIFICATIONS_GUIDE.md)
- LOCAL_NOTIFICATIONS.md (implementation detail)
- PUSH_NOTIFICATION_FIX.md (old fix)
- FIX_PUSH_TOKEN_ERROR.md (old fix)
- NOTIFICATION_STATUS_FIXES.md (old fix)
- NOTIFICATION_AND_DUMMY_DATA_FIX.md (old fix)

### Redundant Image/Cloudinary Guides
- CLOUDINARY_DEBUG_GUIDE.md (covered in CLOUDINARY_INTEGRATION.md)
- IMAGE_UPLOAD_VERIFICATION.md (implementation detail)
- IMAGE_CAPTURE_DISPLAY.md (implementation detail)

### Redundant Status Guides
- STRICT_LIFECYCLE.md (covered in STATUS_NORMALIZATION.md)
- DEBUG_STATUS_ISSUE.md (old debug)
- REALTIME_STATUS_UPDATES.md (implementation detail)
- REALTIME_STATUS_IMPLEMENTATION.md (redundant)

### Redundant Rewards Guides
- REWARDS_IMPLEMENTATION_SUMMARY.md (covered in ECOPOINTS_CENTRALIZED_SUMMARY.md)
- REWARDS_QUICK_FIX.md (old fix)
- REWARDS_DISPLAY_VERIFICATION.md (implementation detail)
- REWARDS_REAL_TIME_SETUP.md (implementation detail)
- REAL_TIME_ECO_POINTS.md (covered in ECOPOINTS_CENTRALIZED_SUMMARY.md)

### Redundant Feature Guides
- USER_PHONE_IMPLEMENTATION.md (implementation detail)
- PHONE_INTEGRATION_SUMMARY.md (redundant)
- PARTNER_DASHBOARD.md (implementation detail)

### Optional/Advanced Features
- LLM_INTEGRATION_GUIDE.md (optional feature)
- PATHWAY_INTEGRATION_GUIDE.md (optional feature)
- ANALYTICS_IMPLEMENTATION_GUIDE.md (optional feature)
- ANALYTICS_DEPLOYMENT_CHECKLIST.md (optional feature)

### Redundant Deployment Guides
- DEPLOY_QUICK_REFERENCE.md (covered in DEPLOYMENT_GUIDE.md)

### Old Debug/Fix Files
- REQUEST_NOT_FOUND_FIX.md (old fix)

### Redundant Summaries
- IMPLEMENTATION_CHECKLIST.md (outdated)
- FILE_CHANGES_SUMMARY.md (outdated)
- BUG_FIXES_SUMMARY.md (outdated)
- AUDIT_FIXES_SUMMARY.md (outdated)
- UI_FIXES_SUMMARY.md (outdated)

---

## Summary

**Keep**: 15 essential files
**Delete**: 34 unnecessary files

This will reduce documentation from 49 files to 15 core files, making it much easier to maintain and navigate.
