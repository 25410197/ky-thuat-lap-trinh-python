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
  giaThueTrungBinh: number;
}

export interface ThongKePhanBoGia {
  khoangGia: string;
  soLuong: number;
}

export interface ThongKeTongQuan {
  tongSoTinDang: number;
  tongSoTinDaDuyet: number;
  giaThueTrungBinh: number;
  dienTichTrungBinh: number;
  giaTrenM2TrungBinh: number;
  theoLoaiBatDongSan: ThongKeTheoLoai[];
  theoTinhThanh: ThongKeTheoTinhThanh[];
  khuVucNhieuTinNhat: ThongKeTheoTinhThanh | null;
  phanBoGia: ThongKePhanBoGia[];
}

export interface SoSanhKhuVucItem {
  quanHuyenId: number;
  quanHuyen: string;
  tinhThanh: string;
  soLuong: number;
  giaThueTrungBinh: number | null;
  giaThueTrungVi: number | null;
  giaTrenM2TrungBinh: number | null;
  mauNho: boolean;
}

export interface SoSanhKhuVuc {
  nguongMauNho: number;
  ketQua: SoSanhKhuVucItem[];
}

export const thongKeApi = {
  tongQuan: () => apiClient.get<ThongKeTongQuan>(endpoints.thongKe.tongQuan),
  soSanhKhuVuc: (quanHuyenIds: number[], loaiBatDongSanId?: number) => {
    const params = new URLSearchParams();
    quanHuyenIds.forEach((id) => params.append("quan_huyen_id", String(id)));
    if (loaiBatDongSanId) params.set("loai_bat_dong_san_id", String(loaiBatDongSanId));
    return apiClient.get<SoSanhKhuVuc>(`${endpoints.thongKe.soSanhKhuVuc}?${params.toString()}`);
  },
};
