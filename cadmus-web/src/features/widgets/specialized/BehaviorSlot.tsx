import React, { useEffect, useState } from 'react';
import { LedgerSummation } from './LedgerSummation';
import { TaskStatusControl } from './TaskStatusControl';
import { dataService, Archetype } from '../../../kernel/data/DataServiceProvider';

interface BehaviorSlotProps {
    classId: string;
    docId: string;
    properties: any;
}

export function BehaviorSlot({ classId, docId, properties }: BehaviorSlotProps) {
    const [archetype, setArchetype] = useState<Archetype | null>(null);

    useEffect(() => {
        dataService.getArchetypes().then(list => {
            const found = list.find(a => a.id === classId);
            if (found) setArchetype(found);
        });
    }, [classId]);

    if (!archetype) return null;

    // Map rules to components
    // If behavior_rules is empty, we might fallback to classId for legacy support
    const rules = archetype.behavior_rules || {};
    const widgets = [];

    // Rule: "status_toggle": true (Used by Task)
    if (rules['status_toggle'] || classId === 'task') {
        widgets.push(<TaskStatusControl key="task-ctrl" docId={docId} initialStatus={properties.status} />);
    }

    // Rule: "ledger_sum": true (Used by Ledger/Finance)
    if (rules['ledger_sum'] || classId === 'ledger') {
        widgets.push(<LedgerSummation key="ledger-sum" docId={docId} />);
    }

    // Future: "pomodoro_timer": true
    // Future: "meeting_actions": true

    if (widgets.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            {widgets}
        </div>
    );
}
