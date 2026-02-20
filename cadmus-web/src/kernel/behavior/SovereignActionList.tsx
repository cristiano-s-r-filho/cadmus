import React from 'react';
import * as Y from 'yjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getActionsForClass } from './BehaviorRegistry';
import { useAuthStore } from '../../features/auth/authStore';
import { SovereignButton } from '../../components/ui';
import { Loader2 } from 'lucide-react';

interface Props {
    classId: string;
    docId: string;
    properties: any;
    ydoc?: Y.Doc;
}

export function SovereignActionList({ classId, docId, properties, ydoc }: Props) {
    const { user, vaultSecret } = useAuthStore();
    const queryClient = useQueryClient();
    const actions = getActionsForClass(classId);

    const mutation = useMutation({
        mutationFn: async (action: any) => {
            if (!user) return;
            const result = await action.execute(docId, user.id, properties, vaultSecret);
            
            // REACTIVE INJECTION: 
            if (ydoc && result?.key && result?.value !== undefined) {
                console.log(`[Behavior] Injecting ${result.key} into Yjs:`, result.value);
                const propsMap = ydoc.getMap('properties');
                propsMap.set(result.key, result.value);
            }
            
            return result;
        },
        onSuccess: () => {
            console.log("[Behavior] Action executed successfully.");
            queryClient.invalidateQueries({ queryKey: ['doc', docId] });
        }
    });

    if (actions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-3 py-4 border-y border-accent-border/10 mb-6">
            {actions.map(action => (
                <SovereignButton
                    key={action.id}
                    variant="secondary"
                    size="sm"
                    className="gap-2 group shadow-sm hover:border-accent"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate(action)}
                >
                    {mutation.isPending && (mutation.variables as any)?.id === action.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <action.icon className="w-3.5 h-3.5 group-hover:text-accent" />
                    )}
                    <span className="text-[9px] font-black uppercase tracking-widest">{action.label}</span>
                </SovereignButton>
            ))}
        </div>
    );
}