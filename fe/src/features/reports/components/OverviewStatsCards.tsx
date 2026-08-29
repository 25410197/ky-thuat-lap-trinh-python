import { SimpleGrid, Paper, Text, Group, Skeleton } from "@mantine/core";
import {
  IconClipboardList,
  IconCircleCheck,
  IconCoin,
  IconRulerMeasure,
  IconStack2,
} from "@tabler/icons-react";
import { formatCurrencyVnd } from "@/lib/utils";
import { formatAreaM2 } from "../utils/format";
import type { ThongKeTongQuan } from "../api/thong-ke.api";

interface OverviewStatsCardsProps {
  data: ThongKeTongQuan | null;
  loading: boolean;
}

export function OverviewStatsCards({ data, loading }: OverviewStatsCardsProps) {
  const stats = data
    ? [
        { label: "Tổng số tin đăng", value: data.tongSoTinDang.toLocaleString("vi-VN"), icon: IconClipboardList },
        {
          label: "Tin đang hoạt động",
          value: data.tongSoTinDaDuyet.toLocaleString("vi-VN"),
          icon: IconCircleCheck,
        },
        { label: "Giá thuê trung bình", value: formatCurrencyVnd(data.giaThueTrungBinh), icon: IconCoin },
        {
          label: "Diện tích trung bình",
          value: formatAreaM2(data.dienTichTrungBinh),
          icon: IconRulerMeasure,
        },
        {
          label: "Giá thuê TB / m²",
          value: formatCurrencyVnd(data.giaTrenM2TrungBinh),
          icon: IconStack2,
        },
      ]
    : [];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} mb={32}>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <Paper key={i} radius="md" withBorder p="lg">
              <Skeleton h={12} w="60%" mb={12} />
              <Skeleton h={28} w="80%" />
            </Paper>
          ))
        : stats.map((stat) => (
            <Paper key={stat.label} radius="md" withBorder p="lg">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    {stat.label}
                  </Text>
                  <Text
                    mt={4}
                    fw={700}
                    fz={22}
                    c="var(--color-brand)"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {stat.value}
                  </Text>
                </div>
                <stat.icon size={22} color="var(--color-brand-muted)" stroke={1.5} />
              </Group>
            </Paper>
          ))}
    </SimpleGrid>
  );
}
