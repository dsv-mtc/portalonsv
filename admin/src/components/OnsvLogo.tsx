import { cn } from '../lib/utils';

export function OnsvLogo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const bg = tone === "light" ? "#ffffff" : "#14213D";
  return (
    <div className={cn("grid place-items-center rounded-full shrink-0 overflow-hidden", className)} style={{ background: bg, boxShadow: "inset 0 0 0 3px #C8102E" }}>
      <img src="/img/logo-1.svg" alt="ONSV" className="w-full h-full object-contain p-1.5" />
    </div>
  );
}
