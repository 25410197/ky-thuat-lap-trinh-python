"use client";

import { MultiSelect, type MultiSelectProps } from "@mantine/core";

export type AppMultiSelectProps = MultiSelectProps;

export function AppMultiSelect(props: AppMultiSelectProps) {
  return <MultiSelect radius="sm" checkIconPosition="right" {...props} />;
}
