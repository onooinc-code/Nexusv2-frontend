/**
 * Hook for managing page transitions with progress indication
 * Integrated with Next.js router events
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const useProgressBar = () => {
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Create or get progress bar
    let progress = document.getElementById('page-transition-progress') as HTMLDivElement;
    if (!progress) {
      progress = document.createElement('div');
      progress.id = 'page-transition-progress';
      progress.className = 'transition-progress';
      progress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%);
        width: 0%;
        z-index: 9999;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      document.body.insertBefore(progress, document.body.firstChild);
    }
    progressRef.current = progress;
  }, []);

  const start = () => {
    if (progressRef.current) {
      progressRef.current.style.width = '40%';
    }
  };

  const complete = () => {
    if (progressRef.current) {
      progressRef.current.style.width = '100%';
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.transition = 'opacity 0.5s ease-out';
          progressRef.current.style.opacity = '0';
        }
      }, 300);
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = '0%';
          progressRef.current.style.opacity = '1';
          progressRef.current.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
      }, 800);
    }
  };

  return { start, complete };
};
