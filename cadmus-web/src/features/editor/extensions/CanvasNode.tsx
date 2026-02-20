import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { CanvasWidget } from '../../widgets/CanvasWidget';
import { UrlModal } from '../../../components/ui/UrlModal';
import React, { useState } from 'react';

const CanvasComponent = ({ node, updateAttributes, deleteNode }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <NodeViewWrapper>
            <CanvasWidget 
                src={node.attrs.src} 
                caption={node.attrs.caption}
                onEdit={() => setIsModalOpen(true)}
                onDelete={() => deleteNode()}
            />
            
            <UrlModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={(url) => updateAttributes({ src: url })}
                initialValue={node.attrs.src}
                title="Sovereign Frame Modulator"
                label="FRAME_SOURCE_URI"
            />
        </NodeViewWrapper>
    );
};

export const CanvasNode = Node.create({
  name: 'canvas-node',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: '' },
      mode: { default: 'vector' },
      caption: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'canvas-node' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['canvas-node', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CanvasComponent);
  },
});