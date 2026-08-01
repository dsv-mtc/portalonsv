import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type Usuario = { id: number; user: string; role: string; idUserRole: number; esta_activo: boolean };
type Role = { id: number; value: string };

interface UserForm {
  user: string;
  password: string;
  roleId: number;
  esta_activo: boolean;
}

function initUserForm(): UserForm {
  return { user: "", password: "", roleId: 0, esta_activo: true };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

const pagBtnStyle = `
  .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
  .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
  .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
  .pag-btn.active:hover { background: #C8102E; color: #fff; border-color: transparent; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--brand-navy); font-family: "var(--font-cond)"; margin-bottom: 10px; }
`;

const PER_PAGE = 5;

function Pag({ page, total, setPage }: { page: number; total: number; setPage: (f: ((p: number) => number) | number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  if (totalPages <= 1) return null;

  const btn = (label: React.ReactNode, active: boolean, onClick: () => void, ariaLabel: string) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
      className={`pag-btn${active ? " active" : ""}`}>
      {label}
    </button>
  );

  return (
    <div className="mt-4 flex justify-center items-center gap-1">
      {btn(<ChevronsLeft className="w-3.5 h-3.5" />, false, () => setPage(1), "Primera página")}
      {btn(<ChevronLeft className="w-3.5 h-3.5" />, false, () => setPage(p => Math.max(1, p - 1)), "Página anterior")}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => btn(p, p === currentPage, () => setPage(p), `Página ${p}`))}
      {btn(<ChevronRight className="w-3.5 h-3.5" />, false, () => setPage(p => Math.min(totalPages, p + 1)), "Página siguiente")}
      {btn(<ChevronsRight className="w-3.5 h-3.5" />, false, () => setPage(totalPages), "Última página")}
    </div>
  );
}

