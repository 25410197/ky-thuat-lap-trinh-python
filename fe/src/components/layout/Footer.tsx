"use client";

import Link from "next/link";
import { Container, Group, Stack, Box, Text, Flex } from "@mantine/core";
import styles from "@/styles/interactions.module.css";

const FOOTER_LINKS = [
  { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
  { label: "Điều khoản dịch vụ", href: "/dieu-khoan-dich-vu" },
  { label: "Liên hệ với chúng tôi", href: "/lien-he" },
];

export function Footer() {
  return (
    <Box
      component="footer"
      bg="var(--color-brand)"
      style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
    >
      <Container size="xl" py={48} px={32}>
        <Flex direction={{ base: "column", sm: "row" }} align={{ sm: "center" }} justify="space-between" gap={32}>
          <Stack gap={8}>
            <Text
              fw={700}
              fz="xl"
              c="var(--color-surface)"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              UrbanLease
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.7)">
              Nền tảng thuê bất động sản chuyên nghiệp
            </Text>
          </Stack>
          <Group gap={24}>
            {FOOTER_LINKS.map((link) => (
              <Text
                component={Link}
                key={link.href}
                href={link.href}
                size="sm"
                c="rgba(255,255,255,0.8)"
                className={styles.footerLink}
              >
                {link.label}
              </Text>
            ))}
          </Group>
        </Flex>
        <Text
          mt={32}
          pt={24}
          size="sm"
          c="rgba(255,255,255,0.6)"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          © {new Date().getFullYear()} UrbanLease. Đã đăng ký bản quyền.
        </Text>
      </Container>
    </Box>
  );
}
