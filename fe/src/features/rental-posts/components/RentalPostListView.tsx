"use client";

import { useState } from "react";
import { Group, Box, Text, SimpleGrid } from "@mantine/core";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppPagination } from "@/components/ui/AppPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { PropertyCard } from "./PropertyCard";

// Dữ liệu mẫu để dựng giao diện — sẽ thay bằng gọi API rental-posts (features/rental-posts/api).
const MOCK_POSTS = [
  {
    id: "demo-1",
    title: "Căn hộ Skyline Loft",
    priceUsd: 4250,
    city: "Trung tâm Manhattan, NY",
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 167,
  },
  {
    id: "demo-2",
    title: "Dinh thự Willow Creek",
    priceUsd: 8900,
    city: "Palo Alto, CA",
    bedrooms: 5,
    bathrooms: 4,
    areaM2: 390,
  },
  {
    id: "demo-3",
    title: "Căn hộ Studio Urban Nest",
    priceUsd: 1800,
    city: "Seattle, WA",
    bedrooms: 1,
    bathrooms: 1,
    areaM2: 60,
  },
];

export function RentalPostListView() {
  const [page, setPage] = useState(1);

  return (
    <Box px={32} py={40}>
      <Text
        component="h1"
        mb={24}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Danh sách nhà cho thuê
      </Text>

      <Group gap={12} mb={32} align="flex-end">
        <AppInput style={{ flex: 1 }} label="Tìm kiếm" placeholder="Nhập thành phố, khu phố..." />
        <AppSelect
          label="Số phòng ngủ"
          placeholder="Tất cả"
          data={["1", "2", "3", "4", "5+"]}
          clearable
        />
        <AppSelect
          label="Sắp xếp"
          placeholder="Mới nhất"
          data={["Giá tăng dần", "Giá giảm dần", "Mới nhất"]}
        />
      </Group>

      {MOCK_POSTS.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tin đăng"
          description="Thử điều chỉnh bộ lọc tìm kiếm."
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={24}>
            {MOCK_POSTS.map((post) => (
              <PropertyCard key={post.id} post={post} />
            ))}
          </SimpleGrid>
          <Group justify="center" mt={40}>
            <AppPagination total={5} value={page} onChange={setPage} />
          </Group>
        </>
      )}
    </Box>
  );
}
