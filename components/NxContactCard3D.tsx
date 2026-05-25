"use client";

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';
import { User, Phone, Mail, Building } from 'lucide-react';

export interface NxContactCard3DProps {
  contact: {
    name: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  className?: string;
}

export const NxContactCard3D = ({ contact, className }: NxContactCard3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Limits the rotation angle
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
      className={cn("perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        className="transition-transform duration-200 ease-out preserve-3d h-full"
        style={{
          transform: isHovering ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : 'rotateX(0) rotateY(0)'
        }}
      >
        <NxGlassCard className="h-full flex flex-col p-5 relative overflow-hidden group">
          {/* Decorative background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-nexus-blue/20 rounded-full blur-3xl group-hover:bg-nexus-blue/30 transition-colors" />
          
          <div className="flex items-start gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 relative">
              {contact.avatar ? (
                <img src={contact.avatar} 
                  alt={contact.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">{contact.name}</h3>
              <p className="text-xs text-nexus-blue font-medium">{contact.role ?? ''}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-auto text-sm text-gray-400 relative z-10">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              <span>{contact.company ?? ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="truncate">{contact.email ?? ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{contact.phone ?? ''}</span>
            </div>
          </div>
        </NxGlassCard>
      </div>
    </div>
  );
};
