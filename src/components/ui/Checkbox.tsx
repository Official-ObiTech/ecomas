import { InputHTMLAttributes } from "react";
import { Text } from "./Text";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Checkbox({ label, id, className = "", ...rest }: CheckboxProps) {
  const cbId = id || rest.name;
  return (
    <label htmlFor={cbId} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        id={cbId}
        type="checkbox"
        className={`h-4 w-4 rounded border-[var(--color-line)] accent-[var(--color-brand)] ${className}`}
        {...rest}
      />
      {label && <Text size="sm" color="var(--color-muted)">{label}</Text>}
    </label>
  );
}