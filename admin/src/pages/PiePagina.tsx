import { useState, useEffect, useRef } from "react";
import { Send, MapPin, Phone, Mail, AlignLeft, Clock, Plus, Trash2, Pencil, Upload, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Link2, Globe } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip, Panel } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPut, apiPost, apiDelete, apiUpload } from "../lib/api";

type Tab = "informacion" | "redes";
type RedSocial = { id: number; red: string; url: string; imagen_url: string; isActive: boolean };
type FooterSection = { titulo: string; enlace: string };
type FooterData = { telefono: string; direccion: string; email: string; descripcion: string; horario: string; secciones: FooterSection[] };

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

interface Props {
  label: string;
  value: string;
  icon: React.ReactNode;
  field: string;
  onFieldChange: (field: string, value: string) => void;
  multiline?: boolean;
}

const Field = ({ label, value, icon, field, onFieldChange, multiline }: Props) => (
  <label className="block">
    <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{label} <span style={{ color: "var(--brand-red)" }}>*</span></span>
    {multiline ? (
      <div className="mt-1 flex items-start gap-2 rounded-lg border-2 px-3 py-2 bg-white" style={{ borderColor: "var(--brand-line)", minHeight: 80 }}>
        <div className="mt-0.5">{icon}</div>
        <textarea value={value} onChange={e => onFieldChange(field, e.target.value)} required className="flex-1 bg-transparent outline-none text-[14.5px] resize-y" style={{ minHeight: 60 }} />
      </div>
    ) : (
      <div className="mt-1 flex items-center gap-2 rounded-lg border-2 h-11 px-3 bg-white" style={{ borderColor: "var(--brand-line)" }}>
        {icon}
        <input value={value} onChange={e => onFieldChange(field, e.target.value)} required className="flex-1 bg-transparent outline-none text-[14.5px]" />
      </div>
    )}
  </label>
);

