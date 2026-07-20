import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Map, BarChart3, Target, Sparkles, PanelBottom, Users, FileEdit, Upload, Trash2, FolderOpen, TrendingUp } from "lucide-react";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet } from "../lib/api";
import type { LogEntry } from "../lib/api";

interface DashboardStats {
  usuarios: number;
  menusActivos: number;
  submenusActivos: number;
  eventos: number;
  datasets: number;
}

export function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ usuarios: 0, menusActivos: 0, submenusActivos: 0, eventos: 0, datasets: 0 });

  useEffect(() => {
    apiGet<LogEntry[]>("/logs/recent").then(setLogs).catch(() => {});
    apiGet<DashboardStats>("/stats/dashboard").then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as LogEntry;
      setLogs(prev => [detail, ...prev]);
    };
    window.addEventListener("admin:log", handler);
    return () => window.removeEventListener("admin:log", handler);
  }, []);

  const actionIcon = (action: string) => {
    if (action === 'created') return { Icon: Upload, color: '#1597B8' };
    if (action === 'updated') return { Icon: FileEdit, color: '#C8102E' };
    return { Icon: Trash2, color: '#7A3FBF' };
  };

  const statCards = [
    { label: "Usuarios registrados", value: stats.usuarios, color: "#1597B8", icon: Users, desc: "Cuentas en el sistema" },
    { label: "Analítica activa", value: stats.menusActivos + stats.submenusActivos, color: "#14213D", icon: TrendingUp, desc: "Menús y submenús publicados" },
    { label: "Contenido publicado", value: stats.eventos + stats.datasets, color: "#C8102E", icon: FolderOpen, desc: "Eventos y datasets" },
  ];
  const quickLinks = [
    { label: "Pie de página", to: "/pie", icon: PanelBottom, color: "#14213D" },
    { label: "Cifras", to: "/cifras", icon: BarChart3, color: "#1597B8" },
    { label: "Regiones", to: "/regiones", icon: Map, color: "#F4B41A" },
    { label: "Misión — Visión", to: "/mision", icon: Target, color: "#C8102E" },
    { label: "Popup", to: "/popup", icon: Sparkles, color: "#7A3FBF" },
    { label: "Usuarios", to: "/usuarios", icon: Users, color: "#0d6efd" },
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl p-8 lg:p-10 mb-8 text-white" style={{ background: "linear-gradient(100deg,rgba(13,21,40,.96),rgba(13,21,40,.55) 55%,rgba(13,21,40,.15)),repeating-linear-gradient(115deg,#1c2c4e 0 2px,transparent 2px 26px),linear-gradient(160deg,#21314f,#0e1830)" }}>
        <span className="inline-block px-3 py-1 mb-4 text-[11px] uppercase tracking-[0.16em] font-bold rounded font-[family-name:var(--font-cond)]" style={{ background: "#C8102E" }}>Estado del portal</span>
        <h2 className="text-[clamp(28px,3.4vw,44px)] uppercase leading-[0.98] max-w-2xl font-[family-name:var(--font-display)] font-extrabold">¡Bienvenido al Panel de <em className="not-italic" style={{ color: "var(--brand-amber)" }}>Control Administrativo</em>!</h2>
        <p className="mt-4 max-w-xl text-white/70 text-[15px]">Todo lo que publiques aquí se refleja en tiempo real en el portal público del Observatorio Nacional de Seguridad Vial.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <BrandButton variant="red"><ArrowUpRight className="w-4 h-4" /> Ver portal en vivo</BrandButton>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {statCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="relative overflow-hidden rounded-2xl border border-[color:var(--brand-line)] bg-white p-6" style={{ boxShadow: "var(--shadow-brand)", borderTop: `4px solid ${c.color}` }}>
              <div className="w-12 h-12 rounded-xl grid place-items-center mb-4" style={{ background: `color-mix(in srgb, ${c.color} 12%, #fff)`, color: c.color }}><Icon className="w-6 h-6" /></div>
              <span className="text-[28px] font-extrabold font-[family-name:var(--font-display)]" style={{ color: "var(--brand-navy)" }}>{c.value}</span>
              <h3 className="text-[14px] uppercase font-[family-name:var(--font-cond)] font-bold mt-1" style={{ color: "var(--brand-navy)" }}>{c.label}</h3>
              <p className="mt-1 text-[12px]" style={{ color: "var(--muted-foreground)" }}>{c.desc}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <Panel title="Actividad reciente" actions={<Chip color="cyan"><span className="relative inline-flex w-2 h-2 align-middle mr-0.5"><span className="absolute inline-flex w-full h-full rounded-full bg-[#1597B8] opacity-70 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-[#1597B8]" /></span> En vivo</Chip>}>
            <ol className="relative max-h-[272px] overflow-y-auto scrollbar-auto-hide">
              <span aria-hidden className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: "var(--brand-line)" }} />
              {logs.map((l) => {
                const { Icon, color } = actionIcon(l.action);
                return (
                  <li key={l.id} className="relative flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="relative z-10 w-10 h-10 rounded-full grid place-items-center shrink-0 border-2 border-white" style={{ background: `color-mix(in srgb, ${color} 12%, #fff)`, color, boxShadow: "0 0 0 1px var(--brand-line)" }}><Icon className="w-4 h-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] text-[color:var(--brand-navy)] font-semibold leading-tight">{l.description}</p>
                      <p className="text-[11.5px] mt-1 uppercase tracking-[0.06em] font-[family-name:var(--font-cond)]" style={{ color: "var(--muted-foreground)" }}><span className="font-bold text-[color:var(--brand-red)]">{l.user_email}</span> · {l.created_at}</p>
                    </div>
                  </li>
                );
              })}
              {logs.length === 0 && (
                <li className="relative flex gap-4 py-3">
                  <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No hay actividad reciente aún.</p>
                </li>
              )}
            </ol>
          </Panel>
        </div>
        <Panel title="Accesos rápidos">
          <div className="grid grid-cols-2 gap-2.5">
            {quickLinks.map(q => {
              const QIcon = q.icon;
              return (
                <Link key={q.label} to={q.to} className="group flex flex-col items-start gap-2 rounded-xl border border-[color:var(--brand-line)] bg-white p-3 hover:border-[color:var(--brand-navy)] hover:-translate-y-0.5 transition">
                  <span className="w-9 h-9 rounded-lg grid place-items-center" style={{ background: `color-mix(in srgb, ${q.color} 12%, #fff)`, color: q.color }}><QIcon className="w-4 h-4" /></span>
                  <span className="text-[11.5px] uppercase tracking-[0.06em] font-bold leading-tight font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{q.label}</span>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>
    </>
  );
}
