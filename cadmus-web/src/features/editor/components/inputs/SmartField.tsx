import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FieldDefinition, dataService } from '../../../../kernel/data/DataServiceProvider';
import { useAuthStore } from '../../../auth/authStore';
import { SovereignCrypto } from '../../../../kernel/security/crypto';
import { clsx } from 'clsx';
import { Loader2, ShieldCheck } from 'lucide-react';
import * as Y from 'yjs';

// Modular Input Fields
import { MoneyField } from './fields/MoneyField';
import { SelectField } from './fields/SelectField';
import { TextField } from './fields/TextField';

interface SmartFieldProps {
    docId: string;
    field: FieldDefinition;
    initialValue?: any;
    ydoc?: Y.Doc;
}

export function SmartField({ docId, field, initialValue, ydoc }: SmartFieldProps) {
    const { user, vaultSecret } = useAuthStore();
    const [value, setValue] = useState<any>(''); 
    const [isDecrypting, setIsDecrypting] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFocused = useRef(false);

    useEffect(() => {
        const sync = async () => {
            if (isFocused.current) return;
            
            let finalValue = initialValue;
            
            if (SovereignCrypto.isEncrypted(initialValue)) {
                if (user && vaultSecret) {
                    setIsDecrypting(true);
                    finalValue = await SovereignCrypto.decrypt(initialValue, vaultSecret, user.id);
                    setIsDecrypting(false);
                } else {
                    setValue('');
                    return;
                }
            }
            
            const normalized = (finalValue === 0 || finalValue === "0") ? 0 : (finalValue ?? '');
            setValue(normalized);
        };
        sync();
    }, [initialValue, user, vaultSecret, field.key]);

    const mutation = useMutation({
        mutationFn: async (val: any) => {
            if (!user || !vaultSecret) return;
            if (val.toString() === (initialValue ?? '').toString()) return;

            let finalValue = val;
            if (field.type === 'money' && val !== '' && !isNaN(parseFloat(val))) {
                finalValue = parseFloat(val);
            }

            if (field.confidential && finalValue !== undefined && finalValue !== '') {
                finalValue = await SovereignCrypto.encrypt(String(finalValue), vaultSecret, user.id);
            }
            
            await dataService.updateProperty(docId, field.key, finalValue, user.id);

            if (ydoc) {
                const propsMap = ydoc.getMap('properties');
                if (propsMap.get(field.key) !== finalValue) {
                    propsMap.set(field.key, finalValue);
                }
            }
        }
    });

    const handleChange = (newValue: any) => {
        if (field.read_only) return;
        setValue(newValue);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => mutation.mutate(newValue), 1500);
    };

    const handleBlur = () => {
        isFocused.current = false;
        if (field.read_only) return;
        if ((value ?? '').toString() !== (initialValue ?? '').toString()) {
            mutation.mutate(value);
        }
    };

    const handleFocus = () => { isFocused.current = true; };

    let statusUI = null;
    if (isDecrypting || mutation.isPending) statusUI = <Loader2 className="w-3 h-3 animate-spin text-accent" />;
    else if (mutation.isSuccess) statusUI = <div className="w-2 h-2 bg-accent shadow-[0_0_5px_var(--color-accent)] animate-pulse" />;

    return (
        <div className={clsx(
            "flex items-center gap-6 w-full py-3 group transition-all border-b border-border/10 last:border-none",
            (field.read_only || isDecrypting) && "opacity-70"
        )}>
            <div className="w-40 shrink-0 flex items-center gap-3">
                {field.confidential && <ShieldCheck className="w-3 h-3 text-accent" />}
                <span className="text-[10px] font-black text-subtext uppercase tracking-[0.2em] truncate">{field.label}</span>
            </div>

            <div className="flex-1 relative flex items-center">
                {field.type === 'select' ? (
                    <SelectField 
                        value={value} 
                        options={field.options} 
                        readOnly={field.read_only} 
                        onFocus={handleFocus} 
                        onBlur={handleBlur} 
                        onChange={handleChange} 
                    />
                ) : field.type === 'money' ? (
                    <MoneyField 
                        value={value} 
                        currency={field.currency} 
                        readOnly={field.read_only} 
                        onFocus={handleFocus} 
                        onBlur={handleBlur} 
                        onChange={handleChange} 
                    />
                ) : (
                    <TextField 
                        value={value} 
                        type={field.type} 
                        readOnly={field.read_only} 
                        placeholder={field.confidential ? '[ENCRYPTED_STREAM]' : ":: SIGNAL_IDLE ::"}
                        onFocus={handleFocus} 
                        onBlur={handleBlur} 
                        onChange={handleChange} 
                    />
                )}
                <div className="absolute right-0 flex items-center pr-2">{statusUI}</div>
            </div>
        </div>
    );
}
