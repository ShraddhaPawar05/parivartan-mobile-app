# Real-Time Status Update - Standard Implementation

## Overview
Clean, production-ready real-time status tracking using Firestore onSnapshot listener.

## Firestore Schema
```
Collection: wasteRequests
Document Fields:
  - status: string (Assigned | Accepted | In Progress | Completed)
  - updatedAt: timestamp
  - [other fields...]
```

## Implementation

### 1. Real-Time Listener (Service Layer)
```typescript
// src/services/requestService.ts
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const subscribeToRequest = (
  requestId: string,
  onUpdate: (request: any) => void,
  onError?: (error: Error) => void
) => {
  const docRef = doc(db, 'wasteRequests', requestId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};
```

### 2. Component Implementation
```typescript
// src/screens/RequestDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { subscribeToRequest } from '../services/requestService';

const RequestDetailsScreen: React.FC = ({ route }) => {
  const { id } = route.params;
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToRequest(
      id,
      (data) => setRequest(data),
      (error) => console.error('Error:', error)
    );

    return () => unsubscribe();
  }, [id]);

  // Render timeline...
};
```

### 3. Timeline Logic
```typescript
const TIMELINE_STEPS = ['Assigned', 'Accepted', 'In Progress', 'Completed'];

const renderTimeline = (currentStatus: string) => {
  const statusIndex = {
    'Assigned': 0,
    'Accepted': 1,
    'In Progress': 2,
    'Completed': 3
  }[currentStatus] ?? 0;

  return TIMELINE_STEPS.map((stepLabel, stepIndex) => {
    const isDone = stepIndex < statusIndex;
    const isActive = stepIndex === statusIndex;
    const isUpcoming = stepIndex > statusIndex;

    return (
      <TimelineStep
        key={stepLabel}
        label={stepLabel}
        isDone={isDone}
        isActive={isActive}
        isUpcoming={isUpcoming}
      />
    );
  });
};
```

### 4. Timeline Step Component
```typescript
const TimelineStep = ({ label, isDone, isActive, isUpcoming }) => {
  const dotColor = isDone ? '#059669' : isActive ? '#10B981' : '#D1D5DB';
  const textColor = isActive ? '#10B981' : isDone ? '#059669' : '#6B7280';
  const textWeight = isActive ? '900' : isDone ? '700' : '400';

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[
          styles.timelineDot,
          { 
            backgroundColor: dotColor,
            borderWidth: isActive ? 4 : 0,
            borderColor: isActive ? '#d1fae5' : 'transparent'
          }
        ]} />
        <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: textColor, fontWeight: textWeight }}>
          {label}{isActive && ' (Current)'}
        </Text>
        {isUpcoming && <Text style={{ fontStyle: 'italic' }}>Pending</Text>}
      </View>
    </View>
  );
};
```

## Status Flow

```
Assigned (Partner assigned)
    ↓
Accepted (Partner accepts)
    ↓
In Progress (Partner starts pickup)
    ↓
Completed (Pickup done, points awarded)
```

## Timeline Visual States

### Status: Assigned
- ✅ Assigned (active, green, highlighted)
- ⚪ Accepted (upcoming, gray)
- ⚪ In Progress (upcoming, gray)
- ⚪ Completed (upcoming, gray)

### Status: Accepted
- ✅ Assigned (done, dark green)
- ✅ Accepted (active, green, highlighted)
- ⚪ In Progress (upcoming, gray)
- ⚪ Completed (upcoming, gray)

### Status: In Progress
- ✅ Assigned (done, dark green)
- ✅ Accepted (done, dark green)
- ✅ In Progress (active, green, highlighted)
- ⚪ Completed (upcoming, gray)

### Status: Completed
- ✅ Assigned (done, dark green)
- ✅ Accepted (done, dark green)
- ✅ In Progress (done, dark green)
- ✅ Completed (active, green, highlighted)

## Key Features

✅ **Real-Time Updates**: Uses onSnapshot, no polling  
✅ **Automatic Cleanup**: Unsubscribes on unmount  
✅ **Clean Logic**: Simple status index mapping  
✅ **Visual Feedback**: Clear active/done/upcoming states  
✅ **No Schema Changes**: Works with existing Firestore structure  

## Testing

1. Open RequestDetailsScreen
2. Partner changes status in dashboard
3. Status updates instantly without refresh
4. Timeline highlights correct step
5. Previous steps show as completed

## Performance

- Single document listener (efficient)
- Automatic Firestore caching
- Minimal re-renders (only on status change)
- Cleanup prevents memory leaks

## Error Handling

```typescript
const unsubscribe = subscribeToRequest(
  id,
  (data) => {
    if (data) {
      setRequest(data);
    } else {
      // Handle deleted document
      setRequest(null);
    }
  },
  (error) => {
    // Handle errors
    console.error('Subscription error:', error);
  }
);
```

## Complete Example

See implementation in:
- `src/services/requestService.ts` - subscribeToRequest()
- `src/screens/RequestDetailsScreen.tsx` - Timeline rendering
- `src/screens/PartnerDashboardScreen.tsx` - Status updates

## Status Update (Partner Side)

```typescript
// Partner updates status
await updateDoc(doc(db, 'wasteRequests', requestId), {
  status: 'Accepted',
  updatedAt: serverTimestamp()
});

// User app receives update instantly via onSnapshot
```

That's it! Clean, simple, production-ready real-time status tracking.
