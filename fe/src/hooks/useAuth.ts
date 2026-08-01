"use client";

import { useCallback, useEffect, useState } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { authStorage } from "@/lib/auth/auth-storage";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export function useAuth() {
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

  return { user, isLoading, isAuthenticated: Boolean(user), login, register, logout };
}
