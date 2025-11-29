"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { RolesTable } from "@/components/administration/roles-table";
import { RoleForm } from "@/components/administration/role-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Role, CreateRoleRequest, UpdateRoleRequest } from "@/lib/types/role";

export default function RolesPage() {
  const t = useTranslations('administration.roles');

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/roles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async (data: CreateRoleRequest) => {
    const response = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create role');
    }

    await fetchRoles();
  };

  const handleUpdate = async (data: UpdateRoleRequest) => {
    if (!editingRole) return;

    const response = await fetch(`/api/admin/roles/${editingRole.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update role');
    }

    await fetchRoles();
    setEditingRole(null);
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      setDeletingRoleId(roleId);
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      await fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setDeletingRoleId(null);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    if (editingRole) {
      await handleUpdate(data as UpdateRoleRequest);
    } else {
      await handleCreate(data as CreateRoleRequest);
    }
    setFormOpen(false);
    setEditingRole(null);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
          <Button onClick={() => {
            setEditingRole(null);
            setFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('createRole')}
          </Button>
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
          <RolesTable
            roles={roles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <RoleForm
          open={formOpen}
          onOpenChange={setFormOpen}
          role={editingRole}
          onSubmit={handleFormSubmit}
        />
      </div>
    </DashboardLayout>
  );
}

