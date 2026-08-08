import { EditRentalPostView } from "@/features/rental-posts/components/EditRentalPostView";

export default async function SuaTinDangPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditRentalPostView postId={id} />;
}
