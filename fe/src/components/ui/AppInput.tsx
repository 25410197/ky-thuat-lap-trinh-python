"use client";

import { TextInput, type TextInputProps } from "@mantine/core";

export type AppInputProps = TextInputProps;

export function AppInput(props: AppInputProps) {
  return <TextInput radius="sm" {...props} />;
}
