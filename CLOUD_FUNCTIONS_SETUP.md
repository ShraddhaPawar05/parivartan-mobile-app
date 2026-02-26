# Firebase Cloud Functions - Push Notifications Setup

## Overview
Production-level push notifications using Firebase Cloud Functions that trigger on wasteRequests status changes.

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project with Blaze (pay-as-you-go) plan
- Node.js 18+

---

## Installation Steps

### 1. Navigate to functions directory
```bash
cd functions
```

### 2. Install dependencies
```bash
npm install
```

### 3. Login to Firebase
```bash
firebase login
```

### 4. Initialize Firebase (if not already done)
```bash
firebase init functions
```
- Select existing project
- Choose TypeScript
- Use existing files (don't overwrite)

---

## Deployment

### Build TypeScript
```bash
npm run build
```

### Deploy to Firebase
```bash
npm run deploy
```

Or deploy directly:
```bash
firebase deploy --only functions
```

### Deploy specific function
```bash
firebase deploy --only functions:onRequestStatusChange
```

---

## How It Works

### Trigger
- Fires on ANY update to `wasteRequests/{requestId}` document
- Checks if `status` field changed
- Only sends notification if status actually changed

### Flow
1. Cloud Function detects wasteRequests document update
2. Compares `beforeStatus` vs `afterStatus`
3. If different, fetches user document using `userId`
4. Reads `pushToken` from user document
5. Sends push notification via Expo Push API
6. Notification includes: title, body with status, requestId in data

### Safety
- No hardcoded status values
- Uses actual `afterStatus` dynamically
- No Firestore schema changes
- No modification to request lifecycle

---

## Testing

### 1. Check function deployed
```bash
firebase functions:list
```

### 2. View logs in real-time
```bash
firebase functions:log --only onRequestStatusChange
```

Or view all logs:
```bash
npm run logs
```

### 3. Test with Firestore update
Update any wasteRequests document status in Firebase Console:
- Go to Firestore Database
- Navigate to wasteRequests collection
- Edit any document
- Change `status` field value
- Save

### 4. Verify notification received
- Check app for push notification
- Check Firebase Functions logs for execution

### 5. Local testing (optional)
```bash
npm run serve
```
This starts Firebase emulators for local testing.

---

## Monitoring

### View function execution
Firebase Console → Functions → Dashboard

### Check errors
```bash
firebase functions:log --only onRequestStatusChange
```

### Performance metrics
Firebase Console → Functions → onRequestStatusChange → Metrics

---

## Cost Optimization

Function triggers only on document updates, not reads.
Minimal execution time (< 1 second per notification).
Free tier: 2M invocations/month.

---

## Troubleshooting

### Function not triggering
- Check Firebase Console → Functions → Logs
- Verify function deployed: `firebase functions:list`
- Check Firestore rules allow function access

### Push token not found
- Verify user document has `pushToken` field
- Check frontend registers token on login
- View logs: `firebase functions:log`

### Notification not received
- Verify Expo push token format (starts with ExponentPushToken[...])
- Check Expo push notification status
- Test token at: https://expo.dev/notifications

### Build errors
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Environment Variables (if needed)

Set Firebase config:
```bash
firebase functions:config:set someservice.key="THE API KEY"
```

Get config:
```bash
firebase functions:config:get
```

---

## Rollback

Revert to previous deployment:
```bash
firebase rollback functions:onRequestStatusChange
```

---

## Status Values

Function uses ACTUAL status values from your app dynamically.
No hardcoded statuses.
Works with any status change: Assigned → Accepted → In Progress → Completed, etc.

---

## Frontend Integration

No changes needed to frontend.
Push token registration already exists in App.tsx.
Cloud Function automatically picks up status changes.

---

## Production Checklist

- [ ] Firebase project on Blaze plan
- [ ] Functions deployed successfully
- [ ] Test notification received
- [ ] Logs show successful execution
- [ ] Push tokens stored in Firestore
- [ ] Error monitoring setup
- [ ] Cost alerts configured

---

## Commands Reference

```bash
# Deploy
cd functions
npm run build
npm run deploy

# Logs
npm run logs
firebase functions:log --only onRequestStatusChange

# List functions
firebase functions:list

# Delete function
firebase functions:delete onRequestStatusChange

# Local emulator
npm run serve
```
