import { User, ShieldCheck, Zap } from 'lucide-react';
import React from 'react';
import { useAuthStore } from '../../auth/authStore';
import { useTranslation } from '../../../kernel/i18n';

export const ProfileSettings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [avatar, setAvatar] = React.useState<string | null>(user?.avatar_url || null);
  const [email, setEmail] = React.useState(user?.email || '');
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { getAuthHeaders } = await import('../../../kernel/data/authHeaders');
      const res = await fetch('/api/v1/auth/profile', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ user_id: user.id, avatar_url: avatar, email }),
      });
      if (res.ok) {
        updateUser({ avatar_url: avatar });
      }
    } catch (e) {
      console.error("Profile sync fail", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-2 duration-500 font-ui">
      <div className="flex items-center gap-8 pb-12 border-b-2 border-border/30">
        <div className="relative group">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 bg-base border-2 border-border hover:border-accent transition-all cursor-pointer overflow-hidden shadow-hard flex items-center justify-center text-accent font-black text-4xl"
            >
              {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="avatar" /> : user?.username.slice(0, 2).toUpperCase()}
            </div>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-3 bg-accent text-base shadow-hard opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Zap className="w-4 h-4" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-text uppercase tracking-tighter">{user?.username}</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-accent/10 text-[10px] font-black text-accent uppercase border-2 border-accent/20">
                SOVEREIGN_NODE
            </span>
            <span className="text-[10px] font-black text-subtext uppercase opacity-40 tracking-widest">ID: {user?.id.slice(0, 12)}...</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
           <label className="text-[10px] font-black text-subtext uppercase tracking-[0.2em] flex items-center gap-2">
               <User className="w-3 h-3" /> Username_Identifier
           </label>
           <div className="w-full bg-muted/30 border-2 border-border/50 px-5 py-4 text-sm font-black text-subtext/50 uppercase tracking-widest cursor-not-allowed">
               {user?.username}
           </div>
        </div>
        <div className="space-y-3">
           <label className="text-[10px] font-black text-subtext uppercase tracking-[0.2em] flex items-center gap-2">
               <ShieldCheck className="w-3 h-3" /> Recovery_Email_Link
           </label>
           <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@cadmus.os" 
                className="w-full bg-base border-2 border-border px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all text-text uppercase tracking-widest" 
            />
        </div>
      </div>

      <div className="pt-8 border-t-2 border-border/30 flex justify-end">
          <button 
            className="px-10 h-14 bg-accent text-base shadow-hard uppercase font-black text-xs tracking-[0.2em] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50" 
            onClick={handleSave} 
            disabled={loading}
          >
              {loading ? 'SYNCING_METADATA...' : 'SAVE_OPERATIONAL_CONFIG'}
          </button>
      </div>
    </div>
  );
};
