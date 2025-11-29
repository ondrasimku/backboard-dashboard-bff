"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { UserRolesManager } from "@/components/administration/user-roles-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User as UserIcon, Mail, Shield, Calendar, CheckCircle2, XCircle } from "lucide-react";
import type { User } from "@/lib/types/user";
import type { Role } from "@/lib/types/role";

export default function UserDetailPage() {
  const t = useTranslations('administration.users.detail');
  const tRoles = useTranslations('administration.users.roles');
  const tStatus = useTranslations('administration.users.status');
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userResponse, rolesResponse, userRolesResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch('/api/admin/roles'),
          fetch(`/api/admin/users/${userId}/roles`),
        ]);
        
        if (userResponse.status === 404) {
          setError(t('notFound'));
          setLoading(false);
          return;
        }

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user');
        }

        if (!rolesResponse.ok) {
          throw new Error('Failed to fetch roles');
        }

        if (!userRolesResponse.ok) {
          throw new Error('Failed to fetch user roles');
        }

        const userData = await userResponse.json();
        const rolesData = await rolesResponse.json();
        const userRolesData = await userRolesResponse.json();
        
        setUser(userData);
        setAllRoles(rolesData);
        setUserRoles(userRolesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error'));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, t]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleBack = () => {
    router.push('/administration/users');
  };

  const handleAddRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign role');
      }

      // Refresh user roles
      const rolesResponse = await fetch(`/api/admin/users/${userId}/roles`);
      if (rolesResponse.ok) {
        const updatedRoles = await rolesResponse.json();
        setUserRoles(updatedRoles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove role');
      }

      // Refresh user roles
      const rolesResponse = await fetch(`/api/admin/users/${userId}/roles`);
      if (rolesResponse.ok) {
        const updatedRoles = await rolesResponse.json();
        setUserRoles(updatedRoles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove role');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToUsers')}
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
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
            {error}
          </div>
        )}

        {!loading && !error && user && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role.id} variant="default">
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">No roles</Badge>
                  )}
                  <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                    {user.emailVerified ? tStatus('verified') : tStatus('unverified')}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    {t('personalInfo')}
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('fields.firstName')}
                      </dt>
                      <dd className="text-sm mt-1">{user.firstName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('fields.lastName')}
                      </dt>
                      <dd className="text-sm mt-1">{user.lastName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('fields.email')}
                      </dt>
                      <dd className="text-sm mt-1">{user.email}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('accountInfo')}
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('fields.id')}
                      </dt>
                      <dd className="text-sm mt-1 font-mono text-xs">{user.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('fields.roles')}
                      </dt>
                      <dd className="text-sm mt-1">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role.id} variant="default">
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary">No roles</Badge>
                          )}
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('fields.emailVerified')}
                      </dt>
                      <dd className="text-sm mt-1 flex items-center gap-2">
                        {user.emailVerified ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{tStatus('verified')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-yellow-500" />
                            <span>{tStatus('unverified')}</span>
                          </>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t('fields.createdAt')}
                      </dt>
                      <dd className="text-sm mt-1">{formatDate(user.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t('fields.updatedAt')}
                      </dt>
                      <dd className="text-sm mt-1">{formatDate(user.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <UserRolesManager
                user={user}
                allRoles={allRoles}
                userRoles={userRoles}
                onAddRole={handleAddRole}
                onRemoveRole={handleRemoveRole}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

