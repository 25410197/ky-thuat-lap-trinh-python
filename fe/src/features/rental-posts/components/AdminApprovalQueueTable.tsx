"use client";

import { useState } from "react";
import { Table, ActionIcon, Group, Text, Badge, Box } from "@mantine/core";
import { IconCheck, IconX, IconEye } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppPagination } from "@/components/ui/AppPagination";

type QueueStatus = "Chờ phê duyệt" | "Bị gắn cờ";

interface QueueItem {
  id: string;
  code: string;
  name: string;
  owner: string;
  submittedAt: string;
  type: string;
  status: QueueStatus;
}

// Dữ liệu lấy đúng từ Figma (bảng "Hàng đợi Phê duyệt Danh sách", màn "Quản trị hệ thống").
const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "1",
    code: "UL-98231",
    name: "The Zenith Penthouse",
    owner: "Marcus V. Sterling",
    submittedAt: "24 tháng 10, 2024",
    type: "Khu dân cư",
    status: "Chờ phê duyệt",
  },
  {
    id: "2",
    code: "UL-98442",
    name: "Meadowview Estates",
    owner: "Sarah Jenkins",
    submittedAt: "23 tháng 10, 2024",
    type: "Khu dân cư",
    status: "Bị gắn cờ",
  },
  {
    id: "3",
    code: "UL-98110",
    name: "Industrial Hub B-4",
    owner: "Urban Logistics Inc.",
    submittedAt: "23 tháng 10, 2024",
    type: "Thương mại",
    status: "Chờ phê duyệt",
  },
];

export function AdminApprovalQueueTable() {
  const [items, setItems] = useState(INITIAL_QUEUE);
  const [pendingAction, setPendingAction] = useState<{ item: QueueItem; type: "approve" | "reject" } | null>(
    null
  );

  const resolveAction = () => {
    if (!pendingAction) return;
    const { item, type } = pendingAction;
    setItems((prev) => prev.filter((row) => row.id !== item.id));
    notifications.show({
      color: type === "approve" ? "green" : "red",
      title: type === "approve" ? "Đã duyệt tin đăng (demo)" : "Đã từ chối tin đăng (demo)",
      message: `"${item.name}" (${item.code})`,
    });
    setPendingAction(null);
  };

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
          {items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Group gap={12} wrap="nowrap">
                  <Box
                    w={48}
                    h={48}
                    bg="var(--color-surface-muted)"
                    style={{ flexShrink: 0, borderRadius: 2 }}
                  />
                  <div>
                    <Text fw={600} c="var(--color-brand)">
                      {item.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ID: {item.code}
                    </Text>
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>{item.owner}</Table.Td>
              <Table.Td>{item.submittedAt}</Table.Td>
              <Table.Td>
                <Badge variant="light" color="gray" radius="sm">
                  {item.type}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge
                  variant="light"
                  color={item.status === "Bị gắn cờ" ? "red" : "gray"}
                  radius="sm"
                >
                  {item.status}
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
          ))}
        </Table.Tbody>
      </Table>

      <Group justify="space-between" p={16} style={{ borderTop: "1px solid var(--color-border)" }}>
        <Text size="sm" c="dimmed">
          Hiển thị {items.length} trong số 48 danh sách đang chờ duyệt
        </Text>
        <AppPagination total={16} value={1} />
      </Group>

      <ConfirmDialog
        opened={pendingAction !== null}
        title={pendingAction?.type === "approve" ? "Duyệt tin đăng?" : "Từ chối tin đăng?"}
        description={`"${pendingAction?.item.name}" (${pendingAction?.item.code})`}
        confirmLabel={pendingAction?.type === "approve" ? "Duyệt" : "Từ chối"}
        danger={pendingAction?.type === "reject"}
        onConfirm={resolveAction}
        onCancel={() => setPendingAction(null)}
      />
    </Box>
  );
}
