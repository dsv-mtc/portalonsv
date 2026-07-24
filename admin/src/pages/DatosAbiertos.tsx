import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Trash2, Pencil, Upload, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrandButton, Chip } from "../components/UIBits";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../lib/api";

type Dato = { id: number; titulo: string; autor: string; descripcion: string; idCategoria: number; categoria: string; idTipo: number; tipo: string; excelfile: string; pdffile: string; csvfile: string; shapefile: string; fecha: string; esta_activo: boolean; hasExcel: boolean; hasPdf: boolean; hasCsv: boolean; hasShapefile: boolean };
type Categoria = { id: number; value: string };
type Tipo = { id: number; value: string };

interface FormData {
  titulo: string;
  autor: string;
  descripcion: string;
  idCategoria: number;
  idTipo: number;
  excelfilepath: string;
  pdffilepath: string;
  csvfilepath: string;
  shapefilepath: string;
  esta_activo: boolean;
  fecha: string;
}

function initForm(): FormData {
  return { titulo: "", autor: "", descripcion: "", idCategoria: 0, idTipo: 0, excelfilepath: "", pdffilepath: "", csvfilepath: "", shapefilepath: "", esta_activo: true, fecha: "" };
}

const inputCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";
const selectCls = "mt-1 w-full h-11 rounded-lg border-2 px-3 text-[13px] outline-none bg-white";

