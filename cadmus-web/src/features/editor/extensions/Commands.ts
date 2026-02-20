import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandList } from '../components/CommandList';
import { 
  Layout, 
  AlertTriangle, 
  Type, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Table, 
  Sigma, 
  Play, 
  CheckSquare, 
  Terminal,
  Activity
} from 'lucide-react';
import React from 'react';

const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Text',
      icon: React.createElement(Type, { className: "w-4 h-4" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: 'Heading 1',
      icon: React.createElement(Heading1, { className: "w-4 h-4" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      icon: React.createElement(Heading2, { className: "w-4 h-4" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Bullet List',
      icon: React.createElement(List, { className: "w-4 h-4" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Ordered List',
      icon: React.createElement(ListOrdered, { className: "w-4 h-4" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
        title: 'Quote',
        icon: React.createElement(Quote, { className: "w-4 h-4" }),
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setBlockquote().run();
        },
    },
    {
        title: 'Code Block',
        icon: React.createElement(Code, { className: "w-4 h-4" }),
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setCodeBlock().run();
        },
    },
    {
      title: 'Alert',
      icon: React.createElement(AlertTriangle, { className: "w-4 h-4 text-accent" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'field-alert' }).run();
      },
    },
    {
      title: 'Canvas',
      icon: React.createElement(Layout, { className: "w-4 h-4 text-accent" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'canvas-node' }).run();
      },
    },
    {
      title: 'Table',
      icon: React.createElement(Table, { className: "w-4 h-4 text-accent" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      title: 'Checklist',
      icon: React.createElement(CheckSquare, { className: "w-4 h-4 text-accent" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'checklist-widget' }).run();
      },
    },
    {
      title: 'Mermaid Diagram',
      icon: React.createElement(Activity, { className: "w-4 h-4 text-accent" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'mermaid-block' }).run();
      },
    },
    {
      title: 'Math Equation',
      icon: React.createElement(Sigma, { className: "w-4 h-4 text-accent" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'math-block' }).run();
      },
    },
    {
      title: 'Media Embed',
      icon: React.createElement(Play, { className: "w-4 h-4 text-accent" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'media-node' }).run();
      },
    },
    {
      title: 'Session Log',
      icon: React.createElement(Terminal, { className: "w-4 h-4 text-subtext" }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'log-feed' }).run();
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
};

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: getSuggestionItems,
        render: () => {
          let component: ReactRenderer;
          let popup: any;

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();

                return true;
              }

              return (component.ref as any)?.onKeyDown(props);
            },

            onExit() {
              if (popup && popup[0]) {
                popup[0].destroy();
              }
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});