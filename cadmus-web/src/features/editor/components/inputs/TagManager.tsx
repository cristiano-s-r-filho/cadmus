import { useState, useEffect } from 'react';
import { dataService } from '../../../../kernel/data/DataServiceProvider';
import { useAuthStore } from '../../../auth/authStore';
import { Hash, X, Plus, Link2 } from 'lucide-react';
import { clsx } from 'clsx';

interface TagManagerProps {
    docId: string;
    localTags: string[];
    onUpdate: (newTags: string[]) => void;
}

export function TagManager({ docId, localTags, onUpdate }: TagManagerProps) {
    const { user } = useAuthStore();
    const [inheritedTags, setInheritedTags] = useState<string[]>([]);
    const [inputValue, setValue] = useState('');

    useEffect(() => {
        if (!docId || !user?.token) return;
        
        // Fetch ALL tags (Inherited + Local) from API
        dataService.getTags(docId)
            .then((allTags: string[]) => {
                if (Array.isArray(allTags)) {
                    const inherited = allTags.filter(t => !localTags.includes(t));
                    setInheritedTags(inherited);
                } else {
                    setInheritedTags([]);
                }
            })
            .catch(() => setInheritedTags([]));
    }, [docId, localTags, user?.token]);

    const addTag = () => {
        const tag = inputValue.trim().toLowerCase().replace(/#/g, '');
        if (tag && !localTags.includes(tag)) {
            onUpdate([...localTags, tag]);
            setValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onUpdate(localTags.filter(t => t !== tagToRemove));
    };

    const tagsToRender = Array.isArray(localTags) ? localTags : [];

    return (
        <div className="flex flex-wrap gap-2 items-center p-2">
            {/* Tags Herdadas (Read Only) */}
            {inheritedTags.map(tag => (
                <div key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/5 border border-accent/20 rounded-full text-[10px] font-bold text-accent/60 italic">
                    <Link2 className="w-3 h-3" />
                    <span>{tag}</span>
                </div>
            ))}

            {/* Tags Locais (Editable) */}
            {tagsToRender.map(tag => (
                <div key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent rounded-full text-[10px] font-black text-accent uppercase tracking-wider group transition-all hover:bg-accent hover:text-crust">
                    <Hash className="w-3 h-3" />
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100">
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}

            {/* Input de Nova Tag */}
            <div className="flex items-center gap-2 ml-2">
                <input 
                    type="text"
                    placeholder="ADD_TAG..."
                    className="bg-transparent border-none outline-none text-[10px] font-bold text-subtext uppercase tracking-widest w-20 focus:w-32 transition-all"
                    value={inputValue}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <button onClick={addTag} className="p-1 hover:bg-accent/10 rounded">
                    <Plus className="w-3 h-3 text-accent" />
                </button>
            </div>
        </div>
    );
}
