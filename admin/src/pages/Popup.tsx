import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, Upload, Send, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPut, apiPost, apiDelete, apiUpload } from "../lib/api";

type PopupSlide = {
  id: number;
  posicion: number;
  imagen: string;
  enlace: string;
};

export function Popup() {
  const [estado, setEstado] = useState(false);
  const [slides, setSlides] = useState<PopupSlide[]>([]);
  const [msg, setMsg] = useState("");
  const [msgTimer, setMsgTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const showMsg = (text: string) => {
    if (msgTimer) clearTimeout(msgTimer);
    setMsg(text);
    setMsgTimer(setTimeout(() => setMsg(""), 3000));
  };

  const load = () => {
    apiGet<{ estado: boolean; slides: PopupSlide[] }>("/popup").then(d => {
      setEstado(!!d.estado);
      setSlides(d.slides || []);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleToggleEstado = async (v: boolean) => {
    setEstado(v);
    const r = await apiPut("/popup", { estado: v });
    showMsg(r.success ? "Popup activo actualizado" : (r.message || "Error"));
  };

  const handleFile = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r: any = await apiUpload("/popup/upload", fd);
    if (r.success && r.url) {
      setSlides(prev => prev.map(s => s.id === id ? { ...s, imagen: r.url } : s));
      showMsg("Imagen cargada");
    } else {
      showMsg(r.message || "Error al subir imagen");
    }
    e.target.value = "";
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= slides.length) return;
    const copy = [...slides];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    const p = copy[index].posicion;
    copy[index].posicion = copy[next].posicion;
    copy[next].posicion = p;
    setSlides(copy);
    const orden = copy.map((s, i) => ({ id: s.id, posicion: i + 1 }));
    apiPut("/popup/order", { orden }).then(r => {
      if (r.success) showMsg("Orden actualizado");
      else showMsg(r.message || "Error");
    });
  };

  const updateField = (id: number, key: "imagen" | "enlace", value: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const saveSlide = async (slide: PopupSlide) => {
    setSavingId(slide.id);
    const r = await apiPut(`/popup/slides/${slide.id}`, { imagen: slide.imagen, enlace: slide.enlace });
    setSavingId(null);
    showMsg(r.success ? "Slide guardado" : (r.message || "Error"));
  };

  const handleAdd = async () => {
    const r = await apiPost<PopupSlide>("/popup/slides", { imagen: "", enlace: "" });
    if (r.success) { showMsg("Slide agregado"); load(); }
    else showMsg(r.message || "Error");
  };

  const handleDelete = async () => {
    if (confirmDelete === null) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    await apiDelete(`/popup/slides/${id}`);
    showMsg("Slide eliminado");
    load();
  };

  const labelCls = "text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold";

  return (
    <>
      <PageHeader title="Popup" eyebrow="Ventana emergente"
        description="El popup aparece al cargar la página y funciona como carrusel: las flechas cambian de slide. Ordena, sube imágenes y define el enlace de cada uno." />

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <Panel>
        <label className="flex items-center gap-3 mb-5">
          <input type="checkbox" checked={estado} onChange={e => handleToggleEstado(e.target.checked)}
            className="w-5 h-5 rounded border-2 accent-[color:var(--brand-red)]" />
          <span className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>Popup activo</span>
        </label>

        <div className="flex items-center justify-between mb-4">
          <span className={labelCls}>Slides del carrusel</span>
          <BrandButton onClick={handleAdd}><Plus className="w-4 h-4" /> Agregar</BrandButton>
        </div>

        <div className="space-y-4">
          {slides.length === 0 && (
            <div className="p-4 rounded-lg bg-[#f1f5f9] text-[#5c6273] text-[13px]">
              No hay slides. Clic en "Agregar" para crear el primero.
            </div>
          )}
          {slides.map((slide, i) => (
            <div key={slide.id} className="p-4 rounded-lg border-2 bg-white space-y-4" style={{ borderColor: "var(--brand-line)" }}>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                    className="w-8 h-8 rounded-lg border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30"
                    style={{ borderColor: "var(--brand-line)" }}>
                    <ArrowUp className="w-4 h-4" style={{ color: "var(--brand-navy)" }} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1}
                    className="w-8 h-8 rounded-lg border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30"
                    style={{ borderColor: "var(--brand-line)" }}>
                    <ArrowDown className="w-4 h-4" style={{ color: "var(--brand-navy)" }} />
                  </button>
                </div>
                <div className="w-[150px] h-[90px] rounded-lg overflow-hidden border" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }}>
                  {slide.imagen
                    ? <img src={encodeURI(slide.imagen)} alt={`Slide ${slide.posicion}`} className="w-full h-full object-contain" />
                    : <div className="w-full h-full grid place-items-center text-[11px]" style={{ color: "#94a3b8" }}>Sin imagen</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold font-[family-name:var(--font-cond)] uppercase tracking-wide" style={{ color: "var(--brand-navy)" }}>Slide {slide.posicion}</div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <input ref={el => { fileRefs.current[slide.id] = el; }} type="file" accept="image/*" onChange={e => handleFile(slide.id, e)} className="hidden" />
                  <button type="button" onClick={() => fileRefs.current[slide.id]?.click()}
                    className="h-10 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                    style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                    <Upload className="w-3.5 h-3.5" /> Subir
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(slide.id)} title="Eliminar"
                    className="w-10 h-10 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pl-0 sm:pl-[44px]">
                <label className="block">
                  <span className={labelCls}>Enlace</span>
                  <input type="url" value={slide.enlace ?? ""} onChange={e => updateField(slide.id, "enlace", e.target.value)}
                    className="mt-1 w-full h-11 rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none px-3 text-[14.5px] bg-white"
                    placeholder="https://..." />
                </label>
              </div>

              <div className="flex justify-end pl-0 sm:pl-[44px]">
                <BrandButton type="button" variant="navy" onClick={() => saveSlide(slide)} disabled={savingId === slide.id}>
                  <Send className="w-4 h-4" />
                  {savingId === slide.id ? "Guardando..." : "Guardar slide"}
                </BrandButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar slide"
        message="¿Estás seguro de eliminar este slide del popup? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
