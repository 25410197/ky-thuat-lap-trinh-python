"use client";

import { Text, Tabs, Badge } from "@mantine/core";
import { IconClipboardList, IconLock } from "@tabler/icons-react";
import { AdminApprovalQueueTable } from "./AdminApprovalQueueTable";
import { AdminLockedPostsTable } from "./AdminLockedPostsTable";

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

      <Tabs defaultValue="cho-duyet" keepMounted={false}>
        <Tabs.List mb={24}>
          <Tabs.Tab
            value="cho-duyet"
            leftSection={<IconClipboardList size={16} stroke={1.75} />}
          >
            Chờ duyệt
          </Tabs.Tab>
          <Tabs.Tab
            value="bi-khoa"
            leftSection={<IconLock size={16} stroke={1.75} />}
            rightSection={
              <Badge size="xs" variant="filled" color="red" circle>
                &nbsp;
              </Badge>
            }
          >
            Bị khóa
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="cho-duyet">
          <AdminApprovalQueueTable />
        </Tabs.Panel>

        <Tabs.Panel value="bi-khoa">
          <AdminLockedPostsTable />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
