import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  DanhSachLoaiBatDongSanQuanTri,
  LoaiBatDongSan,
  LoaiBatDongSanQuanTri,
  PhuongXaMoi,
  QuanHuyen,
  TinhThanh,
} from "@/types/danh-muc";

export const danhMucApi = {
  loaiBatDongSan: () =>
    apiClient.get<LoaiBatDongSan[]>(endpoints.danhMuc.loaiBatDongSan, { skipAuth: true }),
  tinhThanh: () => apiClient.get<TinhThanh[]>(endpoints.danhMuc.tinhThanh, { skipAuth: true }),
  quanHuyen: (tinhThanhId: number) =>
    apiClient.get<QuanHuyen[]>(endpoints.danhMuc.quanHuyen(tinhThanhId), { skipAuth: true }),
  xaPhuongMoi: (tinhThanhId: number) =>
    apiClient.get<PhuongXaMoi[]>(endpoints.danhMuc.xaPhuongMoi(tinhThanhId), { skipAuth: true }),
  loaiBatDongSanQuanTri: (page = 1, pageSize = 20, q?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (q) params.set("q", q);
    return apiClient.get<DanhSachLoaiBatDongSanQuanTri>(
      `${endpoints.danhMuc.loaiBatDongSanQuanTri}?${params.toString()}`
    );
  },
  taoLoaiBatDongSan: (name: string) =>
    apiClient.post<LoaiBatDongSanQuanTri>(endpoints.danhMuc.loaiBatDongSan, { name }),
  suaLoaiBatDongSan: (id: number, name: string) =>
    apiClient.put<LoaiBatDongSanQuanTri>(endpoints.danhMuc.loaiBatDongSanDetail(id), { name }),
  doiTrangThaiLoaiBatDongSan: (id: number) =>
    apiClient.patch<LoaiBatDongSanQuanTri>(endpoints.danhMuc.loaiBatDongSanTrangThai(id)),
};
