import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link, matchPath } from "react-router-dom";
import { LayoutDashboard, PanelBottom, BarChart3, Map, Image as ImageIcon, Megaphone, Target, LineChart, Sparkles, Database, Users, ChevronDown, LogOut, Menu, Activity, Home, ChevronRight, Newspaper, Gavel, LayoutGrid, MonitorPlay, GraduationCap, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { OnsvLogo } from "./OnsvLogo";
import { apiGet } from "../lib/api";

type NavItem = { label: string; icon: React.ComponentType<{ className?: string }>; to?: string; children?: { label: string; to: string }[] };

const NAV: NavItem[] = [
  { label: "Inicio", icon: LayoutDashboard, to: "/" },
  { label: "Banners", icon: ImageIcon, to: "/banners" },
  { label: "Accesos Rápidos", icon: Zap, to: "/accesos-rapidos" },
  { label: "YouTube", icon: MonitorPlay, to: "/youtube" },
  { label: "Quienes Somos", icon: Target, to: "/mision" },
  { label: "Cifras", icon: BarChart3, to: "/cifras" },
  { label: "Regiones", icon: Map, to: "/regiones" },
  { label: "Comunicaciones", icon: Megaphone, children: [{ label: "Noticias", to: "/comunicaciones-noticias" }, { label: "Notas de prensa", to: "/comunicaciones-notas-prensa" }, { label: "Eventos", to: "/comunicaciones" }] },
  { label: "Publicaciones", icon: Newspaper, children: [{ label: "Contenidos", to: "/publicaciones-contenidos" }, { label: "Revistas", to: "/publicaciones-revistas" }] },
  { label: "Normas Legales", icon: Gavel, to: "/normas-legales" },
  { label: "Analítica", icon: LineChart, children: [{ label: "Menú", to: "/analitica" }, { label: "Submenú", to: "/analitica-submenu" }] },
  { label: "Popup", icon: Sparkles, to: "/popup" },
  { label: "Datos Abiertos", icon: Database, children: [{ label: "Datos", to: "/datos" }, { label: "Categorías", to: "/datos-categorias" }, { label: "Tipos", to: "/datos-tipos" }] },
  { label: "Programas", icon: LayoutGrid, to: "/programas" },
  { label: "Educación Vial", icon: GraduationCap, to: "/educacion-vial" },
  { label: "Pie de página", icon: PanelBottom, to: "/pie" },
  { label: "Usuarios", icon: Users, to: "/usuarios" },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(NAV.filter(n => n.children).map(n => [n.label, true])));
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [isLg, setIsLg] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const loc = useLocation();
  const pathname = '/' + loc.pathname.split('/').slice(2).join('/');

  useEffect(() => {
    apiGet<{ email: string; role: string }>("/auth/me").then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarOpen && avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarOpen]);

  const initials = user
    ? user.email.split('@')[0].split('.').map(s => s[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const displayName = user
    ? user.email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : 'Admin ONSV';

  const sidebarWidth = collapsed ? 72 : 280;
  const contentMarginLeft = isLg ? sidebarWidth : 0;

  const toggleMenu = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed(c => !c);
    } else {
      setMobileOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--brand-mist)" }}>
      {mobileOpen && <button type="button" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />}
      <aside className={cn("text-[color:var(--sidebar-foreground)] flex flex-col fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-out lg:z-30 lg:h-screen lg:translate-x-0 lg:transition-[width]", mobileOpen ? "translate-x-0" : "-translate-x-full", collapsed ? "lg:w-[72px]" : "lg:w-[280px]")} style={{ background: "linear-gradient(180deg, #0d1730 0%, #101a34 55%, #0b1428 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <span aria-hidden className="absolute inset-y-0 right-0 w-[3px]" style={{ background: "linear-gradient(180deg,transparent, #C8102E 30%, #C8102E 70%, transparent)" }} />
        <div className="relative flex items-center gap-3 px-4 h-[72px] border-b border-white/5">
          <OnsvLogo className="w-11 h-11" tone="light" />
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-extrabold uppercase tracking-tight text-white font-[family-name:var(--font-display)]">Portal ONSV</span>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase mt-1 font-[family-name:var(--font-cond)]" style={{ color: "#F4B41A" }}>Panel Administrativo</span>
            </div>
          )}
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" className="lg:hidden ml-auto w-9 h-9 rounded-lg grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-auto-hide">
          {NAV.map((item) => {
            const Icon = item.icon;
            if (item.children) {
              const open = openGroups[item.label];
              const anyActive = item.children.some(c => matchPath({ path: c.to, end: true }, pathname));
              return (
                <div key={item.label}>
                  <button type="button" onClick={() => !collapsed || mobileOpen ? setOpenGroups(g => ({ ...g, [item.label]: !open })) : navigate(item.children![0].to)}
                    className={cn("w-full flex items-center gap-3 rounded-lg h-10 px-3 text-[13.5px] font-[family-name:var(--font-cond)] font-semibold uppercase tracking-wide transition", anyActive ? "text-white bg-white/[0.06]" : "text-white/70 hover:text-white hover:bg-white/[0.04]")}>
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {(!collapsed || mobileOpen) && <><span className="flex-1 text-left truncate">{item.label}</span><ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} /></>}
                  </button>
                  {(!collapsed || mobileOpen) && open && (
                    <div className="pl-4 mt-1 mb-2 space-y-0.5">
                      {item.children.map(c => (
                          <NavLink key={c.label} to={c.to} onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => cn("flex items-center gap-3 pl-6 pr-3 h-8 rounded-md text-[12.5px] font-[family-name:var(--font-cond)] font-semibold uppercase tracking-wider transition", isActive ? "text-white bg-[color:var(--brand-red)]" : "text-white/55 hover:text-white hover:bg-white/[0.05]")}>
                            {({ isActive }) => (
                              <><span aria-hidden className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-white" : "bg-white/30")} />
                            {c.label}</>
                            )}
                          </NavLink>
                        ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink key={item.label} to={item.to!} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn("relative flex items-center gap-3 rounded-lg h-10 px-3 text-[13.5px] font-[family-name:var(--font-cond)] font-semibold uppercase tracking-wide transition", isActive ? "text-white bg-[color:var(--brand-red)]" : "text-white/70 hover:text-white hover:bg-white/[0.05]")}>
                {({ isActive }) => (
                  <>{isActive && <span aria-hidden className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r bg-[color:var(--brand-amber)]" />}
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {(!collapsed || mobileOpen) && <span className="flex-1 truncate">{item.label}</span>}</>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-screen transition-[margin] duration-300 ease-out" style={{ marginLeft: contentMarginLeft }}>
        {/* Ribbon — franja superior separada del header */}
        <div
          className="text-center py-1.5 px-4 sm:px-6 text-[11px] sm:text-[12px] text-white uppercase font-bold"
          style={{
            fontFamily: "var(--font-cond)",
            letterSpacing: "0.13em",
            background: "repeating-linear-gradient(45deg, #101a34, #101a34 14px, #16223f 14px, #16223f 28px)",
          }}
        >
          <b className="text-[color:var(--brand-amber)]"></b>MINISTERIO DE TRANSPORTES Y COMUNICACIONES
        </div>

        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-[color:var(--brand-line)]">
          <div className="flex items-center gap-2 sm:gap-4 h-16 px-3 sm:px-6">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Alternar menú"
              title="Alternar menú"
              className="w-10 h-10 rounded-lg border border-[color:var(--brand-line)] bg-white grid place-items-center text-[color:var(--brand-navy)] hover:border-[color:var(--brand-red)] hover:text-[color:var(--brand-red)] transition shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <nav aria-label="Migas" className="flex items-center gap-2 text-[11px] sm:text-[12px] uppercase tracking-[0.1em] min-w-0" style={{ fontFamily: "var(--font-cond)" }}>
              <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-[color:var(--brand-red)] font-bold">
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              <span className="text-[color:var(--brand-navy)] font-extrabold truncate">Administración</span>
            </nav>

            <div ref={avatarRef} className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
              <div
                title="Estado del portal"
                className="flex items-center gap-2 h-10 px-3 rounded-lg border border-[color:var(--brand-line)] bg-white text-[color:var(--brand-navy)]"
              >
                <Activity className="w-4 h-4 text-[color:var(--brand-cyan)]" />
                <span
                  className="hidden sm:inline text-[11px] font-bold uppercase tracking-[0.14em] text-[#1f7a44]"
                  style={{ fontFamily: "var(--font-cond)" }}
                >
                  Online
                </span>
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-[#22c55e] opacity-70 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#1f7a44]" />
                </span>
              </div>

              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-[color:var(--brand-line)] relative">
                <button type="button" onClick={() => setAvatarOpen(o => !o)} className="flex items-center gap-3 cursor-pointer">
                  <div className="text-right leading-none">
                    <div className="text-[13px] font-bold text-[color:var(--brand-navy)]" style={{ fontFamily: "var(--font-cond)" }}>{displayName}</div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-1" style={{ fontFamily: "var(--font-cond)" }}>{user?.role || "Superadministrador"}</div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center text-white font-extrabold text-[14px]"
                    style={{
                      background: "linear-gradient(135deg,#C8102E,#9E0C24)",
                      fontFamily: "var(--font-display)",
                      boxShadow: "0 6px 18px -6px rgba(200,16,46,0.7)",
                    }}
                  >
                    {initials}
                  </div>
                </button>
                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-xl border border-[color:var(--brand-line)] bg-white p-1 shadow-lg">
                    <a href="/administrador/logout"
                      className="flex items-center gap-2.5 rounded-lg h-10 px-3 text-[12.5px] font-bold font-[family-name:var(--font-cond)] uppercase tracking-wider text-[color:var(--brand-red)] hover:bg-red-50 transition cursor-pointer">
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </a>
                  </div>
                )}
              </div>

              <div className="md:hidden relative">
                <button type="button" onClick={() => setAvatarOpen(o => !o)}
                  className="w-9 h-9 rounded-full grid place-items-center text-white font-extrabold text-[12px] cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg,#C8102E,#9E0C24)",
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 6px 18px -6px rgba(200,16,46,0.7)",
                  }}
                >
                  {initials}
                </button>
                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-xl border border-[color:var(--brand-line)] bg-white p-1 shadow-lg">
                    <a href="/administrador/logout"
                      className="flex items-center gap-2.5 rounded-lg h-10 px-3 text-[12.5px] font-bold font-[family-name:var(--font-cond)] uppercase tracking-wider text-[color:var(--brand-red)] hover:bg-red-50 transition cursor-pointer">
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-[1360px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
