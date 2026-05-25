import React from 'react';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { useHaptic } from '@/hooks/use-haptic';

export interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
  className?: string;
  rightAction?: React.ReactNode;
}

export const MobileHeader = ({ title, onMenuClick, rightAction, className }: MobileHeaderProps) => {
  const triggerHaptic = useHaptic();

  return (
    <div className={cn("h-14 flex items-center justify-between px-4 border-b border-white/10 glass sm:hidden shrink-0 z-30 sticky top-0", className)}>
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={() => {
              triggerHaptic('light');
              onMenuClick();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="font-semibold text-gray-100">{title}</span>
      </div>
      <div>
        {rightAction}
      </div>
    </div>
  );
};
