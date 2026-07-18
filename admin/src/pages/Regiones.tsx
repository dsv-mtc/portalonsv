import { useState, useEffect, useMemo, useCallback } from "react";
import { Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut, apiUpload } from "../lib/api";

const PAGE_SIZE = 5;

type Region = { id: number; value: string; slug: string; nombreEncargado: string; celularEncargado: string; correoEncargado: string; imageUrl: string; pageLink: string };

export function Regiones() {
  const [allRegiones, setAllRegiones] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Region>>({});
  const [filterId, setFilterId] = useState<number | "">("");

  const filtered = useMemo(
    () => filterId ? allRegiones.filter(r => r.id === filterId) : allRegiones,
    [allRegiones, filterId]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageRegiones = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  useEffect(() => {
    apiGet<{ allRegiones: Region[] }>("/regiones")
      .then(d => { setAllRegiones(d.allRegiones); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  useEffect(() => {
    if (!editId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setEditId(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editId]);

  const openEdit = useCallback((r: Region) => {
    setEditId(r.id);
    setForm({ nombreEncargado: r.nombreEncargado, celularEncargado: r.celularEncargado, correoEncargado: r.correoEncargado, pageLink: r.pageLink });
  }, []);

  const handleSave = async () => {
    if (editId === null) return;
    const r = await apiPut(`/regiones/${editId}`, form);
    setMsg(r.message || "Guardado");
    setAllRegiones(prev => prev.map(x => x.id === editId ? { ...x, ...form } : x));
    setEditId(null);
    setForm({});
  };

  const editRegion = allRegiones.find(r => r.id === editId);

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
      <PageHeader title="Regiones" eyebrow="Gestión territorial" description="Administra los encargados de cada región." style={{ marginBottom: 0 }} />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <style>{`
        .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent;
          background: transparent; color: #1d3557; font-weight: 700; font-size: 17px;
          display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all .3s ease; }
        .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
        .pag-btn.active:hover { background: #C8102E; color: #fff; border-color: transparent; }
        .region-img { width: 64px; height: 48px; object-fit: contain; border-radius: 6px; display: block; transition: transform .3s ease; }
        .region-img:hover { transform: scale(3); z-index: 99999; position: relative; }
                .table-wrap { overflow: visible; }
      `}</style>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <select value={filterId} onChange={e => { setFilterId(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
          style={{ width: 260, height: 40, borderRadius: 10, border: "2px solid var(--brand-line)", padding: "0 12px", fontSize: "13px", outline: "none", background: "#fff", color: "var(--brand-navy)", fontWeight: 600, fontFamily: "var(--font-cond)", cursor: "pointer" }}
        >
          <option value="">Todas las regiones</option>
          {allRegiones.map(r => (
            <option key={r.id} value={r.id}>{r.value}</option>
          ))}
        </select>
      </div>
      <Panel>
        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
                <Th>Región</Th>
                <Th>Slug</Th>
                <Th>Nombre encargado</Th>
                <Th>Celular encargado</Th>
                <Th>Correo encargado</Th>
                <Th>Imagen</Th>
                <Th style={{ width: 50 }} />
              </tr>
            </thead>
            <tbody>
              {pageRegiones.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--brand-line)", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--brand-mist)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <Td><span style={{ fontWeight: 700, color: "var(--brand-navy)", textTransform: "uppercase" }}>{r.value}</span></Td>
                  <Td><code style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{r.slug}</code></Td>
                  <Td>{r.nombreEncargado || <NullValue />}</Td>
                  <Td>{r.celularEncargado || <NullValue />}</Td>
                  <Td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.correoEncargado || <NullValue />}</Td>
                  <Td>
                    <img className="region-img"
                      src={`/assets/${r.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}.png`}
                      alt={r.value}
                      onError={e => { const el = e.currentTarget; el.onerror = null; el.style.display = "none"; el.insertAdjacentHTML("afterend", `<span style="color:var(--muted-foreground);font-size:12px">—</span>`); }}
                    />
                  </Td>
                  <Td>
                    <button type="button" onClick={() => openEdit(r)}
                      style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "transparent", color: "var(--brand-navy)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-mist)"; (e.currentTarget as HTMLElement).style.color = "var(--brand-red)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--brand-navy)"; }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {editId !== null && (
        <div onClick={() => setEditId(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
        >
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 16, width: 520, maxWidth: "90vw", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  Editar región — {editRegion?.value}
                </h3>
              </div>
              <button type="button" onClick={() => setEditId(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6 }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {(["nombreEncargado", "celularEncargado", "correoEncargado", "pageLink"] as const).map(f => (
                <label key={f} className="block">
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                    {f === "nombreEncargado" ? "Nombre encargado" : f === "celularEncargado" ? "Celular encargado" : f === "correoEncargado" ? "Correo encargado" : "Enlace página"}
                  </span>
                  <input value={form[f] ?? ""} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13.5px] outline-none"
                    style={{ borderColor: "var(--brand-line)" }}
                    placeholder={`Ingrese ${f === "nombreEncargado" ? "el nombre" : f === "celularEncargado" ? "el celular" : f === "correoEncargado" ? "el correo" : "el enlace"}`}
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Imagen</span>
                <input type="file" accept="image/*" onChange={async e => {
                  const file = e.currentTarget.files?.[0];
                  if (!file || !editId) return;
                  const fd = new FormData();
                  fd.append("image", file);
                  const r = await apiUpload(`/regiones/${editId}/upload`, fd);
                  setMsg(r.message || "Imagen actualizada");
                  setAllRegiones(prev => [...prev]);
                  setEditId(null);
                }}
                  className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none file:h-full file:border-0 file:bg-[color:var(--brand-navy)] file:text-white file:px-4 file:rounded-lg file:cursor-pointer file:font-bold"
                  style={{ borderColor: "var(--brand-line)", paddingTop: 0, paddingBottom: 0, display: "flex", alignItems: "center" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
              <BrandButton variant="outline" onClick={() => setEditId(null)}>Cancelar</BrandButton>
              <BrandButton onClick={handleSave}>Guardar</BrandButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Th({ children, style: s, ...rest }: { children?: React.ReactNode; style?: React.CSSProperties; [k: string]: unknown }) {
  return (
    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, color: "var(--brand-navy)", fontFamily: "var(--font-cond)", ...s }} {...rest}>
      {children}
    </th>
  );
}

function Td({ children, style: s, ...rest }: { children: React.ReactNode; style?: React.CSSProperties; [k: string]: unknown }) {
  return (
    <td style={{ padding: "12px 10px", verticalAlign: "middle", color: "var(--muted-foreground)", ...s }} {...rest}>
      {children}
    </td>
  );
}

function NullValue() {
  return <span style={{ color: "#b0b7c4", fontSize: "12px", fontStyle: "italic" }}>No registrado</span>;
}
