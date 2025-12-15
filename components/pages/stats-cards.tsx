'use client';

import { Folder, FileText, Trash2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface StatsCardsProps {
  totalFolders: number;
  totalPages: number;
  binCount: number;
}

export function StatsCards({ totalFolders, totalPages, binCount }: StatsCardsProps) {
  const router = useRouter();
  const t = useTranslations('pages.stats');

  const stats = [
    {
      id: 'folders',
      label: t('totalFolders'),
      value: totalFolders,
      icon: Folder,
      onClick: undefined,
    },
    {
      id: 'pages',
      label: t('totalPages'),
      value: totalPages,
      icon: FileText,
      onClick: undefined,
    },
    {
      id: 'bin',
      label: t('binItems'),
      value: binCount,
      icon: Trash2,
      onClick: () => router.push('/pages/bin'),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isClickable = !!stat.onClick;
        
        return (
          <div
            key={stat.id}
            className={`rounded-lg border bg-card p-6 shadow-sm ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
