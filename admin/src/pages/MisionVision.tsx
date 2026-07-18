import { useState, useEffect } from "react";
import { Send, Languages } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut } from "../lib/api";

type Lang = "es" | "en";

interface FieldDef {
  key: string;
  label: string;
  max: number;
}

const FIELDS: Record<Lang, FieldDef[]> = {
  es: [
    { key: "descripcion", label: "Definición ONSV", max: 10000 },
    { key: "mision", label: "Misión", max: 2000 },
    { key: "vision", label: "Visión", max: 2000 },
    { key: "val_intro", label: "Valores — Descripción introductoria", max: 2000 },
    { key: "val1_titulo", label: "VALOR 1 — Título", max: 2000 },
    { key: "val1_desc", label: "VALOR 1 — Descripción", max: 2000 },
    { key: "val2_titulo", label: "VALOR 2 — Título", max: 2000 },
    { key: "val2_desc", label: "VALOR 2 — Descripción", max: 2000 },
    { key: "val3_titulo", label: "VALOR 3 — Título", max: 2000 },
    { key: "val3_desc", label: "VALOR 3 — Descripción", max: 2000 },
    { key: "val4_titulo", label: "VALOR 4 — Título", max: 2000 },
    { key: "val4_desc", label: "VALOR 4 — Descripción", max: 2000 },
    { key: "val5_titulo", label: "VALOR 5 — Título", max: 2000 },
    { key: "val5_desc", label: "VALOR 5 — Descripción", max: 2000 },
    { key: "val6_titulo", label: "VALOR 6 — Título", max: 2000 },
    { key: "val6_desc", label: "VALOR 6 — Descripción", max: 2000 },
    { key: "comp_titulo", label: "Componentes tecnológicos — Título", max: 2000 },
    { key: "comp1_titulo", label: "COMP 1 — Título", max: 2000 },
    { key: "comp1_desc", label: "COMP 1 — Descripción", max: 2000 },
    { key: "comp2_titulo", label: "COMP 2 — Título", max: 2000 },
    { key: "comp2_desc", label: "COMP 2 — Descripción", max: 2000 },
    { key: "comp3_titulo", label: "COMP 3 — Título", max: 2000 },
    { key: "comp3_desc", label: "COMP 3 — Descripción", max: 2000 },
    { key: "comp4_titulo", label: "COMP 4 — Título", max: 2000 },
    { key: "comp4_desc", label: "COMP 4 — Descripción", max: 2000 },
    { key: "comp5_titulo", label: "COMP 5 — Título", max: 2000 },
    { key: "comp5_desc", label: "COMP 5 — Descripción", max: 2000 },
    { key: "comp6_titulo", label: "COMP 6 — Título", max: 2000 },
    { key: "comp6_desc", label: "COMP 6 — Descripción", max: 2000 },
    { key: "comp7_titulo", label: "COMP 7 — Título", max: 2000 },
    { key: "comp7_desc", label: "COMP 7 — Descripción", max: 2000 },
    { key: "comp8_titulo", label: "COMP 8 — Título", max: 2000 },
    { key: "comp8_desc", label: "COMP 8 — Descripción", max: 2000 },
    { key: "comp9_titulo", label: "COMP 9 — Título", max: 2000 },
    { key: "comp9_desc", label: "COMP 9 — Descripción", max: 2000 },
  ],
  en: [
    { key: "descripcion", label: "ONSV Definition", max: 10000 },
    { key: "mision", label: "Mission", max: 10000 },
    { key: "vision", label: "Vision", max: 10000 },
    { key: "val_intro", label: "Values — Introductory description", max: 2000 },
    { key: "val1_titulo", label: "VALUE 1 — Title", max: 2000 },
    { key: "val1_desc", label: "VALUE 1 — Description", max: 2000 },
    { key: "val2_titulo", label: "VALUE 2 — Title", max: 2000 },
    { key: "val2_desc", label: "VALUE 2 — Description", max: 2000 },
    { key: "val3_titulo", label: "VALUE 3 — Title", max: 2000 },
    { key: "val3_desc", label: "VALUE 3 — Description", max: 2000 },
    { key: "val4_titulo", label: "VALUE 4 — Title", max: 2000 },
    { key: "val4_desc", label: "VALUE 4 — Description", max: 2000 },
    { key: "val5_titulo", label: "VALUE 5 — Title", max: 2000 },
    { key: "val5_desc", label: "VALUE 5 — Description", max: 2000 },
    { key: "val6_titulo", label: "VALUE 6 — Title", max: 2000 },
    { key: "val6_desc", label: "VALUE 6 — Description", max: 2000 },
    { key: "comp_titulo", label: "Technological components — Title", max: 2000 },
    { key: "comp1_titulo", label: "COMP 1 — Title", max: 2000 },
    { key: "comp1_desc", label: "COMP 1 — Description", max: 2000 },
    { key: "comp2_titulo", label: "COMP 2 — Title", max: 2000 },
    { key: "comp2_desc", label: "COMP 2 — Description", max: 2000 },
    { key: "comp3_titulo", label: "COMP 3 — Title", max: 2000 },
    { key: "comp3_desc", label: "COMP 3 — Description", max: 2000 },
    { key: "comp4_titulo", label: "COMP 4 — Title", max: 2000 },
    { key: "comp4_desc", label: "COMP 4 — Description", max: 2000 },
    { key: "comp5_titulo", label: "COMP 5 — Title", max: 2000 },
    { key: "comp5_desc", label: "COMP 5 — Description", max: 2000 },
    { key: "comp6_titulo", label: "COMP 6 — Title", max: 2000 },
    { key: "comp6_desc", label: "COMP 6 — Description", max: 2000 },
    { key: "comp7_titulo", label: "COMP 7 — Title", max: 2000 },
    { key: "comp7_desc", label: "COMP 7 — Description", max: 2000 },
    { key: "comp8_titulo", label: "COMP 8 — Title", max: 2000 },
    { key: "comp8_desc", label: "COMP 8 — Description", max: 2000 },
    { key: "comp9_titulo", label: "COMP 9 — Title", max: 2000 },
    { key: "comp9_desc", label: "COMP 9 — Description", max: 2000 },
  ],
};

