export interface LoaiBatDongSan {
  id: number;
  ten: string;
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
