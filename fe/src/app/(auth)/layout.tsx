"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Flex, Box, Text } from "@mantine/core";
import { ROUTES } from "@/constants/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={32}
      mih="100vh"
      px={16}
      py={48}
      bg="var(--color-cream)"
    >
      <Text
        component={Link}
        href={ROUTES.home}
        fw={700}
        fz="xl"
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        UrbanLease
      </Text>
      <Box
        w="100%"
        maw={448}
        p={32}
        bg="var(--color-surface)"
        style={{
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
        }}
      >
        {children}
      </Box>
    </Flex>
  );
}
