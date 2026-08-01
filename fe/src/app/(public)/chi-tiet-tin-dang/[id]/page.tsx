import { RentalPostDetailView } from "@/features/rental-posts/components/RentalPostDetailView";

export default async function ChiTietTinDangPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RentalPostDetailView id={id} />;
}
