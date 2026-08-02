import type { ReactNode } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RouteGuard } from "@/features/auth/components/RouteGuard";

export default function QuanTriLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <AdminLayout>{children}</AdminLayout>
    </RouteGuard>
  );
}
