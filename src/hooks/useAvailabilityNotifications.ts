import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { sendAvailabilityCheckNotification } from '../services/pushNotificationService';

export const useAvailabilityNotifications = (userId: string | undefined) => {
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('type', '==', 'availability_confirmation'),
      where('status', '==', 'sent')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((d) => {
        if (seenIds.current.has(d.id)) return;
        seenIds.current.add(d.id);

        const data = d.data();
        const pickupDate = data.metadata?.pickupDate || 'upcoming date';
        const pickupTime = data.metadata?.pickupTime || 'scheduled time';
        sendAvailabilityCheckNotification(pickupDate, pickupTime);
      });
    });

    return () => unsubscribe();
  }, [userId]);
};
