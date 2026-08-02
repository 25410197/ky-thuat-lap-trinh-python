"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/hooks/useAuth";
import { canAccessRoute } from "@/lib/auth/permissions";
import { ROUTES } from "@/constants/routes";

export function RouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const daBaoLoi = useRef(false);

  const duocPhep = isAuthenticated && Boolean(user) && canAccessRoute(pathname, user!.role);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.dangNhap);
      return;
    }

    if (!duocPhep && !daBaoLoi.current) {
      daBaoLoi.current = true;
      notifications.show({
        color: "red",
        title: "Không có quyền truy cập",
        message: "Tài khoản của bạn không đủ quyền để xem trang này.",
      });
      router.replace(ROUTES.home);
    }
  }, [isLoading, isAuthenticated, duocPhep, router]);

  if (isLoading || !duocPhep) {
    return (
      <Center mih="60vh">
        <Loader color="brand" />
      </Center>
    );
  }

  return <>{children}</>;
}
