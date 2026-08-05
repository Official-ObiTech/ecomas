import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label = "Password", error, ...rest }, ref) {
    const [show, setShow] = useState(false);

    return (
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        label={label}
        error={error}
        rightIcon={
          <button type="button" onClick={() => setShow((s) => !s)}
            className="pointer-events-auto" tabIndex={-1}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        {...rest}
      />
    );
  }
);
