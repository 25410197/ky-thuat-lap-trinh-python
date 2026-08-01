import type { RentalPostStatus } from "@/constants/rental-post-status";

export interface RentalPost {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
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
