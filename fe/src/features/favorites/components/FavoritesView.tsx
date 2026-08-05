import { Text, SimpleGrid } from "@mantine/core";
import { EmptyState } from "@/components/common/EmptyState";
import { PropertyCard } from "@/features/rental-posts/components/PropertyCard";

// Figma không thiết kế riêng màn "Yêu thích" nên tái dùng PropertyCard (component thật của
// màn Trang chủ) với dữ liệu mock — sẽ nối API favorites.list() ở ticket tiếp theo.
const MOCK_FAVORITES = [
  {
    id: -1,
    tieuDe: "Căn hộ Skyline Loft",
    giaThue: 4250,
    dienTich: 167,
    loaiBatDongSan: "Căn hộ",
    phuongXa: "Phường Bến Nghé",
    quanHuyen: "Quận 1",
    tinhThanh: "Thành phố Hồ Chí Minh",
    anhDaiDien: null,
  },
  {
    id: -4,
    tieuDe: "Căn hộ Penthouse Beacon Harbor",
    giaThue: 12000,
    dienTich: 325,
    loaiBatDongSan: "Căn hộ",
    phuongXa: "Phường Bình Thọ",
    quanHuyen: "Thành phố Thủ Đức",
    tinhThanh: "Thành phố Hồ Chí Minh",
    anhDaiDien: null,
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
