import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { AlertWidget } from '../../widgets/AlertWidget';
import React from 'react';

export const AlertNode = Node.create({
  name: 'field-alert',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addAttributes() {
    return {
      type: { default: 'info' },
    };
  },

  parseHTML() {
    return [{ tag: 'field-alert' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['field-alert', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node, deleteNode }) => {
      return (
        <NodeViewWrapper>
            <AlertWidget variant={node.attrs.type} onDelete={deleteNode}>
            <div 
                className="outline-none min-h-[1em] ProseMirror-widget-content" 
                contentEditable 
                data-node-view-content 
            />
            </AlertWidget>
        </NodeViewWrapper>
      );
    });
  },
});
