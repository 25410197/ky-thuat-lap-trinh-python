"use client";

import Link from "next/link";
import { Box, Group, Stack, Text } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import { formatDateVi } from "@/lib/utils";
import type { NewsListItem } from "../api/tin-tuc.api";
import styles from "@/styles/interactions.module.css";

export function NewsCard({ item }: { item: NewsListItem }) {
  return (
    <Box
      component={Link}
      href={ROUTES.chiTietTinTuc(item.slug)}
      className={styles.cardLink}
      bg="var(--color-surface)"
      style={{
        overflow: "hidden",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Box className={styles.aspectVideo} bg="var(--color-surface-muted)">
        {item.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverImageUrl}
            alt={item.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
      </Box>
      <Stack gap={8} p={16}>
        <Text
          fz="lg"
          fw={700}
          c="var(--color-brand)"
          className={styles.truncate}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {item.title}
        </Text>
        <Text fz="sm" c="var(--color-text-muted)" lineClamp={2}>
          {item.excerpt}
        </Text>
        <Group gap={6} fz="xs" c="var(--color-text-muted)" mt={4}>
          {item.publishedAt ? <Text fz="xs">{formatDateVi(item.publishedAt)}</Text> : null}
          <Group gap={4}>
            <IconEye size={14} stroke={1.75} />
            <Text fz="xs">{item.viewCount}</Text>
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
