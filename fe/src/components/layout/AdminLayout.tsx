"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, Flex, Stack, Text } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconList,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconBuildingCommunity,
  IconFlag,
  IconNews,
} from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/styles/interactions.module.css";

const NAV_ITEMS = [
  { label: "Tổng quan", href: ROUTES.quanTri, icon: IconLayoutDashboard },
  { label: "Quản lý tin đăng", href: ROUTES.quanTriTinDang, icon: IconList },
  { label: "Quản lý người dùng", href: ROUTES.quanTriNguoiDung, icon: IconUsers },
  { label: "Loại bất động sản", href: ROUTES.quanTriLoaiBatDongSan, icon: IconBuildingCommunity },
  { label: "Báo cáo vi phạm", href: ROUTES.quanTriBaoCao, icon: IconFlag },
  { label: "Tin tức thị trường", href: ROUTES.quanTriTinTuc, icon: IconNews },
  { label: "Thống kê thị trường", href: ROUTES.quanTriThongKe, icon: IconChartBar },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.dangNhap);
  };

  return (
    <Flex mih="100vh">
      <Box
        component="aside"
        w={256}
        style={{ flexShrink: 0, borderRight: "1px solid var(--color-border)" }}
        bg="var(--color-surface-muted)"
        px={16}
        py={32}
      >
        <Flex direction="column" justify="space-between" h="100%">
          <div>
            <Box mb={32} px={8}>
              <Text fw={700} fz="xl" c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
                Quản lý
              </Text>
              <Text size="sm" fw={600} c="var(--color-brand-muted)">
                Bảng điều khiển quản trị
              </Text>
            </Box>
            <Stack gap={4} component="nav">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === ROUTES.quanTri
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Flex
                    key={item.href}
                    component={Link}
                    href={item.href}
                    align="center"
                    gap={12}
                    className={isActive ? styles.adminNavLinkActive : styles.adminNavLink}
                  >
                    <Icon size={20} stroke={1.75} />
                    {item.label}
                  </Flex>
                );
              })}
            </Stack>
          </div>

          <Stack gap={4} component="nav" pt={16} style={{ borderTop: "1px solid var(--color-border)" }}>
            <Flex component={Link} href={ROUTES.taiKhoan} align="center" gap={12} className={styles.adminNavLink}>
              <IconSettings size={20} stroke={1.75} />
              Cài đặt
            </Flex>
            <Flex
              component="button"
              type="button"
              onClick={handleLogout}
              align="center"
              gap={12}
              w="100%"
              className={styles.adminNavLink}
              style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <IconLogout size={20} stroke={1.75} />
              Đăng xuất
            </Flex>
          </Stack>
        </Flex>
      </Box>

      <Box component="main" flex={1} px={32} py={32}>
        {children}
      </Box>
    </Flex>
  );
}
