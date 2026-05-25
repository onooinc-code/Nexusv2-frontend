"use client";

import React, { createContext, useContext, useRef } from "react";
import { StoreApi, useStore } from "zustand";
import { useGlobalStore, GlobalState } from "./index";

export const StoreContext = createContext<StoreApi<GlobalState> | null>(null);

export interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  // Using useState to ensure the store is created only once per provider instance and is safe for render
  const [store] = React.useState(() => useGlobalStore);

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export const useAppStore = <T,>(
  selector: (store: GlobalState) => T,
): T => {
  const storeContext = useContext(StoreContext);
  
  if (!storeContext) {
    throw new Error("useAppStore must be used within a StoreProvider");
  }

  return useStore(storeContext, selector);
};
