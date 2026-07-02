import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "gold" | "lightOutline";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-brand-navy bg-brand-navy text-white hover:border-brand-emerald hover:bg-brand-emerald",
  secondary:
    "border-brand-emerald bg-brand-emerald text-white hover:border-brand-navy hover:bg-brand-navy",
  outline:
    "border-brand-navy bg-white text-brand-navy hover:border-brand-emerald hover:text-brand-emerald",
  gold:
    "border-brand-gold bg-brand-gold text-brand-navy hover:border-brand-navy hover:bg-white",
  lightOutline:
    "border-white bg-white/10 text-white hover:border-brand-gold hover:bg-white hover:text-brand-navy",
};

export function Button({
  children,
  className,
  disabled = false,
  href,
  onClick,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-center text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className,
  );

  if (href && !disabled) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
