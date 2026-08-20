import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, X, Upload, Languages } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Lang = "es" | "en";

type AccesoRapido = {
  id: number;
  idioma: string;
  orden: number;
  eyebrow: string;
  titulo: string;
  descripcion: string;
  texto_boton: string;
  enlace_boton: string;
  external: boolean;
  imagen: string;
};

type AccesoForm = {
  eyebrow: string;
  titulo: string;
  descripcion: string;
  texto_boton: string;
  enlace_boton: string;
  imagen: string;
};

function initForm(): AccesoForm {
  return { eyebrow: "", titulo: "", descripcion: "", texto_boton: "", enlace_boton: "", imagen: "" };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

export function AccesosRapidos() {
  const [lang, setLang] = useState<Lang>("es");
  const [items, setItems] = useState<AccesoRapido[]>([]);
  const [form, setForm] = useState<AccesoForm>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const idiom = lang === "en" ? "EN" : "ES";

  const load = () => {
    apiGet<AccesoRapido[]>(`/accesos-rapidos?idioma=${idiom}`).then(setItems).catch(() => {});
  };
  useEffect(() => { load(); }, [idiom]);

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

  const openEdit = (item: AccesoRapido) => {
    setForm({
      eyebrow: item.eyebrow || "",
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      texto_boton: item.texto_boton || "",
      enlace_boton: item.enlace_boton || "",
      imagen: item.imagen || "",
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const result: any = await apiUpload("/accesos-rapidos/upload", fd);
    if (result.success) {
      setForm(prev => ({ ...prev, imagen: result.url }));
      setMsg("Imagen cargada");
    } else {
      setMsg(result.message || "Error al subir imagen");
    }
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      setMsg("Completa el título (*)");
      return;
    }
    const payload = { ...form };
    if (editingId !== null) {
      await apiPut(`/accesos-rapidos/${editingId}`, payload);
      setMsg("Acceso rápido actualizado");
    } else {
      await apiPost("/accesos-rapidos", { ...payload, idioma: idiom, orden: items.length + 1 });
      setMsg("Acceso rápido creado");
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
    await apiDelete(`/accesos-rapidos/${id}`);
    setMsg("Eliminado");
    load();
  };

  return (
    <>
      <PageHeader title="Accesos Rápidos" eyebrow="Tarjetas bajo el mapa (ES / EN)"
        description="Edita las tarjetas que se muestran debajo del mapa de siniestros viales en la home: textos, imagen y enlace del botón." />

      <div className="mb-5 inline-flex rounded-lg border-2 border-[color:var(--brand-line)] p-1 bg-white">
        {(["es", "en"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className={"px-4 h-9 rounded-md text-[12px] uppercase font-bold tracking-wider transition font-[family-name:var(--font-cond)] inline-flex items-center gap-2 " +
                (lang === l ? "bg-[color:var(--brand-navy)] text-white" : "text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-mist)]")}>
            <Languages className="w-3.5 h-3.5" /> {l === "es" ? "Español" : "English"}
          </button>
        ))}
      </div>

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="mb-5 flex items-center justify-end gap-3 flex-wrap">
        <Chip color="cyan">{items.length} tarjeta(s)</Chip>
        <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
      </div>

      <style>{`
        .acceso-img { width:70px; height:44px; object-fit:cover; border-radius:6px; display:block; transition:transform .25s ease; }
        .acceso-img:hover { transform:scale(2.5); z-index:99999; position:relative; }
        .table-wrap { overflow: visible; }
      `}</style>

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)" }}>
        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
                <th style={{ width: 90, padding: "10px 8px" }}></th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Eyebrow</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Título</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Descripción</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Botón</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Enlace</th>
                <th style={{ width: 80, padding: "10px 8px" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px 8px", textAlign: "center", color: "var(--brand-navy)", opacity: 0.6, fontSize: 13 }}>
                    No hay tarjetas en este idioma. Clic en "Agregar" para crear la primera.
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                  <td style={{ padding: "8px" }}>
                    {item.imagen ? <img className="acceso-img" src={encodeURI(item.imagen)} alt="" /> : <span style={{ color: "#94a3b8" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 8px", color: "var(--brand-navy)" }}>{item.eyebrow || "—"}</td>
                  <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.titulo}>{item.titulo || "—"}</td>
                  <td style={{ padding: "10px 8px", maxWidth: 260, color: "var(--brand-navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.descripcion}>{item.descripcion || "—"}</td>
                  <td style={{ padding: "10px 8px", color: "var(--brand-navy)" }}>{item.texto_boton || "—"}</td>
                  <td style={{ padding: "10px 8px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.enlace_boton ? <a href={item.enlace_boton} target="_blank" rel="noreferrer" style={{ color: "var(--brand-red)", fontSize: 12, textDecoration: "none" }} title={item.enlace_boton}>{item.enlace_boton}</a> : "—"}
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

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div style={{ width: 480, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {editingId !== null ? "Editar tarjeta" : "Nueva tarjeta"}
                </h3>
                <p style={{ fontSize: 11, color: "#5c6273", margin: "4px 0 0", fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Idioma: {lang === "es" ? "Español" : "English"}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                    Eyebrow
                  </span>
                  <input value={form.eyebrow} onChange={e => setForm(p => ({ ...p, eyebrow: e.target.value }))}
                    className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Ej. Formación" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                    Título <span style={{ color: "var(--brand-red)" }}>*</span>
                  </span>
                  <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                    className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Título de la tarjeta" />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Descripción
                </span>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border-2 px-3 py-2 text-[13px] outline-none bg-white resize-none"
                  style={{ borderColor: "var(--brand-line)" }} placeholder="Descripción de la tarjeta" />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Texto del botón
                </span>
                <input value={form.texto_boton} onChange={e => setForm(p => ({ ...p, texto_boton: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="Ej. Ir al aula virtual" />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Enlace del botón
                </span>
                <input type="url" value={form.enlace_boton} onChange={e => setForm(p => ({ ...p, enlace_boton: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="https://... o /ruta-interna" />
              </label>

              <div>
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Imagen
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <input ref={imageRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <BrandButton variant="outline" onClick={() => imageRef.current?.click()}><Upload className="w-4 h-4" /> Cargar imagen</BrandButton>
                  {form.imagen && <img src={encodeURI(form.imagen)} alt="Vista previa" style={{ width: 100, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid var(--brand-line)" }} />}
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
        title="Eliminar tarjeta"
        message="¿Estás seguro de eliminar esta tarjeta? Esta acción no se puede deshacer."
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
