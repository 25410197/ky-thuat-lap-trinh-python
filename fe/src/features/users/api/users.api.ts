import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { AdminUser, AdminUserListFilters, AdminUserListResponse } from "@/types/user";

function buildQueryString(filters: AdminUserListFilters): string {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("page_size", String(filters.pageSize));
  if (filters.q) params.set("q", filters.q);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const usersApi = {
  list: (filters: AdminUserListFilters = {}) =>
    apiClient.get<AdminUserListResponse>(`${endpoints.users.list}${buildQueryString(filters)}`),
  updateStatus: (id: string, status: "active" | "locked") =>
    apiClient.patch<AdminUser>(endpoints.users.updateStatus(id), { status }),
};
