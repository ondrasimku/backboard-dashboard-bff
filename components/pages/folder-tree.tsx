'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Folder as FolderType, Page, BinItem } from '@/lib/types/page';
import { ChevronRight, Folder, FolderOpen, FileText, Globe, MoreVertical, Plus, FolderPlus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface FolderTreeProps {
  folders: FolderType[];
  pages: Page[];
  currentPageId?: string | null;
  onAddPage: (folderId: string | null) => void;
  onAddFolder: (parentId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  onDeletePage: (pageId: string) => void;
  onRefresh: () => Promise<void>;
}

interface PageItemProps {
  page: Page;
  level: number;
  isActive: boolean;
  onDeletePage: (pageId: string) => void;
}

const PageItem = ({ page, level, isActive, onDeletePage }: PageItemProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { attributes, listeners, setNodeRef: setDragNodeRef, isDragging } = useDraggable({
    id: `page-${page.id}`,
    data: {
      type: 'page',
      id: page.id,
      folderId: page.folderId,
      title: page.title,
      isPublished: page.isPublished,
    },
  });

  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: `page-drop-${page.id}`,
    data: {
      type: 'page',
      id: page.id,
      folderId: page.folderId,
    },
  });

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDeletePage(page.id);
  };

  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    setDragNodeRef(element);
    setDropNodeRef(element);
  };

  return (
    <>
      <div 
        ref={setRefs}
        className={cn(
          "flex items-center group rounded hover:bg-muted/70",
          isDragging && "opacity-30",
          isOver && "bg-primary/10",
          isActive && 'bg-muted'
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 justify-start gap-2 px-2 h-8 min-w-0 hover:bg-transparent cursor-pointer',
          )}
          style={{ paddingLeft: `${level * 16 + 24}px` }}
          onClick={() => router.push(`/pages/${page.id}`)}
        >
          <div 
            {...listeners} 
            {...attributes}
            className="cursor-grab active:cursor-grabbing flex-shrink-0"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
          </div>
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm truncate min-w-0 text-left select-none">{page.title}</span>
          {page.isPublished && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px] flex-shrink-0 ml-auto">
              <Globe className="h-2.5 w-2.5" />
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 group-hover:bg-muted/70 hover:bg-muted/50 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="select-none">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page &quot;{page.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the page to the bin. You can restore it later from the bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface FolderItemProps {
  folder: FolderType;
  pages: Page[];
  currentPageId?: string | null;
  onAddPage: (folderId: string) => void;
  onAddFolder: (parentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDeletePage: (pageId: string) => void;
  level?: number;
}

const FolderItem = ({ folder, pages, currentPageId, onAddPage, onAddFolder, onDeleteFolder, onDeletePage, level = 0 }: FolderItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const folderPages = pages.filter(p => p.folderId === folder.id);
  const hasChildren = (folder.children && folder.children.length > 0) || folderPages.length > 0;

  const { attributes, listeners, setNodeRef: setDragNodeRef, isDragging } = useDraggable({
    id: `folder-${folder.id}`,
    data: {
      type: 'folder',
      id: folder.id,
      parentId: folder.parentId,
      name: folder.name,
    },
  });

  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: `folder-drop-${folder.id}`,
    data: {
      type: 'folder',
      id: folder.id,
    },
  });

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDeleteFolder(folder.id);
  };

  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    setDragNodeRef(element);
    setDropNodeRef(element);
  };

  return (
    <>
      <div>
        <div 
          ref={setRefs}
          className={cn(
            "flex items-center group rounded hover:bg-muted/70",
            isDragging && "opacity-30",
            isOver && "bg-primary/10"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 px-2 h-8 min-w-0 hover:bg-transparent cursor-pointer"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div 
              {...listeners} 
              {...attributes}
              className="cursor-grab active:cursor-grabbing flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
            </div>
            {hasChildren ? (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform flex-shrink-0',
                  isOpen && 'rotate-90'
                )}
              />
            ) : (
              <div className="w-4 flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm truncate min-w-0 select-none">{folder.name}</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 group-hover:bg-muted/70 hover:bg-muted/50 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddPage(folder.id)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                <span className="select-none">Add Page</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddFolder(folder.id)} className="cursor-pointer">
                <FolderPlus className="h-4 w-4 mr-2" />
                <span className="select-none">Add Subfolder</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="select-none">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isOpen && hasChildren && (
          <div>
            {/* Child folders */}
            {folder.children?.map((child) => (
              <FolderItem
                key={child.id}
                folder={child}
                pages={pages}
                currentPageId={currentPageId}
                onAddPage={onAddPage}
                onAddFolder={onAddFolder}
                onDeleteFolder={onDeleteFolder}
                onDeletePage={onDeletePage}
                level={level + 1}
              />
            ))}
            {/* Pages in this folder */}
            {folderPages.map((page) => (
              <PageItem
                key={page.id}
                page={page}
                level={level + 1}
                isActive={currentPageId === page.id}
                onDeletePage={onDeletePage}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder &quot;{folder.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the folder and all its contents to the bin. You can restore it later from the bin.
              {hasChildren && (
                <span className="block mt-2 font-medium">
                  This folder contains {folder.children?.length || 0} subfolder(s) and {folderPages.length} page(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface BinDropZoneProps {
  binCount: number;
  onClick: () => void;
}

const BinDropZone = ({ binCount, onClick }: BinDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bin-drop-zone',
    data: {
      type: 'bin',
    },
  });

  return (
    <div ref={setNodeRef} className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-start gap-2 px-2 h-8 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all cursor-pointer",
          isOver && "bg-red-200 dark:bg-red-900/70 scale-105 shadow-lg border-2 border-red-500 dark:border-red-400"
        )}
        onClick={onClick}
      >
        <Trash2 className={cn("h-4 w-4 flex-shrink-0", isOver && "animate-bounce")} />
        <span className="text-sm flex-1 text-left select-none">Bin</span>
        {binCount > 0 && (
          <Badge variant="secondary" className="h-5 px-2 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 select-none">
            {binCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export const FolderTree = ({
  folders,
  pages,
  currentPageId,
  onAddPage,
  onAddFolder,
  onDeleteFolder,
  onDeletePage,
  onRefresh,
}: FolderTreeProps) => {
  const t = useTranslations('pages');
  const router = useRouter();
  const [binCount, setBinCount] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showBinDeleteDialog, setShowBinDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'page' | 'folder'; title: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch bin items count
  useEffect(() => {
    const fetchBinCount = async () => {
      try {
        const response = await fetch('/api/bin');
        if (response.ok) {
          const data: BinItem[] = await response.json();
          setBinCount(data.length);
        }
      } catch (error) {
        console.error('Error fetching bin count:', error);
      }
    };

    fetchBinCount();
    
    // Refresh bin count every 30 seconds
    const interval = setInterval(fetchBinCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    
    if (activeId.startsWith('page-')) {
      const pageId = activeId.replace('page-', '');
      return pages.find(p => p.id === pageId);
    } else if (activeId.startsWith('folder-')) {
      const folderId = activeId.replace('folder-', '');
      return folders.find(f => f.id === folderId);
    }
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    // Check if dropped on bin
    if (over.id === 'bin-drop-zone') {
      // Show delete confirmation dialog
      const title = activeData.type === 'page' ? activeData.title : activeData.name;
      setItemToDelete({
        id: activeData.id,
        type: activeData.type,
        title: title,
      });
      setShowBinDeleteDialog(true);
      return;
    }

    try {
      // Determine the target folder ID
      let targetFolderId: string | null = null;
      
      if (over.id === 'root-drop-zone') {
        targetFolderId = null;
      } else if (overData?.type === 'folder') {
        targetFolderId = overData.id;
      } else if (overData?.type === 'page') {
        // Drop on a page means place as sibling (same parent folder)
        targetFolderId = overData.folderId;
      } else {
        return; // Invalid drop target
      }

      // Move page or folder
      if (activeData.type === 'page') {
        const response = await fetch(`/api/pages/${activeData.id}/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folderId: targetFolderId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to move page');
        }

        toast.success('Page moved successfully');
      } else if (activeData.type === 'folder') {
        // Prevent moving folder to itself or its descendants
        if (targetFolderId === activeData.id) {
          toast.error('Cannot move folder to itself');
          return;
        }

        const response = await fetch(`/api/folders/${activeData.id}/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ parentId: targetFolderId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to move folder');
        }

        toast.success('Folder moved successfully');
      }

      // Refresh the tree
      await onRefresh();
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to move item');
    }
  };

  const handleConfirmBinDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'page') {
        await onDeletePage(itemToDelete.id);
      } else if (itemToDelete.type === 'folder') {
        await onDeleteFolder(itemToDelete.id);
      }
      setShowBinDeleteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  // Build folder hierarchy
  const buildTree = (folders: FolderType[]): FolderType[] => {
    const folderMap = new Map<string, FolderType>();
    const rootFolders: FolderType[] = [];

    // First pass: create map of all folders
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Second pass: build tree structure
    folders.forEach((folder) => {
      const folderNode = folderMap.get(folder.id);
      if (!folderNode) return;

      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(folderNode);
        } else {
          rootFolders.push(folderNode);
        }
      } else {
        rootFolders.push(folderNode);
      }
    });

    return rootFolders;
  };

  const folderTree = buildTree(folders);
  const rootPages = pages.filter(p => p.folderId === null);

  // Root drop zone component - only for the header area
  const RootDropZone = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'root-drop-zone',
      data: {
        type: 'root',
      },
    });

    return (
      <div 
        ref={setNodeRef}
        className={cn(
          "py-2 mb-2 rounded transition-colors",
          isOver && "bg-primary/10 border-2 border-dashed border-primary"
        )}
      >
        {/* Root level context menu */}
        <div className="flex items-center group rounded hover:bg-muted/70">
          <div 
            className="flex-1 px-2 py-1 cursor-pointer"
            onClick={() => router.push('/pages')}
          >
            <span className="text-sm font-semibold select-none">{t('title')}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity group-hover:bg-muted/70 hover:bg-muted/50 cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddPage(null)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                <span className="select-none">Add Page</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddFolder(null)} className="cursor-pointer">
                <FolderPlus className="h-4 w-4 mr-2" />
                <span className="select-none">Add Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col overflow-x-hidden px-4 min-h-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <RootDropZone />
          
          {/* Folder tree with pages */}
          {folderTree.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              pages={pages}
              currentPageId={currentPageId}
              onAddPage={onAddPage}
              onAddFolder={onAddFolder}
              onDeleteFolder={onDeleteFolder}
              onDeletePage={onDeletePage}
            />
          ))}

          {/* Root level pages */}
          {rootPages.map((page) => (
            <PageItem
              key={page.id}
              page={page}
              level={0}
              isActive={currentPageId === page.id}
              onDeletePage={onDeletePage}
            />
          ))}

          {/* Bin link - right after pages/directories */}
          <BinDropZone 
            binCount={binCount} 
            onClick={() => router.push('/pages/bin')} 
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null} style={{ pointerEvents: 'none' }}>
        {activeId ? (() => {
          const item = getActiveItem();
          if (!item) return null;
          
          if ('title' in item) {
            // It's a page
            return (
              <div className="bg-background border rounded shadow-lg px-3 py-2 flex items-center gap-2 w-[200px]">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate min-w-0">{item.title}</span>
                {item.isPublished && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] flex-shrink-0 ml-auto">
                    <Globe className="h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
            );
          } else {
            // It's a folder
            return (
              <div className="bg-background border rounded shadow-lg px-3 py-2 flex items-center gap-2 w-[200px]">
                <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate min-w-0">{item.name}</span>
              </div>
            );
          }
        })() : null}
      </DragOverlay>

      {/* Bin Delete Confirmation Dialog */}
      <AlertDialog open={showBinDeleteDialog} onOpenChange={setShowBinDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {itemToDelete?.type === 'page' ? 'page' : 'folder'} &quot;{itemToDelete?.title}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will move the {itemToDelete?.type} to the bin. You can restore it later from the bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBinDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
};
