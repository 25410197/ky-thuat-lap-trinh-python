import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AnhThuVienItem,
  AnhThuVienListFilters,
  AnhThuVienListResponse,
} from "@/types/image-library";

function buildQueryString(filters: AnhThuVienListFilters): string {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("page_size", String(filters.pageSize));
  if (filters.q) params.set("q", filters.q);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const imageLibraryApi = {
  list: (filters: AnhThuVienListFilters = {}) =>
    apiClient.get<AnhThuVienListResponse>(`${endpoints.imageLibrary.list}${buildQueryString(filters)}`),
  upload: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiClient.post<AnhThuVienItem[]>(endpoints.imageLibrary.list, formData);
  },
  rename: (id: number, tenTep: string) =>
    apiClient.patch<AnhThuVienItem>(endpoints.imageLibrary.detail(id), { tenTep }),
  remove: (id: number) => apiClient.delete<void>(endpoints.imageLibrary.detail(id)),
};
