"use client";

import { Text, Group } from "@mantine/core";
import { AppModal } from "@/components/ui/AppModal";
import { AppButton } from "@/components/ui/AppButton";

interface ConfirmDialogProps {
  opened: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  opened,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AppModal opened={opened} onClose={onCancel} title={title} centered size="sm">
      {description ? (
        <Text size="sm" c="dimmed" mb={24}>
          {description}
        </Text>
      ) : null}
      <Group justify="flex-end" gap={12}>
        <AppButton variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </AppButton>
        <AppButton
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </AppButton>
      </Group>
    </AppModal>
  );
}
