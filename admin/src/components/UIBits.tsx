import { cn } from '../lib/utils';
import type { ReactNode } from "react";

export function Panel({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-[color:var(--brand-line)] bg-white", className)} style={{ boxShadow: "var(--shadow-brand)" }}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[color:var(--brand-line)]">
          {title && <h3 className="text-[17px] uppercase text-[color:var(--brand-navy)] tracking-tight font-[family-name:var(--font-display)] font-bold">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function BrandButton({ children, variant = "red", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "red" | "navy" | "outline" | "ghost" }) {
  const base = "inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[12.5px] uppercase tracking-[0.05em] font-bold transition font-[family-name:var(--font-cond)] cursor-pointer";
  const variants: Record<string, string> = {
    red: "bg-[color:var(--brand-red)] text-white hover:bg-[color:var(--brand-red-dark)]",
    navy: "bg-[color:var(--brand-navy)] text-white hover:bg-[color:var(--brand-navy-2)]",
    outline: "border-2 border-[color:var(--brand-red)] text-[color:var(--brand-red)] hover:bg-[color:var(--brand-red)] hover:text-white bg-transparent",
    ghost: "text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-mist)]",
  };
  return <button className={cn(base, variants[variant], className)} {...props}>{children}</button>;
}

export function Chip({ children, color = "cyan" }: { children: ReactNode; color?: "cyan" | "red" | "amber" | "green" | "navy" }) {
  const map: Record<string, string> = {
    cyan: "bg-[color-mix(in_srgb,var(--brand-cyan)_14%,#fff)] text-[color:var(--brand-cyan)]",
    red: "bg-[#fdecec] text-[color:var(--brand-red)]",
    amber: "bg-[color:var(--brand-amber)] text-[color:var(--brand-navy)]",
    green: "bg-[#e8f5ec] text-[#1f7a44]",
    navy: "bg-[color:var(--brand-navy)] text-white",
  };
  return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] uppercase font-bold tracking-[0.04em] font-[family-name:var(--font-cond)]", map[color])}>{children}</span>;
}
