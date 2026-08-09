"use client";

import { useEffect, useState } from "react";
import { Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { AppModal } from "@/components/ui/AppModal";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { ApiError } from "@/lib/api/api-error";
import { danhMucApi } from "@/features/rental-posts/api/danh-muc.api";
import type { LoaiBatDongSanQuanTri } from "@/types/danh-muc";
import { propertyTypeSchema, type PropertyTypeInput } from "../schemas/property-type.schema";

interface PropertyTypeFormModalProps {
  opened: boolean;
  editing: LoaiBatDongSanQuanTri | null;
  onClose: () => void;
  onSaved: (item: LoaiBatDongSanQuanTri) => void;
}

export function PropertyTypeFormModal({ opened, editing, onClose, onSaved }: PropertyTypeFormModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditMode = editing !== null;

  const form = useForm<PropertyTypeInput>({
    initialValues: { name: "" },
    validate: zodResolver(propertyTypeSchema),
  });

  useEffect(() => {
    if (opened) {
      form.setValues({ name: editing?.ten ?? "" });
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, editing]);

  const handleSubmit = form.onSubmit((values) => {
    setLoading(true);
    const luu = isEditMode
      ? danhMucApi.suaLoaiBatDongSan(editing.id, values.name)
      : danhMucApi.taoLoaiBatDongSan(values.name);

    luu
      .then((item) => {
        notifications.show({
          color: "green",
          message: isEditMode ? "Đã cập nhật loại bất động sản." : "Đã thêm loại bất động sản mới.",
        });
        onSaved(item);
        onClose();
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 409) {
          form.setFieldError("name", "Tên loại bất động sản đã tồn tại.");
          return;
        }
        notifications.show({ color: "red", message: "Có lỗi xảy ra, vui lòng thử lại." });
      })
      .finally(() => setLoading(false));
  });

  return (
    <AppModal opened={opened} onClose={onClose} title={isEditMode ? "Sửa loại bất động sản" : "Thêm loại bất động sản"} centered size="sm">
      <form onSubmit={handleSubmit}>
        <AppInput
          label="Tên loại"
          placeholder="VD: Căn hộ, Nhà phố, Biệt thự..."
          data-autofocus
          {...form.getInputProps("name")}
        />
        <Group justify="flex-end" gap={12} mt={24}>
          <AppButton type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Huỷ
          </AppButton>
          <AppButton type="submit" loading={loading}>
            {isEditMode ? "Lưu thay đổi" : "Thêm mới"}
          </AppButton>
        </Group>
      </form>
    </AppModal>
  );
}
