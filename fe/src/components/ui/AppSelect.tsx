"use client";

import { Select, type SelectProps } from "@mantine/core";

export type AppSelectProps = SelectProps;

export function AppSelect(props: AppSelectProps) {
  return <Select radius="sm" checkIconPosition="right" {...props} />;
}
