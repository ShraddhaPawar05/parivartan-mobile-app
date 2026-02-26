# TESTING GUIDE - Parivartan Business Logic Fixes

## Quick Test Scenarios

### TEST 1: EcoPoints Increment ✅

**Steps**:
1. Open Partner app → PartnerDashboardScreen
2. Find request with status "In Progress"
3. Enter EcoPoints value (e.g., 100)
4. Click "Complete" button

**Expected Console Output**:
```
🔵 Completing request: abc123
🔵 User ID: user456
🔵 Points to award: 100
✅ Request status updated to Completed
✅ EcoPoints incremented by 100
```

**Expected UI**:
- Alert: "Success! Request completed! 100 EcoPoints credited to user"
- Request moves to "Completed" section

**Expected Firestore**:
- `wasteRequests/{requestId}`:
  - `status: "Completed"`
  - `ecoPointsAwarded: 100`
- `users/{userId}`:
  - `ecoPoints: [previous + 100]`

---

### TEST 2: Real-Time EcoPoints Update in HomeScreen ✅

**Steps**:
1. Open User app → HomeScreen
2. Note current EcoPoints value
3. Have partner complete a request (see TEST 1)
4. Watch HomeScreen (DO NOT refresh)

**Expected Console Output**:
```
🔵 HomeScreen: Subscribing to user document: user456
✅ HomeScreen: User data updated, ecoPoints: 150
✅ HomeScreen: User data updated, ecoPoints: 250  ← After partner completes request
```

**Expected UI**:
- EcoPoints number animates from old value to new value
- No manual refresh needed
- Green gradient card updates automatically

---

### TEST 3: Real-Time EcoPoints Update in RewardsScreen ✅

**Steps**:
1. Open User app → RewardsScreen
2. Note current EcoPoints value
3. Have partner complete a request
4. Watch RewardsScreen (DO NOT refresh)

**Expected Console Output**:
```
🔵 RewardsScreen: Subscribing to user document: user456
✅ RewardsScreen: User data updated, ecoPoints: 150
✅ RewardsScreen: User data updated, ecoPoints: 250  ← After partner completes request
```

**Expected UI**:
- Points in gradient card update automatically
- Progress bars update to reflect new points
- Locked rewards may become available

---

### TEST 4: Status Timeline Display ✅

**Steps**:
1. Open User app → RequestsScreen
2. Tap on any request
3. View Status Timeline section

**Expected Console Output**:
```
🔵 Request status: Completed
🔵 STATUS_FLOW: ['Assigned', 'Accepted', 'In Progress', 'Completed']
🔵 Status index: 3
```

**Expected UI for "Completed" Status**:
- ✅ "Assigned" - Green dot, green line
- ✅ "Accepted" - Green dot, green line
- ✅ "On the way" - Green dot, green line
- ✅ "Completed" - Large green dot with border, timestamp shown

**Expected UI for "In Progress" Status**:
- ✅ "Assigned" - Green dot, green line
- ✅ "Accepted" - Green dot, green line
- ✅ "On the way" - Large green dot with border, timestamp + scheduled info
- ⚪ "Completed" - Gray dot, "Pending" text

---

### TEST 5: Voucher Redemption ✅

**Steps**:
1. Open User app → RewardsScreen
2. Ensure you have enough points for a reward
3. Click "Redeem" button on available reward
4. Confirm in dialog

**Expected Console Output**:
```
🔵 Redeeming reward: 10% Off Coupon
🔵 User ID: user456
🔵 Cost: 100
🔵 Current points: 250
✅ EcoPoints decremented by 100
✅ Redemption transaction recorded
```

**Expected UI**:
- Confirmation dialog appears
- After confirming:
  - Confetti animation plays
  - Success alert: "You've redeemed '10% Off Coupon'!"
  - Points decrease from 250 to 150
  - Progress bars update

**Expected Firestore**:
- `users/{userId}`:
  - `ecoPoints: 150` (was 250)
- New document in `rewardTransactions`:
  - `userId: "user456"`
  - `rewardId: "reward123"`
  - `rewardTitle: "10% Off Coupon"`
  - `points: 100`
  - `type: "redeemed"`
  - `createdAt: [timestamp]`

---

### TEST 6: Insufficient Points Redemption ✅

**Steps**:
1. Open User app → RewardsScreen
2. Find reward that costs MORE than your current points
3. Click "Redeem" button

**Expected UI**:
- Alert: "Insufficient Points - You need X more EcoPoints to redeem this reward."
- No points deducted
- No transaction created

