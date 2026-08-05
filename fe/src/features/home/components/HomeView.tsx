"use client";

import Link from "next/link";
import { Box, Flex, Text, SimpleGrid } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { AppButton } from "@/components/ui/AppButton";
import { PropertyCard } from "@/features/rental-posts/components/PropertyCard";
import { ROUTES } from "@/constants/routes";
import styles from "@/styles/interactions.module.css";

const FEATURED_POSTS = [
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
    badge: "Nổi bật",
  },
  {
    id: -2,
    tieuDe: "Dinh thự Willow Creek",
    giaThue: 8900,
    dienTich: 390,
    loaiBatDongSan: "Nhà nguyên căn",
    phuongXa: "Phường Dịch Vọng",
    quanHuyen: "Quận Cầu Giấy",
    tinhThanh: "Hà Nội",
    anhDaiDien: null,
    badge: "Mới",
  },
  {
    id: -3,
    tieuDe: "Căn hộ Studio Urban Nest",
    giaThue: 1800,
    dienTich: 60,
    loaiBatDongSan: "Phòng trọ",
    phuongXa: "Phường Thanh Khê Tây",
    quanHuyen: "Quận Thanh Khê",
    tinhThanh: "Đà Nẵng",
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

export function HomeView() {
  return (
    <>
      <Flex
        direction="column"
        align="center"
        gap={16}
        px={32}
        py={96}
        ta="center"
        bg="rgba(60, 47, 47, 0.9)"
      >
        <Text
          component="h1"
          maw={720}
          fz={{ base: 36, sm: 48 }}
          fw={700}
          fs="italic"
          c="var(--color-surface)"
          style={{ fontFamily: "var(--font-heading)", lineHeight: 1.15 }}
        >
          Tìm kiếm không gian sống đẳng cấp và tin cậy
        </Text>
        <Text maw={576} fz="lg" fw={300} c="rgba(255,255,255,0.95)">
          Khám phá bộ sưu tập bất động sản cao cấp được tuyển chọn riêng cho giới thượng lưu và
          cuộc sống đô thị hiện đại.
        </Text>
        <Flex
          align="center"
          gap={8}
          mt={16}
          w="100%"
          maw={672}
          p={8}
          bg="var(--color-cream)"
          style={{
            borderRadius: 8,
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <IconSearch size={20} style={{ marginLeft: 8, flexShrink: 0 }} color="var(--color-gold)" />
          <input
            type="text"
            placeholder="Tìm kiếm theo thành phố, khu phố hoặc mã vùng..."
            style={{
              minWidth: 0,
              flex: 1,
              border: "none",
              background: "transparent",
              padding: "8px",
              fontSize: 14,
              color: "var(--color-brand)",
              outline: "none",
            }}
          />
          <AppButton variant="primary" size="md" component={Link} href={ROUTES.danhSachNhaChoThue}>
            Tìm kiếm
          </AppButton>
        </Flex>
      </Flex>

      <Box px={32} py={80}>
        <Flex align="flex-end" justify="space-between" mb={32} wrap="wrap" gap={16}>
          <div>
            <Text mb={8} size="sm" fw={700} tt="uppercase" style={{ letterSpacing: "0.08em" }} c="var(--color-gold)">
              Lựa chọn dành cho bạn
            </Text>
            <Text
              component="h2"
              fz={30}
              fw={700}
              c="var(--color-brand)"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Bất động sản nổi bật
            </Text>
          </div>
          <Text component={Link} href={ROUTES.danhSachNhaChoThue} size="sm" fw={600} className={styles.goldLink}>
            Xem tất cả →
          </Text>
        </Flex>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={24}>
          {FEATURED_POSTS.map((post) => (
            <PropertyCard key={post.id} post={post} badge={post.badge} />
          ))}
        </SimpleGrid>
      </Box>

      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ sm: "center" }}
        justify="space-between"
        gap={24}
        px={32}
        py={80}
        bg="var(--color-brand)"
      >
        <Box maw={576}>
          <Text
            component="h2"
            fz={30}
            fw={700}
            c="var(--color-surface)"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Bạn sở hữu bất động sản? Hãy đăng tin ngay hôm nay để tiếp cận hàng ngàn khách thuê
            tiềm năng.
          </Text>
          <Text mt={16} fz="lg" fw={300} c="rgba(255,255,255,0.8)">
            Công cụ quản lý chuyên nghiệp giúp bạn theo dõi danh sách, quản lý yêu cầu và ký hợp
            đồng kỹ thuật số một cách an toàn.
          </Text>
        </Box>
        <AppButton variant="gold" size="lg" component={Link} href={ROUTES.dangTin}>
          Bắt đầu đăng tin
        </AppButton>
      </Flex>
    </>
  );
}
