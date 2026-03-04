# 📱 Parivartan - Waste Management Mobile App

## 🎯 Project Overview

**Parivartan** is a mobile application that connects users with recycling partners for efficient waste collection and management. Users can request waste pickups, earn EcoPoints for recycling, and redeem rewards, while partners manage collection requests through a dedicated dashboard.

---

## 🏗️ Tech Stack

### Frontend
- **Expo** - React Native framework
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation system

### Backend
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User authentication
- **Firebase Cloud Functions** - Serverless backend (optional)

### Storage & Media
- **Cloudinary** - Image upload and storage
- **Expo Location** - GPS geolocation

### Notifications
- **Expo Notifications** - Push notifications
- **Firebase Cloud Messaging** - Notification delivery

---

## 📁 Project Structure

```
Parivartan/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BackButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ScreenWrapper.tsx
│   │   ├── StatusDot.tsx
│   │   └── ui/
│   │       └── Card.tsx
│   │
│   ├── constants/           # App constants
│   │   ├── statusFlow.ts    # Status lifecycle
│   │   └── wasteIcons.ts    # Waste type icons
│   │
│   ├── context/             # React Context (State Management)
│   │   ├── AuthContext.tsx
│   │   ├── RequestsContext.tsx
│   │   └── UploadFlowContext.tsx
│   │
│   ├── firebase/            # Firebase configuration
│   │   └── firebase.ts
│   │
│   ├── navigation/          # Navigation structure
│   │   ├── AppStack.tsx
│   │   ├── AuthStack.tsx
│   │   ├── HomeStack.tsx
│   │   └── UploadStack.tsx
│   │
│   ├── screens/             # App screens
│   │   ├── Auth/
│   │   │   ├── SignInScreen.tsx
│   │   │   └── SignUpScreen.tsx
│   │   │
│   │   ├── User/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── RequestsScreen.tsx
│   │   │   ├── RequestDetailsScreen.tsx
│   │   │   ├── RewardsScreen.tsx
│   │   │   ├── MyImpactScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   ├── Upload Flow/
│   │   │   ├── CameraScreen.tsx
│   │   │   ├── IdentifyScreen.tsx
│   │   │   ├── WasteIdentifiedScreen.tsx
│   │   │   ├── EnterQuantityScreen.tsx
│   │   │   ├── PickupAddressScreen.tsx
│   │   │   ├── NearbyHelpersScreen.tsx
│   │   │   ├── ConfirmRequestScreen.tsx
│   │   │   └── RequestSuccessScreen.tsx
│   │   │
│   │   └── Partner/
│   │       ├── PartnerDashboardScreen.tsx
│   │       ├── RecyclerPartnersScreen.tsx
│   │       └── ScheduledPickupsScreen.tsx
│   │
│   ├── services/            # Business logic & API calls
│   │   ├── cloudinaryService.ts
│   │   ├── pushNotificationService.ts
│   │   ├── requestService.ts
│   │   ├── rewardsService.ts
│   │   └── scheduledPickupService.ts
│   │
│   └── utils/               # Utility functions
│       ├── debugFirestore.ts
│       └── statusNormalizer.ts
│
├── functions/               # Firebase Cloud Functions
│   └── src/
│       ├── index.ts
│       └── analytics.ts
│
├── assets/                  # Images, fonts, etc.
├── .env                     # Environment variables (not committed)
├── .env.example             # Environment template
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## 🔥 Firebase Collections

### 1. **users**
```typescript
{
  uid: string,
  email: string,
  fullName: string,
  phone: string,
  role: "user" | "partner",
  ecoPoints: number,
  location: {
    house: string,
    street: string,
    city: string,
    pincode: string,
    latitude?: number,
    longitude?: number
  },
  createdAt: timestamp
}
```

### 2. **wasteRequests**
```typescript
{
  id: string,
  userId: string,
  userName: string,
  userPhone: string,
  type: string,              // plastic, metal, cloth, e-waste
  quantity: number,
  unit: "kg",
  status: "Assigned" | "Accepted" | "In Progress" | "Completed",
  partnerId: string,
  location: {
    house: string,
    street: string,
    city: string,
    pincode: string,
    latitude: number,
    longitude: number
  },
  imageUrl: string,
  ecoPointsAwarded: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. **rewardRules**
```typescript
{
  wasteType: string,
  pointsPerKg: number,
  isActive: boolean
}
```

### 4. **vouchers**
```typescript
{
  title: string,
  description: string,
  pointsRequired: number,
  image: string,
  category: string,
  status: "available" | "unavailable"
}
```

### 5. **rewardTransactions**
```typescript
{
  userId: string,
  voucherId: string,
  voucherTitle: string,
  pointsSpent: number,
  createdAt: timestamp
}
```

### 6. **partners**
```typescript
{
  name: string,
  phone: string,
  email: string,
  address: string,
  wasteTypes: string[],
  isActive: boolean
}
```

### 7. **scheduledPickups**
```typescript
{
  requestId: string,
  userId: string,
  partnerId: string,
  scheduledDate: string,
  scheduledTime: string,
  status: "scheduled" | "completed" | "cancelled",
  createdAt: timestamp
}
```

---

## 🔄 User Flow

### User Journey
1. **Sign Up/Login** → Email/Password authentication
2. **Capture Waste** → Camera or gallery
3. **Identify Waste** → Select type (plastic, metal, cloth, e-waste)
4. **Enter Quantity** → Weight in kg
5. **Pickup Address** → Manual address + GPS location
6. **Select Partner** → Choose recycler
7. **Confirm Request** → Submit
8. **Track Status** → Real-time updates
9. **Earn Points** → When completed
10. **Redeem Rewards** → Use EcoPoints

### Partner Journey
1. **Login** → Partner account
2. **View Requests** → Assigned to them
3. **Accept Request** → Status: Accepted
4. **Start Pickup** → Status: In Progress
5. **Complete** → Status: Completed + Award EcoPoints
6. **View History** → Completed requests

---

## 🎨 Key Features

### For Users
✅ Waste pickup requests with image upload
✅ GPS location tagging
✅ Real-time request tracking
✅ EcoPoints reward system
✅ Voucher redemption
✅ Impact analytics (kg recycled, CO₂ saved)
✅ Push notifications
✅ Request history

### For Partners
✅ Request management dashboard
✅ Status updates (Accept → In Progress → Complete)
✅ User contact information
✅ GPS navigation to pickup location
✅ Automatic EcoPoints calculation
✅ Completed requests history

---

## 🔐 Security

- Environment variables for sensitive keys
- Firebase Authentication
- Firestore Security Rules
- Unsigned Cloudinary uploads
- No hardcoded credentials

---

## 📊 Status Lifecycle

```
Assigned → Accepted → In Progress → Completed
```

**Assigned**: Request created and assigned to partner
**Accepted**: Partner accepted the request
**In Progress**: Pickup scheduled/started
**Completed**: Pickup done, EcoPoints awarded

---

## 💰 EcoPoints System

### Calculation
```
ecoPointsAwarded = quantity (kg) × pointsPerKg
```

### Flow
1. Partner completes request
2. Fetch reward rule from `rewardRules`
3. Calculate points
4. Update `wasteRequests.ecoPointsAwarded`
5. Increment `users.ecoPoints`

### Redemption
- Users spend EcoPoints on vouchers
- Transaction recorded in `rewardTransactions`
- Points deducted from user account

---

## 🗺️ Location System

### Manual Address (Human Readable)
- House/Flat number
- Street/Area
- City
- Pincode
- Landmark (optional)

### GPS Geotag (Machine Precise)
- Latitude
- Longitude
- Mandatory for new requests
- Opens Google Maps for navigation

---

## 📱 Screens Overview

### Authentication
- SignInScreen
- SignUpScreen

### Main App
- HomeScreen (Dashboard)
- RequestsScreen (All requests)
- RequestDetailsScreen (Single request)
- RewardsScreen (Vouchers)
- MyImpactScreen (Analytics)
- ProfileScreen

### Upload Flow (7 steps)
- CameraScreen
- IdentifyScreen
- WasteIdentifiedScreen
- EnterQuantityScreen
- PickupAddressScreen
- NearbyHelpersScreen
- ConfirmRequestScreen
- RequestSuccessScreen

### Partner
- PartnerDashboardScreen
- RecyclerPartnersScreen
- ScheduledPickupsScreen

---

## 🔔 Notifications

- Status change notifications
- Request assignment alerts
- Completion confirmations
- Expo push notifications
- Firebase Cloud Messaging

---

## 📦 Key Dependencies

```json
{
  "expo": "~52.0.11",
  "react-native": "0.76.5",
  "firebase": "^10.x",
  "expo-camera": "~16.0.9",
  "expo-image-picker": "~16.0.3",
  "expo-location": "~18.0.4",
  "expo-notifications": "~0.29.12",
  "@react-navigation/native": "^6.x",
  "react-native-maps": "optional"
}
```

---

## 🚀 Deployment

- Expo Development Build
- Firebase Hosting (optional)
- Cloud Functions (optional)
- Environment variables via `.env`

---

## 📝 Documentation

- README.md - Quick start
- ENVIRONMENT_SETUP.md - Setup guide
- DEPLOYMENT_GUIDE.md - Deployment steps
- ECOPOINTS_CLOUD_FUNCTION.md - Cloud Functions
- GPS_GEOTAG_IMPLEMENTATION.md - GPS feature
- DOCUMENTATION_INDEX.md - All docs

---

## 🎯 Project Goals

1. **Simplify waste recycling** for users
2. **Connect users with recyclers** efficiently
3. **Incentivize recycling** through rewards
4. **Track environmental impact** (kg, CO₂)
5. **Provide real-time tracking** for transparency
6. **Enable precise navigation** with GPS

---

**Project Name**: Parivartan (परिवर्तन - means "Change" in Hindi)
**Platform**: iOS & Android (React Native/Expo)
**Status**: Production Ready
**Architecture**: Serverless (Firebase)
