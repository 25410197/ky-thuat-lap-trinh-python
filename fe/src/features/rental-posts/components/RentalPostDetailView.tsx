import { Box, Grid, Text, Group } from "@mantine/core";
import { IconBath, IconBed, IconMapPin, IconRulerMeasure } from "@tabler/icons-react";
import { AppButton } from "@/components/ui/AppButton";
import { formatCurrencyUsd } from "@/lib/utils";
import styles from "@/styles/interactions.module.css";

// Dữ liệu mẫu để dựng giao diện — sẽ thay bằng gọi API rental-posts.detail(id).
const MOCK_DETAIL = {
  title: "Căn hộ Skyline Loft",
  priceUsd: 4250,
  city: "Trung tâm Manhattan, NY",
  bedrooms: 3,
  bathrooms: 2,
  areaM2: 167,
  description:
    "Căn hộ cao cấp view toàn cảnh thành phố, nội thất đầy đủ, gần trung tâm thương mại và giao thông công cộng.",
};

export function RentalPostDetailView({ id }: { id: string }) {
  return (
    <Grid gap={32} px={32} py={40}>
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Box
          mb={24}
          className={styles.aspectVideo}
          bg="var(--color-surface-muted)"
          style={{ borderRadius: "var(--radius-card)" }}
        />
        <Text
          component="h1"
          fz={30}
          fw={700}
          c="var(--color-brand)"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {MOCK_DETAIL.title}
        </Text>
        <Group gap={4} mt={8} c="var(--color-text-muted)">
          <IconMapPin size={18} stroke={1.75} />
          {MOCK_DETAIL.city}
        </Group>
        <Group
          gap={24}
          mt={24}
          py={16}
          c="var(--color-brand-muted)"
          style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
        >
          <Group gap={8}>
            <IconBed size={18} stroke={1.75} />
            {MOCK_DETAIL.bedrooms} phòng ngủ
          </Group>
          <Group gap={8}>
            <IconBath size={18} stroke={1.75} />
            {MOCK_DETAIL.bathrooms} phòng tắm
          </Group>
          <Group gap={8}>
            <IconRulerMeasure size={18} stroke={1.75} />
            {MOCK_DETAIL.areaM2} m²
          </Group>
        </Group>
        <Text mt={24} c="var(--color-brand-muted)" style={{ lineHeight: 1.7 }}>
          {MOCK_DETAIL.description}
        </Text>
        <Text mt={16} fz="xs" c="var(--color-text-muted)">
          Mã tin đăng: {id}
        </Text>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 4 }}>
        <Box
          p={24}
          bg="var(--color-surface)"
          style={{
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            height: "fit-content",
          }}
        >
          <Text fz={24} fw={700} c="var(--color-gold)" style={{ fontFamily: "var(--font-heading)" }}>
            {formatCurrencyUsd(MOCK_DETAIL.priceUsd)}
            <Text component="span" ml={4} fz="sm" fw={400} c="var(--color-text-muted)">
              /tháng
            </Text>
          </Text>
          <AppButton variant="primary" fullWidth mt={24}>
            Liên hệ chủ nhà
          </AppButton>
          <AppButton variant="outline" fullWidth mt={12}>
            Lưu vào yêu thích
          </AppButton>
        </Box>
      </Grid.Col>
    </Grid>
  );
}
