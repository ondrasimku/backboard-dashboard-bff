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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  currentSlug: string | null;
  onSuccess: () => void;
}

const sanitizeSlug = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
};

export const PublishDialog = ({
  open,
  onOpenChange,
  pageId,
  currentSlug,
  onSuccess,
}: PublishDialogProps) => {
  const t = useTranslations('pages.publish');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && currentSlug) {
      setSlug(currentSlug);
    }
  }, [open, currentSlug]);

  const handleSlugChange = (value: string) => {
    setSlug(value); // Store raw input without sanitization
    setError('');
  };

  const getSanitizedSlug = () => {
    return sanitizeSlug(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug.trim()) {
      setError(t('invalidSlug'));
      return;
    }

    const sanitized = getSanitizedSlug();
    if (!isValidSlug(sanitized)) {
      setError(t('invalidSlug'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: sanitized }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setError(t('slugTaken'));
        } else {
          throw new Error(errorData.message || 'Failed to publish page');
        }
        return;
      }

      toast.success(t('success'));
      setSlug('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error publishing page:', error);
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getPublicUrl = () => {
    if (typeof window !== 'undefined' && slug) {
      return `${window.location.origin}/p/${getSanitizedSlug()}`;
    }
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slug">{t('slug')}</Label>
              <Input
                id="slug"
                placeholder={t('slugPlaceholder')}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">{t('slugHelp')}</p>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            {slug && (
              <div className="space-y-2">
                {slug !== getSanitizedSlug() && (
                  <p className="text-xs text-muted-foreground">
                    Will be saved as: <code className="bg-muted px-1.5 py-0.5 rounded">{getSanitizedSlug()}</code>
                  </p>
                )}
                {isValidSlug(getSanitizedSlug()) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="text-sm">
                        <p className="font-medium mb-1">{t('preview')}</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {getPublicUrl()}
                        </code>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
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
            <Button type="submit" disabled={isLoading || !slug || !isValidSlug(getSanitizedSlug())}>
              {isLoading ? t('publishing') : t('publish')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
