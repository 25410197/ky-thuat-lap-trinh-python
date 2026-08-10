"use client";

import { useState, useEffect } from "react";
import {
  Table,
  ActionIcon,
  Group,
  Text,
  Badge,
  Box,
  Skeleton,
  Image,
  Center,
  Drawer,
  ScrollArea,
  Loader,
  Alert,
  Stack,
  Divider,
  Button,
  Textarea,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconEye,
  IconAlertCircle,
  IconMapPin,
  IconRulerMeasure,
  IconPhone,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppModal } from "@/components/ui/AppModal";
import { AppPagination } from "@/components/ui/AppPagination";
import { AppButton } from "@/components/ui/AppButton";
import { rentalPostsApi, type TinChoDuyet } from "../api/rental-posts.api";
import type { RentalPostDetail } from "@/types/rental-post";
import { formatCurrencyVnd } from "@/lib/utils";

const PAGE_SIZE = 12;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Modal nhập lý do từ chối */
function RejectDialog({
  opened,
  tinTitle,
  onConfirm,
  onCancel,
  loading,
}: {
  opened: boolean;
  tinTitle: string;
  onConfirm: (lyDo: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [lyDo, setLyDo] = useState("");

  // Reset khi mở lại
  useEffect(() => {
    if (opened) setLyDo("");
  }, [opened]);

  return (
    <AppModal opened={opened} onClose={onCancel} title="Từ chối tin đăng" centered size="sm">
      <Text size="sm" c="dimmed" mb={16}>
        Tin đăng: <strong>&quot;{tinTitle}&quot;</strong>
      </Text>
      <Textarea
        label="Lý do từ chối"
        placeholder="Nhập lý do từ chối để thông báo cho người đăng..."
        minRows={3}
        autosize
        value={lyDo}
        onChange={(e) => setLyDo(e.currentTarget.value)}
        mb={20}
      />
      <Group justify="flex-end" gap={12}>
        <AppButton variant="ghost" onClick={onCancel} disabled={loading}>
          Huỷ
        </AppButton>
        <Button
          color="red"
          onClick={() => onConfirm(lyDo)}
          loading={loading}
        >
          Xác nhận từ chối
        </Button>
      </Group>
    </AppModal>
  );
}

/** Drawer hiển thị chi tiết một tin đăng để admin xem trước khi duyệt */
function TinDangDetailDrawer({
  tinId,
  opened,
  onClose,
  onApprove,
  onReject,
  acting,
}: {
  tinId: number | null;
  opened: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  acting: boolean;
}) {
  const [detail, setDetail] = useState<RentalPostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    if (!tinId || !opened) return;
    setDetail(null);
    setError(null);
    setSelectedImg(0);
    setLoading(true);
    rentalPostsApi
      .chiTietTinDuyet(tinId)
      .then((data) => setDetail(data))
      .catch(() => setError("Không tải được chi tiết tin đăng."))
      .finally(() => setLoading(false));
  }, [tinId, opened]);

  const currentImg = detail?.hinhAnh[selectedImg] ?? null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} fz="lg" c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
          Chi tiết tin đăng
        </Text>
      }
      position="right"
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
      overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
    >
      {loading ? (
        <Center py={80}>
          <Loader color="brand" />
        </Center>
      ) : error ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mt={16}>
          {error}
        </Alert>
      ) : detail ? (
        <Stack gap={0}>
          {/* Ảnh chính */}
          <Box
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "56.25%",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              background: "var(--color-surface-muted)",
            }}
          >
            {currentImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImg}
                alt={detail.tieuDe}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </Box>

          {/* Thumbnails */}
          {detail.hinhAnh.length > 1 && (
            <Group gap={8} mt={12}>
              {detail.hinhAnh.map((anh, idx) => (
                <Box
                  key={idx}
                  component="button"
                  onClick={() => setSelectedImg(idx)}
                  w={60}
                  h={44}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 6,
                    border:
                      idx === selectedImg
                        ? "2px solid var(--color-gold)"
                        : "1px solid var(--color-border)",
                    cursor: "pointer",
                    padding: 0,
                    background: "var(--color-surface-muted)",
                    flexShrink: 0,
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
          )}

          {/* Tiêu đề & địa chỉ */}
          <Text
            component="h2"
            fz={22}
            fw={700}
            c="var(--color-brand)"
            mt={20}
            mb={4}
            style={{ fontFamily: "var(--font-heading)", lineHeight: 1.3 }}
          >
            {detail.tieuDe}
          </Text>
          <Group gap={6} c="var(--color-text-muted)" mb={16}>
            <IconMapPin size={16} stroke={1.75} />
            <Text fz="sm">
              {detail.diaChiChiTiet}, {detail.phuongXa}, {detail.quanHuyen}, {detail.tinhThanh}
            </Text>
          </Group>

          {/* Thông tin tóm tắt */}
          <Group
            gap={20}
            py={14}
            style={{
              borderTop: "1px solid var(--color-border)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <Group gap={6} c="var(--color-brand-muted)">
              <IconRulerMeasure size={16} stroke={1.75} />
              <Text fz="sm">{detail.dienTich} m²</Text>
            </Group>
            <Group gap={6} c="var(--color-brand-muted)">
              <IconCalendar size={16} stroke={1.75} />
              <Text fz="sm">{formatDate(detail.ngayDang)}</Text>
            </Group>
            <Text fz={18} fw={700} c="var(--color-gold)" ml="auto">
              {formatCurrencyVnd(detail.giaThue)}
              <Text component="span" fz="xs" fw={400} c="var(--color-text-muted)">
                {" "}
                /tháng
              </Text>
            </Text>
          </Group>

          {/* Mô tả */}
          <Text mt={16} fz="sm" c="var(--color-brand-muted)" style={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {detail.moTa}
          </Text>

          {/* Tiện ích */}
          {detail.tienIch.length > 0 && (
            <Box mt={16}>
              <Text fw={600} fz="sm" c="var(--color-brand)" mb={8}>
                Tiện ích
              </Text>
              <Group gap={8}>
                {detail.tienIch.map((tien) => (
                  <Badge key={tien} variant="light" color="brand" radius="sm" size="sm">
                    {tien}
                  </Badge>
                ))}
              </Group>
            </Box>
          )}

          {/* Người liên hệ */}
          <Divider my={20} />
          <Group gap={8} c="var(--color-brand-muted)">
            <IconUser size={16} stroke={1.75} />
            <Text fz="sm" fw={600} c="var(--color-brand)">
              {detail.tenNguoiLienHe}
            </Text>
          </Group>
          <Group gap={8} mt={6} c="var(--color-brand-muted)">
            <IconPhone size={16} stroke={1.75} />
            <Text fz="sm">{detail.soDienThoaiLienHe}</Text>
          </Group>

          <Text fz="xs" c="var(--color-text-muted)" mt={12}>
            Mã tin đăng: #{detail.id}
          </Text>

          {/* Nút hành động */}
          <Divider my={20} />
          <Group gap={12}>
            <AppButton
              variant="primary"
              leftSection={<IconCheck size={16} />}
              onClick={onApprove}
              loading={acting}
              style={{ flex: 1 }}
            >
              Duyệt tin
            </AppButton>
            <Button
              variant="light"
              color="red"
              leftSection={<IconX size={16} />}
              onClick={onReject}
              loading={acting}
              style={{ flex: 1 }}
            >
              Từ chối
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Drawer>
  );
}

export function AdminApprovalQueueTable() {
  const [items, setItems] = useState<TinChoDuyet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [acting, setActing] = useState(false);

  // Drawer state
  const [drawerItem, setDrawerItem] = useState<TinChoDuyet | null>(null);

  // Approve confirm dialog
  const [approveTarget, setApproveTarget] = useState<TinChoDuyet | null>(null);

  // Reject dialog (with reason input)
  const [rejectTarget, setRejectTarget] = useState<TinChoDuyet | null>(null);

  useEffect(() => {
    setLoading(true);
    rentalPostsApi
      .choDuyet(page, PAGE_SIZE)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        notifications.show({
          color: "red",
          title: "Lỗi",
          message: "Không thể tải danh sách tin chờ duyệt.",
        });
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActing(true);
    try {
      await rentalPostsApi.duyetTinDang(approveTarget.id);
      setItems((prev) => prev.filter((row) => row.id !== approveTarget.id));
      setTotal((prev) => prev - 1);
      setDrawerItem(null);
      notifications.show({
        color: "green",
        title: "Đã duyệt tin đăng",
        message: `"${approveTarget.tieuDe}"`,
      });
    } catch {
      notifications.show({ color: "red", title: "Lỗi", message: "Không thể duyệt tin đăng." });
    } finally {
      setActing(false);
      setApproveTarget(null);
    }
  };

  const handleReject = async (lyDo: string) => {
    if (!rejectTarget) return;
    setActing(true);
    try {
      await rentalPostsApi.tuChoiTinDang(rejectTarget.id, lyDo || undefined);
      setItems((prev) => prev.filter((row) => row.id !== rejectTarget.id));
      setTotal((prev) => prev - 1);
      setDrawerItem(null);
      notifications.show({
        color: "red",
        title: "Đã từ chối tin đăng",
        message: `"${rejectTarget.tieuDe}"`,
      });
    } catch {
      notifications.show({ color: "red", title: "Lỗi", message: "Không thể từ chối tin đăng." });
    } finally {
      setActing(false);
      setRejectTarget(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Box
        bg="var(--color-surface)"
        style={{
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
        }}
      >
        <Box p={24} style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Hàng đợi Phê duyệt Danh sách
          </Text>
          <Text fz="sm" c="var(--color-text-muted)">
            Xem xét và quản lý các nội dung gửi từ chủ sở hữu.
          </Text>
        </Box>

        <Table verticalSpacing="md" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tài sản</Table.Th>
              <Table.Th>Chủ sở hữu</Table.Th>
              <Table.Th>Ngày gửi</Table.Th>
              <Table.Th>Loại</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th ta="right">Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Tr key={i}>
                  <Table.Td><Skeleton h={40} radius="sm" /></Table.Td>
                  <Table.Td><Skeleton h={16} w={120} radius="sm" /></Table.Td>
                  <Table.Td><Skeleton h={16} w={100} radius="sm" /></Table.Td>
                  <Table.Td><Skeleton h={22} w={80} radius="sm" /></Table.Td>
                  <Table.Td><Skeleton h={22} w={90} radius="sm" /></Table.Td>
                  <Table.Td><Skeleton h={28} w={90} radius="sm" ml="auto" /></Table.Td>
                </Table.Tr>
              ))
            ) : items.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Center py={32}>
                    <Text c="dimmed">Không có tin đăng nào đang chờ duyệt.</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Group gap={12} wrap="nowrap">
                      <Box
                        w={48}
                        h={48}
                        bg="var(--color-surface-muted)"
                        style={{ flexShrink: 0, borderRadius: 2, overflow: "hidden" }}
                      >
                        {item.hinhAnh?.[0] && (
                          <Image src={item.hinhAnh[0]} alt={item.tieuDe} w={48} h={48} fit="cover" />
                        )}
                      </Box>
                      <div>
                        <Text fw={600} c="var(--color-brand)">{item.tieuDe}</Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>{item.nguoiDang}</Table.Td>
                  <Table.Td>{formatDate(item.ngayDang)}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray" radius="sm">{item.loaiBatDongSan}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="yellow" radius="sm">Chờ phê duyệt</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={8} justify="flex-end">
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        aria-label="Duyệt tin đăng"
                        onClick={() => setApproveTarget(item)}
                      >
                        <IconCheck size={18} stroke={1.75} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Từ chối tin đăng"
                        onClick={() => setRejectTarget(item)}
                      >
                        <IconX size={18} stroke={1.75} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="brand"
                        aria-label="Xem chi tiết"
                        onClick={() => setDrawerItem(item)}
                      >
                        <IconEye size={18} stroke={1.75} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        <Group justify="space-between" p={16} style={{ borderTop: "1px solid var(--color-border)" }}>
          <Text size="sm" c="dimmed">
            {loading ? "Đang tải..." : `Hiển thị ${items.length} trong số ${total} tin chờ duyệt`}
          </Text>
          {totalPages > 1 && (
            <AppPagination total={totalPages} value={page} onChange={setPage} />
          )}
        </Group>
      </Box>

      {/* Drawer xem chi tiết */}
      <TinDangDetailDrawer
        tinId={drawerItem?.id ?? null}
        opened={drawerItem !== null}
        onClose={() => setDrawerItem(null)}
        acting={acting}
        onApprove={() => drawerItem && setApproveTarget(drawerItem)}
        onReject={() => drawerItem && setRejectTarget(drawerItem)}
      />

      {/* Confirm duyệt tin */}
      <ConfirmDialog
        opened={approveTarget !== null}
        title="Duyệt tin đăng?"
        description={`"${approveTarget?.tieuDe}"`}
        confirmLabel="Duyệt"
        loading={acting}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Modal từ chối có nhập lý do */}
      <RejectDialog
        opened={rejectTarget !== null}
        tinTitle={rejectTarget?.tieuDe ?? ""}
        loading={acting}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </>
  );
}
