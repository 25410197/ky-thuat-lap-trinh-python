import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { RentalPost, RentalPostDetail, RentalPostListFilters, RentalPostListResponse } from "@/types/rental-post";
import type { RentalPostInput } from "../schemas/rental-post.schema";

export interface TinChoDuyet {
  id: number;
  tieuDe: string;
  nguoiDang: string;
  hinhAnh: string[];
  ngayDang: string;
  loaiBatDongSan: string;
  trangThai: string;
}

export interface DanhSachChoDuyetResponse {
  items: TinChoDuyet[];
  total: number;
  page: number;
  pageSize: number;
}

function buildQueryString(filters: RentalPostListFilters): string {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("page_size", String(filters.pageSize));
  if (filters.q) params.set("q", filters.q);
  if (filters.loaiBatDongSanId) params.set("loai_bat_dong_san_id", String(filters.loaiBatDongSanId));
  if (filters.tinhThanhId) params.set("tinh_thanh_id", String(filters.tinhThanhId));
  if (filters.quanHuyenId) params.set("quan_huyen_id", String(filters.quanHuyenId));
  if (filters.phuongXaMoiId) params.set("phuong_xa_moi_id", String(filters.phuongXaMoiId));
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
  detail: (id: string) =>
    apiClient.get<RentalPostDetail>(endpoints.rentalPosts.detail(id), { skipAuth: true }),
  mine: () => {
    return apiClient.get<RentalPost[]>(endpoints.rentalPosts.mine);
  },
  create: (data: RentalPostInput) => {
    const { provinceId: _provinceId, wardId, coverImage, galleryImages, ...rest } = data;
    return apiClient.post<{ message: string; id: number }>(endpoints.rentalPosts.list, {
      ...rest,
      phuongXaMoiId: Number(wardId),
      anhChinhId: coverImage?.id,
      anhPhuId: galleryImages.map((anh) => anh.id),
    });
  },
  getForEdit: (id: string) =>
    apiClient.get<RentalPostInput & { status: string }>(endpoints.rentalPosts.edit(id)),
  update: (id: string, data: RentalPostInput) => {
    const { provinceId: _provinceId, wardId, coverImage, galleryImages, ...rest } = data;
    return apiClient.put<{ message: string; id: number }>(endpoints.rentalPosts.update(id), {
      ...rest,
      phuongXaMoiId: Number(wardId),
      anhChinhId: coverImage?.id,
      anhPhuId: galleryImages.map((anh) => anh.id),
    });
  },
  choDuyet: (page = 1, pageSize = 12) =>
    apiClient.get<DanhSachChoDuyetResponse>(
      `${endpoints.rentalPosts.choDuyet}?page=${page}&page_size=${pageSize}`
    ),
  chiTietTinDuyet: (id: number) =>
    apiClient.get<RentalPostDetail>(endpoints.rentalPosts.chiTietTinDuyet(id)),
  tinBiKhoa: (page = 1, pageSize = 12) =>
    apiClient.get<DanhSachChoDuyetResponse>(
      `${endpoints.rentalPosts.tinBiKhoa}?page=${page}&page_size=${pageSize}`
    ),
  duyetTinDang: (id: number) =>
    apiClient.post<{ message: string }>(endpoints.rentalPosts.duyetTinDang(id), {}),
  tuChoiTinDang: (id: number, lyDo?: string) => {
    const params = lyDo ? `?ly_do=${encodeURIComponent(lyDo)}` : "";
    return apiClient.post<{ message: string }>(
      `${endpoints.rentalPosts.tuChoiTinDang(id)}${params}`,
      {}
    );
  },
  moKhoaTin: (id: number) =>
    apiClient.post<{ message: string }>(endpoints.rentalPosts.moKhoaTin(id), {}),
  khoaTinDang: (id: number, lyDo: string) =>
    apiClient.post<{ message: string }>(endpoints.rentalPosts.khoaTinDang(id), { ly_do: lyDo }),
};
