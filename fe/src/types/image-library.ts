export interface AnhThuVienItem {
  id: number;
  url: string;
  tenTep: string;
  dungLuong: number;
  ngayTaiLen: string;
}

export interface AnhThuVienListResponse {
  items: AnhThuVienItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AnhThuVienListFilters {
  page?: number;
  pageSize?: number;
  q?: string;
}
