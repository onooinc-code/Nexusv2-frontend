'use client';

import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGlobalStore } from '@/store';

/**
 * RealTimeJobListener Component
 * 
 * Bridges the Laravel Echo WebSocket connection with the Zustand store.
 * Listens for 'BatchProgressUpdated' events on private job channels and
 * updates the store with real telemetry from the backend.
 */
export default function RealTimeJobListener() {
  const { echo, connectionStatus } = useWebSocket();
  const updateJobProgress = useGlobalStore((state) => state.updateJobProgress);
  const jobs = useGlobalStore((state) => state.jobs);

  useEffect(() => {
    // Only subscribe if Echo is connected and authenticated
    if (!echo || connectionStatus !== 'connected') return;

    // Identify jobs that need real-time tracking
    const activeJobs = jobs.filter((job) => job.status === 'running');

    activeJobs.forEach((job) => {
      const channelName = `job.batch.${job.id}`;

      // Subscribe to the private channel defined in the backend
      echo.private(channelName)
        .listen('.App\\Events\\BatchProgressUpdated', (data: { percentage: number; status: string }) => {
          // Update the store state using real data from Reverb
          updateJobProgress(job.id, data.percentage, data.status as any);

          // Unsubscribe once the job reaches a terminal state
          if (data.status === 'success' || data.status === 'failed') {
            echo.leave(channelName);
          }
        });
    });

    // Clean up subscriptions on unmount or when the job list changes
    return () => {
      activeJobs.forEach((job) => {
        echo.leave(`job.batch.${job.id}`);
      });
    };
  }, [echo, connectionStatus, jobs, updateJobProgress]);

  // Headless component: renders nothing
  return null;
}