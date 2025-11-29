"use client";

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Permission } from "@/lib/types/permission";

interface PermissionsTableProps {
  permissions: Permission[];
}

export const PermissionsTable = ({ permissions }: PermissionsTableProps) => {
  const t = useTranslations('administration.permissions');
  const tTable = useTranslations('administration.permissions.table');

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tTable('name')}</TableHead>
            <TableHead>{tTable('description')}</TableHead>
            <TableHead>{tTable('createdAt')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                {t('noResults')}
              </TableCell>
            </TableRow>
          ) : (
            permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">
                  <Badge variant="secondary">{permission.name}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {permission.description || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(permission.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

