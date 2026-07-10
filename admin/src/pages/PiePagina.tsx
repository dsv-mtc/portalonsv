import { useState, useEffect } from "react";
import { Send, MapPin, Phone, Mail, AlignLeft, Clock, Plus, Trash2, Link2, Globe } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPut } from "../lib/api";

type Social = { id: number; red: string; url: string };

export function PiePagina() {
  const [footer, setFooter] = useState({ telefono: "", direccion: "", email: "", piePagina: "", horario: "" });
  const [socials, setSocials] = useState<Social[]>([]);
  const [nuevaRed, setNuevaRed] = useState("Facebook");
  const [nuevaUrl, setNuevaUrl] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiGet<{ telefono: string; direccion: string; email: string; piePagina: string; horario: string }>("/footer").then(setFooter).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await apiPut("/footer", footer);
    setMsg(r.message || "Guardado");
  };

  const iconOf = (r: string) => {
    const c = "w-4 h-4";
    if (r === "Facebook") return <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
    if (r === "Twitter") return <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
    if (r === "Instagram") return <svg className={c} viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
    if (r === "YouTube") return <svg className={c} viewBox="0 0 24 24" fill="currentColor"><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/><rect x="2" y="3" width="20" height="18" rx="3" ry="3"/></svg>;
    if (r === "LinkedIn") return <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
    return <Globe className={c} />;
  };

  const addSocial = () => {
    if (!nuevaUrl.trim()) return;
    setSocials(s => [...s, { id: Date.now(), red: nuevaRed, url: nuevaUrl.trim() }]);
    setNuevaUrl("");
  };

  const Field = ({ label, value, icon, field }: { label: string; value: string; icon: React.ReactNode; field: string }) => (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{label} <span style={{ color: "var(--brand-red)" }}>*</span></span>
      <div className="mt-1 flex items-center gap-2 rounded-lg border-2 h-11 px-3 bg-white" style={{ borderColor: "var(--brand-line)" }}>
        {icon}
        <input value={value} onChange={e => { const v = e.target.value; setFooter(p => ({ ...p, [field]: v })); }} maxLength={200} required className="flex-1 bg-transparent outline-none text-[14.5px]" />
      </div>
      <span className="text-[10.5px] mt-1 inline-block" style={{ color: "var(--muted-foreground)" }}>Máx. 200 caracteres</span>
    </label>
  );

  return (
    <>
      <PageHeader title="Pie de página" eyebrow="Configuracion del sitio" description="Actualiza la información que aparece en el pie de página del portal público." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <form onSubmit={handleSubmit}>
        <Panel title="Información del pie de página">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Número de teléfono" value={footer.telefono} icon={<Phone className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="telefono" />
            <Field label="Dirección" value={footer.direccion} icon={<MapPin className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="direccion" />
            <Field label="Correo" value={footer.email} icon={<Mail className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="email" />
            <Field label="Pie de página" value={footer.piePagina} icon={<AlignLeft className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="piePagina" />
            <Field label="Horario de atención" value={footer.horario} icon={<Clock className="w-4 h-4" style={{ color: "var(--brand-red)" }} />} field="horario" />
          </div>
          <div className="mt-6 flex justify-end"><BrandButton type="submit"><Send className="w-4 h-4" /> Enviar Información</BrandButton></div>
        </Panel>
      </form>
      <div className="h-6" />
      <Panel title="Redes sociales" actions={<Chip color="cyan">{socials.length} vinculadas</Chip>}>
        <p className="text-[13px] -mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>Estas redes se muestran en el pie de página del portal. Puedes agregar, editar o eliminar.</p>
        <div className="grid md:grid-cols-[180px_1fr_auto] gap-3 items-end mb-5 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--brand-line)", background: "color-mix(in srgb, var(--brand-mist) 40%, transparent)" }}>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Red</span>
            <select value={nuevaRed} onChange={e => setNuevaRed(e.target.value)} className="mt-1 w-full h-11 rounded-lg border-2 px-3 text-[14px] outline-none bg-white" style={{ borderColor: "var(--brand-line)" }}>
              {["Facebook", "Twitter", "Instagram", "YouTube", "LinkedIn", "TikTok", "Otro"].map(r => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>URL</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border-2 h-11 px-3 bg-white" style={{ borderColor: "var(--brand-line)" }}>
              <Link2 className="w-4 h-4" style={{ color: "var(--brand-red)" }} />
              <input type="url" placeholder="https://…" value={nuevaUrl} onChange={e => setNuevaUrl(e.target.value)} className="flex-1 bg-transparent outline-none text-[14.5px]" />
            </div>
          </label>
          <BrandButton type="button" onClick={addSocial}><Plus className="w-4 h-4" /> Agregar</BrandButton>
        </div>
        <ul className="space-y-2">
          {socials.map(s => (
            <li key={s.id} className="grid grid-cols-[auto_160px_1fr_auto] gap-3 items-center rounded-lg border bg-white px-3 py-2 transition" style={{ borderColor: "var(--brand-line)" }}>
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-[color:var(--brand-navy)] text-white">{iconOf(s.red)}</div>
              <select value={s.red} onChange={e => setSocials(arr => arr.map(x => x.id === s.id ? { ...x, red: e.target.value } : x))} className="h-10 rounded-md border bg-white px-2 text-[13.5px] font-bold outline-none font-[family-name:var(--font-cond)]" style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                {["Facebook", "Twitter", "Instagram", "YouTube", "LinkedIn", "TikTok", "Otro"].map(r => <option key={r}>{r}</option>)}
              </select>
              <input type="url" value={s.url} onChange={e => setSocials(arr => arr.map(x => x.id === s.id ? { ...x, url: e.target.value } : x))} className="h-10 rounded-md border bg-white px-3 text-[13.5px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
              <button type="button" onClick={() => setSocials(arr => arr.filter(x => x.id !== s.id))} className="w-10 h-10 rounded-md grid place-items-center hover:bg-[color:var(--brand-red)] hover:text-white border transition" style={{ color: "var(--brand-red)", borderColor: "var(--brand-line)" }} aria-label="Eliminar red social"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
          {socials.length === 0 && <li className="text-center py-8 text-[13px]" style={{ color: "var(--muted-foreground)" }}>Aún no hay redes sociales configuradas.</li>}
        </ul>
        <div className="mt-6 flex justify-end"><BrandButton type="button"><Send className="w-4 h-4" /> Guardar redes</BrandButton></div>
      </Panel>
    </>
  );
}
