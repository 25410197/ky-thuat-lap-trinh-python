import { formatCurrencyCompactVnd } from "../utils/format";
import { ThongKeBarChart } from "./ThongKeBarChart";
import type { SoSanhKhuVucItem } from "../api/thong-ke.api";

interface RegionPricePerM2ChartProps {
  loading: boolean;
  data: SoSanhKhuVucItem[];
}

export function RegionPricePerM2Chart({ loading, data }: RegionPricePerM2ChartProps) {
  const chartData = data
    .filter((muc) => muc.giaTrenM2TrungBinh !== null)
    .map((muc) => ({
      khuVuc: muc.quanHuyen,
      giaTrenM2: Math.round(muc.giaTrenM2TrungBinh as number),
    }));

  return (
    <ThongKeBarChart
      data={chartData}
      xKey="khuVuc"
      yKey="giaTrenM2"
      loading={loading}
      color="var(--color-brand-muted)"
      tooltipLabel="Giá thuê TB/m²"
      valueFormatter={formatCurrencyCompactVnd}
      emptyMessage="Chưa có khu vực nào đủ dữ liệu để so sánh."
    />
  );
}
