import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Link2, Upload } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut, apiUpload } from "../lib/api";

export function Popup() {
  const [form, setForm] = useState({ imagen: "", estado: false, enlace: "" });
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<{ imagen: string; estado: boolean; enlace: string }>("/popup").then(setForm).catch(() => {});
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r: any = await apiUpload("/popup/upload", fd);
    if (r.success && r.url) {
      setForm(p => ({ ...p, imagen: r.url }));
    } else {
      setMsg(r.message || "Error al subir imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await apiPut("/popup", form);
    setMsg(r.message || "Guardado");
  };

  return (
    <>
      <PageHeader title="Popup" eyebrow="Ventana emergente" description="Configura el popup que aparece al ingresar al portal público." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <form onSubmit={handleSubmit}>
        <Panel title="Configuración del Popup">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Enlace</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border-2 h-11 px-3 bg-white" style={{ borderColor: "var(--brand-line)" }}>
                <Link2 className="w-4 h-4" style={{ color: "var(--brand-red)" }} />
                <input value={form.enlace} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, enlace: v })); }} className="flex-1 bg-transparent outline-none text-[14.5px]" />
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Imagen</span>
              <div className="mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "var(--brand-red)" }} />
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                  style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                  <Upload className="w-3.5 h-3.5" /> Seleccionar
                </button>
                {form.imagen && (
                  <img src={encodeURI(form.imagen)} className="w-11 h-11 rounded object-contain border" alt="" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }} />
                )}
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.estado} onChange={e => { const v = e.target.checked; setForm(p => ({ ...p, estado: v })); }} className="w-5 h-5 rounded border-2 accent-[color:var(--brand-red)]" />
              <span className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>Popup activo</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end"><BrandButton type="submit"><Send className="w-4 h-4" /> Guardar</BrandButton></div>
        </Panel>
      </form>
    </>
  );
}
