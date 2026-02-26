# Quick Deploy Reference

## 🚀 Deploy Cloud Functions

```bash
# Navigate to functions directory
cd c:\Programming\PROJECT\Parivartan\functions

# Install dependencies (first time only)
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
npm run deploy
```

---

## ✅ Verify Deployment

```bash
# List deployed functions
firebase functions:list

# View logs
firebase functions:log --only onRequestStatusChange

# Follow logs in real-time
firebase functions:log --only onRequestStatusChange --follow
```

---

## 🧪 Test

1. Open Firebase Console: https://console.firebase.google.com
2. Go to Firestore → wasteRequests
3. Edit any document
4. Change `status` field value
5. Save
6. Check phone for notification (even if app is closed)

---

## 📦 Required Packages

Already in `functions/package.json`:
- `firebase-admin`: ^12.0.0
- `firebase-functions`: ^4.5.0
- `node-fetch`: ^2.7.0

---

## 🔧 Troubleshooting

### Function not deploying?
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
firebase deploy --only functions
```

### Not receiving notifications?
- Check push token exists in Firestore: `users/{userId}/pushToken`
- Verify notification permissions granted on phone
- Check logs: `firebase functions:log`

---

## 💡 How It Works

```
Partner changes status → Cloud Function triggers → Fetches pushToken → Sends to Expo API → Notification delivered
```

Works when:
✅ App closed
✅ App in background
✅ Phone locked

---

## 📝 Important Notes

- Uses existing `status` field (no changes)
- Uses existing `pushToken` field (no changes)
- No frontend modifications needed
- Dynamic status values (no hardcoding)
- High priority delivery for background
