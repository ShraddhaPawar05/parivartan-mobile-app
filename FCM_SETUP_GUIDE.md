# Firebase Cloud Messaging (FCM) Setup for Push Notifications

## Issue Fixed
1. ✅ Firebase initialization error resolved
2. ✅ Real notification popups enabled (not just in-app)

## What Changed

### 1. app.json
- Added `expo-notifications` plugin with configuration
- Added `@react-native-firebase/app` and `@react-native-firebase/messaging` plugins
- Added `googleServicesFile` paths for Android and iOS

### 2. pushNotificationService.ts
- Added `projectId: 'parivartan-e5e0e'` to `getExpoPushTokenAsync()`

### 3. Installed Packages
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

---

## Required: Download Firebase Config Files

### For Android

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **parivartan-e5e0e**
3. Click ⚙️ Settings → Project Settings
4. Scroll to "Your apps" section
5. Click Android app (or add one if missing)
6. Download **google-services.json**
7. Place it in project root:
   ```
   Parivartan/google-services.json
   ```

### For iOS (if needed)

1. Same Firebase Console
2. Click iOS app (or add one)
3. Download **GoogleService-Info.plist**
4. Place it in project root:
   ```
   Parivartan/GoogleService-Info.plist
   ```

---

## Rebuild App

After adding google-services.json:

```bash
# Clear cache
npx expo start -c

# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

---

## How It Works Now

### Local Notifications (Current)
- Work in foreground and background
- Show immediately when status changes
- Don't require server

### Cloud Notifications (After Cloud Functions deployed)
- Work even when app is completely closed
- Sent from Firebase Cloud Functions
- Use Expo Push API
- Require google-services.json

---

## Testing Real Notifications

### 1. Test Local (Already Working)
- Open app
- Partner changes request status
- Notification appears immediately

### 2. Test Cloud (After setup)
- Close app completely
- Partner changes request status in Firestore
- Cloud Function triggers
- Push notification appears on device

---

## Verify Setup

### Check google-services.json exists
```bash
dir google-services.json
```

Should show file in project root.

### Check app.json has plugins
```json
"plugins": [
  "expo-notifications",
  "@react-native-firebase/app",
  "@react-native-firebase/messaging"
]
```

### Check projectId in pushNotificationService.ts
```typescript
projectId: 'parivartan-e5e0e'
```

---

## Troubleshooting

### Error: google-services.json not found
- Download from Firebase Console
- Place in project root (same level as app.json)
- Rebuild app

### Notifications not showing when app closed
- Deploy Cloud Functions (see CLOUD_FUNCTIONS_SETUP.md)
- Verify push token saved in Firestore
- Check Firebase Functions logs

### Permission denied
- Uninstall app
- Reinstall
- Accept notification permission when prompted

---

## Next Steps

1. ✅ Download google-services.json from Firebase Console
2. ✅ Place in project root
3. ✅ Rebuild app: `npx expo run:android`
4. ✅ Test notifications
5. ✅ Deploy Cloud Functions for closed-app notifications

---

## Production Checklist

- [ ] google-services.json downloaded and placed
- [ ] App rebuilt with new config
- [ ] Notification permission granted
- [ ] Push token registered in Firestore
- [ ] Local notifications working
- [ ] Cloud Functions deployed
- [ ] Cloud notifications working when app closed
