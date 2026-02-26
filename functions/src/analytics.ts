import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// PHASE 1: PATHWAY ANALYTICS LAYER

// Real-time analytics on request updates
export const updateAnalyticsOnRequestChange = functions.firestore
  .document('wasteRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const db = admin.firestore();
    
    // Only process if status changed
    if (before.status === after.status) {
      return null;
    }
    
    console.log(`Status changed: ${before.status} → ${after.status}`);
    
    const today = new Date().toISOString().split('T')[0];
    const analyticsRef = db.collection('analytics').doc(today);
    
    // Calculate resolution time if completed
    let resolutionTime = 0;
    if (after.status === 'Completed') {
      const createdAt = after.createdAt?.toDate?.() || new Date(after.createdAt);
      const completedAt = new Date();
      resolutionTime = Math.floor((completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)); // hours
    }
    
    // Update analytics atomically
    await analyticsRef.set({
      date: today,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Update status counts
    await analyticsRef.update({
      [`statusCounts.${after.status}`]: admin.firestore.FieldValue.increment(1),
      [`statusCounts.${before.status}`]: admin.firestore.FieldValue.increment(-1)
    });
    
    // Update partner stats
    if (after.partnerId) {
      const partnerPath = `partnerStats.${after.partnerId}`;
      
      if (after.status === 'Accepted') {
        await analyticsRef.update({
          [`${partnerPath}.accepted`]: admin.firestore.FieldValue.increment(1)
        });
      }
      
      if (after.status === 'Completed') {
        await analyticsRef.update({
          [`${partnerPath}.completed`]: admin.firestore.FieldValue.increment(1),
          [`${partnerPath}.totalResolutionTime`]: admin.firestore.FieldValue.increment(resolutionTime),
          totalCompletedRequests: admin.firestore.FieldValue.increment(1),
          totalResolutionTime: admin.firestore.FieldValue.increment(resolutionTime)
        });
      }
    }
    
    return null;
  });

// Scheduled daily aggregation
export const generateDailyAnalytics = functions.pubsub
  .schedule('0 0 * * *') // Midnight daily
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Generating daily analytics for ${today}`);
    
    // Fetch all requests
    const requestsSnapshot = await db.collection('wasteRequests').get();
    
    const analytics = {
      date: today,
      totalRequests: 0,
      completedRequests: 0,
      activeRequests: 0,
      totalWasteKg: 0,
      statusCounts: {} as any,
      partnerStats: {} as any,
      totalResolutionTime: 0,
      averageResolutionTime: 0,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    requestsSnapshot.forEach(doc => {
      const data = doc.data();
      analytics.totalRequests++;
      
      // Status counts
      const status = data.status || 'Unknown';
      analytics.statusCounts[status] = (analytics.statusCounts[status] || 0) + 1;
      
      if (status === 'Completed') {
        analytics.completedRequests++;
        analytics.totalWasteKg += data.quantity || 0;
        
        // Calculate resolution time
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt);
        const resolutionHours = Math.floor((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
        analytics.totalResolutionTime += resolutionHours;
      } else {
        analytics.activeRequests++;
      }
      
      // Partner stats
      const partnerId = data.partnerId;
      if (partnerId) {
        if (!analytics.partnerStats[partnerId]) {
          analytics.partnerStats[partnerId] = {
            assigned: 0,
            accepted: 0,
            completed: 0,
            totalResolutionTime: 0,
            averageResolutionTime: 0
          };
        }
        
        analytics.partnerStats[partnerId].assigned++;
        
        if (status === 'Accepted' || status === 'In Progress' || status === 'Completed') {
          analytics.partnerStats[partnerId].accepted++;
        }
        
        if (status === 'Completed') {
          analytics.partnerStats[partnerId].completed++;
          const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
          const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt);
          const resolutionHours = Math.floor((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
          analytics.partnerStats[partnerId].totalResolutionTime += resolutionHours;
        }
      }
    });
    
    // Calculate averages
    if (analytics.completedRequests > 0) {
      analytics.averageResolutionTime = Math.round(analytics.totalResolutionTime / analytics.completedRequests);
    }
    
    // Calculate partner averages
    Object.keys(analytics.partnerStats).forEach(partnerId => {
      const stats = analytics.partnerStats[partnerId];
      if (stats.completed > 0) {
        stats.averageResolutionTime = Math.round(stats.totalResolutionTime / stats.completed);
      }
    });
    
    // Save to Firestore
    await db.collection('analytics').doc(today).set(analytics);
    
    console.log('Daily analytics generated:', {
      totalRequests: analytics.totalRequests,
      completedRequests: analytics.completedRequests,
      averageResolutionTime: analytics.averageResolutionTime
    });
    
    return null;
  });

// PHASE 2: INTELLIGENT IMPACT SUMMARY (Template-Based)

// Generate monthly impact summary
export const generateMonthlyImpactSummary = functions.pubsub
  .schedule('0 0 1 * *') // First day of month
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Get last month's date range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthKey = lastMonth.toISOString().slice(0, 7); // YYYY-MM
    
    console.log(`Generating impact summary for ${monthKey}`);
    
    // Fetch analytics for last month
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const analyticsSnapshot = await db.collection('analytics')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();
    
    // Aggregate monthly data
    let totalRequests = 0;
    let completedRequests = 0;
    let totalWasteKg = 0;
    let totalResolutionTime = 0;
    const wasteTypes: { [key: string]: number } = {};
    const topPartners: { [key: string]: number } = {};
    
    analyticsSnapshot.forEach(doc => {
      const data = doc.data();
      totalRequests += data.totalRequests || 0;
      completedRequests += data.completedRequests || 0;
      totalWasteKg += data.totalWasteKg || 0;
      totalResolutionTime += data.totalResolutionTime || 0;
      
      // Aggregate partner stats
      if (data.partnerStats) {
        Object.entries(data.partnerStats).forEach(([partnerId, stats]: [string, any]) => {
          topPartners[partnerId] = (topPartners[partnerId] || 0) + (stats.completed || 0);
        });
      }
    });
    
    // Fetch waste type breakdown
    const requestsSnapshot = await db.collection('wasteRequests')
      .where('status', '==', 'Completed')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate)))
      .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate)))
      .get();
    
    requestsSnapshot.forEach(doc => {
      const data = doc.data();
      const type = data.type || 'Other';
      wasteTypes[type] = (wasteTypes[type] || 0) + (data.quantity || 0);
    });
    
    // Calculate metrics
    const avgResolutionTime = completedRequests > 0 ? Math.round(totalResolutionTime / completedRequests) : 0;
    const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;
    
    // Estimate environmental impact (template-based calculations)
    const co2Saved = Math.round(totalWasteKg * 2.5); // 2.5kg CO2 per kg waste
    const treesEquivalent = Math.round(co2Saved / 20); // 1 tree absorbs ~20kg CO2/year
    const energySaved = Math.round(totalWasteKg * 4); // 4 kWh per kg
    
    // Generate natural language summary (template-based)
    const summary = generateSummaryText({
      monthKey,
      totalRequests,
      completedRequests,
      totalWasteKg,
      avgResolutionTime,
      completionRate,
      co2Saved,
      treesEquivalent,
      energySaved,
      wasteTypes,
      topPartners
    });
    
    // Save impact summary
    await db.collection('impactSummaries').doc(monthKey).set({
      month: monthKey,
      summary,
      metrics: {
        totalRequests,
        completedRequests,
        totalWasteKg,
        avgResolutionTime,
        completionRate,
        co2Saved,
        treesEquivalent,
        energySaved
      },
      wasteTypes,
      topPartners,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Impact summary generated for ${monthKey}`);
    return null;
  });

