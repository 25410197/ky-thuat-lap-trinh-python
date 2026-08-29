import { formatCurrencyCompactVnd } from "../utils/format";
import { ChartCard } from "./ChartCard";
import { ThongKeBarChart } from "./ThongKeBarChart";
import type { ThongKeTheoLoai } from "../api/thong-ke.api";

interface PriceByPropertyTypeChartProps {
  loading: boolean;
  theoLoaiBatDongSan: ThongKeTheoLoai[];
}

export function PriceByPropertyTypeChart({ loading, theoLoaiBatDongSan }: PriceByPropertyTypeChartProps) {
  const data = theoLoaiBatDongSan.map((muc) => ({
    loai: muc.loaiBatDongSan,
    giaThueTrungBinh: Math.round(muc.giaThueTrungBinh),
  }));

  return (
    <ChartCard title="Giá thuê trung bình theo loại bất động sản" subtitle="Đơn vị: VNĐ/tháng, chỉ tính tin đã duyệt">
      <ThongKeBarChart
        data={data}
        xKey="loai"
        yKey="giaThueTrungBinh"
        loading={loading}
        color="var(--color-brand)"
        tooltipLabel="Giá thuê trung bình"
        valueFormatter={formatCurrencyCompactVnd}
      />
    </ChartCard>
  );
}
