import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CalloutWidget } from '../components/CalloutWidget';

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  addAttributes() { return { type: { default: 'info' } }; },
  parseHTML() { return [{ tag: 'callout-widget' }]; },
  renderHTML({ HTMLAttributes }) { return ['callout-widget', mergeAttributes(HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(CalloutWidget); },
});
