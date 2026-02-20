import { clsx } from 'clsx';

interface MoneyFieldProps {
    value: any;
    readOnly?: boolean;
    currency?: string;
    onFocus: () => void;
    onBlur: () => void;
    onChange: (val: string) => void;
}

export const MoneyField = ({ value, readOnly, currency, onFocus, onBlur, onChange }: MoneyFieldProps) => {
    // PROTECT AGAINST ENCRYPTED LEAKS
    const displayValue = (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) ? value : '';

    return (
        <div className="w-full flex items-center gap-3">
            <span className="text-[9px] font-black text-accent opacity-50 tracking-tighter">{currency || 'USD'}</span>
            <input 
                type="number"
                disabled={readOnly}
                className={clsx(
                    "w-full bg-transparent text-xs font-black text-text outline-none uppercase tracking-widest",
                    readOnly ? "text-accent font-content italic" : "placeholder:text-subtext/20"
                )}
                value={displayValue}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0.00"
            />
        </div>
    );
};