const ADMIN_EMAIL = "onsv@mtc.gob.pe";

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userForm, setUserForm] = useState<UserForm>(initUserForm());
  const [msg, setMsg] = useState("");
  const [userEditingId, setUserEditingId] = useState<number | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "user" | "role"; id: number } | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [rolPage, setRolPage] = useState(1);
  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [rolFormValue, setRolFormValue] = useState("");
  const [rolEditingId, setRolEditingId] = useState<number | null>(null);

  const load = () => {
    setUserPage(1);
    setRolPage(1);
    apiGet<{ usuarios: Usuario[]; roles: Role[] }>("/usuarios").then(ud => {
      setUsuarios(ud.usuarios);
      setRoles(ud.roles);
    }).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const userPaginated = usuarios.slice((Math.min(userPage, Math.max(1, Math.ceil(usuarios.length / PER_PAGE))) - 1) * PER_PAGE, Math.min(userPage, Math.max(1, Math.ceil(usuarios.length / PER_PAGE))) * PER_PAGE);
  const rolPaginated = roles.slice((Math.min(rolPage, Math.max(1, Math.ceil(roles.length / PER_PAGE))) - 1) * PER_PAGE, Math.min(rolPage, Math.max(1, Math.ceil(roles.length / PER_PAGE))) * PER_PAGE);

  // --- Users ---
  const openUserCreate = () => { setUserForm(initUserForm()); setUserEditingId(null); setUserModalOpen(true); };
  const openUserEdit = (item: Usuario) => { setUserForm({ user: item.user, password: "", roleId: item.idUserRole, esta_activo: item.esta_activo ?? true }); setUserEditingId(item.id); setUserModalOpen(true); };

  const handleUserSubmit = async () => {
    if (!userForm.user.trim() || !userForm.roleId) { setMsg("Completa los campos obligatorios (*)"); return; }
    if (userEditingId === null && !userForm.password) { setMsg("La contraseña es obligatoria para nuevos usuarios"); return; }
    if (userEditingId !== null) {
      await apiPut(`/usuarios/${userEditingId}`, userForm);
      setMsg("Usuario actualizado");
    } else {
      await apiPost("/usuarios", userForm);
      setMsg("Usuario creado");
    }
    setUserModalOpen(false);
    setUserForm(initUserForm());
    setUserEditingId(null);
    load();
  };

  // --- Roles ---
  const openRolCreate = () => { setRolFormValue(""); setRolEditingId(null); setRolModalOpen(true); };
  const openRolEdit = (item: Role) => { setRolFormValue(item.value); setRolEditingId(item.id); setRolModalOpen(true); };

  const handleRolSubmit = async () => {
    if (!rolFormValue.trim()) { setMsg("Completa los campos obligatorios (*)"); return; }
    if (rolEditingId !== null) {
      await apiPut(`/roles/${rolEditingId}`, { value: rolFormValue, permissionIds: [] });
      setMsg("Rol actualizado");
    } else {
      await apiPost("/roles", { value: rolFormValue, permissionIds: [] });
      setMsg("Rol creado");
    }
    setRolModalOpen(false);
    setRolFormValue("");
    setRolEditingId(null);
    load();
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setConfirmDelete(null);
    if (type === "user") { await apiDelete(`/usuarios/${id}`); setMsg("Usuario eliminado"); }
    else { await apiDelete(`/roles/${id}`); setMsg("Rol eliminado"); }
    load();
  };

  const tableBox = { borderRadius: 16, border: "1px solid var(--brand-line)", background: "#fff", padding: "16px 20px", boxShadow: "var(--shadow-brand)" };
  const thStyle: React.CSSProperties = { textAlign: "left", padding: "8px 6px", fontWeight: 700, color: "var(--brand-navy)", fontSize: 10, textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" };
  const tdStyle: React.CSSProperties = { padding: "8px 6px" };
  const actionBtn = "w-7 h-7 rounded-lg grid place-items-center transition";

  return (
    <>
      <PageHeader title="Usuarios" eyebrow="Gestión de usuarios" actions={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Chip color="cyan">{usuarios.length} usuarios</Chip>
          <BrandButton onClick={openUserCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
        </div>
      } />

      <style>{pagBtnStyle}</style>
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div style={{ display: "flex", gap: 24, marginTop: 75, alignItems: "flex-start" }}>
        {/* LEFT: Usuarios */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={tableBox}>
            <div className="section-title" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Usuarios</span>
              <Chip color="cyan">{usuarios.length}</Chip>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
                    <th style={thStyle}>Email</th>
                    <th style={{ ...thStyle, width: 90 }}>Contraseña</th>
                    <th style={{ ...thStyle, width: 100 }}>Rol</th>
                    <th style={{ ...thStyle, width: 80 }}>Estado</th>
                    <th style={{ width: 56, padding: "8px 6px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {userPaginated.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "var(--brand-navy)" }}>{u.user}</td>
                      <td style={{ ...tdStyle, color: "#94a3b8", letterSpacing: "0.12em" }}>••••••••</td>
                      <td style={tdStyle}>
                        <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em", background: "#eff6ff", color: "#1e40af" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-block", padding: "1px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                          fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                          background: u.esta_activo ? "#dcfce7" : "#f1f5f9",
                          color: u.esta_activo ? "#166534" : "#475569",
                        }}>
                          {u.esta_activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 2, justifyContent: u.user === ADMIN_EMAIL ? "center" : undefined }}>
                          <button onClick={() => openUserEdit(u)} className={actionBtn} style={{ color: "#101a34" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e8ebf0"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Pencil className="w-3 h-3" />
                          </button>
                          {u.user !== ADMIN_EMAIL && (
                            <button onClick={() => setConfirmDelete({ type: "user", id: u.id })} className={actionBtn} style={{ color: "var(--brand-red)" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#fdecec"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pag page={userPage} total={usuarios.length} setPage={setUserPage} />
          </div>
        </div>

        {/* RIGHT: Roles */}
        <div style={{ flex: "0 0 340px" }}>
          <div style={tableBox}>
            <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Roles</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Chip color="cyan">{roles.length}</Chip>
                <button onClick={openRolCreate}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "var(--brand-red)", padding: 0, display: "flex", alignItems: "center" }}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
                    <th style={thStyle}>Rol</th>
                    <th style={{ width: 56, padding: "8px 6px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rolPaginated.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "var(--brand-navy)" }}>{r.value}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 2 }}>
                          <button onClick={() => openRolEdit(r)} className={actionBtn} style={{ color: "#101a34" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e8ebf0"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setConfirmDelete({ type: "role", id: r.id })} className={actionBtn} style={{ color: "var(--brand-red)" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fdecec"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pag page={rolPage} total={roles.length} setPage={setRolPage} />
          </div>
        </div>
      </div>

      {/* User Modal */}
      {userModalOpen && (
        <Modal onClose={() => setUserModalOpen(false)}>
          <div style={{ width: 400, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {userEditingId !== null ? "Editar usuario" : "Nuevo usuario"}
                </h3>
              </div>
              <button onClick={() => setUserModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block" style={{ marginBottom: 14 }}>
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Email <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input type="email" autoComplete="off" value={userForm.user} onChange={e => setUserForm(p => ({ ...p, user: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>
              <label className="block" style={{ marginBottom: 14 }}>
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Contraseña {userEditingId === null && <span style={{ color: "var(--brand-red)" }}>*</span>}
                </span>
                <input type="password" autoComplete="new-password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }}
                  placeholder={userEditingId !== null ? "Dejar vacío para no cambiar" : ""} />
              </label>
              <label className="block" style={{ marginBottom: 14 }}>
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Rol <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <select value={userForm.roleId} onChange={e => setUserForm(p => ({ ...p, roleId: Number(e.target.value) }))}
                  className="mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white" style={{ borderColor: "var(--brand-line)" }}>
                  <option value={0}>Seleccionar...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.value}</option>)}
                </select>
              </label>
              <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
                <input type="checkbox" id="userActive" checked={userForm.esta_activo} onChange={e => setUserForm(p => ({ ...p, esta_activo: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                <label htmlFor="userActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
              <div style={{ display: "flex", gap: 10 }}>
                <BrandButton variant="outline" onClick={() => setUserModalOpen(false)}>Cancelar</BrandButton>
                <BrandButton onClick={handleUserSubmit}>{userEditingId !== null ? "Guardar" : "Crear"}</BrandButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Rol Modal */}
      {rolModalOpen && (
        <Modal onClose={() => setRolModalOpen(false)}>
          <div style={{ width: 360, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {rolEditingId !== null ? "Editar rol" : "Nuevo rol"}
                </h3>
              </div>
              <button onClick={() => setRolModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                Nombre <span style={{ color: "var(--brand-red)" }}>*</span>
              </span>
              <input value={rolFormValue} onChange={e => setRolFormValue(e.target.value)}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }}
                onKeyDown={e => { if (e.key === "Enter") handleRolSubmit(); }} />
            </label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
              <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
              <div style={{ display: "flex", gap: 10 }}>
                <BrandButton variant="outline" onClick={() => setRolModalOpen(false)}>Cancelar</BrandButton>
                <BrandButton onClick={handleRolSubmit}>{rolEditingId !== null ? "Guardar" : "Crear"}</BrandButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title={confirmDelete?.type === "user" ? "Eliminar usuario" : "Eliminar rol"}
        message={confirmDelete?.type === "user"
          ? "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
          : "¿Estás seguro de eliminar este rol? Esta acción no se puede deshacer."}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {children}
      </div>
    </div>
  );
}
