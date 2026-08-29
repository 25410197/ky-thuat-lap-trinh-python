import { ChartCard } from "./ChartCard";
import { ThongKeBarChart } from "./ThongKeBarChart";
import type { ThongKePhanBoGia } from "../api/thong-ke.api";

interface PriceDistributionChartProps {
  loading: boolean;
  phanBoGia: ThongKePhanBoGia[];
}

export function PriceDistributionChart({ loading, phanBoGia }: PriceDistributionChartProps) {
  const data = phanBoGia.map((khoang) => ({
    khoangGia: khoang.khoangGia,
    soLuong: khoang.soLuong,
  }));

  return (
    <ChartCard title="Phân bố giá thuê" subtitle="Số lượng tin đăng theo từng khoảng giá (VNĐ/tháng)">
      <ThongKeBarChart
        data={data}
        xKey="khoangGia"
        yKey="soLuong"
        loading={loading}
        color="var(--color-brand)"
        tooltipLabel="Số lượng tin"
        valueFormatter={(value) => value.toLocaleString("vi-VN")}
      />
    </ChartCard>
  );
}
