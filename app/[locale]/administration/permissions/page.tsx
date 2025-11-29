"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PermissionsTable } from "@/components/administration/permissions-table";
import type { Permission } from "@/lib/types/permission";

export default function PermissionsPage() {
  const t = useTranslations('administration.permissions');

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/permissions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-sm text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive mb-4">
            {t('error')}: {error}
          </div>
        )}

        {!loading && !error && (
          <PermissionsTable permissions={permissions} />
        )}
      </div>
    </DashboardLayout>
  );
}

