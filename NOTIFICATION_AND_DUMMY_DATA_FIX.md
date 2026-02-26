# Bug Fixes - Notification Index & Dummy Data Removal

## ✅ Issues Fixed

### 1️⃣ Firestore Index Error for Notifications

**Error:**
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**Root Cause:**
- NotificationsScreen was using `orderBy('createdAt', 'desc')` in Firestore query
- Firestore requires a composite index for queries with `where` + `orderBy`
- Index wasn't created in Firebase Console

**Solution:**
- Removed `orderBy` from Firestore query
- Sort notifications in JavaScript after fetching
- No index required, query works immediately

**Changes:**
```typescript
// Before
const q = query(
  notificationsRef,
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc')  // ❌ Requires index
);

// After
const q = query(
  notificationsRef,
  where('userId', '==', user.uid)  // ✅ No index needed
);

// Sort in JavaScript
notifList.sort((a, b) => {
  const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
  const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
  return bTime.getTime() - aTime.getTime();
});
```

### 2️⃣ LocationSetup Navigation Error

**Error:**
```
The action 'NAVIGATE' with payload {"name":"LocationSetup"} was not handled by any navigator.
Do you have a screen named 'LocationSetup'?
```

**Root Cause:**
- ProfileScreen tried to navigate to 'LocationSetup'
- LocationSetup screen wasn't registered in any navigation stack
- Screen only existed as standalone component in App.tsx

**Solution:**
- Added LocationSetup screen to HomeStack navigator
- Updated navigation call to use proper nested navigation
- Screen now accessible from Profile page

**Changes:**
```typescript
// HomeStack.tsx - Added screen
<Stack.Screen name="LocationSetup" component={LocationSetupScreen} />

// ProfileScreen.tsx - Fixed navigation
navigation.navigate('Home', { screen: 'LocationSetup' })
```

### 3️⃣ Removed Dummy Data from Profile Page

**Removed:**
- Test button "🧪 Clear Onboarding (Test Only)"
- This was development-only functionality

**Why:**
- Not needed in production
- Could confuse users
- Cleaner UI

### 4️⃣ Removed Dummy Data from My Impact Page

**Changes:**
- Filter out categories with 0 kg recycled
- Hide "Impact Breakdown" section when no data
- Hide "Next Milestone" card when totalKg is 0
- Only show CO₂ saved when totalKg > 0

**Before:**
- Always showed Plastic, Cloth, E-waste (even with 0 kg)
- Progress bar always visible
- Looked like fake data

**After:**
- Only shows categories with actual recycled waste
- Progress bar only shows when user has recycled something
- Clean empty state for new users

## 🔹 Files Modified

1. **NotificationsScreen.tsx**
   - Removed `orderBy` from Firestore query
   - Added JavaScript sorting

2. **ProfileScreen.tsx**
   - Fixed LocationSetup navigation
   - Removed test button

3. **MyImpactScreen.tsx**
   - Filter breakdown to only show categories with data
   - Conditionally render progress card
   - Conditionally render breakdown section

4. **HomeStack.tsx**
   - Added LocationSetup screen to navigation stack

## 🧪 Testing Checklist

### Notifications:
- [ ] Open notifications screen
- [ ] Verify no index error appears
- [ ] Check notifications are sorted newest first
- [ ] Create new notification and verify it appears at top

### Location Setup:
- [ ] Go to Profile page
- [ ] Click "Edit" next to Pickup location
- [ ] Verify LocationSetup screen opens
- [ ] Update location and save
- [ ] Verify location updates in Profile

### Profile Page:
- [ ] Open Profile page
- [ ] Verify test button is removed
- [ ] Check all data displays correctly from Firestore

### My Impact Page:
- [ ] Open My Impact as new user (no requests)
- [ ] Verify no dummy data shows
- [ ] Complete a request
- [ ] Verify impact data appears correctly
- [ ] Check only completed categories show in breakdown
