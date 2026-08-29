import { AdminNewsFormView } from "@/features/tin-tuc/components/AdminNewsFormView";

export default async function QuanTriTinTucSuaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminNewsFormView id={Number(id)} />;
}
