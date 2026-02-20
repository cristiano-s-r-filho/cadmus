import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Trash2, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { WorkspaceNode } from './data/DataServiceProvider';
import { ClassIcon } from '../design-system/ClassIcon';
import { dataService } from './data/DataServiceProvider';
import { useAuthStore } from '../features/auth/authStore';
import { clsx } from 'clsx';

interface Props {
  doc: WorkspaceNode;
  allDocs: WorkspaceNode[];
  depth?: number;
}

export const SidebarTreeItem = ({ doc, allDocs, depth = 0 }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsLoading] = useState(false);
  const user = useAuthStore((state: any) => state.user);
  const location = useLocation();
  const children = allDocs.filter(d => d.parent_id === doc.id);
  const hasChildren = children.length > 0;
  const isActive = location.pathname.includes(`/editor/${doc.id}`);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm(`Permanently delete "${doc.title}" and all its descendants?`)) return;
    
    setIsLoading(true);
    try {
        await dataService.deleteDoc(doc.id, user.id);
        window.location.reload(); // Quick refresh to update tree
    } catch (err) {
        console.error("Delete failed", err);
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Link to={`/editor/${doc.id}`}>
        <div 
          className={clsx(
            "group flex items-center gap-2 py-1 px-4 cursor-pointer transition-none relative",
            isActive ? "bg-accent/10 border-l-2 border-accent" : "hover:bg-accent/5"
          )}
          style={{ paddingLeft: `${depth * 12 + 16}px` }}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {hasChildren ? (
              <button 
                onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                className="hover:bg-accent/20 rounded-sm"
              >
                {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : <div className="w-3" />}
            
            <ClassIcon classId={doc.class_id} className={clsx("w-3 h-3 shrink-0", isActive ? "text-accent" : "text-subtext")} />
            <span className={clsx(
                "text-[11px] truncate uppercase tracking-tight",
                isActive ? "font-black text-accent" : "font-medium text-text"
            )}>
              {doc.title || "UNTITLED"}
            </span>
          </div>

          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-terminal-red transition-all"
          >
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        </div>
      </Link>

      {isOpen && hasChildren && (
        <div className="flex flex-col">
          {children.map(child => (
            <SidebarTreeItem key={child.id} doc={child} allDocs={allDocs} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
