import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type YoutubeVideo = {
  id: number;
  seccion: string;
  titulo: string;
  descripcion: string;
  video_url: string;
  create_time: string;
  update_time: string;
};

type FormData = {
  titulo: string;
  descripcion: string;
  video_url: string;
};

type Seccion = "home" | "webinars" | "capacitaciones";

const SECCIONES: { key: Seccion; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "webinars", label: "Webinars" },
  { key: "capacitaciones", label: "Capacitaciones" },
];

function initForm(): FormData {
  return { titulo: "", descripcion: "", video_url: "" };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|watch\?v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function isValidYoutubeUrl(url: string): boolean {
  return !!extractVideoId(url);
}

export function YoutubeVideos() {
  const [items, setItems] = useState<YoutubeVideo[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [seccion, setSeccion] = useState<Seccion>("home");

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = items.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const load = () => {
    setPage(1);
    apiGet<YoutubeVideo[]>(`/youtube-videos?seccion=${seccion}`).then(setItems).catch(() => {});
  };
  useEffect(() => { load(); }, [seccion]);

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

  const openEdit = (item: YoutubeVideo) => {
    setForm({
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      video_url: item.video_url || "",
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      setMsg("Completa el título (*)");
      return;
    }
    if (!form.video_url.trim()) {
      setMsg("Completa la URL del video (*)");
      return;
    }
    if (!isValidYoutubeUrl(form.video_url.trim())) {
      setMsg("URL de YouTube inválida. Formatos válidos: youtu.be/ID, watch?v=ID, embed/ID, shorts/ID");
      return;
    }
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: seccion === "home" ? "" : form.descripcion.trim(),
      video_url: form.video_url.trim(),
    };
    let result;
    if (editingId !== null) {
      result = await apiPut(`/youtube-videos/${editingId}`, payload);
      setMsg("Video actualizado");
    } else {
      result = await apiPost("/youtube-videos", { ...payload, seccion });
    }
    if (!result.success) {
      setMsg(result.message || "No se pudo guardar el video");
      return;
    }
    if (editingId === null) {
      setMsg("Video creado");
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
    await apiDelete(`/youtube-videos/${id}`);
    setMsg("Eliminado");
    load();
  };

  return (
    <>
      <PageHeader title="YouTube" eyebrow="Videos administrables" description="Videos de YouTube que se muestran en la home, webinars y capacitaciones del portal público. La miniatura se obtiene automáticamente del video." />

      <style>{`
        .pag-btn-y { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn-y:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn-y.active { background: #C8102E; color: #fff; border-color: transparent; }
        .yt-tab { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-cond); cursor: pointer; border: 2px solid var(--brand-line); background: #fff; color: var(--brand-navy); transition: all .2s ease; }
        .yt-tab:hover { border-color: var(--brand-red); color: var(--brand-red); }
        .yt-tab.active { background: var(--brand-navy); color: #fff; border-color: var(--brand-navy); }
      `}</style>
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="mb-5 flex items-center gap-2 flex-wrap">
        {SECCIONES.map(s => (
          <button key={s.key} type="button" onClick={() => setSeccion(s.key)} className={`yt-tab${s.key === seccion ? " active" : ""}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-end gap-3 flex-wrap">
        <Chip color="cyan">{items.length} video(s)</Chip>
        <BrandButton onClick={openCreate}>
          <Plus className="w-4 h-4" /> Agregar
        </BrandButton>
      </div>

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
              <th style={{ width: 90, padding: "10px 8px" }}></th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Título</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>URL</th>
              <th style={{ width: 80, padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "32px 8px", textAlign: "center", color: "var(--brand-navy)", opacity: 0.6, fontSize: 13 }}>
                  No hay videos cargados en esta sección. Clic en "Agregar" para crear el primero.
                </td>
              </tr>
            ) : paginatedItems.map(item => {
              const vid = extractVideoId(item.video_url);
              const thumb = vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : null;
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                  <td style={{ padding: "8px" }}>
                    {thumb ? (
                      <img src={thumb} alt={item.titulo} style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 6, border: "1px solid var(--brand-line)" }} />
                    ) : (
                      <div style={{ width: 80, height: 45, borderRadius: 6, background: "#f1f5f9", display: "grid", placeItems: "center", fontSize: 10, color: "#94a3b8" }}>—</div>
                    )}
                  </td>
                  <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.titulo}>{item.titulo || "—"}</td>
                  <td style={{ padding: "10px 8px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <a href={item.video_url} target="_blank" rel="noreferrer" style={{ color: "var(--brand-red)", fontSize: 12, textDecoration: "none" }} title={item.video_url}>{item.video_url || "—"}</a>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-1.5">
          <button type="button" aria-label="Primera página" onClick={() => setPage(1)} className="pag-btn-y"><ChevronsLeft className="w-4 h-4" /></button>
          <button type="button" aria-label="Página anterior" onClick={() => setPage(p => Math.max(1, p - 1))} className="pag-btn-y"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} type="button" aria-label={`Página ${p}`} onClick={() => setPage(p)}
              className={`pag-btn-y${p === currentPage ? " active" : ""}`}>{p}</button>
          ))}
          <button type="button" aria-label="Página siguiente" onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="pag-btn-y"><ChevronRight className="w-4 h-4" /></button>
          <button type="button" aria-label="Última página" onClick={() => setPage(totalPages)} className="pag-btn-y"><ChevronsRight className="w-4 h-4" /></button>
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div style={{ width: 480, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {editingId !== null ? "Editar video" : "Nuevo video"}
                </h3>
                <p style={{ fontSize: 11, color: "#5c6273", margin: "4px 0 0", fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Sección: {SECCIONES.find(s => s.key === seccion)?.label}
                </p>
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
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Título del video" />
              </label>

              {seccion !== "home" && (
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                    Descripción
                  </span>
                  <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-lg border-2 px-3 py-2 text-[13px] outline-none bg-white resize-none"
                    style={{ borderColor: "var(--brand-line)" }} placeholder="Descripción del video (opcional)" />
                </label>
              )}

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  URL del video <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input type="url" value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="https://youtu.be/abc123 o https://www.youtube.com/watch?v=abc123" />
                <span className="block text-[10px] mt-1" style={{ color: "#94a3b8" }}>
                  Formatos: youtu.be/ID, watch?v=ID, embed/ID, shorts/ID
                </span>
              </label>

              {form.video_url && isValidYoutubeUrl(form.video_url) && (() => {
                const vid = extractVideoId(form.video_url);
                const thumb = vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : null;
                return thumb ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={thumb} alt="preview" style={{ width: 120, height: 67, objectFit: "cover", borderRadius: 6, border: "1px solid var(--brand-line)" }} />
                    <span className="text-[11px]" style={{ color: "#94a3b8" }}>Vista previa de miniatura</span>
                  </div>
                ) : null;
              })()}
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
        title="Eliminar video"
        message="¿Estás seguro de eliminar este video? Esta acción no se puede deshacer."
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
