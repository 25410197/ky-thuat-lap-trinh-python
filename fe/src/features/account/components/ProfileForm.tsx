"use client";

import { useState } from "react";
import { Paper, Stack, Text, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { accountApi } from "../api/account.api";
import { profileSchema, type ProfileInput } from "../schemas/profile.schema";
import { ApiError } from "@/lib/api/api-error";

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProfileInput>({
    initialValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
    },
    validate: zod4Resolver(profileSchema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    try {
      const updated = await accountApi.updateProfile({
        fullName: values.fullName,
        phone: values.phone || null,
      });
      updateUser(updated);
      notifications.show({ color: "green", title: "Đã lưu", message: "Cập nhật hồ sơ thành công." });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Lỗi",
        message: error instanceof ApiError ? error.message : "Không thể cập nhật hồ sơ.",
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Paper radius="md" withBorder p="lg" component="form" onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div>
          <Text fz="lg" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Hồ sơ
          </Text>
          <Text size="sm" c="dimmed">
            Thông tin cá nhân hiển thị trên tin đăng và liên hệ.
          </Text>
        </div>

        <AppInput label="Email" value={user?.email ?? ""} readOnly disabled description="Không thể thay đổi email." />
        <AppInput label="Họ và tên" placeholder="Nguyễn Văn A" {...form.getInputProps("fullName")} />
        <AppInput label="Số điện thoại" placeholder="09xxxxxxxx" {...form.getInputProps("phone")} />

        <Group justify="flex-end">
          <AppButton type="submit" loading={submitting}>
            Lưu thay đổi
          </AppButton>
        </Group>
      </Stack>
    </Paper>
  );
}
