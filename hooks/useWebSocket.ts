import { useEffect, useState, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
import { getToken } from '@/lib/auth';

/**
 * useWebSocket Hook
 * 
 * Manages the Laravel Echo instance and connection lifecycle.
 * Fixes the previous mock authorizer by implementing a real Axios call
 * to the backend broadcasting authentication endpoint.
 */
export const useWebSocket = () => {
  const [echo, setEcho] = useState<Echo<any> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const echoInstanceRef = useRef<Echo<any> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Ensure we are in a browser environment
    if (typeof window === 'undefined') return;

    let cleanup: (() => void) | undefined;
    let isMounted = true;

    const init = async () => {
      try {
        // Required global assignment for the Pusher broadcaster in Echo
        (window as any).Pusher = Pusher;
        setConnectionStatus('connecting');

        const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
        const broadcastAuthUrl = process.env.NEXT_PUBLIC_BROADCAST_AUTH_URL || `${apiBaseUrl}/broadcasting/auth`;
        const echoInstance = new Echo({
          broadcaster: 'pusher',
          key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'local',
          wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
          wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '6001', 10),
          wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '6001', 10),
          forceTLS: process.env.NEXT_PUBLIC_REVERB_FORCE_TLS === 'true',
          authEndpoint: broadcastAuthUrl,
          disableStats: true,
          enabledTransports: ['ws', 'wss'],
          cluster: 'mt1',
          authorizer: (channel: any) => {
            return {
              authorize: (socketId: string, callback: any) => {
                const token = getToken();
                axios.post(broadcastAuthUrl, {
                  socket_id: socketId,
                  channel_name: channel.name
                }, {
                  headers: {
                    'Authorization': token ? `Bearer ${token}` : undefined,
                    'Accept': 'application/json'
                  },
                  withCredentials: false,
                })
                .then(response => {
                  // On success, pass the auth signature back to Echo/Pusher
                  callback(false, response.data);
                })
                .catch(err => {
                  console.warn("Broadcasting authorization failed (non-critical):", err.message);
                  callback(true, err);
                });
              }
            };
          }
        });

        // Extract the underlying Pusher connection for state monitoring
        const pusherConnection = echoInstance.connector.pusher.connection;

        const handleStateChange = (states: { current: string }) => {
          setConnectionStatus(states.current);
        };

        const handleError = (err: any) => {
          // WebSocket failures are non-critical in development
          console.warn("WebSocket connection warning (non-critical):", err?.message || 'WebSocket Connection Error');
          setConnectionStatus('disconnected');
        };

        // Bind listeners
        pusherConnection.bind('state_change', handleStateChange);
        pusherConnection.bind('error', handleError);

        // Store echo instance for state update after effect
        echoInstanceRef.current = echoInstance;

        // Set echo state only if still mounted
        if (isMounted) {
          setEcho(echoInstance);
        }

        cleanup = () => {
          try {
            if (echoInstanceRef.current?.connector?.pusher?.connection) {
              echoInstanceRef.current.connector.pusher.connection.unbind('state_change', handleStateChange);
              echoInstanceRef.current.connector.pusher.connection.unbind('error', handleError);
            }
            if (echoInstanceRef.current) {
              echoInstanceRef.current.disconnect();
            }
          } catch (e) {
            console.warn("WebSocket cleanup warning:", e);
          }
        };
      } catch (err) {
        console.warn("WebSocket initialization warning (non-critical):", err);
        if (isMounted) {
          setError('WebSocket unavailable in development (non-critical)');
        }
      }
    };

    void init();
    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, []);

  // Separate effect to update echo state once it's ready
  useEffect(() => {
    let active = true;

    const updateEcho = () => {
      if (active && echoInstanceRef.current) {
        setEcho(echoInstanceRef.current);
      }
    };

    // Update echo after this effect runs
    updateEcho();

    return () => {
      active = false;
    };
  }, [echoInstanceRef]);

  return { echo, connectionStatus, error };
};