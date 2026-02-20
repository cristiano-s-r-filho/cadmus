import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentAttributes {
  id: string;
}

export const CommentMark = Mark.create({
  name: 'comment',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.id) return {};
          return { 'data-comment-id': attributes.id };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'bg-accent/20 border-b-2 border-accent cursor-pointer' }), 0];
  },
});
