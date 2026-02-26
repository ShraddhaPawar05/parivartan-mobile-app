# Strict Request Lifecycle Pathway System

## ✅ Implementation Complete

### Overview
Implemented a centralized status transition system that enforces valid status changes and prevents invalid transitions in the request lifecycle.

## 🔹 Status Lifecycle

### Valid Status Flow:
```
Pending → Assigned → Accepted → In Progress → Completed
```

### Status Transitions Map:
```typescript
const STATUS_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Assigned'],
  'Assigned': ['Accepted'],
  'Accepted': ['In Progress'],
  'In Progress': ['Completed'],
  'Completed': []
};
```

## 🔹 New Functions in requestService.ts

### 1️⃣ updateRequestStatus(requestId, newStatus)

**Purpose:** Centralized function to update request status with validation

**Features:**
- ✅ Validates current status exists
- ✅ Checks if transition is allowed
- ✅ Updates status in Firestore
- ✅ Updates `updatedAt` timestamp
- ✅ Logs errors for invalid transitions
- ✅ Returns boolean (success/failure)

**Implementation:**
```typescript
export const updateRequestStatus = async (
  requestId: string,
  newStatus: string
): Promise<boolean> => {
  try {
    // Get current request
    const requestRef = doc(db, 'wasteRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      console.error('❌ Request not found:', requestId);
      return false;
    }

    const currentStatus = requestSnap.data().status;

    // Validate transition
    if (!isValidTransition(currentStatus, newStatus)) {
      console.error(
        `❌ Invalid status transition: ${currentStatus} → ${newStatus}`,
        `\nAllowed transitions from ${currentStatus}:`,
        STATUS_TRANSITIONS[currentStatus] || 'none'
      );
      return false;
    }

    // Update status
    await updateDoc(requestRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    console.log(`✅ Status updated: ${currentStatus} → ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error updating request status:', error);
    return false;
  }
};
```

### 2️⃣ getNextValidStatus(currentStatus)

**Purpose:** Get the next valid status for a given current status

**Returns:** 
- Next valid status string
- `null` if no valid next status (e.g., already Completed)

**Usage:**
```typescript
const nextStatus = getNextValidStatus('Assigned'); // Returns 'Accepted'
const nextStatus = getNextValidStatus('Completed'); // Returns null
```

**Implementation:**
```typescript
export const getNextValidStatus = (currentStatus: string): string | null => {
  const validNext = STATUS_TRANSITIONS[currentStatus];
  return validNext && validNext.length > 0 ? validNext[0] : null;
};
```

### 3️⃣ isValidTransition(currentStatus, newStatus)

**Purpose:** Internal validation function

**Returns:** `true` if transition is allowed, `false` otherwise

**Implementation:**
```typescript
const isValidTransition = (currentStatus: string, newStatus: string): boolean => {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
};
```

## 🔹 Modified Functions

### completeRequest()

**Before:**
```typescript
await updateDoc(requestRef, {
  status: 'Completed',
  updatedAt: serverTimestamp()
});
```

**After:**
```typescript
const success = await updateRequestStatus(requestId, 'Completed');

if (!success) {
  console.error('Failed to update status to Completed');
  return false;
}
```

**Why:** Now uses centralized validation instead of direct Firestore update

## 🔹 Enhanced Timeline UI

### RequestDetailsScreen.tsx Changes:

**New Features:**
1. **Current Status Indicator:**
   - Shows "(Current)" next to active status
   - Larger dot with border for active status
   - Bold text for active status

2. **Pending States:**
   - Shows "Pending" for upcoming steps
   - Italic text for pending states
   - Gray color for not-yet-reached steps

3. **Dynamic Styling:**
   - Done steps: Green (#059669)
   - Active step: Bright green (#10B981) with scale animation
   - Pending steps: Gray (#D1D5DB)

**Visual Hierarchy:**
```typescript
const done = thisStepIndex < currentStatusIndex;
const active = thisStepIndex === currentStatusIndex;
const upcoming = thisStepIndex > currentStatusIndex;

const dotColor = done ? '#059669' : active ? '#10B981' : '#D1D5DB';
const textWeight = active ? '900' : done ? '700' : '400';
```

## 🔹 Validation Examples

### ✅ Valid Transitions:

```typescript
// Pending → Assigned
updateRequestStatus(requestId, 'Assigned'); // ✅ Success

// Assigned → Accepted
updateRequestStatus(requestId, 'Accepted'); // ✅ Success

// Accepted → In Progress
updateRequestStatus(requestId, 'In Progress'); // ✅ Success

// In Progress → Completed
updateRequestStatus(requestId, 'Completed'); // ✅ Success
```

### ❌ Invalid Transitions:

```typescript
// Pending → Completed (skipping steps)
updateRequestStatus(requestId, 'Completed'); 
// ❌ Error: Invalid status transition: Pending → Completed
// Allowed transitions from Pending: ['Assigned']

