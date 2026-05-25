"use client";

import React, { useState } from 'react';
import { Menu, Bell, Cpu, X } from 'lucide-react';
import { useAppStore } from '@/store/store-provider';
import { NxCommandBar } from './NxCommandBar';
import { NxThemeSwitcher } from './NxThemeSwitcher';
import { GlobalJobMonitor } from './GlobalJobMonitor';

export const NxTopBar = () => {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const isJobMonitorOpen = useAppStore((state) => (state as any).isJobMonitorOpen);
  const setJobMonitorOpen = useAppStore((state) => (state as any).setJobMonitorOpen);
  const jobs = useAppStore((state) => (state as any).jobs || []);
  const activeJobs = jobs.filter((j: any) => j.status === 'running');
  const notifications = useAppStore((state) => (state as any).notifications || []);
  const dismissNotification = useAppStore((state) => (state as any).dismissNotification);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.length;

  return (
    <>
      <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-40 w-full bg-[#161B22]/75 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-blue md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Desktop menu toggle */}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors hidden md:block focus:outline-none focus:ring-2 focus:ring-nexus-blue"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Placeholder for Breadcrumb or Context */}
          <div className="hidden sm:block text-sm font-medium text-gray-300">
            Nexus Workspace
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search / Command Bar */}
          <NxCommandBar />

          {/* Global Jobs Pipeline Monitor button */}
          <button 
            onClick={() => setJobMonitorOpen(!isJobMonitorOpen)}
            className={`p-2 relative rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors ${activeJobs.length > 0 ? "text-nexus-blue bg-nexus-blue/10 animate-pulse border border-nexus-blue/20" : ""}`}
            title="Toggle telemetry job pipeline"
          >
            <Cpu className={`w-5 h-5 ${activeJobs.length > 0 ? "animate-spin" : ""}`} />
            {activeJobs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nexus-blue rounded-full border border-surface-dark" />
            )}
          </button>

          {/* Global Notifications */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 relative rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-blue"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-error rounded-full border border-surface-dark flex items-center justify-center text-xs text-white font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#161B22]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-gray-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        notifications.forEach((n: any) => dismissNotification(n.id));
                      }}
                      className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start justify-between group ${
                          notification.type === 'error' ? 'bg-error/10' :
                          notification.type === 'warning' ? 'bg-warning/10' :
                          notification.type === 'success' ? 'bg-success/10' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-200">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">Just now</p>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <NxThemeSwitcher />

          {/* User Profile */}
          <button className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ml-1">
            <span className="text-sm font-medium text-gray-200 px-2 hidden sm:block">Admin</span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-nexus-blue to-hedral-purple" />
          </button>
        </div>

        <GlobalJobMonitor isOpen={isJobMonitorOpen} onClose={() => setJobMonitorOpen(false)} />
      </header>
      
      {/* Overlay to close notifications when clicking outside */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </>
  );
};


