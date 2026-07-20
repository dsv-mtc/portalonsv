import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Trash2, Pencil, Upload, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Submenu = { id: number; submenu: string; menu_id: number; menu: string; rutabi: string; linkvideo: string; linkpdf: string; imagen: string; observacion: string; estado: boolean };
type MenuItem = { id: number; descripcion: string };

interface FormData {
  descripcion: string;
  menu_id: number;
  rutabi: string;
  linkvideo: string;
  linkpdf: string;
  imagenpath: string;
  estado: boolean;
}

function initForm(): FormData {
  return { descripcion: "", menu_id: 0, rutabi: "", linkvideo: "", linkpdf: "", imagenpath: "", estado: true };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";
const selectCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

export function AnaliticaSubmenu() {
  const [submenus, setSubmenus] = useState<Submenu[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [filterMenu, setFilterMenu] = useState<number | "">("");
  const [filterSubmenu, setFilterSubmenu] = useState("");

  const filteredItems = useMemo(() => {
    return submenus.filter(item => {
      if (filterMenu && item.menu_id !== filterMenu) return false;
      if (filterSubmenu && !item.submenu.toLowerCase().includes(filterSubmenu.toLowerCase())) return false;
      return true;
    });
  }, [submenus, filterMenu, filterSubmenu]);

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const load = () => {
    setPage(1);
    setFilterMenu("");
    setFilterSubmenu("");
    apiGet<{ submenu: Submenu[]; menu: MenuItem[] }>("/analitica-submenu")
      .then(d => { setSubmenus(d.submenu); setMenus(d.menu); })
      .catch(() => {});
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const openCreate = () => {
    setForm(initForm());
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: Submenu) => {
    setForm({
      descripcion: item.submenu,
      menu_id: item.menu_id,
      rutabi: item.rutabi,
      linkvideo: item.linkvideo,
      linkpdf: item.linkpdf,
      imagenpath: item.imagen && item.imagen !== "No existe" ? item.imagen : "",
      estado: item.estado,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r: any = await apiUpload("/analitica-submenu/upload", fd);
    if (r.success && r.url) {
      setForm(p => ({ ...p, imagenpath: r.url }));
    } else {
      setMsg(r.message || "Error al subir imagen");
    }
  };

  const handleSubmit = async () => {
    if (!form.descripcion.trim() || !form.menu_id || !form.rutabi.trim() || !form.linkvideo.trim() || !form.linkpdf.trim()) {
      setMsg("Completa los campos obligatorios (*)");
      return;
    }
    if (editingId !== null) {
      await apiPut(`/analitica-submenu/${editingId}`, form);
      setMsg("Submenú actualizado");
    } else {
      await apiPost("/analitica-submenu", form);
      setMsg("Submenú creado");
    }
    setModalOpen(false);
    setForm(initForm());
    setEditingId(null);
    load();
  };

  const handleDelete = async () => {
    if (confirmDelete === null) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    await apiDelete(`/analitica-submenu/${id}`);
    setMsg("Eliminado");
    load();
  };

  const activeCount = filteredItems.filter(i => i.estado).length;
  const isFiltering = filterMenu !== "" || filterSubmenu !== "";

  const hasImage = (img: string) => img && img !== "No existe";

  const pagBtn = (label: React.ReactNode, active: boolean, onClick: () => void, ariaLabel: string) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
      className={`pag-btn${active ? " active" : ""}`}>
      {label}
    </button>
  );

  return (
    <>
      <PageHeader title="Analítica — Submenú" eyebrow="Subnavegación" actions={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Chip color="cyan">{isFiltering ? `${filteredItems.length}/${submenus.length}` : activeCount} activos</Chip>
          <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
        </div>
      } />

      <style>{`
        .region-img { width:40px; height:40px; object-fit:contain; border-radius:6px; display:block; transition:transform .25s ease; }
        .region-img:hover { transform:scale(3); z-index:99999; position:relative; }
        .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
        .pag-btn.active:hover { background: #C8102E; color: #fff; border-color: transparent; }
      `}</style>
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 40, marginBottom: 12 }}>
        <select value={filterMenu}
          onChange={e => { setFilterMenu(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
          style={{ height: 34, borderRadius: 8, border: "2px solid var(--brand-line)", padding: "0 8px", fontSize: 12, fontWeight: 600, color: "var(--brand-navy)", background: "#fff", outline: "none", fontFamily: "var(--font-cond)" }}>
          <option value="">Todos los menús</option>
          {menus.map(m => <option key={m.id} value={m.id}>{m.descripcion}</option>)}
        </select>
        <input type="text" placeholder="Buscar submenú..." value={filterSubmenu}
          onChange={e => { setFilterSubmenu(e.target.value); setPage(1); }}
          style={{ width: 160, height: 34, borderRadius: 8, border: "2px solid var(--brand-line)", padding: "0 10px", fontSize: 12, fontWeight: 600, color: "var(--brand-navy)", outline: "none", fontFamily: "var(--font-cond)" }} />
      </div>

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Menú</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Submenú</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Ruta Bi</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Link Video</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Link PDF</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Imagen</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
              <th style={{ width: 80, padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)" }}>{item.menu}</td>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)" }}>{item.submenu}</td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.rutabi}>{item.rutabi}</td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.linkvideo}>{item.linkvideo}</td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.linkpdf}>{item.linkpdf}</td>
                <td style={{ padding: "10px 8px" }}>
                  {hasImage(item.imagen) ? (
                    <img className="region-img" src={encodeURI(item.imagen)} alt=""
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                  ) : <span style={{ color: "#94a3b8" }}>—</span>}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                    background: item.estado ? "#dcfce7" : "#f1f5f9",
                    color: item.estado ? "#166534" : "#475569",
                  }}>
                    {item.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#e8ebf0] transition" style={{ color: "#101a34" }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDelete(item.id)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
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

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div style={{ width: 520, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {editingId !== null ? "Editar submenú" : "Nuevo submenú"}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Menú <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <select value={form.menu_id} onChange={e => setForm(p => ({ ...p, menu_id: Number(e.target.value) }))}
                  className={selectCls} style={{ borderColor: "var(--brand-line)" }}>
                  <option value={0}>Seleccionar...</option>
                  {menus.map(m => <option key={m.id} value={m.id}>{m.descripcion}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Submenú <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Ruta Bi <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.rutabi} onChange={e => setForm(p => ({ ...p, rutabi: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Link video <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.linkvideo} onChange={e => setForm(p => ({ ...p, linkvideo: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Link PDF <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.linkpdf} onChange={e => setForm(p => ({ ...p, linkpdf: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Imagen
                </span>
                <div className="flex gap-2 items-center mt-1">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                    style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                    <Upload className="w-3.5 h-3.5" /> Seleccionar
                  </button>
                  {form.imagenpath && (
                    <img src={encodeURI(form.imagenpath)} className="w-11 h-11 rounded object-contain border" alt="" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }} />
                  )}
                </div>
              </label>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="submenuActive" checked={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                <label htmlFor="submenuActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
              <div style={{ display: "flex", gap: 10 }}>
                <BrandButton variant="outline" onClick={() => setModalOpen(false)}>Cancelar</BrandButton>
                <BrandButton onClick={handleSubmit}>{editingId !== null ? "Guardar" : "Crear"}</BrandButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar submenú"
        message="¿Estás seguro de eliminar este submenú? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {children}
      </div>
    </div>
  );
}
