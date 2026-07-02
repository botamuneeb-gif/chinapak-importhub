import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: string;
  type?: "email" | "password" | "tel" | "text";
};

export function AuthInput({
  autoComplete,
  id,
  label,
  placeholder,
  required = false,
  type = "text",
  className,
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-navy" htmlFor={id}>
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className={cn(
          "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text placeholder:text-brand-muted focus:border-brand-emerald focus:outline-none focus:ring-2 focus:ring-brand-emerald/20",
          className,
        )}
        id={id}
        placeholder={placeholder}
        required={required}
        type={type}
        {...props}
      />
    </div>
  );
}
