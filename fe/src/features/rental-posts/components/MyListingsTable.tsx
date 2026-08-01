"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, ActionIcon, Group, Text, Anchor } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyUsd, formatDateVi } from "@/lib/utils";
import type { RentalPost } from "@/types/rental-post";
import { RentalPostStatusBadge } from "./RentalPostStatusBadge";

// Mock dữ liệu tin đăng của người dùng — sẽ thay bằng gọi rental-posts.mine().
const MOCK_MY_POSTS: RentalPost[] = [
  {
    id: "my-1",
    title: "Căn hộ Skyline Loft",
    description: "",
    priceUsd: 4250,
    address: "123 Đường Lê Lợi",
    city: "TP. Hồ Chí Minh",
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 167,
    coverImageUrl: null,
    status: "published",
    ownerId: "me",
    createdAt: "2026-06-12T00:00:00.000Z",
  },
  {
    id: "my-2",
    title: "Studio Urban Nest",
    description: "",
    priceUsd: 1800,
    address: "45 Đường Trần Phú",
    city: "Đà Nẵng",
    bedrooms: 1,
    bathrooms: 1,
    areaM2: 60,
    coverImageUrl: null,
    status: "pending",
    ownerId: "me",
    createdAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "my-3",
    title: "Nhà phố Vườn Tây",
    description: "",
    priceUsd: 2600,
    address: "78 Đường Nguyễn Trãi",
    city: "Hà Nội",
    bedrooms: 2,
    bathrooms: 2,
    areaM2: 95,
    coverImageUrl: null,
    status: "rejected",
    ownerId: "me",
    createdAt: "2026-05-20T00:00:00.000Z",
  },
];

export function MyListingsTable() {
  const [posts, setPosts] = useState(MOCK_MY_POSTS);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletingPost = posts.find((post) => post.id === deletingId) ?? null;

  const handleDelete = () => {
    if (!deletingPost) return;
    setPosts((prev) => prev.filter((post) => post.id !== deletingPost.id));
    notifications.show({
      color: "green",
      title: "Đã xoá tin đăng (demo)",
      message: `"${deletingPost.title}" đã được xoá.`,
    });
    setDeletingId(null);
  };

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa có tin đăng nào"
        description="Đăng tin bất động sản đầu tiên để bắt đầu cho thuê."
      />
    );
  }

  return (
    <>
      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tin đăng</Table.Th>
            <Table.Th>Giá</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Ngày đăng</Table.Th>
            <Table.Th ta="right">Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {posts.map((post) => (
            <Table.Tr key={post.id}>
              <Table.Td>
                <Anchor
                  component={Link}
                  href={ROUTES.chiTietTinDang(post.id)}
                  fw={600}
                  c="var(--color-brand)"
                  underline="hover"
                >
                  {post.title}
                </Anchor>
                <Text size="xs" c="dimmed">
                  {post.city}
                </Text>
              </Table.Td>
              <Table.Td>{formatCurrencyUsd(post.priceUsd)}</Table.Td>
              <Table.Td>
                <RentalPostStatusBadge status={post.status} />
              </Table.Td>
              <Table.Td>{formatDateVi(post.createdAt)}</Table.Td>
              <Table.Td>
                <Group gap={8} justify="flex-end">
                  <ActionIcon variant="subtle" color="brand" aria-label="Sửa tin đăng">
                    <IconPencil size={18} stroke={1.75} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="Xoá tin đăng"
                    onClick={() => setDeletingId(post.id)}
                  >
                    <IconTrash size={18} stroke={1.75} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <ConfirmDialog
        opened={deletingPost !== null}
        title="Xoá tin đăng?"
        description={`Bạn có chắc muốn xoá "${deletingPost?.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}
