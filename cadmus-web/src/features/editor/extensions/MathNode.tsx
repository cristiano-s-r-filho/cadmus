import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Sigma, X, Terminal } from 'lucide-react';
import { clsx } from 'clsx';

const MathComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [latex, setLatex] = useState(node.attrs.latex || 'E = mc^2');
  const [isEditing, setIsEditing] = useState(false);

  const renderMath = () => {
    try {
      return { __html: katex.renderToString(latex, { throwOnError: false, displayMode: true }) };
    } catch (e) {
      return { __html: '<span class="text-terminal-red">SYNTAX_ERROR_0x09</span>' };
    }
  };

  return (
    <NodeViewWrapper className="my-10 group/math font-ui max-w-full">
        <div className="bg-surface border border-border shadow-sm transition-all hover:border-accent/30 overflow-hidden">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-muted/10 border-b border-border/50 opacity-40 group-hover/math:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                    <Sigma className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text">KaTeX_Symbolic_Processor</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"
                    >
                        <Terminal className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => deleteNode()}
                        className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Display Area */}
            <div className="p-10 flex justify-center bg-base/5 overflow-x-auto custom-scrollbar">
                <div dangerouslySetInnerHTML={renderMath()} className="text-2xl text-text transition-all duration-500 scale-110" />
            </div>

            {/* Buffer Input */}
            {isEditing && (
                <div className="p-4 bg-muted/20 border-t border-border/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-accent opacity-40 uppercase tracking-widest">Latex::</span>
                        <input 
                            value={latex}
                            autoFocus
                            onChange={(e) => {
                                setLatex(e.target.value);
                                updateAttributes({ latex: e.target.value });
                            }}
                            placeholder="ENTER_LATEX_DEFINITION..."
                            className="w-full h-10 bg-base border border-border pl-16 pr-4 text-xs font-mono text-text outline-none focus:border-accent transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-1 flex justify-between items-center opacity-10 border-t border-border/5">
                <span className="text-[6px] font-black uppercase tracking-widest">SYMBOLIC_LAYER_0xAF</span>
                <span className="text-[6px] font-black uppercase tracking-widest">PARSING::STABLE</span>
            </div>
        </div>
    </NodeViewWrapper>
  );
};

export const MathNode = Node.create({
  name: 'math-block',
  group: 'block',
  atom: true,
  addAttributes() { return { latex: { default: 'E = mc^2' } }; },
  parseHTML() { return [{ tag: 'math-block' }]; },
  renderHTML({ HTMLAttributes }) { return ['math-block', mergeAttributes(HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(MathComponent); },
});
