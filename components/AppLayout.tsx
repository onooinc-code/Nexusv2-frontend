"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { NxNavRail } from './NxNavRail';
import { NxTopBar } from './NxTopBar';
import { NxStatusBar } from './NxStatusBar';
import NxNotificationDrawer from './NxNotificationDrawer';
import { MobileHeader } from './MobileHeader';
import { useAppStore } from '@/store/store-provider';
import { Cpu } from 'lucide-react';

const AppLayoutContext = createContext<boolean>(false);

const pageNames: Record<string, string> = {
  '/': 'NexusHub',
  '/conversations': 'ConversationsHub',
  '/contacts': 'ContactsHub',
  '/agents': 'AgentsHub',
  '/workflows': 'WorkflowsHub',
  '/tasks': 'TasksHub',
  '/scheduler': 'SchedulerHub',
  '/memory': 'MemoryHub',
  '/apis': 'APIsHub',
  '/logs': 'LogsHub',
  '/ai-models': 'AIModelsHub',
  '/proactive-ai': 'Proactive AI',
  '/settings': 'SettingsHub',
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isInsideLayout = useContext(AppLayoutContext);
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const pathname = usePathname();

  const pageTitle = useMemo(() => {
    if (!pathname) return 'NexusHub';
    const matching = Object.keys(pageNames).find((key) => pathname === key || pathname.startsWith(`${key}/`));
    return matching ? pageNames[matching] : 'Nexus Workspace';
  }, [pathname]);

  if (isInsideLayout) {
    return <>{children}</>;
  }

  return (
    <AppLayoutContext.Provider value={true}>
      <div className="flex h-screen w-full bg-deep-space overflow-hidden text-gray-100">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <NxNavRail />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
          <div className="md:hidden sticky top-0 z-40">
            <MobileHeader
              title={pageTitle}
              onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
              rightAction={
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Open sidebar"
                >
                  <Cpu className="w-5 h-5" />
                </button>
              }
            />
          </div>

          <div className="hidden md:block">
            <NxTopBar />
          </div>

          <main className="flex-1 flex flex-col overflow-y-auto w-full relative z-0">
            {children}
          </main>

          {/* Global Footer Status Bar */}
          <NxStatusBar />
        </div>

        {/* Global Notification Drawer */}
        <NxNotificationDrawer />
      </div>
    </AppLayoutContext.Provider>
  );
};

