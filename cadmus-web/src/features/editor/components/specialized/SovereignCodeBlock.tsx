import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Copy, Check, Terminal, Hash } from 'lucide-react';
import React, { useState } from 'react';
import { clsx } from 'clsx';

export const SovereignCodeBlock = ({ node, updateAttributes, extension }: any) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(node.textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <NodeViewWrapper className="my-8 group/code relative font-ui max-w-full">
            <div className="bg-surface border border-border/60 transition-all duration-300 hover:border-accent/40 overflow-hidden shadow-sm">
                {/* Minimalist Tab */}
                <div className="flex items-center justify-between px-4 py-1 bg-muted/5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                        <Hash className="w-3 h-3 text-accent opacity-30" />
                        <select 
                            className="bg-transparent border-none outline-none text-[7px] font-black uppercase tracking-[0.2em] text-subtext/60 cursor-pointer hover:text-accent transition-colors"
                            value={node.attrs.language || 'auto'}
                            onChange={e => updateAttributes({ language: e.target.value })}
                        >
                            <option value="auto">AUTO_DETECT</option>
                            {extension.options.lowlight.listLanguages().map((lang: string) => (
                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleCopy}
                        className="p-1 text-subtext/20 hover:text-accent transition-colors"
                        title="COPY_BUFFER"
                    >
                        {copied ? (
                            <Check className="w-3 h-3 text-accent" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                    </button>
                </div>

                {/* Stream Content */}
                <pre className="p-6 overflow-x-auto bg-base/5 scrollbar-thin scrollbar-thumb-border">
                    <code className="font-ui text-[13px] leading-relaxed block min-h-[1em] text-text/80">
                        <NodeViewContent />
                    </code>
                </pre>
            </div>
        </NodeViewWrapper>
    );
};