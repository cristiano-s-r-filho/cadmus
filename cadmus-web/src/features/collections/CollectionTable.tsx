import React, { useState, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal,
  Calculator,
  Search
} from 'lucide-react';
import { Button } from '../../design-system';
import { clsx } from 'clsx';

interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'formula' | 'doc_ref';
}

interface Row {
  id: string;
  values: Record<string, any>;
}

interface CollectionTableProps {
  title: string;
  initialColumns: Column[];
  initialRows: Row[];
  onRowAdd?: () => void;
  onCellUpdate?: (rowId: string, colId: string, value: any) => void;
}

export function CollectionTable({ title, initialColumns, initialRows, onRowAdd, onCellUpdate }: CollectionTableProps) {
  const [searchTerm, setSearchValue] = useState('');

  return (
    <div className="my-12 flex flex-col gap-4 animate-in fade-in duration-700">
      {/* Table Header / Toolbar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg shadow-sm">
            <TableIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-text leading-tight">{title}</h3>
            <span className="text-[9px] font-bold text-subtext uppercase tracking-tighter opacity-50">
              COLLECTION_ENGINE // {initialRows.length} RECORDS_LOCALIZED
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-subtext" />
            <input 
              type="text" 
              placeholder="FILTER_RECORDS..." 
              className="pl-8 pr-4 py-1.5 bg-mantle border border-accent-border/30 rounded-lg text-[10px] font-bold outline-none focus:border-accent w-40 transition-all focus:w-60"
              value={searchTerm}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] border border-accent-border/30">
            <Filter className="w-3 h-3" /> VIEWS
          </Button>
          <Button variant="secondary" size="sm" onClick={onRowAdd} className="h-8 gap-2 text-[10px] shadow-sm">
            <Plus className="w-3 h-3" /> APPEND_ROW
          </Button>
        </div>
      </div>

      {/* Actual Data Grid */}
      <div className="overflow-x-auto rounded-2xl border-2 border-accent-border/50 bg-mantle shadow-inner custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-crust/50 border-b-2 border-accent-border/30">
              {initialColumns.map(col => (
                <th key={col.id} className="px-4 py-3 text-left">
                  <div className="flex items-center justify-between group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                      {col.name}
                    </span>
                    <ArrowUpDown className="w-3 h-3 text-subtext opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
                  </div>
                </th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {initialRows.map((row, idx) => (
              <tr 
                key={row.id} 
                className={clsx(
                  "border-b border-accent-border/10 hover:bg-accent/5 transition-colors group",
                  idx % 2 === 0 ? "bg-base/30" : "bg-mantle"
                )}
              >
                {initialColumns.map(col => (
                  <td key={col.id} className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {col.type === 'formula' && <Calculator className="w-3 h-3 text-accent opacity-50" />}
                      <input 
                        type="text"
                        className="w-full bg-transparent text-sm font-medium text-text outline-none focus:bg-base/50 px-1 rounded transition-all"
                        value={row.values[col.id] || ''}
                        onChange={(e) => onCellUpdate?.(row.id, col.id, e.target.value)}
                        readOnly={col.type === 'formula'}
                      />
                    </div>
                  </td>
                ))}
                <td className="px-4 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-accent/10 rounded">
                    <MoreHorizontal className="w-4 h-4 text-subtext" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Aggregate Footer */}
      <div className="flex justify-end px-4 py-2 bg-crust/30 rounded-xl border border-accent-border/20">
        <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-subtext">
          <div className="flex items-center gap-2">
            <span>TOTAL_RECORDS:</span>
            <span className="text-text">{initialRows.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calculator className="w-3 h-3 text-accent" />
            <span>AGGREGATE_SUM:</span>
            <span className="text-accent">0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
