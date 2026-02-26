# Cloud Functions Deployment Guide

## Setup

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Functions (if not already done):
```bash
firebase init functions
```
- Select existing project
- Choose JavaScript
- Install dependencies

4. Install dependencies:
```bash
cd functions
npm install
```

## Deploy

Deploy the function:
```bash
firebase deploy --only functions
```

Or deploy specific function:
```bash
firebase deploy --only functions:calculateEcoPointsOnCompletion
```

## Test Locally

Run emulator:
```bash
firebase emulators:start --only functions,firestore
```

## Monitor

View logs:
```bash
firebase functions:log
```

## How It Works

1. Partner updates wasteRequests status to "Completed"
2. Cloud Function triggers automatically
3. Function fetches reward rule from rewardRuleCollection
4. Calculates: ecoPointsAwarded = quantity × pointsPerKg
5. Updates wasteRequests.ecoPointsAwarded
6. Increments users.ecoPoints
7. Runs only once (checks if ecoPointsAwarded already exists)

## Remove Client-Side Calculation

After deploying, update PartnerDashboardScreen:
- Remove completeWithPoints() calculation logic
- Just update status to "Completed"
- Cloud Function handles the rest
