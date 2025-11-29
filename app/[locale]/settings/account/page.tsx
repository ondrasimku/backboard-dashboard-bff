"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProfileForm } from "@/components/settings/profile-form";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types/user";

export default function AccountSettingsPage() {
  const t = useTranslations("settings.account");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/me");

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleProfileUpdate = () => {
    fetchUser();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error || "Failed to load user data"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{t("avatar.title") || "Profile Picture"}</h2>
            <p className="text-sm text-muted-foreground">
              {t("avatar.description") || "Upload and manage your profile picture"}
            </p>
          </div>
          <AvatarUpload user={user} onUpdate={handleProfileUpdate} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{t("profile.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("profile.description")}
              </p>
            </div>
            <ProfileForm user={user} onUpdate={handleProfileUpdate} />
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{t("password.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("password.description")}
              </p>
            </div>
            <ChangePasswordForm />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{t("accountInfo.title")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("profile.role")}
              </p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("profile.emailVerified")}
              </p>
              <Badge variant={user.emailVerified ? "default" : "destructive"}>
                {user.emailVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("accountInfo.createdAt")}
              </p>
              <p className="text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("accountInfo.updatedAt")}
              </p>
              <p className="text-sm">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

