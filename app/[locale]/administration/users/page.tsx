"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { UsersTable } from "@/components/administration/users-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import type { UsersListResponse, UsersFilters } from "@/lib/types/user";

export default function UsersPage() {
  const t = useTranslations('administration.users');
  const tFilters = useTranslations('administration.users.filters');

  const [users, setUsers] = useState<UsersListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UsersFilters>({
    search: '',
    role: '',
    emailVerified: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = async (currentPage: number, currentFilters: UsersFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.role && { role: currentFilters.role }),
        ...(currentFilters.emailVerified && { emailVerified: currentFilters.emailVerified }),
      });

      const response = await fetch(`/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, filters);
  }, [page, filters]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput });
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tFilters('search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} size="default">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              {tFilters('role')}: {tFilters('allRoles')}
            </Button>
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              {tFilters('verified')}: {tFilters('allStatuses')}
            </Button>
          </div>
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
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {t('error')}: {error}
          </div>
        )}

        {!loading && !error && users && (
          <UsersTable
            users={users.data}
            meta={users.meta}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

