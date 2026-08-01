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
import { registerSchema, type RegisterInput } from "../schemas/register.schema";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api/api-error";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterInput>({
    initialValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    validate: zodResolver(registerSchema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await register(values);
      router.push(ROUTES.home);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div>
          <Text component="h1" fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Đăng ký
          </Text>
          <Text size="sm" c="dimmed">
            Tạo tài khoản để đăng tin và lưu tin yêu thích.
          </Text>
        </div>

        {errorMessage ? (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        <AppInput label="Họ và tên" placeholder="Nguyễn Văn A" {...form.getInputProps("fullName")} />
        <AppInput label="Email" placeholder="ban@email.com" {...form.getInputProps("email")} />
        <AppInput
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          {...form.getInputProps("password")}
        />
        <AppInput
          label="Nhập lại mật khẩu"
          type="password"
          placeholder="••••••••"
          {...form.getInputProps("confirmPassword")}
        />

        <AppButton type="submit" fullWidth loading={submitting}>
          Đăng ký
        </AppButton>

        <Text size="sm" c="dimmed" ta="center">
          Đã có tài khoản?{" "}
          <Anchor component={Link} href={ROUTES.dangNhap} fw={600} c="var(--color-brand)" underline="hover">
            Đăng nhập
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
