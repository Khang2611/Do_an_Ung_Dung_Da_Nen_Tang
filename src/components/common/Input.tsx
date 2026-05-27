import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({ label, error, icon, rightElement, className, ...props }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          className={clsx(
            "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25",
            icon && "pl-10",
            rightElement && "pr-11",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
            className,
          )}
          {...props}
        />
        {rightElement && <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</span>}
      </span>
      {error && <span className="mt-1 block text-sm text-rose-600">{error}</span>}
    </label>
  );
}
