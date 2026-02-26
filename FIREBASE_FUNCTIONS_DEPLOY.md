# Firebase Cloud Functions - Background Push Notifications

## ✅ What This Does

Sends REAL push notifications that work when:
- ✅ App is closed
- ✅ App is in background  
- ✅ Phone is locked
- ✅ User is not actively using the app

---

## 📋 Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project on Blaze (Pay-as-you-go) plan**
   - Free tier: 2M function invocations/month
   - Required for Cloud Functions

3. **Node.js 18+**
   ```bash
   node --version
   ```

---

## 🚀 Setup Steps

### Step 1: Login to Firebase
```bash
firebase login
```

### Step 2: Initialize Firebase (if not done)
```bash
cd c:\Programming\PROJECT\Parivartan
firebase init
```

Select:
- ✅ Functions
- Choose existing project: **parivartan-3a3db**
- Language: **TypeScript**
- ESLint: **No**
- Install dependencies: **Yes**

**IMPORTANT**: If `functions/` folder already exists, choose:
- Overwrite files? **No** (keep existing files)

### Step 3: Install Dependencies
```bash
cd functions
npm install
```

### Step 4: Build TypeScript
```bash
npm run build
```

### Step 5: Deploy to Firebase
```bash
npm run deploy
```

Or:
```bash
firebase deploy --only functions
```

---

## 📊 Verify Deployment

### Check function is live
```bash
firebase functions:list
```

Should show:
```
onRequestStatusChange(us-central1)
```

### View logs
```bash
firebase functions:log --only onRequestStatusChange
```

---

## 🧪 Testing

### Test 1: Update Request Status in Firestore

1. Open Firebase Console: https://console.firebase.google.com
2. Go to Firestore Database
3. Navigate to `wasteRequests` collection
4. Select any document
5. Change `status` field (e.g., "Assigned" → "Accepted")
6. Save

**Expected Result:**
- Push notification appears on user's phone
- Works even if app is closed

### Test 2: Check Logs
```bash
firebase functions:log --only onRequestStatusChange
```

Look for:
```
Status changed from Assigned to Accepted
Push notification sent: { data: {...} }
```

### Test 3: Partner Dashboard
1. Partner accepts a request
2. User receives notification immediately
3. Check notification shows correct status

---

## 📱 How It Works

### Trigger Flow
```
Partner updates status in Firestore
         ↓
Cloud Function detects change
         ↓
Compares beforeStatus vs afterStatus
         ↓
If different, fetches user's pushToken
         ↓
Sends push via Expo Push API
         ↓
Notification appears on user's phone
```

### Function Logic
```typescript
1. Trigger: wasteRequests/{requestId} updated
2. Check: beforeStatus !== afterStatus
3. Get: userId from request document
4. Fetch: users/{userId} document
5. Read: pushToken field
6. Send: POST to https://exp.host/--/api/v2/push/send
7. Deliver: Notification to user's device
```

---

## 🔍 Monitoring

### Real-time logs
```bash
firebase functions:log --only onRequestStatusChange --follow
```

### Firebase Console
1. Go to Firebase Console
2. Functions → Dashboard
3. View metrics: invocations, errors, execution time

### Check specific execution
```bash
firebase functions:log --only onRequestStatusChange --limit 50
```

---

## 💰 Cost Optimization

- Function triggers only on document updates
- Minimal execution time (< 1 second)
- Free tier: 2M invocations/month
- Typical cost: $0 for small apps

---

## 🐛 Troubleshooting

### Function not deploying
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
firebase deploy --only functions
```

### Function not triggering
- Check Firebase Console → Functions → Logs
- Verify function deployed: `firebase functions:list`
- Check Firestore rules allow function access

### Push token not found
- Verify user document has `pushToken` field
- Check frontend registers token on login
- View user document in Firestore Console

### Notification not received
- Verify Expo push token format: `ExponentPushToken[...]`
- Check user has granted notification permissions
- Test token at: https://expo.dev/notifications
- Check phone is not in Do Not Disturb mode

### Logs show errors
```bash
firebase functions:log --only onRequestStatusChange
```

Common errors:
- `User document not found` → User not registered
- `No push token found` → Token not saved to Firestore
- `400 Bad Request` → Invalid push token format

---

## 🔄 Update Function

After making changes to `functions/src/index.ts`:

```bash
cd functions
npm run build
npm run deploy
```

---

## 🗑️ Delete Function

```bash
firebase functions:delete onRequestStatusChange
```

---

## 📝 Environment Variables (Optional)

Set config:
```bash
firebase functions:config:set expo.push.url="https://exp.host/--/api/v2/push/send"
```

Get config:
```bash
firebase functions:config:get
```

---

## ✅ Production Checklist

- [ ] Firebase project on Blaze plan
- [ ] Cloud Function deployed successfully
- [ ] Function appears in `firebase functions:list`
- [ ] Test notification received when app closed
- [ ] Logs show successful execution
- [ ] Push tokens stored in Firestore
- [ ] Error monitoring setup
- [ ] Cost alerts configured (optional)

---

## 🎯 Key Features

✅ **No hardcoded status values** - Uses dynamic `afterStatus`
✅ **No schema changes** - Uses existing Firestore structure
✅ **No frontend changes** - Works with existing app
✅ **Background delivery** - Works when app is closed
✅ **High priority** - Ensures delivery even on battery saver
✅ **Minimal code** - Production-ready, no bloat

---

## 📞 Support

### View all logs
```bash
npm run logs
```

### Check function status
```bash
firebase functions:list
```

### Rollback deployment
```bash
firebase rollback functions:onRequestStatusChange
```

---

## 🚀 Quick Deploy Commands

```bash
# Full deployment
cd functions && npm run build && npm run deploy

# View logs
npm run logs

# Test locally
npm run serve
```

---

## 📖 Documentation

- Firebase Functions: https://firebase.google.com/docs/functions
- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/
- Firebase Console: https://console.firebase.google.com
