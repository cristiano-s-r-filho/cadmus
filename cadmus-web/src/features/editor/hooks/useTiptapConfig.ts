import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useMemo } from 'react';
// Importação direta das extensões (já refatoradas para usar widgets puros)
import { AlertNode } from '../extensions/AlertNode';
import { CanvasNode } from '../extensions/CanvasNode';
import { MermaidNode } from '../extensions/MermaidNode';
import { MediaNode } from '../extensions/MediaNode';
import { ChecklistNode } from '../extensions/ChecklistNode';
import { MathNode } from '../extensions/MathNode';
import { GaugeNode } from '../extensions/GaugeNode';
import { CalloutNode } from '../extensions/CalloutNode';
import { LogFeedNode } from '../extensions/LogFeedNode';
import { CommentMark } from '../extensions/comments/CommentMark';
import { SlashCommands } from '../extensions/Commands';
import { CodeBlockExtension } from '../extensions/CodeBlock';
import { TableExtensions } from '../extensions/Table';
import * as Y from 'yjs';

const COLORS = ['#958DF1', '#F98181', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D'];

interface UseTiptapConfigProps {
  ydoc: Y.Doc;
  provider: any;
  user: { username: string } | null;
}

export function useTiptapConfig({ ydoc, provider, user }: UseTiptapConfigProps) {
  // eslint-disable-next-line react-hooks/purity
  const userColor = useMemo(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
          history: false, // Yjs gerencia o histórico
          codeBlock: false, // Usamos nossa extensão customizada
          dropcursor: { color: 'var(--color-accent)', width: 2 }
      }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: user?.username || 'Anonymous',
          color: userColor,
        },
      }),
      AlertNode,
      CanvasNode,
      MermaidNode,
      MediaNode,
      ChecklistNode,
      MathNode,
      GaugeNode,
      CalloutNode,
      LogFeedNode,
      CommentMark,
      SlashCommands,
      CodeBlockExtension,
      ...TableExtensions,
    ],
  });

  return editor;
}
