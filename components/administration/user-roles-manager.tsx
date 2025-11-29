"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { Role } from "@/lib/types/role";
import type { User } from "@/lib/types/user";

interface UserRolesManagerProps {
  user: User;
  allRoles: Role[];
  userRoles: Role[];
  onAddRole: (roleId: string) => Promise<void>;
  onRemoveRole: (roleId: string) => Promise<void>;
}

export const UserRolesManager = ({
  user,
  allRoles,
  userRoles,
  onAddRole,
  onRemoveRole,
}: UserRolesManagerProps) => {
  const t = useTranslations('administration.users');
  const tRoles = useTranslations('administration.users.detail.roles');
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  const assignedRoleIds = new Set(userRoles.map(r => r.id));
  const availableRoles = allRoles.filter(r => !assignedRoleIds.has(r.id));

  const handleAddRole = async () => {
    if (!selectedRoleId) return;
    setLoading(selectedRoleId);
    try {
      await onAddRole(selectedRoleId);
      setSelectedRoleId("");
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(roleId);
    try {
      await onRemoveRole(roleId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">{tRoles('title')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {tRoles('description')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">{tRoles('assigned')}</h4>
          {userRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tRoles('noAssigned')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role) => (
                <Badge
                  key={role.id}
                  variant="default"
                  className="flex items-center gap-1"
                >
                  {role.name}
                  <button
                    onClick={() => handleRemoveRole(role.id)}
                    disabled={loading === role.id}
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
          <h4 className="text-sm font-medium mb-2">{tRoles('addRole')}</h4>
          <div className="flex gap-2">
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={tRoles('selectRole')} />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddRole}
              disabled={!selectedRoleId || loading !== null}
            >
              <Plus className="h-4 w-4 mr-1" />
              {tRoles('add')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

