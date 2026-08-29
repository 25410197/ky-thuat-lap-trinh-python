import { usersApi } from "@/features/users/api/users.api";
import { rentalPostsApi } from "@/features/rental-posts/api/rental-posts.api";
import { baoCaoApi } from "@/lib/api/bao-cao";
import { thongKeApi, type ThongKeTongQuan } from "@/features/reports/api/thong-ke.api";

export interface AdminOverviewStats {
  tongNguoiDung: number;
  choDuyet: number;
  baoCaoChoXuLy: number;
  tongQuan: ThongKeTongQuan;
}

export async function fetchAdminOverviewStats(): Promise<AdminOverviewStats> {
  const [users, choDuyet, baoCao, tongQuan] = await Promise.all([
    usersApi.list({ page: 1, pageSize: 1 }),
    rentalPostsApi.choDuyet(1, 1),
    baoCaoApi.getList({ page: 1, pageSize: 1, trangThai: "cho_xu_ly" }),
    thongKeApi.tongQuan(),
  ]);

  return {
    tongNguoiDung: users.total,
    choDuyet: choDuyet.total,
    baoCaoChoXuLy: baoCao.total,
    tongQuan,
  };
}
