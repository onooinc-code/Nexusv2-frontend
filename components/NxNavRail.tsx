"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Cpu,
  GitMerge,
  BrainCircuit,
  ScrollText,
  Settings,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Network,
  Clock,
  LogOut,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/store-provider';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Agents', href: '/agents', icon: Cpu },
  { name: 'Workflows', href: '/workflows', icon: GitMerge },
  { name: 'AI Models', href: '/ai-models', icon: Sparkles },
  { name: 'Proactive AI', href: '/proactive-ai', icon: Bot },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Scheduler', href: '/scheduler', icon: Clock },
  { name: 'Memory', href: '/memory', icon: BrainCircuit },
  { name: 'APIs', href: '/apis', icon: Network },
  { name: 'Logs', href: '/logs', icon: ScrollText },
];

export const NxNavRail = () => {
  const pathname = usePathname();
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const { logout } = useAuth();

  return (
    <nav className={cn(
      "hidden md:flex flex-col border-r border-white/10 glass transition-all duration-300 h-screen sticky top-0 z-50",
      isSidebarOpen ? "w-[260px]" : "w-[80px]"
    )}>
      <div className="flex items-center justify-center h-16 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-nexus-blue to-hedral-purple flex items-center justify-center shrink-0">
          <span className="text-white font-bold">N</span>
        </div>
        {isSidebarOpen && <span className="ml-3 font-sans font-semibold text-lg text-gray-100 tracking-tight whitespace-nowrap overflow-hidden">Nexus</span>}
      </div>

      <div className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative shrink-0",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-nexus-blue" : "group-hover:text-gray-200")} />
              {isSidebarOpen && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.name}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-surface-dark border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/10 shrink-0 flex flex-col gap-1">
        <Link 
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
            pathname === '/settings' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className={cn("w-5 h-5 flex-shrink-0", pathname === '/settings' ? "text-nexus-blue" : "")} />
          {isSidebarOpen && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Settings</span>}
          {!isSidebarOpen && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-surface-dark border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Settings
            </div>
          )}
        </Link>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative text-gray-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Logout</span>}
          {!isSidebarOpen && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-surface-dark border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </nav>
  );
};

