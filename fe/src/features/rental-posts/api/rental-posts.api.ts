import { apiClient } from "@/lib/api/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { RentalPost } from "@/types/rental-post";
import type { RentalPostInput } from "../schemas/rental-post.schema";

export const rentalPostsApi = {
  mine: () => {
    return apiClient.get<RentalPost[]>(endpoints.rentalPosts.mine);
  },
  create: (data: RentalPostInput) => {
    return apiClient.post<{ message: string; id: number }>(
      endpoints.rentalPosts.list,
      data,
    );
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    
    return apiClient.post<{ urls: string[] }>("/upload/images", formData);
  },
};
