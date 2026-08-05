import "react-phone-number-input/style.css";
import PhoneInputBase from "react-phone-number-input";
import { Text } from "./Text";

interface PhoneFieldProps {
  label?: string;
  value?: string;
  onChange: (value?: string) => void;
  error?: string;
  defaultCountry?: string;
}

export function PhoneField({
  label = "Phone number",
  value,
  onChange,
  error,
  defaultCountry = "NG",
}: PhoneFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <Text as="label" size="sm" weight="medium" className="mb-1.5 block">
          {label}
        </Text>
      )}
      <div
        className={[
          "flex h-11 items-center rounded-[var(--radius-md)] border px-3.5",
          "focus-within:border-[var(--color-brand)] focus-within:ring-1 focus-within:ring-[var(--color-brand)]",
          error ? "border-[var(--color-danger)]" : "border-[var(--color-line)]",
        ].join(" ")}
      >
        <PhoneInputBase
          international
          defaultCountry={defaultCountry as any}
          value={value}
          onChange={onChange}
          className="w-full [&_input]:outline-none [&_input]:bg-transparent [&_input]:text-sm"
        />
      </div>
      {error && <Text size="xs" color="var(--color-danger)" className="mt-1">{error}</Text>}
    </div>
  );
}