type FormData = Record<string, string>;

const initForm = (): Record<Lang, FormData> => ({
  es: {
    descripcion: "", mision: "", vision: "",
    comp_titulo: "",
    comp1_titulo: "", comp1_desc: "",
    comp2_titulo: "", comp2_desc: "",
    comp3_titulo: "", comp3_desc: "",
    comp4_titulo: "", comp4_desc: "",
    comp5_titulo: "", comp5_desc: "",
    comp6_titulo: "", comp6_desc: "",
    comp7_titulo: "", comp7_desc: "",
    comp8_titulo: "", comp8_desc: "",
    comp9_titulo: "", comp9_desc: "",
    val_intro: "",
    val1_titulo: "", val1_desc: "",
    val2_titulo: "", val2_desc: "",
    val3_titulo: "", val3_desc: "",
    val4_titulo: "", val4_desc: "",
    val5_titulo: "", val5_desc: "",
    val6_titulo: "", val6_desc: "",
  },
  en: {
    descripcion: "", mision: "", vision: "",
    comp_titulo: "",
    comp1_titulo: "", comp1_desc: "",
    comp2_titulo: "", comp2_desc: "",
    comp3_titulo: "", comp3_desc: "",
    comp4_titulo: "", comp4_desc: "",
    comp5_titulo: "", comp5_desc: "",
    comp6_titulo: "", comp6_desc: "",
    comp7_titulo: "", comp7_desc: "",
    comp8_titulo: "", comp8_desc: "",
    comp9_titulo: "", comp9_desc: "",
    val_intro: "",
    val1_titulo: "", val1_desc: "",
    val2_titulo: "", val2_desc: "",
    val3_titulo: "", val3_desc: "",
    val4_titulo: "", val4_desc: "",
    val5_titulo: "", val5_desc: "",
    val6_titulo: "", val6_desc: "",
  },
});

export function MisionVision() {
  const [form, setForm] = useState<Record<Lang, FormData>>(initForm());
  const [msg, setMsg] = useState("");
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    apiGet<Record<Lang, FormData>>("/mision-vision").then(setForm).catch(() => {});
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

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[14.5px] font-semibold">{msg}</div>}

      <form onSubmit={handleSubmit}>
        <Panel title={lang === "es" ? "Textos institucionales" : "Institutional texts"}>
          <div className="space-y-5">
            {fields.map((f, idx) => {
              const next = fields[idx + 1];
              const isPaired = /^[a-z]+[1-9]_titulo$/.test(f.key) && next && next.key === f.key.replace('_titulo', '_desc');

              if (/^[a-z]+[1-9]_desc$/.test(f.key)) return null;

              if (isPaired) {
                return (
                  <div key={f.key} className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold" style={{ fontFamily: "var(--font-cond)" }}>
                        {f.label} <span className="text-[color:var(--brand-red)]">*</span>
                      </span>
                      <textarea required maxLength={f.max} value={form[lang][f.key] ?? ""}
                        onChange={e => setForm(p => ({ ...p, [lang]: { ...p[lang], [f.key]: e.target.value } }))}
                        className="mt-1 w-full h-[50px] rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none p-1 text-[14.5px] leading-none resize-none overflow-y-auto" />
                    </label>
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold" style={{ fontFamily: "var(--font-cond)" }}>
                        {next!.label} <span className="text-[color:var(--brand-red)]">*</span>
                      </span>
                      <textarea required maxLength={next!.max} value={form[lang][next!.key] ?? ""}
                        onChange={e => setForm(p => ({ ...p, [lang]: { ...p[lang], [next!.key]: e.target.value } }))}
                        className="mt-1 w-full h-[50px] rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none p-1 text-[14.5px] leading-none resize-none overflow-y-auto" />
                    </label>
                  </div>
                );
              }

              return (
                <label key={f.key} className="block">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold" style={{ fontFamily: "var(--font-cond)" }}>
                    {f.label} <span className="text-[color:var(--brand-red)]">*</span>
                  </span>
                  <textarea required maxLength={f.max} value={form[lang][f.key] ?? ""}
                    onChange={e => setForm(p => ({ ...p, [lang]: { ...p[lang], [f.key]: e.target.value } }))}
                    className="mt-1 w-full min-h-[80px] rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none p-3 text-[14.5px] leading-relaxed resize-y" />
                </label>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <BrandButton type="submit"><Send className="w-4 h-4" /> Enviar Información</BrandButton>
          </div>
        </Panel>
      </form>
    </>
  );
}