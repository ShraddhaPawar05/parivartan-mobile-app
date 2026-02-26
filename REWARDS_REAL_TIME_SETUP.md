# Real-Time Rewards System - Setup Guide

## Changes Made

### 1. Removed Dummy Rewards Data
- **Before**: Hardcoded rewards array in `RewardsScreen.tsx`
- **After**: Rewards fetched from Firestore `rewards` collection in real-time

### 2. Updated Files

#### `src/screens/RewardsScreen.tsx`
- Removed hardcoded `rewards` array
- Added `rewards` state to fetch from Firestore
- Updated `loadRewardsData()` to fetch rewards using `getAvailableRewards()`
- Added empty state when no rewards available
- Rewards now sorted by cost in ascending order

#### `src/services/rewardsService.ts`
- Added `Reward` interface with fields: `id`, `title`, `cost`, `icon`, `description`, `isActive`
- Added `getAvailableRewards()` function to fetch active rewards from Firestore
- Query filters by `isActive: true` and orders by `cost` ascending
- Includes fallback to default rewards if Firestore fetch fails

#### `firestore.indexes.json`
- Added composite index for `rewards` collection: `isActive` + `cost`

## Firestore Setup

### Create Rewards Collection

Add documents to the `rewards` collection in Firestore with the following structure:

```javascript
// Document ID: auto-generated or custom (e.g., "rw1")
{
  title: "Reusable Bag",
  cost: 500,
  icon: "bag-personal",  // MaterialCommunityIcons name
  description: "Get a premium reusable shopping bag",
  isActive: true,
  createdAt: serverTimestamp()
}
```

### Sample Rewards to Add

```javascript
// Reward 1
{
  title: "Discount Voucher",
  cost: 300,
  icon: "ticket-percent",
  description: "10% off on your next eco-friendly purchase",
  isActive: true
}

// Reward 2
{
  title: "Reusable Bag",
  cost: 500,
  icon: "bag-personal",
  description: "Premium reusable shopping bag",
  isActive: true
}

// Reward 3
{
  title: "Plant a Tree",
  cost: 1000,
  icon: "tree",
  description: "We'll plant a tree in your name",
  isActive: true
}

// Reward 4
{
  title: "Water Bottle",
  cost: 750,
  icon: "bottle-water",
  description: "Stainless steel water bottle",
  isActive: true
}

// Reward 5
{
  title: "Eco Gift Box",
  cost: 1500,
  icon: "gift",
  description: "Curated box of eco-friendly products",
  isActive: true
}
```

### Icon Names Reference

Use any icon from [MaterialCommunityIcons](https://pictogrammers.com/library/mdi/):
- `bag-personal`
- `ticket-percent`
- `tree`
- `bottle-water`
- `gift`
- `leaf`
- `recycle`
- `sprout`
- `earth`

## Firestore Security Rules

Add to your `firestore.rules`:

```javascript
// Allow all users to read active rewards
match /rewards/{rewardId} {
  allow read: if request.auth != null && resource.data.isActive == true;
  allow write: if false; // Only admins via Firebase Console
}
```

## Deploy Firestore Indexes

Run this command to deploy the indexes:

```bash
firebase deploy --only firestore:indexes
```

## How It Works

1. **App Launch**: RewardsScreen fetches active rewards from Firestore
2. **Real-Time Points**: User's eco points fetched from `users/{userId}.ecoPoints`
3. **Dynamic Rewards**: Admins can add/remove/update rewards in Firestore Console
4. **Fallback**: If Firestore fetch fails, shows 3 default rewards
5. **Progress Tracking**: Shows progress bars for each reward based on current points

## Benefits

✅ **No Hardcoded Data**: All rewards managed in Firestore  
✅ **Dynamic Updates**: Add/remove rewards without app updates  
✅ **Real-Time Sync**: Changes reflect immediately  
✅ **Scalable**: Easy to add seasonal or promotional rewards  
✅ **Admin Control**: Manage rewards via Firebase Console  

## Testing

1. Add rewards to Firestore using Firebase Console
2. Open RewardsScreen in app
3. Verify rewards display correctly
4. Test with different `isActive` values
5. Verify sorting by cost works
6. Test empty state when no active rewards

## Future Enhancements

- Add reward categories (physical, digital, donation)
- Add stock/availability tracking
- Add expiration dates for seasonal rewards
- Add reward images from Cloudinary
- Implement actual redemption flow
- Add redemption history
