import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthActionButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "outline" | "danger";
};

const variants = {
  primary: "border-brand-navy bg-brand-navy text-white hover:bg-brand-emerald",
  secondary: "border-brand-emerald bg-brand-emerald text-white hover:bg-brand-navy",
  outline: "border-brand-navy bg-white text-brand-navy hover:border-brand-emerald hover:text-brand-emerald",
  danger: "border-brand-error bg-brand-error text-white hover:bg-brand-navy",
};

export function AuthActionButton({
  children,
  className,
  disabled = false,
  href,
  type = "button",
  variant = "primary",
}: AuthActionButtonProps) {
  const classes = cn(
    "inline-flex min-h-12 w-full items-center justify-center rounded-lg border px-5 py-3 text-center text-base font-bold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
    variants[variant],
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
    <button className={classes} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
