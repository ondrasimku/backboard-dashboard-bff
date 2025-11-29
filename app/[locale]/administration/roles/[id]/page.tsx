"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { RolePermissionsManager } from "@/components/administration/role-permissions-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Role } from "@/lib/types/role";
import type { Permission } from "@/lib/types/permission";

export default function RoleDetailPage() {
  const t = useTranslations('administration.roles');
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roleResponse, permissionsResponse] = await Promise.all([
        fetch(`/api/admin/roles/${roleId}`),
        fetch('/api/admin/permissions'),
      ]);

      if (!roleResponse.ok) {
        throw new Error('Failed to fetch role');
      }

      if (!permissionsResponse.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const roleData = await roleResponse.json();
      const permissionsData = await permissionsResponse.json();

      setRole(roleData);
      setPermissions(permissionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) {
      fetchRole();
    }
  }, [roleId]);

  const handleAddPermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add permission');
      }

      await fetchRole();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add permission');
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}/permissions/${permissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove permission');
      }

      await fetchRole();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove permission');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-sm text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !role) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error || t('roleNotFound')}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/administration/roles')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToRoles')}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
          {role.description && (
            <p className="text-muted-foreground mt-2">{role.description}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <RolePermissionsManager
            role={role}
            allPermissions={permissions}
            onAddPermission={handleAddPermission}
            onRemovePermission={handleRemovePermission}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

