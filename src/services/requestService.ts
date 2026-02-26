import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { creditEcoPoints } from './rewardsService';
import { uploadImageToCloudinary } from './cloudinaryService';

// Status lifecycle pathway
const STATUS_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Assigned'],
  'Assigned': ['Accepted'],
  'Accepted': ['In Progress'],
  'In Progress': ['Completed'],
  'Completed': []
};

// Get next valid status
export const getNextValidStatus = (currentStatus: string): string | null => {
  const validNext = STATUS_TRANSITIONS[currentStatus];
  return validNext && validNext.length > 0 ? validNext[0] : null;
};

// Validate status transition
const isValidTransition = (currentStatus: string, newStatus: string): boolean => {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
};

// Update request status with validation
export const updateRequestStatus = async (
  requestId: string,
  newStatus: string
): Promise<boolean> => {
  try {
    if (newStatus === 'Completed') {
      console.error('❌ Cannot set status to Completed via updateRequestStatus. Use completeWithPoints() instead.');
      return false;
    }

    const requestRef = doc(db, 'wasteRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      console.error('❌ Request not found:', requestId);
      return false;
    }

    const currentStatus = requestSnap.data().status;

    if (!isValidTransition(currentStatus, newStatus)) {
      console.error(
        `❌ Invalid status transition: ${currentStatus} → ${newStatus}`,
        `\nAllowed transitions from ${currentStatus}:`,
        STATUS_TRANSITIONS[currentStatus] || 'none'
      );
      return false;
    }

    await updateDoc(requestRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    console.log(`✅ Status updated: ${currentStatus} → ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error updating request status:', error);
    return false;
  }
};

export interface RequestLocation {
  house: string;
  street: string;
  city: string;
  pincode: string;
  landmark?: string;
}

export interface WasteRequest {
  id: string;
  userId: string;
  wasteType: string;
  itemCount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  recyclerId: string | null;
  recyclerName: string | null;
  location: RequestLocation;
  createdAt: any;
  updatedAt: any;
}

export const createRequest = async (
  userId: string,
  wasteType: string,
  itemCount: number,
  location: RequestLocation,
  partnerId?: string | null,
  imageUri?: string | null,
  confidence?: number | null,
  userName?: string | null
): Promise<string> => {
  try {
    console.log('🔵 createRequest called with:');
    console.log('  userId:', userId);
    console.log('  wasteType:', wasteType);
    console.log('  itemCount:', itemCount);
    console.log('  location:', location);
    console.log('  partnerId:', partnerId);
    console.log('  imageUri:', imageUri);
    console.log('  confidence:', confidence);
    console.log('  userName:', userName);

    // Fetch user details from users collection
    let userFullName = userName || 'Anonymous';
    let userEmail = '';
    let userPhone = '';
    
    try {
      console.log('👤 Fetching user details...');
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userFullName = userData.fullName || userName || 'Anonymous';
        userEmail = userData.email || '';
        userPhone = userData.phone || '';
        console.log('✅ User details fetched:', { userFullName, userEmail, userPhone });
      } else {
        console.log('⚠️ User document not found');
      }
    } catch (userError) {
      console.warn('⚠️ Could not fetch user details:', userError);
    }

    // Upload image to Cloudinary if provided
    let uploadedImageUrl = null;
    if (imageUri) {
      console.log('🔵 IMAGE URI PROVIDED:', imageUri);
      console.log('🔵 ATTEMPTING CLOUDINARY UPLOAD...');
      try {
        uploadedImageUrl = await uploadImageToCloudinary(imageUri);
        console.log('✅ CLOUDINARY UPLOAD SUCCESS!');
        console.log('✅ UPLOADED URL:', uploadedImageUrl);
        console.log('✅ URL TYPE:', typeof uploadedImageUrl);
        console.log('✅ STARTS WITH HTTPS:', uploadedImageUrl?.startsWith('https'));
      } catch (uploadError) {
        console.error('❌ CLOUDINARY UPLOAD FAILED!');
        console.error('❌ ERROR:', uploadError);
        console.error('❌ ERROR MESSAGE:', (uploadError as Error).message);
        console.error('❌ CONTINUING WITHOUT IMAGE');
        // Continue without image if upload fails
        uploadedImageUrl = null;
      }
    } else {
      console.log('⚠️ NO IMAGE URI PROVIDED');
    }

    console.log('📦 FINAL IMAGE URL TO SAVE:', uploadedImageUrl);

    const requestData = {
      userId,
      userName: userFullName,
      userEmail: userEmail,
      userPhone,
      type: wasteType,
      quantity: itemCount,
      status: partnerId ? 'Assigned' : 'Pending',
      partnerId: partnerId || null,
      location,
      imageUrl: uploadedImageUrl,
      confidence: confidence || null,
      date: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('📦 Request data to save:', JSON.stringify({
      ...requestData,
      imageUrl: uploadedImageUrl ? 'URL_PROVIDED' : 'NULL',
      imageUrlLength: uploadedImageUrl?.length || 0
    }, null, 2));
    console.log('🔵 Saving to Firestore...');

    const docRef = await addDoc(collection(db, 'wasteRequests'), requestData);
    console.log('✅ Request created with ID:', docRef.id);
    console.log('✅ Status:', requestData.status, '| PartnerId:', partnerId || 'none');
    
    // Create notification for partner if assigned
    if (partnerId) {
      try {
        console.log('🔔 Creating notification for partner:', partnerId);
        await addDoc(collection(db, 'notifications'), {
          type: 'waste_request',
          message: `New waste request assigned: ${wasteType} at ${location.city}`,
          partnerId: partnerId,
          requestId: docRef.id,
          createdAt: serverTimestamp(),
          status: 'unread'
        });
        console.log('✅ Notification sent to partner:', partnerId);
      } catch (notifError) {
        console.error('⚠️ Failed to create notification:', notifError);
        // Don't fail the request if notification fails
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error in createRequest:', error);
    throw error;
  }
};

export const subscribeToUserRequests = (
  userId: string,
  onUpdate: (requests: WasteRequest[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'wasteRequests'),
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const requests: WasteRequest[] = [];

      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        } as WasteRequest);
      });

      // Sort by createdAt in JavaScript
      requests.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime.getTime() - aTime.getTime();
      });

      console.log('Real-time update: Fetched', requests.length, 'requests');
      onUpdate(requests);
    },
    (error) => {
      console.error('Error in real-time request subscription:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

export const subscribeToRequest = (
  requestId: string,
  onUpdate: (request: any) => void,
  onError?: (error: Error) => void
) => {
  const docRef = doc(db, 'wasteRequests', requestId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        onUpdate(data);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

export const getUserRequests = async (userId: string): Promise<WasteRequest[]> => {
  try {
    const q = query(
      collection(db, 'wasteRequests'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const requests: WasteRequest[] = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as WasteRequest);
    });

    // Sort by createdAt in JavaScript instead of Firestore
    requests.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return bTime.getTime() - aTime.getTime();
    });

    console.log('Fetched', requests.length, 'requests for user');
    return requests;
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return [];
  }
};

export const completeRequest = async (requestId: string, userId: string): Promise<boolean> => {
  console.error('❌ completeRequest() is deprecated. Use completeWithPoints() in PartnerDashboardScreen instead.');
  return false;
};

export const getActiveRequest = async (userId: string): Promise<WasteRequest | null> => {
  try {
    const requests = await getUserRequests(userId);
    const activeRequest = requests.find(req => req.status !== 'completed' && req.status !== 'cancelled');
    return activeRequest || null;
  } catch (error) {
    console.error('Error fetching active request:', error);
    return null;
  }
};