import type { HTMLAttributes } from "react";
import clsx from "clsx";

type BadgeVariant = "slate" | "indigo" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant | string;
}

export function Badge({ className, variant = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "slate" && "bg-slate-100 text-slate-700",
        variant === "indigo" && "bg-indigo-50 text-indigo-700",
        variant === "success" && "bg-emerald-50 text-emerald-700",
        variant === "warning" && "bg-amber-50 text-amber-700",
        variant === "danger" && "bg-rose-50 text-rose-700",
        className,
      )}
      {...props}
    />
  );
}
