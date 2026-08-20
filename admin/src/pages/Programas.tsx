import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, X, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Programa = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  enlace: string;
  imagen: string;
  activo: boolean;
};

type FormData = {
  codigo: string;
  nombre: string;
  descripcion: string;
  enlace: string;
  imagen: string;
  estaActivo: boolean;
};

function initForm(): FormData {
  return { codigo: "", nombre: "", descripcion: "", enlace: "", imagen: "", estaActivo: true };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 20);
}

export function Programas() {
  const [items, setItems] = useState<Programa[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const imageRef = useRef<HTMLInputElement>(null);

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = items.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const load = () => { setPage(1); apiGet<Programa[]>("/programas").then(setItems).catch(() => {}); };
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

  const openEdit = (item: Programa) => {
    setForm({
      codigo: item.codigo || "",
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      enlace: item.enlace || "",
      imagen: item.imagen || "",
      estaActivo: item.activo
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const result: any = await apiUpload("/programas/upload", fd);
    if (result.success) {
      setForm(prev => ({ ...prev, imagen: result.url }));
      setMsg("Imagen cargada");
    } else {
      setMsg(result.message || "Error al subir imagen");
    }
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      setMsg("Completa el título (*)");
      return;
    }
    const payload = {
      ...form,
      codigo: form.codigo.trim() || slugify(form.nombre),
    };
    if (editingId !== null) {
      await apiPut(`/programas/${editingId}`, payload);
      setMsg("Programa actualizado");
    } else {
      await apiPost("/programas", payload);
      setMsg("Programa creado");
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
    await apiDelete(`/programas/${id}`);
    setMsg("Eliminado");
    load();
  };

  const activeCount = items.filter(i => i.activo).length;

  return (
    <>
      <PageHeader title="Programas" eyebrow="Programas" />

      <style>{`
        .programa-img { width:40px; height:40px; object-fit:contain; border-radius:6px; display:block; transition:transform .25s ease; }
        .programa-img:hover { transform:scale(3); z-index:99999; position:relative; }
        .table-wrap { overflow: visible; }
        .pag-btn-p { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn-p:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn-p.active { background: #C8102E; color: #fff; border-color: transparent; }
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
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Título</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Descripción</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Enlace web</th>
              <th style={{ width: 90, padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Imagen</th>
              <th style={{ width: 120, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
              <th style={{ width: 80, padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.nombre}>{item.nombre || "—"}</td>
                <td style={{ padding: "10px 8px", maxWidth: 260, color: "var(--brand-navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.descripcion}>{item.descripcion || "—"}</td>
                <td style={{ padding: "10px 8px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.enlace ? <a href={item.enlace} target="_blank" rel="noreferrer" style={{ color: "var(--brand-red)", fontSize: 12, textDecoration: "none" }} title={item.enlace}>{item.enlace}</a> : "—"}
                </td>
                <td style={{ padding: "8px" }}>
                  {item.imagen ? <img className="programa-img" src={encodeURI(item.imagen)} alt="" /> : <span style={{ color: "#94a3b8" }}>—</span>}
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
                  {editingId !== null ? "Editar programa" : "Nuevo programa"}
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
                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Título del programa" />
               </label>

               <label className="block">
                 <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                   Descripción
                 </span>
                 <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                   rows={4} className="mt-1 w-full rounded-lg border-2 px-3 py-2 text-[13px] outline-none bg-white resize-none"
                   style={{ borderColor: "var(--brand-line)" }} placeholder="Descripción del programa" />
               </label>

               <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Enlace web
                </span>
                <input type="url" value={form.enlace} onChange={e => setForm(p => ({ ...p, enlace: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="https://..." />
               </label>

               <div>
                 <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                   Imagen
                 </span>
                 <div className="mt-1 flex items-center gap-3">
                   <input ref={imageRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                   <BrandButton variant="outline" onClick={() => imageRef.current?.click()}><Upload className="w-4 h-4" /> Cargar imagen</BrandButton>
                   {form.imagen && <img src={encodeURI(form.imagen)} alt="Vista previa" style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 6, border: "1px solid var(--brand-line)" }} />}
                 </div>
               </div>

               <div className="flex items-end gap-2">
                <input type="checkbox" id="progActive" checked={form.estaActivo} onChange={e => setForm(p => ({ ...p, estaActivo: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                <label htmlFor="progActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
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
        title="Eliminar programa"
        message="¿Estás seguro de eliminar este programa? Esta acción no se puede deshacer."
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
