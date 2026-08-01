"use client";

import { Modal, Text, type ModalProps } from "@mantine/core";

export type AppModalProps = ModalProps;

export function AppModal({ title, children, ...props }: AppModalProps) {
  return (
    <Modal
      radius="md"
      overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
      title={
        title ? (
          <Text fw={700} fz="xl" c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            {title}
          </Text>
        ) : undefined
      }
      {...props}
    >
      {children}
    </Modal>
  );
}
