import { Box, Center, Group, Skeleton, Stack, Text } from "@mantine/core";
import { formatCurrencyVnd } from "@/lib/utils";
import { ChartCard } from "./ChartCard";
import type { ThongKeTheoTinhThanh } from "../api/thong-ke.api";

const SO_KHU_VUC_TOP = 5;
const MAU_HANG = ["#d4af37", "#a8a29e", "#b08d57", "#3c2f2f", "#3c2f2f"];

interface TopRegionsListProps {
  loading: boolean;
  theoTinhThanh: ThongKeTheoTinhThanh[];
}

export function TopRegionsList({ loading, theoTinhThanh }: TopRegionsListProps) {
  const top = theoTinhThanh.slice(0, SO_KHU_VUC_TOP);

  return (
    <ChartCard title="Top khu vực có nhiều tin đăng nhất" subtitle={`${SO_KHU_VUC_TOP} tỉnh/thành dẫn đầu số lượng tin`}>
      {loading ? (
        <Stack gap={12}>
          {Array.from({ length: SO_KHU_VUC_TOP }).map((_, i) => (
            <Skeleton key={i} h={40} radius="sm" />
          ))}
        </Stack>
      ) : top.length === 0 ? (
        <Center h={200}>
          <Text c="dimmed" size="sm">
            Chưa có dữ liệu.
          </Text>
        </Center>
      ) : (
        <Stack gap={12}>
          {top.map((muc, i) => (
            <Group key={muc.tinhThanh} justify="space-between" wrap="nowrap">
              <Group gap={12} wrap="nowrap">
                <Box
                  w={28}
                  h={28}
                  style={{
                    borderRadius: "50%",
                    backgroundColor: MAU_HANG[i] ?? "var(--color-brand-muted)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </Box>
                <div>
                  <Text fw={600} c="var(--color-brand)">
                    {muc.tinhThanh}
                  </Text>
                  <Text fz="xs" c="var(--color-text-muted)">
                    Giá TB {formatCurrencyVnd(muc.giaThueTrungBinh)}
                  </Text>
                </div>
              </Group>
              <Text fw={700} c="var(--color-brand-muted)">
                {muc.soLuong.toLocaleString("vi-VN")} tin
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </ChartCard>
  );
}
