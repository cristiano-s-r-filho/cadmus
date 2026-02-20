import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Activity, Trash2 } from 'lucide-react';

export const GaugeWidget = (props: NodeViewProps) => {
  const value = props.node.attrs.value || 75;

  return (
    <NodeViewWrapper className="my-6">
      <div className="bg-mantle border border-accent-border p-4 rounded-xl flex flex-col gap-4 shadow-sm w-48 h-48 items-center justify-center relative">
        <button onClick={() => props.deleteNode()} className="absolute top-2 right-2 text-subtext hover:text-terminal-red">
            <Trash2 className="w-3 h-3" />
        </button>
        
        <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-crust" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={364.4} 
                    strokeDashoffset={364.4 - (364.4 * value) / 100}
                    className="text-accent transition-all duration-500" 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-text">{value}%</span>
                <span className="text-[8px] font-black text-subtext uppercase">Output_Level</span>
            </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
