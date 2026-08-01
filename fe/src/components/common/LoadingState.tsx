import { Loader, Stack, Text } from "@mantine/core";

export function LoadingState({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <Stack align="center" justify="center" gap={12} w="100%" py={80}>
      <Loader color="brand" size="md" />
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Stack>
  );
}
