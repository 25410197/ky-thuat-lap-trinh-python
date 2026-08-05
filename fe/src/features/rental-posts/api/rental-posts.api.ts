import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { RentalPost, RentalPostListFilters, RentalPostListResponse } from "@/types/rental-post";
import type { RentalPostInput } from "../schemas/rental-post.schema";

function buildQueryString(filters: RentalPostListFilters): string {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("page_size", String(filters.pageSize));
  if (filters.q) params.set("q", filters.q);
  if (filters.loaiBatDongSanId) params.set("loai_bat_dong_san_id", String(filters.loaiBatDongSanId));
  if (filters.tinhThanhId) params.set("tinh_thanh_id", String(filters.tinhThanhId));
  if (filters.quanHuyenId) params.set("quan_huyen_id", String(filters.quanHuyenId));
  if (filters.giaTu !== undefined) params.set("gia_tu", String(filters.giaTu));
  if (filters.giaDen !== undefined) params.set("gia_den", String(filters.giaDen));
  if (filters.dienTichTu !== undefined) params.set("dien_tich_tu", String(filters.dienTichTu));
  if (filters.dienTichDen !== undefined) params.set("dien_tich_den", String(filters.dienTichDen));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const rentalPostsApi = {
  list: (filters: RentalPostListFilters = {}) =>
    apiClient.get<RentalPostListResponse>(`${endpoints.rentalPosts.list}${buildQueryString(filters)}`, {
      skipAuth: true,
    }),
  mine: () => {
    return apiClient.get<RentalPost[]>(endpoints.rentalPosts.mine);
  },
  create: (data: RentalPostInput) => {
    return apiClient.post<{ message: string; id: number }>(
      endpoints.rentalPosts.list,
      data,
    );
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiClient.post<{ urls: string[] }>("/upload/images", formData);
  },
};
