import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { LoaiBatDongSan, QuanHuyen, TinhThanh } from "@/types/danh-muc";

export const danhMucApi = {
  loaiBatDongSan: () =>
    apiClient.get<LoaiBatDongSan[]>(endpoints.danhMuc.loaiBatDongSan, { skipAuth: true }),
  tinhThanh: () => apiClient.get<TinhThanh[]>(endpoints.danhMuc.tinhThanh, { skipAuth: true }),
  quanHuyen: (tinhThanhId: number) =>
    apiClient.get<QuanHuyen[]>(endpoints.danhMuc.quanHuyen(tinhThanhId), { skipAuth: true }),
};
