# Pathway Analytics & Impact Summary Implementation Guide

## Overview

Zero external API cost implementation using only Firebase ecosystem.

---

## Firestore Structure Additions

### New Collections (No changes to existing!)

#### 1. `analytics/{date}`
```javascript
analytics/2024-01-15
  ├── date: "2024-01-15"
  ├── totalRequests: 150
  ├── completedRequests: 120
  ├── activeRequests: 30
  ├── totalWasteKg: 450
  ├── totalResolutionTime: 360 (hours)
  ├── averageResolutionTime: 3 (hours)
  ├── statusCounts: {
  │     Assigned: 10,
  │     Accepted: 15,
  │     "In Progress": 5,
  │     Completed: 120
  │   }
  ├── partnerStats: {
  │     partnerId1: {
  │       assigned: 50,
  │       accepted: 45,
  │       completed: 40,
  │       totalResolutionTime: 120,
  │       averageResolutionTime: 3
  │     }
  │   }
  ├── generatedAt: timestamp
  └── lastUpdated: timestamp
```

#### 2. `impactSummaries/{month}`
```javascript
impactSummaries/2024-01
  ├── month: "2024-01"
  ├── summary: "🌍 Environmental Impact Report..." (full text)
  ├── metrics: {
  │     totalRequests: 450,
  │     completedRequests: 380,
  │     totalWasteKg: 1200,
  │     avgResolutionTime: 3,
  │     completionRate: 84,
  │     co2Saved: 3000,
  │     treesEquivalent: 150,
  │     energySaved: 4800
  │   }
  ├── wasteTypes: {
  │     Plastic: 400,
  │     E-waste: 300,
  │     Paper: 250,
  │     Metal: 150,
  │     Glass: 100
  │   }
  ├── topPartners: {
  │     partnerId1: 120,
  │     partnerId2: 95,
  │     partnerId3: 80
  │   }
  └── generatedAt: timestamp
```

---

## Deployment Steps

### Step 1: Build and Deploy Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Step 2: Verify Deployment

```bash
firebase functions:list
```

Should show:
- `updateAnalyticsOnRequestChange`
- `generateDailyAnalytics`
- `generateMonthlyImpactSummary`
- `getAnalytics`
- `getImpactSummary`

### Step 3: Create Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

Add to `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "analytics",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "wasteRequests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Step 4: Update Security Rules

Add to `firestore.rules`:
```javascript
match /analytics/{date} {
  allow read: if request.auth != null;
  allow write: if false; // Only Cloud Functions
}

match /impactSummaries/{month} {
  allow read: if request.auth != null;
  allow write: if false; // Only Cloud Functions
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

---

## Testing

### Test 1: Real-Time Analytics

1. Update a request status in Firestore Console
2. Check `analytics/{today}` document
3. Verify `statusCounts` updated

```bash
firebase functions:log --only updateAnalyticsOnRequestChange
```

### Test 2: Daily Analytics

Trigger manually:
```bash
firebase functions:shell
> generateDailyAnalytics()
```

Or wait for scheduled run (midnight).

Check logs:
```bash
firebase functions:log --only generateDailyAnalytics
```

### Test 3: Monthly Impact Summary

Trigger manually:
```bash
firebase functions:shell
> generateMonthlyImpactSummary()
```

Check `impactSummaries` collection for new document.

### Test 4: API Functions

Test from frontend:
```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';

const getAnalytics = httpsCallable(functions, 'getAnalytics');
const result = await getAnalytics({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
console.log(result.data);
```

---

## Frontend Integration

### User Profile Screen

**File:** `src/screens/ProfileScreen.tsx`

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const ProfileScreen = () => {
  const [impactSummary, setImpactSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadImpactSummary();
  }, []);
  
  const loadImpactSummary = async () => {
    setLoading(true);
    try {
      // Get last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const monthKey = lastMonth.toISOString().slice(0, 7);
      
      // Fetch from Firestore directly (no function call needed)
      const summaryDoc = await getDoc(doc(db, 'impactSummaries', monthKey));
      
      if (summaryDoc.exists()) {
        const data = summaryDoc.data();
        setImpactSummary(data.summary);
      } else {
        setImpactSummary('Impact summary will be available at the end of the month.');
      }
    } catch (error) {
      console.error('Error loading impact:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView>
      {/* Existing profile UI */}
      
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>Monthly Environmental Impact</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.impactText}>{impactSummary}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  impactCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065f46',
    marginBottom: 12
  },
  impactText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 22
  }
});
```

### Admin Dashboard

**File:** `src/screens/AdminDashboardScreen.tsx`

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AdminDashboardScreen = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [impactSummary, setImpactSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch last 30 days analytics
      const analyticsQuery = query(
        collection(db, 'analytics'),
        orderBy('date', 'desc'),
        limit(30)
      );
      
      const analyticsSnapshot = await getDocs(analyticsQuery);
      const analyticsData = analyticsSnapshot.docs.map(doc => ({
        date: doc.id,
        ...doc.data()
      }));
      
      setAnalytics(analyticsData);
      
      // Fetch latest impact summary
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const monthKey = lastMonth.toISOString().slice(0, 7);
      
      const summaryDoc = await getDoc(doc(db, 'impactSummaries', monthKey));
      if (summaryDoc.exists()) {
        setImpactSummary(summaryDoc.data().summary);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>
      
      {/* Impact Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Impact Report</Text>
        <Text style={styles.summaryText}>{impactSummary}</Text>
      </View>
      
      {/* Analytics Charts */}
      {analytics.map(day => (
        <View key={day.date} style={styles.analyticsCard}>
          <Text style={styles.date}>{day.date}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{day.totalRequests}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{day.completedRequests}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Avg Time</Text>
              <Text style={styles.statValue}>{day.averageResolutionTime}h</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
```

