import { cn } from '../lib/utils';

export function OnsvLogo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const bg = tone === "light" ? "#ffffff" : "#14213D";
  const stroke = tone === "light" ? "#14213D" : "#ffffff";
  return (
    <div className={cn("grid place-items-center rounded-full shrink-0", className)} style={{ background: bg, boxShadow: "inset 0 0 0 3px #C8102E" }}>
      <svg viewBox="0 0 40 40" width="60%" height="60%" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="20" cy="20" r="12" />
        <path d="M14 22 L20 14 L26 22" />
        <path d="M14 22 h12" />
        <circle cx="16" cy="25" r="1.6" fill={stroke} stroke="none" />
        <circle cx="24" cy="25" r="1.6" fill={stroke} stroke="none" />
      </svg>
    </div>
  );
}
