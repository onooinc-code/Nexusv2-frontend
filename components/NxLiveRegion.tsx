"use client";

import React, { useEffect, useState } from 'react';

export const NxLiveRegion = ({ message, politeness = 'polite' }: { message: string; politeness?: 'polite' | 'assertive' }) => {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // clear after countdown so next identical message can trigger
      const timer = setTimeout(() => {
        setAnnouncement("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div 
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only absolute w-px h-px p-0 -m-px overflow-hidden clip outline-none border-0"
    >
      {announcement}
    </div>
  );
};
