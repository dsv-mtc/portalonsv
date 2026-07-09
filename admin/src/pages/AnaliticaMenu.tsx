import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type Menu = { id: number; descripcion: string; urlImagen: string; observacion: string; estaActivo: boolean };

export function AnaliticaMenu() {
  const [items, setItems] = useState<Menu[]>([]);
  const [newItem, setNewItem] = useState({ descripcion: "", urlImagen: "", observacion: "", estaActivo: true });
  const [msg, setMsg] = useState("");

  const load = () => apiGet<Menu[]>("/analitica-menu").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newItem.descripcion.trim()) return;
    const r = await apiPost("/analitica-menu", newItem);
    setMsg(r.message || "Creado");
    setNewItem({ descripcion: "", urlImagen: "", observacion: "", estaActivo: true });
    load();
  };

  const handleToggle = async (item: Menu) => {
    const r = await apiPut(`/analitica-menu/${item.id}`, { ...item, estaActivo: !item.estaActivo });
    setMsg(r.message || "Actualizado");
    load();
  };

  const handleDelete = async (id: number) => {
    const r = await apiDelete(`/analitica-menu/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  const activeCount = items.filter(i => i.estaActivo).length;

  return (
    <>
      <PageHeader title="Analítica — Menú" eyebrow="Navegación" description="Administra los menús de analítica de datos." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Crear nuevo menú">
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          {(["descripcion", "urlImagen", "observacion"] as const).map(f => (
            <label key={f} className="block">
              <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{f === "descripcion" ? "Nombre" : f === "urlImagen" ? "Imagen URL" : "Observación"}</span>
              <input value={newItem[f]} onChange={e => { const v = e.target.value; setNewItem(p => ({ ...p, [f]: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
            </label>
          ))}
          <BrandButton onClick={handleCreate}><Plus className="w-4 h-4" /> Crear</BrandButton>
        </div>
      </Panel>
      <div className="h-4" />
      <Panel title="Menús existentes" actions={<Chip color="cyan">{activeCount} activos</Chip>}>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border-2 p-3" style={{ borderColor: "var(--brand-line)" }}>
              <span className="flex-1 font-semibold text-[14px]" style={{ color: "var(--brand-navy)" }}>{item.descripcion}</span>
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
