// src/hooks/usePresenceSimple.ts
import { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { AppState, AppStateStatus } from 'react-native';
import { PING_ONLINE } from '../graphql/presence';

export const usePresenceSimple = (enabled: boolean = true) => {
  const [pingOnline] = useMutation(PING_ONLINE, {
    errorPolicy: 'ignore', // 🔥 Bỏ qua lỗi
  });

  useEffect(() => {
    if (!enabled) return;

    let pingInterval: NodeJS.Timeout;
    let isMounted = true;

    const ping = async () => {
      if (!isMounted) return;
      
      try {
        await pingOnline();
      } catch (err) {
        // Ignore errors
      }
    };

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        // Ping khi app active
        ping();
        // Ping mỗi 30s
        pingInterval = setInterval(ping, 30000);
      } else {
        // Clear interval khi app background
        if (pingInterval) {
          clearInterval(pingInterval);
        }
      }
    };

    // Initial ping
    ping();
    
    // Set interval
    pingInterval = setInterval(ping, 30000);
    
    // Listen to app state
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      subscription.remove();
    };
  }, [pingOnline, enabled]);
};