// Run this script once to normalize all status values in Firestore
// Execute: node normalizeStatuses.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const STATUS_MAP = {
  'pending': 'Assigned',
  'assigned': 'Assigned',
  'accepted': 'Accepted',
  'in progress': 'In Progress',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'Pending': 'Assigned',
  'Assigned': 'Assigned',
  'Accepted': 'Accepted',
  'In Progress': 'In Progress',
  'Completed': 'Completed'
};

async function normalizeStatuses() {
  try {
    const snapshot = await db.collection('wasteRequests').get();
    
    console.log(`Found ${snapshot.size} requests`);
    
    const batch = db.batch();
    let updateCount = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const currentStatus = data.status;
      const normalizedStatus = STATUS_MAP[currentStatus];
      
      if (normalizedStatus && normalizedStatus !== currentStatus) {
        console.log(`Updating ${doc.id}: "${currentStatus}" → "${normalizedStatus}"`);
        batch.update(doc.ref, { status: normalizedStatus });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updateCount} documents`);
    } else {
      console.log('✅ All statuses already normalized');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

normalizeStatuses();
