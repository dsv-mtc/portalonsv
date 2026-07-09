import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPost, apiDelete } from "../lib/api";

type Evento = { id: number; title: string; idTipoEvento: number; tipoEvento?: string; organizedBy: string; place: string; startDay: string; isActive: boolean };
type TipoEvento = { id: number; value: string };

export function Comunicaciones() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [newItem, setNewItem] = useState({ title: "", idTipoEvento: 0, organizedBy: "", place: "", startDay: "", isActive: true });
  const [msg, setMsg] = useState("");

  const load = () => apiGet<{ eventos: Evento[]; tiposEvento: TipoEvento[] }>("/comunicaciones-eventos").then(d => { setEventos(d.eventos || []); setTipos(d.tiposEvento || []); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newItem.title.trim() || !newItem.idTipoEvento) return;
    const r = await apiPost("/comunicaciones-eventos", newItem);
    setMsg(r.message || "Creado");
    setNewItem({ title: "", idTipoEvento: 0, organizedBy: "", place: "", startDay: "", isActive: true });
    load();
  };

  const handleDelete = async (id: number) => {
    const r = await apiDelete(`/comunicaciones-eventos/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  const activeCount = eventos.filter(e => e.isActive).length;

  return (
    <>
      <PageHeader title="Comunicaciones — Eventos" eyebrow="Agenda" description="Programa y administra eventos del portal." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Nuevo evento">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Título</span>
            <input value={newItem.title} onChange={e => { const v = e.target.value; setNewItem(p => ({ ...p, title: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Tipo</span>
            <select value={newItem.idTipoEvento} onChange={e => { const v = Number(e.target.value); setNewItem(p => ({ ...p, idTipoEvento: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none bg-white" style={{ borderColor: "var(--brand-line)" }}>
              <option value={0}>Seleccionar...</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.value}</option>)}
            </select>
          </label>
          <BrandButton onClick={handleCreate}><Plus className="w-4 h-4" /> Crear</BrandButton>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Organizado por</span>
            <input value={newItem.organizedBy} onChange={e => setNewItem(p => ({ ...p, organizedBy: e.target.value }))} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Lugar</span>
            <input value={newItem.place} onChange={e => setNewItem(p => ({ ...p, place: e.target.value }))} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Fecha inicio</span>
            <input type="date" value={newItem.startDay} onChange={e => setNewItem(p => ({ ...p, startDay: e.target.value }))} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
        </div>
      </Panel>
      <div className="h-4" />
      <Panel title="Eventos programados" actions={<Chip color="cyan">{activeCount} activos</Chip>}>
        <div className="space-y-3">
          {eventos.map(ev => (
            <div key={ev.id} className="flex items-center gap-3 rounded-lg border-2 p-3" style={{ borderColor: "var(--brand-line)" }}>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[14px]" style={{ color: "var(--brand-navy)" }}>{ev.title}</span>
                <span className="ml-2 text-[11px] uppercase tracking-[0.06em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--muted-foreground)" }}>{ev.tipoEvento || `Tipo #${ev.idTipoEvento}`}</span>
              </div>
              <span className="text-[11px] font-bold font-[family-name:var(--font-cond)]" style={{ color: ev.isActive ? "var(--brand-green)" : "var(--muted-foreground)" }}>{ev.isActive ? "Activo" : "Inactivo"}</span>
              <button onClick={() => handleDelete(ev.id)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
