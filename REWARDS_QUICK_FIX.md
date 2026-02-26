# QUICK FIX: Rewards Not Showing

## Issue
The error shows: "The query requires an index"

## Solution (Choose ONE)

### Option 1: Create Firestore Index (Recommended)
1. Click this link (from your error): https://console.firebase.google.com/v1/r/project/parivartan-3a3db/firestore/indexes?create_composite=ClBwcm9qZWN0cy9wYXJpdmFydGFuLTNhM2RiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9yZXdhcmRzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaCAoEY29zdBABGgwKCF9fbmFtZV9fEAE
2. Click "Create Index"
3. Wait 2-3 minutes for index to build
4. Restart your app

### Option 2: Add Rewards to Firestore Manually
1. Go to: https://console.firebase.google.com/project/parivartan-3a3db/firestore
2. Click "Start collection" (if rewards collection doesn't exist)
3. Collection ID: `rewards`
4. Add documents with these fields:

**Document 1:**
```
title: "Discount Voucher"
cost: 300
icon: "ticket-percent"
description: "10% off on eco-friendly purchase"
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

### Option 3: Use Default Rewards (Temporary)
The app will automatically use default rewards if Firestore fails. Just restart the app and it should show 3 default rewards.

## Current Status
✅ Code updated to handle missing index gracefully
✅ Falls back to default rewards if Firestore fails
✅ Sorts rewards in JavaScript if index missing

## What Happens Now
1. App tries to fetch from Firestore with index
2. If index missing, tries without orderBy
3. If that fails, uses default rewards
4. You'll see rewards either way!

## To Verify It's Working
Check console logs for:
- "Fetched X active rewards from Firestore" ✅ (using Firestore)
- "Fetched X rewards (sorted in JS)" ✅ (no index, but working)
- "Using default rewards" ⚠️ (fallback mode)

## Next Steps
1. Create the index (Option 1) for best performance
2. Add real rewards to Firestore (Option 2)
3. Deploy indexes: `firebase deploy --only firestore:indexes`
