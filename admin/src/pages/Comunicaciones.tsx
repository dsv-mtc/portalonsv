import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, Calendar, Upload, X, ExternalLink } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Evento = {
  id: number; idTipoEvento: number; tipoEvento?: string;
  title: string; organizedBy: string; place: string; direccion: string;
  shortDescription: string; description: string;
  startDayISO: string; startTimeISO: string;
  endDayISO: string; endTimeISO: string;
  price: string; imageUrl: string;
  reunionLink: string; facebookLink: string; youtubeLink: string; twitterLink: string;
  isActive: boolean;
};

type TipoEvento = { id: number; value: string };
type Tab = "programacion" | "agregar";

interface FormData {
  title: string; idTipoEvento: number; organizedBy: string;
  place: string; direccion: string; shortDescription: string;
  description: string; startDay: string; startTime: string;
  endDay: string; endTime: string; price: string; imageUrl: string;
  reunionLink: string; facebookLink: string; youtubeLink: string;
  twitterLink: string; isActive: boolean;
}

function initForm(): FormData {
  return {
    title: "", idTipoEvento: 0, organizedBy: "", place: "", direccion: "",
    shortDescription: "", description: "", startDay: "", startTime: "",
    endDay: "", endTime: "", price: "", imageUrl: "", reunionLink: "",
    facebookLink: "", youtubeLink: "", twitterLink: "", isActive: true,
  };
}

function eventoToForm(ev: Evento): FormData {
  return {
    title: ev.title, idTipoEvento: ev.idTipoEvento, organizedBy: ev.organizedBy,
    place: ev.place, direccion: ev.direccion, shortDescription: ev.shortDescription,
    description: ev.description, startDay: ev.startDayISO || "", startTime: ev.startTimeISO?.slice(0, 5) || "",
    endDay: ev.endDayISO || "", endTime: ev.endTimeISO?.slice(0, 5) || "",
    price: ev.price || "", imageUrl: ev.imageUrl || "", reunionLink: ev.reunionLink || "",
    facebookLink: ev.facebookLink || "", youtubeLink: ev.youtubeLink || "",
    twitterLink: ev.twitterLink || "", isActive: ev.isActive,
  };
}

const TIPO_COLORS: Record<string, { bg: string; text: string }> = {
  Evento: { bg: "#e0f2fe", text: "#0369a1" },
  Campaña: { bg: "#fef3c7", text: "#92400e" },
  Entrevista: { bg: "#dcfce7", text: "#166534" },
};

