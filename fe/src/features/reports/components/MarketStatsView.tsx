"use client";

import { useEffect, useState } from "react";
import { SimpleGrid, Paper, Text, Skeleton, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { MarketPerformanceTable } from "./MarketPerformanceTable";
import { PropertyTypeBreakdownTable } from "./PropertyTypeBreakdownTable";
import { thongKeApi, type ThongKeTongQuan } from "../api/thong-ke.api";

export function MarketStatsView() {
  const [data, setData] = useState<ThongKeTongQuan | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    let daHuy = false;
    setDangTai(true);
    setLoi(null);

    thongKeApi
      .tongQuan()
      .then((ket_qua) => {
        if (!daHuy) setData(ket_qua);
      })
      .catch(() => {
        if (!daHuy) setLoi("Không tải được số liệu thống kê. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!daHuy) setDangTai(false);
      });

    return () => {
      daHuy = true;
    };
  }, []);

  const STATS = data
    ? [
        { label: "Tổng số tin đăng", value: String(data.tongSoTinDang) },
        { label: "Tin đã duyệt", value: String(data.tongSoTinDaDuyet) },
      ]
    : [];

  return (
    <div>
      <Text
        component="h1"
        mb={8}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Thống kê thị trường
      </Text>
      <Text mb={24} fz="sm" c="var(--color-text-muted)">
        Số liệu tổng hợp từ các tin đăng đã duyệt trên hệ thống. Giá thuê và diện tích được tách riêng
        theo từng loại bất động sản vì các loại hình có mặt bằng giá khác xa nhau.
      </Text>

      {loi ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb={24}>
          {loi}
        </Alert>
      ) : null}

      <SimpleGrid cols={{ base: 1, sm: 2 }} mb={32}>
        {dangTai
          ? Array.from({ length: 2 }).map((_, i) => (
              <Paper key={i} radius="md" withBorder p="lg">
                <Skeleton h={12} w="60%" mb={12} />
                <Skeleton h={28} w="80%" />
              </Paper>
            ))
          : STATS.map((stat) => (
              <Paper key={stat.label} radius="md" withBorder p="lg">
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
              </Paper>
            ))}
      </SimpleGrid>

      <PropertyTypeBreakdownTable loading={dangTai} theoLoaiBatDongSan={data?.theoLoaiBatDongSan ?? []} />

      <MarketPerformanceTable
        loading={dangTai}
        theoTinhThanh={data?.theoTinhThanh ?? []}
        khuVucNhieuTinNhat={data?.khuVucNhieuTinNhat ?? null}
      />
    </div>
  );
}
