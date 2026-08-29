import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";

export type NewsStatus = "draft" | "published" | "hidden";

export interface NewsListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  viewCount: number;
  publishedAt: string | null;
}

export interface NewsDetail extends NewsListItem {
  contentHtml: string;
}

export interface NewsListResponse {
  items: NewsListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminNewsListItem extends NewsListItem {
  status: NewsStatus;
}

export interface AdminNewsDetail extends AdminNewsListItem {
  contentHtml: string;
  coverImageId: number | null;
}

export interface AdminNewsListResponse {
  items: AdminNewsListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NewsFormPayload {
  title: string;
  slug?: string;
  excerpt: string;
  contentHtml: string;
  coverImageId?: number | null;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const tinTucApi = {
  list: (params: { page?: number; pageSize?: number; q?: string } = {}) =>
    apiClient.get<NewsListResponse>(
      `${endpoints.tinTuc.list}${buildQuery({ page: params.page, page_size: params.pageSize, q: params.q })}`,
      { skipAuth: true }
    ),
  detail: (slug: string) =>
    apiClient.get<NewsDetail>(endpoints.tinTuc.detail(slug), { skipAuth: true }),
  adminList: (params: { page?: number; pageSize?: number; q?: string; status?: NewsStatus } = {}) =>
    apiClient.get<AdminNewsListResponse>(
      `${endpoints.tinTuc.adminList}${buildQuery({
        page: params.page,
        page_size: params.pageSize,
        q: params.q,
        trang_thai: params.status,
      })}`
    ),
  adminDetail: (id: number) => apiClient.get<AdminNewsDetail>(endpoints.tinTuc.adminDetail(id)),
  adminCreate: (payload: NewsFormPayload) =>
    apiClient.post<AdminNewsDetail>(endpoints.tinTuc.adminList, payload),
  adminUpdate: (id: number, payload: NewsFormPayload) =>
    apiClient.put<AdminNewsDetail>(endpoints.tinTuc.adminDetail(id), payload),
  adminChangeStatus: (id: number, newStatus: NewsStatus) =>
    apiClient.patch<AdminNewsDetail>(endpoints.tinTuc.adminTrangThai(id), { status: newStatus }),
};
