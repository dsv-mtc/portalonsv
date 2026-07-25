import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, Upload, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Calendar } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Revista = { id: number; titulo: string; tema: string; idTemaRevista: number | null; imagen_url: string; pdf_url: string; esta_activo: boolean };
type TipoRevista = { id: number; value: string; isActive: boolean };
type Tab = "publicaciones" | "tipos";

interface FormData {
  titulo: string;
  idTemaRevista: number | null;
  imagen_url: string;
  pdf_url: string;
  esta_activo: boolean;
}

function initForm(): FormData {
  return { titulo: "", idTemaRevista: null, imagen_url: "", pdf_url: "", esta_activo: true };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

export function PublicacionesRevistas() {
  const [tab, setTab] = useState<Tab>("publicaciones");
  const [items, setItems] = useState<Revista[]>([]);
  const [tipos, setTipos] = useState<TipoRevista[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const imgRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = items.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const load = () => { setPage(1); apiGet<Revista[]>("/comunicaciones-revistas").then(setItems).catch(() => {}); };
  const loadTipos = () => { apiGet<TipoRevista[]>("/comunicaciones-revistas/tipos").then(setTipos).catch(() => {}); };
  useEffect(() => { load(); loadTipos(); }, []);

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

  const openEdit = (item: Revista) => {
    setForm({ titulo: item.titulo, idTemaRevista: item.idTemaRevista || null, imagen_url: item.imagen_url || "", pdf_url: item.pdf_url || "", esta_activo: item.esta_activo });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, field: "imagen_url" | "pdf_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const r: any = await apiUpload("/comunicaciones-revistas/upload", fd);
    if (r.success && r.url) {
      setForm(p => ({ ...p, [field]: r.url }));
    } else {
      setMsg(r.message || "Error al subir archivo");
    }
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      setMsg("Completa los campos obligatorios (*)");
      return;
    }
    if (editingId !== null) {
      await apiPut(`/comunicaciones-revistas/${editingId}`, form);
      setMsg("Revista actualizada");
    } else {
      await apiPost("/comunicaciones-revistas", form);
      setMsg("Revista creada");
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
    await apiDelete(`/comunicaciones-revistas/${id}`);
    setMsg("Eliminada");
    load();
  };

  const activeCount = items.filter(i => i.esta_activo).length;

  return (
    <>
      <PageHeader title="Revistas — Publicaciones" eyebrow="Publicaciones" />

      <style>{`
        .revista-img { width:40px; height:40px; object-fit:contain; border-radius:6px; display:block; transition:transform .25s ease; }
        .revista-img:hover { transform:scale(3); z-index:99999; position:relative; }
        .pag-btn-t { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn-t:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn-t.active { background: #C8102E; color: #fff; border-color: transparent; }
      `}</style>
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border-2 border-[color:var(--brand-line)] p-1 bg-white">
          {(["publicaciones", "tipos"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-5 h-9 rounded-md text-[12px] uppercase font-bold tracking-wider transition font-[family-name:var(--font-cond)] inline-flex items-center gap-2 " +
                  (tab === t ? "bg-[color:var(--brand-navy)] text-white" : "text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-mist)]")}>
              {t === "publicaciones" ? <Calendar className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {t === "publicaciones" ? "Publicaciones" : "Temas"}
            </button>
          ))}
        </div>
        {tab === "publicaciones" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Chip color="cyan">{activeCount} activas</Chip>
            <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
          </div>
        )}
      </div>

      {tab === "publicaciones" && (
        <>
          <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
                    <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Título</th>
                    <th style={{ width: 130, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Tema</th>
                    <th style={{ width: 80, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Imagen</th>
                    <th style={{ width: 80, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>PDF</th>
                    <th style={{ width: 100, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
                    <th style={{ width: 80, padding: "10px 8px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.titulo}>{item.titulo}</td>
                      <td style={{ padding: "10px 8px", color: "var(--muted-foreground)" }}>{item.tema || "—"}</td>
                      <td style={{ padding: "10px 8px" }}>
                        {item.imagen_url ? (
                          <img className="revista-img" src={encodeURI(item.imagen_url)} alt=""
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        {item.pdf_url ? (
                          <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" title="Abrir PDF"
                            className="inline-flex items-center gap-1 text-[#1597B8] font-semibold text-[12px] hover:underline">
                            <FileText className="w-3.5 h-3.5" /> PDF
                          </a>
                        ) : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                          background: item.esta_activo ? "#dcfce7" : "#f1f5f9",
                          color: item.esta_activo ? "#166534" : "#475569",
                        }}>
                          {item.esta_activo ? "Activo" : "Inactivo"}
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
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-1.5">
              <button type="button" aria-label="Primera página" onClick={() => setPage(1)} className="pag-btn-t"><ChevronsLeft className="w-4 h-4" /></button>
              <button type="button" aria-label="Página anterior" onClick={() => setPage(p => Math.max(1, p - 1))} className="pag-btn-t"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} type="button" aria-label={`Página ${p}`} onClick={() => setPage(p)}
                  className={`pag-btn-t${p === currentPage ? " active" : ""}`}>{p}</button>
              ))}
              <button type="button" aria-label="Página siguiente" onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="pag-btn-t"><ChevronRight className="w-4 h-4" /></button>
              <button type="button" aria-label="Última página" onClick={() => setPage(totalPages)} className="pag-btn-t"><ChevronsRight className="w-4 h-4" /></button>
            </div>
          )}

          {modalOpen && (
            <Modal onClose={() => setModalOpen(false)}>
              <div style={{ width: 460, maxWidth: "90vw" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                      {editingId !== null ? "Editar revista" : "Nueva revista"}
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
                      Título <span style={{ color: "var(--brand-red)" }}>*</span>
                    </span>
                    <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                      className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
                  </label>

                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                      Tema
                    </span>
                    <select value={form.idTemaRevista ?? 0} onChange={e => setForm(p => ({ ...p, idTemaRevista: Number(e.target.value) || null }))}
                      className={inputCls} style={{ borderColor: "var(--brand-line)", cursor: "pointer" }}>
                      <option value={0}>Seleccionar...</option>
                      {tipos.map(t => <option key={t.id} value={t.id}>{t.value}</option>)}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                      Imagen
                    </span>
                    <div className="flex gap-2 items-center mt-1">
                      <input ref={imgRef} type="file" accept="image/*" onChange={e => handleFile(e, "imagen_url")} className="hidden" />
                      <button type="button" onClick={() => imgRef.current?.click()}
                        className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                        style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                        <Upload className="w-3.5 h-3.5" /> Seleccionar
                      </button>
                      {form.imagen_url && (
                        <img src={encodeURI(form.imagen_url)} className="w-11 h-11 rounded object-contain border" alt="" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }} />
                      )}
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                      PDF
                    </span>
                    <div className="flex gap-2 items-center mt-1">
                      <input ref={pdfRef} type="file" accept=".pdf" onChange={e => handleFile(e, "pdf_url")} className="hidden" />
                      <button type="button" onClick={() => pdfRef.current?.click()}
                        className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                        style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                        <Upload className="w-3.5 h-3.5" /> Subir PDF
                      </button>
                      {form.pdf_url && (
                        <a href={form.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#1597B8] text-[12px] font-semibold hover:underline">
                          <FileText className="w-3.5 h-3.5" /> Ver PDF
                        </a>
                      )}
                    </div>
                  </label>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="revActive" checked={form.esta_activo} onChange={e => setForm(p => ({ ...p, esta_activo: e.target.checked }))}
                      className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                    <label htmlFor="revActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
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
        </>
      )}

      {tab === "tipos" && <TiposPanel tipos={tipos} loadTipos={loadTipos} setMsg={setMsg} />}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar revista"
        message="¿Estás seguro de eliminar esta revista? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

function TiposPanel({ tipos, loadTipos, setMsg }: { tipos: TipoRevista[]; loadTipos: () => void; setMsg: (s: string) => void }) {
  const [tipoForm, setTipoForm] = useState<{ value: string; isActive: boolean }>({ value: "", isActive: true });
  const [tipoEditingId, setTipoEditingId] = useState<number | null>(null);
  const [tipoModalOpen, setTipoModalOpen] = useState(false);
  const [tipoConfirmDelete, setTipoConfirmDelete] = useState<number | null>(null);
  const [tipoPage, setTipoPage] = useState(1);

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(tipos.length / PER_PAGE));
  const currentPage = Math.min(tipoPage, totalPages);
  const paginatedTipos = tipos.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const openCreate = () => {
    setTipoForm({ value: "", isActive: true });
    setTipoEditingId(null);
    setTipoModalOpen(true);
  };

  const openEdit = (t: TipoRevista) => {
    setTipoForm({ value: t.value, isActive: t.isActive });
    setTipoEditingId(t.id);
    setTipoModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!tipoForm.value.trim()) {
      setMsg("Completa el nombre del tema (*)");
      return;
    }
    if (tipoEditingId !== null) {
      const r = await apiPut(`/comunicaciones-revistas/tipos/${tipoEditingId}`, tipoForm);
      setMsg(r.message || "Tema actualizado");
    } else {
      const r = await apiPost("/comunicaciones-revistas/tipos", tipoForm);
      setMsg(r.message || "Tema creado");
    }
    setTipoModalOpen(false);
    setTipoEditingId(null);
    loadTipos();
  };

  const handleDelete = async () => {
    if (tipoConfirmDelete === null) return;
    const id = tipoConfirmDelete;
    setTipoConfirmDelete(null);
    const r: any = await apiDelete(`/comunicaciones-revistas/tipos/${id}`);
    setMsg(r.message || (r.success === false ? "No se puede eliminar: hay revistas asignadas" : "Eliminado"));
    loadTipos();
  };

  const activeCount = tipos.filter(t => t.isActive).length;

  return (
    <>
      <div className="mb-5 flex items-center justify-end gap-3 flex-wrap">
        <Chip color="cyan">{activeCount} activos</Chip>
        <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar tema</BrandButton>
      </div>

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Tema</th>
              <th style={{ width: 100, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
              <th style={{ width: 80, padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTipos.map(t => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)" }}>{t.value}</td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                    background: t.isActive ? "#dcfce7" : "#f1f5f9",
                    color: t.isActive ? "#166534" : "#475569",
                  }}>
                    {t.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#e8ebf0] transition" style={{ color: "#101a34" }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setTipoConfirmDelete(t.id)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}>
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
          <button type="button" aria-label="Primera página" onClick={() => setTipoPage(1)} className="pag-btn-t"><ChevronsLeft className="w-4 h-4" /></button>
          <button type="button" aria-label="Página anterior" onClick={() => setTipoPage(p => Math.max(1, p - 1))} className="pag-btn-t"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} type="button" aria-label={`Página ${p}`} onClick={() => setTipoPage(p)}
              className={`pag-btn-t${p === currentPage ? " active" : ""}`}>{p}</button>
          ))}
          <button type="button" aria-label="Página siguiente" onClick={() => setTipoPage(p => Math.min(totalPages, p + 1))} className="pag-btn-t"><ChevronRight className="w-4 h-4" /></button>
          <button type="button" aria-label="Última página" onClick={() => setTipoPage(totalPages)} className="pag-btn-t"><ChevronsRight className="w-4 h-4" /></button>
        </div>
      )}

      {tipoModalOpen && (
        <Modal onClose={() => setTipoModalOpen(false)}>
          <div style={{ width: 400, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {tipoEditingId !== null ? "Editar tema" : "Nuevo tema"}
                </h3>
              </div>
              <button onClick={() => setTipoModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Nombre <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={tipoForm.value} onChange={e => setTipoForm(p => ({ ...p, value: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="tipoRevActive" checked={tipoForm.isActive} onChange={e => setTipoForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                <label htmlFor="tipoRevActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
              <div style={{ display: "flex", gap: 10 }}>
                <BrandButton variant="outline" onClick={() => setTipoModalOpen(false)}>Cancelar</BrandButton>
                <BrandButton onClick={handleSubmit}>{tipoEditingId !== null ? "Guardar" : "Crear"}</BrandButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={tipoConfirmDelete !== null}
        title="Eliminar tema"
        message="¿Estás seguro de eliminar este tema? Si hay revistas asignadas, no se podrá eliminar."
        onConfirm={handleDelete}
        onCancel={() => setTipoConfirmDelete(null)}
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
