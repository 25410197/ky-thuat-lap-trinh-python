import { IconAlertTriangle } from "@tabler/icons-react";
import { Stack, Text } from "@mantine/core";
import { AppButton } from "@/components/ui/AppButton";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Đã có lỗi xảy ra",
  description = "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Stack align="center" justify="center" gap={12} w="100%" py={80} ta="center">
      <IconAlertTriangle size={40} stroke={1.5} color="var(--color-danger)" />
      <Text fw={600} c="var(--color-danger)">
        {title}
      </Text>
      <Text size="sm" c="dimmed" maw={360}>
        {description}
      </Text>
      {onRetry ? (
        <AppButton variant="outline" size="sm" onClick={onRetry}>
          Thử lại
        </AppButton>
      ) : null}
    </Stack>
  );
}
