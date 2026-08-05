import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { Text } from "./Text";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, leftIcon, rightIcon, containerClassName = "", id, className = "", ...rest },
  ref
) {
  const inputId = id || rest.name;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <Text as="label" htmlFor={inputId} size="sm" weight="medium"
          className="mb-1.5 block" color="var(--color-ink)">
          {label}
        </Text>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "h-11 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-sm outline-none transition",
            "focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]",
            leftIcon ? "pl-10" : "pl-3.5",
            rightIcon ? "pr-10" : "pr-3.5",
            error ? "border-[var(--color-danger)]" : "border-[var(--color-line)]",
            className,
          ].join(" ")}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <Text size="xs" color="var(--color-danger)" className="mt-1">
          {error}
        </Text>
      )}
    </div>
  );
});