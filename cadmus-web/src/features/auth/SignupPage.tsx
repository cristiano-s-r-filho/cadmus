import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { UserPlus, Cpu, ArrowRight } from 'lucide-react';

export const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setVaultSecret } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) throw new Error('Registration Signal Refused');
      
      const data = await res.json();
      
      // 1. Set identity
      setUser(data);
      
      // 2. Derive Vault Key (Transient)
      setVaultSecret(password);
      
      navigate('/dashboard');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base font-ui overflow-hidden p-6">
      {/* Background Texture Detail */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(var(--fg-text)_1px,transparent_0)] [background-size:30px_30px]" />

      <div className="w-full max-w-md bg-surface border-2 border-border shadow-hard relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Ribbon */}
        <div className="h-2 bg-accent w-full" />
        
        <div className="p-12">
            <div className="flex flex-col gap-4 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent text-base shadow-hard">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-text leading-none pt-1">
                        Spawn<br/><span className="text-accent opacity-80">Operator</span>
                    </h1>
                </div>
                <p className="text-[10px] font-black text-subtext uppercase tracking-[0.3em] opacity-60">Registering_Unique_Signature</p>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-accent/5 border-2 border-accent text-accent text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                    Signal_Error: {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-subtext uppercase tracking-[0.2em]">New_Operator_ID</label>
                <input 
                    autoFocus
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-base border-2 border-border px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all text-text uppercase tracking-widest"
                    required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-subtext uppercase tracking-[0.2em]">Sovereign_Master_Key</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-base border-2 border-border px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all text-text uppercase tracking-widest"
                    required 
                />
                <p className="text-[8px] font-black text-subtext uppercase tracking-widest opacity-40">Minimum_8_Entropy_Characters</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-accent text-base font-black uppercase text-xs tracking-[0.3em] shadow-hard active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 group"
              >
                {loading ? 'INITIALIZING_CORE...' : (
                    <>
                        INITIALIZE_ACCOUNT
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t-2 border-border/30 flex justify-between items-center">
                <span className="text-[9px] font-black text-subtext uppercase tracking-widest">Already_Active?</span>
                <Link to="/login" className="text-[10px] font-black text-accent hover:underline uppercase tracking-tighter flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5" /> ACCESS_CONSOLES
                </Link>
            </div>
        </div>
      </div>
      
      <div className="mt-10 flex flex-col items-center gap-2 text-[9px] font-black text-subtext uppercase tracking-[0.5em] opacity-40 text-center">
        <span>Cadmus_Node_Registration_v0.1.0</span>
        <span>Secure_Derivation_Chain::PBKDF2_HMAC_SHA256</span>
      </div>
    </div>
  );
};