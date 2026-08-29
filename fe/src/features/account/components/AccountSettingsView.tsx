"use client";

import { Stack, Text } from "@mantine/core";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function AccountSettingsView() {
  return (
    <Stack gap={24} maw={560}>
      <Text
        component="h1"
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Cài đặt tài khoản
      </Text>
      <ProfileForm />
      <ChangePasswordForm />
    </Stack>
  );
}
