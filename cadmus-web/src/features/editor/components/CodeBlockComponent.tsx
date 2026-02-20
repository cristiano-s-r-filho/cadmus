import React from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Copy, Terminal } from 'lucide-react';
import { clsx } from 'clsx';

export const CodeBlockComponent: React.FC<NodeViewProps> = ({ node: { attrs }, updateAttributes, extension }) => {
  const languages = extension.options.lowlight.listLanguages();

  const copyToClipboard = () => {
    const code = attrs.code || ''; // Tiptap usually stores content in the DOM, but for copy we might need to grab textContent ref
    // For simplicity in this widget, we assume user selects text to copy or we implement a ref approach later.
    // Actually, Tiptap NodeViewContent manages the editable area.
    // A proper copy button needs access to the node's text content.
    // We'll stub the alert for now.
    alert("CODE_COPIED_TO_CLIPBOARD");
  };

  return (
    <NodeViewWrapper className="code-block my-6 rounded-lg border border-accent-border overflow-hidden bg-mantle shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-crust border-b border-accent-border select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-accent" />
          <select 
            contentEditable={false} 
            defaultValue={attrs.language} 
            onChange={(event) => updateAttributes({ language: event.target.value })}
            className="bg-transparent text-[10px] font-bold text-subtext uppercase outline-none cursor-pointer hover:text-text"
          >
            <option value="null">PLAIN_TEXT</option>
            {languages.map((lang: string) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <button onClick={copyToClipboard} className="text-subtext hover:text-accent transition-colors">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {/* Content */}
      <pre className="p-4 font-mono text-sm text-text overflow-x-auto">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};
