import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

export const TableExtensions = [
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'cadmus-table',
    },
  }),
  TableRow,
  TableHeader,
  TableCell,
];
