import React, { useState, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { X, GripVertical, Settings2, Loader2, Database } from 'lucide-react';
import { clsx } from 'clsx';

export type WidgetSyncStatus = 'idle' | 'dirty' | 'syncing' | 'consolidated';

interface WidgetWrapperProps {
  title: string;
  icon: React.ReactNode;
  onDelete: () => void;
  children: React.ReactNode;
  className?: string;
  isContentEditable?: boolean;
  status?: WidgetSyncStatus;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ 
  title, 
  icon, 
  onDelete, 
  children, 
  className,
  isContentEditable = false,
  status = 'idle'
}) => {
  const [displayStatus, setDisplayStatus] = useState<WidgetSyncStatus>(status);

  useEffect(() => {
    if (status === 'consolidated') {
      const timer = setTimeout(() => setDisplayStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
    setDisplayStatus(status);
  }, [status]);

  return (
    <NodeViewWrapper className="my-16 group/widget relative font-ui">
      {/* Structural Label */}
      <div className="absolute -top-4 left-6 bg-accent text-base text-[8px] font-black uppercase px-3 py-1 shadow-sm z-10">
        WIDGET_BLOCK::{title.replace(/\s+/g, '_').toUpperCase()}
      </div>

      <div className={clsx(
        "bg-surface border-2 border-border shadow-hard transition-all pointer-events-auto relative",
        displayStatus === 'dirty' && "border-dashed opacity-90",
        displayStatus === 'syncing' && "border-accent animate-pulse",
        displayStatus === 'consolidated' && "border-accent ring-4 ring-accent/10",
        className
      )}>
        {/* Widget Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-b-2 border-border">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "transition-colors",
              displayStatus === 'consolidated' ? "text-accent" : "text-accent"
            )}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-text">
                    Runtime_Signal
                </span>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-subtext opacity-60">
                    {displayStatus === 'syncing' && <span className="text-accent animate-pulse">UPDATING_STREAMS...</span>}
                    {displayStatus === 'consolidated' && <span className="text-accent">SYNCHRONIZATION_COMPLETE</span>}
                    {displayStatus === 'dirty' && <span>AWAITING_LOCAL_COMMIT</span>}
                    {displayStatus === 'idle' && <span>SYSTEM_STABLE</span>}
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-subtext hover:text-accent p-1 transition-colors border-2 border-transparent hover:border-accent">
                <Settings2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border/30 mx-1" />
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                }}
                className="text-subtext hover:text-accent p-1 transition-all border-2 border-transparent hover:border-accent"
                title="TERMINATE_BLOCK"
            >
                <X className="w-4 h-4" />
            </button>
            <div className="cursor-grab active:cursor-grabbing text-subtext/30 hover:text-accent p-1">
                <GripVertical className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Widget Content */}
        <div className="p-10 relative bg-base/30">
            {isContentEditable ? (
                <NodeViewContent className="outline-none min-h-[60px] ProseMirror-widget-content font-content text-lg" />
            ) : (
                children
            )}
        </div>

        {/* Technical Footer */}
        <div className="px-6 py-2 border-t-2 border-border/10 flex justify-between items-center opacity-30">
            <span className="text-[7px] font-black uppercase tracking-widest">SOVEREIGN_ENGINE_BLOCK_V1.0</span>
            <span className="text-[7px] font-black uppercase tracking-widest">PARSING_READY</span>
        </div>
      </div>
    </NodeViewWrapper>
  );
};