// Accepted → Assigned (going backwards)
updateRequestStatus(requestId, 'Assigned');
// ❌ Error: Invalid status transition: Accepted → Assigned
// Allowed transitions from Accepted: ['In Progress']

// Completed → anything (already done)
updateRequestStatus(requestId, 'In Progress');
// ❌ Error: Invalid status transition: Completed → In Progress
// Allowed transitions from Completed: none
```

## 🔹 Partner Dashboard Integration

### Button Logic (for partner dashboard):

```typescript
import { getNextValidStatus } from '../services/requestService';

// In partner dashboard component
const nextStatus = getNextValidStatus(request.status);

// Show button only if there's a next valid status
{nextStatus && (
  <TouchableOpacity 
    onPress={() => updateRequestStatus(request.id, nextStatus)}
  >
    <Text>{getButtonLabel(nextStatus)}</Text>
  </TouchableOpacity>
)}

// Helper function for button labels
const getButtonLabel = (status: string) => {
  switch (status) {
    case 'Accepted': return 'Accept Request';
    case 'In Progress': return 'Mark On The Way';
    case 'Completed': return 'Mark Completed';
    default: return 'Update Status';
  }
};
```

### Button Display Logic:

| Current Status | Next Valid Status | Button Shown |
|---------------|-------------------|--------------|
| Pending | Assigned | (Auto-assigned, no button) |
| Assigned | Accepted | "Accept Request" |
| Accepted | In Progress | "Mark On The Way" |
| In Progress | Completed | "Mark Completed" |
| Completed | null | No button (done) |

## 🔹 Real-Time Updates

### Still Works:
- ✅ Real-time listeners unchanged
- ✅ Notifications still trigger on status change
- ✅ UI updates automatically
- ✅ Timeline reflects current status instantly

### Flow:
```
Partner clicks "Accept Request"
  ↓
updateRequestStatus(requestId, 'Accepted')
  ↓
Validates: Assigned → Accepted ✅
  ↓
Updates Firestore
  ↓
onSnapshot listener triggered
  ↓
User app receives update
  ↓
Timeline UI updates
  ↓
Notification sent
```

## 🔹 Error Handling

### Console Logs:

**Success:**
```
✅ Status updated: Assigned → Accepted
```

**Invalid Transition:**
```
❌ Invalid status transition: Pending → Completed
Allowed transitions from Pending: ['Assigned']
```

**Request Not Found:**
```
❌ Request not found: abc123
```

## 🔹 Benefits

### For Development:
- ✅ Centralized status management
- ✅ Prevents invalid state transitions
- ✅ Easy to add new statuses
- ✅ Clear error messages
- ✅ Type-safe transitions

### For Users:
- ✅ Consistent status flow
- ✅ Clear timeline progression
- ✅ No confusing status jumps
- ✅ Visual feedback on current status

### For Partners:
- ✅ Only see valid next actions
- ✅ Can't skip steps
- ✅ Can't go backwards
- ✅ Clear workflow

## 🔹 Testing Checklist

### Valid Transitions:
- [ ] Create request (Pending)
- [ ] Assign to partner (Pending → Assigned)
- [ ] Partner accepts (Assigned → Accepted)
- [ ] Partner marks on the way (Accepted → In Progress)
- [ ] Partner marks completed (In Progress → Completed)
- [ ] Verify each transition succeeds

### Invalid Transitions:
- [ ] Try to skip from Pending to Completed
- [ ] Verify error logged and Firestore not updated
- [ ] Try to go backwards (Accepted → Assigned)
- [ ] Verify error logged and Firestore not updated
- [ ] Try to update Completed request
- [ ] Verify error logged and Firestore not updated

### Timeline UI:
- [ ] Open request at each status
- [ ] Verify current status highlighted
- [ ] Verify done steps are green
- [ ] Verify pending steps are gray
- [ ] Verify timestamps show for done/active steps
- [ ] Verify "Pending" shows for upcoming steps

### Partner Dashboard:
- [ ] Verify only valid next action button shows
- [ ] Assigned → shows "Accept Request"
- [ ] Accepted → shows "Mark On The Way"
- [ ] In Progress → shows "Mark Completed"
- [ ] Completed → no button shows

## 🔹 Files Modified

1. **src/services/requestService.ts**
   - Added `STATUS_TRANSITIONS` map
   - Added `updateRequestStatus()` function
   - Added `getNextValidStatus()` function
   - Added `isValidTransition()` function
   - Modified `completeRequest()` to use validation

2. **src/screens/RequestDetailsScreen.tsx**
   - Enhanced timeline UI with dynamic styling
   - Added current status indicator
   - Added pending state display
   - Improved visual hierarchy

## 🔹 Future Enhancements

### Possible Additions:
- Add "Cancelled" status with transitions from any state
- Add "Rejected" status from Assigned
- Add status change history/audit log
- Add estimated time for each status
- Add partner notes for each status change
