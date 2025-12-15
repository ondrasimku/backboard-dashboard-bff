'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Folder } from '@/lib/types/page';

interface CreatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Folder[];
  preselectedFolderId?: string | null;
  onSuccess?: () => void;
}

export const CreatePageDialog = ({
  open,
  onOpenChange,
  folders,
  preselectedFolderId,
  onSuccess,
}: CreatePageDialogProps) => {
  const t = useTranslations('pages.page');
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update folderId when preselectedFolderId changes
  useEffect(() => {
    if (open) {
      setFolderId(preselectedFolderId || null);
      setTitle('');
    }
  }, [open, preselectedFolderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t('error'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          folderId: folderId || null,
          content: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create page');
      }

      const page = await response.json();
      toast.success(t('created'));
      setTitle('');
      setFolderId(null);
      onOpenChange(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      router.push(`/pages/${page.id}`);
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('create')}</DialogTitle>
            <DialogDescription>
              {t('titlePlaceholder')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')}</Label>
              <Input
                id="title"
                placeholder={t('titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">{t('folder')}</Label>
              <Select
                value={folderId || 'none'}
                onValueChange={(value) => setFolderId(value === 'none' ? null : value)}
                disabled={isLoading}
              >
                <SelectTrigger id="folder">
                  <SelectValue placeholder={t('selectFolder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('noFolder')}</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
