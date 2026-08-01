"use client";

import Link from "next/link";
import { Group, Container, ActionIcon, Box, Text } from "@mantine/core";
import { IconHeart, IconSearch } from "@tabler/icons-react";
import { AppButton } from "@/components/ui/AppButton";
import { ROUTES } from "@/constants/routes";
import styles from "@/styles/interactions.module.css";

const NAV_LINKS = [
  { label: "Bất động sản", href: ROUTES.danhSachNhaChoThue },
  { label: "Thông tin thị trường", href: "/thong-tin-thi-truong" },
  { label: "Trợ giúp", href: "/tro-giup" },
];

export function Header() {
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
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
