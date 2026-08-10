import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";

export interface ThongKeTheoLoai {
  loaiBatDongSan: string;
  soLuong: number;
  giaThueTrungBinh: number;
  dienTichTrungBinh: number;
  giaTrenM2TrungBinh: number;
}

export interface ThongKeTheoTinhThanh {
  tinhThanh: string;
  soLuong: number;
}

export interface ThongKeTongQuan {
  tongSoTinDang: number;
  tongSoTinDaDuyet: number;
  theoLoaiBatDongSan: ThongKeTheoLoai[];
  theoTinhThanh: ThongKeTheoTinhThanh[];
  khuVucNhieuTinNhat: ThongKeTheoTinhThanh | null;
}

export const thongKeApi = {
  tongQuan: () => apiClient.get<ThongKeTongQuan>(endpoints.thongKe.tongQuan),
};
