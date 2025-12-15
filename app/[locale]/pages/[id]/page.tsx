'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TiptapEditor } from '@/components/pages/tiptap-editor';
import { EditorToolbar } from '@/components/pages/editor-toolbar';
import { PublishDialog } from '@/components/pages/publish-dialog';
import { BacklinksPanel } from '@/components/pages/backlinks-panel';
import { Page, PageLinks } from '@/lib/types/page';
import {
  ArrowLeft,
  Globe,
  GlobeLock,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
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

interface PageEditorProps {
  params: Promise<{ id: string }>;
}

export default function PageEditor({ params }: PageEditorProps) {
  const { id } = use(params);
  const t = useTranslations('pages.editor');
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [backlinks, setBacklinks] = useState<PageLinks | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [editor, setEditor] = useState<any>(null);

  const loadPage = async () => {
    setIsLoading(true);
    try {
      const [pageRes, linksRes] = await Promise.all([
        fetch(`/api/pages/${id}`),
        fetch(`/api/pages/${id}/links`),
      ]);

      if (!pageRes.ok) {
        throw new Error('Page not found');
      }

      const pageData = await pageRes.json();
      setPage(pageData);
      setTitle(pageData.title);
      setContent(pageData.content || {});

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setBacklinks(linksData);
      }
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Failed to load page');
      router.push('/pages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [id]);

  const savePage = useCallback(
    async (newTitle: string, newContent: Record<string, any>) => {
      if (!page) return;

      setIsSaving(true);
      setSaveStatus('saving');

      try {
        const response = await fetch(`/api/pages/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newTitle,
            content: newContent,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save page');
        }

        setSaveStatus('saved');
        const updatedPage = await response.json();
        setPage(updatedPage);
      } catch (error) {
        console.error('Error saving page:', error);
        setSaveStatus('error');
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    },
    [page, id]
  );

  const debouncedSave = useCallback(
    (newTitle: string, newContent: Record<string, any>) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(() => {
        savePage(newTitle, newContent);
      }, 1000);

      setSaveTimeout(timeout);
    },
    [saveTimeout, savePage]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (newContent: Record<string, any>) => {
    setContent(newContent);
    debouncedSave(title, newContent);
  };

  const handlePublish = async () => {
    setShowPublishDialog(true);
  };

  const handleUnpublish = async () => {
    try {
      const response = await fetch(`/api/pages/${id}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish page');
      }

      toast.success(t('unpublishSuccess', { ns: 'pages.publish' }));
      await loadPage();
    } catch (error) {
      console.error('Error unpublishing page:', error);
      toast.error('Failed to unpublish page');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      toast.success(t('deleteSuccess'));
      router.push('/pages');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error(t('deleteError'));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-3 border-b">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/pages')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToPages')}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('saving')}</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{t('saved')}</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>Error saving</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Published page link */}
              {page.isPublished && page.slug && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    /p/{page.slug}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/p/${page.slug}`);
                        toast.success('Link copied!');
                      }
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {page.isPublished ? (
                <Button variant="outline" size="sm" onClick={handleUnpublish}>
                  <GlobeLock className="h-4 w-4 mr-2" />
                  {t('unpublish')}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handlePublish}>
                  <Globe className="h-4 w-4 mr-2" />
                  {t('publish')}
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete')}
              </Button>
            </div>
          </div>

          {/* Editor Toolbar */}
          <div className="px-8 py-2 bg-muted/30">
            <EditorToolbar editor={editor} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Title */}
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t('untitled')}
              className="text-4xl font-bold border-0 shadow-none px-0 mb-8 focus-visible:ring-0 h-auto"
            />

            {/* Editor */}
            <TiptapEditor
              content={content}
              onUpdate={handleContentChange}
              placeholder={t('placeholder')}
              showToolbar={false}
              onEditorReady={setEditor}
            />

            {/* Backlinks */}
            {backlinks && (
              <div className="mt-12">
                <BacklinksPanel backlinks={backlinks} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <PublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        pageId={id}
        currentSlug={page.slug}
        onSuccess={loadPage}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
