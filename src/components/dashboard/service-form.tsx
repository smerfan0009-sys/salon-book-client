"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-fetch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type Form = {
  serviceName: string;
  slug: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  status: "active" | "inactive";
};

type ApiService = {
  _id: string;
  serviceName?: string | null;
  slug?: string | null;
  category?: string | null;
  description?: string | null;
  price?: number | string | null;
  duration?: number | string | null;
  image?: string | null;
  status?: string | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  url?: string;
};

// --------------------------------------------------
// DEFAULT FORM
// --------------------------------------------------

const blank: Form = {
  serviceName: "",
  slug: "",
  category: "",
  description: "",
  price: "",
  duration: "",
  image: "",
  status: "active",
};

// --------------------------------------------------
// API REQUEST
// --------------------------------------------------

async function request(path: string, init?: RequestInit): Promise<ApiResponse> {
  const response = await apiFetch(path, init);

  const data = (await response.json().catch(() => null)) as ApiResponse | null;

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function ServiceForm({ id }: { id?: string }) {
  const router = useRouter();

  const [form, setForm] = useState<Form>({ ...blank });

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ------------------------------------------------
  // LOAD SERVICE FOR EDITING
  // ------------------------------------------------

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadService = async () => {
      try {
        const data = await request("/api/services/manage/all");

        const services = Array.isArray(data.data)
          ? (data.data as ApiService[])
          : [];

        const service = services.find((item) => item._id === id);

        if (!service) {
          throw new Error("Service not found.");
        }

        if (cancelled) return;

        setForm({
          serviceName: service.serviceName || "",
          slug: service.slug || "",
          category: service.category || "",
          description: service.description || "",
          price: String(service.price ?? ""),
          duration: String(service.duration ?? ""),
          image: service.image || "",
          status: service.status === "inactive" ? "inactive" : "active",
        });
      } catch (error) {
        if (cancelled) return;

        toast.error(
          error instanceof Error ? error.message : "Unable to load service.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadService();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ------------------------------------------------
  // FORM FIELD UPDATE
  // ------------------------------------------------

  const updateField = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // ------------------------------------------------
  // IMAGE UPLOAD
  // ------------------------------------------------

  const upload = async (file?: File) => {
    if (!file) return;

    setUploading(true);

    try {
      const body = new FormData();

      body.append("image", file);

      const data = await request("/api/upload", {
        method: "POST",
        body,
      });

      if (!data.url) {
        throw new Error("Image URL was not returned.");
      }

      updateField("image", data.url);

      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ------------------------------------------------
  // FORM SUBMISSION
  // ------------------------------------------------

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(duration) || duration < 5 || duration > 1440) {
      toast.error("Duration must be between 5 and 1440 minutes.");
      return;
    }

    setSaving(true);

    try {
      await request(
        id ? `/api/services/manage/${id}` : "/api/services/manage",
        {
          method: id ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            price,
            duration,
          }),
        },
      );

      toast.success(id ? "Service updated." : "Service created.");

      router.push("/dashboard/admin/services");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save service.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  // ------------------------------------------------
  // FORM UI
  // ------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {id ? "Edit Service" : "Add Service"}
        </h1>

        <p className="mt-1 text-muted-foreground">
          Changes are validated on the server before they are saved.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-5">
            {/* SERVICE NAME */}

            <div>
              <Label htmlFor="serviceName">Service name</Label>

              <Input
                id="serviceName"
                value={form.serviceName}
                onChange={(e) => updateField("serviceName", e.target.value)}
                required
                maxLength={120}
                className="mt-1"
              />
            </div>

            {/* SLUG */}

            <div>
              <Label htmlFor="slug">Slug</Label>

              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="Generated from name when empty"
                className="mt-1"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <Label htmlFor="category">Category</Label>

              <Input
                id="category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                required
                maxLength={80}
                className="mt-1"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
                maxLength={2000}
                className="mt-1"
              />
            </div>

            {/* PRICE AND DURATION */}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (৳)</Label>

                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>

                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="1440"
                  step="1"
                  value={form.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* IMAGE */}

            <div>
              <Label htmlFor="image">Service image</Label>

              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
                disabled={uploading}
                className="mt-1"
              />

              {uploading && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading image...
                </div>
              )}

              {form.image && (
                <div className="mt-3">
                  <img
                    src={form.image}
                    alt="Service preview"
                    className="h-28 w-40 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            {/* STATUS */}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.status === "active"}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.checked ? "active" : "inactive",
                  )
                }
              />
              Active and bookable
            </label>

            {/* ACTION BUTTONS */}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving || uploading}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}

                {saving ? "Saving..." : "Save service"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/services")}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
