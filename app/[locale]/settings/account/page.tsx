"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProfileHeader } from "@/components/settings/profile-header";
import { ProfileContent } from "@/components/settings/profile-content";
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
      <div className="container mx-auto space-y-6 px-4 py-10">
        <ProfileHeader user={user} onUpdate={handleProfileUpdate} />
        <ProfileContent user={user} onUpdate={handleProfileUpdate} />
      </div>
    </DashboardLayout>
  );
}

