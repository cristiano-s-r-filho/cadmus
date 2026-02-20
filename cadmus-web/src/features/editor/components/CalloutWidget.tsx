import React from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Info, AlertCircle, Zap, Shield, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export const CalloutWidget = (props: NodeViewProps) => {
  const type = props.node.attrs.type || 'info';

  const icons = {
    info: Info,
    warning: AlertCircle,
    power: Zap,
    secure: Shield
  };
  const Icon = icons[type as keyof typeof icons] || Info;

  return (
    <NodeViewWrapper className="my-8">
      <div className={clsx(
          "border-l-4 p-6 bg-accent/5 relative group transition-all",
          type === 'secure' ? "border-terminal-green" : "border-accent"
      )}>
        <button onClick={() => props.deleteNode()} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-subtext hover:text-terminal-red transition-opacity">
            <Trash2 className="w-3 h-3" />
        </button>
        
        <div className="flex gap-4">
            <Icon className="w-6 h-6 text-accent shrink-0" />
            <div className="flex-1 min-w-0 font-bold uppercase tracking-tight">
                <NodeViewContent className="outline-none" />
            </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
