"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
type Service = {
  _id: string;
  serviceName: string;
  category: string;
  image?: string;
  price: number;
  duration: number;
  status: "active" | "inactive";
};
async function request(path: string, init?: RequestInit) {
  const r = await apiFetch(path, init);
  const d = await r.json().catch(() => null);
  if (!r.ok || !d?.success) throw new Error(d?.message || "Request failed.");
  return d;
}
export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const d = await request("/api/services/manage/all", {
        cache: "no-store",
      });
      setServices(d.data || []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Unable to load services.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const visible = useMemo(
    () =>
      services.filter(
        (s) =>
          (status === "all" || s.status === status) &&
          [s.serviceName, s.category]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [services, status, search],
  );
  const statusAction = async (s: Service) => {
    setBusy(true);
    try {
      await request(`/api/services/manage/${s._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: s.status === "active" ? "inactive" : "active",
        }),
      });
      toast.success("Service updated.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update service.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await request(`/api/services/manage/${target._id}`, { method: "DELETE" });
      toast.success("Service deleted.");
      setTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete service.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Manage Services</h1>
          <p className="mt-1 text-muted-foreground">
            Control availability without compromising appointment history.
          </p>
        </div>
        <Link href="/dashboard/admin/services/new" className={buttonVariants()}>
          <Plus />
          Add Service
        </Link>
      </div>
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Services ({visible.length})</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services"
                className="pl-8"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border bg-background px-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No services match your filters.
            </p>
          ) : (
            <div className="space-y-3">
              {visible.map((s) => (
                <div
                  key={s._id}
                  className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      "✂"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{s.serviceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.category} · ${Number(s.price).toLocaleString()} ·{" "}
                      {s.duration} min
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {s.status}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/admin/services/${s._id}/edit`}
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                      })}
                    >
                      <Pencil />
                      Edit
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void statusAction(s)}
                    >
                      <Power />
                      {s.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => setTarget(s)}
                    >
                      <Trash2 />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {loadError}
        </div>
      )}
      <AlertDialog
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              “{target?.serviceName}” will be deleted only if it has no
              appointment history. Otherwise, deactivate it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep service</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void remove();
              }}
            >
              {busy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
