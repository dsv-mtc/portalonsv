import { useState, useEffect } from "react";
import { Send, Heart, AlertTriangle, Skull, MessageSquare } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut } from "../lib/api";

export function Cifras() {
  const [form, setForm] = useState({ lesionados: "", accidentados: "", fallecidos: "", mensaje1: "", mensaje2: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiGet<{ lesionados: string; accidentados: string; fallecidos: string; mensaje1: string; mensaje2: string }>("/cifras").then(d => {
      setForm({ lesionados: d.lesionados ?? "", accidentados: d.accidentados ?? "", fallecidos: d.fallecidos ?? "", mensaje1: d.mensaje1 ?? "", mensaje2: d.mensaje2 ?? "" });
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const r = await apiPut("/cifras", form);
    setMsg(r.message || "Guardado");
    setSaving(false);
  };

  if (loading) return <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>Cargando...</p>;

  const NUMS = [
    { name: "accidentados", label: "Siniestros", value: form.accidentados, color: "#1597B8", icon: AlertTriangle },
    { name: "lesionados", label: "Lesiones", value: form.lesionados, color: "#F4B41A", icon: Heart },
    { name: "fallecidos", label: "Muertes", value: form.fallecidos, color: "#C8102E", icon: Skull },
  ];

  return (
    <>
      <PageHeader title="Cifras" eyebrow="Indicadores de la portada" description="Actualiza las cifras y mensajes que se muestran en la página principal del Portal ONSV." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Panel title="Cifras numéricas">
          <div className="grid sm:grid-cols-3 gap-4">
            {NUMS.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-xl border-2 p-4" style={{ borderColor: "var(--brand-line)", borderLeft: `5px solid ${f.color}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg grid place-items-center" style={{ background: `color-mix(in srgb, ${f.color} 12%, #fff)`, color: f.color }}><Icon className="w-4 h-4" /></div>
                    <label className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{f.label} <span style={{ color: "var(--brand-red)" }}>*</span></label>
                  </div>
                  <input name={f.name} type="number" min={0} step={1} required pattern="\d+" value={form[f.name as keyof typeof form]} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, [f.name]: v })); }}
                    className="w-full h-12 rounded-lg border-2 px-3 text-[24px] font-extrabold outline-none font-[family-name:var(--font-display)]" style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }} />
                  <span className="text-[10.5px] mt-1 inline-block" style={{ color: "var(--muted-foreground)" }}>Solo números enteros</span>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Mensajes del bloque de cifras">
          <div className="grid sm:grid-cols-2 gap-4">
            {[{ name: "mensaje1", label: "1° Mensaje" }, { name: "mensaje2", label: "2° Mensaje" }].map(m => (
              <label key={m.name} className="block">
                <span className="text-[11px] uppercase tracking-[0.08em] font-bold flex items-center gap-1.5 font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}><MessageSquare className="w-3.5 h-3.5" /> {m.label} <span style={{ color: "var(--brand-red)" }}>*</span></span>
                <input name={m.name} required maxLength={200} value={form[m.name as keyof typeof form]} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, [m.name]: v })); }}
                  className="mt-1 w-full h-11 rounded-lg border-2 px-3 text-[14.5px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
                <span className="text-[10.5px] mt-1 inline-block" style={{ color: "var(--muted-foreground)" }}>Máx. 200 caracteres</span>
              </label>
            ))}
          </div>
        </Panel>
        <div className="flex justify-end"><BrandButton type="submit" disabled={saving}><Send className="w-4 h-4" /> {saving ? "Guardando..." : "Enviar Información"}</BrandButton></div>
      </form>
    </>
  );
}
