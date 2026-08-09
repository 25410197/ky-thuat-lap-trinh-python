import type { RentalPostSummary } from "@/types/rental-post";

// Khớp đúng dữ liệu thật trả về từ GET /api/favorites (xem be/app/schemas/tin_yeu_thich.py).
export interface FavoriteListResponse {
  items: RentalPostSummary[];
  total: number;
  page: number;
  pageSize: number;
}