---

## Scalability Considerations

### Performance

**Real-Time Updates:**
- ✅ Atomic operations prevent race conditions
- ✅ Incremental updates (no full scans)
- ✅ Efficient for high-volume systems

**Daily Aggregation:**
- ⚠️ Full collection scan (acceptable for daily schedule)
- ✅ Runs during low-traffic hours (midnight)
- ✅ Results cached in Firestore

**Monthly Summary:**
- ✅ Queries only analytics collection (pre-aggregated)
- ✅ Runs once per month
- ✅ Template-based (instant generation)

### Cost Optimization

**Firestore Reads:**
- Real-time: 1 read + 2 writes per status change
- Daily: 1 full scan per day (~1000 reads for 1000 requests)
- Monthly: ~30 reads (analytics docs)

**Cloud Functions:**
- Real-time: Based on request volume
- Daily: 30 invocations/month
- Monthly: 12 invocations/year

**Estimated Cost:**
- Small scale (100 requests/day): $0-1/month
- Medium scale (1000 requests/day): $2-5/month
- Large scale (10000 requests/day): $10-20/month

### Scaling Strategies

**For High Volume:**

1. **Batch Updates** (if real-time not critical):
```typescript
// Instead of per-request updates, batch every 5 minutes
export const batchUpdateAnalytics = functions.pubsub
  .schedule('*/5 * * * *')
  .onRun(async () => {
    // Process recent changes in batch
  });
```

2. **Sharded Counters** (for very high concurrency):
```typescript
// Distribute writes across multiple documents
const shardId = Math.floor(Math.random() * 10);
await db.collection('analytics').doc(`${today}_shard_${shardId}`).update(...);
```

3. **Caching** (reduce reads):
```typescript
// Cache analytics in memory for 5 minutes
const cache = new Map();
```

---

## Monitoring

### Check Function Logs

```bash
# Real-time analytics
firebase functions:log --only updateAnalyticsOnRequestChange

# Daily aggregation
firebase functions:log --only generateDailyAnalytics

# Monthly summary
firebase functions:log --only generateMonthlyImpactSummary
```

### Monitor Firestore Usage

Firebase Console → Firestore → Usage

### Set Up Alerts

Firebase Console → Functions → Metrics → Create Alert

Alert on:
- Function errors > 5%
- Execution time > 10s
- Invocations spike

---

## Troubleshooting

### Analytics not updating?

1. Check function deployed:
```bash
firebase functions:list
```

2. Check logs for errors:
```bash
firebase functions:log
```

3. Verify Firestore rules allow function writes

### Daily aggregation not running?

1. Check schedule:
```bash
firebase functions:config:get
```

2. Verify timezone setting

3. Manually trigger to test:
```bash
firebase functions:shell
> generateDailyAnalytics()
```

### Impact summary empty?

1. Ensure analytics data exists for last month
2. Check date range in query
3. Verify template logic in logs

---

## Maintenance

### Monthly Tasks

- Review analytics accuracy
- Check function performance
- Optimize queries if needed

### Quarterly Tasks

- Archive old analytics (>90 days)
- Review cost trends
- Update impact calculation formulas

---

## Summary

✅ **Zero external API cost**
✅ **No schema changes to existing collections**
✅ **Real-time + scheduled analytics**
✅ **Template-based intelligent summaries**
✅ **Scalable architecture**
✅ **Firebase ecosystem only**

**Total Cost: $0-5/month for small-medium scale**
