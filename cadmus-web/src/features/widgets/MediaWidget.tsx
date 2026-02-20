import { Film, Link as LinkIcon, Database, Settings2, X, Play } from 'lucide-react';
import { clsx } from 'clsx';
import React from 'react';

interface MediaWidgetProps {
  url: string;
  type: 'image' | 'video' | 'embed';
  caption?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export function MediaWidget({ url, type, caption, onEdit, onDelete, readOnly }: MediaWidgetProps) {
  
  const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
  const isYoutube = url.match(/(youtube\.com|youtu\.be)/i);
  const isVimeo = url.match(/vimeo\.com/i);

  const renderContent = () => {
      if (!url) {
          return (
            <div onClick={onEdit} className="w-full h-48 flex flex-col items-center justify-center text-subtext/20 gap-4 cursor-pointer hover:text-accent/30 transition-colors">
              <Database className="w-12 h-12 opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Source_Input_Required</span>
            </div>
          );
      }

      if (isVideo) {
          return (
              <video 
                  src={url} 
                  controls 
                  className="w-full h-full object-contain max-h-[600px] outline-none"
              />
          );
      }

      if (isYoutube) {
          const videoId = url.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1];
          return (
              <iframe 
                  src={`https://www.youtube.com/embed/${videoId}`} 
                  className="w-full aspect-video border-none"
                  allowFullScreen
              />
          );
      }

      if (isVimeo) {
          const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
          return (
              <iframe 
                  src={`https://player.vimeo.com/video/${videoId}`} 
                  className="w-full aspect-video border-none"
                  allowFullScreen
              />
          );
      }

      // Default to Image
      return (
          <img src={url} alt={caption} className="w-full h-auto object-contain max-h-[600px]" />
      );
  };

  return (
    <figure className="my-8 group/media font-ui">
      <div className={clsx(
        "relative border border-border bg-surface shadow-sm overflow-hidden transition-all duration-300",
        !readOnly && "hover:border-accent/50 hover:shadow-md"
      )}>
        
        {/* Minimalist Controls */}
        {!readOnly && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover/media:opacity-100 transition-opacity text-base">
                <button 
                    onClick={onEdit}
                    className="p-1.5 bg-surface border border-border hover:border-accent hover:text-accent transition-all shadow-sm"
                    title="MODULATE_STREAM"
                >
                    <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button 
                    onClick={onDelete}
                    className="p-1.5 bg-surface border border-border hover:border-accent hover:text-accent transition-all shadow-sm"
                    title="TERMINATE_STREAM"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        )}

        {/* Content Area */}
        <div className="relative min-h-[200px] w-full flex items-center justify-center bg-base/10">
            {renderContent()}
        </div>

        {/* Info Bar */}
        {(url || caption) && (
            <div className="px-4 py-1.5 bg-muted/10 border-t border-border/30 flex justify-between items-center opacity-40 group-hover/media:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                    {isVideo || isYoutube || isVimeo ? <Play className="w-2.5 h-2.5 text-accent" /> : <LinkIcon className="w-2.5 h-2.5 text-accent" />}
                    <span className="text-[7px] font-black text-subtext uppercase tracking-widest truncate max-w-[300px]">
                        {url || 'NULL_REFERENCE'}
                    </span>
                </div>
                {caption && (
                    <span className="text-[7px] font-black text-text uppercase tracking-widest">
                        METADATA::{caption.toUpperCase()}
                    </span>
                )}
            </div>
        )}
      </div>
    </figure>
  );
}