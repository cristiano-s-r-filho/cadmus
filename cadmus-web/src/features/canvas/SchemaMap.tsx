import React, { useMemo, useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  NodeProps,
  BaseEdge,
  EdgeProps,
  getBezierPath,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuthStore } from '../auth/authStore';
import { getAllDocs, getLinks, createLink } from '../../kernel/tauri_bridge';
import { clsx } from 'clsx';
import { Database, Activity, GitBranch } from 'lucide-react';

const DocumentNode = ({ data }: NodeProps) => {
  const classId = data.class_id || 'note';
  const properties = data.properties || {};
  const mass = properties.mass !== undefined ? Number(properties.mass).toFixed(1) : '1.0';
  const entropy = properties.entropy !== undefined ? Math.round(Number(properties.entropy) * 100) : 0;

  return (
    <div className={clsx(
        "min-w-[260px] bg-surface border-2 border-border shadow-hard p-6 transition-all group relative",
        data.isExpanded ? "ring-4 ring-accent/10" : ""
    )}>
      <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-accent !border-4 !border-base" />
      
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
            <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">{classId}::PROTO</span>
            <div className="text-[8px] font-mono opacity-30">0x{data.id?.slice(0,8).toUpperCase()}</div>
        </div>

        <div className="flex flex-col gap-2">
            <span className="font-black text-sm uppercase tracking-tight text-text leading-tight">{data.label}</span>
            <div className="flex gap-4 mt-1">
                <span className="text-[8px] font-black text-subtext uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-3 h-3 text-accent" /> {mass}M
                </span>
                <span className={clsx("text-[8px] font-black uppercase tracking-widest flex items-center gap-2", entropy > 50 ? "text-accent" : "text-subtext")}>
                    <Activity className="w-3 h-3" /> {entropy}%_ENTR
                </span>
            </div>
        </div>

        {/* Dynamic Properties */}
        <div className="bg-base/50 border-2 border-border p-4 space-y-2">
            {Object.keys(properties).length > 0 ? (
                Object.entries(properties)
                    .filter(([k]) => !['mass','entropy','tags','id','parent_id'].includes(k))
                    .slice(0,3)
                    .map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                        <span className="opacity-40">{k}</span>
                        <span className="text-text truncate ml-4">
                            {typeof v === 'object' ? 'OBJ' : String(v).slice(0,15)}
                        </span>
                    </div>
                ))
            ) : (
                <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">Signal_Terminated</span>
            )}
        </div>

        {(classId === 'project' || classId === 'container' || classId === 'ledger') && (
            <button 
                onClick={(e) => { e.stopPropagation(); data.onToggleExpand(); }}
                className={clsx(
                    "w-full mt-2 py-3 text-[9px] font-black uppercase transition-all border-2",
                    data.isExpanded ? "bg-accent text-base border-accent shadow-hard" : "bg-transparent text-accent border-accent hover:bg-accent/5"
                )}
            >
                {data.isExpanded ? 'COLAPSE_HIERARCHY' : 'RESOLVE_CHILDREN'}
            </button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-accent !border-4 !border-base" />
    </div>
  );
};

const KineticEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) => {
  const [edgePath] = getBezierPath({ 
      sourceX, sourceY, sourcePosition, 
      targetX, targetY, targetPosition,
      curvature: 0.8 
  });
  return (
    <g className="react-flow__edge-kinetic">
        <BaseEdge 
            path={edgePath} 
            markerEnd={markerEnd} 
            style={{ 
                ...style, 
                strokeWidth: 6, 
                stroke: 'rgb(var(--color-accent))', 
                opacity: 0.15 
            }} 
        />
        <BaseEdge 
            path={edgePath} 
            style={{ 
                ...style, 
                strokeWidth: 1.5, 
                stroke: 'rgb(var(--color-accent))', 
                opacity: 0.7 
            }} 
        />
    </g>
  );
};

const nodeTypes = { document: DocumentNode };
const edgeTypes = { kinetic: KineticEdge };

export function SchemaMap() {
  const user = useAuthStore(state => state.user);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const onToggleExpand = useCallback((id: string) => {
      setExpandedNodes(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    
    getAllDocs(user.id).then(data => {
        const processedNodes: any[] = [];
        const hierarchyEdges: any[] = [];
        
        // BALANCED TREE LAYOUT ALGORITHM
        const NODE_WIDTH = 350;
        const NODE_HEIGHT = 550; // Significant vertical clearance
        
        const calculateTreeWidth = (docId: string): number => {
            if (!expandedNodes.has(docId)) return NODE_WIDTH;
            const children = data.filter((d: any) => d.parent_id === docId);
            if (children.length === 0) return NODE_WIDTH;
            // Balance with gaps
            return children.reduce((sum: number, child: any) => sum + calculateTreeWidth(child.id), 0) + (children.length * 50);
        };

        const layoutSubtree = (doc: any, x: number, y: number) => {
            processedNodes.push({
                id: doc.id,
                type: 'document',
                position: { x, y },
                data: { 
                    ...doc,
                    label: doc.title, 
                    onToggleExpand: () => onToggleExpand(doc.id),
                    isExpanded: expandedNodes.has(doc.id),
                }
            });

            if (!expandedNodes.has(doc.id)) return;

            const children = data.filter((d: any) => d.parent_id === doc.id);
            const totalWidth = calculateTreeWidth(doc.id);
            let currentX = x - totalWidth / 2 + NODE_WIDTH / 2;

            children.forEach((child: any) => {
                const childWidth = calculateTreeWidth(child.id);
                const childX = currentX + childWidth / 2 - NODE_WIDTH / 2;
                
                hierarchyEdges.push({
                    id: `h-${doc.id}-${child.id}`,
                    source: doc.id,
                    target: child.id,
                    type: 'kinetic',
                    style: { strokeDasharray: '5,5' }
                });

                layoutSubtree(child, childX, y + NODE_HEIGHT);
                currentX += childWidth;
            });
        };

        const roots = data.filter((d: any) => !d.parent_id);
        let currentRootX = 0;
        roots.forEach((root: any) => {
            const rootWidth = calculateTreeWidth(root.id);
            layoutSubtree(root, currentRootX + rootWidth / 2, 0);
            currentRootX += rootWidth + 100; // Gap between root trees
        });

        setNodes(processedNodes);
        
        getLinks(user.id).then(linkData => {
            const manualEdges = linkData.map(([from, to]: [string, string]) => ({
                id: `e-${from}-${to}`,
                source: from,
                target: to,
                type: 'kinetic',
                animated: true,
                style: { strokeWidth: 2, opacity: 0.8 }
            }));
            setEdges([...hierarchyEdges, ...manualEdges]);
        });
    }).catch(console.error);
  }, [user, expandedNodes, onToggleExpand]);

  return (
    <div className="h-full w-full bg-base overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none scanlines" />
      <div className="absolute top-8 left-8 z-10 flex items-center gap-4 bg-surface border-2 border-border p-4 shadow-hard">
          <GitBranch className="w-5 h-5 text-accent" />
          <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-text">Sovereign_Topology</span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-subtext opacity-60">Schema_Map_v2.1</span>
          </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={(p) => { if (p.source && p.target) { createLink(p.source, p.target); setEdges((eds) => addEdge({ ...p, type: 'kinetic', animated: true }, eds)); }}}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
      >
        <Background color="transparent" />
        <Controls className="bg-surface border-2 border-border fill-accent rounded-none shadow-hard" />
      </ReactFlow>
    </div>
  );
}