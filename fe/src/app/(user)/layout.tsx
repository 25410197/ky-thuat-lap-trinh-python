import type { ReactNode } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { RouteGuard } from "@/features/auth/components/RouteGuard";

export default function UserRouteLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <UserLayout>{children}</UserLayout>
    </RouteGuard>
  );
}
