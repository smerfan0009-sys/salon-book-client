"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
async function request(path: string, init?: RequestInit) {
  const r = await apiFetch(path, init);
  const d = await r.json().catch(() => null);
  if (!r.ok || !d?.success) throw new Error(d?.message || "Request failed.");
  return d;
}
export default function ServiceForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(blank);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const d = await request("/api/services/manage/all");
        const s = d.data.find((x: { _id: string }) => x._id === id);
        if (!s) throw new Error("Service not found.");
        setForm({
          serviceName: s.serviceName || "",
          slug: s.slug || "",
          category: s.category || "",
          description: s.description || "",
          price: String(s.price ?? ""),
          duration: String(s.duration ?? ""),
          image: s.image || "",
          status: s.status || "active",
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Unable to load service.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  const set = (key: keyof Form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const d = await request("/api/upload", { method: "POST", body });
      set("image", d.url);
      toast.success("Image uploaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await request(
        id ? `/api/services/manage/${id}` : "/api/services/manage",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            duration: Number(form.duration),
          }),
        },
      );
      toast.success(id ? "Service updated." : "Service created.");
      router.push("/dashboard/admin/services");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save service.");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
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
            <div>
              <Label htmlFor="serviceName">Service name</Label>
              <Input
                id="serviceName"
                value={form.serviceName}
                onChange={(e) => set("serviceName", e.target.value)}
                required
                maxLength={120}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="Generated from name when empty"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
                maxLength={80}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
                maxLength={2000}
                className="mt-1"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (৳)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
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
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image">Service image</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => void upload(e.target.files?.[0])}
                disabled={uploading}
                className="mt-1"
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="mt-3 h-28 w-40 rounded-lg object-cover"
                />
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.status === "active"}
                onChange={(e) =>
                  set("status", e.target.checked ? "active" : "inactive")
                }
              />{" "}
              Active and bookable
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || uploading}>
                {saving ? <Loader2 className="animate-spin" /> : null}
                {saving ? "Saving…" : "Save service"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/services")}
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
