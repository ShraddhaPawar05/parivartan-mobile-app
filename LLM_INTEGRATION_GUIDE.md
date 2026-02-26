# LLM Integration Guide for Parivartan

## PART 2: LLM Integration Strategy

### Where LLM Enhances Parivartan

#### 1. **Waste Impact Summaries** ⭐ HIGH VALUE
**Location:** User Profile Screen

**Use Case:**
```
User completes 5 requests → LLM generates personalized impact summary

Example Output:
"Great work! Your 15kg of plastic waste recycling this month saved 
approximately 45kg of CO2 emissions - equivalent to driving 180km less. 
You're in the top 10% of eco-warriors in your area!"
```

**Trigger:** Monthly or on-demand

---

#### 2. **Environmental Insights** ⭐ HIGH VALUE
**Location:** Home Screen Daily Tips

**Use Case:**
```
LLM generates contextual eco-tips based on user's waste patterns

Example Output:
"We noticed you recycle a lot of plastic. Did you know? Switching to 
reusable containers could reduce your plastic waste by 60%."
```

**Trigger:** Daily or weekly

---

#### 3. **Admin Reports** ⭐ MEDIUM VALUE
**Location:** Admin Dashboard

**Use Case:**
```
LLM analyzes system data and generates executive summaries

Example Output:
"This month saw a 23% increase in e-waste collection. Partner 'GreenTech' 
shows 95% completion rate. Recommend expanding their service area. 
Peak collection times: 2-4 PM weekdays."
```

**Trigger:** Weekly/monthly

---

#### 4. **Partner Performance Summaries** ⭐ MEDIUM VALUE
**Location:** Partner Dashboard

**Use Case:**
```
LLM provides actionable feedback to partners

Example Output:
"Your average pickup time is 2.3 hours - 15% faster than average! 
Users appreciate your quick response. Consider accepting more requests 
during 10 AM - 12 PM when demand is highest."
```

**Trigger:** Weekly

---

#### 5. **Smart Notification Content** ⭐ LOW VALUE
**Location:** Push Notifications

**Use Case:**
```
LLM generates engaging notification messages

Example Output:
Instead of: "Request completed"
LLM: "🎉 Your e-waste is now being responsibly recycled! +50 EcoPoints earned."
```

**Trigger:** Real-time (but expensive)

---

## Recommended Architecture

### Option A: Cloud Functions + OpenAI API (RECOMMENDED)

```
┌─────────────────┐
│   Firestore     │
│  (user data)    │
└────────┬────────┘
         │
         ↓ (Trigger)
┌─────────────────┐
│ Cloud Function  │
│                 │
│ 1. Fetch data   │
│ 2. Call OpenAI  │
│ 3. Save result  │
└────────┬────────┘
         │
         ↓ (API call)
┌─────────────────┐
│  OpenAI API     │
│  (GPT-4)        │
└────────┬────────┘
         │
         ↓ (Response)
┌─────────────────┐
│   Firestore     │
│ (insights)      │
└─────────────────┘
```

**Pros:**
- ✅ Secure (API key in Cloud Functions)
- ✅ Scalable
- ✅ No frontend changes
- ✅ Cached results

**Cons:**
- ❌ API costs
- ❌ Latency

---

### Option B: Edge Functions + Streaming (ADVANCED)

For real-time responses in UI.

**Not recommended initially** - adds complexity.

---

## Implementation

### Step 1: Create LLM Service Collection

**New Firestore Collection:** `llmInsights`

```javascript
llmInsights/{userId}
  ├── monthlyImpact: {
  │     summary: string,
  │     generatedAt: timestamp,
  │     stats: {
  │       totalWaste: number,
  │       co2Saved: number,
  │       rank: string
  │     }
  │   }
  ├── weeklyTips: {
  │     tip: string,
  │     generatedAt: timestamp
  │   }
  └── lastUpdated: timestamp
```

---

### Step 2: Cloud Function for Impact Summary

