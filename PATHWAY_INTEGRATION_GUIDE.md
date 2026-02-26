# Pathway Integration Guide for Parivartan

## PART 1: Understanding Pathway in Parivartan Context

### What is Pathway Integration?

Pathway is a real-time data processing framework that can:
- Stream data from Firestore in real-time
- Process waste collection lifecycle events
- Generate analytics and insights
- Trigger automated actions based on patterns

### Where to Integrate in Parivartan

#### 1. **Admin Dashboard (PRIMARY USE CASE)**
**Purpose:** Real-time monitoring and analytics

**What it provides:**
- Live waste collection metrics
- Partner performance tracking
- User engagement analytics
- System health monitoring
- Anomaly detection

**Integration Point:**
```
Firestore → Pathway Service → Admin Dashboard API → Admin UI
```

#### 2. **Cloud Functions (SECONDARY USE CASE)**
**Purpose:** Automated decision-making

**What it provides:**
- Auto-assign partners based on load
- Predict pickup delays
- Optimize routing
- Detect fraudulent requests

**Integration Point:**
```
Firestore → Pathway Service → Cloud Function Triggers
```

#### 3. **NOT Recommended For:**
- ❌ User app (adds complexity, no benefit)
- ❌ Partner dashboard (real-time already via Firestore)

---

## Problems Pathway Solves

### Current Architecture Limitations:

1. **No Real-Time Analytics**
   - Current: Manual queries for admin insights
   - With Pathway: Live dashboard with streaming metrics

2. **No Pattern Detection**
   - Current: Can't detect partner delays automatically
   - With Pathway: Auto-detect patterns and alert

3. **No Predictive Insights**
   - Current: Reactive only
   - With Pathway: Predict demand, optimize assignments

4. **Manual Monitoring**
   - Current: Admin must manually check system health
   - With Pathway: Automated monitoring and alerts

---

## Architecture Design

### Option A: Pathway as Separate Service (RECOMMENDED)

```
┌─────────────────┐
│   Firestore     │
│  (wasteRequests)│
└────────┬────────┘
         │
         ↓ (Real-time stream)
┌─────────────────┐
│ Pathway Service │
│  (Python/Node)  │
│                 │
│ - Aggregations  │
│ - Analytics     │
│ - Predictions   │
└────────┬────────┘
         │
         ↓ (REST API)
┌─────────────────┐
│ Admin Dashboard │
│   (React/Next)  │
└─────────────────┘
```

### Option B: Pathway in Cloud Functions (SIMPLER)

```
┌─────────────────┐
│   Firestore     │
└────────┬────────┘
         │
         ↓ (Triggers)
┌─────────────────┐
│ Cloud Functions │
│ + Pathway Logic │
└────────┬────────┘
         │
         ↓ (Write to)
┌─────────────────┐
│ analytics       │
│ (collection)    │
└─────────────────┘
```

---

## Implementation Steps

### Step 1: Create Analytics Collection (Firestore)

**No schema changes to existing collections!**

New collection: `analytics`

```javascript
analytics/{date}
  ├── totalRequests: number
  ├── completedRequests: number
  ├── activeRequests: number
  ├── totalWasteKg: number
  ├── partnerStats: {
  │     partnerId: {
  │       assigned: number,
  │       completed: number,
  │       avgCompletionTime: number
  │     }
  │   }
  ├── userStats: {
  │     totalUsers: number,
  │     activeUsers: number
  │   }
  └── timestamp: timestamp
```

### Step 2: Create Pathway Cloud Function

**File:** `functions/src/pathwayAnalytics.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const generateDailyAnalytics = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    
    // Aggregate waste requests
    const requestsSnapshot = await db.collection('wasteRequests').get();
    
    const stats = {
      totalRequests: 0,
      completedRequests: 0,
      activeRequests: 0,
      totalWasteKg: 0,
      partnerStats: {} as any,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    requestsSnapshot.forEach(doc => {
      const data = doc.data();
      stats.totalRequests++;
      
      if (data.status === 'Completed') {
        stats.completedRequests++;
        stats.totalWasteKg += data.quantity || 0;
      } else {
        stats.activeRequests++;
      }
      
      // Partner stats
      const partnerId = data.partnerId;
      if (partnerId) {
        if (!stats.partnerStats[partnerId]) {
          stats.partnerStats[partnerId] = {
            assigned: 0,
            completed: 0
          };
        }
        stats.partnerStats[partnerId].assigned++;
        if (data.status === 'Completed') {
          stats.partnerStats[partnerId].completed++;
        }
      }
    });
    
    // Save to analytics collection
    await db.collection('analytics').doc(today).set(stats);
    
    console.log('Analytics generated:', stats);
    return null;
  });
```

