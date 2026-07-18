import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions, style }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; style?: React.CSSProperties }) {
  return (
    <header className="mb-8" style={style}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-3 bg-[color:var(--brand-amber)] text-[color:var(--brand-navy)] font-[family-name:var(--font-display)] font-extrabold uppercase tracking-[0.03em] text-[clamp(20px,2.2vw,28px)] px-[18px] py-[11px] rounded-[6px]" style={{ boxShadow: "var(--shadow-brand)" }}>
            <span aria-hidden className="inline-block" style={{ width: 6, height: 24, background: "var(--brand-red)", borderRadius: 3 }} />
            {title}
          </span>
          {eyebrow ? <span className="hidden sm:inline font-[family-name:var(--font-cond)] font-bold uppercase tracking-[0.16em] text-[12px] text-[color:var(--brand-cyan)]">{eyebrow}</span> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {description ? <p className="mt-4 text-sm" style={{ color: "var(--muted-foreground)" }}>{description}</p> : null}
    </header>
  );
}
