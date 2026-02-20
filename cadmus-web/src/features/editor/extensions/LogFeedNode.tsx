import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Terminal, X, Play, Database } from 'lucide-react';
import React, { useState } from 'react';
import { clsx } from 'clsx';

const LogFeedComponent = ({ node, updateAttributes, deleteNode }: any) => {
    const [input, setInput] = useState('');
    const entries = node.attrs.entries || [];

    const addEntry = () => {
        if (!input.trim()) return;
        const newEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            message: input.trim(),
            type: 'system'
        };
        updateAttributes({ entries: [newEntry, ...entries].slice(0, 50) });
        setInput('');
    };

    return (
        <NodeViewWrapper className="my-8 group/log font-ui max-w-full">
            <div className="bg-[#0D0D0D] border border-[#333] shadow-md transition-all hover:border-accent/40 overflow-hidden">
                {/* Minimalist Terminal Header */}
                <div className="flex items-center justify-between px-4 py-1.5 bg-[#1A1A1A] border-b border-[#333]">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-3 h-3 text-accent opacity-50" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-subtext">Session_Buffer_0xDE</span>
                    </div>
                    <button 
                        onClick={() => deleteNode()}
                        className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>

                {/* Log Stream */}
                <div className="p-4 h-48 overflow-y-auto custom-scrollbar flex flex-col-reverse gap-1 bg-black/40">
                    {entries.length > 0 ? entries.map((log: any) => (
                        <div key={log.id} className="flex gap-3 text-[10px] font-mono leading-relaxed">
                            <span className="text-subtext opacity-30 shrink-0">[{log.timestamp}]</span>
                            <span className="text-accent shrink-0">::</span>
                            <span className="text-[#CCC] break-all">{log.message}</span>
                        </div>
                    )) : (
                        <div className="h-full flex items-center justify-center opacity-10 text-[8px] font-black uppercase tracking-[0.4em]">
                            Waiting_for_Signal...
                        </div>
                    )}
                </div>

                {/* Command Input */}
                <div className="p-2 bg-[#111] border-t border-[#333] flex gap-2">
                    <div className="flex-1 relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent text-[10px] font-bold opacity-50 group-focus-within:opacity-100">{'>'}</span>
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
                            placeholder="APPEND_DATA_TO_STREAM..."
                            className="w-full h-8 bg-transparent pl-8 pr-4 text-[10px] font-mono text-accent outline-none"
                        />
                    </div>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export const LogFeedNode = Node.create({
  name: 'log-feed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      entries: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'log-feed' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['log-feed', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LogFeedComponent);
  },
});