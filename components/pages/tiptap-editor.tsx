'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { useEffect, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  CodeIcon,
  Link2,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
  content: Record<string, any>;
  onUpdate?: (content: Record<string, any>) => void;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
  className?: string;
  onEditorReady?: (editor: any) => void;
}

export const TiptapEditor = ({
  content,
  onUpdate,
  placeholder,
  editable = true,
  showToolbar = true,
  className,
  onEditorReady,
}: TiptapEditorProps) => {
  const t = useTranslations('pages.editor.toolbar');
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          exitOnTripleEnter: true,
          exitOnArrowDown: true,
          HTMLAttributes: {
            class: 'bg-muted p-4 rounded-lg overflow-x-auto my-4 font-mono',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
      Typography,
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'focus:outline-none',
          'min-h-[300px]',
          showToolbar ? 'px-4 py-3' : 'px-0 py-0',
          // Custom typography styles
          '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6',
          '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5',
          '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4',
          '[&_p]:mb-3 [&_p]:leading-7',
          '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3',
          '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3',
          '[&_li]:mb-1',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4',
          '[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',
          '[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:font-mono',
          '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:font-mono',
          '[&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer',
          '[&_strong]:font-semibold',
          '[&_em]:italic'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (editable && onUpdate) {
        onUpdate(editor.getJSON());
      }
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!isMounted || !editor) {
    return null;
  }

  if (!editable) {
    return (
      <div className={cn(
        '[&_.ProseMirror]:focus:outline-none',
        '[&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-6',
        '[&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-5',
        '[&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-4',
        '[&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-7',
        '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ul]:mb-3',
        '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_ol]:mb-3',
        '[&_.ProseMirror_li]:mb-1',
        '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-muted [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:my-4',
        '[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono',
        '[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:font-mono',
        '[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:font-mono',
        '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:cursor-pointer',
        '[&_.ProseMirror_strong]:font-semibold',
        '[&_.ProseMirror_em]:italic',
        className
      )}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className={cn(
      showToolbar && 'border rounded-lg overflow-hidden',
      className
    )}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-muted')}
          title={t('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-muted')}
          title={t('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive('strike') && 'bg-muted')}
          title={t('strike')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(editor.isActive('code') && 'bg-muted')}
          title={t('code')}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
          title={t('heading1')}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
          title={t('heading2')}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(editor.isActive('heading', { level: 3 }) && 'bg-muted')}
          title={t('heading3')}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-muted')}
          title={t('bulletList')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-muted')}
          title={t('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive('blockquote') && 'bg-muted')}
          title={t('blockquote')}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive('codeBlock') && 'bg-muted')}
          title={t('codeBlock')}
        >
          <CodeIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={cn(editor.isActive('link') && 'bg-muted')}
          title={t('link')}
        >
          <Link2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={t('undo')}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={t('redo')}
        >
          <Redo className="h-4 w-4" />
        </Button>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};
