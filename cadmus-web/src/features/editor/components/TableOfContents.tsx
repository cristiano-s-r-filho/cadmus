import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { ListTree, Hash, Layout } from 'lucide-react';
import { clsx } from 'clsx';

interface ToCItem {
  id: string;
  text: string;
  level: number;
  itemIndex?: number;
}

interface ToCProps {
    editor?: Editor | null;
    sheets?: { name: string, id: string }[];
}

export function TableOfContents({ editor, sheets }: ToCProps) {
  const [items, setItems] = useState<ToCItem[]>([]);

  useEffect(() => {
    if (sheets) {
        setItems(sheets.map((s, i) => ({
            id: s.id,
            text: s.name,
            level: 1
        })));
        return;
    }

    if (!editor) return;

    const updateToC = () => {
      const headings: ToCItem[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          headings.push({
            id: `heading-${pos}`,
            text: node.textContent,
            level: node.attrs.level,
            itemIndex: pos
          });
        }
      });
      setItems(headings);
    };

    updateToC();
    editor.on('update', updateToC);
    return () => { editor.off('update', updateToC); };
  }, [editor, sheets]);

  if (items.length === 0) return null;

  return (
    <div className="w-64 hidden xl:flex flex-col gap-4 p-6 border-l border-accent-border/20 h-full overflow-y-auto custom-scrollbar bg-mantle/30">
      <div className="flex items-center gap-2 text-subtext mb-2">
        <ListTree className="w-4 h-4 text-accent" />
        <span className="text-[10px] font-black uppercase tracking-widest">
            {sheets ? 'Worksheets_Index' : 'Document_Structure'}
        </span>
      </div>
      
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (editor && item.itemIndex !== undefined) {
                editor.commands.focus();
                editor.commands.setTextSelection(item.itemIndex);
                const element = document.querySelector(`[data-node-view-content]`); 
                element?.scrollIntoView({ behavior: 'smooth' });
              }
              // Switch sheet logic could be added here if FortuneSheet API allows
            }}
            className={clsx(
              "text-left py-1.5 px-2 rounded-lg transition-all hover:bg-accent/5 group flex items-start gap-2",
              item.level === 1 ? "ml-0" : item.level === 2 ? "ml-4" : "ml-8"
            )}
          >
            {sheets ? (
                <Layout className="w-3 h-3 mt-1 shrink-0 text-accent/40 group-hover:text-accent" />
            ) : (
                <Hash className={clsx(
                    "w-3 h-3 mt-1 shrink-0 transition-colors",
                    item.level === 1 ? "text-accent" : "text-subtext/40 group-hover:text-accent"
                )} />
            )}
            <span className={clsx(
              "text-[11px] leading-tight transition-colors",
              item.level === 1 ? "font-black text-text uppercase tracking-tight" : "font-medium text-subtext group-hover:text-text"
            )}>
              {item.text || 'UNTITLED_ENTRY'}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}