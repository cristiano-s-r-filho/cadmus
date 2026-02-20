import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { MermaidWidget } from '../../widgets/MermaidWidget';
import React from 'react';

const MermaidComponent = ({ node, updateAttributes, deleteNode }: any) => {
    return (
        <NodeViewWrapper>
            <MermaidWidget 
                code={node.attrs.code} 
                onCodeChange={(code) => updateAttributes({ code })}
                onDelete={() => deleteNode()}
            />
        </NodeViewWrapper>
    );
};

export const MermaidNode = Node.create({
  name: 'mermaid-block',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: {
        default: 'graph TD;\nA-->B;',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'mermaid-block' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mermaid-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },
});
