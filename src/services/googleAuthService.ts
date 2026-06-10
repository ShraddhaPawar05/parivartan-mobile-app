import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { upsertGoogleUserProfile } from './userService';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export function useGoogleAuth() {
  console.log('[GoogleAuth] webClientId:', WEB_CLIENT_ID);
  console.log('[GoogleAuth] androidClientId:', ANDROID_CLIENT_ID);
  return Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });
}

export async function handleGoogleResponse(
  response: Google.AuthSessionResult | null
): Promise<{ success: boolean; error?: string }> {
  if (!response) return { success: false };

  if (response.type === 'cancel' || response.type === 'dismiss') {
    return { success: false, error: 'cancelled' };
  }

  if (response.type !== 'success') {
    return { success: false, error: 'Google sign-in failed. Please try again.' };
  }

  // On Android: auto code-exchange puts idToken in authentication.idToken
  // On Web:     id_token comes directly in params
  const idToken =
    (response as any).authentication?.idToken ?? response.params?.id_token;

  if (!idToken) {
    return { success: false, error: 'No ID token received from Google.' };
  }

  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(auth, credential);
    await upsertGoogleUserProfile(
      user.uid,
      user.displayName ?? '',
      user.email ?? ''
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? 'Authentication failed.' };
  }
}
