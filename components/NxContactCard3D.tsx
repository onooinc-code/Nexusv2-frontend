"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';
import { User, Phone, Mail, Building, MessageCircle, ShieldCheck, Gauge } from 'lucide-react';

export interface NxContactCard3DProps {
  contact: {
    name: string;
    display_name?: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
    whatsapp_number?: string;
    avatar?: string;
    contact_type?: string;
    primary_identifier?: string;
    reply_mode_override?: string;
    profile_confidence?: number;
    memory_freshness?: string;
    last_interaction_at?: string;
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
                <Image
                  src={contact.avatar}
                  alt={contact.name}
                  fill
                  sizes="100%"
                  className="object-cover" 
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
          
          <div className="flex flex-wrap gap-2 mb-4 relative z-10">
            {contact.contact_type && (
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase text-gray-300">
                {contact.contact_type}
              </span>
            )}
            <span className={cn(
              "px-2 py-1 rounded-md border text-[10px] uppercase",
              contact.reply_mode_override === 'autopilot'
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                : contact.reply_mode_override === 'copilot'
                  ? "bg-nexus-blue/10 border-nexus-blue/30 text-blue-200"
                  : "bg-white/5 border-white/10 text-gray-300"
            )}>
              {contact.reply_mode_override ?? 'global mode'}
            </span>
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
            {contact.whatsapp_number && (
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span>{contact.whatsapp_number}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Gauge className="w-3.5 h-3.5 text-gray-500" />
                {contact.profile_confidence ?? 0}% confidence
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                {contact.memory_freshness ? 'fresh memory' : 'no memory scan'}
              </div>
            </div>
          </div>
        </NxGlassCard>
      </div>
    </div>
  );
};
