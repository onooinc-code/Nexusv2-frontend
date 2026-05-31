/**
 * Hook for managing page transitions with progress indication
 * Solves the freezing issue when navigating between pages
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const usePageTransition = () => {
  const router = useRouter();
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create progress bar element if it doesn't exist
    if (!progressRef.current && typeof document !== 'undefined') {
      const progress = document.createElement('div');
      progress.id = 'page-progress';
      progress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(to right, #3b82f6, #06b6d4);
        width: 0%;
        transition: width 0.3s ease;
        z-index: 99999;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
      `;
      document.body.appendChild(progress);
      progressRef.current = progress;
    }
  }, []);

  const startProgress = () => {
    if (progressRef.current) {
      progressRef.current.style.width = '30%';
    }
  };

  const completeProgress = () => {
    if (progressRef.current) {
      progressRef.current.style.width = '100%';
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.opacity = '0';
          progressRef.current.style.transition = 'opacity 0.3s ease';
        }
      }, 300);
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = '0%';
          progressRef.current.style.opacity = '1';
          progressRef.current.style.transition = 'width 0.3s ease';
        }
      }, 600);
    }
  };

  const navigate = (href: string) => {
    startProgress();
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      router.push(href);
      // Complete progress after navigation starts
      setTimeout(completeProgress, 100);
    });
  };

  return { navigate, startProgress, completeProgress };
};
