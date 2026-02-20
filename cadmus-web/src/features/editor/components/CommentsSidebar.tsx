import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { MessageSquare, Send, X, Trash2 } from 'lucide-react';
import { Button } from '../../../design-system';
import { useAuthStore } from '../../auth/authStore';
import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

interface Thread {
  id: string;
  comments: Comment[];
  resolved: boolean;
}

export function CommentsSidebar({ editor, ydoc }: { editor: Editor | null, ydoc: Y.Doc }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const user = useAuthStore(state => state.user);

  // Yjs sync logic for comments
  const threadsMap = ydoc.getMap<Thread>('comments_threads');

  useEffect(() => {
    const observer = () => {
      setThreads(Array.from(threadsMap.values()));
    };
    threadsMap.observe(observer);
    observer();
    return () => threadsMap.unobserve(observer);
  }, [threadsMap]);

  const addComment = () => {
    if (!user || !newComment.trim()) return;

    const threadId = activeThreadId || uuidv4();
    const existingThread = threadsMap.get(threadId);

    const comment: Comment = {
      id: uuidv4(),
      userId: user.id,
      userName: user.username,
      content: newComment,
      timestamp: Date.now()
    };

    if (existingThread) {
      existingThread.comments.push(comment);
      threadsMap.set(threadId, { ...existingThread });
    } else {
      // If editor exists, we try to set a mark. If not (spreadsheet), it's a global doc comment.
      if (editor) {
        editor.chain().focus().setMark('comment', { id: threadId }).run();
      }
      
      threadsMap.set(threadId, {
        id: threadId,
        comments: [comment],
        resolved: false
      });
    }

    setNewComment('');
    setActiveThreadId(null);
  };

  const deleteThread = (id: string) => {
    threadsMap.delete(id);
    // Ideally we should also remove the mark from the document
  };

  return (
    <div className="w-80 hidden 2xl:flex flex-col gap-4 p-6 border-l border-accent-border/20 h-full bg-mantle/50 overflow-hidden">
      <div className="flex items-center gap-2 text-subtext mb-2 border-b border-accent-border/10 pb-4">
        <MessageSquare className="w-4 h-4 text-accent" />
        <span className="text-[10px] font-black uppercase tracking-widest text-text">Review_Threads</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        {threads.map(thread => (
          <div key={thread.id} className="p-4 bg-base border border-accent-border/30 rounded-xl space-y-3 shadow-sm hover:border-accent/30 transition-all">
            <div className="flex justify-between items-center border-b border-accent-border/10 pb-2">
              <span className="text-[8px] font-mono text-subtext uppercase">Thread: 0x{thread.id.slice(0, 8)}</span>
              <button onClick={() => deleteThread(thread.id)} className="text-subtext hover:text-terminal-red">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {thread.comments.map(c => (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase">
                    <span className="text-accent">{c.userName}</span>
                    <span className="text-subtext/50">{new Date(c.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-text font-medium leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-accent-border/20 space-y-3">
        <textarea 
          className="w-full h-20 bg-crust border border-accent-border/30 rounded-xl p-3 text-xs text-text font-medium outline-none focus:border-accent transition-all resize-none"
          placeholder="ADD_COMMENT..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button variant="secondary" className="w-full h-10 gap-2 text-[10px] uppercase font-black" onClick={addComment}>
          <Send className="w-3 h-3" /> POST_REMARK
        </Button>
      </div>
    </div>
  );
}
