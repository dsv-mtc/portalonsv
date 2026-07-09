import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut } from "../lib/api";

export function MisionVision() {
  const [form, setForm] = useState({ en: { descripcion: "", mision: "", vision: "" }, es: { descripcion: "", mision: "", vision: "" } });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiGet<{ en: { descripcion: string; mision: string; vision: string }; es: { descripcion: string; mision: string; vision: string } }>("/mision-vision").then(setForm).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await apiPut("/mision-vision", form);
    setMsg(r.message || "Guardado");
  };

  const Section = ({ lang, label }: { lang: "en" | "es"; label: string }) => (
    <Panel title={`${label} (${lang === "en" ? "Inglés" : "Español"})`}>
      <div className="space-y-4">
        {(["descripcion", "mision", "vision"] as const).map(f => (
          <label key={f} className="block">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{f === "descripcion" ? "¿Quiénes somos?" : f === "mision" ? "Misión" : "Visión"}</span>
            <textarea rows={4} value={form[lang][f]} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, [lang]: { ...p[lang], [f]: v } })); }} className="mt-1 w-full rounded-lg border-2 p-3 text-[14.5px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
        ))}
      </div>
    </Panel>
  );

  return (
    <>
      <PageHeader title="Misión — Visión" eyebrow="¿Quiénes somos?" description="Actualiza la sección de presentación del portal en ambos idiomas." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Section lang="es" label="Español" />
        <Section lang="en" label="Inglés" />
        <div className="flex justify-end"><BrandButton type="submit"><Send className="w-4 h-4" /> Guardar</BrandButton></div>
      </form>
    </>
  );
}
