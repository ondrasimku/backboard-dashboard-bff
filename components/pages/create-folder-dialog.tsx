'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Folder[];
  onSuccess: () => void;
  preselectedParentId?: string | null;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  folders,
  onSuccess,
  preselectedParentId,
}: CreateFolderDialogProps) => {
  const t = useTranslations('pages.folder');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update parentId when preselectedParentId changes
  useEffect(() => {
    if (open) {
      setParentId(preselectedParentId || null);
      setName('');
    }
  }, [open, preselectedParentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('error'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          parentId: parentId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      toast.success(t('success'));
      setName('');
      setParentId(null);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating folder:', error);
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
              {t('namePlaceholder')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">{t('parent')}</Label>
              <Select
                value={parentId || 'none'}
                onValueChange={(value) => setParentId(value === 'none' ? null : value)}
                disabled={isLoading}
              >
                <SelectTrigger id="parent">
                  <SelectValue placeholder={t('selectParent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('noParent')}</SelectItem>
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
