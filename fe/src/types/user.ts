import type { Role } from "@/constants/roles";
import type { UserStatus } from "@/constants/user-status";

// Khớp đúng dữ liệu thật trả về từ GET /api/users (xem be/app/schemas/nguoi_dung.py).
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  postCount: number;
  createdAt: string;
}

export interface AdminUserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserListFilters {
  page?: number;
  pageSize?: number;
  q?: string;
}
