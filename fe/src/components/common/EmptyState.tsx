import type { ReactNode } from "react";
import { IconInbox } from "@tabler/icons-react";
import { Stack, Text, Box } from "@mantine/core";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title = "Chưa có dữ liệu",
  description = "Hiện chưa có nội dung nào để hiển thị.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap={12} w="100%" py={80} ta="center">
      <Box c="var(--color-brand-muted)">{icon ?? <IconInbox size={40} stroke={1.5} />}</Box>
      <Text fw={600} c="var(--color-brand)">
        {title}
      </Text>
      <Text size="sm" c="dimmed" maw={360}>
        {description}
      </Text>
      {action}
    </Stack>
  );
}
