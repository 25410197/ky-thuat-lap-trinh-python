"use client";

import { Center, Skeleton, Text } from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ThongKeBarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  loading?: boolean;
  emptyMessage?: string;
  tooltipLabel: string;
  valueFormatter?: (value: number) => string;
}

export function ThongKeBarChart({
  data,
  xKey,
  yKey,
  color = "var(--color-brand)",
  height = 280,
  loading = false,
  emptyMessage = "Chưa có dữ liệu.",
  tooltipLabel,
  valueFormatter,
}: ThongKeBarChartProps) {
  if (loading) {
    return <Skeleton height={height} radius="md" />;
  }

  if (data.length === 0) {
    return (
      <Center h={height}>
        <Text c="dimmed" size="sm">
          {emptyMessage}
        </Text>
      </Center>
    );
  }

  const format = valueFormatter ?? ((value: number) => String(value));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={56}
        />
        <YAxis
          tickFormatter={format}
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          width={64}
        />
        <Tooltip
          formatter={(value) => [format(Number(value)), tooltipLabel]}
          labelStyle={{ color: "var(--color-brand)", fontWeight: 600 }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            fontSize: 13,
          }}
        />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
