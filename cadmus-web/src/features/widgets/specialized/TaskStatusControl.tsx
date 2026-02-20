import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Clock, Loader2, AlertCircle } from 'lucide-react';
import { dataService } from '../../../kernel/data/DataServiceProvider';
import { useAuthStore } from '../../auth/authStore';
import { clsx } from 'clsx';

export function TaskStatusControl({ docId, initialStatus }: { docId: string, initialStatus?: string }) {
    const [status, setStatus] = useState(initialStatus || 'PENDING');
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();

    // Sync prop changes (e.g. from parent re-render)
    useEffect(() => {
        if (initialStatus) setStatus(initialStatus);
    }, [initialStatus]);

    const mutation = useMutation({
        mutationFn: async (newStatus: string) => {
            if (!user) throw new Error("No user");
            return dataService.updateProperty(docId, 'status', newStatus, user.id);
        },
        onSuccess: (data, newStatus) => {
            setStatus(newStatus);
            // Invalidate parent query so the UI refreshes if needed
            queryClient.invalidateQueries({ queryKey: ['doc', docId] });
        }
    });

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mutation.isPending) return;
        const next = status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        mutation.mutate(next);
    };

    const isPending = mutation.isPending;
    const isError = mutation.isError;

    return (
        <div 
            onClick={toggle}
            className={clsx(
                "flex items-center gap-4 p-4 border rounded-xl mb-4 cursor-pointer transition-all select-none group relative overflow-hidden",
                status === 'COMPLETED' 
                    ? "bg-white border-green-200 shadow-sm" 
                    : "bg-white border-border hover:border-accent hover:shadow-md",
                isError && "border-red-300 bg-red-50"
            )}
        >
            <div className={clsx(
                "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                status === 'COMPLETED' ? "bg-green-600" : "bg-subtext group-hover:bg-accent",
                isError && "bg-red-500"
            )} />

            <div className={clsx(
                "p-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10",
                status === 'COMPLETED' ? "bg-green-100 text-green-700" : "bg-mantle text-subtext group-hover:text-accent"
            )}>
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                 isError ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                 status === 'COMPLETED' ? <CheckSquare className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-subtext">Operational_Status</span>
                <span className={clsx(
                    "text-sm font-bold uppercase tracking-wide",
                    status === 'COMPLETED' ? "text-green-700" : "text-text",
                    isError && "text-red-600"
                )}>
                    {isError ? "SYNC_FAILURE" : status === 'COMPLETED' ? 'MISSION_ACCOMPLISHED' : 'AWAITING_EXECUTION'}
                </span>
            </div>
        </div>
    );
}
