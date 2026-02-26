# Status Normalization Guide

## Problem
Firestore contains lowercase status values ("accepted", "completed") while app expects capitalized ("Accepted", "Completed").

## Solution

### Option 1: Manual Firebase Console Update
1. Open Firebase Console
2. Go to Firestore Database
3. Open `wasteRequests` collection
4. For each document, update `status` field:
   - "pending" → "Assigned"
   - "assigned" → "Assigned"
   - "accepted" → "Accepted"
   - "in progress" or "in_progress" → "In Progress"
   - "completed" → "Completed"

### Option 2: Run Migration Script
1. Get Firebase Admin SDK service account key
2. Save as `serviceAccountKey.json` in project root
3. Install: `npm install firebase-admin`
4. Run: `node normalizeStatuses.js`

## Valid Status Values (Case-Sensitive)
- "Assigned"
- "Accepted"
- "In Progress"
- "Completed"

## Code Already Fixed
All app code now uses correct capitalized values. Once Firestore is normalized, everything will work.
