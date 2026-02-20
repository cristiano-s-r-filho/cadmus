import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { GaugeWidget } from '../../widgets/GaugeWidget';

export const GaugeNode = Node.create({
  name: 'gauge-widget',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      value: { default: 0.5 },
      label: { default: 'SYSTEM_LOAD' },
    };
  },

  parseHTML() {
    return [{ tag: 'gauge-widget' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['gauge-widget', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => {
      return (
        <NodeViewWrapper>
          <GaugeWidget value={node.attrs.value} label={node.attrs.label} />
        </NodeViewWrapper>
      );
    });
  },
});