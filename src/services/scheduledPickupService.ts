import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface ScheduledPickup {
  id: string;
  userId: string;
  partnerId: string;
  requestId: string;
  date: any;
  location: {
    house: string;
    street: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  wasteType: string;
  quantity: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
}

export const createScheduledPickup = async (
  requestId: string,
  userId: string,
  partnerId: string,
  date: Date,
  location: any,
  wasteType: string,
  quantity: number
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'scheduledPickups'), {
      requestId,
      userId,
      partnerId,
      date,
      location,
      wasteType,
      quantity,
      status: 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update wasteRequest status to "In Progress" when pickup is scheduled
    await updateDoc(doc(db, 'wasteRequests', requestId), {
      status: 'In Progress',
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating scheduled pickup:', error);
    throw error;
  }
};

export const subscribeToUserSchedules = (
  userId: string,
  onUpdate: (schedules: ScheduledPickup[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'scheduledPickups'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScheduledPickup));
      
      schedules.sort((a, b) => {
        const aTime = a.date?.toDate?.() || new Date(a.date);
        const bTime = b.date?.toDate?.() || new Date(b.date);
        return bTime.getTime() - aTime.getTime();
      });
      
      onUpdate(schedules);
    },
    onError
  );
};

export const subscribeToPartnerSchedules = (
  partnerId: string,
  onUpdate: (schedules: ScheduledPickup[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'scheduledPickups'),
    where('partnerId', '==', partnerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScheduledPickup));
      
      schedules.sort((a, b) => {
        const aTime = a.date?.toDate?.() || new Date(a.date);
        const bTime = b.date?.toDate?.() || new Date(b.date);
        return aTime.getTime() - bTime.getTime();
      });
      
      onUpdate(schedules);
    },
    onError
  );
};

export const updateScheduleStatus = async (
  scheduleId: string,
  status: 'scheduled' | 'completed' | 'cancelled'
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'scheduledPickups', scheduleId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    throw error;
  }
};
