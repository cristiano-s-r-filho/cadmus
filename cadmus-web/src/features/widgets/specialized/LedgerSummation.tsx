import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, RefreshCw, CheckCircle2, DollarSign } from 'lucide-react';
import { dataService } from '../../../kernel/data/DataServiceProvider';
import { useAuthStore } from '../../auth/authStore';
import { clsx } from 'clsx';

export function LedgerSummation({ docId }: { docId: string }) {
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();

    // 1. QUERY: Fetch aggregate data from API
    const { data: total, isLoading, isError, refetch } = useQuery({
        queryKey: ['ledger', docId],
        queryFn: async () => {
            const { getAuthHeaders } = await import('../../../kernel/data/authHeaders');
            const res = await fetch(`/api/v1/stats/aggregate/${docId}/value`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Aggregation failed");
            return res.json();
        },
        enabled: !!docId
    });

    // 2. MUTATION: Persist total to document properties
    const saveMutation = useMutation({
        mutationFn: async (value: number) => {
            if (!user) return;
            return dataService.updateProperty(docId, "total_balance", value, user.id);
        }
    });

    // Auto-save when query returns fresh data
    useEffect(() => {
        if (total !== undefined && !isLoading && !isError) {
            saveMutation.mutate(total);
        }
    }, [total]); // Only runs when 'total' changes (deduplicated by React Query)

    const handleRefresh = () => {
        refetch(); // This will trigger the effect again if data changes
    };

    return (
        <div className="flex items-center gap-6 p-6 bg-white border border-border rounded-xl mb-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <DollarSign className="w-32 h-32" />
            </div>

            <div className="relative z-10 p-3 bg-mantle text-text border border-border rounded-lg shadow-sm">
                <Calculator className="w-6 h-6" />
            </div>
            
            <div className="flex flex-col flex-1 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-subtext uppercase tracking-[0.2em]">Aggregate_Balance</span>
                    {saveMutation.isSuccess && <CheckCircle2 className="w-3 h-3 text-green-600 animate-in fade-in" />}
                </div>
                <div className="text-3xl font-serif font-bold text-text tracking-tight flex items-baseline gap-1">
                    <span className="text-lg text-subtext font-sans font-light">$</span>
                    {isLoading ? (
                        <span className="animate-pulse opacity-50 text-lg font-sans uppercase">Syncing_Nodes...</span>
                    ) : (
                        (total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    )}
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 relative z-10">
                <button 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className={clsx(
                        "p-2 rounded-lg border transition-all active:scale-95",
                        isLoading ? "bg-accent/10 border-accent text-accent" : "bg-white border-border text-subtext hover:text-text hover:border-accent"
                    )}
                    title="Recalculate from Linked Assets"
                >
                    <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
                </button>
                <span className="text-[7px] font-black text-subtext/40 uppercase tracking-widest">LIVE_LINK</span>
            </div>
        </div>
    );
}
