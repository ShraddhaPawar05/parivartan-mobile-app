/**
 * PARTNER SERVICE USAGE EXAMPLES
 * 
 * This service connects to the existing Firebase 'partners' collection
 * and provides real-time filtering based on waste type.
 */

// ============================================
// EXAMPLE 1: Basic Usage in a Component
// ============================================

import React, { useEffect, useState } from 'react';
import { subscribeToPartnersByWasteType, Partner } from '../services/partnerService';

const MyComponent = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const wasteType = 'plastic'; // From AI prediction

  useEffect(() => {
    // Subscribe to partners
    const unsubscribe = subscribeToPartnersByWasteType(
      wasteType,
      (updatedPartners) => {
        console.log('Partners updated:', updatedPartners);
        setPartners(updatedPartners);
      },
      (error) => {
        console.error('Error:', error);
      }
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, [wasteType]);

  return (
    <View>
      {partners.map(p => (
        <Text key={p.id}>{p.name}</Text>
      ))}
    </View>
  );
};

// ============================================
// EXAMPLE 2: With Loading State
// ============================================

const MyComponentWithLoading = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const wasteType = 'metal';

  useEffect(() => {
    const unsubscribe = subscribeToPartnersByWasteType(
      wasteType,
      (updatedPartners) => {
        setPartners(updatedPartners);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [wasteType]);

  if (loading) return <ActivityIndicator />;
  
  return <PartnerList partners={partners} />;
};

// ============================================
// EXAMPLE 3: Dynamic Waste Type from Context
// ============================================

import { useUploadFlow } from '../context/UploadFlowContext';

const DynamicPartnerList = () => {
  const { category } = useUploadFlow(); // AI predicted category
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    if (!category) return;

    const unsubscribe = subscribeToPartnersByWasteType(
      category,
      setPartners
    );

    return () => unsubscribe();
  }, [category]);

  return (
    <FlatList
      data={partners}
      renderItem={({ item }) => <PartnerCard partner={item} />}
      keyExtractor={item => item.id}
    />
  );
};

// ============================================
// PARTNER DATA STRUCTURE
// ============================================

/*
{
  id: "partner123",
  name: "GreenCycle Foundation",
  organization: "GreenCycle Pvt Ltd",
  address: "123 Main St, City",
  phone: "+91 9876543210",
  supportedWasteTypes: ["plastic", "paper", "metal"],
  verificationStatus: "approved",
  subscriptionStatus: "active"
}
*/

// ============================================
// FIRESTORE QUERY DETAILS
// ============================================

/*
Collection: partners

Filters Applied:
1. supportedWasteTypes array-contains wasteType
2. verificationStatus == "approved"
3. subscriptionStatus == "active"

Real-time: YES (uses onSnapshot)
Auto-updates: YES
Unsubscribe: Required on unmount
*/

// ============================================
// CONSOLE LOGS
// ============================================

/*
When subscription starts:
🔍 Subscribing to partners for: plastic

When data updates:
🔄 Partners updated for plastic: 5

On error:
❌ Partner subscription error: [Error details]
*/
