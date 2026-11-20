"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Loader2, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Profile = {
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string | null;
};
async function json(path: string, init?: RequestInit) {
  const response = await apiFetch(path, init);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success)
    throw new Error(data?.message || "Request failed.");
  return data;
}
export default function ProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const load = async () => {
    try {
      const result = await json("/api/profile", { cache: "no-store" });
      setProfile(result.data);
      setName(result.data.name);
      setImage(result.data.image || "");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load profile.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const result = await json("/api/upload", { method: "POST", body: form });
      setImage(result.url);
      toast.success("Image uploaded. Save your profile to apply it.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await json("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      setProfile(result.data);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading profile…
      </div>
    );
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Update the details associated with your account.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
          <CardDescription>
            Your email and role are managed securely and cannot be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-5">
            <div className="flex items-center gap-4">
              {image ? (
                <img
                  src={image}
                  alt="Profile"
                  className="size-16 rounded-full border object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <UserRound />
                </div>
              )}
              <div>
                <Label htmlFor="profile-image">Profile image</Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploading}
                  onChange={(event) => void upload(event.target.files?.[0])}
                  className="mt-1"
                />
                {uploading && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Uploading image…
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled className="mt-1" />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={profile?.role || "customer"}
                disabled
                className="mt-1 capitalize"
              />
            </div>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? <Loader2 className="animate-spin" /> : <Upload />}{" "}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
