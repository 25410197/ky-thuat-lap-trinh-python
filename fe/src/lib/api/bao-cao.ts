import { apiClient } from "./api-client";
import { endpoints } from "./endpoints";
import { BaoCaoChiTiet, BaoCaoCreateRequest, BaoCaoProcessRequest, DanhSachBaoCao } from "@/schemas/bao-cao";

export const baoCaoApi = {
  getList: (params?: { page?: number; pageSize?: number; trangThai?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.pageSize) searchParams.append("page_size", params.pageSize.toString());
    if (params?.trangThai) searchParams.append("trang_thai", params.trangThai);
    
    const query = searchParams.toString();
    return apiClient.get<DanhSachBaoCao>(
      `${endpoints.baoCao.list}${query ? `?${query}` : ""}`
    );
  },
  getDetail: (id: number) => {
    return apiClient.get<BaoCaoChiTiet>(endpoints.baoCao.detail(id));
  },
  process: (id: number, payload: BaoCaoProcessRequest) => {
    return apiClient.put<BaoCaoChiTiet>(endpoints.baoCao.process(id), payload);
  },
  submitReport: (tinDangId: string | number, payload: BaoCaoCreateRequest) => {
    return apiClient.post<{ message: string; baoCaoId: number }>(endpoints.rentalPosts.report(tinDangId), payload);
  },
};
