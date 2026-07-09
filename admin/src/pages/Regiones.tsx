import { useState, useEffect } from "react";
import { Send, Map } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut } from "../lib/api";

type Region = { id: number; value: string; slug: string; nombreEncargado: string; celularEncargado: string; correoEncargado: string; imageUrl: string; pageLink: string };

export function Regiones() {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [editing, setEditing] = useState<Record<number, Partial<Region>>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiGet<{ regiones: Region[] }>("/regiones").then(d => setRegiones(d.regiones)).catch(() => {});
  }, []);

  const handleSave = async (id: number) => {
    const data = editing[id];
    if (!data) return;
    const r = await apiPut(`/regiones/${id}`, data);
    setMsg(r.message || "Guardado");
    setRegiones(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  return (
    <>
      <PageHeader title="Regiones" eyebrow="Gestión territorial" description="Administra los encargados de cada región." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title={`Regiones (${regiones.length})`}>
        <div className="space-y-4">
          {regiones.map(r => {
            const edit = editing[r.id] || {};
            return (
              <div key={r.id} className="rounded-xl border-2 p-4" style={{ borderColor: "var(--brand-line)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <Map className="w-5 h-5" style={{ color: "var(--brand-red)" }} />
                  <h4 className="text-[16px] uppercase font-bold font-[family-name:var(--font-display)]" style={{ color: "var(--brand-navy)" }}>{r.value}</h4>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(["nombreEncargado", "celularEncargado", "correoEncargado", "pageLink"] as const).map(f => (
                    <label key={f} className="block">
                      <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{f === "nombreEncargado" ? "Encargado" : f === "celularEncargado" ? "Celular" : f === "correoEncargado" ? "Correo" : "Enlace"}</span>
                      <input value={edit[f] ?? r[f] ?? ""} onChange={e => { const v = e.target.value; setEditing(p => ({ ...p, [r.id]: { ...p[r.id], [f]: v } })); }}
                        className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13.5px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <BrandButton type="button" variant="navy" onClick={() => handleSave(r.id)} disabled={!editing[r.id]}><Send className="w-4 h-4" /> Guardar</BrandButton>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
