import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthSession>(endpoints.auth.login, payload, { skipAuth: true }),
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthSession>(endpoints.auth.register, payload, { skipAuth: true }),
  me: () => apiClient.get<AuthUser>(endpoints.auth.me),
};
