import { NotificationItem } from './types';
import { loadNotificationsFromStorage, saveNotificationsToStorage } from './storage';

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch (e) {
    console.error('Push notification permission error', e);
    return false;
  }
}

export function playNotificationSound(type: 'success' | 'warning' | 'alert' = 'success'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15); // F4
    } else {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
    }

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export function sendPushNotification(title: string, options?: NotificationOptions): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Could not dispatch browser push notification', e);
    }
  }
}

export function addInAppNotification(
  title: string,
  message: string,
  type: NotificationItem['type'] = 'insight',
  playSound = true
): NotificationItem {
  const newNotif: NotificationItem = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    title,
    message,
    timestamp: new Date().toISOString(),
    type,
    read: false,
  };

  const currentList = loadNotificationsFromStorage();
  const updated = [newNotif, ...currentList].slice(0, 30); // Keep max 30 recent notifications
  saveNotificationsToStorage(updated);

  if (playSound) {
    playNotificationSound(type === 'budget' ? 'warning' : 'success');
  }

  sendPushNotification(title, { body: message });

  return newNotif;
}
