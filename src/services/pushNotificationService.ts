import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export async function requestPushNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Push notification permission denied');
      return false;
    }

    // Configure Android notification channel with sound
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    console.log('✅ Push notification permission granted');
    return true;
  } catch (error) {
    console.error('Error requesting push notification permissions:', error);
    return false;
  }
}

// Get and register Expo push token
export async function registerPushToken(userId: string): Promise<string | null> {
  try {
    console.log('📱 Registering push token for user:', userId);

    // Get Expo push token (works in Expo Go without projectId)
    const tokenData = await Notifications.getExpoPushTokenAsync();
    
    const pushToken = tokenData.data;
    console.log('✅ Expo push token:', pushToken);

    // Save token to Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: pushToken,
      pushTokenUpdatedAt: new Date(),
    });

    console.log('✅ Push token saved to Firestore');
    return pushToken;
  } catch (error: any) {
    // Gracefully handle token errors - don't block app functionality
    if (error?.message?.includes('projectId')) {
      console.warn('⚠️ Push notifications require EAS project setup. Skipping for now.');
      console.warn('   Run: eas init && eas build:configure');
    } else {
      console.error('❌ Error registering push token:', error);
    }
    return null;
  }
}

// Send local push notification
export async function sendLocalPushNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default', // Explicitly set sound
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        data,
      },
      trigger: null, // Show immediately
    });
    console.log('✅ Local notification sent:', title);
  } catch (error) {
    console.error('❌ Error sending local notification:', error);
  }
}

// Send status update notification
export async function sendStatusUpdateNotification(
  status: string,
  wasteType: string,
  scheduledAt?: any
): Promise<void> {
  let title = 'Pickup Update';
  let body = '';

  switch (status) {
    case 'Accepted':
      title = '✅ Request Accepted';
      body = `Your ${wasteType} waste collection request has been accepted by the recycler.`;
      break;
    case 'In Progress':
    case 'OnTheWay':
      title = '🚚 Recycler On The Way';
      if (scheduledAt) {
        const date = scheduledAt?.toDate?.() || new Date(scheduledAt);
        const timeStr = date.toLocaleString();
        body = `The recycler is on the way to collect your ${wasteType} waste. Scheduled for ${timeStr}`;
      } else {
        body = `The recycler is on the way to collect your ${wasteType} waste.`;
      }
      break;
    case 'Completed':
      title = '🎉 Pickup Completed';
      body = `Your ${wasteType} waste has been successfully collected. EcoPoints credited!`;
      break;
    default:
      title = 'Status Update';
      body = `Your ${wasteType} waste request status: ${status}`;
  }

  await sendLocalPushNotification(title, body, { status, wasteType });
}

// Setup notification listeners
export function setupNotificationListeners() {
  // Handle notification received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('📬 Notification received in foreground:', notification);
  });

  // Handle notification tapped
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response);
    // Handle navigation based on notification data
    const data = response.notification.request.content.data;
    console.log('Notification data:', data);
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

export default {
  requestPushNotificationPermissions,
  registerPushToken,
  sendLocalPushNotification,
  sendStatusUpdateNotification,
  setupNotificationListeners,
};
