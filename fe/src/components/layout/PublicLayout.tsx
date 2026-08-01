import type { ReactNode } from "react";
import { Box, Flex } from "@mantine/core";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" mih="100vh">
      <Header />
      <Box flex={1} component="main">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
