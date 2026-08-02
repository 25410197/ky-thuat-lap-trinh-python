"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { authStorage } from "@/lib/auth/auth-storage";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(authStorage.getToken()));

  useEffect(() => {
    if (!authStorage.getToken()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => authStorage.clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await authApi.login(payload);
    authStorage.setToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await authApi.register(payload);
    authStorage.setToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    authStorage.clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: Boolean(user), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }
  return context;
}
