"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Flex, Text, SimpleGrid, Skeleton } from "@mantine/core";
import { IconSearch, IconBuildingSkyscraper, IconMapPin, IconCoin } from "@tabler/icons-react";
import { AppButton } from "@/components/ui/AppButton";
import { PropertyCard } from "@/features/rental-posts/components/PropertyCard";
import { rentalPostsApi } from "@/features/rental-posts/api/rental-posts.api";
import { thongKeApi, type ThongKeTongQuan } from "@/features/reports/api/thong-ke.api";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyVnd } from "@/lib/utils";
import type { RentalPostSummary } from "@/types/rental-post";
import styles from "@/styles/interactions.module.css";

const SO_TIN_NOI_BAT = 4;
const SO_MS_7_NGAY = 7 * 24 * 60 * 60 * 1000;

function laTinMoi(ngayDang: string): boolean {
  return Date.now() - new Date(ngayDang).getTime() <= SO_MS_7_NGAY;
}

export function HomeView() {
  const [tinDangs, setTinDangs] = useState<RentalPostSummary[]>([]);
  const [dangTaiTin, setDangTaiTin] = useState(true);
  const [tongQuan, setTongQuan] = useState<ThongKeTongQuan | null>(null);

  useEffect(() => {
    let daHuy = false;

    rentalPostsApi
      .list({ page: 1, pageSize: SO_TIN_NOI_BAT })
      .then((ket_qua) => {
        if (daHuy) return;
        setTinDangs(ket_qua.items);
      })
      .catch(() => {
        if (daHuy) return;
        setTinDangs([]);
      })
      .finally(() => {
        if (daHuy) return;
        setDangTaiTin(false);
      });

    return () => {
      daHuy = true;
    };
  }, []);

  useEffect(() => {
    let daHuy = false;

    thongKeApi
      .tongQuan()
      .then((ket_qua) => {
        if (!daHuy) setTongQuan(ket_qua);
      })
      .catch(() => {
        if (!daHuy) setTongQuan(null);
      });

    return () => {
      daHuy = true;
    };
  }, []);

  const hienKhoiTinDang = dangTaiTin || tinDangs.length > 0;

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

      {tongQuan ? (
        <Flex
          wrap="wrap"
          justify="center"
          gap={{ base: 24, sm: 56 }}
          px={32}
          py={32}
          bg="var(--color-surface)"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <Flex align="center" gap={12}>
            <IconBuildingSkyscraper size={28} stroke={1.5} color="var(--color-gold)" />
            <div>
              <Text fz={22} fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
                {tongQuan.tongSoTinDaDuyet}
              </Text>
              <Text fz="sm" c="var(--color-text-muted)">
                Tin đăng đang hoạt động
              </Text>
            </div>
          </Flex>
          <Flex align="center" gap={12}>
            <IconMapPin size={28} stroke={1.5} color="var(--color-gold)" />
            <div>
              <Text fz={22} fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
                {tongQuan.theoTinhThanh.length}
              </Text>
              <Text fz="sm" c="var(--color-text-muted)">
                Tỉnh/thành có tin đăng
              </Text>
            </div>
          </Flex>
          <Flex align="center" gap={12}>
            <IconCoin size={28} stroke={1.5} color="var(--color-gold)" />
            <div>
              <Text fz={22} fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
                {formatCurrencyVnd(tongQuan.giaThueTrungBinh)}
              </Text>
              <Text fz="sm" c="var(--color-text-muted)">
                Giá thuê trung bình / tháng
              </Text>
            </div>
          </Flex>
        </Flex>
      ) : null}

      {hienKhoiTinDang ? (
        <Box px={32} py={80}>
          <Flex align="flex-end" justify="space-between" mb={32} wrap="wrap" gap={16}>
            <div>
              <Text mb={8} size="sm" fw={700} tt="uppercase" style={{ letterSpacing: "0.08em" }} c="var(--color-gold)">
                Vừa cập nhật
              </Text>
              <Text
                component="h2"
                fz={30}
                fw={700}
                c="var(--color-brand)"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Tin đăng mới nhất
              </Text>
            </div>
            <Text component={Link} href={ROUTES.danhSachNhaChoThue} size="sm" fw={600} className={styles.goldLink}>
              Xem tất cả →
            </Text>
          </Flex>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={24}>
            {dangTaiTin
              ? Array.from({ length: SO_TIN_NOI_BAT }).map((_, chiSo) => (
                  <Skeleton key={chiSo} height={340} radius="var(--radius-card)" />
                ))
              : tinDangs.map((post) => (
                  <PropertyCard
                    key={post.id}
                    post={post}
                    badge={laTinMoi(post.ngayDang) ? "Mới" : undefined}
                  />
                ))}
          </SimpleGrid>
        </Box>
      ) : null}

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
