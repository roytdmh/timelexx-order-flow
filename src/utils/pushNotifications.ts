// Push Notification Utilities

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    localStorage.setItem('notification-permission', permission);
    return permission;
  }

  return Notification.permission;
};

export const checkNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

export const showPushNotification = async (
  title: string,
  options: NotificationOptions & { data?: any }
): Promise<void> => {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.warn('Push notifications not supported');
    return;
  }

  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      requireInteraction: true,
      ...options,
    } as any);
  } catch (error) {
    console.error('Error showing push notification:', error);
  }
};

export const getNotificationSettings = () => {
  const enabled = localStorage.getItem('notifications-enabled') !== 'false';
  const permission = checkNotificationPermission();
  return { enabled, permission };
};

export const setNotificationSettings = (enabled: boolean) => {
  localStorage.setItem('notifications-enabled', enabled.toString());
};
