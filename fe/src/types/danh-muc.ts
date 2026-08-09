export interface LoaiBatDongSan {
  id: number;
  ten: string;
}

export type TrangThaiLoaiBatDongSan = "active" | "hidden";

export interface LoaiBatDongSanQuanTri {
  id: number;
  ten: string;
  status: TrangThaiLoaiBatDongSan;
  inUse: boolean;
}

export interface DanhSachLoaiBatDongSanQuanTri {
  items: LoaiBatDongSanQuanTri[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TinhThanh {
  id: number;
  ten: string;
}

export interface QuanHuyen {
  id: number;
  ten: string;
}

// Xã/phường theo địa giới MỚI (sau sáp nhập 07/2025) — thuộc thẳng tỉnh, không qua quận/huyện.
export interface PhuongXaMoi {
  id: number;
  ten: string;
}
