import React, { memo } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export const AlertComponent = memo((props: any) => {
  const { node, updateAttributes } = props;
  const type = node.attrs.type || 'info';

  const types = {
    info: { icon: Info, color: 'text-accent', bg: 'bg-accent', border: 'border-accent' },
    warning: { icon: AlertTriangle, color: 'text-terminal-yellow', bg: 'bg-terminal-yellow', border: 'border-terminal-yellow' },
    error: { icon: ShieldAlert, color: 'text-terminal-red', bg: 'bg-terminal-red', border: 'border-terminal-red' },
    success: { icon: CheckCircle2, color: 'text-terminal-green', bg: 'bg-terminal-green', border: 'border-terminal-green' },
  };

  const current = types[type as keyof typeof types];
  const Icon = current.icon;

  return (
    <NodeViewWrapper className="my-8 group relative">
      {/* Type Selector (Visible on Hover) */}
      <div className="absolute -top-3 right-4 flex gap-1 bg-base border border-accent-border p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
          {Object.keys(types).map(t => (
              <button 
                key={t}
                onClick={() => updateAttributes({ type: t })}
                className={clsx(
                    "w-4 h-4 rounded-full border transition-transform hover:scale-110",
                    type === t ? "border-text scale-110" : "border-transparent",
                    types[t as keyof typeof types].bg
                )}
              />
          ))}
      </div>

      <div className={clsx("flex border-l-4 bg-mantle shadow-sm", current.border)}>
        {/* Negative Space Icon Block */}
        <div className={clsx("w-12 flex items-center justify-center shrink-0", current.bg)}>
            <Icon className="w-6 h-6 text-crust" />
        </div>
        
        {/* Content Area */}
        <div className="flex-1 py-4 px-6">
            <NodeViewContent className="font-bold text-sm text-text !m-0 leading-relaxed" />
        </div>
            </div>
          </NodeViewWrapper>
        );
      });
      