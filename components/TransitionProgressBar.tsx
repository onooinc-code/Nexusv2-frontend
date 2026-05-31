/**
 * Client-side progress indicator for page transitions
 * Displays visual feedback during route changes
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const TransitionProgressBar = () => {
  useEffect(() => {
    // Create and inject progress bar styles if not already present
    if (typeof document === 'undefined') return;

    const styleId = 'transition-progress-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes progress-expand {
          0% { width: 0%; }
          30% { width: 40%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }

        @keyframes progress-fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        .transition-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%);
          width: 0%;
          z-index: 9999;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .transition-progress.completing {
          width: 100%;
        }

        .transition-progress.complete {
          animation: progress-fade-out 0.5s ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }

    // Create progress bar element
    let progressBar = document.getElementById('page-transition-progress') as HTMLDivElement;
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'page-transition-progress';
      progressBar.className = 'transition-progress';
      document.body.insertBefore(progressBar, document.body.firstChild);
    }

    return () => {
      // Cleanup on unmount
      if (progressBar?.parentNode) {
        progressBar.remove();
      }
    };
  }, []);

  return null;
};
