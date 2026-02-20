import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { common, createLowlight } from 'lowlight';
import { SovereignCodeBlock } from '../components/specialized/SovereignCodeBlock';

const lowlight = createLowlight(common);

export const CodeBlockExtension = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(SovereignCodeBlock);
  },
}).configure({
  lowlight,
  HTMLAttributes: {
    class: 'widget-code',
  },
});
