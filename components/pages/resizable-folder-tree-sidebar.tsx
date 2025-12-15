'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FolderTree } from '@/components/pages/folder-tree';
import { Folder, Page } from '@/lib/types/page';
import { Skeleton } from '@/components/ui/skeleton';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_SIDEBAR_WIDTH = 256;

interface ResizableFolderTreeSidebarProps {
  folders: Folder[];
  pages: Page[];
  currentPageId?: string | null;
  isLoading: boolean;
  onAddPage: (folderId: string | null) => void;
  onAddFolder: (parentId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  onDeletePage: (pageId: string) => void;
  onRefresh: () => Promise<void>;
  storageKey?: string; // Unique key for localStorage to save width per page
  description?: string;
}

export const ResizableFolderTreeSidebar = ({
  folders,
  pages,
  currentPageId,
  isLoading,
  onAddPage,
  onAddFolder,
  onDeleteFolder,
  onDeletePage,
  onRefresh,
  storageKey = 'folderTreeSidebarWidth',
  description,
}: ResizableFolderTreeSidebarProps) => {
  const t = useTranslations('pages');
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(DEFAULT_SIDEBAR_WIDTH);

  // Load saved sidebar width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem(storageKey);
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(width);
      }
    }
  }, [storageKey]);

  // Handle resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const delta = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + delta;
      
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // Save to localStorage
        localStorage.setItem(storageKey, sidebarWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth, storageKey]);

  return (
    <div 
      ref={sidebarRef}
      className="flex-shrink-0 border-r bg-muted/30 flex flex-col overflow-hidden relative"
      style={{ 
        width: `${sidebarWidth}px`,
        cursor: isResizing ? 'col-resize' : 'default',
        userSelect: isResizing ? 'none' : 'auto',
      }}
    >
      <div className="p-4 pb-2">
        <p className="text-xs text-muted-foreground">
          {description || t('description')}
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
            currentPageId={currentPageId}
            onAddPage={onAddPage}
            onAddFolder={onAddFolder}
            onDeleteFolder={onDeleteFolder}
            onDeletePage={onDeletePage}
            onRefresh={onRefresh}
          />
        </div>
      )}

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-12 bg-border group-hover:bg-primary/70 rounded-l transition-colors" />
      </div>
    </div>
  );
};
