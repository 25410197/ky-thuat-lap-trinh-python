"use client";

import { useEffect, useState } from "react";
import {
  Group,
  Box,
  Text,
  SimpleGrid,
  NumberInput,
  Loader,
  Center,
  Alert,
  Stack,
  SegmentedControl,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons-react";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppPagination } from "@/components/ui/AppPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { rentalPostsApi } from "@/features/rental-posts/api/rental-posts.api";
import { danhMucApi } from "@/features/rental-posts/api/danh-muc.api";
import type { RentalPostSummary } from "@/types/rental-post";
import type { LoaiBatDongSan, PhuongXaMoi, QuanHuyen, TinhThanh } from "@/types/danh-muc";
import { PropertyCard } from "./PropertyCard";
import styles from "@/styles/interactions.module.css";

const SO_TIN_MOI_TRANG = 12;

type CheDoDiaGioi = "cu" | "moi";

export function RentalPostListView() {
  const [tuKhoaNhap, setTuKhoaNhap] = useState("");
  const [tuKhoa] = useDebouncedValue(tuKhoaNhap, 400);

  const [loaiBatDongSanId, setLoaiBatDongSanId] = useState<string | null>(null);
  const [tinhThanhId, setTinhThanhId] = useState<string | null>(null);

  // Mode địa giới: "cu" = trước sáp nhập (lọc theo Quận/Huyện), "moi" = sau sáp nhập
  // 07/2025 (không còn quận/huyện, lọc thẳng theo Xã/Phường mới).
  const [cheDoDiaGioi, setCheDoDiaGioi] = useState<CheDoDiaGioi>("cu");
  const [quanHuyenId, setQuanHuyenId] = useState<string | null>(null);
  const [phuongXaMoiId, setPhuongXaMoiId] = useState<string | null>(null);

  const [giaTu, setGiaTu] = useState<number | "">("");
  const [giaDen, setGiaDen] = useState<number | "">("");
  const [dienTichTu, setDienTichTu] = useState<number | "">("");
  const [dienTichDen, setDienTichDen] = useState<number | "">("");
  const [page, setPage] = useState(1);

  const [danhSachLoai, setDanhSachLoai] = useState<LoaiBatDongSan[]>([]);
  const [danhSachTinh, setDanhSachTinh] = useState<TinhThanh[]>([]);
  const [danhSachQuan, setDanhSachQuan] = useState<QuanHuyen[]>([]);
  const [danhSachXaMoi, setDanhSachXaMoi] = useState<PhuongXaMoi[]>([]);

  const [items, setItems] = useState<RentalPostSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    danhMucApi
      .loaiBatDongSan()
      .then(setDanhSachLoai)
      .catch(() => setDanhSachLoai([]));
    danhMucApi
      .tinhThanh()
      .then(setDanhSachTinh)
      .catch(() => setDanhSachTinh([]));
  }, []);

  useEffect(() => {
    if (!tinhThanhId) {
      setDanhSachQuan([]);
      setDanhSachXaMoi([]);
      return;
    }
    if (cheDoDiaGioi === "cu") {
      danhMucApi
        .quanHuyen(Number(tinhThanhId))
        .then(setDanhSachQuan)
        .catch(() => setDanhSachQuan([]));
    } else {
      danhMucApi
        .xaPhuongMoi(Number(tinhThanhId))
        .then(setDanhSachXaMoi)
        .catch(() => setDanhSachXaMoi([]));
    }
  }, [tinhThanhId, cheDoDiaGioi]);

  function doiCheDoDiaGioi(cheDo: CheDoDiaGioi) {
    setCheDoDiaGioi(cheDo);
    setQuanHuyenId(null);
    setPhuongXaMoiId(null);
  }

  // Reset về trang 1 mỗi khi bộ lọc thay đổi — điều chỉnh trong lúc render theo
  // hướng dẫn của React thay vì dùng effect riêng (tránh cascading render).
  const boLocKey = JSON.stringify([
    tuKhoa,
    loaiBatDongSanId,
    tinhThanhId,
    cheDoDiaGioi,
    quanHuyenId,
    phuongXaMoiId,
    giaTu,
    giaDen,
    dienTichTu,
    dienTichDen,
  ]);
  const [boLocKeyDaXuLy, setBoLocKeyDaXuLy] = useState(boLocKey);
  if (boLocKey !== boLocKeyDaXuLy) {
    setBoLocKeyDaXuLy(boLocKey);
    setPage(1);
  }

  useEffect(() => {
    let daHuy = false;

    Promise.resolve()
      .then(() => {
        setDangTai(true);
        setLoi(null);
        return rentalPostsApi.list({
          page,
          pageSize: SO_TIN_MOI_TRANG,
          q: tuKhoa || undefined,
          loaiBatDongSanId: loaiBatDongSanId ? Number(loaiBatDongSanId) : undefined,
          tinhThanhId: tinhThanhId ? Number(tinhThanhId) : undefined,
          quanHuyenId: cheDoDiaGioi === "cu" && quanHuyenId ? Number(quanHuyenId) : undefined,
          phuongXaMoiId: cheDoDiaGioi === "moi" && phuongXaMoiId ? Number(phuongXaMoiId) : undefined,
          giaTu: giaTu === "" ? undefined : giaTu,
          giaDen: giaDen === "" ? undefined : giaDen,
          dienTichTu: dienTichTu === "" ? undefined : dienTichTu,
          dienTichDen: dienTichDen === "" ? undefined : dienTichDen,
        });
      })
      .then((ket_qua) => {
        if (daHuy) return;
        setItems(ket_qua.items);
        setTotal(ket_qua.total);
      })
      .catch(() => {
        if (daHuy) return;
        setLoi("Không tải được danh sách tin đăng. Vui lòng thử lại.");
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (daHuy) return;
        setDangTai(false);
      });

    return () => {
      daHuy = true;
    };
  }, [
    page,
    tuKhoa,
    loaiBatDongSanId,
    tinhThanhId,
    cheDoDiaGioi,
    quanHuyenId,
    phuongXaMoiId,
    giaTu,
    giaDen,
    dienTichTu,
    dienTichDen,
  ]);

  const tongSoTrang = Math.max(1, Math.ceil(total / SO_TIN_MOI_TRANG));

  return (
    <Box px={32} py={40}>
      <Text
        component="h1"
        mb={24}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Danh sách nhà cho thuê
      </Text>

      <Box
        className={styles.stickyFilterBar}
        mx={-32}
        px={32}
        py={16}
        mb={24}
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <Group gap={12} align="flex-end">
          <AppInput
            style={{ flex: "1 1 240px", minWidth: 180, maxWidth: 320 }}
            label="Tìm kiếm"
            placeholder="Nhập tên tin đăng hoặc địa chỉ..."
            value={tuKhoaNhap}
            onChange={(event) => setTuKhoaNhap(event.currentTarget.value)}
          />
          <AppSelect
            style={{ flex: "1 1 140px", maxWidth: 180 }}
            label="Loại hình"
            placeholder="Tất cả"
            data={danhSachLoai.map((loai) => ({ value: String(loai.id), label: loai.ten }))}
            value={loaiBatDongSanId}
            onChange={setLoaiBatDongSanId}
            clearable
          />
          <AppSelect
            style={{ flex: "1 1 140px", maxWidth: 180 }}
            label="Tỉnh/Thành"
            placeholder="Tất cả"
            data={danhSachTinh.map((tinh) => ({ value: String(tinh.id), label: tinh.ten }))}
            value={tinhThanhId}
            onChange={(value) => {
              setTinhThanhId(value);
              setQuanHuyenId(null);
              setPhuongXaMoiId(null);
            }}
            clearable
          />
          {cheDoDiaGioi === "cu" ? (
            <AppSelect
              style={{ flex: "1 1 140px", maxWidth: 180 }}
              label="Quận/Huyện"
              placeholder={tinhThanhId ? "Tất cả" : "Chọn tỉnh trước"}
              data={danhSachQuan.map((quan) => ({ value: String(quan.id), label: quan.ten }))}
              value={quanHuyenId}
              onChange={setQuanHuyenId}
              disabled={!tinhThanhId}
              searchable
              nothingFoundMessage="Không tìm thấy"
              clearable
            />
          ) : (
            <AppSelect
              style={{ flex: "1 1 140px", maxWidth: 180 }}
              label="Xã/Phường (mới)"
              placeholder={tinhThanhId ? "Tất cả" : "Chọn tỉnh trước"}
              data={danhSachXaMoi.map((xa) => ({ value: String(xa.id), label: xa.ten }))}
              value={phuongXaMoiId}
              onChange={setPhuongXaMoiId}
              disabled={!tinhThanhId}
              searchable
              nothingFoundMessage="Không tìm thấy"
              clearable
            />
          )}
          <Stack gap={4}>
            <Text fz="sm" fw={500}>
              Địa giới
            </Text>
            <SegmentedControl
              size="sm"
              value={cheDoDiaGioi}
              onChange={(value) => doiCheDoDiaGioi(value as CheDoDiaGioi)}
              data={[
                { label: "Trước sáp nhập", value: "cu" },
                { label: "Sau sáp nhập", value: "moi" },
              ]}
            />
          </Stack>
        </Group>
      </Box>

      <Stack gap={12} mb={32}>
        <Group gap={12} align="flex-end">
          <NumberInput
            style={{ flex: 1 }}
            label="Giá từ (VNĐ)"
            placeholder="0"
            value={giaTu}
            onChange={(value) => setGiaTu(value === "" ? "" : Number(value))}
            min={0}
            thousandSeparator=","
          />
          <NumberInput
            style={{ flex: 1 }}
            label="Giá đến (VNĐ)"
            placeholder="Không giới hạn"
            value={giaDen}
            onChange={(value) => setGiaDen(value === "" ? "" : Number(value))}
            min={0}
            thousandSeparator=","
          />
          <NumberInput
            style={{ flex: 1 }}
            label="Diện tích từ (m²)"
            placeholder="0"
            value={dienTichTu}
            onChange={(value) => setDienTichTu(value === "" ? "" : Number(value))}
            min={0}
          />
          <NumberInput
            style={{ flex: 1 }}
            label="Diện tích đến (m²)"
            placeholder="Không giới hạn"
            value={dienTichDen}
            onChange={(value) => setDienTichDen(value === "" ? "" : Number(value))}
            min={0}
          />
        </Group>
      </Stack>

      {loi ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb={24}>
          {loi}
        </Alert>
      ) : null}

      {dangTai ? (
        <Center py={80}>
          <Loader color="brand" />
        </Center>
      ) : items.length === 0 ? (
        <EmptyState title="Không tìm thấy tin đăng" description="Thử điều chỉnh bộ lọc tìm kiếm." />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 5 }} spacing={24}>
            {items.map((post) => (
              <PropertyCard key={post.id} post={post} />
            ))}
          </SimpleGrid>
          <Group justify="center" mt={40}>
            <AppPagination total={tongSoTrang} value={page} onChange={setPage} />
          </Group>
        </>
      )}
    </Box>
  );
}
