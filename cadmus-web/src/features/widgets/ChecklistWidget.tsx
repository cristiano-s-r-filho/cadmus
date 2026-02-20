import { clsx } from 'clsx';
import { CheckSquare, Square, Plus, X, ListTodo, Settings2 } from 'lucide-react';
import React, { useState } from 'react';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistWidgetProps {
  title?: string;
  items: ChecklistItem[];
  onUpdate: (items: ChecklistItem[]) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export function ChecklistWidget({ title = "MISSION_PARAMETERS", items, onUpdate, onDelete, readOnly }: ChecklistWidgetProps) {
  const [newItemLabel, setNewItemLabel] = useState('');

  const toggleItem = (id: string) => {
    onUpdate(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (!newItemLabel.trim()) return;
    onUpdate([...items, { id: Math.random().toString(36).substr(2, 9), label: newItemLabel, checked: false }]);
    setNewItemLabel('');
  };

  return (
    <div className="group/checklist bg-surface border border-border transition-all hover:border-accent/30 my-8 font-ui max-w-2xl">
      {/* Header Técnico */}
      <div className="bg-muted/10 px-4 py-2 border-b border-border/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <ListTodo className="w-3.5 h-3.5 text-accent opacity-50" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text">
                {title}
            </span>
        </div>
        
        <div className="flex items-center gap-4">
            <span className="text-[8px] font-black text-accent/60 uppercase tracking-widest bg-accent/5 px-2 py-0.5 border border-accent/10">
                {items.filter(i => i.checked).length}/{items.length} COMPLETE
            </span>
            {!readOnly && (
                <div className="flex items-center gap-1 opacity-0 group-hover/checklist:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"><Settings2 className="w-3 h-3" /></button>
                    <button onClick={onDelete} className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"><X className="w-3 h-3" /></button>
                </div>
            )}
        </div>
      </div>

      {/* Lista */}
      <div className="p-4 space-y-1">
        {items.map((item) => (
          <div 
            key={item.id}
            className={clsx(
              "group/item flex items-center gap-3 p-2 transition-all border border-transparent hover:border-border/30 hover:bg-base/20",
              item.checked && "opacity-60"
            )}
          >
            <button 
                onClick={() => !readOnly && toggleItem(item.id)}
                className={clsx(
                    "w-4 h-4 border-2 flex items-center justify-center transition-all",
                    item.checked ? "bg-accent border-accent text-base" : "border-border hover:border-accent"
                )}
            >
                {item.checked && <div className="w-1.5 h-1.5 bg-base" />}
            </button>
            
            <span className={clsx(
              "flex-1 text-[13px] font-medium transition-all",
              item.checked ? "line-through text-subtext" : "text-text"
            )}>
              {item.label}
            </span>

            {!readOnly && (
                <button 
                    onClick={() => removeItem(item.id)}
                    className="p-1 opacity-0 group-hover/item:opacity-100 hover:text-accent transition-all"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
          </div>
        ))}

        {/* Input de Novo Item */}
        {!readOnly && (
            <div className="pt-4 mt-2 border-t border-border/20 flex items-center gap-3 px-2">
                <Plus className="w-3.5 h-3.5 text-accent opacity-40" />
                <input 
                    type="text"
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder="INITIALIZE_SUB_PARAMETER..."
                    className="flex-1 bg-transparent border-none outline-none text-[11px] font-bold text-text placeholder:text-subtext/20 uppercase tracking-widest"
                />
            </div>
        )}
      </div>

      {/* Minimalist Progress Bar */}
      {items.length > 0 && (
          <div className="h-0.5 w-full bg-border/10 overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-1000" 
                style={{ width: `${(items.filter(i => i.checked).length / items.length) * 100}%` }}
              />
          </div>
      )}
    </div>
  );
}