import type { ReactNode } from "react";
import { Box, Flex } from "@mantine/core";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function UserLayout({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" mih="100vh">
      <Header />
      <Box component="main" flex={1} w="100%" maw={1024} mx="auto" px={32} py={40}>
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
