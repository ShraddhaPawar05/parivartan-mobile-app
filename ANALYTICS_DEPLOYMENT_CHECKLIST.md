# Quick Deployment Checklist

## Phase 1: Pathway Analytics Layer

### Step 1: Deploy Functions (5 minutes)
```bash
cd functions
npm install
npm run build
firebase deploy --only functions:updateAnalyticsOnRequestChange,generateDailyAnalytics,getAnalytics
```

### Step 2: Update Firestore Rules (2 minutes)
Add to `firestore.rules`:
```javascript
match /analytics/{date} {
  allow read: if request.auth != null;
  allow write: if false;
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

### Step 3: Test Real-Time Analytics (3 minutes)
1. Go to Firestore Console
2. Update any `wasteRequests` document status
3. Check `analytics/{today}` document created/updated
4. Verify `statusCounts` incremented

### Step 4: Verify Daily Aggregation (2 minutes)
```bash
firebase functions:log --only generateDailyAnalytics
```

Wait for midnight or manually trigger:
```bash
firebase functions:shell
> generateDailyAnalytics()
```

---

## Phase 2: Impact Summary

### Step 1: Deploy Summary Function (2 minutes)
```bash
firebase deploy --only functions:generateMonthlyImpactSummary,getImpactSummary
```

### Step 2: Update Firestore Rules (1 minute)
Add to `firestore.rules`:
```javascript
match /impactSummaries/{month} {
  allow read: if request.auth != null;
  allow write: if false;
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

### Step 3: Generate Test Summary (3 minutes)
```bash
firebase functions:shell
> generateMonthlyImpactSummary()
```

Check `impactSummaries` collection for new document.

### Step 4: Add to Frontend (10 minutes)
Copy code from ANALYTICS_IMPLEMENTATION_GUIDE.md:
- ProfileScreen integration
- AdminDashboard integration

---

## Verification Checklist

- [ ] Functions deployed successfully
- [ ] `analytics` collection exists
- [ ] Real-time updates working
- [ ] Daily aggregation scheduled
- [ ] `impactSummaries` collection exists
- [ ] Monthly summary generated
- [ ] Frontend displays data
- [ ] No errors in logs

---

## Quick Commands

```bash
# Deploy all analytics functions
firebase deploy --only functions:updateAnalyticsOnRequestChange,generateDailyAnalytics,generateMonthlyImpactSummary,getAnalytics,getImpactSummary

# View logs
firebase functions:log

# List functions
firebase functions:list

# Test manually
firebase functions:shell
```

---

## Expected Results

### After Phase 1:
- `analytics/{date}` documents created daily
- Real-time status updates reflected
- Partner performance tracked

### After Phase 2:
- `impactSummaries/{month}` documents created monthly
- Natural language summaries generated
- Environmental impact calculated

---

## Total Time: ~30 minutes

**Cost: $0-2/month**
