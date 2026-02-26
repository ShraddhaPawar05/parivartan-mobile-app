// Run this in Firebase Console > Firestore > Run Query
// Or use Firebase Admin SDK

// Sample rewards to add to Firestore
const sampleRewards = [
  {
    title: "Discount Voucher",
    cost: 300,
    icon: "ticket-percent",
    description: "10% off on your next eco-friendly purchase",
    isActive: true
  },
  {
    title: "Reusable Bag",
    cost: 500,
    icon: "bag-personal",
    description: "Premium reusable shopping bag",
    isActive: true
  },
  {
    title: "Water Bottle",
    cost: 750,
    icon: "bottle-water",
    description: "Stainless steel water bottle",
    isActive: true
  },
  {
    title: "Plant a Tree",
    cost: 1000,
    icon: "tree",
    description: "We'll plant a tree in your name",
    isActive: true
  },
  {
    title: "Eco Gift Box",
    cost: 1500,
    icon: "gift",
    description: "Curated box of eco-friendly products",
    isActive: true
  }
];

// Instructions:
// 1. Open Firebase Console: https://console.firebase.google.com
// 2. Select your project: parivartan-3a3db
// 3. Go to Firestore Database
// 4. Click "Start collection"
// 5. Collection ID: "rewards"
// 6. Add each document above manually OR use the script below

// If using Firebase Admin SDK (Node.js):
/*
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function addRewards() {
  const batch = db.batch();
  
  sampleRewards.forEach((reward) => {
    const docRef = db.collection('rewards').doc();
    batch.set(docRef, {
      ...reward,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  console.log('✅ Added', sampleRewards.length, 'rewards to Firestore');
}

addRewards();
*/

// Quick Manual Steps:
// 1. Go to: https://console.firebase.google.com/project/parivartan-3a3db/firestore
// 2. Click "Start collection" → Enter "rewards"
// 3. Add first document with auto-ID:
//    - title: "Discount Voucher"
//    - cost: 300
//    - icon: "ticket-percent"
//    - description: "10% off on your next eco-friendly purchase"
//    - isActive: true
// 4. Repeat for other rewards

console.log('Sample rewards ready to add:', sampleRewards);
