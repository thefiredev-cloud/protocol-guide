import { useEffect, useRef, useState } from 'react';
import type { EventSubscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerForPushNotifications } from '@/lib/notifications';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

/**
 * Initialize push notifications for authenticated users
 * Call this hook once in the app's root layout (inside AppProvider)
 */
export function usePushNotifications() {
  const { isAuthenticated, user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);
  const tokenRegisteredRef = useRef(false);

  const savePushToken = trpc.user.savePushToken.useMutation();

  useEffect(() => {
    // Only register for authenticated users on native platforms
    if (!isAuthenticated || !user || Platform.OS === 'web') {
      return;
    }

    // Only register once per session
    if (tokenRegisteredRef.current) {
      return;
    }

    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        savePushToken.mutate({ token, platform: platform as 'ios' | 'android' });
        tokenRegisteredRef.current = true;
        console.log('[Push] Token registered with backend');
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Push] Received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[Push] Tapped:', response);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, user]);

  // Reset registration flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      tokenRegisteredRef.current = false;
      setExpoPushToken(null);
    }
  }, [isAuthenticated]);

  return { expoPushToken };
}
