import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, X, Upload, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Institucion = {
  id: number;
  nombre: string;
  enlace: string;
  logo_url: string;
  activo?: number;
};

type FormData = {
  nombre: string;
  enlace: string;
  logo_url: string;
};

function initForm(): FormData {
  return { nombre: "", enlace: "", logo_url: "" };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

export function InstitucionesAliadas() {
  const [items, setItems] = useState<Institucion[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const load = () => {
    apiGet<Institucion[]>("/instituciones-aliadas").then(setItems).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  useEffect(() => { setPage(1); }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const pagedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const pagBtn = (label: React.ReactNode, active: boolean, onClick: () => void, ariaLabel: string) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
      className={`pag-btn${active ? " active" : ""}`}>
      {label}
    </button>
  );

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

  const openEdit = (item: Institucion) => {
    setForm({
      nombre: item.nombre || "",
      enlace: item.enlace || "",
      logo_url: item.logo_url || "",
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const result: any = await apiUpload("/instituciones-aliadas/upload", fd);
    if (result.success) {
      setForm(prev => ({ ...prev, logo_url: result.url }));
      setMsg("Imagen cargada");
    } else {
      setMsg(result.message || "Error al subir imagen");
    }
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.enlace.trim() || !form.logo_url.trim()) {
      setMsg("Completa nombre, enlace e imagen");
      return;
    }
    if (editingId !== null) {
      await apiPut(`/instituciones-aliadas/${editingId}`, form);
      setMsg("Institución actualizada");
    } else {
      await apiPost("/instituciones-aliadas", form);
      setMsg("Institución creada");
    }
    setModalOpen(false);
    setForm(initForm());
    setEditingId(null);
    load();
  };

  const handleDelete = async () => {
    if (confirmDelete === null) return;
    await apiDelete(`/instituciones-aliadas/${confirmDelete}`);
    setMsg("Eliminada");
    setConfirmDelete(null);
    load();
  };

  return (
    <>
      <PageHeader title="Instituciones Aliadas" eyebrow="Sección de la home"
        description="Gestiona los logos, nombres y enlaces que se muestran en Instituciones aliadas." />

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="mb-5 flex items-center justify-end gap-3">
        <Chip color="cyan">{items.length} registro(s)</Chip>
        <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
      </div>

      <style>{`
        .table-wrap { overflow: visible; }
        .inst-img { width:80px; height:44px; object-fit:contain; border-radius:6px; display:block; background:#fff; border:1px solid var(--brand-line); transition:transform .25s ease; }
        .inst-img:hover { transform:scale(2.5); z-index:99999; position:relative; }
        .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
        .pag-btn.active:hover { background: #C8102E; color: #fff; border-color: transparent; }
      `}</style>

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5 table-wrap" style={{ boxShadow: "var(--shadow-brand)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
              <th style={{ width: 110, padding: "10px 8px" }}>Logo</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase" }}>Nombre</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase" }}>Enlace</th>
              <th style={{ width: 100, padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "32px 8px", textAlign: "center", color: "var(--brand-navy)", opacity: 0.6 }}>
                  No hay instituciones. Clic en "Agregar".
                </td>
              </tr>
            ) : pagedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                <td style={{ padding: "8px" }}>
                  {item.logo_url ? <img className="inst-img" src={encodeURI(item.logo_url)} alt="" /> : <span style={{ color: "#94a3b8" }}>—</span>}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)", fontWeight: 600 }}>{item.nombre}</td>
                <td style={{ padding: "10px 8px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <a href={item.enlace} target="_blank" rel="noreferrer" style={{ color: "var(--brand-red)", fontSize: 12, textDecoration: "none" }} title={item.enlace}>{item.enlace}</a>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#e8ebf0]"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirmDelete(item.id)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#fdecec]" style={{ color: "var(--brand-red)" }}><Trash2 className="w-3.5 h-3.5" /></button>
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => pagBtn(p, p === page, () => setPage(p), `Página ${p}`))}
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
                  {editingId !== null ? "Editar institución" : "Nueva institución"}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold" style={{ color: "var(--brand-navy)" }}>Nombre *</span>
                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Ej. Ministerio de Salud" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold" style={{ color: "var(--brand-navy)" }}>Enlace *</span>
                <input value={form.enlace} onChange={e => setForm(p => ({ ...p, enlace: e.target.value }))} className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="https://..." />
              </label>
              <div>
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold" style={{ color: "var(--brand-navy)" }}>Logo *</span>
                <div className="mt-1 flex items-center gap-3">
                  <input ref={imageRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <BrandButton variant="outline" onClick={() => imageRef.current?.click()}><Upload className="w-4 h-4" /> Cargar imagen</BrandButton>
                  {form.logo_url && <img src={encodeURI(form.logo_url)} alt="Vista previa" style={{ width: 120, height: 64, objectFit: "contain", borderRadius: 6, border: "1px solid var(--brand-line)", background: "#fff" }} />}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <BrandButton variant="outline" onClick={() => setModalOpen(false)}>Cancelar</BrandButton>
              <BrandButton onClick={handleSubmit}>{editingId !== null ? "Guardar" : "Crear"}</BrandButton>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal open={confirmDelete !== null} title="Eliminar institución" message="¿Estás seguro de eliminar esta institución? Esta acción no se puede deshacer." onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
