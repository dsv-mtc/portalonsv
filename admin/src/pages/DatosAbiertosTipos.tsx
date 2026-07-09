import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type Tipo = { id: number; value: string; estaActivo: boolean };

export function DatosAbiertosTipos() {
  const [items, setItems] = useState<Tipo[]>([]);
  const [newValue, setNewValue] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => apiGet<Tipo[]>("/datos-abiertos-tipos").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newValue.trim()) return;
    const r = await apiPost("/datos-abiertos-tipos", { value: newValue, estaActivo: true });
    setMsg(r.message || "Creado");
    setNewValue("");
    load();
  };

  const handleToggle = async (item: Tipo) => {
    const r = await apiPut(`/datos-abiertos-tipos/${item.id}`, { ...item, estaActivo: !item.estaActivo });
    setMsg(r.message || "Actualizado");
    load();
  };

  const handleDelete = async (id: number) => {
    const r = await apiDelete(`/datos-abiertos-tipos/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  return (
    <>
      <PageHeader title="Tipos — Datos Abiertos" eyebrow="Clasificación" description="Administra los tipos de archivo de los datasets." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Nuevo tipo">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Nombre</span>
            <input value={newValue} onChange={e => setNewValue(e.target.value)} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <BrandButton onClick={handleCreate}><Plus className="w-4 h-4" /> Crear</BrandButton>
        </div>
      </Panel>
      <div className="h-4" />
      <Panel title="Tipos existentes" actions={<Chip color="cyan">{items.length} total</Chip>}>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border-2 p-3" style={{ borderColor: "var(--brand-line)" }}>
              <Tag className="w-5 h-5 shrink-0" style={{ color: "var(--brand-amber)" }} />
              <span className="flex-1 font-semibold text-[14px]" style={{ color: "var(--brand-navy)" }}>{item.value}</span>
              <span className="text-[11px] uppercase font-bold font-[family-name:var(--font-cond)]" style={{ color: item.estaActivo ? "var(--brand-green)" : "var(--muted-foreground)" }}>{item.estaActivo ? "Activo" : "Inactivo"}</span>
              <button onClick={() => handleToggle(item)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[color:var(--brand-mist)] transition">{item.estaActivo ? <ToggleRight className="w-5 h-5" style={{ color: "var(--brand-green)" }} /> : <ToggleLeft className="w-5 h-5" />}</button>
              <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
