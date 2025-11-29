"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User as UserIcon, Mail, Shield, Calendar, CheckCircle2, XCircle } from "lucide-react";
import type { User } from "@/lib/types/user";

export default function UserDetailPage() {
  const t = useTranslations('administration.users.detail');
  const tRoles = useTranslations('administration.users.roles');
  const tStatus = useTranslations('administration.users.status');
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`);
        
        if (response.status === 404) {
          setError(t('notFound'));
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error'));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
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
                <div className="flex gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {tRoles(user.role)}
                  </Badge>
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
                        {t('fields.role')}
                      </dt>
                      <dd className="text-sm mt-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {tRoles(user.role)}
                        </Badge>
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

