"use client";

import { SimpleGrid, Paper, Text } from "@mantine/core";
import { MarketPerformanceTable } from "./MarketPerformanceTable";

// Số liệu lấy đúng từ Figma (màn "Phân tích thị trường - Tiếng Việt").
const STATS = [
  { label: "Giá thuê trung bình/tháng", value: "$3,240", note: "+4.2% từ Quý 3" },
  { label: "Giá mỗi m2", value: "$14,500", note: "+1.8% từ Quý 3" },
  { label: "Danh sách đang hoạt động", value: "1,842", note: "Ưu tiên khu trung tâm" },
  { label: "Tốc độ thị trường", value: "14 Ngày", note: "Thời gian đăng trung bình" },
];

export function MarketStatsView() {
  return (
    <div>
      <Text
        component="h1"
        mb={8}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Thống kê thị trường
      </Text>
      <Text mb={24} fz="sm" c="var(--color-text-muted)">
        Biểu đồ trực quan (cột theo quận, phân bổ giá, bản đồ nhiệt) trong Figma cần thư viện
        chart riêng nên chưa dựng ở scaffold này — giữ lại các chỉ số và bảng dữ liệu chi tiết.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb={32}>
        {STATS.map((stat) => (
          <Paper key={stat.label} radius="md" withBorder p="lg">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              {stat.label}
            </Text>
            <Text mt={4} fw={700} fz={28} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
              {stat.value}
            </Text>
            <Text mt={8} size="sm" c="dimmed">
              {stat.note}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <MarketPerformanceTable />
    </div>
  );
}
