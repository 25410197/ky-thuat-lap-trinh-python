import { Table, Box, Group, Text, Skeleton, Badge } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import type { ThongKeTheoTinhThanh } from "../api/thong-ke.api";

interface MarketPerformanceTableProps {
  loading: boolean;
  theoTinhThanh: ThongKeTheoTinhThanh[];
  khuVucNhieuTinNhat: ThongKeTheoTinhThanh | null;
}

export function MarketPerformanceTable({
  loading,
  theoTinhThanh,
  khuVucNhieuTinNhat,
}: MarketPerformanceTableProps) {
  return (
    <Box
      mb={24}
      bg="var(--color-surface)"
      style={{
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
    >
      <Group justify="space-between" p={24} style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
          Số lượng tin đăng theo tỉnh/thành
        </Text>
      </Group>

      <Table verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tỉnh/thành</Table.Th>
            <Table.Th ta="right">Số lượng tin đăng</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Table.Tr key={i}>
                <Table.Td>
                  <Skeleton h={16} w={140} />
                </Table.Td>
                <Table.Td>
                  <Skeleton h={16} w={60} ml="auto" />
                </Table.Td>
              </Table.Tr>
            ))
          ) : theoTinhThanh.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={2}>
                <Text c="dimmed" ta="center" py={32}>
                  Chưa có dữ liệu tin đăng đã duyệt.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            theoTinhThanh.map((row) => (
              <Table.Tr key={row.tinhThanh}>
                <Table.Td c="var(--color-brand)">
                  <Group gap={8}>
                    {row.tinhThanh}
                    {khuVucNhieuTinNhat?.tinhThanh === row.tinhThanh ? (
                      <Badge size="xs" color="gold" variant="light" leftSection={<IconTrophy size={12} />}>
                        Nhiều tin nhất
                      </Badge>
                    ) : null}
                  </Group>
                </Table.Td>
                <Table.Td ta="right" c="var(--color-brand-muted)">
                  {row.soLuong}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
