import { formatCurrencyCompactVnd } from "../utils/format";
import { ChartCard } from "./ChartCard";
import { ThongKeBarChart } from "./ThongKeBarChart";
import type { ThongKeTheoTinhThanh } from "../api/thong-ke.api";

const SO_KHU_VUC_HIEN_THI = 10;

interface PriceByRegionChartProps {
  loading: boolean;
  theoTinhThanh: ThongKeTheoTinhThanh[];
}

export function PriceByRegionChart({ loading, theoTinhThanh }: PriceByRegionChartProps) {
  const data = theoTinhThanh.slice(0, SO_KHU_VUC_HIEN_THI).map((muc) => ({
    khuVuc: muc.tinhThanh,
    giaThueTrungBinh: Math.round(muc.giaThueTrungBinh),
  }));

  return (
    <ChartCard
      title="Giá thuê trung bình theo khu vực"
      subtitle={`Top ${SO_KHU_VUC_HIEN_THI} tỉnh/thành nhiều tin nhất — đơn vị VNĐ/tháng`}
    >
      <ThongKeBarChart
        data={data}
        xKey="khuVuc"
        yKey="giaThueTrungBinh"
        loading={loading}
        color="var(--color-gold)"
        tooltipLabel="Giá thuê trung bình"
        valueFormatter={formatCurrencyCompactVnd}
      />
    </ChartCard>
  );
}
