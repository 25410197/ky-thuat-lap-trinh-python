import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { FavoriteListResponse } from "@/types/favorite";

export const favoritesApi = {
  list: (page = 1, pageSize = 12) =>
    apiClient.get<FavoriteListResponse>(
      `${endpoints.favorites.list}?page=${page}&page_size=${pageSize}`
    ),
  ids: () => apiClient.get<number[]>(`${endpoints.favorites.list}/ids`),
  add: (rentalPostId: number) =>
    apiClient.post<{ message: string }>(endpoints.favorites.toggle(String(rentalPostId))),
  remove: (rentalPostId: number) =>
    apiClient.delete<{ message: string }>(endpoints.favorites.toggle(String(rentalPostId))),
};
