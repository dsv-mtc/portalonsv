import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, X, Send, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type Lang = "es" | "en";

type Subitem = {
  id: number;
  seccion: string;
  orden: number;
  label_es: string;
  label_en: string;
  url: string;
  external: boolean;
  isActive: boolean;
};

const SECCIONES: { key: string; label: string }[] = [
  { key: "quienes-somos", label: "Quiénes Somos" },
  { key: "comunicaciones", label: "Comunicaciones" },
  { key: "publicaciones", label: "Publicaciones" },
  { key: "educacion-vial", label: "Educación Vial" },
  { key: "aplicaciones", label: "Aplicaciones" },
  { key: "normas-legales", label: "Normas Legales" },
];

const INTERNAL_ROUTES: string[] = [
  "/quienes-somos",
  "/quienes-somos#quienes-somos",
  "/quienes-somos#mision",
  "/quienes-somos#vision",
  "/quienes-somos#valores",
  "/quienes-somos#componentes",
  "/comunicaciones/noticias",
  "/comunicaciones/nota-prensa",
  "/comunicaciones/eventos",
  "/publicaciones",
  "/revistas",
  "/normas-legales",
  "/webinars",
  "/capacitaciones",
  "/peru-in-world",
  "/entornos-viales",
  "/analitica",
  "/datosabiertos",
  "/contacto",
  "/aulavirtual",
  "/srat",
  "/regiones",
];

const inputCls = "mt-1 w-full h-10 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

