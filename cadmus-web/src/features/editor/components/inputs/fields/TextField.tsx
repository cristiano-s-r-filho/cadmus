import { clsx } from 'clsx';

interface TextFieldProps {
    value: any;
    type?: string;
    readOnly?: boolean;
    placeholder?: string;
    onFocus: () => void;
    onBlur: () => void;
    onChange: (val: string) => void;
}

export const TextField = ({ value, type, readOnly, placeholder, onFocus, onBlur, onChange }: TextFieldProps) => (
    <input 
        type={type || 'text'}
        className={clsx(
            "w-full bg-transparent text-xs font-black text-text outline-none uppercase tracking-widest",
            readOnly ? "text-accent font-content italic" : "placeholder:text-subtext/20"
        )}
        disabled={readOnly}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "..."}
    />
);
