import { Text } from "@mantine/core";
import { AdminUsersTable } from "./AdminUsersTable";

export function AdminUsersView() {
  return (
    <div>
      <Text
        component="h1"
        mb={8}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Quản lý người dùng
      </Text>
      <Text mb={24} fz="sm" c="var(--color-text-muted)">
        Xem, tìm kiếm và quản lý trạng thái tài khoản người dùng trên hệ thống.
      </Text>
      <AdminUsersTable />
    </div>
  );
}
