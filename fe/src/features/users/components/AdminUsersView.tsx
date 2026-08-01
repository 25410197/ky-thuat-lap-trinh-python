import { Text } from "@mantine/core";
import { RecentRegistrations } from "./RecentRegistrations";

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
        Figma chỉ thiết kế khối "Đăng ký mới" cho màn quản trị — bảng danh sách đầy đủ người dùng
        sẽ được thiết kế và nối API ở ticket tiếp theo.
      </Text>
      <RecentRegistrations />
    </div>
  );
}
