"use client";

import Link from "next/link";
import { Box, Stack, Group, Text } from "@mantine/core";
import { IconBuildingSkyscraper, IconMapPin, IconRulerMeasure } from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyVnd } from "@/lib/utils";
import type { RentalPostSummary } from "@/types/rental-post";
import styles from "@/styles/interactions.module.css";

interface PropertyCardProps {
  post: Pick<
    RentalPostSummary,
    "id" | "tieuDe" | "giaThue" | "dienTich" | "loaiBatDongSan" | "phuongXa" | "quanHuyen" | "tinhThanh" | "anhDaiDien"
  >;
  badge?: string;
}

export function PropertyCard({ post, badge }: PropertyCardProps) {
  const diaChi = `${post.phuongXa}, ${post.quanHuyen}, ${post.tinhThanh}`;

  return (
    <Box
      component={Link}
      href={ROUTES.chiTietTinDang(String(post.id))}
      className={styles.cardLink}
      bg="var(--color-surface)"
      style={{
        overflow: "hidden",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Box className={styles.aspectRatio43} bg="var(--color-surface-muted)">
        {post.anhDaiDien ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.anhDaiDien}
            alt={post.tieuDe}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        {badge ? (
          <Text
            component="span"
            pos="absolute"
            top={12}
            left={12}
            px={8}
            py={4}
            fz={11}
            fw={700}
            tt="uppercase"
            c="var(--color-surface)"
            bg="var(--color-gold)"
            style={{ borderRadius: 2, letterSpacing: "0.05em" }}
          >
            {badge}
          </Text>
        ) : null}
      </Box>
      <Stack gap={12} p={16}>
        <Text fz="xl" fw={700} c="var(--color-gold)" style={{ fontFamily: "var(--font-heading)" }}>
          {formatCurrencyVnd(post.giaThue)}
          <Text component="span" ml={4} fz="sm" fw={400} c="var(--color-text-muted)">
            /tháng
          </Text>
        </Text>
        <Text
          fz="lg"
          fw={700}
          c="var(--color-brand)"
          className={styles.truncate}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {post.tieuDe}
        </Text>
        <Group gap={4} fz="sm" c="var(--color-text-muted)" wrap="nowrap">
          <IconMapPin size={16} stroke={1.75} style={{ flexShrink: 0 }} />
          <Text className={styles.truncate}>{diaChi}</Text>
        </Group>
        <Group gap={16} fz="sm" c="var(--color-text-muted)" pt={12} style={{ borderTop: "1px solid var(--color-border)" }}>
          <Group gap={4}>
            <IconBuildingSkyscraper size={16} stroke={1.75} />
            {post.loaiBatDongSan}
          </Group>
          <Group gap={4}>
            <IconRulerMeasure size={16} stroke={1.75} />
            {post.dienTich} m²
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
