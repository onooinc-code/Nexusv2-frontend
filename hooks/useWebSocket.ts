import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

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

  useEffect(() => {
    // Ensure we are in a browser environment
    if (typeof window === 'undefined') return;

    try {
      // Required global assignment for the Pusher broadcaster in Echo
      (window as any).Pusher = Pusher;

      const echoInstance = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'local',
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
        wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
        wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
        forceTLS: process.env.NEXT_PUBLIC_REVERB_FORCE_TLS === 'true',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        cluster: 'mt1',
        authorizer: (channel: any) => {
          return {
            authorize: (socketId: string, callback: any) => {
              axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`, {
                socket_id: socketId,
                channel_name: channel.name
              }, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                  'Accept': 'application/json'
                }
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

      setEcho(echoInstance);

      // Cleanup on unmount
      return () => {
        try {
          pusherConnection.unbind('state_change', handleStateChange);
          pusherConnection.unbind('error', handleError);
          echoInstance.disconnect();
        } catch (e) {
          // Cleanup errors are non-critical
          console.warn("WebSocket cleanup warning:", e);
        }
      };
    } catch (err) {
      // Connection initialization errors are non-critical in development
      console.warn("WebSocket initialization warning (non-critical):", err);
      setError('WebSocket unavailable in development (non-critical)');
    }
  }, []);

  return { echo, connectionStatus, error };
};