import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthUser } from "@/types/auth";

export interface UpdateProfilePayload {
  fullName: string;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const accountApi = {
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<AuthUser>(endpoints.auth.updateProfile, payload),
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<void>(endpoints.auth.changePassword, payload),
};