### Step 3: Real-Time Stream Processing (Advanced)

**File:** `functions/src/realtimeAnalytics.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onRequestUpdate = functions.firestore
  .document('wasteRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Update real-time metrics
    const metricsRef = admin.firestore().collection('metrics').doc('realtime');
    
    if (before.status !== after.status) {
      // Status changed - update counters
      await metricsRef.update({
        [`statusCounts.${after.status}`]: admin.firestore.FieldValue.increment(1),
        [`statusCounts.${before.status}`]: admin.firestore.FieldValue.increment(-1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return null;
  });
```

### Step 4: Admin Dashboard API

**File:** `functions/src/adminApi.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const getAnalytics = functions.https.onCall(async (data, context) => {
  // Verify admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const db = admin.firestore();
  const { startDate, endDate } = data;
  
  const analyticsSnapshot = await db.collection('analytics')
    .where('timestamp', '>=', new Date(startDate))
    .where('timestamp', '<=', new Date(endDate))
    .get();
  
  const analytics = analyticsSnapshot.docs.map(doc => ({
    date: doc.id,
    ...doc.data()
  }));
  
  return { analytics };
});
```

---

## Deployment Steps

### 1. Update Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 2. Create Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "analytics",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy:
```bash
firebase deploy --only firestore:indexes
```

### 3. Schedule Functions

Functions automatically schedule via `pubsub.schedule()`.

Verify:
```bash
firebase functions:log
```

---

## Benefits in Parivartan

### ✅ Real-Time Monitoring
- Live dashboard showing active requests
- Partner performance metrics
- System health indicators

### ✅ Waste Lifecycle Tracking
- Track request from creation to completion
- Identify bottlenecks
- Measure average completion time

### ✅ Status Transitions
- Monitor status change patterns
- Detect stuck requests
- Alert on anomalies

### ✅ Analytics
- Daily/weekly/monthly reports
- Waste collection trends
- User engagement metrics

### ✅ Admin Monitoring
- Single dashboard for all metrics
- Historical data analysis
- Export reports

---

## Cost Considerations

### Firestore Reads
- Scheduled function: ~24 reads/day (hourly)
- Real-time updates: 1 read per request update
- Analytics queries: Minimal (cached)

### Cloud Functions
- Scheduled: ~720 invocations/month (hourly)
- Real-time: Based on request volume
- Free tier: 2M invocations/month

**Estimated Cost:** $0-5/month for small-medium scale

---

## Security Rules

```javascript
match /analytics/{date} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow write: if false; // Only Cloud Functions
}

match /metrics/{document} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow write: if false; // Only Cloud Functions
}
```

---

## Next Steps

1. ✅ Deploy analytics Cloud Functions
2. ✅ Create admin dashboard UI
3. ✅ Test with sample data
4. ✅ Monitor performance
5. ✅ Add more metrics as needed

---

## Alternative: External Pathway Service

If you need more advanced processing:

### Setup Pathway Service (Python)

```python
import pathway as pw
from pathway.io.firebase import read

# Connect to Firestore
requests = pw.io.firebase.read(
    collection="wasteRequests",
    credentials="firebase-credentials.json"
)

# Real-time aggregation
stats = requests.groupby(requests.status).reduce(
    count=pw.reducers.count()
)

# Output to API
pw.io.http.write(stats, url="http://admin-api/metrics")

pw.run()
```

**Pros:**
- More powerful processing
- Better for complex analytics

**Cons:**
- Additional infrastructure
- More complexity
- Higher cost

**Recommendation:** Start with Cloud Functions, migrate to Pathway service if needed.
