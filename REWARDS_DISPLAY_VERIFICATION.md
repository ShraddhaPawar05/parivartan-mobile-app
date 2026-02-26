# Rewards Real-Time Display - Verification Guide

## Current Implementation Status

✅ **Real-time listener already implemented**
- Using `subscribeToRewards()` with `onSnapshot`
- Listens to Firestore `rewards` collection
- Filters by `isActive: true`
- Updates automatically when rewards change

## How It Works

```typescript
// RewardsScreen.tsx - Line 19-29
useEffect(() => {
  if (!user?.uid) return;

  const unsubscribe = subscribeToRewards((updatedRewards) => {
    setRewards(updatedRewards);
  });

  return () => unsubscribe();
}, [user?.uid]);
```

## Firestore Collection Structure

**Collection Name**: `rewards`

**Document Structure**:
```javascript
{
  title: "Discount Voucher",
  cost: 300,
  icon: "ticket-percent",
  description: "10% off voucher",
  isActive: true
}
```

## To Add Vouchers to Firebase

### Step 1: Open Firebase Console
https://console.firebase.google.com/project/parivartan-3a3db/firestore

### Step 2: Create/Open `rewards` Collection

### Step 3: Add Document
Click "Add document" and enter:

**Document 1:**
```
title: "Discount Voucher"
cost: 300
icon: "ticket-percent"
description: "10% off on eco-friendly products"
isActive: true
```

**Document 2:**
```
title: "Reusable Bag"
cost: 500
icon: "bag-personal"
description: "Premium reusable shopping bag"
isActive: true
```

**Document 3:**
```
title: "Plant a Tree"
cost: 1000
icon: "tree"
description: "We'll plant a tree in your name"
isActive: true
```

## Verification Steps

1. **Add rewards to Firebase** (see above)
2. **Open RewardsScreen** in app
3. **Check console** for: "Real-time update: Fetched X rewards"
4. **Verify rewards display** in "Available Rewards" section
5. **Test real-time**: Change a reward in Firebase Console → Should update instantly in app

## If No Rewards Show

### Check 1: Firebase Collection Name
- Must be exactly: `rewards` (lowercase)
- Not: `Rewards`, `reward`, `vouchers`

### Check 2: Document Fields
- `isActive` must be boolean `true` (not string "true")
- `cost` must be number (not string)
- `title` must be string
- `icon` must be valid MaterialCommunityIcons name

### Check 3: Console Logs
Look for:
- ✅ "Real-time update: Fetched X rewards" → Working
- ❌ "Index not found" → Need to create index (see below)
- ❌ "Real-time rewards error" → Check Firestore rules

### Check 4: Firestore Index
If you see "Index not found" error:

1. Click the link in the error message, OR
2. Go to: Firebase Console → Firestore → Indexes
3. Create composite index:
   - Collection: `rewards`
   - Fields: `isActive` (Ascending), `cost` (Ascending)

### Check 5: Firestore Rules
Ensure users can read rewards:

```javascript
match /rewards/{rewardId} {
  allow read: if request.auth != null;
}
```

## Current Display Logic

```typescript
// If no rewards
{rewards.length === 0 ? (
  <View>
    <Text>No rewards available</Text>
    <Text>Check back soon for exciting rewards!</Text>
  </View>
) : (
  // Display each reward
  rewards.map(item => ...)
)}
```

## Icon Names Reference

Valid icon names for `icon` field:
- `ticket-percent` - Voucher/discount
- `bag-personal` - Bag
- `tree` - Tree/plant
- `gift` - Gift box
- `bottle-water` - Water bottle
- `leaf` - Leaf
- `recycle` - Recycle symbol
- `sprout` - Plant sprout

Full list: https://pictogrammers.com/library/mdi/

## Testing Real-Time Updates

1. Open RewardsScreen in app
2. Open Firebase Console in browser
3. Add a new reward document
4. Watch app update instantly (within 1-2 seconds)
5. Change `isActive` to `false` → Reward disappears
6. Change `isActive` to `true` → Reward reappears

## Summary

✅ Code is already correct and real-time
✅ Just need to add rewards to Firebase
✅ Collection name: `rewards`
✅ Field: `isActive: true` (boolean)
✅ Updates automatically via onSnapshot

**Next Step**: Add rewards to Firebase Console using the structure above!
