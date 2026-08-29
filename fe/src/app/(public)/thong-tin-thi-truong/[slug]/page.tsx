import { NewsDetailView } from "@/features/tin-tuc/components/NewsDetailView";

export default async function ChiTietTinTucPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <NewsDetailView slug={slug} />;
}
