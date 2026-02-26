# Firestore Foundation Setup

## Collections Structure

### 1. users
**Document ID**: Firebase Auth UID
```typescript
{
  uid: string,           // Firebase Auth UID (matches doc ID)
  email: string,         // User email
  name?: string,         // Full name
  phone?: string,        // Phone number
  location: {            // Address from LocationSetupScreen
    house: string,
    street: string,
    city: string,
    pincode: string,
    landmark?: string
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. requests
**Document ID**: Auto-generated
```typescript
{
  id: string,            // Auto-generated doc ID
  userId: string,        // Reference to users collection
  wasteType: string,     // e.g., "plastic", "paper", "metal"
  quantity: number,      // Amount
  unit: string,          // "items", "kg", etc.
  status: string,        // "pending", "accepted", "completed", "cancelled"
  pickupAddress: {       // Can be different from user's default location
    house: string,
    street: string,
    city: string,
    pincode: string,
    landmark?: string
  },
  scheduledDate?: Timestamp,
  assignedRecyclerId?: string,  // Reference to recyclers collection
  images?: string[],     // Array of image URLs
  notes?: string,        // Additional notes
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. recyclers
**Document ID**: Auto-generated
```typescript
{
  id: string,            // Auto-generated doc ID
  name: string,          // Business/person name
  phone: string,         // Contact number
  email?: string,        // Contact email
  address: {
    street: string,
    city: string,
    pincode: string,
    landmark?: string
  },
  serviceAreas: string[], // Array of pincodes they serve
  wasteTypes: string[],   // Types of waste they accept
  rating: number,         // Average rating (0-5)
  totalRequests: number,  // Total completed requests
  isActive: boolean,      // Currently accepting requests
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - read/write only by owner
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Requests collection - authenticated read/write (MVP)
    match /requests/{requestId} {
      allow read, write: if request.auth != null;
    }
    
    // Recyclers collection - public read, no write
    match /recyclers/{recyclerId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Console Setup Steps

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `parivartan-3a3db`
3. Navigate to **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (we'll update rules later)
6. Select a location (choose closest to your users)
7. Once created, go to **Rules** tab
8. Replace the default rules with the rules above
9. Click **Publish**

## Next Steps
- Collections will be created automatically when first document is written
- No manual collection creation needed
- Ready for app integration in next steps