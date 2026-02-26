# Fix Push Notification ProjectId Error

## Error
```
❌ Error registering push token: No "projectId" found
```

## Solution

### Option 1: Get Expo Project ID (Recommended)

1. **Login to Expo**
   ```bash
   npx expo login
   ```

2. **Link/Create Expo Project**
   ```bash
   npx eas init
   ```
   
   This will:
   - Create an Expo project
   - Generate a project ID
   - Update app.json automatically

3. **Get Project ID**
   ```bash
   npx eas project:info
   ```
   
   Copy the Project ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

4. **Update app.json**
   Replace `"your-expo-project-id-here"` with your actual project ID:
   ```json
   "extra": {
     "eas": {
       "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
     }
   }
   ```

5. **Rebuild App**
   ```bash
   npx expo start -c
   ```

---

### Option 2: Use Without ProjectId (Local Only)

If you don't need Expo's push notification service, you can skip projectId:

**Update pushNotificationService.ts:**
```typescript
// Remove projectId completely
const tokenData = await Notifications.getExpoPushTokenAsync();
```

This works for:
- ✅ Local notifications
- ✅ Testing
- ❌ Production push (requires projectId)

---

## Quick Fix Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
npx expo login

# Initialize project
npx eas init

# Get project ID
npx eas project:info

# Update app.json with the ID shown
# Then rebuild
npx expo start -c
```

---

## Verify Fix

After updating app.json and rebuilding:

1. Open app
2. Login
3. Check logs for:
   ```
   ✅ Expo push token: ExponentPushToken[...]
   ✅ Push token saved to Firestore
   ```

No more projectId errors!

---

## For Production

- ✅ Use Option 1 (Expo Project ID)
- ✅ Deploy Cloud Functions for background notifications
- ✅ Test with app closed

---

## Troubleshooting

### "Not logged in to Expo"
```bash
npx expo login
```

### "Project not found"
```bash
npx eas init
```

### "Invalid projectId"
- Make sure it's a UUID format
- Copy exactly from `eas project:info`
- No quotes or extra spaces
