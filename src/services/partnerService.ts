import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export type Partner = {
  id: string;
  name: string;
  organization: string;
  address: string;
  phone: string;
  supportedWasteTypes: string[];
  verificationStatus: string;
  subscriptionStatus: string;
};

/**
 * Subscribe to partners filtered by waste type
 * @param wasteType - The waste type to filter by (e.g., "plastic", "metal")
 * @param onUpdate - Callback with filtered partners
 * @param onError - Error callback
 * @returns Unsubscribe function
 */
export const subscribeToPartnersByWasteType = (
  wasteType: string,
  onUpdate: (partners: Partner[]) => void,
  onError?: (error: Error) => void
) => {
  const partnersRef = collection(db, 'partners');
  
  const q = query(
    partnersRef,
    where('supportedWasteTypes', 'array-contains', wasteType),
    where('verificationStatus', '==', 'approved'),
    where('subscriptionStatus', '==', 'active')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const partners: Partner[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Partner));
      
      console.log(`🔄 Partners updated for ${wasteType}:`, partners.length);
      onUpdate(partners);
    },
    (error) => {
      console.error('❌ Partner subscription error:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};
