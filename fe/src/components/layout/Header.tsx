"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Group, Container, ActionIcon, Box, Text, Avatar, Menu, UnstyledButton } from "@mantine/core";
import { IconHeart, IconSearch, IconChevronDown, IconList, IconLayoutDashboard, IconLogout, IconPhoto, IconSettings } from "@tabler/icons-react";
import { AppButton } from "@/components/ui/AppButton";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/styles/interactions.module.css";

const NAV_LINKS = [
  { label: "Bất động sản", href: ROUTES.danhSachNhaChoThue },
  { label: "Thông tin thị trường", href: ROUTES.thongTinThiTruong },
  { label: "Trợ giúp", href: ROUTES.troGiup },
];

function layTenHienThi(hoTen: string): string {
  const cacTu = hoTen.trim().split(/\s+/);
  return cacTu[cacTu.length - 1] ?? hoTen;
}

function layInitials(hoTen: string): string {
  const cacTu = hoTen.trim().split(/\s+/);
  if (cacTu.length === 1) return cacTu[0]!.slice(0, 2).toUpperCase();
  return (cacTu[0]![0] + cacTu[cacTu.length - 1]![0]).toUpperCase();
}

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.home);
  };

  return (
    <Box
      component="header"
      className={styles.stickyHeader}
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <Container size="xl" px={32}>
        <Group h={80} justify="space-between">
          <Group gap={40}>
            <Text
              component={Link}
              href={ROUTES.home}
              fw={700}
              fz="xl"
              c="var(--color-brand)"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              UrbanLease
            </Text>
            <Group gap={24} visibleFrom="sm">
              {NAV_LINKS.map((link) => (
                <Text component={Link} key={link.href} href={link.href} size="sm" className={styles.mutedLink}>
                  {link.label}
                </Text>
              ))}
            </Group>
          </Group>

          <Group gap={16}>
            <ActionIcon variant="subtle" color="brand" aria-label="Tìm kiếm">
              <IconSearch size={20} />
            </ActionIcon>
            <Box component={Link} href={ROUTES.yeuThich} aria-label="Yêu thích" className={styles.mutedLink}>
              <IconHeart size={20} />
            </Box>
            <AppButton component={Link} href={ROUTES.dangTin} size="sm">
              Đăng tin
            </AppButton>

            {isAuthenticated && user ? (
              <Menu shadow="md" width={220} position="bottom-end" withArrow>
                <Menu.Target>
                  <UnstyledButton aria-label="Tài khoản">
                    <Group gap={8} wrap="nowrap">
                      <Avatar color="brand" radius="xl" size={36}>
                        {layInitials(user.fullName)}
                      </Avatar>
                      <Text size="sm" fw={600} c="var(--color-brand)" visibleFrom="sm">
                        {layTenHienThi(user.fullName)}
                      </Text>
                      <IconChevronDown size={16} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{user.fullName}</Menu.Label>
                  <Menu.Item component={Link} href={ROUTES.tinDangCuaToi} leftSection={<IconList size={16} />}>
                    Tin đăng của tôi
                  </Menu.Item>
                  <Menu.Item component={Link} href={ROUTES.thuVienAnh} leftSection={<IconPhoto size={16} />}>
                    Thư viện ảnh
                  </Menu.Item>
                  <Menu.Item component={Link} href={ROUTES.yeuThich} leftSection={<IconHeart size={16} />}>
                    Tin yêu thích
                  </Menu.Item>
                  <Menu.Item component={Link} href={ROUTES.taiKhoan} leftSection={<IconSettings size={16} />}>
                    Cài đặt tài khoản
                  </Menu.Item>
                  {user.role === ROLES.admin ? (
                    <Menu.Item
                      component={Link}
                      href={ROUTES.quanTri}
                      leftSection={<IconLayoutDashboard size={16} />}
                    >
                      Trang quản trị
                    </Menu.Item>
                  ) : null}
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                    Đăng xuất
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Text component={Link} href={ROUTES.dangNhap} size="sm" fw={600} className={styles.mutedLink}>
                Đăng nhập
              </Text>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
