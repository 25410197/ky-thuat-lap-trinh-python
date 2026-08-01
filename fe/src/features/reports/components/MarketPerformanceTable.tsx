import { Table, Box, Group, Text } from "@mantine/core";
import { IconTrendingUp, IconTrendingDown, IconMinus, IconDownload } from "@tabler/icons-react";
import { AppButton } from "@/components/ui/AppButton";

type Trend = "up" | "down" | "flat";

interface RegionRow {
  region: string;
  avgPricePerM2: string;
  volume: number;
  trend: Trend;
}

// Dữ liệu lấy đúng từ Figma (bảng "Hiệu suất theo khu vực", màn "Phân tích thị trường").
const REGIONS: RegionRow[] = [
  { region: "Trung tâm", avgPricePerM2: "$18,400", volume: 412, trend: "up" },
  { region: "Khu Cảng", avgPricePerM2: "$12,100", volume: 285, trend: "down" },
  { region: "Phía Bắc", avgPricePerM2: "$15,600", volume: 198, trend: "up" },
  { region: "Vườn Tây", avgPricePerM2: "$9,800", volume: 542, trend: "flat" },
];

const TREND_ICON: Record<Trend, typeof IconTrendingUp> = {
  up: IconTrendingUp,
  down: IconTrendingDown,
  flat: IconMinus,
};

const TREND_COLOR: Record<Trend, string> = {
  up: "#047857",
  down: "var(--color-danger)",
  flat: "var(--color-text-muted)",
};

export function MarketPerformanceTable() {
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
        <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
          Hiệu suất theo khu vực
        </Text>
        <AppButton variant="ghost" size="sm" leftSection={<IconDownload size={16} />}>
          Xuất CSV
        </AppButton>
      </Group>

      <Table verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Khu vực</Table.Th>
            <Table.Th ta="right">Giá m2 TB</Table.Th>
            <Table.Th ta="right">Số lượng</Table.Th>
            <Table.Th ta="center">Xu hướng</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {REGIONS.map((row) => {
            const TrendIcon = TREND_ICON[row.trend];
            return (
              <Table.Tr key={row.region}>
                <Table.Td c="var(--color-brand)">{row.region}</Table.Td>
                <Table.Td ta="right" c="var(--color-brand-muted)">
                  {row.avgPricePerM2}
                </Table.Td>
                <Table.Td ta="right" c="var(--color-brand-muted)">
                  {row.volume}
                </Table.Td>
                <Table.Td>
                  <TrendIcon
                    size={18}
                    stroke={1.75}
                    color={TREND_COLOR[row.trend]}
                    style={{ display: "block", margin: "0 auto" }}
                  />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      <Group justify="flex-end" gap={24} px={24} py={12} fz="xs" c="var(--color-text-muted)" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Group gap={8}>
          <IconMinus size={14} color="var(--color-text-muted)" /> Khối lượng thấp
        </Group>
        <Group gap={8}>
          <IconTrendingUp size={14} color="#047857" /> Khối lượng cao
        </Group>
      </Group>
    </Box>
  );
}
