"use client";

import { useEffect, useState } from "react";
import { Alert, Grid, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppMultiSelect } from "@/components/ui/AppMultiSelect";
import { danhMucApi } from "@/features/rental-posts/api/danh-muc.api";
import type { LoaiBatDongSan, QuanHuyen, TinhThanh } from "@/types/danh-muc";
import { thongKeApi, type SoSanhKhuVucItem } from "../api/thong-ke.api";
import { ChartCard } from "./ChartCard";
import { RegionAvgMedianChart } from "./RegionAvgMedianChart";
import { RegionPricePerM2Chart } from "./RegionPricePerM2Chart";
import { RegionComparisonTable } from "./RegionComparisonTable";

const SO_KHU_VUC_TOI_THIEU = 2;

export function RegionComparisonView() {
  const [danhSachTinh, setDanhSachTinh] = useState<TinhThanh[]>([]);
  const [danhSachLoai, setDanhSachLoai] = useState<LoaiBatDongSan[]>([]);
  const [danhSachQuan, setDanhSachQuan] = useState<QuanHuyen[]>([]);

  const [tinhThanhId, setTinhThanhId] = useState<string | null>(null);
  const [quanHuyenIds, setQuanHuyenIds] = useState<string[]>([]);
  const [loaiBatDongSanId, setLoaiBatDongSanId] = useState<string | null>(null);

  const [data, setData] = useState<SoSanhKhuVucItem[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    danhMucApi
      .tinhThanh()
      .then(setDanhSachTinh)
      .catch(() => setDanhSachTinh([]));
    danhMucApi
      .loaiBatDongSan()
      .then(setDanhSachLoai)
      .catch(() => setDanhSachLoai([]));
  }, []);

  useEffect(() => {
    if (!tinhThanhId) {
      setDanhSachQuan([]);
      return;
    }
    danhMucApi
      .quanHuyen(Number(tinhThanhId))
      .then(setDanhSachQuan)
      .catch(() => setDanhSachQuan([]));
  }, [tinhThanhId]);

  function doiTinhThanh(value: string | null) {
    setTinhThanhId(value);
    setQuanHuyenIds([]);
  }

  useEffect(() => {
    if (quanHuyenIds.length < SO_KHU_VUC_TOI_THIEU) {
      setData([]);
      setLoi(null);
      return;
    }

    let daHuy = false;
    setDangTai(true);
    setLoi(null);

    thongKeApi
      .soSanhKhuVuc(
        quanHuyenIds.map(Number),
        loaiBatDongSanId ? Number(loaiBatDongSanId) : undefined
      )
      .then((ket_qua) => {
        if (!daHuy) setData(ket_qua.ketQua);
      })
      .catch(() => {
        if (!daHuy) setLoi("Không tải được số liệu so sánh. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!daHuy) setDangTai(false);
      });

    return () => {
      daHuy = true;
    };
  }, [quanHuyenIds, loaiBatDongSanId]);

  const chuaDuKhuVuc = quanHuyenIds.length < SO_KHU_VUC_TOI_THIEU;

  return (
    <div>
      <Text fz="xl" fw={700} mb={4} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
        So sánh giá thuê theo khu vực
      </Text>
      <Text mb={20} fz="sm" c="var(--color-text-muted)">
        Chọn 1 tỉnh/thành rồi chọn ít nhất {SO_KHU_VUC_TOI_THIEU} quận/huyện để so sánh giá thuê. Có thể
        lọc thêm theo loại bất động sản.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb={24}>
        <AppSelect
          label="Tỉnh/thành"
          placeholder="Chọn tỉnh/thành"
          data={danhSachTinh.map((t) => ({ value: String(t.id), label: t.ten }))}
          value={tinhThanhId}
          onChange={doiTinhThanh}
          clearable
          searchable
        />
        <AppMultiSelect
          label="Quận/huyện (chọn ≥ 2)"
          placeholder={tinhThanhId ? "Chọn quận/huyện" : "Chọn tỉnh/thành trước"}
          data={danhSachQuan.map((q) => ({ value: String(q.id), label: q.ten }))}
          value={quanHuyenIds}
          onChange={setQuanHuyenIds}
          disabled={!tinhThanhId}
          searchable
          hidePickedOptions
        />
        <AppSelect
          label="Loại bất động sản"
          placeholder="Tất cả loại"
          data={danhSachLoai.map((l) => ({ value: String(l.id), label: l.ten }))}
          value={loaiBatDongSanId}
          onChange={setLoaiBatDongSanId}
          clearable
        />
      </SimpleGrid>

      {loi ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb={24}>
          {loi}
        </Alert>
      ) : null}

      {chuaDuKhuVuc ? (
        <Alert color="blue" variant="light" mb={24}>
          Chọn thêm khu vực — cần ít nhất {SO_KHU_VUC_TOI_THIEU} quận/huyện để bắt đầu so sánh.
        </Alert>
      ) : (
        <Stack gap={24}>
          <Grid gap={24}>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <ChartCard title="Giá thuê trung bình & trung vị" subtitle="Đơn vị: VNĐ/tháng">
                <RegionAvgMedianChart loading={dangTai} data={data} />
              </ChartCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <ChartCard title="Giá thuê trung bình / m²" subtitle="Đơn vị: VNĐ/m²/tháng">
                <RegionPricePerM2Chart loading={dangTai} data={data} />
              </ChartCard>
            </Grid.Col>
          </Grid>

          <ChartCard title="Chi tiết theo khu vực">
            <RegionComparisonTable loading={dangTai} data={data} />
          </ChartCard>
        </Stack>
      )}
    </div>
  );
}
