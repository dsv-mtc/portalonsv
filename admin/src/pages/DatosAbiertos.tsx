import { useState, useEffect } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPost, apiDelete } from "../lib/api";

type Dato = { id: number; titulo: string; autor: string; descripcion: string; idCategoria: number; categoria: string; idTipo: number; tipo: string; fecha: string };
type Categoria = { id: number; value: string };
type Tipo = { id: number; value: string };

export function DatosAbiertos() {
  const [datos, setDatos] = useState<Dato[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [newItem, setNewItem] = useState({ titulo: "", autor: "", descripcion: "", idCategoria: 0, idTipo: 0, fecha: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet<{ datos: Dato[]; categorias: Categoria[]; tipos: Tipo[] }>("/datos-abiertos").then(d => { setDatos(d.datos || []); setCategorias(d.categorias || []); setTipos(d.tipos || []); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newItem.titulo.trim() || !newItem.idCategoria || !newItem.idTipo) return;
    const r = await apiPost("/datos-abiertos", newItem);
    setMsg(r.message || "Creado");
    setNewItem({ titulo: "", autor: "", descripcion: "", idCategoria: 0, idTipo: 0, fecha: "" });
    load();
  };

  const handleDelete = async (id: number) => {
    const r = await apiDelete(`/datos-abiertos/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  return (
    <>
      <PageHeader title="Datos Abiertos" eyebrow="Publicación de datos" description="Administra los datasets publicados." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Nuevo dataset">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          {(["titulo", "autor", "descripcion"] as const).map(f => (
            <label key={f} className="block">
              <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>{f === "titulo" ? "Título" : f === "autor" ? "Autor" : "Descripción"}</span>
              <input value={newItem[f]} onChange={e => { const v = e.target.value; setNewItem(p => ({ ...p, [f]: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
            </label>
          ))}
          <BrandButton onClick={handleCreate}><Plus className="w-4 h-4" /> Publicar</BrandButton>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Categoría</span>
            <select value={newItem.idCategoria} onChange={e => { const v = Number(e.target.value); setNewItem(p => ({ ...p, idCategoria: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none bg-white" style={{ borderColor: "var(--brand-line)" }}>
              <option value={0}>Seleccionar...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.value}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Tipo</span>
            <select value={newItem.idTipo} onChange={e => setNewItem(p => ({ ...p, idTipo: Number(e.target.value) }))} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none bg-white" style={{ borderColor: "var(--brand-line)" }}>
              <option value={0}>Seleccionar...</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.value}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Fecha</span>
            <input type="date" value={newItem.fecha} onChange={e => setNewItem(p => ({ ...p, fecha: e.target.value }))} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
        </div>
      </Panel>
      <div className="h-4" />
      <Panel title="Datasets publicados" actions={<Chip color="cyan">{datos.length} total</Chip>}>
        <div className="space-y-3">
          {datos.map(d => (
            <div key={d.id} className="flex items-center gap-3 rounded-lg border-2 p-3" style={{ borderColor: "var(--brand-line)" }}>
              <FileText className="w-5 h-5 shrink-0" style={{ color: "var(--brand-cyan)" }} />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[14px]" style={{ color: "var(--brand-navy)" }}>{d.titulo}</span>
                <span className="ml-2 text-[11px] uppercase tracking-[0.06em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--muted-foreground)" }}>{d.categoria} · {d.tipo}</span>
              </div>
              <span className="text-[11px] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--muted-foreground)" }}>{d.fecha}</span>
              <button onClick={() => handleDelete(d.id)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
