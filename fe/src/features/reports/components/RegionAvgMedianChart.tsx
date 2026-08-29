"use client";

import { Center, Skeleton, Text } from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyCompactVnd } from "../utils/format";
import type { SoSanhKhuVucItem } from "../api/thong-ke.api";

interface RegionAvgMedianChartProps {
  loading: boolean;
  data: SoSanhKhuVucItem[];
}

export function RegionAvgMedianChart({ loading, data }: RegionAvgMedianChartProps) {
  const chartData = data
    .filter((muc) => muc.giaThueTrungBinh !== null && muc.giaThueTrungVi !== null)
    .map((muc) => ({
      khuVuc: muc.quanHuyen,
      "Giá trung bình": Math.round(muc.giaThueTrungBinh as number),
      "Giá trung vị": Math.round(muc.giaThueTrungVi as number),
    }));

  if (loading) {
    return <Skeleton height={280} radius="md" />;
  }

  if (chartData.length === 0) {
    return (
      <Center h={280}>
        <Text c="dimmed" size="sm">
          Chưa có khu vực nào đủ dữ liệu để so sánh.
        </Text>
      </Center>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="khuVuc"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={56}
        />
        <YAxis
          tickFormatter={formatCurrencyCompactVnd}
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          width={64}
        />
        <Tooltip
          formatter={(value) => formatCurrencyCompactVnd(Number(value))}
          labelStyle={{ color: "var(--color-brand)", fontWeight: 600 }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Giá trung bình" fill="var(--color-brand)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        <Bar dataKey="Giá trung vị" fill="var(--color-gold)" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
