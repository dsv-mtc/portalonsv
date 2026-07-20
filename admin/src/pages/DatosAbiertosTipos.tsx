import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type Tipo = { id: number; value: string; estaActivo: boolean };

interface FormData {
  value: string;
  estaActivo: boolean;
}

function initForm(): FormData {
  return { value: "", estaActivo: true };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

export function DatosAbiertosTipos() {
  const [items, setItems] = useState<Tipo[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = items.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const load = () => { setPage(1); apiGet<Tipo[]>("/datos-abiertos-tipos").then(setItems).catch(() => {}); };
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

  const openEdit = (item: Tipo) => {
    setForm({ value: item.value, estaActivo: item.estaActivo });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.value.trim()) {
      setMsg("Completa los campos obligatorios (*)");
      return;
    }
    if (editingId !== null) {
      await apiPut(`/datos-abiertos-tipos/${editingId}`, form);
      setMsg("Tipo actualizado");
    } else {
      await apiPost("/datos-abiertos-tipos", form);
      setMsg("Tipo creado");
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
    await apiDelete(`/datos-abiertos-tipos/${id}`);
    setMsg("Eliminado");
    load();
  };

  const pagBtn = (label: React.ReactNode, active: boolean, onClick: () => void, ariaLabel: string) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
      className={`pag-btn${active ? " active" : ""}`}>
      {label}
    </button>
  );

  const activeCount = items.filter(i => i.estaActivo).length;

  return (
    <>
      <PageHeader title="Tipos — Datos Abiertos" eyebrow="Clasificación" actions={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Chip color="cyan">{activeCount} activos</Chip>
          <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
        </div>
      } />

      <style>{`
        .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
        .pag-btn.active:hover { background: #C8102E; color: #fff; border-color: transparent; }
      `}</style>
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)", marginTop: 75 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Tipo</th>
              <th style={{ width: 100, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
              <th style={{ width: 80, padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)" }}>{item.value}</td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                    background: item.estaActivo ? "#dcfce7" : "#f1f5f9",
                    color: item.estaActivo ? "#166534" : "#475569",
                  }}>
                    {item.estaActivo ? "Activo" : "Inactivo"}
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
          <div style={{ width: 400, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {editingId !== null ? "Editar tipo" : "Nuevo tipo"}
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
                  Nombre <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="tipoActive" checked={form.estaActivo} onChange={e => setForm(p => ({ ...p, estaActivo: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                <label htmlFor="tipoActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
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
        title="Eliminar tipo"
        message="¿Estás seguro de eliminar este tipo? Esta acción no se puede deshacer."
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
