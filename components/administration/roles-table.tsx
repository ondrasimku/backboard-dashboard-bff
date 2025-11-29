"use client";

import { useTranslations } from 'next-intl';
import { useRouter } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Role } from "@/lib/types/role";

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

export const RolesTable = ({ roles, onEdit, onDelete }: RolesTableProps) => {
  const t = useTranslations('administration.roles');
  const tTable = useTranslations('administration.roles.table');
  const router = useRouter();

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRowClick = (roleId: string) => {
    router.push(`/administration/roles/${roleId}`);
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tTable('name')}</TableHead>
            <TableHead>{tTable('description')}</TableHead>
            <TableHead>{tTable('permissions')}</TableHead>
            <TableHead>{tTable('createdAt')}</TableHead>
            <TableHead className="text-right">{tTable('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {t('noResults')}
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow 
                key={role.id}
                onClick={() => handleRowClick(role.id)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">
                  {role.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {role.description || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.length > 0 ? (
                      role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(role.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

