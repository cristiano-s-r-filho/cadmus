import { clsx } from 'clsx';
import { Database, Link as LinkIcon, Settings2, X, Maximize2 } from 'lucide-react';
import React, { useState } from 'react';

interface CanvasWidgetProps {
  src?: string;
  caption?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export function CanvasWidget({ src, caption, onEdit, onDelete, readOnly }: CanvasWidgetProps) {
  return (
    <div className="group/canvas relative my-8 font-ui">
      <div className={clsx(
        "relative w-full border border-border bg-surface transition-all duration-300",
        !readOnly && "hover:border-accent/50"
      )}>
        
        {/* Minimalist Controls */}
        {!readOnly && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                <button 
                    onClick={onEdit}
                    className="p-1.5 bg-surface border border-border hover:border-accent hover:text-accent transition-all shadow-sm"
                    title="MODULATE_SOURCE"
                >
                    <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button 
                    onClick={onDelete}
                    className="p-1.5 bg-surface border border-border hover:border-accent hover:text-accent transition-all shadow-sm"
                    title="TERMINATE_FRAME"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        )}

        {/* Content Area */}
        <div className="relative min-h-[300px] w-full flex items-center justify-center bg-base/10 overflow-hidden">
          {src ? (
            <img src={src} alt="Canvas Content" className="w-full h-full object-contain max-h-[600px]" />
          ) : (
            <div onClick={onEdit} className="cursor-pointer flex flex-col items-center justify-center text-subtext/20 gap-4 hover:text-accent/30 transition-colors">
              <Database className="w-12 h-12 opacity-20" />
              <div className="text-center space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Frame_Buffer_Empty</span>
                <p className="text-[7px] font-black uppercase opacity-50 tracking-widest">Click_to_Initialize_Stream</p>
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Info Footer */}
        {(src || caption) && (
            <div className="px-4 py-1.5 border-t border-border/30 flex justify-between items-center opacity-40 group-hover/canvas:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <div className={clsx("w-1.5 h-1.5", src ? "bg-accent" : "bg-border")} />
                    <span className="text-[7px] font-black text-subtext uppercase tracking-widest truncate max-w-[200px]">
                        {src || 'NULL_STREAM'}
                    </span>
                </div>
                <span className="text-[7px] font-black text-text uppercase tracking-widest">
                    {caption?.toUpperCase() || 'SOVEREIGN_FRAME'}
                </span>
            </div>
        )}
      </div>
    </div>
  );
}