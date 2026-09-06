"use client";

import { useState } from "react";
import { Paper, Stack, Text, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { accountApi } from "../api/account.api";
import { changePasswordSchema, type ChangePasswordInput } from "../schemas/change-password.schema";
import { ApiError } from "@/lib/api/api-error";

const INITIAL_VALUES: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ChangePasswordInput>({
    initialValues: INITIAL_VALUES,
    validate: zod4Resolver(changePasswordSchema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    try {
      await accountApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.setValues(INITIAL_VALUES);
      form.resetDirty(INITIAL_VALUES);
      notifications.show({ color: "green", title: "Đã đổi mật khẩu", message: "Mật khẩu của bạn đã được cập nhật." });
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        form.setFieldError("currentPassword", error.message || "Mật khẩu hiện tại không đúng.");
      } else {
        notifications.show({
          color: "red",
          title: "Lỗi",
          message: error instanceof ApiError ? error.message : "Không thể đổi mật khẩu.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Paper radius="md" withBorder p="lg" component="form" onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div>
          <Text fz="lg" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Đổi mật khẩu
          </Text>
          <Text size="sm" c="dimmed">
            Nhập mật khẩu hiện tại để xác nhận trước khi đổi.
          </Text>
        </div>

        <AppInput
          label="Mật khẩu hiện tại"
          type="password"
          placeholder="••••••••"
          {...form.getInputProps("currentPassword")}
        />
        <AppInput
          label="Mật khẩu mới"
          type="password"
          placeholder="••••••••"
          {...form.getInputProps("newPassword")}
        />
        <AppInput
          label="Nhập lại mật khẩu mới"
          type="password"
          placeholder="••••••••"
          {...form.getInputProps("confirmNewPassword")}
        />

        <Group justify="flex-end">
          <AppButton type="submit" loading={submitting}>
            Đổi mật khẩu
          </AppButton>
        </Group>
      </Stack>
    </Paper>
  );
}
