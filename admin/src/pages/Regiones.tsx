import { useState, useEffect, useMemo } from "react";
import { Send, Map, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut } from "../lib/api";

const PAGE_SIZE = 5;

type Region = { id: number; value: string; slug: string; nombreEncargado: string; celularEncargado: string; correoEncargado: string; imageUrl: string; pageLink: string };

export function Regiones() {
  const [allRegiones, setAllRegiones] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<number, Partial<Region>>>({});
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(allRegiones.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageRegiones = useMemo(
    () => allRegiones.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [allRegiones, currentPage]
  );

  useEffect(() => {
    apiGet<{ allRegiones: Region[] }>("/regiones").then(d => {
      setAllRegiones(d.allRegiones);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const handleSave = async (id: number) => {
    const data = editing[id];
    if (!data) return;
    const r = await apiPut(`/regiones/${id}`, data);
    setMsg(r.message || "Guardado");
    setAllRegiones(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const pagBtn = (label: React.ReactNode, active: boolean, onClick: () => void, ariaLabel: string) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
      className={`pag-btn${active ? " active" : ""}`}>
      {label}
    </button>
  );

  if (loading) return (
    <>
      <PageHeader title="Regiones" eyebrow="Gestión territorial" description="Administra los encargados de cada región." />
      <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>Cargando...</p>
    </>
  );

  return (
    <>
      <PageHeader title="Regiones" eyebrow="Gestión territorial" description="Administra los encargados de cada región." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <style>{`
        .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent;
          background: transparent; color: #1d3557; font-weight: 700; font-size: 17px;
          display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all .3s ease; }
        .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
        .pag-btn.active:hover { background: #C8102E; color: #fff; border-color: transparent; }
      `}</style>
      <Panel title={`Regiones (${allRegiones.length})`}>
        <div className="space-y-4">
          {pageRegiones.map(r => {
            const edit = editing[r.id] || {};
            return (
              <div key={r.id} className="rounded-xl border-2 p-4" style={{ borderColor: "var(--brand-line)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <Map className="w-5 h-5" style={{ color: "var(--brand-red)" }} />
                  <h4 className="text-[16px] uppercase font-bold font-[family-name:var(--font-display)]" style={{ color: "var(--brand-navy)" }}>{r.value}</h4>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(["nombreEncargado", "celularEncargado", "correoEncargado", "pageLink"] as const).map(f => (
                    <label key={f} className="block">
                      <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{f === "nombreEncargado" ? "Encargado" : f === "celularEncargado" ? "Celular" : f === "correoEncargado" ? "Correo" : "Enlace"}</span>
                      <input value={edit[f] ?? r[f] ?? ""} onChange={e => { const v = e.target.value; setEditing(p => ({ ...p, [r.id]: { ...p[r.id], [f]: v } })); }}
                        className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13.5px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <BrandButton type="button" variant="navy" onClick={() => handleSave(r.id)} disabled={!editing[r.id]}><Send className="w-4 h-4" /> Guardar</BrandButton>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-1.5">
            {pagBtn(<ChevronsLeft className="w-4 h-4" />, false, () => setPage(1), "Primera página")}
            {pagBtn(<ChevronLeft className="w-4 h-4" />, false, () => setPage(p => Math.max(1, p - 1)), "Página anterior")}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => pagBtn(p, p === currentPage, () => setPage(p), `Página ${p}`))}
            {pagBtn(<ChevronRight className="w-4 h-4" />, false, () => setPage(p => Math.min(totalPages, p + 1)), "Página siguiente")}
            {pagBtn(<ChevronsRight className="w-4 h-4" />, false, () => setPage(totalPages), "Última página")}
          </div>
        )}
      </Panel>
    </>
  );
}
