"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { NxSelect } from './NxSelect';

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'local';
}

export interface NxModelSelectorProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  models: AIModel[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export const NxModelSelector = forwardRef<HTMLSelectElement, NxModelSelectorProps>(({ 
  models, 
  selectedModelId, 
  onModelChange, 
  className,
  ...props 
}, ref) => {
  return (
    <NxSelect
      ref={ref}
      value={selectedModelId}
      onChange={(e) => onModelChange(e.target.value)}
      className={cn("min-w-[180px]", className)}
      {...props}
    >
      {models.map(model => (
        <option key={model.id} value={model.id} className="bg-surface-dark text-gray-200">
          {model.name} ({model.provider})
        </option>
      ))}
    </NxSelect>
  );
});
NxModelSelector.displayName = "NxModelSelector";
