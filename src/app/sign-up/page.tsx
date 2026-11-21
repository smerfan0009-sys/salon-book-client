"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Mail, Lock, Image as ImageIcon, Link2, Upload, Loader2, Scissors } from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-fetch";
import { passwordValidationError, PASSWORD_RULES } from "@/lib/password";
import GoogleButton from "@/components/auth/google-button";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Already signed in? Send the user to their dashboard.
  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [session?.user, router]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setError(null);

    if (!selected) {
      setFile(null);
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Only JPG, PNG, WEBP or GIF images are allowed.");
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("Image is too large. Maximum size is 5 MB.");
      e.target.value = "";
      return;
    }

    setFile(selected);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const passwordError = passwordValidationError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (imageMode === "url" && imageUrl.trim()) {
      try {
        const parsed = new URL(imageUrl.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error();
        }
      } catch {
        setError("Please enter a valid http(s) image URL.");
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Create the account (sign-up always assigns the customer role server-side).
      const { error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        ...(imageMode === "url" && imageUrl.trim()
          ? { image: imageUrl.trim() }
          : {}),
      });

      if (signUpError) {
        const message =
          signUpError.message ?? "Could not create your account. Please try again.";
        setError(message);
        return;
      }

      // 2. If the user chose to upload an image, push it to ImgBB through
      //    the backend (the session cookie is already set by sign-up).
      if (imageMode === "upload" && file) {
        try {
          const form = new FormData();
          form.append("image", file);
          const res = await apiFetch("/api/upload", {
            method: "POST",
            body: form,
          });
          const body = await res.json().catch(() => null);
          if (res.ok && body?.url) {
            await authClient.updateUser({ image: body.url });
          } else {
            toast.warning(
              "Account created, but the profile image could not be uploaded. You can update it later."
            );
          }
        } catch {
          toast.warning(
            "Account created, but the profile image could not be uploaded. You can update it later."
          );
        }
      }

      toast.success("Account created successfully. Welcome to SalonBook!");

      // 3. /dashboard routes to the correct dashboard by role.
      router.push("/dashboard");
      router.refresh();
    } catch {
      const message = "Something went wrong while creating your account. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Scissors className="h-6 w-6 rotate-45" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Join SalonBook to book salon appointments.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  className="h-10 pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  className="h-10 pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-10 pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">{PASSWORD_RULES}</p>
            </div>

            {/* Profile image */}
            <div className="flex flex-col gap-1.5">
              <Label>Profile Image (optional)</Label>

              <div className="flex gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="imageMode"
                    checked={imageMode === "upload"}
                    onChange={() => setImageMode("upload")}
                    className="accent-primary"
                  />
                  <Upload className="size-4" /> Upload image
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="imageMode"
                    checked={imageMode === "url"}
                    onChange={() => setImageMode("url")}
                    className="accent-primary"
                  />
                  <Link2 className="size-4" /> Image URL
                </label>
              </div>

              {imageMode === "upload" ? (
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="relative size-16 overflow-hidden rounded-full border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={filePreview}
                        alt="Profile preview"
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
                      <ImageIcon className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {file ? "Change image" : "Choose image"}
                  </Button>
                </div>
              ) : (
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  className="h-10"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  autoComplete="off"
                />
              )}
            </div>

            <Button type="submit" className="h-10 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton label="Sign up with Google" />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
