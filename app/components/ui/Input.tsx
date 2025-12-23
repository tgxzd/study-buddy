import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = "text", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-background-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border-2 border-background-200 bg-white px-4 text-sm text-background-900 transition-all duration-200",
            "placeholder:text-background-400",
            "focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error-500 focus:border-error-500 focus:ring-error-500/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
