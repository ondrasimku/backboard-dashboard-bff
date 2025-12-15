import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('pages.public');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t('notFound')}</h1>
        <p className="text-muted-foreground mb-6">{t('notFoundDescription')}</p>
        <Link href="/">
          <Button>{t('backToHome')}</Button>
        </Link>
      </div>
    </div>
  );
}
