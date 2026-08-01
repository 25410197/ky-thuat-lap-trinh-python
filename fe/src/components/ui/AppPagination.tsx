"use client";

import { Pagination, type PaginationProps } from "@mantine/core";

export type AppPaginationProps = PaginationProps;

export function AppPagination(props: AppPaginationProps) {
  return <Pagination color="brand" radius="sm" {...props} />;
}
