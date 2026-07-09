import { useState, useEffect } from "react";
import { Send, Languages } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut } from "../lib/api";

type Lang = "es" | "en";

interface FieldDef {
  key: "descripcion" | "mision" | "vision";
  label: string;
  max: number;
}

const FIELDS: Record<Lang, FieldDef[]> = {
  es: [
    { key: "descripcion", label: "Definición ONSV", max: 10000 },
    { key: "mision", label: "Misión", max: 2000 },
    { key: "vision", label: "Visión", max: 2000 },
  ],
  en: [
    { key: "descripcion", label: "ONSV Definition", max: 10000 },
    { key: "mision", label: "Mission", max: 10000 },
    { key: "vision", label: "Vision", max: 10000 },
  ],
};

export function MisionVision() {
  const [form, setForm] = useState({ en: { descripcion: "", mision: "", vision: "" }, es: { descripcion: "", mision: "", vision: "" } });
  const [msg, setMsg] = useState("");
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    apiGet<{ en: { descripcion: string; mision: string; vision: string }; es: { descripcion: string; mision: string; vision: string } }>("/mision-vision").then(setForm).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await apiPut("/mision-vision", form);
    setMsg(r.message || "Guardado");
  };

  const fields = FIELDS[lang];

  return (
    <>
      <PageHeader title="Misión — Visión" eyebrow="Identidad institucional (ES / EN)"
        description="Define los textos institucionales bilingües del Portal ONSV." />

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

      <form onSubmit={handleSubmit}>
        <Panel title={lang === "es" ? "Textos institucionales" : "Institutional texts"}>
          <div className="space-y-5">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold" style={{ fontFamily: "var(--font-cond)" }}>
                  {f.label} <span className="text-[color:var(--brand-red)]">*</span>
                </span>
                <textarea required maxLength={f.max} value={form[lang][f.key]}
                  onChange={e => { const v = e.target.value; setForm(p => ({ ...p, [lang]: { ...p[lang], [f.key]: v } })); }}
                  className="mt-1 w-full min-h-[140px] rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none p-3 text-[14.5px] leading-relaxed resize-y" />
                <span className="text-[10.5px] text-muted-foreground mt-1 inline-block">Máx. {f.max.toLocaleString()} caracteres</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <BrandButton type="submit"><Send className="w-4 h-4" /> Enviar Información</BrandButton>
          </div>
        </Panel>
      </form>
    </>
  );
}
