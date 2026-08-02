"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/lib/mantine/theme";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <AuthProvider>{children}</AuthProvider>
    </MantineProvider>
  );
}
