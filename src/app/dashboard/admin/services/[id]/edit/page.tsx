import { Suspense } from "react";
import ServiceForm from "@/components/dashboard/service-form";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

// Resolve params inside the Suspense boundary
async function EditServiceContent({ params }: EditServicePageProps) {
  const { id } = await params;

  return <ServiceForm id={id} />;
}

// Keep the page component synchronous
export default function EditServicePage({ params }: EditServicePageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading service...</p>
        </div>
      }
    >
      <EditServiceContent params={params} />
    </Suspense>
  );
}
