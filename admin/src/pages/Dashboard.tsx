import { Link } from "react-router-dom";
import { Database, Megaphone, LineChart, ArrowUpRight, Map, BarChart3, Target, Sparkles, PanelBottom, Users, FileEdit, Upload, UserPlus, CheckCircle2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";

export function Dashboard() {
  const cards = [
    { label: "Datos Abiertos", desc: "Publica datasets, categorías y tipos de archivo.", color: "#1597B8", icon: Database, to: "/datos" },
    { label: "Analítica de Datos", desc: "Administra menús y submenús con tableros BI.", color: "#14213D", icon: LineChart, to: "/analitica" },
    { label: "Comunicaciones", desc: "Programa eventos, campañas y entrevistas.", color: "#C8102E", icon: Megaphone, to: "/comunicaciones" },
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
      <PageHeader eyebrow="Panel Administrativo" title="Inicio" description="Desde aquí gestionas todos los contenidos del Portal ONSV." />
      <section className="relative overflow-hidden rounded-2xl p-8 lg:p-10 mb-8 text-white" style={{ background: "linear-gradient(100deg,rgba(13,21,40,.96),rgba(13,21,40,.55) 55%,rgba(13,21,40,.15)),repeating-linear-gradient(115deg,#1c2c4e 0 2px,transparent 2px 26px),linear-gradient(160deg,#21314f,#0e1830)" }}>
        <span className="inline-block px-3 py-1 mb-4 text-[11px] uppercase tracking-[0.16em] font-bold rounded font-[family-name:var(--font-cond)]" style={{ background: "#C8102E" }}>Estado del portal</span>
        <h2 className="text-[clamp(28px,3.4vw,44px)] uppercase leading-[0.98] max-w-2xl font-[family-name:var(--font-display)] font-extrabold">¡Bienvenido al Panel de <em className="not-italic" style={{ color: "var(--brand-amber)" }}>Control Administrativo</em>!</h2>
        <p className="mt-4 max-w-xl text-white/70 text-[15px]">Todo lo que publiques aquí se refleja en tiempo real en el portal público del Observatorio Nacional de Seguridad Vial.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <BrandButton variant="red"><ArrowUpRight className="w-4 h-4" /> Ver portal en vivo</BrandButton>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="group relative overflow-hidden rounded-2xl border border-[color:var(--brand-line)] bg-white p-6 hover:-translate-y-1 transition-all" style={{ boxShadow: "var(--shadow-brand)", borderTop: `4px solid ${c.color}` }}>
              <div className="w-14 h-14 rounded-2xl grid place-items-center mb-4" style={{ background: `color-mix(in srgb, ${c.color} 12%, #fff)`, color: c.color }}><Icon className="w-7 h-7" /></div>
              <h3 className="text-[20px] uppercase text-[color:var(--brand-navy)] font-[family-name:var(--font-display)] font-bold">{c.label}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] font-bold text-[color:var(--brand-red)] group-hover:gap-2 transition-all font-[family-name:var(--font-cond)]">Ir al módulo <ArrowUpRight className="w-3.5 h-3.5" /></span>
            </Link>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <Panel title="Actividad reciente" actions={<Chip color="cyan">● En vivo</Chip>}>
            <ol className="relative">
              <span aria-hidden className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: "var(--brand-line)" }} />
              {[
                { icon: FileEdit, color: "#1597B8", title: "Se actualizaron las cifras del portal", who: "Admin ONSV", when: "hace 5 min" },
                { icon: Upload, color: "#C8102E", title: "Nuevo dataset publicado en Datos Abiertos", who: "Editor", when: "hace 42 min" },
                { icon: Megaphone, color: "#F4B41A", title: "Se programó una nueva comunicación", who: "Comunicaciones", when: "hace 2 h" },
                { icon: UserPlus, color: "#14213D", title: "Se registró un nuevo usuario administrador", who: "Superadmin", when: "ayer" },
                { icon: CheckCircle2, color: "#1f7a44", title: "Región Lima actualizó su encargado", who: "Admin Regional", when: "ayer" },
              ].map((a, i) => {
                const AIcon = a.icon;
                return (
                  <li key={i} className="relative flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="relative z-10 w-10 h-10 rounded-full grid place-items-center shrink-0 border-2 border-white" style={{ background: `color-mix(in srgb, ${a.color} 12%, #fff)`, color: a.color, boxShadow: "0 0 0 1px var(--brand-line)" }}><AIcon className="w-4 h-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] text-[color:var(--brand-navy)] font-semibold leading-tight">{a.title}</p>
                      <p className="text-[11.5px] mt-1 uppercase tracking-[0.06em] font-[family-name:var(--font-cond)]" style={{ color: "var(--muted-foreground)" }}><span className="font-bold text-[color:var(--brand-red)]">{a.who}</span> · {a.when}</p>
                    </div>
                  </li>
                );
              })}
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
