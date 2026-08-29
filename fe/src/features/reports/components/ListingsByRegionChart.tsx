import { ChartCard } from "./ChartCard";
import { ThongKeBarChart } from "./ThongKeBarChart";
import type { ThongKeTheoTinhThanh } from "../api/thong-ke.api";

const SO_KHU_VUC_HIEN_THI = 10;

interface ListingsByRegionChartProps {
  loading: boolean;
  theoTinhThanh: ThongKeTheoTinhThanh[];
}

export function ListingsByRegionChart({ loading, theoTinhThanh }: ListingsByRegionChartProps) {
  const data = theoTinhThanh.slice(0, SO_KHU_VUC_HIEN_THI).map((muc) => ({
    khuVuc: muc.tinhThanh,
    soLuong: muc.soLuong,
  }));

  return (
    <ChartCard
      title="Số lượng tin đăng theo khu vực"
      subtitle={`Top ${SO_KHU_VUC_HIEN_THI} tỉnh/thành nhiều tin nhất`}
    >
      <ThongKeBarChart
        data={data}
        xKey="khuVuc"
        yKey="soLuong"
        loading={loading}
        color="var(--color-brand-muted)"
        tooltipLabel="Số lượng tin"
        valueFormatter={(value) => value.toLocaleString("vi-VN")}
      />
    </ChartCard>
  );
}
