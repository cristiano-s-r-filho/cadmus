import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { ChecklistWidget, ChecklistItem } from '../../widgets/ChecklistWidget';
import { CheckSquare, Plus, X, ListTodo } from 'lucide-react';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';

const ChecklistComponent = ({ node, updateAttributes, deleteNode }: any) => {
    const [newItemLabel, setNewItemLabel] = useState('');
    const items = node.attrs.items || [];

    const handleToggle = (id: string) => {
        const newItems = items.map((item: ChecklistItem) => 
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        updateAttributes({ items: newItems });
    };

    const addItem = () => {
        if (!newItemLabel.trim()) return;
        const newItem: ChecklistItem = {
            id: uuidv4(),
            label: newItemLabel.trim(),
            checked: false
        };
        updateAttributes({ items: [...items, newItem] });
        setNewItemLabel('');
    };

    const removeItem = (id: string) => {
        const newItems = items.filter((item: ChecklistItem) => item.id !== id);
        updateAttributes({ items: newItems });
    };

    return (
        <NodeViewWrapper className="my-8 group/checklist font-ui max-w-full">
            <div className="bg-surface border border-border shadow-sm transition-all hover:border-accent/30 overflow-hidden">
                {/* Minimalist Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/10 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <ListTodo className="w-3.5 h-3.5 text-accent opacity-50" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-subtext">Action_Protocol</span>
                    </div>
                    
                    <button 
                        onClick={() => deleteNode()}
                        className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors opacity-0 group-hover/checklist:opacity-100"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Checklist Body */}
                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        {items.length > 0 ? items.map((item: ChecklistItem) => (
                            <div key={item.id} className="group/item flex items-center gap-3 p-1.5 rounded hover:bg-base/50 transition-colors">
                                <button 
                                    onClick={() => handleToggle(item.id)}
                                    className={clsx(
                                        "w-4 h-4 border-2 flex items-center justify-center transition-colors",
                                        item.checked ? "bg-accent border-accent" : "border-border hover:border-accent"
                                    )}
                                >
                                    {item.checked && <div className="w-1.5 h-1.5 bg-base" />}
                                </button>
                                <span className={clsx(
                                    "flex-1 text-sm font-medium transition-all",
                                    item.checked ? "text-subtext line-through opacity-50" : "text-text"
                                )}>
                                    {item.label}
                                </span>
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    className="p-1 text-subtext hover:text-accent opacity-0 group-hover/item:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )) : (
                            <div className="py-6 text-center text-[9px] font-black text-subtext/20 uppercase tracking-[0.3em]">
                                Manifest_Empty::Awaiting_Inputs
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="pt-2 border-t border-border/30 flex gap-2">
                        <div className="flex-1 relative group">
                            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtext group-focus-within:text-accent transition-colors" />
                            <input 
                                type="text"
                                value={newItemLabel}
                                onChange={(e) => setNewItemLabel(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                placeholder="INITIALIZE_NEW_ENTRY..."
                                className="w-full h-10 bg-base border border-border pl-10 pr-4 text-xs font-black uppercase tracking-widest text-text outline-none focus:border-accent transition-all"
                            />
                        </div>
                        <button 
                            onClick={addItem}
                            className="px-4 bg-base border border-border text-[9px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
                        >
                            EXEC
                        </button>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="px-4 py-1.5 border-t border-border/10 flex justify-between items-center opacity-20">
                    <span className="text-[7px] font-black tracking-widest">LAYER_0xFC</span>
                    <span className="text-[7px] font-black tracking-widest">{items.filter((i: any) => i.checked).length}/{items.length}_CONSOLIDATED</span>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export const ChecklistNode = Node.create({
  name: 'checklist-widget',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      items: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'checklist-widget' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['checklist-widget', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChecklistComponent);
  },
});
