"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, Alert, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginInput } from "../schemas/login.schema";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api/api-error";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    initialValues: { email: "", password: "" },
    validate: zodResolver(loginSchema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await login(values);
      router.push(ROUTES.home);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div>
          <Text component="h1" fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Đăng nhập
          </Text>
          <Text size="sm" c="dimmed">
            Chào mừng bạn quay lại UrbanLease.
          </Text>
        </div>

        {errorMessage ? (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        <AppInput label="Email" placeholder="ban@email.com" {...form.getInputProps("email")} />
        <AppInput
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          {...form.getInputProps("password")}
        />

        <AppButton type="submit" fullWidth loading={submitting}>
          Đăng nhập
        </AppButton>

        <Text size="sm" c="dimmed" ta="center">
          Chưa có tài khoản?{" "}
          <Anchor component={Link} href={ROUTES.dangKy} fw={600} c="var(--color-brand)" underline="hover">
            Đăng ký ngay
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
