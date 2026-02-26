# Deploy EcoPoints Cloud Function

## Overview
EcoPoints calculation is now centralized in a Firebase Cloud Function that automatically triggers when a waste request is completed.

## How It Works

### Trigger
- Firestore trigger on `wasteRequests/{requestId}` document updates
- Activates when `status` changes to "Completed"

### Logic
1. Checks if `ecoPointsAwarded` already exists (prevents duplicate awards)
2. Fetches active reward rules from `rewardRules` collection
3. Finds matching rule by wasteType (case-insensitive)
4. Calculates: `ecoPointsAwarded = quantity × pointsPerKg`
5. Updates `wasteRequests` document with `ecoPointsAwarded`
6. Increments `users.ecoPoints` atomically

### Safety
- Runs only once per request (checks if points already awarded)
- Case-insensitive wasteType matching
- Handles missing rules gracefully
- Atomic increment prevents race conditions

## Deployment

### Prerequisites
- Firebase project on **Blaze (Pay-as-you-go) plan**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`

### Deploy Command

```bash
# Deploy only the EcoPoints function
firebase deploy --only functions:calculateEcoPointsOnCompletion

# Or deploy all functions
firebase deploy --only functions
```

### Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** section
4. Verify `calculateEcoPointsOnCompletion` is listed and active

## Testing

### Test Flow
1. Partner completes a waste request (sets status to "Completed")
2. Cloud Function automatically triggers
3. Check Firebase Console → Functions → Logs
4. Verify:
   - Function executed successfully
   - `ecoPointsAwarded` added to wasteRequests
   - User's `ecoPoints` incremented

### Manual Test
```javascript
// In Firestore Console, update a wasteRequests document:
{
  status: "Completed",
  type: "plastic",
  quantity: 10,
  userId: "user123"
}

// Function should automatically:
// 1. Find plastic reward rule
// 2. Calculate points (e.g., 10 kg × 5 points/kg = 50 points)
// 3. Add ecoPointsAwarded: 50 to document
// 4. Increment users/user123/ecoPoints by 50
```

## Client Code Changes

### Before (Client-side calculation)
```typescript
// ❌ Client calculated and awarded points
const ecoPointsAwarded = quantity × pointsPerKg;
await updateDoc(wasteRequests, { status: 'Completed', ecoPointsAwarded });
await updateDoc(users, { ecoPoints: increment(ecoPointsAwarded) });
```

### After (Server-side calculation)
```typescript
// ✅ Client only updates status
await updateDoc(wasteRequests, { status: 'Completed' });
// Cloud Function handles the rest automatically
```

## Benefits

### Centralized Logic
- Single source of truth for EcoPoints calculation
- Consistent across all platforms (mobile, web, admin)
- Easy to update rules without app updates

### Security
- Business logic runs on server (can't be bypassed)
- Prevents client-side manipulation
- Atomic operations prevent race conditions

### Reliability
- Works even if client disconnects after status update
- Handles edge cases (missing rules, duplicate awards)
- Automatic retry on failure

### Scalability
- Works from any system that updates status
- No client code needed
- Future-proof for integrations

## Monitoring

### Check Logs
```bash
firebase functions:log --only calculateEcoPointsOnCompletion
```

### Common Log Messages
- `🔵 Calculating points for request...` - Function triggered
- `✅ Awarding X points...` - Calculation successful
- `⚠️ No reward rule found...` - Missing rule for wasteType
- `❌ Error calculating EcoPoints...` - Function error

## Troubleshooting

### Function Not Triggering
- Verify function is deployed: `firebase functions:list`
- Check Firebase project is on Blaze plan
- Verify status is changing to exactly "Completed" (case-sensitive)

### Points Not Awarded
- Check function logs for errors
- Verify `rewardRules` collection exists
- Ensure wasteType matches a rule (case-insensitive)
- Check if `ecoPointsAwarded` already exists (prevents duplicate)

### Permission Errors
- Verify Cloud Function has Firestore admin access
- Check Firebase service account permissions

## Cost Estimate

### Firebase Functions Pricing (Blaze Plan)
- **Invocations**: First 2M/month free, then $0.40 per million
- **Compute time**: First 400K GB-seconds free
- **Network**: First 5GB free

### Estimated Cost
- 1000 completions/month ≈ **FREE** (well within free tier)
- 10,000 completions/month ≈ **$0.01 - $0.05**
- Very cost-effective for this use case

## Rollback Plan

If issues occur, you can:

1. **Disable function temporarily**
   ```bash
   firebase functions:delete calculateEcoPointsOnCompletion
   ```

2. **Revert to client-side logic**
   - Restore previous PartnerDashboardScreen code
   - Client calculates and awards points directly

3. **Fix and redeploy**
   - Update function code
   - Deploy again: `firebase deploy --only functions:calculateEcoPointsOnCompletion`

## Summary

✅ **Centralized** - Single source of truth  
✅ **Secure** - Server-side logic  
✅ **Reliable** - Automatic, atomic operations  
✅ **Scalable** - Works from any system  
✅ **Cost-effective** - Minimal Firebase costs  

The EcoPoints system is now production-ready and maintainable!
