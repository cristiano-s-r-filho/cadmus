import React, { useState, useEffect } from 'react';
import { Table, Plus, Save, Download, Trash2, Calculator, Settings2, Loader2, Database } from 'lucide-react';
import { Button } from '../../design-system';
import { dataService, CollectionData, Archetype } from '../../kernel/data/DataServiceProvider';
import { clsx } from 'clsx';

interface SpreadsheetEditorProps {
    docId: string;
}

export function SpreadsheetEditor({ docId }: SpreadsheetEditorProps) {
    const [rows, setRows] = useState<any[]>([]);
    const [archetype, setArchetype] = useState<Archetype | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [coll, archs, doc] = await Promise.all([
                    dataService.getCollection(docId),
                    dataService.getArchetypes(),
                    dataService.getDoc(docId)
                ]);
                setRows(coll.rows);
                const found = archs.find(a => a.id === (doc.class_id || 'folha'));
                if (found) setArchetype(found);
                setLoading(false);
            } catch (e) {
                console.error("Spreadsheet Initialization Fail", e);
                setLoading(false);
            }
        };
        init();
    }, [docId]);

    const handleCellChange = async (rowId: string, colId: string, value: any) => {
        setSyncing(true);
        try {
            await dataService.updateCollectionCell(docId, rowId, colId, value);
            setSyncing(false);
        } catch (e) {
            console.error("Cell Sync Fail", e);
            setSyncing(false);
        }
    };

    const handleAddRow = async () => {
        try {
            await dataService.addCollectionRow(docId);
            const data = await dataService.getCollection(docId);
            setRows(data.rows);
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="h-full flex items-center justify-center font-mono text-accent animate-pulse uppercase">Allocating_Grid_Resources...</div>;

    const columns = archetype?.ui_schema || [
        { key: 'col1', label: 'Field_A' },
        { key: 'col2', label: 'Field_B' }
    ];

    return (
        <div className="flex flex-col h-full bg-base font-mono overflow-hidden selection:bg-accent/20">
            {/* Spreadsheet Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b-4 border-accent bg-mantle shadow-lg z-10">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-accent text-crust rounded-2xl shadow-hard transition-transform hover:rotate-3">
                        <Table className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Sovereign_Spreadsheet_Kernel</span>
                        <h1 className="text-3xl font-black text-text uppercase tracking-tighter">
                            {rows.length} <span className="text-sm opacity-40 font-bold tracking-widest ml-2">RECORDS_INDEXED</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {syncing && <div className="flex items-center gap-2 text-[9px] font-black text-accent animate-pulse mr-4">
                        <Database className="w-3 h-3" /> SYNCING_TO_STATION...
                    </div>}
                    <Button variant="ghost" size="sm" className="gap-2 text-[10px] border border-accent-border/30 hover:border-accent">
                        <Calculator className="w-3.5 h-3.5" /> RUN_CALCS
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleAddRow} className="gap-2 text-[10px] shadow-hard px-6 h-10">
                        <Plus className="w-4 h-4" /> APPEND_ROW
                    </Button>
                </div>
            </header>

            {/* Grid View */}
            <main className="flex-1 overflow-auto bg-grid-pattern p-12 custom-scrollbar">
                <div className="max-w-[95%] mx-auto bg-mantle border-2 border-accent-border rounded-[2rem] shadow-2xl overflow-hidden group/grid hover:border-accent/30 transition-all duration-500">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-crust/80 border-b-2 border-accent-border/50">
                                <th className="w-16 px-4 py-4 border-r border-accent-border/20 text-[10px] font-black text-subtext text-center">#</th>
                                {columns.map((col: any) => (
                                    <th key={col.key} className="px-8 py-4 text-left border-r border-accent-border/20 last:border-none">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black text-accent tracking-widest uppercase">{col.label}</span>
                                            <Settings2 className="w-3 h-3 text-subtext/30 hover:text-accent cursor-pointer transition-colors" />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id} className="border-b border-accent-border/10 hover:bg-accent/5 transition-colors group/row">
                                    <td className="px-4 py-4 text-center border-r border-accent-border/10 text-[10px] font-bold text-subtext group-hover/row:text-accent group-hover/row:bg-crust/50">
                                        {idx + 1}
                                    </td>
                                    {columns.map((col: any) => (
                                        <td key={col.key} className="p-0 border-r border-accent-border/10 last:border-none h-12">
                                            <input 
                                                className="w-full h-full bg-transparent px-8 text-sm font-bold text-text outline-none focus:bg-base focus:ring-2 focus:ring-inset focus:ring-accent/30 transition-all"
                                                defaultValue={row[col.key] || ''}
                                                onBlur={(e) => handleCellChange(row.id, col.key, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Database className="w-12 h-12" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting_Data_Input</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}