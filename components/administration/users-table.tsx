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
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { User } from "@/lib/types/user";

interface UsersTableProps {
  users: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export const UsersTable = ({ users, meta, onPageChange }: UsersTableProps) => {
  const t = useTranslations('administration.users');
  const tTable = useTranslations('administration.users.table');
  const tRoles = useTranslations('administration.users.roles');
  const tStatus = useTranslations('administration.users.status');
  const tPagination = useTranslations('administration.users.pagination');
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRowClick = (userId: string) => {
    router.push(`/administration/users/${userId}`);
  };

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tTable('name')}</TableHead>
              <TableHead>{tTable('email')}</TableHead>
              <TableHead>{tTable('role')}</TableHead>
              <TableHead>{tTable('emailVerified')}</TableHead>
              <TableHead>{tTable('createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user.id}
                  onClick={() => handleRowClick(user.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {tRoles(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                      {user.emailVerified ? tStatus('verified') : tStatus('unverified')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tPagination('showing', { from, to, total: meta.total })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {tPagination('previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {tPagination('page', { page: meta.page, totalPages: meta.totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
          >
            {tPagination('next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

