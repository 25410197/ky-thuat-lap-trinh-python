"use client";

import { useState, useEffect } from "react";
import { Table, ActionIcon, Group, Text, Badge, Box, Skeleton, Image, Center } from "@mantine/core";
import { IconCheck, IconX, IconEye } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppPagination } from "@/components/ui/AppPagination";
import { rentalPostsApi, type TinChoDuyet } from "../api/rental-posts.api";

const PAGE_SIZE = 12;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AdminApprovalQueueTable() {
  const [items, setItems] = useState<TinChoDuyet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingAction, setPendingAction] = useState<{
    item: TinChoDuyet;
    type: "approve" | "reject";
  } | null>(null);

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

  const resolveAction = () => {
    if (!pendingAction) return;
    const { item, type } = pendingAction;
    // TODO: gọi API approve/reject thực sự khi có endpoint
    setItems((prev) => prev.filter((row) => row !== item));
    notifications.show({
      color: type === "approve" ? "green" : "red",
      title: type === "approve" ? "Đã duyệt tin đăng" : "Đã từ chối tin đăng",
      message: `"${item.tieuDe}"`,
    });
    setPendingAction(null);
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
            items.map((item, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <Group gap={12} wrap="nowrap">
                    <Box
                      w={48}
                      h={48}
                      bg="var(--color-surface-muted)"
                      style={{ flexShrink: 0, borderRadius: 2, overflow: "hidden" }}
                    >
                      {item.hinhAnh?.[0] && (
                        <Image
                          src={item.hinhAnh[0]}
                          alt={item.tieuDe}
                          w={48}
                          h={48}
                          fit="cover"
                        />
                      )}
                    </Box>
                    <div>
                      <Text fw={600} c="var(--color-brand)">
                        {item.tieuDe}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>{item.nguoiDang}</Table.Td>
                <Table.Td>{formatDate(item.ngayDang)}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray" radius="sm">
                    {item.loaiBatDongSan}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="yellow" radius="sm">
                    Chờ phê duyệt
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={8} justify="flex-end">
                    <ActionIcon
                      variant="subtle"
                      color="green"
                      aria-label="Duyệt tin đăng"
                      onClick={() => setPendingAction({ item, type: "approve" })}
                    >
                      <IconCheck size={18} stroke={1.75} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label="Từ chối tin đăng"
                      onClick={() => setPendingAction({ item, type: "reject" })}
                    >
                      <IconX size={18} stroke={1.75} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="brand" aria-label="Xem chi tiết">
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

      <ConfirmDialog
        opened={pendingAction !== null}
        title={pendingAction?.type === "approve" ? "Duyệt tin đăng?" : "Từ chối tin đăng?"}
        description={`"${pendingAction?.item.tieuDe}"`}
        confirmLabel={pendingAction?.type === "approve" ? "Duyệt" : "Từ chối"}
        danger={pendingAction?.type === "reject"}
        onConfirm={resolveAction}
        onCancel={() => setPendingAction(null)}
      />
    </Box>
  );
}
