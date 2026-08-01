import { Text, SimpleGrid } from "@mantine/core";
import { EmptyState } from "@/components/common/EmptyState";
import { PropertyCard } from "@/features/rental-posts/components/PropertyCard";

// Figma không thiết kế riêng màn "Yêu thích" nên tái dùng PropertyCard (component thật của
// màn Trang chủ) với dữ liệu mock — sẽ nối API favorites.list() ở ticket tiếp theo.
const MOCK_FAVORITES = [
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
    id: "demo-4",
    title: "Căn hộ Penthouse Beacon Harbor",
    priceUsd: 12000,
    city: "Bãi biển Miami, FL",
    bedrooms: 4,
    bathrooms: 4,
    areaM2: 325,
  },
];

export function FavoritesView() {
  return (
    <div>
      <Text
        component="h1"
        mb={24}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Tin đăng yêu thích
      </Text>
      {MOCK_FAVORITES.length === 0 ? (
        <EmptyState
          title="Chưa có tin đăng yêu thích"
          description="Nhấn biểu tượng trái tim trên tin đăng để lưu vào đây."
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={24}>
          {MOCK_FAVORITES.map((post) => (
            <PropertyCard key={post.id} post={post} />
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
