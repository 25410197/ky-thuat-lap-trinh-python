"use client";

import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { AppButton } from "@/components/ui/AppButton";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <EmptyState
      title="Không tìm thấy trang"
      description="Trang bạn tìm không tồn tại hoặc đã bị xoá."
      action={
        <AppButton component={Link} href={ROUTES.home} size="sm">
          Về trang chủ
        </AppButton>
      }
    />
  );
}
