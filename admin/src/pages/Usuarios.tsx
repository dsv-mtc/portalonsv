import { useState, useEffect } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPost, apiDelete } from "../lib/api";

type Usuario = { id: number; user: string; role: string; idUserRole: number };
type Role = { id: number; value: string };

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [newItem, setNewItem] = useState({ user: "", password: "", roleId: 0 });
  const [msg, setMsg] = useState("");

  const load = () => apiGet<{ usuarios: Usuario[]; roles: Role[] }>("/usuarios").then(d => { setUsuarios(d.usuarios); setRoles(d.roles); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newItem.user.trim() || !newItem.password || !newItem.roleId) return;
    const r = await apiPost("/usuarios", newItem);
    setMsg(r.message || "Creado");
    setNewItem({ user: "", password: "", roleId: 0 });
    load();
  };

  const handleDelete = async (id: number) => {
    const r = await apiDelete(`/usuarios/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  return (
    <>
      <PageHeader title="Usuarios" eyebrow="Gestión de usuarios" description="Administra los usuarios del panel administrativo." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Nuevo usuario">
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Email</span>
            <input type="email" value={newItem.user} onChange={e => { const v = e.target.value; setNewItem(p => ({ ...p, user: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Contraseña</span>
            <input type="password" value={newItem.password} onChange={e => { const v = e.target.value; setNewItem(p => ({ ...p, password: v })); }} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Rol</span>
            <select value={newItem.roleId} onChange={e => setNewItem(p => ({ ...p, roleId: Number(e.target.value) }))} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none bg-white" style={{ borderColor: "var(--brand-line)" }}>
              <option value={0}>Seleccionar...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.value}</option>)}
            </select>
          </label>
          <BrandButton onClick={handleCreate}><Plus className="w-4 h-4" /> Crear</BrandButton>
        </div>
      </Panel>
      <div className="h-4" />
      <Panel title="Usuarios existentes" actions={<Chip color="cyan">{usuarios.length} total</Chip>}>
        <div className="space-y-3">
          {usuarios.map(u => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg border-2 p-3" style={{ borderColor: "var(--brand-line)" }}>
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-[color:var(--brand-navy)] text-white"><User className="w-4 h-4" /></div>
              <div className="flex-1">
                <span className="font-semibold text-[14px]" style={{ color: "var(--brand-navy)" }}>{u.user}</span>
                <span className="ml-2 text-[11px] uppercase tracking-[0.06em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--muted-foreground)" }}>{u.role}</span>
              </div>
              <button onClick={() => handleDelete(u.id)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
