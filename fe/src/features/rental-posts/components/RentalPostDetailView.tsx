"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Grid, Text, Group, Loader, Center, Alert, Badge, Textarea, Divider } from "@mantine/core";
import { IconAlertCircle, IconEye, IconLock, IconMapPin, IconPhone, IconRulerMeasure } from "@tabler/icons-react";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyVnd } from "@/lib/utils";
import { rentalPostsApi } from "@/features/rental-posts/api/rental-posts.api";
import { ApiError } from "@/lib/api/api-error";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { ROLES } from "@/constants/roles";
import type { RentalPostDetail } from "@/types/rental-post";
import styles from "@/styles/interactions.module.css";
import { notifications } from "@mantine/notifications";

const NHAN_PHUONG_THUC_LIEN_HE: Record<RentalPostDetail["phuongThucLienHeUuTien"], string> = {
  goi_dien: "Gọi điện",
  nhan_tin: "Nhắn tin",
};

export function RentalPostDetailView({ id }: { id: string }) {
  const { user } = useAuthContext();
  const isAdmin = user?.role === ROLES.admin;

  const [post, setPost] = useState<RentalPostDetail | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [khongTimThay, setKhongTimThay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [anhDangChon, setAnhDangChon] = useState(0);

  // Admin — khóa tin
  const [lyDoKhoa, setLyDoKhoa] = useState("");
  const [dangKhoa, setDangKhoa] = useState(false);

  useEffect(() => {
    let daHuy = false;

    Promise.resolve()
      .then(() => {
        setDangTai(true);
        setLoi(null);
        setKhongTimThay(false);
        return rentalPostsApi.detail(id);
      })
      .then((ket_qua) => {
        if (daHuy) return;
        setPost(ket_qua);
        setAnhDangChon(0);
      })
      .catch((error: unknown) => {
        if (daHuy) return;
        if (error instanceof ApiError && error.status === 404) {
          setKhongTimThay(true);
        } else {
          setLoi("Không tải được thông tin tin đăng. Vui lòng thử lại.");
        }
      })
      .finally(() => {
        if (daHuy) return;
        setDangTai(false);
      });

    return () => {
      daHuy = true;
    };
  }, [id]);

  const handleKhoaTin = async () => {
    if (!post) return;
    const lyDoTrimed = lyDoKhoa.trim();
    if (!lyDoTrimed) {
      notifications.show({
        color: "orange",
        title: "Thiếu thông tin",
        message: "Vui lòng nhập lý do khóa tin trước khi thực hiện.",
      });
      return;
    }
    setDangKhoa(true);
    try {
      await rentalPostsApi.khoaTinDang(post.id, lyDoTrimed);
      notifications.show({
        color: "green",
        title: "Thành công",
        message: "Tin đăng đã được khóa.",
      });
      setLyDoKhoa("");
      // Reload lại post để cập nhật trạng thái
      const updated = await rentalPostsApi.detail(String(post.id));
      setPost(updated);
    } catch {
      notifications.show({
        color: "red",
        title: "Lỗi",
        message: "Không thể khóa tin đăng. Vui lòng thử lại.",
      });
    } finally {
      setDangKhoa(false);
    }
  };

  if (dangTai) {
    return (
      <Center py={120}>
        <Loader color="brand" />
      </Center>
    );
  }

  if (khongTimThay) {
    return (
      <Box px={32} py={40}>
        <EmptyState
          title="Không tìm thấy tin đăng"
          description="Tin đăng có thể đã bị gỡ hoặc chưa được duyệt."
          action={
            <AppButton component={Link} href={ROUTES.danhSachNhaChoThue}>
              Về danh sách tin đăng
            </AppButton>
          }
        />
      </Box>
    );
  }

  if (loi || !post) {
    return (
      <Box px={32} py={40}>
        <Alert color="red" icon={<IconAlertCircle size={18} />}>
          {loi ?? "Đã có lỗi xảy ra."}
        </Alert>
      </Box>
    );
  }

  const diaChi = `${post.diaChiChiTiet}, ${post.phuongXa}, ${post.quanHuyen}, ${post.tinhThanh}`;
  const anhHienThi = post.hinhAnh[anhDangChon] ?? null;

  return (
    <Grid gap={32} px={32} py={40}>
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Box
          mb={12}
          className={styles.aspectVideo}
          bg="var(--color-surface-muted)"
          style={{ borderRadius: "var(--radius-card)", overflow: "hidden" }}
        >
          {anhHienThi ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anhHienThi}
              alt={post.tieuDe}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </Box>
        {post.hinhAnh.length > 1 ? (
          <Group gap={8} mb={24}>
            {post.hinhAnh.map((anh, index) => (
              <Box
                key={index}
                component="button"
                onClick={() => setAnhDangChon(index)}
                w={72}
                h={54}
                bg="var(--color-surface-muted)"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "var(--radius-btn)",
                  border: index === anhDangChon ? "2px solid var(--color-gold)" : "1px solid var(--color-border)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anh}
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            ))}
          </Group>
        ) : null}

        <Text
          component="h1"
          fz={30}
          fw={700}
          c="var(--color-brand)"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {post.tieuDe}
        </Text>
        <Group gap={4} mt={8} c="var(--color-text-muted)">
          <IconMapPin size={18} stroke={1.75} />
          {diaChi}
        </Group>
        <Group
          gap={24}
          mt={24}
          py={16}
          c="var(--color-brand-muted)"
          style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
        >
          <Group gap={8}>
            <IconRulerMeasure size={18} stroke={1.75} />
            {post.dienTich} m²
          </Group>
          <Group gap={8}>
            <IconEye size={18} stroke={1.75} />
            {post.luotXem} lượt xem
          </Group>
          <Badge variant="outline" color="brand" radius="sm">
            {post.loaiBatDongSan}
          </Badge>
        </Group>
        <Text mt={24} c="var(--color-brand-muted)" style={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
          {post.moTa}
        </Text>

        {post.tienIch.length > 0 ? (
          <Box mt={24}>
            <Text fw={700} c="var(--color-brand)" mb={12}>
              Tiện ích
            </Text>
            <Box className={styles.amenityGrid}>
              {post.tienIch.map((tien_ich) => (
                <Group key={tien_ich} gap={8} className={styles.checkboxOption}>
                  <Text fz="sm">{tien_ich}</Text>
                </Group>
              ))}
            </Box>
          </Box>
        ) : null}

        <Text mt={24} fz="xs" c="var(--color-text-muted)">
          Mã tin đăng: {post.id}
        </Text>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 4 }}>
        <Box
          p={24}
          bg="var(--color-surface)"
          style={{
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            height: "fit-content",
          }}
        >
          <Text fz={24} fw={700} c="var(--color-gold)" style={{ fontFamily: "var(--font-heading)" }}>
            {formatCurrencyVnd(post.giaThue)}
            <Text component="span" ml={4} fz="sm" fw={400} c="var(--color-text-muted)">
              /tháng
            </Text>
          </Text>

          <Box mt={24} pt={24} style={{ borderTop: "1px solid var(--color-border)" }}>
            <Text fz="sm" c="var(--color-text-muted)">
              Người liên hệ
            </Text>
            <Text fw={600} c="var(--color-brand)">
              {post.tenNguoiLienHe}
            </Text>
            <Text fz="sm" c="var(--color-text-muted)" mt={4}>
              Phương thức ưu tiên: {NHAN_PHUONG_THUC_LIEN_HE[post.phuongThucLienHeUuTien]}
            </Text>
          </Box>

          <AppButton
            component="a"
            href={`tel:${post.soDienThoaiLienHe}`}
            variant="primary"
            fullWidth
            mt={24}
            leftSection={<IconPhone size={18} />}
          >
            Gọi {post.soDienThoaiLienHe}
          </AppButton>
          {/* Chưa có API yêu thích — nối khi ticket favorites được làm */}
          <AppButton variant="outline" fullWidth mt={12}>
            Lưu vào yêu thích
          </AppButton>

          {/* Admin: Khóa tin đăng */}
          {isAdmin && (
            <>
              <Divider
                mt={24}
                mb={16}
                label={<Text fz="xs" fw={600} c="red">Quản trị viên</Text>}
                labelPosition="center"
              />
              <Text fz="sm" fw={600} c="red" mb={8}>
                Khóa tin đăng
              </Text>
              <Textarea
                placeholder="Nhập lý do khóa tin (bắt buộc)..."
                minRows={3}
                autosize
                value={lyDoKhoa}
                onChange={(e) => setLyDoKhoa(e.currentTarget.value)}
                disabled={dangKhoa || post.isBlocked}
              />
              {post.isBlocked ? (
                <Alert color="orange" mt={12} icon={<IconLock size={16} />}>
                  Tin đăng này đã bị khóa.
                </Alert>
              ) : (
                <AppButton
                  variant="primary"
                  fullWidth
                  mt={12}
                  color="red"
                  leftSection={<IconLock size={16} />}
                  loading={dangKhoa}
                  disabled={!lyDoKhoa.trim()}
                  onClick={handleKhoaTin}
                >
                  Khóa tin đăng
                </AppButton>
              )}
            </>
          )}
        </Box>
      </Grid.Col>
    </Grid>
  );
}