export function PiePagina() {
  const [tab, setTab] = useState<Tab>("informacion");
  const [footer, setFooter] = useState<FooterData>({ telefono: "", direccion: "", email: "", descripcion: "", horario: "", secciones: [] });
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [redForm, setRedForm] = useState({ red: "", url: "", imagen_url: "", isActive: true });
  const [redEditingId, setRedEditingId] = useState<number | null>(null);
  const [redModalOpen, setRedModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const redImgRef = useRef<HTMLInputElement>(null);

  const PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(redes.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRedes = redes.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => {
    apiGet<FooterData>("/footer").then(setFooter).catch(() => {});
    apiGet<RedSocial[]>("/redes-sociales").then(setRedes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const handleFieldChange = (field: string, value: string) => setFooter(p => ({ ...p, [field]: value }));

  const updateSection = (index: number, patch: Partial<FooterSection>) => {
    setFooter(prev => ({ ...prev, secciones: prev.secciones.map((section, i) => i === index ? { ...section, ...patch } : section) }));
  };

  const addSection = () => setFooter(prev => ({ ...prev, secciones: [...prev.secciones, { titulo: "", enlace: "" }] }));

  const removeSection = (index: number) => setFooter(prev => ({ ...prev, secciones: prev.secciones.filter((_, i) => i !== index) }));

  const handleFooterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await apiPut("/footer", footer);
    setMsg(r.message || "Guardado");
  };

  // --- Redes sociales CRUD ---
  const openRedCreate = () => {
    setRedForm({ red: "", url: "", imagen_url: "", isActive: true });
    setRedEditingId(null);
    setRedModalOpen(true);
  };

  const openRedEdit = (item: RedSocial) => {
    setRedForm({ red: item.red, url: item.url, imagen_url: item.imagen_url || "", isActive: item.isActive });
    setRedEditingId(item.id);
    setRedModalOpen(true);
  };

  const handleRedFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r: any = await apiUpload("/redes-sociales/upload", fd);
    if (r.success && r.url) {
      setRedForm(p => ({ ...p, imagen_url: r.url }));
    } else {
      setMsg(r.message || "Error al subir imagen");
    }
  };

  const handleRedSubmit = async () => {
    if (!redForm.url.trim()) {
      setMsg("Completa el link de la red social (*)");
      return;
    }
    if (redEditingId !== null) {
      await apiPut(`/redes-sociales/${redEditingId}`, redForm);
      setMsg("Red social actualizada");
    } else {
      await apiPost("/redes-sociales", redForm);
      setMsg("Red social creada");
    }
    setRedModalOpen(false);
    setRedEditingId(null);
    const data = await apiGet<RedSocial[]>("/redes-sociales");
    setRedes(data);
  };

  const handleRedDelete = async () => {
    if (confirmDelete === null) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    await apiDelete(`/redes-sociales/${id}`);
    setMsg("Red social eliminada");
    const data = await apiGet<RedSocial[]>("/redes-sociales");
    setRedes(data);
  };

  const activeCount = redes.filter(r => r.isActive).length;

  return (
    <>
      <PageHeader title="Pie de página" eyebrow="Configuración del sitio" />

      <style>{`
        .red-img { width:40px; height:40px; object-fit:contain; border-radius:6px; display:block; transition:transform .25s ease; }
        .red-img:hover { transform:scale(3); z-index:99999; position:relative; }
        .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
      `}</style>

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border-2 border-[color:var(--brand-line)] p-1 bg-white">
          {(["informacion", "redes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-5 h-9 rounded-md text-[12px] uppercase font-bold tracking-wider transition font-[family-name:var(--font-cond)] inline-flex items-center gap-2 " +
                  (tab === t ? "bg-[color:var(--brand-navy)] text-white" : "text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-mist)]")}>
              {t === "informacion" ? <AlignLeft className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
              {t === "informacion" ? "Información" : "Redes Sociales"}
            </button>
          ))}
        </div>
        {tab === "redes" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Chip color="cyan">{activeCount} activas</Chip>
            <BrandButton onClick={openRedCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
          </div>
        )}
      </div>

      {tab === "informacion" && (
        <form onSubmit={handleFooterSubmit}>
          <Panel title="Información del pie de página">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Número de teléfono" value={footer.telefono} icon={<Phone className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="telefono" onFieldChange={handleFieldChange} />
              <Field label="Dirección" value={footer.direccion} icon={<MapPin className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="direccion" onFieldChange={handleFieldChange} />
              <Field label="Correo" value={footer.email} icon={<Mail className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="email" onFieldChange={handleFieldChange} />
              <Field label="Horario de atención" value={footer.horario} icon={<Clock className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="horario" onFieldChange={handleFieldChange} />
              <Field label="Descripción" value={footer.descripcion} icon={<AlignLeft className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="descripcion" onFieldChange={handleFieldChange} multiline />
            </div>
            <div className="mt-6 rounded-xl border-2 p-4" style={{ borderColor: "var(--brand-line)", background: "#fbfcfe" }}>
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-[13px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Secciones del footer</h3>
                  <p className="mt-1 text-[12px]" style={{ color: "var(--muted-foreground)" }}>Administra el nombre y enlace que aparecerán en el pie de página.</p>
                </div>
                <BrandButton type="button" variant="outline" onClick={addSection}><Plus className="w-4 h-4" /> Agregar enlace</BrandButton>
              </div>
              <div className="space-y-3">
                {footer.secciones.length === 0 && <p className="rounded-lg border border-dashed p-4 text-center text-[13px]" style={{ borderColor: "var(--brand-line)", color: "var(--muted-foreground)" }}>No hay enlaces configurados. Se mostrarán los enlaces predeterminados en el sitio.</p>}
                {footer.secciones.map((section, index) => (
                  <div key={index} className="grid sm:grid-cols-[1fr_1.4fr_auto] gap-3 items-end">
                    <label className="block"><span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Nombre</span><input value={section.titulo} onChange={e => updateSection(index, { titulo: e.target.value })} placeholder="Ej. Publicaciones" className={inputCls} style={{ borderColor: "var(--brand-line)" }} /></label>
                    <label className="block"><span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Enlace</span><div className="mt-1 flex items-center gap-2 rounded-lg border-2 h-11 px-3 bg-white" style={{ borderColor: "var(--brand-line)" }}><Link2 className="w-4 h-4" style={{ color: "var(--brand-red)" }} /><input value={section.enlace} onChange={e => updateSection(index, { enlace: e.target.value })} placeholder="/publicaciones o https://..." className="flex-1 bg-transparent outline-none text-[13px]" /></div></label>
                    <button type="button" onClick={() => removeSection(index)} aria-label={`Eliminar ${section.titulo || "enlace"}`} className="h-11 w-11 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end"><BrandButton type="submit"><Send className="w-4 h-4" /> Enviar Información</BrandButton></div>
          </Panel>
        </form>
      )}

      {tab === "redes" && (
        <>
          <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Red Social</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Link</th>
                  <th style={{ width: 80, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Imagen</th>
                  <th style={{ width: 100, textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
                  <th style={{ width: 80, padding: "10px 8px" }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRedes.map(item => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)" }}>{item.red}</td>
                    <td style={{ padding: "10px 8px", color: "#1597B8", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.url}</a>
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      {item.imagen_url ? (
                        <img className="red-img" src={encodeURI(item.imagen_url)} alt=""
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{
                        display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                        fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                        background: item.isActive ? "#dcfce7" : "#f1f5f9",
                        color: item.isActive ? "#166534" : "#475569",
                      }}>
                        {item.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openRedEdit(item)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#e8ebf0] transition" style={{ color: "#101a34" }}>
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
              <button type="button" aria-label="Primera página" onClick={() => setPage(1)} className="pag-btn"><ChevronsLeft className="w-4 h-4" /></button>
              <button type="button" aria-label="Página anterior" onClick={() => setPage(p => Math.max(1, p - 1))} className="pag-btn"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} type="button" aria-label={`Página ${p}`} onClick={() => setPage(p)}
                  className={`pag-btn${p === currentPage ? " active" : ""}`}>{p}</button>
              ))}
              <button type="button" aria-label="Página siguiente" onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="pag-btn"><ChevronRight className="w-4 h-4" /></button>
              <button type="button" aria-label="Última página" onClick={() => setPage(totalPages)} className="pag-btn"><ChevronsRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      )}

      {/* Modal de red social */}
      {redModalOpen && (
        <Modal onClose={() => setRedModalOpen(false)}>
          <div style={{ width: 460, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {redEditingId !== null ? "Editar red social" : "Nueva red social"}
                </h3>
              </div>
              <button onClick={() => setRedModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Red social <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input type="text" value={redForm.red} onChange={e => setRedForm(p => ({ ...p, red: e.target.value }))}
                  placeholder="Ej. Facebook, WhatsApp, Telegram..."
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Link <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border-2 h-11 px-3 bg-white" style={{ borderColor: "var(--brand-line)" }}>
                  <Link2 className="w-4 h-4" style={{ color: "var(--brand-red)" }} />
                  <input type="url" placeholder="https://…" value={redForm.url} onChange={e => setRedForm(p => ({ ...p, url: e.target.value }))}
                    className="flex-1 bg-transparent outline-none text-[14.5px]" />
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Imagen
                </span>
                <div className="flex gap-2 items-center mt-1">
                  <input ref={redImgRef} type="file" accept="image/*" onChange={handleRedFile} className="hidden" />
                  <button type="button" onClick={() => redImgRef.current?.click()}
                    className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                    style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                    <Upload className="w-3.5 h-3.5" /> Seleccionar
                  </button>
                  {redForm.imagen_url && (
                    <img src={encodeURI(redForm.imagen_url)} className="w-11 h-11 rounded object-contain border" alt="" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }} />
                  )}
                </div>
              </label>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="redActive" checked={redForm.isActive} onChange={e => setRedForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                <label htmlFor="redActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
              <div style={{ display: "flex", gap: 10 }}>
                <BrandButton variant="outline" onClick={() => setRedModalOpen(false)}>Cancelar</BrandButton>
                <BrandButton onClick={handleRedSubmit}>{redEditingId !== null ? "Guardar" : "Crear"}</BrandButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar red social"
        message="¿Estás seguro de eliminar esta red social? Esta acción no se puede deshacer."
        onConfirm={handleRedDelete}
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
