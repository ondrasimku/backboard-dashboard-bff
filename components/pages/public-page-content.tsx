'use client';

import { TiptapEditor } from '@/components/pages/tiptap-editor';

interface PublicPageContentProps {
  content: Record<string, any>;
}

export const PublicPageContent = ({ content }: PublicPageContentProps) => {
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
      <TiptapEditor
        content={content || {}}
        editable={false}
      />
    </div>
  );
};
