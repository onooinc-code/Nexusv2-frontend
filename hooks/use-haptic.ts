"use client";

import { useCallback } from 'react';

export function useHaptic() {
  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
      return;
    }

    try {
      switch (style) {
        case 'light':
          window.navigator.vibrate(10);
          break;
        case 'medium':
          window.navigator.vibrate(25);
          break;
        case 'heavy':
          window.navigator.vibrate(60);
          break;
        case 'success':
          window.navigator.vibrate([15, 30, 20]);
          break;
        case 'warning':
          window.navigator.vibrate([40, 40, 40]);
          break;
        case 'error':
          window.navigator.vibrate([100, 50, 100]);
          break;
        default:
          window.navigator.vibrate(15);
      }
    } catch (e) {
      // browser blocked or unsupported gracefully
    }
  }, []);

  return triggerHaptic;
}
