"use client";

import { Avatar, Group, Text, Button, Box, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";

interface RecentUser {
  initials: string;
  name: string;
  email: string;
  role: string;
  registeredAgo: string;
}

// Dữ liệu lấy đúng từ Figma (khối "Đăng ký mới", màn "Quản trị hệ thống").
const RECENT_USERS: RecentUser[] = [
  {
    initials: "AK",
    name: "Alex Kova",
    email: "alex.k@domain.com",
    role: "Quản lý tài sản",
    registeredAgo: "2 phút trước",
  },
  {
    initials: "LM",
    name: "Lydia Mayer",
    email: "l.mayer@web.net",
    role: "Chủ sở hữu cá nhân",
    registeredAgo: "15 phút trước",
  },
];

export function RecentRegistrations() {
  const handleVerify = (user: RecentUser) => {
    notifications.show({
      color: "green",
      title: "Đã xác minh người dùng (demo)",
      message: user.name,
    });
  };

  return (
    <Box
      p={24}
      bg="var(--color-surface)"
      style={{
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
    >
      <Group justify="space-between" mb={16}>
        <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
          Đăng ký mới
        </Text>
        <Text fz="sm" fw={600} c="var(--color-brand-muted)">
          Xem tất cả người dùng
        </Text>
      </Group>
      <Stack gap={12}>
        {RECENT_USERS.map((user) => (
          <Group
            key={user.email}
            justify="space-between"
            p={16}
            style={{ borderRadius: "var(--radius-btn)", border: "1px solid var(--color-border)" }}
          >
            <Group gap={12}>
              <Avatar color="brand" radius="xl">
                {user.initials}
              </Avatar>
              <div>
                <Text fw={700} c="var(--color-brand)">
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {user.email} • {user.role}
                </Text>
              </div>
            </Group>
            <Group gap={12}>
              <Text size="xs" c="dimmed">
                {user.registeredAgo}
              </Text>
              <Button size="xs" variant="light" color="brand" onClick={() => handleVerify(user)}>
                Xác minh người dùng
              </Button>
            </Group>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}
