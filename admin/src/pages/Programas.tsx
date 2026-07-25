import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, Upload, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Entorno = {
  id: number;
  badge_es: string;
  badge_en: string;
  titulo_es: string;
  titulo_en: string;
  descripcion_es: string;
  descripcion_en: string;
  imagen_url: string;
  activo: boolean;
  orden: number;
};

type FormData = {
  badge_es: string;
  titulo_es: string;
  descripcion_es: string;
  imagen_url: string;
  activo: boolean;
  orden: number;
};

function initForm(): FormData {
  return { badge_es: "", titulo_es: "", descripcion_es: "", imagen_url: "", activo: true, orden: 0 };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";
const taCls = "mt-1 w-full rounded-lg border-2 px-3 py-2 text-[13px] outline-none bg-white resize-y";

export function Programas() {
  const [items, setItems] = useState<Entorno[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const imgRef = useRef<HTMLInputElement>(null);

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = items.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const load = () => { setPage(1); apiGet<Entorno[]>("/entornos-viales").then(setItems).catch(() => {}); };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const openCreate = () => {
    setForm({ ...initForm(), orden: items.length + 1 });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: Entorno) => {
    setForm({
      badge_es: item.badge_es,
      titulo_es: item.titulo_es,
      descripcion_es: item.descripcion_es,
      imagen_url: item.imagen_url || "", activo: item.activo, orden: item.orden
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r: any = await apiUpload("/entornos-viales/upload", fd);
    if (r.success && r.url) {
      setForm(p => ({ ...p, imagen_url: r.url }));
    } else {
      setMsg(r.message || "Error al subir imagen");
    }
  };

  const handleSubmit = async () => {
    if (!form.titulo_es.trim()) {
      setMsg("Completa el título (*)");
      return;
    }
    const payload = {
      ...form,
      badge_en: "",
      titulo_en: "",
      descripcion_en: "",
    };
    if (editingId !== null) {
      await apiPut(`/entornos-viales/${editingId}`, payload);
      setMsg("Entorno vial actualizado");
    } else {
      await apiPost("/entornos-viales", payload);
      setMsg("Entorno vial creado");
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
    await apiDelete(`/entornos-viales/${id}`);
    setMsg("Eliminado");
    load();
  };

  const activeCount = items.filter(i => i.activo).length;

  return (
    <>
      <PageHeader title="Entornos Viales" eyebrow="Programas" />

      <style>{`
        .entorno-img { width:48px; height:48px; object-fit:contain; border-radius:8px; display:block; transition:transform .25s ease; }
        .entorno-img:hover { transform:scale(3); z-index:99999; position:relative; }
        .pag-btn-p { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn-p:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn-p.active { background: #C8102E; color: #fff; border-color: transparent; }
        .table-wrap { overflow: visible; }
      `}</style>
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="mb-5 flex items-center justify-end gap-3 flex-wrap">
        <Chip color="cyan">{activeCount} activos</Chip>
        <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
      </div>

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)" }}>
        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
                <th style={{ width: 60, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Orden</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Badge</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Título</th>
                <th style={{ width: 70, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Imagen</th>
                <th style={{ width: 100, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
                <th style={{ width: 80, padding: "10px 8px" }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                  <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)" }}>{item.orden}</td>
                  <td style={{ padding: "10px 8px", color: "var(--muted-foreground)" }}>{item.badge_es || "—"}</td>
                  <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.titulo_es}>{item.titulo_es || "—"}</td>
                  <td style={{ padding: "10px 8px" }}>
                    {item.imagen_url ? (
                      <img className="entorno-img" src={encodeURI(item.imagen_url)} alt=""
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : <span style={{ color: "#94a3b8" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                      background: item.activo ? "#dcfce7" : "#f1f5f9",
                      color: item.activo ? "#166534" : "#475569",
                    }}>
                      {item.activo ? "Activo" : "Inactivo"}
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
          <button type="button" aria-label="Primera página" onClick={() => setPage(1)} className="pag-btn-p"><ChevronsLeft className="w-4 h-4" /></button>
          <button type="button" aria-label="Página anterior" onClick={() => setPage(p => Math.max(1, p - 1))} className="pag-btn-p"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} type="button" aria-label={`Página ${p}`} onClick={() => setPage(p)}
              className={`pag-btn-p${p === currentPage ? " active" : ""}`}>{p}</button>
          ))}
          <button type="button" aria-label="Página siguiente" onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="pag-btn-p"><ChevronRight className="w-4 h-4" /></button>
          <button type="button" aria-label="Última página" onClick={() => setPage(totalPages)} className="pag-btn-p"><ChevronsRight className="w-4 h-4" /></button>
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div style={{ width: 460, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {editingId !== null ? "Editar entorno vial" : "Nuevo entorno vial"}
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
                  Badge <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.badge_es} onChange={e => setForm(p => ({ ...p, badge_es: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Ej. Corredores" />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Título <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.titulo_es} onChange={e => setForm(p => ({ ...p, titulo_es: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Título de la tarjeta" />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Descripción
                </span>
                <textarea value={form.descripcion_es} onChange={e => setForm(p => ({ ...p, descripcion_es: e.target.value }))}
                  className={taCls} style={{ borderColor: "var(--brand-line)", minHeight: 70 }} placeholder="Descripción de la tarjeta" />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Imagen
                </span>
                <div className="flex gap-2 items-center mt-1">
                  <input ref={imgRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <button type="button" onClick={() => imgRef.current?.click()}
                    className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                    style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                    <Upload className="w-3.5 h-3.5" /> Seleccionar
                  </button>
                  {form.imagen_url && (
                    <img src={encodeURI(form.imagen_url)} className="w-11 h-11 rounded object-cover border" alt="" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }} />
                  )}
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                    Orden
                  </span>
                  <input type="number" value={form.orden} onChange={e => setForm(p => ({ ...p, orden: Number(e.target.value) }))}
                    className={inputCls} style={{ borderColor: "var(--brand-line)" }} min={0} />
                </label>
                <div className="flex items-end gap-2 pb-1">
                  <input type="checkbox" id="entActive" checked={form.activo} onChange={e => setForm(p => ({ ...p, activo: e.target.checked }))}
                    className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                  <label htmlFor="entActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
                </div>
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
        title="Eliminar entorno vial"
        message="¿Estás seguro de eliminar este entorno vial? Esta acción no se puede deshacer."
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
        style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
