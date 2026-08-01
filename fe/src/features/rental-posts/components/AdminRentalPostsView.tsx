import { Text } from "@mantine/core";
import { AdminApprovalQueueTable } from "./AdminApprovalQueueTable";

export function AdminRentalPostsView() {
  return (
    <div>
      <Text
        component="h1"
        mb={24}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Quản lý tin đăng
      </Text>
      <AdminApprovalQueueTable />
    </div>
  );
}
