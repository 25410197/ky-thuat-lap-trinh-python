import type { ReactNode } from "react";
import { Box, Group, Text } from "@mantine/core";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Box
      h="100%"
      bg="var(--color-surface)"
      style={{
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
    >
      <Group justify="space-between" align="flex-start" p={24} style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div>
          <Text fz="lg" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            {title}
          </Text>
          {subtitle ? (
            <Text fz="xs" c="var(--color-text-muted)" mt={2}>
              {subtitle}
            </Text>
          ) : null}
        </div>
      </Group>
      <Box p={24}>{children}</Box>
    </Box>
  );
}
