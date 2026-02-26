import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Import analytics functions
export * from './analytics';

export const calculateEcoPointsOnCompletion = functions.firestore
  .document('wasteRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const beforeStatus = change.before.data().status;
    const afterStatus = change.after.data().status;
    const afterData = change.after.data();

    // Only proceed if status changed to "Completed" and points not yet awarded
    if (afterStatus !== 'Completed' || beforeStatus === 'Completed' || afterData.ecoPointsAwarded) {
      return null;
    }

    const requestId = context.params.requestId;
    const userId = afterData.userId;
    const wasteType = (afterData.type || afterData.wasteType || '').toLowerCase();
    const quantity = afterData.quantity || 0;

    console.log(`🔵 Calculating points for request ${requestId}: ${quantity} kg of ${wasteType}`);

    try {
      // Fetch all active reward rules
      const rulesSnapshot = await admin.firestore()
        .collection('rewardRules')
        .where('isActive', '==', true)
        .get();

      if (rulesSnapshot.empty) {
        console.log(`⚠️ No active reward rules found`);
        return null;
      }

      // Find matching rule with case-insensitive comparison
      const matchingRule = rulesSnapshot.docs.find(doc => 
        doc.data().wasteType?.toLowerCase() === wasteType
      );

      if (!matchingRule) {
        console.log(`⚠️ No reward rule found for "${wasteType}"`);
        console.log(`⚠️ Available types:`, rulesSnapshot.docs.map(d => d.data().wasteType));
        return null;
      }

      const rule = matchingRule.data();
      const pointsPerKg = rule.pointsPerKg || 0;
      const ecoPointsAwarded = Math.round(quantity * pointsPerKg);

      console.log(`✅ Awarding ${ecoPointsAwarded} points (${quantity} × ${pointsPerKg})`);

      // Update request with awarded points
      await admin.firestore().collection('wasteRequests').doc(requestId).update({
        ecoPointsAwarded,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Increment user's ecoPoints
      await admin.firestore().collection('users').doc(userId).update({
        ecoPoints: admin.firestore.FieldValue.increment(ecoPointsAwarded)
      });

      console.log(`✅ Successfully awarded ${ecoPointsAwarded} points to user ${userId}`);
      return { success: true, pointsAwarded: ecoPointsAwarded };
    } catch (error) {
      console.error('❌ Error calculating EcoPoints:', error);
      return null;
    }
  });

export const onRequestStatusChange = functions.firestore
  .document('wasteRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const beforeStatus = change.before.data().status;
    const afterStatus = change.after.data().status;

    // Only send notification if status actually changed
    if (beforeStatus === afterStatus) {
      console.log('Status unchanged, skipping notification');
      return null;
    }

    const requestId = context.params.requestId;
    const userId = change.after.data().userId;

    if (!userId) {
      console.error('No userId found in request');
      return null;
    }

    // Fetch user's push token
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('User document not found:', userId);
      return null;
    }

    const pushToken = userDoc.data()?.pushToken;

    if (!pushToken) {
      console.log('No push token found for user:', userId);
      return null;
    }

    // Prepare push notification
    const message = {
      to: pushToken,
      sound: 'default',
      title: 'Request Status Updated',
      body: `Your request status changed to ${afterStatus}`,
      data: { 
        requestId,
        status: afterStatus
      },
      priority: 'high',
      channelId: 'default'
    };

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  });
