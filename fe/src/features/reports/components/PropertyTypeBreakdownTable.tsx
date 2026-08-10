import { Table, Box, Group, Text, Skeleton } from "@mantine/core";
import { formatCurrencyVnd } from "@/lib/utils";
import type { ThongKeTheoLoai } from "../api/thong-ke.api";

interface PropertyTypeBreakdownTableProps {
  loading: boolean;
  theoLoaiBatDongSan: ThongKeTheoLoai[];
}

export function PropertyTypeBreakdownTable({ loading, theoLoaiBatDongSan }: PropertyTypeBreakdownTableProps) {
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
      <Group p={24} style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
          Thống kê theo loại bất động sản
        </Text>
      </Group>

      <Table verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Loại bất động sản</Table.Th>
            <Table.Th ta="right">Số lượng tin đăng</Table.Th>
            <Table.Th ta="right">Giá thuê TB</Table.Th>
            <Table.Th ta="right">Diện tích TB</Table.Th>
            <Table.Th ta="right">Giá thuê TB/m²</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Table.Tr key={i}>
                <Table.Td>
                  <Skeleton h={16} w={120} />
                </Table.Td>
                <Table.Td>
                  <Skeleton h={16} w={60} ml="auto" />
                </Table.Td>
                <Table.Td>
                  <Skeleton h={16} w={80} ml="auto" />
                </Table.Td>
                <Table.Td>
                  <Skeleton h={16} w={60} ml="auto" />
                </Table.Td>
                <Table.Td>
                  <Skeleton h={16} w={80} ml="auto" />
                </Table.Td>
              </Table.Tr>
            ))
          ) : theoLoaiBatDongSan.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text c="dimmed" ta="center" py={32}>
                  Chưa có dữ liệu tin đăng đã duyệt.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            theoLoaiBatDongSan.map((row) => (
              <Table.Tr key={row.loaiBatDongSan}>
                <Table.Td c="var(--color-brand)">{row.loaiBatDongSan}</Table.Td>
                <Table.Td ta="right" c="var(--color-brand-muted)">
                  {row.soLuong}
                </Table.Td>
                <Table.Td ta="right" c="var(--color-brand-muted)">
                  {formatCurrencyVnd(row.giaThueTrungBinh)}
                </Table.Td>
                <Table.Td ta="right" c="var(--color-brand-muted)">
                  {row.dienTichTrungBinh.toFixed(1)} m²
                </Table.Td>
                <Table.Td ta="right" c="var(--color-brand-muted)">
                  {formatCurrencyVnd(row.giaTrenM2TrungBinh)}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
