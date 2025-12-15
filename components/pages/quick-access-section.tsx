'use client';

import { Folder, Page } from '@/lib/types/page';
import { useTranslations } from 'next-intl';
import { Folder as FolderIcon, FileText } from 'lucide-react';

interface QuickAccessSectionProps {
  folders: Folder[];
  pages: Page[];
  allFolders: Folder[];
  allPages: Page[];
  onPageClick: (pageId: string) => void;
  onFolderClick?: (folderId: string) => void;
}

export function QuickAccessSection({
  folders,
  pages,
  allFolders,
  allPages,
  onPageClick,
  onFolderClick,
}: QuickAccessSectionProps) {
  const t = useTranslations('pages.quickAccess');

  // Count items in a folder (direct pages + subfolders)
  const getItemCount = (folderId: string) => {
    const pagesInFolder = allPages.filter((p) => p.folderId === folderId).length;
    const subfoldersCount = allFolders.filter((f) => f.parentId === folderId).length;
    return pagesInFolder + subfoldersCount;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
      {/* Folders Section */}
      <div className="col-span-3 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t('folders')}</h3>
        <div className="space-y-2">
          {folders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No folders yet
            </p>
          ) : (
            folders.slice(0, 6).map((folder) => {
              const itemCount = getItemCount(folder.id);
              return (
                <button
                  key={folder.id}
                  onClick={() => onFolderClick?.(folder.id)}
                  className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <FolderIcon className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('itemsInFolder', { count: itemCount })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Root Pages Section */}
      <div className="col-span-4 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t('rootPages')}</h3>
        <div className="space-y-2">
          {pages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No root pages yet
            </p>
          ) : (
            pages.slice(0, 6).map((page) => (
              <button
                key={page.id}
                onClick={() => onPageClick(page.id)}
                className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {page.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
