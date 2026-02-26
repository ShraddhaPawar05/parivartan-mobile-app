# Debug Guide: Status Not Updating

## What to Check Now

### 1. Open RequestDetailsScreen
Look for these console logs in order:

```
🔵 Setting up listener for request: [id]
🔍 subscribeToRequest called for: [id]
✅ Listener attached successfully

🔥 FIRESTORE SNAPSHOT RECEIVED
  Document exists: true
  Raw status from Firestore: [status]
  Raw status type: string
  All fields: [array of fields]
  Merged data status: [status]
  ✅ Calling onUpdate callback

📥 REAL-TIME UPDATE RECEIVED
  Request ID: [id]
  Status from Firebase: [status]
  Status type: string
  Previous status: [previous]
  Current status: [current]
  Status changed? true/false
  ✅ State updated with new request data
```

### 2. Check Timeline Rendering
For each step, you'll see:

```
🎯 Timeline Step 0: Assigned
  Current status: "Accepted"
  Current status index: 1
  This step index: 0
  isDone: true, isActive: false, isUpcoming: false
```

### 3. Check Debug Box on Screen
Yellow box should show:
- Current Status: [exact value from Firebase]
- Status Type: string
- Request ID: [id]

## Common Issues & Solutions

### Issue 1: Status is undefined
**Symptom**: "Current status index: undefined"
**Cause**: Status value doesn't match mapping
**Solution**: Check exact status value in Firebase Console

### Issue 2: Status not changing
**Symptom**: "Status changed? false" always
**Cause**: Firebase not updating or listener not firing
**Solution**: 
1. Check Firebase Console - verify status actually changed
2. Check partner dashboard - verify update succeeded
3. Restart app

### Issue 3: Timeline not highlighting correctly
**Symptom**: Wrong step is highlighted
**Cause**: Status mapping mismatch
**Solution**: Check status value matches exactly:
- "Assigned" (not "assigned" or "ASSIGNED")
- "Accepted" (not "accepted")
- "In Progress" (not "in_progress" or "InProgress")
- "Completed" (not "completed")

### Issue 4: Listener not firing
**Symptom**: No "🔥 FIRESTORE SNAPSHOT RECEIVED" logs
**Cause**: Listener not attached or Firebase connection issue
**Solution**:
1. Check internet connection
2. Check Firebase config
3. Restart app

## Testing Steps

### Step 1: Initial Load
1. Open RequestDetailsScreen
2. Check console for initial snapshot
3. Verify status shows correctly in debug box
4. Verify correct timeline step is highlighted

### Step 2: Status Change
1. Keep RequestDetailsScreen open
2. Have partner change status in dashboard
3. Watch console for new snapshot
4. Verify "Status changed? true"
5. Verify timeline updates automatically

### Step 3: Verify Each Status
Test all transitions:
- Assigned → Accepted
- Accepted → In Progress
- In Progress → Completed

## Expected Console Output

### When Partner Changes Status from Assigned to Accepted:

```
🔥 FIRESTORE SNAPSHOT RECEIVED
  Document exists: true
  Raw status from Firestore: Accepted
  Raw status type: string
  Merged data status: Accepted
  ✅ Calling onUpdate callback

📥 REAL-TIME UPDATE RECEIVED
  Request ID: abc123
  Status from Firebase: Accepted
  Previous status: Assigned
  Current status: Accepted
  Status changed? true
  📬 Sending notification for status change
  ✅ State updated with new request data

🎯 Timeline Step 0: Assigned
  Current status: "Accepted"
  Current status index: 1
  This step index: 0
  isDone: true, isActive: false, isUpcoming: false

🎯 Timeline Step 1: Accepted
  Current status: "Accepted"
  Current status index: 1
  This step index: 1
  isDone: false, isActive: true, isUpcoming: false

🎯 Timeline Step 2: In Progress
  Current status: "Accepted"
  Current status index: 1
  This step index: 2
  isDone: false, isActive: false, isUpcoming: true

🎯 Timeline Step 3: Completed
  Current status: "Accepted"
  Current status index: 1
  This step index: 3
  isDone: false, isActive: false, isUpcoming: true
```

## What to Report

If issue persists, provide:

1. **Exact status value from debug box**
2. **Console logs** (copy all logs starting with 🔥)
3. **Screenshot** of Firebase Console showing the status field
4. **Screenshot** of the timeline on screen
5. **What status it should be** vs **what it's showing**

## Quick Fix Checklist

- [ ] Status in Firebase is exactly: "Assigned", "Accepted", "In Progress", or "Completed"
- [ ] Console shows "🔥 FIRESTORE SNAPSHOT RECEIVED" when status changes
- [ ] Console shows "Status changed? true" when partner updates
- [ ] Debug box shows correct status value
- [ ] Timeline logs show correct status index
- [ ] App has internet connection
- [ ] Firebase config is correct

## Manual Test

To verify listener is working:

1. Open RequestDetailsScreen
2. Open Firebase Console in browser
3. Manually change status field in Firebase Console
4. Watch console logs in app
5. Should see new snapshot within 1-2 seconds

If you see the snapshot but timeline doesn't update, the issue is in the rendering logic.
If you don't see the snapshot, the issue is with the Firebase listener.
