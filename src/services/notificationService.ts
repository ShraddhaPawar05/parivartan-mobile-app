import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      });
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Send local notification for status change
export const sendStatusChangeNotification = async (status: string, wasteType?: string, scheduledInfo?: string | null, earnedPoints?: number) => {
  try {
    const notificationConfig = getNotificationConfig(status, wasteType, scheduledInfo, earnedPoints);
    
    if (!notificationConfig) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationConfig.title,
        body: notificationConfig.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  } catch (error) {
    // Silent fail
  }
};

const getNotificationConfig = (status: string, wasteType?: string, scheduledInfo?: string | null, earnedPoints?: number) => {
  const waste = wasteType ? `${wasteType} waste` : 'waste';

  switch (status) {
    case 'Accepted':
      return {
        title: '✅ Request Accepted',
        body: `Your ${waste} pickup request has been accepted by the partner.`,
      };
    case 'In Progress':
      if (scheduledInfo) {
        return {
          title: '🚚 Pickup Scheduled',
          body: `Partner is on the way to collect your ${waste}. Scheduled for ${scheduledInfo}`,
        };
      }
      return {
        title: '🚚 Pickup On The Way',
        body: `The partner is on the way to collect your ${waste}.`,
      };
    case 'Completed':
      const pointsText = earnedPoints ? ` You earned ${earnedPoints} EcoPoints!` : '';
      return {
        title: '🎉 Pickup Completed',
        body: `Your ${waste} pickup has been completed.${pointsText}`,
      };
    default:
      return null;
  }
};
