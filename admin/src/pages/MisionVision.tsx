import { useState, useEffect } from "react";
import { Languages, Plus, Trash2, Save } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPut, apiPost, apiDelete } from "../lib/api";

type Lang = "es" | "en";

interface FieldDef {
  key: string;
  label: string;
  max: number;
}

const FIELDS_DEF: Record<Lang, FieldDef[]> = {
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

const FIELDS_VALORES: Record<Lang, FieldDef[]> = {
  es: [
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
  ],
  en: [
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
  ],
};

type FormData = Record<string, string>;

const initForm = (): Record<Lang, FormData> => ({
  es: {
    descripcion: "", mision: "", vision: "",
    comp_titulo: "",
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
    val_intro: "",
    val1_titulo: "", val1_desc: "",
    val2_titulo: "", val2_desc: "",
    val3_titulo: "", val3_desc: "",
    val4_titulo: "", val4_desc: "",
    val5_titulo: "", val5_desc: "",
    val6_titulo: "", val6_desc: "",
  },
});

interface Componente {
  id: number;
  idioma: string;
  orden: number;
  titulo: string;
  descripcion: string;
  link: string;
  icon: string | null;
  external: number;
}

const CARD_CLS = "rounded-xl border-2 border-[color:var(--brand-line)] bg-white p-5";
const CARD_SHADOW = "var(--shadow-brand)";

const CARD_TITLE_CLS = "text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold";
const CARD_TITLE_STYLE = { fontFamily: "var(--font-cond)" } as const;

function FieldTextArea({
  label, required, max, value, onChange, big,
}: {
  label: string; required?: boolean; max: number; value: string;
  onChange: (v: string) => void; big?: boolean;
}) {
  return (
    <label className="block">
      <span className={CARD_TITLE_CLS} style={CARD_TITLE_STYLE}>
        {label} {required && <span className="text-[color:var(--brand-red)]">*</span>}
      </span>
      <textarea required={required} maxLength={max} value={value ?? ""} onChange={e => onChange(e.target.value)}
        style={{ height: big ? 90 : 50 }}
        className="mt-1 w-full rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none p-1 text-[14.5px] leading-none resize-none overflow-y-auto" />
    </label>
  );
}

function Card({
  title, onSave, saving, children,
}: {
  title: string; onSave?: () => void; saving?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={CARD_CLS} style={{ boxShadow: CARD_SHADOW }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-extrabold uppercase tracking-[0.04em] text-[color:var(--brand-navy)]" style={{ fontFamily: "var(--font-cond)" }}>
          {title}
        </h2>
        {onSave && (
          <BrandButton type="button" onClick={onSave} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
          </BrandButton>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function MisionVision() {
  const [form, setForm] = useState<Record<Lang, FormData>>(initForm());
  const [msg, setMsg] = useState("");
  const [lang, setLang] = useState<Lang>("es");

  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [compMsg, setCompMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingMv, setSavingMv] = useState(false);

  useEffect(() => {
    apiGet<Record<Lang, FormData>>("/mision-vision").then(setForm).catch(() => {});
  }, []);

  const loadComponentes = async (l: Lang) => {
    try {
      const data = await apiGet<Componente[]>(`/componentes?idioma=${l}`);
      setComponentes(data || []);
    } catch {
      setComponentes([]);
    }
  };

  useEffect(() => {
    loadComponentes(lang);
  }, [lang]);

  const handleSaveMv = async () => {
    setSavingMv(true);
    const r = await apiPut("/mision-vision", form);
    setSavingMv(false);
    setMsg(r.message || "Guardado");
  };

  const handleAddComponente = async () => {
    const r = await apiPost<Componente>("/componentes", { idioma: lang, titulo: "", descripcion: "", link: "" });
    if (r.success) {
      setCompMsg(r.message || "Componente creado");
      loadComponentes(lang);
    } else {
      setCompMsg(r.message || "No se pudo crear el componente");
    }
  };

  const handleSaveComponente = async (id: number, titulo: string, descripcion: string, link: string) => {
    setSavingId(id);
    const r = await apiPut(`/componentes/${id}`, { titulo, descripcion, link });
    setSavingId(null);
    setCompMsg(r.message || "Guardado");
  };

  const handleDeleteComponente = async () => {
    if (confirmDelete === null) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    const r = await apiDelete(`/componentes/${id}`);
    setCompMsg(r.message || "Eliminado");
    loadComponentes(lang);
  };

  const setField = (key: string, value: string) =>
    setForm(p => ({ ...p, [lang]: { ...p[lang], [key]: value } }));

  const definicion = FIELDS_DEF[lang];
  const valores = FIELDS_VALORES[lang];
  const valoresCards = [1, 2, 3, 4, 5, 6];

  return (
    <>
      <PageHeader title="Quienes Somos" eyebrow="Identidad institucional (ES / EN)"
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

      <div className="space-y-6">
        {/* Bloque A — Definición · Misión · Visión */}
        <Card title={lang === "es" ? "Definición ONSV · Misión · Visión" : "ONSV Definition · Mission · Vision"}
          onSave={handleSaveMv} saving={savingMv}>
          {definicion.map(f => (
            <FieldTextArea key={f.key} label={f.label} required max={f.max}
              big={f.key === "descripcion"}
              value={form[lang][f.key] ?? ""} onChange={v => setField(f.key, v)} />
          ))}
        </Card>

        {/* Bloque B — Valores */}
        <Card title={lang === "es" ? "Valores" : "Values"}
          onSave={handleSaveMv} saving={savingMv}>
          {valores.filter(f => f.key === "val_intro").map(f => (
            <FieldTextArea key={f.key} label={f.label} required max={f.max}
              value={form[lang][f.key] ?? ""} onChange={v => setField(f.key, v)} />
          ))}
          <div className="grid sm:grid-cols-2 gap-4">
            {valoresCards.map(n => {
              const t = valores.find(f => f.key === `val${n}_titulo`);
              const d = valores.find(f => f.key === `val${n}_desc`);
              if (!t || !d) return null;
              return (
                <div key={n} className="rounded-lg border border-[color:var(--brand-line)] bg-white p-4">
                  <div className="text-[12px] uppercase tracking-[0.08em] font-bold text-[color:var(--brand-navy)] mb-2" style={CARD_TITLE_STYLE}>
                    {lang === "es" ? `VALOR ${n}` : `VALUE ${n}`}
                  </div>
                  <div className="space-y-3">
                    <FieldTextArea label={t.label} required max={t.max}
                      value={form[lang][t.key] ?? ""} onChange={v => setField(t.key, v)} />
                    <FieldTextArea label={d.label} required max={d.max}
                      value={form[lang][d.key] ?? ""} onChange={v => setField(d.key, v)} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Bloque C — Componentes tecnológicos */}
        <div className={CARD_CLS} style={{ boxShadow: CARD_SHADOW }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-extrabold uppercase tracking-[0.04em] text-[color:var(--brand-navy)]" style={{ fontFamily: "var(--font-cond)" }}>
              {lang === "es" ? "Componentes tecnológicos" : "Technological components"}
            </h2>
            <BrandButton onClick={handleAddComponente} type="button">
              <Plus className="w-4 h-4" /> {lang === "es" ? "Agregar componente" : "Add component"}
            </BrandButton>
          </div>

          {/* comp_titulo dentro del card, arriba de Componente #1 */}
          <div className="mb-4">
            <FieldTextArea label={lang === "es" ? "Componentes tecnológicos — Título" : "Technological components — Title"}
              required max={2000} value={form[lang].comp_titulo ?? ""} onChange={v => setField("comp_titulo", v)} />
            <div className="mt-3 flex justify-end">
              <BrandButton type="button" onClick={handleSaveMv} disabled={savingMv}>
                <Save className="w-4 h-4" /> {savingMv ? "Guardando..." : "Guardar"}
              </BrandButton>
            </div>
          </div>

          {compMsg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[14.5px] font-semibold">{compMsg}</div>}

          <div className="space-y-4">
            {componentes.length === 0 && (
              <div className="p-4 rounded-lg bg-[#f1f5f9] text-[#5c6273] text-[14px]">
                {lang === "es" ? "No hay componentes. Clic en \"Agregar componente\" para crear uno." : "No components. Click \"Add component\" to create one."}
              </div>
            )}
            {componentes.map((c, i) => (
              <div key={c.id} className="rounded-xl border-2 border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: CARD_SHADOW }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[12px] uppercase tracking-[0.08em] font-bold text-[color:var(--brand-navy)]" style={CARD_TITLE_STYLE}>
                    {lang === "es" ? "Componente" : "Component"} #{i + 1}
                  </div>
                  <button type="button" onClick={() => setConfirmDelete(c.id)} title={lang === "es" ? "Eliminar" : "Delete"}
                    className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#fdecec] transition"
                    style={{ color: "var(--brand-red)" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <FieldTextArea label={lang === "es" ? "Título" : "Title"} required max={2000}
                    value={c.titulo ?? ""}
                    onChange={v => setComponentes(prev => prev.map(x => x.id === c.id ? { ...x, titulo: v } : x))} />

                  <FieldTextArea label={lang === "es" ? "Descripción" : "Description"} required max={2000}
                    value={c.descripcion ?? ""}
                    onChange={v => setComponentes(prev => prev.map(x => x.id === c.id ? { ...x, descripcion: v } : x))} />

                  <label className="block">
                    <span className={CARD_TITLE_CLS} style={CARD_TITLE_STYLE}>
                      {lang === "es" ? "Enlace / Ruta" : "Link / Path"}
                    </span>
                    <input type="text" placeholder="https://..." maxLength={500} value={c.link ?? ""}
                      onChange={e => setComponentes(prev => prev.map(x => x.id === c.id ? { ...x, link: e.target.value } : x))}
                      className="mt-1 w-full h-[50px] rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none px-3 text-[14.5px]" />
                  </label>

                  <div className="flex justify-end">
                    <BrandButton type="button" onClick={() => handleSaveComponente(c.id, c.titulo, c.descripcion, c.link)} disabled={savingId === c.id}>
                      <Save className="w-4 h-4" /> {lang === "es" ? "Guardar" : "Save"}
                    </BrandButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete !== null}
        title={lang === "es" ? "Eliminar componente" : "Delete component"}
        message={lang === "es"
          ? "¿Estás seguro de eliminar este componente? Esta acción no se puede deshacer."
          : "Are you sure you want to delete this component? This action cannot be undone."}
        onConfirm={handleDeleteComponente}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
