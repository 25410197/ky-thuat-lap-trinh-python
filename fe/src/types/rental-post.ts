import type { RentalPostStatus } from "@/constants/rental-post-status";

export interface RentalPost {
  id: string;
  title: string;
  description: string;
  priceVnd: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  coverImageUrl: string | null;
  status: RentalPostStatus;
  ownerId: string;
  createdAt: string;
}

export interface RentalPostFilters {
  keyword?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  pageSize?: number;
}

// Khớp đúng dữ liệu thật trả về từ GET /api/rental-posts (xem be/app/schemas/tin_dang.py).
export interface RentalPostSummary {
  id: number;
  tieuDe: string;
  giaThue: number;
  dienTich: number;
  diaChiChiTiet: string;
  loaiBatDongSan: string;
  phuongXa: string;
  quanHuyen: string;
  tinhThanh: string;
  anhDaiDien: string | null;
  tienIch: string[];
  ngayDang: string;
}

export interface RentalPostListResponse {
  items: RentalPostSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RentalPostListFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  loaiBatDongSanId?: number;
  tinhThanhId?: number;
  quanHuyenId?: number;
  giaTu?: number;
  giaDen?: number;
  dienTichTu?: number;
  dienTichDen?: number;
}
