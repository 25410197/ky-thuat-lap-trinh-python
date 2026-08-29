"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Text, Group, Loader, Center, Alert } from "@mantine/core";
import { IconAlertCircle, IconEye, IconArrowLeft } from "@tabler/icons-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { formatDateVi } from "@/lib/utils";
import { tinTucApi, type NewsDetail } from "../api/tin-tuc.api";
import { ApiError } from "@/lib/api/api-error";
import styles from "./NewsDetailView.module.css";

export function NewsDetailView({ slug }: { slug: string }) {
  const [bai, setBai] = useState<NewsDetail | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [khongTimThay, setKhongTimThay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    let daHuy = false;

    Promise.resolve()
      .then(() => {
        setDangTai(true);
        setLoi(null);
        setKhongTimThay(false);
        return tinTucApi.detail(slug);
      })
      .then((ket_qua) => {
        if (daHuy) return;
        setBai(ket_qua);
      })
      .catch((error: unknown) => {
        if (daHuy) return;
        if (error instanceof ApiError && error.status === 404) {
          setKhongTimThay(true);
        } else {
          setLoi("Không tải được bài viết. Vui lòng thử lại.");
        }
      })
      .finally(() => {
        if (daHuy) return;
        setDangTai(false);
      });

    return () => {
      daHuy = true;
    };
  }, [slug]);

  if (dangTai) {
    return (
      <Center py={80}>
        <Loader color="brand" />
      </Center>
    );
  }

  if (khongTimThay) {
    return (
      <EmptyState
        title="Không tìm thấy bài viết"
        description="Bài viết có thể đã bị gỡ hoặc chưa được đăng."
        action={
          <Text component={Link} href={ROUTES.thongTinThiTruong} size="sm" fw={600} c="var(--color-brand)">
            Về danh sách bài viết
          </Text>
        }
      />
    );
  }

  if (loi || !bai) {
    return (
      <Alert color="red" icon={<IconAlertCircle size={18} />} m={32}>
        {loi ?? "Đã có lỗi xảy ra."}
      </Alert>
    );
  }

  return (
    <Box px={32} py={40} maw={860} mx="auto">
      <Text
        component={Link}
        href={ROUTES.thongTinThiTruong}
        size="sm"
        fw={600}
        c="var(--color-brand-muted)"
        mb={24}
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <IconArrowLeft size={16} /> Thông tin thị trường
      </Text>

      <Text
        component="h1"
        fz={{ base: 28, sm: 36 }}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)", lineHeight: 1.25 }}
      >
        {bai.title}
      </Text>

      <Group gap={16} mt={12} mb={24} c="var(--color-text-muted)" fz="sm">
        {bai.publishedAt ? <Text fz="sm">{formatDateVi(bai.publishedAt)}</Text> : null}
        <Group gap={4}>
          <IconEye size={16} stroke={1.75} />
          <Text fz="sm">{bai.viewCount} lượt xem</Text>
        </Group>
      </Group>

      {bai.coverImageUrl ? (
        <Box
          mb={32}
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "52%",
            borderRadius: "var(--radius-card)",
            overflow: "hidden",
            background: "var(--color-surface-muted)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bai.coverImageUrl}
            alt={bai.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      ) : null}

      <div className={styles.content} dangerouslySetInnerHTML={{ __html: bai.contentHtml }} />
    </Box>
  );
}
