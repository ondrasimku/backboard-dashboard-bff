'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { FolderTree } from '@/components/pages/folder-tree';
import { CreateFolderDialog } from '@/components/pages/create-folder-dialog';
import { CreatePageDialog } from '@/components/pages/create-page-dialog';
import { Page, Folder } from '@/lib/types/page';
import { FileText, Clock, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PagesPage() {
  const t = useTranslations('pages');
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pagesRes, foldersRes] = await Promise.all([
        fetch('/api/pages'),
        fetch('/api/folders'),
      ]);

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData);
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

  // Get recent pages (last 10 updated)
  const recentPages = [...pages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Sidebar with folder tree */}
        <div className="w-64 flex-shrink-0 border-r bg-muted/30 flex flex-col overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-xs text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {isLoading ? (
            <div className="px-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <FolderTree
                folders={folders}
                pages={pages}
                onAddPage={handleAddPage}
                onAddFolder={handleAddFolder}
                onDeleteFolder={handleDeleteFolder}
                onDeletePage={handleDeletePage}
                onRefresh={loadData}
              />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full max-w-2xl p-8">
                <Skeleton className="h-8 w-1/3 mb-8" />
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">{t('noPages')}</h2>
                <p className="text-muted-foreground">
                  {t('createFirst')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <h1 className="text-3xl font-bold tracking-tight mb-6">
                Recent Pages
              </h1>
              <div className="space-y-4 max-w-3xl">
                {recentPages.map((page) => (
                  <Card
                    key={page.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/pages/${page.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {page.title}
                            </h3>
                            {page.isPublished && (
                              <Badge variant="secondary" className="gap-1">
                                <Globe className="h-3 w-3" />
                                Published
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(page.updatedAt)}
                            </div>
                            {page.folder && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {page.folder.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