---

### TEST 7: MyImpactScreen Real-Time Update ✅

**Steps**:
1. Open User app → MyImpactScreen
2. Note current EcoPoints value
3. Have partner complete a request
4. Watch MyImpactScreen (DO NOT refresh)

**Expected Console Output**:
```
🔵 MyImpactScreen: Subscribing to user document: user456
✅ MyImpactScreen: User data updated, ecoPoints: 150
✅ MyImpactScreen: User data updated, ecoPoints: 250  ← After partner completes request
```

**Expected UI**:
- EcoPoints number updates automatically
- No manual refresh needed

---

## Debugging Tips

### If EcoPoints Don't Increment:

1. **Check Console Logs**:
   - Look for `🔵 Completing request:` - confirms function called
   - Look for `🔵 User ID:` - verify correct user ID
   - Look for `✅ EcoPoints incremented by` - confirms Firestore update

2. **Check Firestore**:
   - Open Firebase Console
   - Navigate to `users/{userId}`
   - Verify `ecoPoints` field exists and is a number
   - Check if value increased

3. **Check User ID**:
   - Console log should show: `🔵 User ID: {uid}`
   - Verify this matches the user document ID in Firestore
   - If mismatch, check authentication context

### If Status Timeline Doesn't Show Green:

1. **Check Console Logs**:
   - Look for `🔵 Request status:` - see actual status value
   - Look for `🔵 Status index:` - should be 0-3, not -1
   - If index is -1, status value doesn't match STATUS_FLOW

2. **Check Status Value**:
   - Must be EXACTLY: "Assigned", "Accepted", "In Progress", or "Completed"
   - Case-sensitive!
   - No extra spaces

3. **Check Firestore**:
   - Open Firebase Console
   - Navigate to `wasteRequests/{requestId}`
   - Check `status` field value
   - Verify capitalization

### If Real-Time Updates Don't Work:

1. **Check Console Logs**:
   - Look for `🔵 {Screen}: Subscribing to user document:`
   - Look for `✅ {Screen}: User data updated, ecoPoints:`
   - If no update log after partner completes request, listener not working

2. **Check Network**:
   - Ensure device has internet connection
   - Firestore requires active connection for real-time updates

3. **Check User Document**:
   - Open Firebase Console
   - Navigate to `users/{userId}`
   - Verify document exists
   - Verify `ecoPoints` field exists

### If Voucher Redemption Fails:

1. **Check Console Logs**:
   - Look for `🔵 Redeeming reward:`
   - Look for `❌ Error redeeming reward:` - shows error details

2. **Check Points**:
   - Verify user has enough points
   - Console shows: `🔵 Current points:` and `🔵 Cost:`

3. **Check Firestore Rules**:
   - Ensure user can write to `users/{uid}`
   - Ensure user can write to `rewardTransactions`

---

## Common Issues & Solutions

### Issue: "Status not found in STATUS_FLOW"

**Console Output**:
```
⚠️ Status not found in STATUS_FLOW: completed
⚠️ Available statuses: ['Assigned', 'Accepted', 'In Progress', 'Completed']
```

**Solution**:
- Status in Firestore is lowercase "completed"
- Should be capitalized "Completed"
- Update Firestore document manually or via partner app

---

### Issue: "User document does not exist"

**Console Output**:
```
⚠️ HomeScreen: User document does not exist
```

**Solution**:
- User document not created during signup
- Create document manually in Firestore:
  - Collection: `users`
  - Document ID: `{user.uid}` (from Firebase Auth)
  - Fields:
    - `fullName: "User Name"`
    - `email: "user@example.com"`
    - `phone: "1234567890"`
    - `ecoPoints: 0`

---

### Issue: EcoPoints increment but UI doesn't update

**Solution**:
- Check if `onSnapshot` listener is set up
- Look for subscription console log: `🔵 {Screen}: Subscribing to user document:`
- If missing, screen not subscribing to real-time updates
- Verify `useEffect` dependency array includes `[user?.uid]`

---

## Success Criteria

### ✅ All Tests Pass When:

1. Partner completes request → User's EcoPoints increase
2. HomeScreen shows updated points without refresh
3. RewardsScreen shows updated points without refresh
4. MyImpactScreen shows updated points without refresh
5. RequestDetailsScreen timeline shows green for completed steps
6. User can redeem rewards → Points decrease
7. Redemption transaction recorded in Firestore
8. All console logs appear as expected

---

## End of Testing Guide