function tipoStyle(tipo?: string) {
  return TIPO_COLORS[tipo || ""] || { bg: "#f1f5f9", text: "#475569" };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";
const textareaCls = "mt-1 w-full rounded-lg border-2 px-3 py-2 text-[13px] outline-none bg-white resize-y";

export function Comunicaciones() {
  const [tab, setTab] = useState<Tab>("programacion");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [editForm, setEditForm] = useState<FormData>(initForm());
  const [viewingEvent, setViewingEvent] = useState<Evento | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const load = () => apiGet<{ eventos: Evento[]; tiposEvento: TipoEvento[] }>("/comunicaciones-eventos").then(d => { setEventos(d.eventos || []); setTipos(d.tiposEvento || []); }).catch(() => {});
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r: any = await apiUpload("/comunicaciones-eventos/upload", fd);
    if (r.success && r.url) {
      setForm(p => ({ ...p, imageUrl: r.url }));
    } else {
      setMsg(r.message || "Error al subir imagen");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.idTipoEvento || !form.organizedBy.trim() || !form.startDay.trim() || !form.startTime.trim()) {
      setMsg("Completa los campos obligatorios (*)");
      return;
    }
    const r = await apiPost("/comunicaciones-eventos", form);
    setMsg(r.message || "Evento creado");
    setForm(initForm());
    if (fileRef.current) fileRef.current.value = "";
    load();
    setTab("programacion");
  };

  const handleEditFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r: any = await apiUpload("/comunicaciones-eventos/upload", fd);
    if (r.success && r.url) {
      setEditForm(p => ({ ...p, imageUrl: r.url }));
    } else {
      setMsg(r.message || "Error al subir imagen");
    }
  };

  const openEdit = (ev: Evento) => {
    setEditForm(eventoToForm(ev));
    setEditingEvent(ev);
  };

  const handleEditSubmit = async () => {
    if (!editingEvent) return;
    if (!editForm.title.trim() || !editForm.idTipoEvento || !editForm.organizedBy.trim() || !editForm.startDay.trim() || !editForm.startTime.trim()) {
      setMsg("Completa los campos obligatorios (*)");
      return;
    }
    const r = await apiPut(`/comunicaciones-eventos/${editingEvent.id}`, editForm);
    setMsg(r.message || "Evento actualizado");
    setEditingEvent(null);
    load();
  };

  const handleDelete = (id: number) => setConfirmDelete(id);

  const confirmDeleteHandler = async () => {
    if (confirmDelete === null) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    const r = await apiDelete(`/comunicaciones-eventos/${id}`);
    setMsg(r.message || "Eliminado");
    load();
  };

  const activeCount = eventos.filter(e => e.isActive).length;

  return (
    <>
      <PageHeader title="Comunicaciones — Eventos" eyebrow="Agenda" />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div className="mb-5 inline-flex rounded-lg border-2 border-[color:var(--brand-line)] p-1 bg-white">
        {(["programacion", "agregar"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-5 h-9 rounded-md text-[12px] uppercase font-bold tracking-wider transition font-[family-name:var(--font-cond)] inline-flex items-center gap-2 " +
                (tab === t ? "bg-[color:var(--brand-navy)] text-white" : "text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-mist)]")}>
            {t === "programacion" ? <Calendar className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {t === "programacion" ? "Programación" : "Agregar"}
          </button>
        ))}
      </div>

      {tab === "programacion" && (
        <Panel title="Eventos programados" actions={<Chip color="cyan">{activeCount} activos</Chip>}>
          <div className="space-y-3">
            {eventos.map(ev => {
              const tc = tipoStyle(ev.tipoEvento);
              return (
                <div key={ev.id} className="flex items-center gap-3 rounded-lg border-2 p-3" style={{ borderColor: "var(--brand-line)" }}>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewingEvent(ev)}>
                    <span className="font-semibold text-[14px]" style={{ color: "var(--brand-navy)" }}>{ev.title}</span>
                    <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.06em] font-[family-name:var(--font-cond)]"
                      style={{ background: tc.bg, color: tc.text }}>
                      {ev.tipoEvento || `Tipo #${ev.idTipoEvento}`}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold font-[family-name:var(--font-cond)]" style={{ color: ev.isActive ? "var(--brand-green)" : "var(--muted-foreground)" }}>{ev.isActive ? "Activo" : "Inactivo"}</span>
                  <button onClick={() => openEdit(ev)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#e8ebf0] transition" style={{ color: "#101a34" }}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ev.id)} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {tab === "agregar" && (
        <Panel title="Nuevo evento">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Tipo de evento" required>
              <select value={form.idTipoEvento} onChange={e => setForm(p => ({ ...p, idTipoEvento: Number(e.target.value) }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }}>
                <option value={0}>Seleccionar...</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.value}</option>)}
              </select>
            </Field>
            <Field label="Título" required>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Organizador" required>
              <input value={form.organizedBy} onChange={e => setForm(p => ({ ...p, organizedBy: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Field label="Lugar">
              <input value={form.place} onChange={e => setForm(p => ({ ...p, place: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Dirección">
              <input value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Precio">
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Descripción corta">
              <textarea value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                className={textareaCls + " min-h-[80px]"} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Descripción">
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className={textareaCls + " min-h-[150px]"} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Field label="Día de inicio" required>
              <input type="date" value={form.startDay} onChange={e => setForm(p => ({ ...p, startDay: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Hora de inicio" required>
              <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Día de finalización">
              <input type="date" value={form.endDay} onChange={e => setForm(p => ({ ...p, endDay: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Field label="Hora de finalización">
              <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Imagen">
              <div className="flex gap-2 items-center mt-1">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                  style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                  <Upload className="w-3.5 h-3.5" /> Seleccionar
                </button>
                {form.imageUrl && (
                  <img src={form.imageUrl} className="w-11 h-11 rounded object-cover border" alt="" style={{ borderColor: "var(--brand-line)" }} />
                )}
              </div>
            </Field>
            <Field label="Enlace reunión">
              <input type="url" value={form.reunionLink} onChange={e => setForm(p => ({ ...p, reunionLink: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Field label="Enlace Facebook">
              <input type="url" value={form.facebookLink} onChange={e => setForm(p => ({ ...p, facebookLink: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Enlace Youtube">
              <input type="url" value={form.youtubeLink} onChange={e => setForm(p => ({ ...p, youtubeLink: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
            <Field label="Enlace Twitter">
              <input type="url" value={form.twitterLink} onChange={e => setForm(p => ({ ...p, twitterLink: e.target.value }))}
                className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
            </Field>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
            <label htmlFor="isActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
            <BrandButton onClick={handleSubmit}><Plus className="w-4 h-4" /> Crear evento</BrandButton>
          </div>
        </Panel>
      )}

      {viewingEvent && <EventViewModal event={viewingEvent} onClose={() => setViewingEvent(null)} />}

      {editingEvent && (
        <EditModal
          event={editingEvent}
          form={editForm}
          setForm={setEditForm}
          tipos={tipos}
          onSave={handleEditSubmit}
          onClose={() => setEditingEvent(null)}
          fileRef={editFileRef}
          onFileChange={handleEditFile}
        />
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar evento"
        message="¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteHandler}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

function EventViewModal({ event, onClose }: { event: Evento; onClose: () => void }) {
  const tc = tipoStyle(event.tipoEvento);

  const row = (label: string, value: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 0, lineHeight: 1.8 }}>
      <span style={{ color: "#5c6273", fontWeight: 600, fontFamily: "var(--font-cond)", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ color: "#14213D", fontWeight: 500, fontSize: 13.5 }}>{value}</span>
    </div>
  );

  const sectionLabel = (text: string) => (
    <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 4, marginBottom: 8 }}>
      <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, fontFamily: "var(--font-cond)", color: "#14213D", letterSpacing: "0.08em" }}>{text}</span>
    </div>
  );

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 600, maxWidth: "90vw", maxHeight: "85vh", overflow: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                {event.title}
              </h3>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ background: tc.bg, color: tc.text, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-cond)" }}>
                  {event.tipoEvento || `Tipo #${event.idTipoEvento}`}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-cond)", color: event.isActive ? "#1f7a44" : "#5c6273" }}>
                  {event.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            <button onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: 0 }} />
        </div>

        {event.imageUrl && (
          <div>
            <img src={event.imageUrl} alt="" style={{ width: "100%", borderRadius: 12, objectFit: "cover", display: "block" }} />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {row("Organizador", event.organizedBy)}
          {row("Inicio", `${event.startDayISO} ${event.startTimeISO?.slice(0, 5)}`)}
          {(event.endDayISO || event.endTimeISO) && row("Fin", `${event.endDayISO || "—"} ${event.endTimeISO?.slice(0, 5) || ""}`)}
          {row("Lugar", [event.place, event.direccion].filter(Boolean).join(", ") || "—")}
          {event.price && row("Precio", `S/ ${event.price}`)}
        </div>

        {event.shortDescription && (
          <div>
            {sectionLabel("Descripción corta")}
            <p style={{ fontSize: 13.5, color: "#3d4356", margin: 0, lineHeight: 1.5 }}>{event.shortDescription}</p>
          </div>
        )}

        {event.description && (
          <div>
            {sectionLabel("Descripción")}
            <p style={{ fontSize: 13.5, color: "#3d4356", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{event.description}</p>
          </div>
        )}

        {(event.reunionLink || event.facebookLink || event.youtubeLink || event.twitterLink) && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {event.reunionLink && <LinkChip href={event.reunionLink} label="Reunión" />}
            {event.facebookLink && <LinkChip href={event.facebookLink} label="Facebook" />}
            {event.youtubeLink && <LinkChip href={event.youtubeLink} label="YouTube" />}
            {event.twitterLink && <LinkChip href={event.twitterLink} label="Twitter" />}
          </div>
        )}

        <div>
          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: 0, marginBottom: 4 }} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <BrandButton onClick={onClose}>Cerrar</BrandButton>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "#f1f5f9", color: "#14213D", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "var(--font-cond)", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#e2e8f0")}
      onMouseLeave={e => (e.currentTarget.style.background = "#f1f5f9")}>
      <ExternalLink className="w-3 h-3" /> {label}
    </a>
  );
}

function EditModal({ event, form, setForm, tipos, onSave, onClose, fileRef, onFileChange }: {
  event: Evento; form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>>;
  tipos: TipoEvento[]; onSave: () => Promise<void>; onClose: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 680, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
              Editar evento
            </h3>
            <p style={{ fontSize: 13, color: "#5c6273", margin: "4px 0 0" }}>{event.title}</p>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Tipo de evento" required>
            <select value={form.idTipoEvento} onChange={e => setForm(p => ({ ...p, idTipoEvento: Number(e.target.value) }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }}>
              <option value={0}>Seleccionar...</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.value}</option>)}
            </select>
          </Field>
          <Field label="Título" required>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Organizador" required>
            <input value={form.organizedBy} onChange={e => setForm(p => ({ ...p, organizedBy: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="Lugar">
            <input value={form.place} onChange={e => setForm(p => ({ ...p, place: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Dirección">
            <input value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Precio">
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Descripción corta">
            <textarea value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
              className={textareaCls + " min-h-[80px]"} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Descripción">
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className={textareaCls + " min-h-[150px]"} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="Día de inicio" required>
            <input type="date" value={form.startDay} onChange={e => setForm(p => ({ ...p, startDay: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Hora de inicio" required>
            <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Día de finalización">
            <input type="date" value={form.endDay} onChange={e => setForm(p => ({ ...p, endDay: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="Hora de finalización">
            <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Imagen">
            <div className="flex gap-2 items-center mt-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
                style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                <Upload className="w-3.5 h-3.5" /> Seleccionar
              </button>
              {form.imageUrl && (
                <img src={form.imageUrl} className="w-11 h-11 rounded object-cover border" alt="" style={{ borderColor: "var(--brand-line)" }} />
              )}
            </div>
          </Field>
          <Field label="Enlace reunión">
            <input type="url" value={form.reunionLink} onChange={e => setForm(p => ({ ...p, reunionLink: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="Enlace Facebook">
            <input type="url" value={form.facebookLink} onChange={e => setForm(p => ({ ...p, facebookLink: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Enlace Youtube">
            <input type="url" value={form.youtubeLink} onChange={e => setForm(p => ({ ...p, youtubeLink: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
          <Field label="Enlace Twitter">
            <input type="url" value={form.twitterLink} onChange={e => setForm(p => ({ ...p, twitterLink: e.target.value }))}
              className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <input type="checkbox" id="editIsActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
            className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
          <label htmlFor="editIsActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
          <div style={{ display: "flex", gap: 10 }}>
            <BrandButton variant="outline" onClick={onClose}>Cancelar</BrandButton>
            <BrandButton onClick={onSave}>Guardar cambios</BrandButton>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
        {label} {required && <span style={{ color: "var(--brand-red)" }}>*</span>}
      </span>
      {children}
    </label>
  );
}
