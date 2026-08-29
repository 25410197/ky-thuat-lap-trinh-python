"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimpleGrid, Paper, Text, Group, Box, Grid, Stack, Skeleton } from "@mantine/core";
import { IconUsers, IconClipboardList, IconFlag, IconMapPin, IconCoin } from "@tabler/icons-react";
import { ErrorState } from "@/components/common/ErrorState";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyVnd } from "@/lib/utils";
import { fetchAdminOverviewStats, type AdminOverviewStats } from "../api/analytics.api";

interface StatCardDef {
  label: string;
  value: string;
  note: string;
  icon: typeof IconUsers;
  href: string;
}

function buildStats(data: AdminOverviewStats): StatCardDef[] {
  return [
    {
      label: "Tổng người dùng",
      value: data.tongNguoiDung.toLocaleString("vi-VN"),
      note: "Xem danh sách người dùng",
      icon: IconUsers,
      href: ROUTES.quanTriNguoiDung,
    },
    {
      label: "Danh sách chờ duyệt",
      value: data.choDuyet.toLocaleString("vi-VN"),
      note: "Xem hàng đợi phê duyệt",
      icon: IconClipboardList,
      href: ROUTES.quanTriTinDang,
    },
    {
      label: "Báo cáo đang xử lý",
      value: data.baoCaoChoXuLy.toLocaleString("vi-VN"),
      note: "Xem báo cáo vi phạm",
      icon: IconFlag,
      href: ROUTES.quanTriBaoCao,
    },
  ];
}

export function AdminOverviewView() {
  const [data, setData] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetchAdminOverviewStats()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = data ? buildStats(data) : [];

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
        Tổng quan
      </Text>

      {error ? (
        <ErrorState
          title="Không tải được số liệu tổng quan"
          description="Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại."
          onRetry={load}
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Paper key={i} radius="md" withBorder p="lg">
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={8} style={{ flex: 1 }}>
                        <Skeleton h={12} w="60%" />
                        <Skeleton h={28} w="40%" />
                      </Stack>
                      <Skeleton h={22} w={22} radius="sm" />
                    </Group>
                    <Skeleton h={14} w="70%" mt={12} />
                  </Paper>
                ))
              : stats.map((stat) => (
                  <Paper
                    key={stat.label}
                    component={Link}
                    href={stat.href}
                    radius="md"
                    withBorder
                    p="lg"
                    style={{ textDecoration: "none", cursor: "pointer" }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                          {stat.label}
                        </Text>
                        <Text
                          mt={4}
                          fw={700}
                          fz={28}
                          c="var(--color-brand)"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {stat.value}
                        </Text>
                      </div>
                      <stat.icon size={22} color="var(--color-brand-muted)" stroke={1.5} />
                    </Group>
                    <Text mt={12} size="sm" c="var(--color-gold)">
                      {stat.note}
                    </Text>
                  </Paper>
                ))}
          </SimpleGrid>

          <Grid mt={32} gap={24}>
            <Grid.Col span={12}>
              <Box
                p={24}
                bg="var(--color-surface-muted)"
                style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--color-border)" }}
              >
                <Text
                  mb={16}
                  fz="xs"
                  fw={700}
                  tt="uppercase"
                  c="var(--color-brand-muted)"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Thống kê nhanh
                </Text>
                {loading ? (
                  <Group gap={40}>
                    <Skeleton h={40} w={160} />
                    <Skeleton h={40} w={160} />
                  </Group>
                ) : data ? (
                  <Group gap={40} wrap="wrap">
                    <Group gap={10} align="flex-start" wrap="nowrap">
                      <IconCoin size={20} color="var(--color-gold)" stroke={1.75} style={{ marginTop: 2 }} />
                      <div>
                        <Text fz="xs" c="dimmed">
                          Giá thuê trung bình toàn hệ thống
                        </Text>
                        <Text fz="lg" fw={700} c="var(--color-brand)">
                          {formatCurrencyVnd(data.tongQuan.giaThueTrungBinh)}
                          <Text component="span" fz="xs" fw={400} c="dimmed">
                            {" "}
                            /tháng
                          </Text>
                        </Text>
                      </div>
                    </Group>
                    {data.tongQuan.khuVucNhieuTinNhat ? (
                      <Group gap={10} align="flex-start" wrap="nowrap">
                        <IconMapPin
                          size={20}
                          color="var(--color-gold)"
                          stroke={1.75}
                          style={{ marginTop: 2 }}
                        />
                        <div>
                          <Text fz="xs" c="dimmed">
                            Khu vực nhiều tin đăng nhất
                          </Text>
                          <Text fz="lg" fw={700} c="var(--color-brand)">
                            {data.tongQuan.khuVucNhieuTinNhat.tinhThanh}
                            <Text component="span" fz="xs" fw={400} c="dimmed">
                              {" "}
                              ({data.tongQuan.khuVucNhieuTinNhat.soLuong} tin)
                            </Text>
                          </Text>
                        </div>
                      </Group>
                    ) : null}
                    <Group gap={10} align="flex-start" wrap="nowrap">
                      <IconClipboardList
                        size={20}
                        color="var(--color-gold)"
                        stroke={1.75}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <Text fz="xs" c="dimmed">
                          Tin đăng đang hoạt động
                        </Text>
                        <Text fz="lg" fw={700} c="var(--color-brand)">
                          {data.tongQuan.tongSoTinDaDuyet.toLocaleString("vi-VN")}
                          <Text component="span" fz="xs" fw={400} c="dimmed">
                            {" "}
                            / {data.tongQuan.tongSoTinDang.toLocaleString("vi-VN")} tổng số tin
                          </Text>
                        </Text>
                      </div>
                    </Group>
                  </Group>
                ) : null}
              </Box>
            </Grid.Col>
          </Grid>
        </>
      )}
    </div>
  );
}