export function MenuSitio() {
  const [lang, setLang] = useState<Lang>("es");
  const [items, setItems] = useState<Subitem[]>([]);
  const [msg, setMsg] = useState("");
  const [msgTimer, setMsgTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [addSeccion, setAddSeccion] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ label_es: "", label_en: "", url: "", external: false });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ "quienes-somos": true });

  const showMsg = (t: string) => {
    if (msgTimer) clearTimeout(msgTimer);
    setMsg(t);
    setMsgTimer(setTimeout(() => setMsg(""), 3000));
  };

  const load = () => {
    apiGet<Subitem[]>("/menu-subitems").then(setItems).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const itemsBySeccion = (sec: string) =>
    items.filter(i => i.seccion === sec).sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const updateField = (id: number, patch: Partial<Subitem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const move = (sec: string, index: number, dir: -1 | 1) => {
    const list = itemsBySeccion(sec);
    const next = index + dir;
    if (next < 0 || next >= list.length) return;
    const copy = [...list];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    const orden = copy.map((s, i) => ({ id: s.id, orden: i + 1 }));
    setItems(prev => {
      const updated = [...prev];
      copy.forEach((s, i) => {
        const idx = updated.findIndex(u => u.id === s.id);
        if (idx !== -1) updated[idx] = { ...updated[idx], orden: i + 1 };
      });
      return updated;
    });
    apiPut("/menu-subitems/order", { orden }).then(r => showMsg(r.success ? "Orden actualizado" : "Error"));
  };

  const toggleActive = async (item: Subitem) => {
    const newVal = !item.isActive;
    updateField(item.id, { isActive: newVal });
    const r = await apiPut(`/menu-subitems/${item.id}`, { isActive: newVal });
    showMsg(r.success ? "Estado actualizado" : "Error");
  };

  const saveItem = async (item: Subitem) => {
    setSavingId(item.id);
    const r = await apiPut(`/menu-subitems/${item.id}`, {
      label_es: item.label_es,
      label_en: item.label_en,
      url: item.url,
      external: item.external,
      isActive: item.isActive,
    });
    setSavingId(null);
    showMsg(r.success ? "Subitem guardado" : "Error");
  };

  const handleDelete = async () => {
    if (confirmDelete === null) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    await apiDelete(`/menu-subitems/${id}`);
    showMsg("Subitem eliminado");
    load();
  };

  const openAdd = (sec: string) => {
    setAddSeccion(sec);
    setAddForm({ label_es: "", label_en: "", url: "", external: false });
  };

  const handleAdd = async () => {
    if (!addSeccion) return;
    if (!addForm.label_es.trim() && !addForm.label_en.trim()) {
      showMsg("Completa al menos un nombre");
      return;
    }
    if (!addForm.url.trim()) {
      showMsg("Completa el enlace");
      return;
    }
    const r = await apiPost("/menu-subitems", {
      seccion: addSeccion,
      label_es: addForm.label_es,
      label_en: addForm.label_en,
      url: addForm.url,
      external: addForm.external,
      isActive: true,
    });
    if (r.success) {
      showMsg("Subitem agregado");
      setAddSeccion(null);
      load();
    } else {
      showMsg(r.message || "Error");
    }
  };

  const labelCls = "text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold";

  return (
    <>
      <PageHeader title="Menú del sitio" eyebrow="Subitems del navbar (ES / EN)"
        description="Administra los subitems de cada opción del menú del navbar: agregar, ordenar, activar/desactivar y eliminar. Edita el nombre en cada idioma con las pestañas." />

      <div className="mb-5 inline-flex rounded-lg border-2 border-[color:var(--brand-line)] p-1 bg-white">
        {(["es", "en"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className={"px-4 h-9 rounded-md text-[12px] uppercase font-bold tracking-wider transition font-[family-name:var(--font-cond)] " +
                (lang === l ? "bg-[color:var(--brand-navy)] text-white" : "text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-mist)]")}>
            {l === "es" ? "Español" : "English"}
          </button>
        ))}
      </div>

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="space-y-6">
        {SECCIONES.map(sec => {
          const list = itemsBySeccion(sec.key);
          const isOpen = !!openSections[sec.key];
          return (
            <Panel key={sec.key} title={sec.label} actions={
              <div className="flex items-center gap-2">
                <Chip color="cyan">{list.length} subitem(s)</Chip>
                <button type="button" onClick={() => setOpenSections(prev => ({ ...prev, [sec.key]: !prev[sec.key] }))}
                  className="w-8 h-8 rounded-lg border grid place-items-center hover:bg-[color:var(--brand-mist)] transition cursor-pointer"
                  style={{ borderColor: "var(--brand-line)" }} title={isOpen ? "Colapsar" : "Expandir"}>
                  {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: "var(--brand-navy)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--brand-navy)" }} />}
                </button>
              </div>
            }>
              {isOpen && (
                <>
              <div className="mb-3 flex justify-end">
                <BrandButton onClick={() => openAdd(sec.key)}><Plus className="w-4 h-4" /> Agregar</BrandButton>
              </div>
              <div className="divide-y divide-[color:var(--brand-line)]">
                {list.length === 0 && (
                  <p className="py-4 text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>
                    No hay subitems en esta sección. Si no se agrega ninguno, el dropdown no se mostrará en el navbar.
                  </p>
                )}
                {list.map((item, i) => (
                  <div key={item.id} className="py-3 flex items-center gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => move(sec.key, i, -1)} disabled={i === 0}
                        className="w-7 h-7 rounded border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30"
                        style={{ borderColor: "var(--brand-line)" }}>
                        <ArrowUp className="w-3.5 h-3.5" style={{ color: "var(--brand-navy)" }} />
                      </button>
                      <button type="button" onClick={() => move(sec.key, i, 1)} disabled={i === list.length - 1}
                        className="w-7 h-7 rounded border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30"
                        style={{ borderColor: "var(--brand-line)" }}>
                        <ArrowDown className="w-3.5 h-3.5" style={{ color: "var(--brand-navy)" }} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <span className={labelCls}>Nombre</span>
                      <input value={lang === "es" ? item.label_es : item.label_en}
                        onChange={e => updateField(item.id, lang === "es" ? { label_es: e.target.value } : { label_en: e.target.value })}
                        className="mt-1 w-full h-9 rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none px-3 text-[13px] bg-white" />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <span className={labelCls}>Enlace</span>
                      <input type="url" list="menu-routes" value={item.url}
                        onChange={e => updateField(item.id, { url: e.target.value })}
                        className="mt-1 w-full h-9 rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none px-3 text-[13px] bg-white"
                        placeholder="/ruta o https://..." />
                    </div>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                      <input type="checkbox" checked={item.external}
                        onChange={e => updateField(item.id, { external: e.target.checked })}
                        className="w-4 h-4 accent-[color:var(--brand-red)]" />
                      <span className="text-[11px] font-semibold" style={{ color: "var(--brand-navy)" }}>Nueva pestaña</span>
                    </label>
                    <button onClick={() => toggleActive(item)}
                      className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] uppercase font-bold tracking-[0.04em] font-[family-name:var(--font-cond)] border transition cursor-pointer shrink-0"
                      style={{
                        background: item.isActive ? "#dcfce7" : "#f1f5f9",
                        color: item.isActive ? "#166534" : "#475569",
                        borderColor: item.isActive ? "#bbf7d0" : "#e2e8f0",
                      }}>
                      {item.isActive ? "Activo" : "Inactivo"}
                    </button>
                    <button onClick={() => saveItem(item)} disabled={savingId === item.id}
                      className="mt-4 h-9 px-3 rounded-lg bg-[color:var(--brand-navy)] text-white text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-1.5 disabled:opacity-50">
                      <Send className="w-3.5 h-3.5" /> {savingId === item.id ? "..." : "Guardar"}
                    </button>
                    <button onClick={() => setConfirmDelete(item.id)} title="Eliminar"
                      className="mt-4 w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              </>
              )}
            </Panel>
          );
        })}
      </div>

      <datalist id="menu-routes">
        {INTERNAL_ROUTES.map(r => <option key={r} value={r} />)}
      </datalist>

      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar subitem"
        message="¿Estás seguro de eliminar este subitem del menú? La página a la que apunta no se elimina, solo su acceso desde el menú."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {addSeccion && (
        <div onClick={() => setAddSeccion(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>Nuevo subitem</h3>
                <p style={{ fontSize: 11, color: "#5c6273", margin: "4px 0 0", fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Sección: {SECCIONES.find(s => s.key === addSeccion)?.label}
                </p>
              </div>
              <button onClick={() => setAddSeccion(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4 }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className={labelCls}>Nombre {lang === "es" ? "(Español)" : "(English)"}</span>
                <input value={lang === "es" ? addForm.label_es : addForm.label_en}
                  onChange={e => setAddForm(p => ({ ...p, ...(lang === "es" ? { label_es: e.target.value } : { label_en: e.target.value }) }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder={lang === "es" ? "Nombre en español" : "Name in English"} />
              </label>
              <label className="block">
                <span className={labelCls}>Enlace <span style={{ color: "var(--brand-red)" }}>*</span></span>
                <input type="url" list="menu-routes" value={addForm.url} onChange={e => setAddForm(p => ({ ...p, url: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} placeholder="/ruta o https://..." />
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={addForm.external} onChange={e => setAddForm(p => ({ ...p, external: e.target.checked }))}
                  className="w-4 h-4 accent-[color:var(--brand-red)]" />
                <span className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>Abrir en nueva pestaña</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <BrandButton variant="outline" onClick={() => setAddSeccion(null)}>Cancelar</BrandButton>
              <BrandButton onClick={handleAdd}><Upload className="w-4 h-4" /> Crear</BrandButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}