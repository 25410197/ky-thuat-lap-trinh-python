import { Badge, Skeleton, Table, Text } from "@mantine/core";
import { formatCurrencyVnd } from "@/lib/utils";
import type { SoSanhKhuVucItem } from "../api/thong-ke.api";

interface RegionComparisonTableProps {
  loading: boolean;
  data: SoSanhKhuVucItem[];
}

export function RegionComparisonTable({ loading, data }: RegionComparisonTableProps) {
  return (
    <Table verticalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Khu vực</Table.Th>
          <Table.Th ta="right">Số lượng tin</Table.Th>
          <Table.Th ta="right">Giá thuê TB</Table.Th>
          <Table.Th ta="right">Giá thuê trung vị</Table.Th>
          <Table.Th ta="right">Giá thuê TB/m²</Table.Th>
          <Table.Th>Trạng thái</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Table.Tr key={i}>
              {Array.from({ length: 6 }).map((__, j) => (
                <Table.Td key={j}>
                  <Skeleton h={16} w={j === 0 ? 140 : 80} ml={j === 0 ? 0 : "auto"} />
                </Table.Td>
              ))}
            </Table.Tr>
          ))
        ) : data.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={6}>
              <Text c="dimmed" ta="center" py={32}>
                Chọn ít nhất 2 khu vực để so sánh.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          data.map((muc) => (
            <Table.Tr key={muc.quanHuyenId}>
              <Table.Td c="var(--color-brand)">
                <Text fw={600}>{muc.quanHuyen}</Text>
                <Text fz="xs" c="var(--color-text-muted)">
                  {muc.tinhThanh}
                </Text>
              </Table.Td>
              <Table.Td ta="right" c="var(--color-brand-muted)">
                {muc.soLuong.toLocaleString("vi-VN")}
              </Table.Td>
              <Table.Td ta="right" c="var(--color-brand-muted)">
                {muc.giaThueTrungBinh !== null ? formatCurrencyVnd(muc.giaThueTrungBinh) : "—"}
              </Table.Td>
              <Table.Td ta="right" c="var(--color-brand-muted)">
                {muc.giaThueTrungVi !== null ? formatCurrencyVnd(muc.giaThueTrungVi) : "—"}
              </Table.Td>
              <Table.Td ta="right" c="var(--color-brand-muted)">
                {muc.giaTrenM2TrungBinh !== null ? formatCurrencyVnd(muc.giaTrenM2TrungBinh) : "—"}
              </Table.Td>
              <Table.Td>
                {muc.soLuong === 0 ? (
                  <Badge size="sm" color="gray" variant="light">
                    Không có dữ liệu
                  </Badge>
                ) : muc.mauNho ? (
                  <Badge size="sm" color="gold" variant="light">
                    Mẫu nhỏ
                  </Badge>
                ) : (
                  <Badge size="sm" color="green" variant="light">
                    Đủ dữ liệu
                  </Badge>
                )}
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );
}
