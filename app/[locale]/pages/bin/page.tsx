'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree } from '@/components/pages/folder-tree';
import { CreateFolderDialog } from '@/components/pages/create-folder-dialog';
import { CreatePageDialog } from '@/components/pages/create-page-dialog';
import { BinItem, Page, Folder } from '@/lib/types/page';
import { FolderIcon, FileText, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BinPage() {
  const t = useTranslations('pages.bin');
  const router = useRouter();
  const [binItems, setBinItems] = useState<BinItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmptyDialog, setShowEmptyDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [binRes, pagesRes, foldersRes] = await Promise.all([
        fetch('/api/bin'),
        fetch('/api/pages'),
        fetch('/api/folders'),
      ]);

      if (binRes.ok) {
        const binData = await binRes.json();
        setBinItems(binData);
      } else {
        toast.error('Failed to load bin items');
      }

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
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

  const handleRestore = async (id: string) => {
    setIsRestoring(id);
    try {
      const response = await fetch(`/api/bin/${id}/restore`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to restore item');
      }

      toast.success('Item restored successfully');
      await loadData();
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Failed to restore item');
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/bin/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      toast.success('Item permanently deleted');
      await loadData();
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEmptyBin = async () => {
    try {
      const response = await fetch('/api/bin', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to empty bin');
      }

      const data = await response.json();
      toast.success(`Bin emptied: ${data.itemsDeleted} items deleted`);
      await loadData();
      setShowEmptyDialog(false);
    } catch (error) {
      console.error('Error emptying bin:', error);
      toast.error('Failed to empty bin');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getItemTitle = (item: BinItem) => {
    if (item.itemType === 'page') {
      return item.itemData.page?.title || 'Untitled Page';
    } else {
      return item.itemData.folder?.name || 'Untitled Folder';
    }
  };

  const getItemDescription = (item: BinItem) => {
    if (item.itemType === 'folder') {
      const pagesCount = item.itemData.pages?.length || 0;
      const subfoldersCount = item.itemData.subfolders?.length || 0;
      const parts = [];
      if (pagesCount > 0) parts.push(`${pagesCount} page${pagesCount !== 1 ? 's' : ''}`);
      if (subfoldersCount > 0) parts.push(`${subfoldersCount} subfolder${subfoldersCount !== 1 ? 's' : ''}`);
      return parts.length > 0 ? parts.join(', ') : 'Empty folder';
    }
    return null;
  };

  // Group items by type
  const binFolders = binItems.filter(item => item.itemType === 'folder');
  const binPages = binItems.filter(item => item.itemType === 'page');

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Sidebar with folder tree */}
        <div className="w-64 flex-shrink-0 border-r bg-muted/30 flex flex-col overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-xs text-muted-foreground">
              Navigate your pages and folders
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
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Bin</h1>
                <p className="text-muted-foreground mt-1">
                  Deleted items are kept here. You can restore them or delete permanently.
                </p>
              </div>
              {binItems.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowEmptyDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Empty Bin
                </Button>
              )}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="space-y-4 max-w-3xl">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : binItems.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Bin is empty</h2>
                  <p className="text-muted-foreground">
                    Deleted pages and folders will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-3xl">
                {/* Folders Section */}
                {binFolders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FolderIcon className="h-5 w-5" />
                      Folders ({binFolders.length})
                    </h2>
                    <div className="space-y-3">
                      {binFolders.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <FolderIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                  <h3 className="text-lg font-semibold truncate">
                                    {getItemTitle(item)}
                                  </h3>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1 ml-8">
                                  <p>{getItemDescription(item)}</p>
                                  <p>Deleted {formatDate(item.deletedAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestore(item.id)}
                                  disabled={isRestoring === item.id}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setItemToDelete(item.id)}
                                  disabled={isDeleting === item.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pages Section */}
                {binPages.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Pages ({binPages.length})
                    </h2>
                    <div className="space-y-3">
                      {binPages.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                  <h3 className="text-lg font-semibold truncate">
                                    {getItemTitle(item)}
                                  </h3>
                                </div>
                                <div className="text-sm text-muted-foreground ml-8">
                                  <p>Deleted {formatDate(item.deletedAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestore(item.id)}
                                  disabled={isRestoring === item.id}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setItemToDelete(item.id)}
                                  disabled={isDeleting === item.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be permanently deleted and cannot be recovered. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Bin Confirmation Dialog */}
      <AlertDialog open={showEmptyDialog} onOpenChange={setShowEmptyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Bin</AlertDialogTitle>
            <AlertDialogDescription>
              All items in the bin will be permanently deleted. This action cannot be undone. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyBin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Empty Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
