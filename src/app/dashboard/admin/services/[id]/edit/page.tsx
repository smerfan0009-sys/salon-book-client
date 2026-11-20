import ServiceForm from "@/components/dashboard/service-form";
export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceForm id={id} />;
}
