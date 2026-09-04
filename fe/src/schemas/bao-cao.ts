export interface NguoiDungTomTat {
  id: number;
  hoTen: string;
  email: string;
}

export interface TinDangNganGach {
  id: number;
  tieuDe: string;
  isBlocked?: boolean;
  trangThai?: string;
}

export interface BaoCaoTomTat {
  id: number;
  lyDo: string;
  trangThai: string;
  ngayBaoCao: string;
  nguoiBaoCao: NguoiDungTomTat;
  tinDang: TinDangNganGach;
}

export interface DanhSachBaoCao {
  items: BaoCaoTomTat[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BaoCaoChiTiet {
  id: number;
  lyDo: string;
  moTa: string | null;
  trangThai: string;
  ngayBaoCao: string;
  nguoiBaoCao: NguoiDungTomTat;
  tinDang: TinDangNganGach;
  nguoiXuLy: NguoiDungTomTat | null;
  ngayXuLy: string | null;
  ghiChuXuLy: string | null;
}

export interface BaoCaoProcessRequest {
  action: "RESOLVED" | "REJECTED";
  ghiChuXuLy: string;
  khoaTin: boolean;
  lyDoKhoa?: string | null;
}

export interface BaoCaoCreateRequest {
  lyDo: string;
  moTa?: string;
}