// Template-based summary generator (no external API)
function generateSummaryText(data: any): string {
  const {
    monthKey,
    totalRequests,
    completedRequests,
    totalWasteKg,
    avgResolutionTime,
    completionRate,
    co2Saved,
    treesEquivalent,
    energySaved,
    wasteTypes,
    topPartners
  } = data;
  
  const monthName = new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Opening
  let summary = `🌍 Environmental Impact Report - ${monthName}\n\n`;
  
  // Performance metrics
  summary += `📊 Performance Highlights:\n`;
  summary += `• ${completedRequests} waste collection requests completed out of ${totalRequests} total\n`;
  summary += `• ${completionRate}% completion rate\n`;
  summary += `• Average resolution time: ${avgResolutionTime} hours\n\n`;
  
  // Environmental impact
  summary += `♻️ Environmental Impact:\n`;
  summary += `• ${totalWasteKg}kg of waste responsibly recycled\n`;
  summary += `• Approximately ${co2Saved}kg of CO2 emissions prevented\n`;
  summary += `• Equivalent to ${treesEquivalent} trees planted for a year\n`;
  summary += `• ${energySaved} kWh of energy saved\n\n`;
  
  // Waste breakdown
  if (Object.keys(wasteTypes).length > 0) {
    summary += `📦 Waste Type Breakdown:\n`;
    const sortedTypes = Object.entries(wasteTypes)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);
    sortedTypes.forEach(([type, kg]) => {
      summary += `• ${type}: ${kg}kg\n`;
    });
    summary += `\n`;
  }
  
  // Top performers
  if (Object.keys(topPartners).length > 0) {
    summary += `⭐ Top Performing Partners:\n`;
    const sortedPartners = Object.entries(topPartners)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);
    sortedPartners.forEach(([partnerId, count], index) => {
      summary += `${index + 1}. Partner ${partnerId.slice(0, 8)}: ${count} requests completed\n`;
    });
    summary += `\n`;
  }
  
  // Closing message
  if (completionRate >= 80) {
    summary += `✨ Excellent work! The system is performing exceptionally well with a ${completionRate}% completion rate.`;
  } else if (completionRate >= 60) {
    summary += `👍 Good progress! Continue optimizing partner assignments to improve the ${completionRate}% completion rate.`;
  } else {
    summary += `⚠️ Attention needed: ${completionRate}% completion rate suggests room for improvement in partner engagement.`;
  }
  
  return summary;
}

// On-demand analytics fetch
export const getAnalytics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const db = admin.firestore();
  const { startDate, endDate } = data;
  
  const analyticsSnapshot = await db.collection('analytics')
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date', 'desc')
    .get();
  
  const analytics = analyticsSnapshot.docs.map(doc => ({
    date: doc.id,
    ...doc.data()
  }));
  
  return { analytics };
});

// On-demand impact summary fetch
export const getImpactSummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const db = admin.firestore();
  const { month } = data;
  
  const summaryDoc = await db.collection('impactSummaries').doc(month).get();
  
  if (!summaryDoc.exists) {
    return { summary: null };
  }
  
  return { summary: summaryDoc.data() };
});
