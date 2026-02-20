import { NodeViewWrapper } from '@tiptap/react';
import { Plus, Trash2, GripVertical, CheckSquare, Square } from 'lucide-react';
import { useState, memo } from 'react';
import { clsx } from 'clsx';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export const ChecklistWidget = memo((props: any) => {
  const { node, updateAttributes } = props;
  const items: ChecklistItem[] = node.attrs.items || [];
  const title = node.attrs.title;

  const addItem = () => {
      const newItem = { id: uuidv4(), text: '', checked: false };
      updateAttributes({ items: [...items, newItem] });
  };

  const toggleItem = (id: string) => {
      const newItems = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
      updateAttributes({ items: newItems });
  };

  const updateText = (id: string, text: string) => {
      const newItems = items.map(i => i.id === id ? { ...i, text } : i);
      updateAttributes({ items: newItems });
  };

  const removeItem = (id: string) => {
      updateAttributes({ items: items.filter(i => i.id !== id) });
  };

  return (
    <NodeViewWrapper className="my-8 font-mono">
      <div className="bg-mantle border-2 border-accent-border rounded-xl shadow-hard overflow-hidden group">
        <div className="bg-base border-b-2 border-accent-border p-3 flex justify-between items-center">
            <input 
                className="bg-transparent font-black uppercase tracking-widest text-xs text-text outline-none placeholder:text-subtext/50 w-full"
                value={title}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                placeholder="CHECKLIST_TITLE"
            />
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={addItem} className="p-1 hover:bg-accent hover:text-crust rounded transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
        
        <div className="p-2 space-y-1">
            {items.length === 0 && (
                <div onClick={addItem} className="text-[10px] text-subtext text-center py-4 cursor-pointer hover:text-accent border-2 border-dashed border-accent-border/30 hover:border-accent rounded-lg m-2">
                    [INITIALIZE_FIRST_TASK]
                </div>
            )}
            {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 group/item hover:bg-base p-2 rounded-lg transition-colors">
                    <GripVertical className="w-4 h-4 text-subtext/20 cursor-grab" />
                    <button onClick={() => toggleItem(item.id)} className={clsx("transition-colors", item.checked ? "text-accent" : "text-subtext")}>
                        {item.checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                    <input 
                        className={clsx(
                            "flex-1 bg-transparent text-sm font-bold outline-none",
                            item.checked ? "text-subtext line-through decoration-2 decoration-accent" : "text-text"
                        )}
                        value={item.text}
                        onChange={(e) => updateText(item.id, e.target.value)}
                        placeholder="Task_Description..."
                    />
                    <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover/item:opacity-100 text-terminal-red p-1 hover:bg-terminal-red/10 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
            </div>
          </NodeViewWrapper>
        );
      });
      