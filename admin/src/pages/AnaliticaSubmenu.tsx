import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type Submenu = { id: number; submenu: string; menu_id: number; menu: string; rutabi: string; linkvideo: string; linkpdf: string; imagen: string; observacion: string; estado: boolean };
type Menu = { id: number; descripcion: string };

export function AnaliticaSubmenu() {
  const [submenus, setSubmenus] = useState<Submenu[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newItem, setNewItem] = useState({ descripcion: "", menu_id: 0, rutabi: "", linkvideo: "", linkpdf: "", imagenpath: "", estado: true });
  const [msg, setMsg] = useState("");

  const load = () => apiGet<{ submenu: Submenu[]; menu: Menu[] }>("/analitica-submenu").then(d => { setSubmenus(d.submenu); setMenus(d.menu); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newItem.descripcion.trim() || !newItem.menu_id) return;
    const r = await apiPost("/analitica-submenu", newItem);
    setMsg(r.message || "Creado");
    setNewItem({ descripcion: "", menu_id: 0, rutabi: "", linkvideo: "", linkpdf: "", imagenpath: "", estado: true });
    load();
  };

  const handleToggle = async (item: Submenu) => {
    const r = await apiPut(`/analitica-submenu/${item.id}`, { descripcion: item.submenu, menu_id: item.menu_id, rutabi: item.rutabi, linkvideo: item.linkvideo, linkpdf: item.linkpdf, imagenpath: item.imagen, estado: !item.estado });
    setMsg(r.message || "Actualizado");
    load();
  };

  const handleDelete = async (id: number) => {
    const r = await apiDelete(`/analitica-submenu/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  const activeCount = submenus.filter(s => s.estado).length;

  return (
    <>
      <PageHeader title="Analítica — Submenú" eyebrow="Subnavegación" description="Administra los submenús de analítica." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Crear nuevo submenú">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Nombre</span>
            <input value={newItem.descripcion} onChange={e => { const v = e.target.value; setNewItem(p => ({ ...p, descripcion: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Menú padre</span>
            <select value={newItem.menu_id} onChange={e => { const v = Number(e.target.value); setNewItem(p => ({ ...p, menu_id: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none bg-white" style={{ borderColor: "var(--brand-line)" }}>
              <option value={0}>Seleccionar...</option>
              {menus.map(m => <option key={m.id} value={m.id}>{m.descripcion}</option>)}
            </select>
          </label>
          <BrandButton onClick={handleCreate}><Plus className="w-4 h-4" /> Crear</BrandButton>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {(["rutabi", "linkvideo", "linkpdf"] as const).map(f => (
            <label key={f} className="block">
              <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{f === "rutabi" ? "URL BI" : f === "linkvideo" ? "Video URL" : "PDF URL"}</span>
              <input value={newItem[f]} onChange={e => setNewItem(p => ({ ...p, [f]: e.target.value }))} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
            </label>
          ))}
        </div>
      </Panel>
      <div className="h-4" />
      <Panel title="Submenús existentes" actions={<Chip color="cyan">{activeCount} activos</Chip>}>
        <div className="space-y-3">
          {submenus.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border-2 p-3" style={{ borderColor: "var(--brand-line)" }}>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[14px]" style={{ color: "var(--brand-navy)" }}>{item.submenu}</span>
                <span className="ml-2 text-[11px] uppercase tracking-[0.06em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--muted-foreground)" }}>{item.menu}</span>
              </div>
              <span className="text-[11px] uppercase font-bold font-[family-name:var(--font-cond)]" style={{ color: item.estado ? "var(--brand-green)" : "var(--muted-foreground)" }}>{item.estado ? "Activo" : "Inactivo"}</span>
              <button onClick={() => handleToggle(item)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[color:var(--brand-mist)] transition">{item.estado ? <ToggleRight className="w-5 h-5" style={{ color: "var(--brand-green)" }} /> : <ToggleLeft className="w-5 h-5" />}</button>
              <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
