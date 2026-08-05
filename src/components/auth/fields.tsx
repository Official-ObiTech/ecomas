import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Text } from "@/components/ui/Text";

const base =
  "w-full border-0 border-b bg-transparent py-3 text-base outline-none transition-colors " +
  "border-line text-ink placeholder:text-muted focus:border-ink " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { error, className = "", ...props }, ref
) {
  return (
    <div>
      <input ref={ref} className={`${base} ${className}`} {...props} />
      {error && <Text size="xs" color="var(--color-danger)" className="mt-1.5">{error}</Text>}
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(function PasswordField(
  { error, disabled, className = "", ...props }, ref
) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <input ref={ref} type={show ? "text" : "password"} disabled={disabled}
          className={`${base} pr-8 ${className}`} {...props} />
        <button type="button" onClick={() => setShow((s) => !s)} disabled={disabled}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-ink disabled:opacity-60">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <Text size="xs" color="var(--color-danger)" className="mt-1.5">{error}</Text>}
    </div>
  );
});

export function PhoneField({ value, onChange, disabled, error }: {
  value?: string; onChange: (v?: string) => void; disabled?: boolean; error?: string;
}) {
  return (
    <div>
      <PhoneInput international defaultCountry="NG" value={value} onChange={onChange}
        disabled={disabled} placeholder="Phone number"
        className={`${base} [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-base`} />
      {error && <Text size="xs" color="var(--color-danger)" className="mt-1.5">{error}</Text>}
    </div>
  );
}