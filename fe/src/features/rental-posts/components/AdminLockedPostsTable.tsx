"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Group,
  Text,
  Badge,
  Box,
  Skeleton,
  Image,
  Center,
  Button,
  Tooltip,
} from "@mantine/core";
import { IconLockOpen } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
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

export function AdminLockedPostsTable() {
  const [items, setItems] = useState<TinChoDuyet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unlockingIds, setUnlockingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    rentalPostsApi
      .tinBiKhoa(page, PAGE_SIZE)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        notifications.show({
          color: "red",
          title: "Lỗi",
          message: "Không thể tải danh sách tin bị khóa.",
        });
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handleMoKhoa = async (id: number) => {
    setUnlockingIds((prev) => new Set(prev).add(id));
    try {
      await rentalPostsApi.moKhoaTin(id);
      notifications.show({
        color: "green",
        title: "Thành công",
        message: "Đã mở khóa tin đăng.",
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      notifications.show({
        color: "red",
        title: "Lỗi",
        message: "Không thể mở khóa tin đăng. Vui lòng thử lại.",
      });
    } finally {
      setUnlockingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
      <Box p={24} style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
          Tin đăng bị khóa
        </Text>
        <Text fz="sm" c="var(--color-text-muted)">
          Danh sách các tin đăng đã bị khóa bởi quản trị viên.
        </Text>
      </Box>

      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tài sản</Table.Th>
            <Table.Th>Chủ sở hữu</Table.Th>
            <Table.Th>Ngày đăng</Table.Th>
            <Table.Th>Loại</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Hành động</Table.Th>
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
                <Table.Td><Skeleton h={30} w={100} radius="sm" /></Table.Td>
              </Table.Tr>
            ))
          ) : items.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Center py={32}>
                  <Text c="dimmed">Không có tin đăng nào bị khóa.</Text>
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
                      <Text fz="xs" c="var(--color-text-muted)">#{item.id}</Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>{item.nguoiDang}</Table.Td>
                <Table.Td>{formatDate(item.ngayDang)}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray" radius="sm">{item.loaiBatDongSan}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="red" radius="sm">Bị khóa</Badge>
                </Table.Td>
                <Table.Td>
                  <Tooltip label="Mở khóa tin đăng này" withArrow>
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      leftSection={<IconLockOpen size={14} />}
                      loading={unlockingIds.has(item.id)}
                      onClick={() => handleMoKhoa(item.id)}
                    >
                      Mở khóa
                    </Button>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <Group justify="space-between" p={16} style={{ borderTop: "1px solid var(--color-border)" }}>
        <Text size="sm" c="dimmed">
          {loading ? "Đang tải..." : `Hiển thị ${items.length} trong số ${total} tin bị khóa`}
        </Text>
        {totalPages > 1 && (
          <AppPagination total={totalPages} value={page} onChange={setPage} />
        )}
      </Group>
    </Box>
  );
}