**File:** `functions/src/llmService.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

// Initialize OpenAI (API key from Firebase config)
const openai = new OpenAI({
  apiKey: functions.config().openai.key
});

export const generateMonthlyImpact = functions.pubsub
  .schedule('0 0 1 * *') // First day of month
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Get user's completed requests from last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const requestsSnapshot = await db.collection('wasteRequests')
        .where('userId', '==', userId)
        .where('status', '==', 'Completed')
        .where('createdAt', '>=', lastMonth)
        .get();
      
      if (requestsSnapshot.empty) continue;
      
      // Calculate stats
      let totalWaste = 0;
      const wasteTypes: { [key: string]: number } = {};
      
      requestsSnapshot.forEach(doc => {
        const data = doc.data();
        totalWaste += data.quantity || 0;
        wasteTypes[data.type] = (wasteTypes[data.type] || 0) + (data.quantity || 0);
      });
      
      // Generate LLM summary
      const prompt = `Generate a personalized, encouraging environmental impact summary for a user who recycled the following waste last month:

Total waste: ${totalWaste}kg
Breakdown: ${JSON.stringify(wasteTypes)}

Include:
1. Congratulatory message
2. Estimated CO2 savings (use standard conversion factors)
3. Real-world comparison (e.g., "equivalent to...")
4. Encouragement to continue

Keep it under 100 words, friendly and motivating.`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Cheaper model
          messages: [
            { role: 'system', content: 'You are an environmental impact expert who creates encouraging, data-driven summaries.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        });
        
        const summary = completion.choices[0].message.content;
        
        // Save to Firestore
        await db.collection('llmInsights').doc(userId).set({
          monthlyImpact: {
            summary,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            stats: {
              totalWaste,
              wasteTypes,
              requestCount: requestsSnapshot.size
            }
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log(`Generated impact summary for user ${userId}`);
      } catch (error) {
        console.error(`Error generating summary for ${userId}:`, error);
      }
    }
    
    return null;
  });
```

---

### Step 3: On-Demand Impact Generation

**File:** `functions/src/llmService.ts` (add to same file)

```typescript
export const generateImpactSummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const userId = context.auth.uid;
  const db = admin.firestore();
  
  // Check cache (don't regenerate if recent)
  const insightDoc = await db.collection('llmInsights').doc(userId).get();
  if (insightDoc.exists) {
    const data = insightDoc.data();
    const lastGenerated = data?.monthlyImpact?.generatedAt?.toDate();
    if (lastGenerated && (Date.now() - lastGenerated.getTime()) < 24 * 60 * 60 * 1000) {
      // Return cached if less than 24 hours old
      return { summary: data.monthlyImpact.summary, cached: true };
    }
  }
  
  // Fetch user's data
  const requestsSnapshot = await db.collection('wasteRequests')
    .where('userId', '==', userId)
    .where('status', '==', 'Completed')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  
  if (requestsSnapshot.empty) {
    return { summary: 'Start recycling to see your environmental impact!', cached: false };
  }
  
  // Calculate stats
  let totalWaste = 0;
  const wasteTypes: { [key: string]: number } = {};
  
  requestsSnapshot.forEach(doc => {
    const data = doc.data();
    totalWaste += data.quantity || 0;
    wasteTypes[data.type] = (wasteTypes[data.type] || 0) + (data.quantity || 0);
  });
  
  // Generate summary
  const prompt = `Create an inspiring environmental impact summary:

Total recycled: ${totalWaste}kg
Types: ${JSON.stringify(wasteTypes)}

Include CO2 savings estimate and real-world comparison. Keep under 80 words.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an environmental impact expert.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 150,
    temperature: 0.7
  });
  
  const summary = completion.choices[0].message.content;
  
  // Cache result
  await db.collection('llmInsights').doc(userId).set({
    monthlyImpact: {
      summary,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: { totalWaste, wasteTypes }
    }
  }, { merge: true });
  
  return { summary, cached: false };
});
```

---

### Step 4: Daily Eco-Tips

**File:** `functions/src/llmService.ts` (add to same file)

```typescript
export const generateDailyTip = functions.pubsub
  .schedule('0 8 * * *') // 8 AM daily
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Generate one tip for all users (cost-effective)
    const prompt = `Generate a short, actionable eco-tip about waste reduction or recycling. 
    Make it practical and encouraging. Under 50 words.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an environmental educator.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.8
    });
    
    const tip = completion.choices[0].message.content;
    
    // Save to global tips collection
    await db.collection('dailyTips').add({
      tip,
      date: new Date().toISOString().split('T')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Daily tip generated:', tip);
    return null;
  });
```

---

### Step 5: Frontend Integration

**File:** `src/screens/ProfileScreen.tsx`

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';

