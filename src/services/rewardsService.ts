import { doc, updateDoc, addDoc, collection, query, where, getDocs, getDoc, serverTimestamp, increment, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface RewardTransaction {
  id: string;
  userId: string;
  requestId: string;
  points: number;
  type: 'earned' | 'redeemed';
  createdAt: any;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  image: string;
  category: string;
  status: string;
}

export const creditEcoPoints = async (
  userId: string,
  requestId: string,
  points: number
): Promise<boolean> => {
  try {
    const existingQuery = query(
      collection(db, 'rewardTransactions'),
      where('userId', '==', userId),
      where('requestId', '==', requestId),
      where('type', '==', 'earned')
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      return false;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ecoPoints: increment(points),
      completedRequests: increment(1),
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'rewardTransactions'), {
      userId,
      requestId,
      points,
      type: 'earned',
      createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    return false;
  }
};

export const getUserEcoPoints = async (userId: string): Promise<number> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.ecoPoints || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

export const getUserRewardHistory = async (userId: string): Promise<RewardTransaction[]> => {
  try {
    const q = query(
      collection(db, 'rewardTransactions'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const transactions: RewardTransaction[] = [];

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as RewardTransaction);
    });

    // Sort by createdAt in JavaScript
    transactions.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return bTime.getTime() - aTime.getTime();
    });


    return transactions;
  } catch (error) {
    return [];
  }
};

export const subscribeToVouchers = (callback: (vouchers: Voucher[]) => void): (() => void) => {
  const q = query(
    collection(db, 'vouchers'),
    where('status', '==', 'available')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const vouchers: Voucher[] = [];
      snapshot.forEach((doc) => {
        vouchers.push({
          id: doc.id,
          ...doc.data()
        } as Voucher);
      });
      vouchers.sort((a, b) => a.pointsRequired - b.pointsRequired);
      callback(vouchers);
    },
    (error) => {
      callback([]);
    }
  );

  return unsubscribe;
};

export const getAvailableVouchers = async (): Promise<Voucher[]> => {
  try {
    const q = query(
      collection(db, 'vouchers'),
      where('status', '==', 'available')
    );

    const querySnapshot = await getDocs(q);
    const vouchers: Voucher[] = [];

    querySnapshot.forEach((doc) => {
      vouchers.push({
        id: doc.id,
        ...doc.data()
      } as Voucher);
    });

    vouchers.sort((a, b) => a.pointsRequired - b.pointsRequired);
    return vouchers;
  } catch (error) {
    return [];
  }
};