export function DatosAbiertos() {
  const [datos, setDatos] = useState<Dato[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [form, setForm] = useState<FormData>(initForm());
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [filterTitulo, setFilterTitulo] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<number | "">("");
  const fileExcelRef = useRef<HTMLInputElement>(null);
  const filePdfRef = useRef<HTMLInputElement>(null);
  const fileCsvRef = useRef<HTMLInputElement>(null);
  const fileShapeRef = useRef<HTMLInputElement>(null);

  const PER_PAGE = 5;

  const filtered = useMemo(() => {
    return datos.filter(d => {
      if (filterTitulo && !d.titulo.toLowerCase().includes(filterTitulo.toLowerCase())) return false;
      if (filterCategoria && d.idCategoria !== filterCategoria) return false;
      return true;
    });
  }, [datos, filterTitulo, filterCategoria]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const load = () => {
    setPage(1);
    apiGet<{ datos: Dato[]; categorias: Categoria[]; tipos: Tipo[] }>("/datos-abiertos")
      .then(d => { setDatos(d.datos || []); setCategorias(d.categorias || []); setTipos(d.tipos || []); })
      .catch(() => {});
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const openCreate = () => {
    setForm(initForm());
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: Dato) => {
    setForm({
      titulo: item.titulo,
      autor: item.autor,
      descripcion: item.descripcion,
      idCategoria: item.idCategoria,
      idTipo: item.idTipo,
      excelfilepath: item.excelfile !== "No existe" ? item.excelfile : "",
      pdffilepath: item.pdffile !== "No existe" ? item.pdffile : "",
      csvfilepath: item.csvfile !== "No existe" ? item.csvfile : "",
      shapefilepath: item.shapefile !== "No existe" ? item.shapefile : "",
      esta_activo: item.esta_activo ?? true,
      fecha: item.fecha,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData, validExtensions: string[], fieldLabel: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      setMsg(`Este archivo no es válido para el campo ${fieldLabel}. Solo se permiten: ${validExtensions.map(x => '.' + x).join(', ')}`);
      e.target.value = "";
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    const r: any = await apiUpload("/datos-abiertos/upload", fd);
    if (r.success && r.url) {
      setForm(p => ({ ...p, [field]: r.url }));
    } else {
      setMsg(r.message || "Error al subir archivo");
    }
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim() || !form.autor.trim() || !form.descripcion.trim() || !form.idCategoria || !form.idTipo) {
      setMsg("Completa los campos obligatorios (*)");
      return;
    }
    if (editingId !== null) {
      await apiPut(`/datos-abiertos/${editingId}`, form);
      setMsg("Dataset actualizado");
    } else {
      await apiPost("/datos-abiertos", form);
      setMsg("Dataset creado");
    }
    setModalOpen(false);
    setForm(initForm());
    setEditingId(null);
    load();
  };

  const handleDelete = async () => {
    if (confirmDelete === null) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    await apiDelete(`/datos-abiertos/${id}`);
    setMsg("Eliminado");
    load();
  };

  const pagBtn = (label: React.ReactNode, active: boolean, onClick: () => void, ariaLabel: string) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
      className={`pag-btn${active ? " active" : ""}`}>
      {label}
    </button>
  );

  const hasFile = (f: string) => f && f !== "No existe";

  return (
    <>
      <PageHeader title="Datos Abiertos" eyebrow="Publicación de datos" actions={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Chip color="cyan">{filtered.length} / {datos.length}</Chip>
          <BrandButton onClick={openCreate}><Plus className="w-4 h-4" /> Agregar</BrandButton>
        </div>
      } />

      <style>{`
        .region-img { width:40px; height:40px; object-fit:contain; border-radius:6px; display:block; transition:transform .25s ease; }
        .region-img:hover { transform:scale(3); z-index:99999; position:relative; }
        .pag-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #1d3557; font-weight: 700; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s ease; }
        .pag-btn:hover { border-color: #C8102E; color: #C8102E; }
        .pag-btn.active { background: #C8102E; color: #fff; border-color: transparent; }
        .pag-btn.active:hover { background: #C8102E; color: #fff; border-color: transparent; }
        .file-chip { display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;font-family:var(--font-cond);text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis; }
      `}</style>
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 12 }}>
        <input type="text" placeholder="Buscar título..." value={filterTitulo}
          onChange={e => { setFilterTitulo(e.target.value); setPage(1); }}
          className="h-10 w-52 rounded-lg border-2 px-3 text-[13px] outline-none bg-white"
          style={{ borderColor: "var(--brand-line)" }} />
        <select value={filterCategoria}
          onChange={e => { setFilterCategoria(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
          className="h-10 rounded-lg border-2 px-3 text-[13px] outline-none bg-white"
          style={{ borderColor: "var(--brand-line)" }}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.value}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-5" style={{ boxShadow: "var(--shadow-brand)", marginTop: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--brand-line)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Título</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Autor</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Descripción</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Categoría</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Tipo</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Excel</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>PDF</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>CSV</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Shape</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Estado</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--brand-navy)", fontSize: "12px", textTransform: "uppercase", fontFamily: "var(--font-cond)", letterSpacing: "0.06em" }}>Fecha</th>
              <th style={{ width: 80, padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--brand-line)" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--brand-navy)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.titulo}>{item.titulo}</td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.autor}>{item.autor}</td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.descripcion}>{item.descripcion}</td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)" }}>{item.categoria}</td>
                <td style={{ padding: "10px 8px", color: "var(--brand-navy)" }}>{item.tipo}</td>
                <td style={{ padding: "10px 8px" }}>
                  {hasFile(item.excelfile) ? (
                    <span className="file-chip" style={{ background: "#e8f5ec", color: "#166534" }} title={item.excelfile}>XLS</span>
                  ) : <span style={{ color: "#94a3b8" }}>—</span>}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {hasFile(item.pdffile) ? (
                    <span className="file-chip" style={{ background: "#fdecec", color: "#C8102E" }} title={item.pdffile}>PDF</span>
                  ) : <span style={{ color: "#94a3b8" }}>—</span>}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {hasFile(item.csvfile) ? (
                    <span className="file-chip" style={{ background: "#e0f0ff", color: "#1d4ed8" }} title={item.csvfile}>CSV</span>
                  ) : <span style={{ color: "#94a3b8" }}>—</span>}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {hasFile(item.shapefile) ? (
                    <span className="file-chip" style={{ background: "#fef3c7", color: "#92400e" }} title={item.shapefile}>SHP</span>
                  ) : <span style={{ color: "#94a3b8" }}>—</span>}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    fontFamily: "var(--font-cond)", textTransform: "uppercase", letterSpacing: "0.04em",
                    background: item.esta_activo ? "#dcfce7" : "#f1f5f9",
                    color: item.esta_activo ? "#166534" : "#475569",
                  }}>
                    {item.esta_activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "10px 8px", fontSize: 12, color: "var(--brand-navy)", whiteSpace: "nowrap" }}>{item.fecha}</td>
                <td style={{ padding: "10px 8px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#e8ebf0] transition" style={{ color: "#101a34" }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDelete(item.id)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[#fdecec] transition" style={{ color: "var(--brand-red)" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-1.5">
          {pagBtn(<ChevronsLeft className="w-4 h-4" />, false, () => setPage(1), "Primera página")}
          {pagBtn(<ChevronLeft className="w-4 h-4" />, false, () => setPage(p => Math.max(1, p - 1)), "Página anterior")}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => pagBtn(p, p === currentPage, () => setPage(p), `Página ${p}`))}
          {pagBtn(<ChevronRight className="w-4 h-4" />, false, () => setPage(p => Math.min(totalPages, p + 1)), "Página siguiente")}
          {pagBtn(<ChevronsRight className="w-4 h-4" />, false, () => setPage(totalPages), "Última página")}
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div style={{ width: 560, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0, fontFamily: "var(--font-display)" }}>
                  {editingId !== null ? "Editar dataset" : "Nuevo dataset"}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6273", padding: 4, borderRadius: 6, flexShrink: 0 }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Título <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Autor <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.autor} onChange={e => setForm(p => ({ ...p, autor: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Descripción <span style={{ color: "var(--brand-red)" }}>*</span>
                </span>
                <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                    Categoría <span style={{ color: "var(--brand-red)" }}>*</span>
                  </span>
                  <select value={form.idCategoria} onChange={e => setForm(p => ({ ...p, idCategoria: Number(e.target.value) }))}
                    className={selectCls} style={{ borderColor: "var(--brand-line)" }}>
                    <option value={0}>Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.value}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                    Tipo de contenido <span style={{ color: "var(--brand-red)" }}>*</span>
                  </span>
                  <select value={form.idTipo} onChange={e => setForm(p => ({ ...p, idTipo: Number(e.target.value) }))}
                    className={selectCls} style={{ borderColor: "var(--brand-line)" }}>
                    <option value={0}>Seleccionar...</option>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.value}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FileUpload label="Excel" fileRef={fileExcelRef} value={form.excelfilepath}
                  accept=".xlsx,.xls"
                  onChange={e => handleFile(e, "excelfilepath", ["xlsx", "xls"], "Excel")} />
                <FileUpload label="PDF" fileRef={filePdfRef} value={form.pdffilepath}
                  accept=".pdf"
                  onChange={e => handleFile(e, "pdffilepath", ["pdf"], "PDF")} />
                <FileUpload label="CSV" fileRef={fileCsvRef} value={form.csvfilepath}
                  accept=".csv"
                  onChange={e => handleFile(e, "csvfilepath", ["csv"], "CSV")} />
                <FileUpload label="Shapefile" fileRef={fileShapeRef} value={form.shapefilepath}
                  accept=".shp"
                  onChange={e => handleFile(e, "shapefilepath", ["shp"], "Shapefile")} />
              </div>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
                  Fecha
                </span>
                <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
                  className={inputCls} style={{ borderColor: "var(--brand-line)" }} />
              </label>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="datoActive" checked={form.esta_activo} onChange={e => setForm(p => ({ ...p, esta_activo: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 accent-[color:var(--brand-navy)]" />
                <label htmlFor="datoActive" className="text-[13px] font-semibold" style={{ color: "var(--brand-navy)" }}>¿Está activo?</label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-semibold" style={{ color: "var(--brand-red)" }}>*: Campos obligatorios</span>
              <div style={{ display: "flex", gap: 10 }}>
                <BrandButton variant="outline" onClick={() => setModalOpen(false)}>Cancelar</BrandButton>
                <BrandButton onClick={handleSubmit}>{editingId !== null ? "Guardar" : "Crear"}</BrandButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar dataset"
        message="¿Estás seguro de eliminar este dataset? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

function FileUpload({ label, fileRef, value, onChange, accept }: { label: string; fileRef: React.RefObject<HTMLInputElement | null>; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; accept?: string }) {
  const name = value ? value.split("/").pop() || "" : "";
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>
        {label}
      </span>
      <div className="flex gap-2 items-center mt-1">
        <input ref={fileRef} type="file" accept={accept} onChange={onChange} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="h-11 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition"
          style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
          <Upload className="w-3.5 h-3.5" /> Subir
        </button>
        {value && (
          <span className="text-[11px] font-semibold truncate max-w-[120px]" style={{ color: "var(--brand-navy)" }} title={value}>{name}</span>
        )}
      </div>
    </label>
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
