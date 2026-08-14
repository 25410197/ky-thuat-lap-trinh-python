import { AdminReportDetailView } from "@/features/bao-cao/components/AdminReportDetailView";
import { notFound } from "next/navigation";

export default async function QuanTriBaoCaoChiTietPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reportId = parseInt(id, 10);
  
  if (isNaN(reportId)) {
    notFound();
  }

  return <AdminReportDetailView id={reportId} />;
}
