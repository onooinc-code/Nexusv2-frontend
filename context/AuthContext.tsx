"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken, getUser, setToken, setUser, clearAuth, AuthUser, isAuthenticated } from '@/lib/auth';
import apiClient from '@/lib/api/client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const PUBLIC_PATHS = ['/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialise from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getToken();
      const storedUser  = getUser();
      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUserState(storedUser);
      }
      setIsLoading(false);
    };
    void initializeAuth();
  }, []);

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (isLoading) return;
    const onPublicPath = PUBLIC_PATHS.some(p => pathname?.startsWith(p));
    if (!isAuthenticated() && !onPublicPath) {
      router.replace('/login');
    }
  }, [isLoading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post('/v1/login', { email, password });
    const { access_token, user: resUser } = res.data;
    setToken(access_token);
    setUser(resUser);
    setTokenState(access_token);
    setUserState(resUser);
    router.replace('/');
  }, [router]);

  const logout = useCallback(() => {
    // Fire-and-forget server logout; errors don't block local cleanup
    apiClient.post('/v1/logout').catch(() => {});
    clearAuth();
    setTokenState(null);
    setUserState(null);
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
