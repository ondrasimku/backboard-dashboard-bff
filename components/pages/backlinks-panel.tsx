'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { PageLinks } from '@/lib/types/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface BacklinksPanelProps {
  backlinks: PageLinks;
}

export const BacklinksPanel = ({ backlinks }: BacklinksPanelProps) => {
  const t = useTranslations('pages.backlinks');
  const router = useRouter();

  const hasOutgoing = backlinks.outgoing.length > 0;
  const hasIncoming = backlinks.incoming.length > 0;

  if (!hasOutgoing && !hasIncoming) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outgoing Links */}
        {hasOutgoing && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              {t('outgoing')}
            </h3>
            <div className="space-y-2">
              {backlinks.outgoing.map((link) => (
                <Button
                  key={link.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-2"
                  onClick={() => router.push(`/pages/${link.toPage.id}`)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{link.toPage.title}</p>
                    {link.toPage.slug && (
                      <p className="text-xs text-muted-foreground">
                        /p/{link.toPage.slug}
                      </p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {hasOutgoing && hasIncoming && <Separator />}

        {/* Incoming Links (Backlinks) */}
        {hasIncoming && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('incoming')}
            </h3>
            <div className="space-y-2">
              {backlinks.incoming.map((link) => (
                <Button
                  key={link.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-2"
                  onClick={() => router.push(`/pages/${link.fromPage.id}`)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{link.fromPage.title}</p>
                    {link.fromPage.slug && (
                      <p className="text-xs text-muted-foreground">
                        /p/{link.fromPage.slug}
                      </p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
