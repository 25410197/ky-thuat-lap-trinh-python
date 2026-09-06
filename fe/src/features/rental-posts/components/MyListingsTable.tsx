"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyVnd, formatDateVi } from "@/lib/utils";
import type { RentalPost } from "@/types/rental-post";
import { ActionIcon, Anchor, Group, Table, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconRotateClockwise, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RentalPostStatusBadge } from "./RentalPostStatusBadge";
import { rentalPostsApi } from "../api/rental-posts.api";

export function MyListingsTable() {
  const [posts, setPosts] = useState<RentalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resubmittingPost, setResubmittingPost] = useState<RentalPost | null>(null);
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    rentalPostsApi
      .mine()
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => {
        notifications.show({ color: "red", message: "Lỗi tải dữ liệu" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const deletingPost = posts.find((post) => post.id === deletingId) ?? null;

  const handleDelete = () => {
    if (!deletingPost) return;
    rentalPostsApi
      .xoa(deletingPost.id)
      .then(() => {
        setPosts((prev) => prev.filter((post) => post.id !== deletingPost.id));
        notifications.show({
          color: "green",
          title: "Đã xoá tin đăng",
          message: `"${deletingPost.title}" đã được xoá.`,
        });
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Xoá tin đăng thất bại, vui lòng thử lại." });
      })
      .finally(() => {
        setDeletingId(null);
      });
  };

  const handleResubmit = () => {
    if (!resubmittingPost) return;
    setResubmitting(true);
    rentalPostsApi
      .guiDuyetLai(resubmittingPost.id)
      .then(() => {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === resubmittingPost.id ? { ...post, status: "pending" } : post
          )
        );
        notifications.show({
          color: "green",
          title: "Đã gửi duyệt lại",
          message: `Tin đăng "${resubmittingPost.title}" đã được gửi lại cho quản trị viên kiểm duyệt.`,
        });
      })
      .catch((err: any) => {
        notifications.show({
          color: "red",
          title: "Gửi duyệt lại thất bại",
          message: err?.message || "Có lỗi xảy ra khi gửi duyệt lại tin đăng.",
        });
      })
      .finally(() => {
        setResubmitting(false);
        setResubmittingPost(null);
      });
  };

  if (loading) {
    return (
      <Text ta="center" mt="xl">
        Đang tải dữ liệu...
      </Text>
    );
  }
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
              <Table.Td>{formatCurrencyVnd(post.priceVnd)}</Table.Td>
              <Table.Td>
                <RentalPostStatusBadge status={post.status} />
                {(post.status === "rejected" || post.status === "blocked") && post.blockReason && (
                  <Text
                    size="xs"
                    c="red.7"
                    mt={4}
                    style={{ maxWidth: 220, wordBreak: "break-word" }}
                    title={post.blockReason}
                  >
                    <Text span fw={600}>Lý do: </Text>
                    {post.blockReason}
                  </Text>
                )}
              </Table.Td>
              <Table.Td>{formatDateVi(post.createdAt)}</Table.Td>
              <Table.Td>
                <Group gap={8} justify="flex-end">
                  {post.status === "rejected" && (
                    <Tooltip label="Gửi duyệt lại">
                      <ActionIcon
                        variant="subtle"
                        color="orange"
                        aria-label="Gửi duyệt lại"
                        onClick={() => setResubmittingPost(post)}
                      >
                        <IconRotateClockwise size={18} stroke={1.75} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <ActionIcon
                    component={Link}
                    href={ROUTES.suaTinDang(post.id)}
                    variant="subtle"
                    color="brand"
                    aria-label="Sửa tin đăng"
                  >
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

      <ConfirmDialog
        opened={resubmittingPost !== null}
        title="Gửi duyệt lại tin đăng?"
        description={`Bạn có muốn gửi lại tin đăng "${resubmittingPost?.title}" để quản trị viên kiểm duyệt không?`}
        confirmLabel="Gửi duyệt lại"
        loading={resubmitting}
        onConfirm={handleResubmit}
        onCancel={() => setResubmittingPost(null)}
      />
    </>
  );
}

