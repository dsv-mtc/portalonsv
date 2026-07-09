import { useState, useEffect } from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { apiGet, apiPost, apiDelete } from "../lib/api";

type Permiso = { id: number; value: string; alias?: string };
type Role = { id: number; value: string; permissions: Permiso[]; permissionValuesString: string };

export function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [, setPermisos] = useState<Record<string, Record<string, string>>[]>([]);
  const [newValue, setNewValue] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => apiGet<{ roles: Role[]; permisos: Record<string, Record<string, string>>[] }>("/roles").then(d => { setRoles(d.roles); setPermisos(d.permisos); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newValue.trim()) return;
    const r = await apiPost("/roles", { value: newValue, permissionIds: [] });
    setMsg(r.message || "Creado");
    setNewValue("");
    load();
  };

  const handleDelete = async (id: number) => {
    const r = await apiDelete(`/roles/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  return (
    <>
      <PageHeader title="Roles" eyebrow="Gestión de roles" description="Administra los roles y permisos del sistema." />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Nuevo rol">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Nombre del rol</span>
            <input value={newValue} onChange={e => setNewValue(e.target.value)} className="mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none" style={{ borderColor: "var(--brand-line)" }} />
          </label>
          <BrandButton onClick={handleCreate}><Plus className="w-4 h-4" /> Crear</BrandButton>
        </div>
      </Panel>
      <div className="h-4" />
      <Panel title="Roles existentes" actions={<Chip color="cyan">{roles.length} total</Chip>}>
        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.id} className="rounded-xl border-2 p-4" style={{ borderColor: "var(--brand-line)" }}>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5" style={{ color: "var(--brand-red)" }} />
                <h4 className="text-[16px] uppercase font-bold font-[family-name:var(--font-display)]" style={{ color: "var(--brand-navy)" }}>{role.value}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map(p => (
                  <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-[0.04em] font-[family-name:var(--font-cond)] bg-[color-mix(in_srgb,var(--brand-cyan)_14%,#fff)]" style={{ color: "var(--brand-cyan)" }}>{p.alias || p.value}</span>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={() => handleDelete(role.id)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
