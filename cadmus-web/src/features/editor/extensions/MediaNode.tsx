import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { MediaWidget } from '../../widgets/MediaWidget';
import { UrlModal } from '../../../components/ui/UrlModal';
import React, { useState } from 'react';

const MediaComponent = ({ node, updateAttributes, deleteNode }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <NodeViewWrapper>
            <MediaWidget 
                url={node.attrs.url} 
                type={node.attrs.type} 
                caption={node.attrs.caption}
                onEdit={() => setIsModalOpen(true)}
                onDelete={() => deleteNode()}
            />
            
            <UrlModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={(url) => updateAttributes({ url })}
                initialValue={node.attrs.url}
                title="Media Stream Modulator"
                label="STREAM_ENDPOINT_URI"
            />
        </NodeViewWrapper>
    );
};

export const MediaNode = Node.create({
  name: 'media-node',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      type: { default: 'image' }, 
      caption: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'media-node' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['media-node', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaComponent);
  },
});
