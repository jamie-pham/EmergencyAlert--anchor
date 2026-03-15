// src/notifications/pushHandler.js
// Registers device for push notifications and sends local alerts.

import * as Notifications from 'expo-notifications';
import * as Device        from 'expo-device';
import Constants          from 'expo-constants';
import { Platform }       from 'react-native';

// How notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ── Register device ───────────────────────────────────────────────────────
/**
 * Ask for permission and return an Expo Push Token.
 * Store this token on your backend to send remote pushes.
 */
export async function registerForPushNotifications() {
  // Push notifications only work on real devices, not simulators
  if (!Device.isDevice) {
    console.log('[Push] Skipped — not a real device.');
    return null;
  }

  // Check / request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission not granted.');
    return null;
  }

  // Get the Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[Push] Token:', token);

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('emergency-alerts', {
        name:             'Emergency Alerts',
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor:       '#ef4444',
        sound:            'default',
      });
    }

    return token;
  } catch (err) {
    console.warn('[Push] Token error:', err.message);
    return null;
  }
}

// ── Send local alert (triggered by risk engine) ───────────────────────────
/**
 * Fire an immediate local notification for a HIGH-risk nearby incident.
 * @param {object} incident
 */
export async function sendLocalEmergencyAlert(incident) {
  const typeEmoji = { fire: '🔥', flood: '🌊', storm: '⛈', heatwave: '🌡' };
  const emoji     = typeEmoji[incident.type] || '⚠️';

  await Notifications.scheduleNotificationAsync({
    content: {
      title:    `${emoji} ${incident.risk} RISK — ${incident.name}`,
      body:     `${incident.distanceKm}km from you. Tap for safety instructions.`,
      data:     { incidentId: incident.id },
      sound:    'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // send immediately
  });
}

// ── Listen for notification taps ──────────────────────────────────────────
/**
 * Call this once in App.js to handle when a user taps a notification.
 * @param {function} onSelect — callback with incidentId
 */
export function addNotificationResponseListener(onSelect) {
  return Notifications.addNotificationResponseReceivedListener(response => {
    const incidentId = response.notification.request.content.data?.incidentId;
    if (incidentId) onSelect(incidentId);
  });
}
