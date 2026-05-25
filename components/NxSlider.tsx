import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface NxSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
}

export const NxSlider = forwardRef<HTMLInputElement, NxSliderProps>(({ className, label, valueDisplay, ...props }, ref) => {
  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {(label || valueDisplay) && (
        <div className="flex justify-between items-center px-1">
          {label && <span className="text-sm font-medium text-gray-200">{label}</span>}
          {valueDisplay && <span className="text-xs text-gray-400">{valueDisplay}</span>}
        </div>
      )}
      <input
        type="range"
        ref={ref}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-nexus-blue outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-nexus-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Custom thumb styles for webkit */
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          border: 2px solid theme('colors.nexus-blue.DEFAULT', #00a8ff);
          cursor: pointer;
        }
        /* Custom thumb for Firefox */
        input[type=range]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          border: 2px solid theme('colors.nexus-blue.DEFAULT', #00a8ff);
          cursor: pointer;
        }
        `
      }} />
    </div>
  );
});

NxSlider.displayName = "NxSlider";
