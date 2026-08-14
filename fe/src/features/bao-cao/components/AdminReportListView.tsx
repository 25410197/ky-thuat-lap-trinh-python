"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Center, Group, Skeleton, Table, Text, Tooltip, Tabs } from "@mantine/core";
import { ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { AppPagination } from "@/components/ui/AppPagination";
import { baoCaoApi } from "@/lib/api/bao-cao";
import type { BaoCaoTomTat } from "@/schemas/bao-cao";
import { useRouter } from "next/navigation";
import { formatDateVi } from "@/lib/utils";

const PAGE_SIZE = 10;

const STATUS_COLOR: Record<string, string> = {
  cho_xu_ly: "orange",
  da_xu_ly: "green",
  tu_choi: "red",
};

const STATUS_LABEL: Record<string, string> = {
  cho_xu_ly: "Chờ xử lý",
  da_xu_ly: "Đã xử lý",
  tu_choi: "Đã từ chối",
};

export function AdminReportListView() {
  const router = useRouter();
  const [items, setItems] = useState<BaoCaoTomTat[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusTab, setStatusTab] = useState<string | null>("cho_xu_ly");

  const load = () => {
    setLoading(true);
    baoCaoApi
      .getList({
        page,
        pageSize: PAGE_SIZE,
        trangThai: statusTab && statusTab !== "all" ? statusTab : undefined,
      })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Không thể tải danh sách báo cáo." });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Group justify="space-between" p={24} pb={12} style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Box>
          <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Quản lý Báo cáo
          </Text>
          <Text fz="sm" c="var(--color-text-muted)">
            Xem và xử lý các báo cáo vi phạm từ người dùng.
          </Text>
        </Box>
      </Group>

      <Box p={24} pb={0}>
        <Tabs value={statusTab} onChange={(val) => { setStatusTab(val); setPage(1); }}>
          <Tabs.List>
            <Tabs.Tab value="cho_xu_ly">Chờ xử lý</Tabs.Tab>
            <Tabs.Tab value="da_xu_ly">Đã xử lý</Tabs.Tab>
            <Tabs.Tab value="tu_choi">Đã từ chối</Tabs.Tab>
            <Tabs.Tab value="all">Tất cả</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>

      <Table verticalSpacing="md" highlightOnHover mt={16}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Người báo cáo</Table.Th>
            <Table.Th>Tin đăng</Table.Th>
            <Table.Th>Lý do</Table.Th>
            <Table.Th>Ngày gửi</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th ta="center">Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Table.Tr key={i}>
                <Table.Td><Skeleton h={16} w={20} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={120} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={150} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={150} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={16} w={100} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={22} w={80} radius="sm" /></Table.Td>
                <Table.Td><Skeleton h={28} w={40} radius="sm" ml="auto" /></Table.Td>
              </Table.Tr>
            ))
          ) : items.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={7}>
                <Center py={32}>
                  <Text c="dimmed">Không có báo cáo nào.</Text>
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.id}</Table.Td>
                <Table.Td>
                  <Text fw={500} size="sm">{item.nguoiBaoCao.hoTen}</Text>
                  <Text size="xs" c="dimmed">{item.nguoiBaoCao.email}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1}>{item.tinDang.tieuDe}</Text>
                  <Text size="xs" c="dimmed">ID: {item.tinDang.id}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>{item.lyDo}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDateVi(item.ngayBaoCao)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={STATUS_COLOR[item.trangThai]} radius="sm">
                    {STATUS_LABEL[item.trangThai] || item.trangThai}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={8} justify="center">
                    <Tooltip label="Xem chi tiết">
                      <ActionIcon
                        variant="subtle"
                        color="brand"
                        aria-label="Xem chi tiết"
                        onClick={() => router.push(`/quan-tri/bao-cao/${item.id}`)}
                      >
                        <IconEye size={18} stroke={1.75} />
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
          {loading ? "Đang tải..." : `Hiển thị ${items.length} trong số ${total} báo cáo`}
        </Text>
        {totalPages > 1 && <AppPagination total={totalPages} value={page} onChange={setPage} />}
      </Group>
    </Box>
  );
}
