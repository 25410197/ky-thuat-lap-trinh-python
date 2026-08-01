"use client";

import Link from "next/link";
import { Group, Text } from "@mantine/core";
import { AppButton } from "@/components/ui/AppButton";
import { ROUTES } from "@/constants/routes";
import { MyListingsTable } from "./MyListingsTable";

export function MyListingsView() {
  return (
    <div>
      <Group justify="space-between" mb={24}>
        <Text
          component="h1"
          fz={30}
          fw={700}
          c="var(--color-brand)"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Tin đăng của tôi
        </Text>
        <AppButton component={Link} href={ROUTES.dangTin} size="sm">
          Đăng tin mới
        </AppButton>
      </Group>
      <MyListingsTable />
    </div>
  );
}