const ProfileScreen = () => {
  const [impactSummary, setImpactSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const loadImpactSummary = async () => {
    setLoading(true);
    try {
      const generateImpact = httpsCallable(functions, 'generateImpactSummary');
      const result = await generateImpact();
      setImpactSummary((result.data as any).summary);
    } catch (error) {
      console.error('Error loading impact:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadImpactSummary();
  }, []);
  
  return (
    <View>
      {/* Existing profile UI */}
      
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>Your Environmental Impact</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.impactText}>{impactSummary}</Text>
        )}
      </View>
    </View>
  );
};
```

---

## Security Best Practices

### 1. Store API Key Securely

```bash
# Set OpenAI API key in Firebase config
firebase functions:config:set openai.key="sk-..."

# Verify
firebase functions:config:get
```

### 2. Rate Limiting

```typescript
// Add to Cloud Function
const rateLimiter = new Map<string, number>();

export const generateImpactSummary = functions.https.onCall(async (data, context) => {
  const userId = context.auth!.uid;
  
  // Check rate limit (1 request per hour)
  const lastCall = rateLimiter.get(userId) || 0;
  if (Date.now() - lastCall < 60 * 60 * 1000) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Please wait before generating another summary'
    );
  }
  
  rateLimiter.set(userId, Date.now());
  
  // ... rest of function
});
```

### 3. Input Validation

```typescript
// Sanitize user data before sending to LLM
const sanitize = (text: string) => {
  return text.replace(/[<>]/g, '').substring(0, 1000);
};
```

### 4. Cost Controls

```typescript
// Set max tokens to control costs
max_tokens: 150, // Limit response length

// Use cheaper model
model: 'gpt-4o-mini', // $0.15 per 1M tokens vs $5 for GPT-4
```

---

## Cost Considerations

### OpenAI Pricing (GPT-4o-mini)

- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

### Estimated Costs

**Monthly Impact Summaries:**
- 1000 users × 1 summary/month
- ~200 tokens per request
- Cost: ~$0.12/month

**Daily Tips:**
- 1 tip/day × 30 days
- ~100 tokens per request
- Cost: ~$0.01/month

**On-Demand Summaries:**
- 100 requests/day
- ~200 tokens per request
- Cost: ~$0.90/month

**Total Estimated: $1-2/month for small scale**

---

## Deployment Steps

### 1. Install OpenAI SDK

```bash
cd functions
npm install openai
```

### 2. Set API Key

```bash
firebase functions:config:set openai.key="your-api-key"
```

### 3. Deploy Functions

```bash
npm run build
firebase deploy --only functions
```

### 4. Test

```bash
# Test on-demand generation
firebase functions:shell
> generateImpactSummary({ userId: 'test-user-id' })
```

---

## Firestore Schema (No Changes to Existing!)

**New Collection Only:**

```javascript
llmInsights/{userId}
  └── (LLM-generated content)

dailyTips/{tipId}
  └── (Daily eco-tips)
```

**Existing collections unchanged:**
- ✅ users
- ✅ wasteRequests
- ✅ partners

---

## Recommended Triggers

### ✅ Use LLM For:

1. **Monthly Impact Summaries** (scheduled)
2. **Daily Eco-Tips** (scheduled, one for all users)
3. **On-Demand Summaries** (user-triggered, cached)
4. **Weekly Admin Reports** (scheduled)

### ❌ Don't Use LLM For:

1. Real-time notifications (too slow/expensive)
2. Every request completion (too expensive)
3. Simple text that doesn't need AI

---

## Alternative: Local LLM (Cost-Free)

If OpenAI costs are concern:

### Use Ollama (Self-Hosted)

```typescript
// Instead of OpenAI
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://your-server:11434' });

const response = await ollama.generate({
  model: 'llama2',
  prompt: 'Generate eco-tip...'
});
```

**Pros:**
- ✅ Free
- ✅ No API limits

**Cons:**
- ❌ Need to host server
- ❌ Lower quality
- ❌ More maintenance

---

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Deploy LLM Cloud Functions
3. ✅ Test with sample users
4. ✅ Add UI components
5. ✅ Monitor costs
6. ✅ Expand to more use cases

---

## Summary

**Best Use Cases for Parivartan:**
1. Monthly impact summaries (HIGH VALUE)
2. Daily eco-tips (MEDIUM VALUE)
3. Admin reports (MEDIUM VALUE)

**Architecture:**
- Cloud Functions + OpenAI API
- Cache results in Firestore
- Scheduled + on-demand triggers

**Cost:**
- $1-5/month for small-medium scale
- Scales with usage

**Security:**
- API key in Firebase config
- Rate limiting
- Input validation
