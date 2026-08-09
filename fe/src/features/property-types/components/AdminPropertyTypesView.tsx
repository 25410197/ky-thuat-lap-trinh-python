"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Center, Group, Skeleton, Table, Text, Tooltip } from "@mantine/core";
import { ActionIcon } from "@mantine/core";
import { IconEdit, IconEyeOff, IconEye, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppPagination } from "@/components/ui/AppPagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { danhMucApi } from "@/features/rental-posts/api/danh-muc.api";
import {
  PROPERTY_TYPE_STATUS_COLOR,
  PROPERTY_TYPE_STATUS_LABEL_VI,
} from "@/constants/property-type-status";
import type { LoaiBatDongSanQuanTri } from "@/types/danh-muc";
import { PropertyTypeFormModal } from "./PropertyTypeFormModal";

const PAGE_SIZE = 10;

export function AdminPropertyTypesView() {
  const [items, setItems] = useState<LoaiBatDongSanQuanTri[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  const [formOpened, setFormOpened] = useState(false);
  const [editing, setEditing] = useState<LoaiBatDongSanQuanTri | null>(null);
  const [togglingItem, setTogglingItem] = useState<LoaiBatDongSanQuanTri | null>(null);
  const [togglingLoading, setTogglingLoading] = useState(false);

  const load = () => {
    setLoading(true);
    danhMucApi
      .loaiBatDongSanQuanTri(page, PAGE_SIZE, q || undefined)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Không thể tải danh sách loại bất động sản." });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleSaved = () => {
    load();
  };

  const handleConfirmToggle = () => {
    if (!togglingItem) return;
    setTogglingLoading(true);
    danhMucApi
      .doiTrangThaiLoaiBatDongSan(togglingItem.id)
      .then((updated) => {
        notifications.show({
          color: "green",
          message: updated.status === "hidden" ? "Đã ẩn loại bất động sản." : "Đã kích hoạt lại loại bất động sản.",
        });
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Có lỗi xảy ra, vui lòng thử lại." });
      })
      .finally(() => {
        setTogglingLoading(false);
        setTogglingItem(null);
      });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box
      bg="var(--color-surface)"
      style={{
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
    >
      <Group justify="space-between" p={24} style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Box>
          <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Quản lý loại bất động sản
          </Text>
          <Text fz="sm" c="var(--color-text-muted)">
            Thêm, sửa, ẩn/kích hoạt các loại hình nhà cho thuê trong hệ thống.
          </Text>
        </Box>
        <AppButton leftSection={<IconPlus size={18} />} onClick={() => { setEditing(null); setFormOpened(true); }}>
          Thêm loại mới
        </AppButton>
      </Group>

      <Box p={24} pb={0}>
        <form onSubmit={handleSearchSubmit}>
          <AppInput
            placeholder="Tìm theo tên loại..."
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            maw={320}
          />
        </form>
      </Box>

      <Table verticalSpacing="md" highlightOnHover mt={16}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên loại</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Đang được sử dụng</Table.Th>
            <Table.Th ta="right">Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Table.Tr key={i}>
                <Table.Td><Skeleton h={16} w={140} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={22} w={90} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={60} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={28} w={80} radius="sm" ml="auto" /></Table.Td>
              </Table.Tr>
            ))
          ) : items.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Center py={32}>
                  <Text c="dimmed">Chưa có loại bất động sản nào.</Text>
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text fw={600} c="var(--color-brand)">{item.ten}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={PROPERTY_TYPE_STATUS_COLOR[item.status]} radius="sm">
                    {PROPERTY_TYPE_STATUS_LABEL_VI[item.status]}
                  </Badge>
                </Table.Td>
                <Table.Td>{item.inUse ? "Có" : "Không"}</Table.Td>
                <Table.Td>
                  <Group gap={8} justify="flex-end">
                    <Tooltip label="Sửa tên">
                      <ActionIcon
                        variant="subtle"
                        color="brand"
                        aria-label="Sửa loại bất động sản"
                        onClick={() => { setEditing(item); setFormOpened(true); }}
                      >
                        <IconEdit size={18} stroke={1.75} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={item.status === "active" ? "Ẩn loại này" : "Kích hoạt lại"}>
                      <ActionIcon
                        variant="subtle"
                        color={item.status === "active" ? "red" : "green"}
                        aria-label={item.status === "active" ? "Ẩn loại bất động sản" : "Kích hoạt lại loại bất động sản"}
                        onClick={() => setTogglingItem(item)}
                      >
                        {item.status === "active" ? (
                          <IconEyeOff size={18} stroke={1.75} />
                        ) : (
                          <IconEye size={18} stroke={1.75} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <Group justify="space-between" p={16} style={{ borderTop: "1px solid var(--color-border)" }}>
        <Text size="sm" c="dimmed">
          {loading ? "Đang tải..." : `Hiển thị ${items.length} trong số ${total} loại`}
        </Text>
        {totalPages > 1 && <AppPagination total={totalPages} value={page} onChange={setPage} />}
      </Group>

      <PropertyTypeFormModal
        opened={formOpened}
        editing={editing}
        onClose={() => setFormOpened(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        opened={togglingItem !== null}
        title={togglingItem?.status === "active" ? "Ẩn loại bất động sản?" : "Kích hoạt lại loại bất động sản?"}
        description={
          togglingItem?.status === "active"
            ? `"${togglingItem?.ten}" sẽ không còn xuất hiện trong form tạo tin mới. Tin đăng cũ vẫn hiển thị bình thường.`
            : `"${togglingItem?.ten}" sẽ xuất hiện trở lại trong form tạo tin mới.`
        }
        confirmLabel={togglingItem?.status === "active" ? "Ẩn" : "Kích hoạt"}
        danger={togglingItem?.status === "active"}
        loading={togglingLoading}
        onConfirm={handleConfirmToggle}
        onCancel={() => setTogglingItem(null)}
      />
    </Box>
  );
}
