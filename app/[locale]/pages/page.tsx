'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ResizableFolderTreeSidebar } from '@/components/pages/resizable-folder-tree-sidebar';
import { CreateFolderDialog } from '@/components/pages/create-folder-dialog';
import { CreatePageDialog } from '@/components/pages/create-page-dialog';
import { StatsCards } from '@/components/pages/stats-cards';
import { QuickAccessSection } from '@/components/pages/quick-access-section';
import { Page, Folder, BinItem } from '@/lib/types/page';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function PagesPage() {
  const t = useTranslations('pages');
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [binItems, setBinItems] = useState<BinItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pagesRes, foldersRes, binRes] = await Promise.all([
        fetch('/api/pages'),
        fetch('/api/folders'),
        fetch('/api/bin'),
      ]);

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData);
      }

      if (binRes.ok) {
        const binData = await binRes.json();
        setBinItems(binData);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPage = (folderId: string | null) => {
    setTargetFolderId(folderId);
    setShowCreatePage(true);
  };

  const handleAddFolder = (parentId: string | null) => {
    setTargetParentId(parentId);
    setShowCreateFolder(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      toast.success('Folder moved to bin');
      await loadData();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      toast.success('Page moved to bin');
      await loadData();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Computed values
  const totalFolders = folders.length;
  const totalPages = pages.length;
  const binCount = binItems.length;
  
  const rootFolders = folders.filter((f) => f.parentId === null).slice(0, 6);
  const rootPages = pages.filter((p) => p.folderId === null).slice(0, 6);
  
  // Get recent pages (last 5 updated)
  const recentPages = [...pages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Sidebar with folder tree */}
        <ResizableFolderTreeSidebar
          folders={folders}
          pages={pages}
          isLoading={isLoading}
          onAddPage={handleAddPage}
          onAddFolder={handleAddFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeletePage={handleDeletePage}
          onRefresh={loadData}
          storageKey="pagesSidebarWidth"
          description={t('description')}
        />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4 w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-3">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-20 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : pages.length === 0 && folders.length === 0 ? (
            <div className="p-8">
              <div className="max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                  <p className="text-muted-foreground">
                    {t('description')}
                  </p>
                </div>

                <StatsCards
                  totalFolders={totalFolders}
                  totalPages={totalPages}
                  binCount={binCount}
                />
              </div>
              <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('noPages')}</h2>
                  <p className="text-muted-foreground">
                    {t('createFirst')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                  <p className="text-muted-foreground">
                    {t('description')}
                  </p>
                </div>

                {/* Statistics Cards */}
                <StatsCards
                  totalFolders={totalFolders}
                  totalPages={totalPages}
                  binCount={binCount}
                />

                {/* Quick Access Section */}
                <QuickAccessSection
                  folders={rootFolders}
                  pages={rootPages}
                  allFolders={folders}
                  allPages={pages}
                  onPageClick={(pageId) => router.push(`/pages/${pageId}`)}
                  onFolderClick={(folderId) => {
                    // For now, just scroll to folder in sidebar
                    // In future, could open folder view
                    console.log('Folder clicked:', folderId);
                  }}
                />

                {/* Recent Pages Section */}
                {recentPages.length > 0 && (
                  <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                      {t('recentPages.title')}
                    </h3>
                    <div className="space-y-4">
                      {recentPages.map((page) => {
                        const getRelativeTime = (date: Date | string): string => {
                          const now = new Date();
                          const past = new Date(date);
                          const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

                          if (diffInSeconds < 60) return 'just now';
                          if (diffInSeconds < 3600) {
                            const minutes = Math.floor(diffInSeconds / 60);
                            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
                          }
                          if (diffInSeconds < 86400) {
                            const hours = Math.floor(diffInSeconds / 3600);
                            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                          }
                          if (diffInSeconds < 2592000) {
                            const days = Math.floor(diffInSeconds / 86400);
                            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
                          }
                          const months = Math.floor(diffInSeconds / 2592000);
                          return `${months} ${months === 1 ? 'month' : 'months'} ago`;
                        };

                        return (
                          <div
                            key={page.id}
                            onClick={() => router.push(`/pages/${page.id}`)}
                            className="flex items-start space-x-4 cursor-pointer hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{page.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {page.folder ? page.folder.name : 'Root'} {page.isPublished && '· Published'}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">{getRelativeTime(page.updatedAt)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        folders={folders}
        onSuccess={loadData}
        preselectedParentId={targetParentId}
      />
      <CreatePageDialog
        open={showCreatePage}
        onOpenChange={setShowCreatePage}
        folders={folders}
        onSuccess={loadData}
        preselectedFolderId={targetFolderId}
      />
    </DashboardLayout>
  );
}
