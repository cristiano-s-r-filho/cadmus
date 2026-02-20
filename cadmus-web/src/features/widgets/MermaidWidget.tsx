import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Activity, X, Terminal, ChevronRight, Maximize2 } from 'lucide-react';
import React from 'react';
import { clsx } from 'clsx';

interface MermaidWidgetProps {
  code: string;
  onCodeChange?: (newCode: string) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

// Retro-Minimalist Mermaid Theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'IBM Plex Mono, monospace',
    primaryColor: '#AF3A03', 
    primaryTextColor: '#1A1A1A', 
    primaryBorderColor: '#1A1A1A',
    lineColor: '#1A1A1A',
    secondaryColor: '#FDFCF0',
    tertiaryColor: '#F7F6E9',
    mainBkg: '#FDFCF0',
    nodeBorder: '#1A1A1A',
    clusterBkg: '#F7F6E9',
    titleColor: '#AF3A03',
    edgeLabelBackground: '#FDFCF0',
  }
});

export function MermaidWidget({ code, onCodeChange, onDelete, readOnly }: MermaidWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);
        setSvg(renderedSvg);
        setError(null);
      } catch (e) {
        setError('RENDER_FAILURE_0x04');
      }
    };
    renderDiagram();
  }, [code]);

  return (
    <div className="my-10 border border-border bg-surface transition-all hover:border-accent/30 group/mermaid font-ui overflow-hidden">
      {/* Minimalist Header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted/10 border-b border-border/50 opacity-40 group-hover/mermaid:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
            <Activity className="w-3 h-3 text-accent" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text">
                Kinetic_Topology_Module
            </span>
        </div>
        <div className="flex items-center gap-2">
            {!readOnly && (
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"
                >
                    <Terminal className="w-3 h-3" />
                </button>
            )}
            <button 
                onClick={onDelete}
                className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
      </div>

      {/* Graph Area */}
      <div className="p-8 bg-base/5 flex items-center justify-center relative overflow-hidden min-h-[150px]">
        {error ? (
          <div className="text-accent text-[8px] font-black uppercase tracking-[0.2em] border border-accent/20 p-4 bg-accent/5">
            {error}
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full flex justify-center scale-100" />
        )}
      </div>

      {/* Code Buffer */}
      {isEditing && !readOnly && (
        <div className="border-t border-border bg-base/50 p-0 relative animate-in slide-in-from-top-2 duration-200">
          <textarea
            className="w-full h-32 bg-transparent text-text p-4 font-ui text-[10px] resize-y focus:outline-none placeholder:text-subtext/20 uppercase tracking-widest border-none"
            value={code}
            onChange={(e) => onCodeChange?.(e.target.value)}
            spellCheck={false}
            placeholder="ENTER_TOPOLOGY_DEFINITION..."
          />
        </div>
      )}

      {/* Footer Info */}
      <div className="px-4 py-1 flex justify-between items-center opacity-10 border-t border-border/5">
          <span className="text-[6px] font-black uppercase tracking-widest">KINETIC_CORE::v4.2</span>
          <span className="text-[6px] font-black uppercase tracking-widest">LAYER_STREAM::ACTIVE</span>
      </div>
    </div>
  );
}
