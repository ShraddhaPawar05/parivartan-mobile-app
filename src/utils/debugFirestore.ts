// Debug utility to check Firestore data
// Import this in PartnerDashboardScreen and call it to debug

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const debugFirestoreData = async (requestId?: string, userId?: string) => {
  console.log('\n========== FIRESTORE DEBUG ==========\n');

  // Check rewardRules collection
  try {
    console.log('📋 Checking rewardRules collection...');
    const rulesSnapshot = await getDocs(collection(db, 'rewardRules'));
    console.log(`✅ Found ${rulesSnapshot.docs.length} documents in rewardRules`);
    rulesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}:`, {
        wasteType: data.wasteType,
        pointsPerKg: data.pointsPerKg,
        isActive: data.isActive
      });
    });
  } catch (error) {
    console.error('❌ Error reading rewardRules:', error);
  }

  // Check specific wasteRequest if provided
  if (requestId) {
    try {
      console.log(`\n📋 Checking wasteRequest: ${requestId}...`);
      const requestDoc = await getDoc(doc(db, 'wasteRequests', requestId));
      if (requestDoc.exists()) {
        const data = requestDoc.data();
        console.log('✅ Request data:', {
          type: data.type,
          wasteType: data.wasteType,
          quantity: data.quantity,
          status: data.status,
          userId: data.userId,
          ecoPointsAwarded: data.ecoPointsAwarded
        });
      } else {
        console.log('❌ Request not found');
      }
    } catch (error) {
      console.error('❌ Error reading wasteRequest:', error);
    }
  }

  // Check user ecoPoints if provided
  if (userId) {
    try {
      console.log(`\n📋 Checking user: ${userId}...`);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('✅ User data:', {
          fullName: data.fullName,
          ecoPoints: data.ecoPoints,
          totalEcoPoints: data.totalEcoPoints
        });
      } else {
        console.log('❌ User not found');
      }
    } catch (error) {
      console.error('❌ Error reading user:', error);
    }
  }

  console.log('\n========== END DEBUG ==========\n');
};
