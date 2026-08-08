"use client";

import { useEffect, useState } from "react";
import { Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AppModal } from "@/components/ui/AppModal";
import { AppButton } from "@/components/ui/AppButton";
import { ImageLibraryGrid } from "./ImageLibraryGrid";
import type { AnhThuVienItem } from "@/types/image-library";

interface ImageLibraryPickerModalProps {
  opened: boolean;
  onClose: () => void;
  mode: "single" | "multiple";
  maxSelect?: number;
  onConfirm: (selected: AnhThuVienItem[]) => void;
}

export function ImageLibraryPickerModal({
  opened,
  onClose,
  mode,
  maxSelect,
  onConfirm,
}: ImageLibraryPickerModalProps) {
  const [selected, setSelected] = useState<AnhThuVienItem[]>([]);

  useEffect(() => {
    if (opened) setSelected([]);
  }, [opened]);

  const gioiHan = mode === "single" ? 1 : maxSelect ?? Infinity;

  const handleToggle = (item: AnhThuVienItem) => {
    setSelected((prev) => {
      const daChon = prev.some((i) => i.id === item.id);
      if (daChon) return prev.filter((i) => i.id !== item.id);
      if (mode === "single") return [item];
      if (prev.length >= gioiHan) {
        notifications.show({ color: "yellow", message: `Chỉ chọn được tối đa ${gioiHan} ảnh.` });
        return prev;
      }
      return [...prev, item];
    });
  };

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={mode === "single" ? "Chọn ảnh chính" : "Chọn ảnh phụ"}
      size="90%"
      centered
    >
      <ImageLibraryGrid
        selectable
        selectedIds={selected.map((i) => i.id)}
        onToggleSelect={handleToggle}
        isSelectDisabled={() => mode === "multiple" && selected.length >= gioiHan}
      />
      <Group justify="space-between" mt={20}>
        <Text size="sm" c="dimmed">
          Đã chọn {selected.length}
          {mode === "multiple" && maxSelect ? ` / ${maxSelect}` : ""}
        </Text>
        <Group gap={12}>
          <AppButton variant="ghost" onClick={onClose}>
            Huỷ
          </AppButton>
          <AppButton disabled={selected.length === 0} onClick={() => onConfirm(selected)}>
            Xác nhận đã chọn ({selected.length})
          </AppButton>
        </Group>
      </Group>
    </AppModal>
  );
}
