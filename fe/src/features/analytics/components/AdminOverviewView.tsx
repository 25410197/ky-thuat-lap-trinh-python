"use client";

import { SimpleGrid, Paper, Text, Group, Box, Grid, Stack } from "@mantine/core";
import { IconAlertTriangle, IconUsers, IconClipboardList, IconFlag } from "@tabler/icons-react";

// Số liệu lấy đúng từ Figma (màn "Quản trị hệ thống - Tiếng Việt") — sẽ nối API thống kê thật ở ticket sau.
const STATS = [
  {
    label: "Tổng người dùng",
    value: "12,842",
    note: "+12% so với tháng trước",
    noteColor: "#047857",
    icon: IconUsers,
  },
  {
    label: "Danh sách chờ duyệt",
    value: "48",
    note: "Thời gian chờ TB: 4.2 giờ",
    noteColor: "var(--color-danger)",
    icon: IconClipboardList,
  },
  {
    label: "Báo cáo đang xử lý",
    value: "15",
    note: "3 Ưu tiên khẩn cấp",
    noteColor: "var(--color-brand-muted)",
    icon: IconFlag,
  },
];

export function AdminOverviewView() {
  return (
    <div>
      <Text
        component="h1"
        mb={24}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Tổng quan
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        {STATS.map((stat) => (
          <Paper key={stat.label} radius="md" withBorder p="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                  {stat.label}
                </Text>
                <Text mt={4} fw={700} fz={28} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
                  {stat.value}
                </Text>
              </div>
              <stat.icon size={22} color="var(--color-brand-muted)" stroke={1.5} />
            </Group>
            <Text mt={12} size="sm" c={stat.noteColor}>
              {stat.note}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Grid mt={32} gap={24}>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Box p={24} bg="var(--color-brand)" c="var(--color-surface)" style={{ borderRadius: "var(--radius-card)" }}>
            <Text fz="xl" style={{ fontFamily: "var(--font-heading)" }}>
              Tình trạng hệ thống
            </Text>
            <Text mt={8} fz={36} fw={700}>
              99.8%
            </Text>
            <Text mt={4} fz="sm" c="rgba(255,255,255,0.8)">
              Tất cả hệ thống hoạt động tốt
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Box p={24} bg="var(--color-surface-muted)" style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--color-border)" }}>
            <Text mb={12} fz="xs" fw={700} tt="uppercase" c="var(--color-brand-muted)" style={{ letterSpacing: "0.08em" }}>
              Cảnh báo hệ thống khẩn cấp
            </Text>
            <Stack gap={12} fz="sm" c="var(--color-brand)">
              <Group gap={8} align="flex-start" wrap="nowrap">
                <IconAlertTriangle size={18} color="var(--color-danger)" stroke={1.75} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>API Endpoint /v1/listings-meta đang phản hồi chậm (trung bình 850ms).</span>
              </Group>
              <Group gap={8} align="flex-start" wrap="nowrap">
                <IconAlertTriangle
                  size={18}
                  color="var(--color-brand-muted)"
                  stroke={1.75}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <span>Bảo trì cơ sở dữ liệu định kỳ sau 14 giờ (02:00 UTC).</span>
              </Group>
            </Stack>
          </Box>
        </Grid.Col>
      </Grid>
    </div>
  );
}
