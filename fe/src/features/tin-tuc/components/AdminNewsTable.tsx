"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Box, Center, Group, Image, Skeleton, Table, Tabs, Text } from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { AppButton } from "@/components/ui/AppButton";
import { AppPagination } from "@/components/ui/AppPagination";
import { ROUTES } from "@/constants/routes";
import { formatDateVi } from "@/lib/utils";
import { tinTucApi, type AdminNewsListItem, type NewsStatus } from "../api/tin-tuc.api";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<NewsStatus, string> = {
  draft: "Nháp",
  published: "Đã đăng",
  hidden: "Ẩn",
};

const STATUS_COLOR: Record<NewsStatus, string> = {
  draft: "gray",
  published: "green",
  hidden: "red",
};

export function AdminNewsTable() {
  const [items, setItems] = useState<AdminNewsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusTab, setStatusTab] = useState<string | null>("all");

  useEffect(() => {
    setLoading(true);
    tinTucApi
      .adminList({
        page,
        pageSize: PAGE_SIZE,
        status: statusTab && statusTab !== "all" ? (statusTab as NewsStatus) : undefined,
      })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Không thể tải danh sách bài viết." });
      })
      .finally(() => setLoading(false));
  }, [page, statusTab]);

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
            Tin tức thị trường
          </Text>
          <Text fz="sm" c="var(--color-text-muted)">
            Soạn và quản lý bài viết hiển thị công khai.
          </Text>
        </div>
        <AppButton component={Link} href={ROUTES.quanTriTinTucTaoMoi} leftSection={<IconPlus size={16} />}>
          Viết bài mới
        </AppButton>
      </Group>

      <Tabs
        value={statusTab}
        onChange={(value) => {
          setStatusTab(value);
          setPage(1);
        }}
        px={24}
        pt={12}
      >
        <Tabs.List>
          <Tabs.Tab value="all">Tất cả</Tabs.Tab>
          <Tabs.Tab value="draft">Nháp</Tabs.Tab>
          <Tabs.Tab value="published">Đã đăng</Tabs.Tab>
          <Tabs.Tab value="hidden">Ẩn</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Table verticalSpacing="md" highlightOnHover mt={12}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Bài viết</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Lượt xem</Table.Th>
            <Table.Th>Ngày đăng</Table.Th>
            <Table.Th ta="center">Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Table.Tr key={i}>
                <Table.Td><Skeleton h={40} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={22} w={80} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={40} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={100} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={28} w={60} radius="sm" ml="auto" /></Table.Td>
              </Table.Tr>
            ))
          ) : items.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Center py={32}>
                  <Text c="dimmed">Chưa có bài viết nào.</Text>
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
                      style={{ flexShrink: 0, borderRadius: 4, overflow: "hidden" }}
                    >
                      {item.coverImageUrl ? (
                        <Image src={item.coverImageUrl} alt={item.title} w={48} h={48} fit="cover" />
                      ) : null}
                    </Box>
                    <Text fw={600} c="var(--color-brand)">
                      {item.title}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={STATUS_COLOR[item.status]} radius="sm">
                    {STATUS_LABEL[item.status]}
                  </Badge>
                </Table.Td>
                <Table.Td>{item.viewCount}</Table.Td>
                <Table.Td>{item.publishedAt ? formatDateVi(item.publishedAt) : "—"}</Table.Td>
                <Table.Td>
                  <Group gap={8} justify="center">
                    <AppButton
                      component={Link}
                      href={ROUTES.quanTriTinTucSua(item.id)}
                      variant="ghost"
                      size="sm"
                      leftSection={<IconPencil size={16} />}
                    >
                      Sửa
                    </AppButton>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <Group justify="space-between" p={16} style={{ borderTop: "1px solid var(--color-border)" }}>
        <Text size="sm" c="dimmed">
          {loading ? "Đang tải..." : `Hiển thị ${items.length} trong số ${total} bài viết`}
        </Text>
        {totalPages > 1 && <AppPagination total={totalPages} value={page} onChange={setPage} />}
      </Group>
    </Box>
  );
}
