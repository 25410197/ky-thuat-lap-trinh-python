"use client";

import { useEffect, useState } from "react";
import { Table, ActionIcon, Group, Text, Badge, Box, Skeleton, Avatar, Center, Tooltip } from "@mantine/core";
import { IconLock, IconLockOpen, IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { AppPagination } from "@/components/ui/AppPagination";
import { AppInput } from "@/components/ui/AppInput";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { USER_STATUS_COLOR, USER_STATUS_LABEL_VI } from "@/constants/user-status";
import { usersApi } from "../api/users.api";
import type { AdminUser } from "@/types/user";

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts.at(-2)?.[0] ?? "") + (parts.at(-1)?.[0] ?? "")).toUpperCase() || "?";
}

export function AdminUsersTable() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [pendingTarget, setPendingTarget] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let huy = false;
    setLoading(true);
    usersApi
      .list({ page, pageSize: PAGE_SIZE, q: debouncedSearch || undefined })
      .then((data) => {
        if (huy) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        if (huy) return;
        notifications.show({
          color: "red",
          title: "Lỗi",
          message: "Không thể tải danh sách người dùng.",
        });
      })
      .finally(() => {
        if (!huy) setLoading(false);
      });
    return () => {
      huy = true;
    };
  }, [page, debouncedSearch]);

  const confirmToggle = async () => {
    if (!pendingTarget) return;
    const nextStatus = pendingTarget.status === "locked" ? "active" : "locked";

    setSubmitting(true);
    try {
      const updated = await usersApi.updateStatus(pendingTarget.id, nextStatus);
      setItems((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      notifications.show({
        color: nextStatus === "locked" ? "red" : "green",
        title: nextStatus === "locked" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
        message: pendingTarget.fullName,
      });
      setPendingTarget(null);
    } catch {
      notifications.show({
        color: "red",
        title: "Lỗi",
        message: "Không thể cập nhật trạng thái tài khoản.",
      });
    } finally {
      setSubmitting(false);
    }
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
        <div>
          <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Danh sách người dùng
          </Text>
          <Text fz="sm" c="var(--color-text-muted)">
            Tìm kiếm, xem trạng thái và khóa/mở khóa tài khoản.
          </Text>
        </div>
        <AppInput
          placeholder="Tìm theo họ tên hoặc email..."
          leftSection={<IconSearch size={16} stroke={1.75} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={280}
        />
      </Group>

      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Người dùng</Table.Th>
            <Table.Th>Vai trò</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Số tin đăng</Table.Th>
            <Table.Th>Ngày tham gia</Table.Th>
            <Table.Th ta="right">Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Table.Tr key={i}>
                <Table.Td>
                  <Group gap={12}>
                    <Skeleton h={36} w={36} radius="xl" />
                    <Skeleton h={16} w={160} radius="sm" />
                  </Group>
                </Table.Td>
                <Table.Td><Skeleton h={22} w={70} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={22} w={90} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={30} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={100} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={28} w={32} radius="sm" ml="auto" /></Table.Td>
              </Table.Tr>
            ))
          ) : items.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Center py={16}>
                  <EmptyState
                    title="Không tìm thấy người dùng"
                    description={
                      debouncedSearch
                        ? `Không có người dùng nào khớp với "${debouncedSearch}".`
                        : "Hiện chưa có người dùng nào."
                    }
                  />
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            items.map((row) => {
              const isSelf = row.id === currentUser?.id;
              const isLocked = row.status === "locked";
              return (
                <Table.Tr key={row.id}>
                  <Table.Td>
                    <Group gap={12} wrap="nowrap">
                      <Avatar color="brand" radius="xl">
                        {initialsOf(row.fullName)}
                      </Avatar>
                      <div>
                        <Text fw={600} c="var(--color-brand)">
                          {row.fullName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {row.email}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray" radius="sm">
                      {row.role === "admin" ? "Quản trị" : "Người dùng"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={USER_STATUS_COLOR[row.status]} radius="sm">
                      {USER_STATUS_LABEL_VI[row.status]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{row.postCount}</Table.Td>
                  <Table.Td>{formatDate(row.createdAt)}</Table.Td>
                  <Table.Td>
                    <Group gap={8} justify="flex-end">
                      <Tooltip
                        label={
                          isSelf
                            ? "Không thể tự khóa tài khoản đang đăng nhập"
                            : isLocked
                              ? "Mở khóa tài khoản"
                              : "Khóa tài khoản"
                        }
                      >
                        <ActionIcon
                          variant="subtle"
                          color={isLocked ? "green" : "red"}
                          aria-label={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          disabled={isSelf && !isLocked}
                          onClick={() => setPendingTarget(row)}
                        >
                          {isLocked ? <IconLockOpen size={18} stroke={1.75} /> : <IconLock size={18} stroke={1.75} />}
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })
          )}
        </Table.Tbody>
      </Table>

      <Group justify="space-between" p={16} style={{ borderTop: "1px solid var(--color-border)" }}>
        <Text size="sm" c="dimmed">
          {loading ? "Đang tải..." : `Hiển thị ${items.length} trong số ${total} người dùng`}
        </Text>
        {totalPages > 1 && <AppPagination total={totalPages} value={page} onChange={setPage} />}
      </Group>

      <ConfirmDialog
        opened={pendingTarget !== null}
        title={pendingTarget?.status === "locked" ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
        description={
          pendingTarget?.status === "locked"
            ? `Cho phép "${pendingTarget?.fullName}" đăng nhập và đăng tin trở lại.`
            : `"${pendingTarget?.fullName}" sẽ không thể đăng nhập hoặc tạo tin mới.`
        }
        confirmLabel={pendingTarget?.status === "locked" ? "Mở khóa" : "Khóa"}
        danger={pendingTarget?.status !== "locked"}
        loading={submitting}
        onConfirm={confirmToggle}
        onCancel={() => setPendingTarget(null)}
      />
    </Box>
  );
}
