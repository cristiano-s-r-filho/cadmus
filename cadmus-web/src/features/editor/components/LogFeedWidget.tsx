import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Terminal, Trash2, ArrowRight } from 'lucide-react';

export const LogFeedWidget = (props: NodeViewProps) => {
  const [logs, setLogs] = useState<{ time: string, text: string }[]>([]);
  const [input, setInput] = useState('');

  const addLog = () => {
    if (!input) return;
    const time = new Date().toLocaleTimeString();
    setLogs([...logs, { time, text: input.toUpperCase() }]);
    setInput('');
  };

  return (
    <NodeViewWrapper className="my-6">
      <div className="bg-crust border border-accent-border p-4 rounded-xl shadow-inner font-mono text-[10px] flex flex-col gap-2 min-h-[200px] max-h-[400px]">
        <div className="flex items-center justify-between border-b border-accent-border/30 pb-2 mb-2">
            <div className="flex items-center gap-2 text-text opacity-50">
                <Terminal className="w-3 h-3" />
                <span>SESSION_LOG_STREAM</span>
            </div>
            <button onClick={() => props.deleteNode()} className="text-subtext hover:text-terminal-red">
                <Trash2 className="w-3 h-3" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {logs.length === 0 && <p className="text-subtext italic">AWAITING_INPUT...</p>}
            {logs.map((l, i) => (
                <div key={i} className="flex gap-2">
                    <span className="text-accent">[{l.time}]</span>
                    <span className="text-text">{l.text}</span>
                </div>
            ))}
        </div>

        <div className="mt-2 flex items-center gap-2 bg-base/50 p-2 rounded border border-accent-border/20">
            <ArrowRight className="w-3 h-3 text-accent" />
            <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLog()}
                placeholder="COMMIT_EVENT..."
                className="bg-transparent flex-1 outline-none text-accent font-bold"
            />
        </div>
      </div>
    </NodeViewWrapper>
  );
};
