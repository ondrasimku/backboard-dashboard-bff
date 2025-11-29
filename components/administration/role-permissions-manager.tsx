"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X, Plus } from "lucide-react";
import type { Permission } from "@/lib/types/permission";
import type { Role } from "@/lib/types/role";

interface RolePermissionsManagerProps {
  role: Role;
  allPermissions: Permission[];
  onAddPermission: (permissionId: string) => Promise<void>;
  onRemovePermission: (permissionId: string) => Promise<void>;
}

export const RolePermissionsManager = ({
  role,
  allPermissions,
  onAddPermission,
  onRemovePermission,
}: RolePermissionsManagerProps) => {
  const t = useTranslations('administration.roles');
  const tPermissions = useTranslations('administration.roles.permissions');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // role.permissions contains permission names, not IDs
  const assignedPermissionNames = new Set(role.permissions);
  const availablePermissions = allPermissions.filter(
    (p) => !assignedPermissionNames.has(p.name) && 
           p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const assignedPermissions = allPermissions.filter(
    (p) => assignedPermissionNames.has(p.name)
  );

  const handleAddPermission = async (permissionId: string) => {
    setLoading(permissionId);
    try {
      await onAddPermission(permissionId);
    } finally {
      setLoading(null);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    setLoading(permissionId);
    try {
      await onRemovePermission(permissionId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">{tPermissions('title')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {tPermissions('description')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">{tPermissions('assigned')}</h4>
          {assignedPermissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tPermissions('noAssigned')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedPermissions.map((permission) => (
                <Badge
                  key={permission.id}
                  variant="default"
                  className="flex items-center gap-1"
                >
                  {permission.name}
                  <button
                    onClick={() => handleRemovePermission(permission.id)}
                    disabled={loading === permission.id}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">{tPermissions('available')}</h4>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tPermissions('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {availablePermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{tPermissions('noAvailable')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availablePermissions.map((permission) => (
                  <Badge
                    key={permission.id}
                    variant="outline"
                    className="flex items-center gap-1 cursor-pointer hover:bg-accent"
                    onClick={() => handleAddPermission(permission.id)}
                  >
                    <Plus className="h-3 w-3" />
                    {permission.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

