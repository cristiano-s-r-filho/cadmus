import { clsx } from 'clsx';

interface SelectFieldProps {
    value: any;
    options?: string[];
    readOnly?: boolean;
    onFocus: () => void;
    onBlur: () => void;
    onChange: (val: string) => void;
}

export const SelectField = ({ value, options, readOnly, onFocus, onBlur, onChange }: SelectFieldProps) => (
    <select 
        className={clsx(
            "w-full bg-transparent text-xs font-black text-text outline-none appearance-none cursor-pointer uppercase tracking-widest",
            readOnly && "pointer-events-none opacity-60"
        )}
        value={value}
        disabled={readOnly}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
    >
        <option value="">:: SIGNAL_PENDING ::</option>
        {options?.map((opt: string) => (
            <option key={opt} value={opt} className="bg-surface">{opt.toUpperCase()}</option>
        ))}
    </select>
);
