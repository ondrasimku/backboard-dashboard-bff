"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Role, CreateRoleRequest, UpdateRoleRequest } from "@/lib/types/role";

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
}

export const RoleForm = ({ open, onOpenChange, role, onSubmit }: RoleFormProps) => {
  const t = useTranslations('administration.roles');
  const tForm = useTranslations('administration.roles.form');
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
    } else {
      setName("");
      setDescription("");
    }
    setError(null);
  }, [role, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role) {
        await onSubmit({ name, description: description || undefined } as UpdateRoleRequest);
      } else {
        await onSubmit({ name, description: description || undefined } as CreateRoleRequest);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : tForm('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {role ? tForm('editTitle') : tForm('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {role ? tForm('editDescription') : tForm('createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {tForm('name')}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={tForm('namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                {tForm('description')}
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={tForm('descriptionPlaceholder')}
              />
            </div>
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tForm('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? tForm('saving') : (role ? tForm('update') : tForm('create'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

