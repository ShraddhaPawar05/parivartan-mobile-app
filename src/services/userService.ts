import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface UserLocation {
  house: string;
  street: string;
  city: string;
  pincode: string;
  landmark?: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  location: UserLocation | null;
  ecoPoints: number;
  createdAt: any;
  updatedAt: any;
}

export const createUserProfile = async (
  uid: string,
  fullName: string,
  email: string,
  phone: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userProfile: UserProfile = {
      uid,
      fullName,
      email,
      phone,
      location: null,
      ecoPoints: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, userProfile);
    console.log('User profile created successfully');
  } catch (error) {
    console.warn('Error creating user profile:', error);
  }
};

export const createUserProfileIfNotExists = async (
  uid: string,
  email: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid,
        fullName: '',
        email,
        phone: '',
        location: null,
        ecoPoints: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, userProfile);
      console.log('User profile created for existing user');
    }
  } catch (error) {
    console.warn('Error checking/creating user profile:', error);
  }
};

/**
 * Creates a Firestore profile for Google Sign-In users.
 * If the user already exists, only updatedAt is refreshed — no overwrite.
 */
export const upsertGoogleUserProfile = async (
  uid: string,
  fullName: string,
  email: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid,
        fullName,
        email,
        phone: '',
        location: null,
        ecoPoints: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, userProfile);
    } else {
      // User exists — just refresh updatedAt, don't overwrite their data
      await updateDoc(userRef, { updatedAt: serverTimestamp() });
    }
  } catch (error) {
    console.warn('Error upserting Google user profile:', error);
  }
};

export const updateUserLocation = async (
  uid: string,
  location: UserLocation
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      console.log('User document does not exist, creating it...');
      const userProfile: UserProfile = {
        uid,
        fullName: '',
        email: '',
        phone: '',
        location,
        ecoPoints: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        onboardingComplete: true
      };
      await setDoc(userRef, userProfile);
      console.log('User profile created with location');
    } else {
      // Update existing document
      await updateDoc(userRef, {
        location,
        onboardingComplete: true,
        updatedAt: serverTimestamp()
      });
      console.log('User location updated successfully in Firestore');
    }
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};