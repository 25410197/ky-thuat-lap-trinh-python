"use client";

import { useEffect, useState } from "react";
import { Alert, Divider, Grid, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { OverviewStatsCards } from "./OverviewStatsCards";
import { PriceByPropertyTypeChart } from "./PriceByPropertyTypeChart";
import { PriceByRegionChart } from "./PriceByRegionChart";
import { ListingsByRegionChart } from "./ListingsByRegionChart";
import { PriceDistributionChart } from "./PriceDistributionChart";
import { TopRegionsList } from "./TopRegionsList";
import { MarketPerformanceTable } from "./MarketPerformanceTable";
import { PropertyTypeBreakdownTable } from "./PropertyTypeBreakdownTable";
import { RegionComparisonView } from "./RegionComparisonView";
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
        Số liệu tổng hợp từ các tin đăng đã duyệt trên hệ thống, cập nhật theo thời gian thực từ API.
      </Text>

      {loi ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb={24}>
          {loi}
        </Alert>
      ) : null}

      <OverviewStatsCards data={data} loading={dangTai} />

      <Grid mb={24} gap={24}>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <PriceByPropertyTypeChart loading={dangTai} theoLoaiBatDongSan={data?.theoLoaiBatDongSan ?? []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <PriceByRegionChart loading={dangTai} theoTinhThanh={data?.theoTinhThanh ?? []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ListingsByRegionChart loading={dangTai} theoTinhThanh={data?.theoTinhThanh ?? []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <PriceDistributionChart loading={dangTai} phanBoGia={data?.phanBoGia ?? []} />
        </Grid.Col>
        <Grid.Col span={12}>
          <TopRegionsList loading={dangTai} theoTinhThanh={data?.theoTinhThanh ?? []} />
        </Grid.Col>
      </Grid>

      <PropertyTypeBreakdownTable loading={dangTai} theoLoaiBatDongSan={data?.theoLoaiBatDongSan ?? []} />

      <MarketPerformanceTable
        loading={dangTai}
        theoTinhThanh={data?.theoTinhThanh ?? []}
        khuVucNhieuTinNhat={data?.khuVucNhieuTinNhat ?? null}
      />

      <Divider my={32} />

      <RegionComparisonView />
    </div>
  );
}
