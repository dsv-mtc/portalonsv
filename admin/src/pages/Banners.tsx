import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, Upload, Languages, Send } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel, BrandButton } from "../components/UIBits";
import { apiGet, apiPut, apiUpload } from "../lib/api";

type Lang = "es" | "en";

type Banner = {
  id: number;
  posicion: number;
  archivo: string;
  activo: number;
  video_url?: string | null;
  kicker_es: string; kicker_en: string;
  titulo_es: string; titulo_en: string;
  parrafo_es: string; parrafo_en: string;
  btn1_label_es: string; btn1_label_en: string;
  btn1_href: string;
  btn2_label_es: string; btn2_label_en: string;
  btn2_href: string;
};

const fieldLabel = (es: string, en: string, lang: Lang) => lang === "es" ? es : en;

export function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [lang, setLang] = useState<Lang>("es");
  const [msg, setMsg] = useState("");
  const [msgTimer, setMsgTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadModal, setUploadModal] = useState<{bannerId:number; open:boolean}|null>(null);
  const [linkInput, setLinkInput] = useState("");


  const showMsg = (text: string) => {
    if (msgTimer) clearTimeout(msgTimer);
    setMsg(text);
    setMsgTimer(setTimeout(() => setMsg(""), 3000));
  };

  const load = () => {
    apiGet<Banner[]>("/banners").then(setBanners).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleFile = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const r: any = await apiUpload(`/banners/upload/${id}`, fd);
    if (r.success) { load(); showMsg("Imagen subida"); } else { showMsg(r.message || "Error"); }
  };

  const toggleActivo = async (banner: Banner) => {
    const next = banner.activo ? 0 : 1;
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, activo: next } : b));
    const r = await apiPut(`/banners/activo/${banner.id}`, { activo: next });
    if (r.success) {
      showMsg(lang === "es"
        ? (next ? `Banner ${banner.posicion} activado` : `Banner ${banner.posicion} desactivado`)
        : (next ? `Banner ${banner.posicion} activated` : `Banner ${banner.posicion} deactivated`));
    } else {
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, activo: banner.activo } : b));
      showMsg(r.message || "Error");
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= banners.length) return;
    const copy = [...banners];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    const p = copy[index].posicion;
    copy[index].posicion = copy[next].posicion;
    copy[next].posicion = p;
    setBanners(copy);
    const orden = copy.map((b, i) => ({ id: b.id, posicion: i + 1 }));
    apiPut("/banners/order", { orden }).then(r => {
      if (r.success) { showMsg("Orden actualizado"); }
      else { showMsg(r.message || "Error"); }
    });
  };

  const updateField = (id: number, key: keyof Banner, value: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [key]: value } : b));
  };

  const saveTextos = async (banner: Banner) => {
    setSavingId(banner.id);
    const f = (k: keyof Banner) => (banner[k] ?? "") as string;
    const r = await apiPut(`/banners/textos/${banner.id}`, {
      idioma: lang,
      kicker:    f(`kicker_${lang}`),
      titulo:    f(`titulo_${lang}`),
      parrafo:   f(`parrafo_${lang}`),
      btn1_label: f(`btn1_label_${lang}`),
      btn1_href:  f("btn1_href"),
      btn2_label: f(`btn2_label_${lang}`),
      btn2_href:  f("btn2_href"),
      video_url: banner.video_url ?? "",
    });
    setSavingId(null);
    showMsg(r.success ? `Banner ${banner.posicion} guardado (${lang.toUpperCase()})` : (r.message || "Error"));
  };

  const labelCls = "text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold";
  const inputCls = "mt-1 w-full rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none px-3 text-[14.5px]";
  const textareaCls = "mt-1 w-full rounded-lg border-2 border-[color:var(--brand-line)] focus:border-[color:var(--brand-navy)] outline-none p-2 text-[14.5px] leading-snug resize-y";

  return (
    <>
      <PageHeader title="Banners" eyebrow="Página principal"
        description={lang === "es"
          ? "Edita los textos, botones e imagen de cada slide del carrusel. Usa *palabra* para resaltarla (se verá en color en el portal)."
          : "Edit texts, buttons and image of each carousel slide. Use *word* to highlight it (shown in color on the portal)."} />

      <div className="mb-5 inline-flex rounded-lg border-2 border-[color:var(--brand-line)] p-1 bg-white">
        {(["es", "en"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className={"px-4 h-9 rounded-md text-[12px] uppercase font-bold tracking-wider transition font-[family-name:var(--font-cond)] inline-flex items-center gap-2 " +
                (lang === l ? "bg-[color:var(--brand-navy)] text-white" : "text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-mist)]")}>
            <Languages className="w-3.5 h-3.5" /> {l === "es" ? "Español" : "English"}
          </button>
        ))}
      </div>

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <Panel>
        <div className="space-y-5">
          {banners.map((banner, i) => (
            <div key={banner.id} className={"p-4 rounded-lg border-2 bg-white space-y-4 transition-opacity " + (banner.activo ? "" : "opacity-50")} style={{ borderColor: "var(--brand-line)" }}>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-lg border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30" style={{ borderColor: "var(--brand-line)" }}>
                    <ArrowUp className="w-4 h-4" style={{ color: "var(--brand-navy)" }} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === banners.length - 1} className="w-8 h-8 rounded-lg border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30" style={{ borderColor: "var(--brand-line)" }}>
                    <ArrowDown className="w-4 h-4" style={{ color: "var(--brand-navy)" }} />
                  </button>
                </div>
                <div className="w-[140px] h-[80px] rounded-lg overflow-hidden border relative" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }}>
                  {banner.video_url ? (() => {
                    const ytMatch = banner.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
                    const thumb = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : null;
                    return thumb ? <img src={thumb} alt="Video" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-[10px]">Link video</div>;
                  })() : /\.(mp4|webm|mov)$/i.test(banner.archivo) ? (
                    (() => {
                      const preview = banner.archivo.replace(/\.(mp4|webm|mov)$/i, '_preview.jpg');
                      return <img src={encodeURI(preview)} alt={`Banner ${banner.posicion}`} className="w-full h-full object-cover" onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }} />;
                    })()
                  ) : (
                    <img src={encodeURI(banner.archivo)} alt={`Banner ${banner.posicion}`} className="w-full h-full object-contain" />
                  )}
                  {banner.video_url && <div className="absolute inset-0 grid place-items-center bg-black/40 text-white text-[10px] font-bold">YT</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold font-[family-name:var(--font-cond)] uppercase tracking-wide" style={{ color: "var(--brand-navy)" }}>Banner {banner.posicion}</div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{banner.archivo}</div>
                </div>
                <label className="flex-shrink-0 flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={!!banner.activo} onChange={() => toggleActivo(banner)} className="w-4 h-4 cursor-pointer accent-[color:var(--brand-navy)]" />
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--brand-navy)] font-bold font-[family-name:var(--font-cond)]">
                    {lang === "es" ? "Activo" : "Active"}
                  </span>
                </label>
                <div className="flex-shrink-0">
                  <input ref={el => { fileRefs.current[i] = el; }} type="file" accept="image/*,video/*" onChange={e => handleFile(banner.id, e)} className="hidden" />
                  <button type="button" onClick={() => { setUploadModal({bannerId: banner.id, open:true}); setLinkInput(banner.video_url ?? ""); }} className="h-10 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition" style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                    <Upload className="w-3.5 h-3.5" /> Subir
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pl-0 sm:pl-[44px]">
                <label className="block">
                  <span className={labelCls}>{fieldLabel("Kicker", "Kicker", lang)}</span>
                  <textarea className={textareaCls} rows={1} maxLength={200} value={lang === "es" ? (banner.kicker_es ?? "") : (banner.kicker_en ?? "")} onChange={e => updateField(banner.id, lang === "es" ? "kicker_es" : "kicker_en", e.target.value)} />
                </label>
                <label className="block">
                  <span className={labelCls}>{fieldLabel("Título", "Title", lang)} <span className="text-[color:var(--brand-cyan)] normal-case tracking-normal font-normal">· *palabra* = resaltado</span></span>
                  <textarea className={textareaCls} rows={2} maxLength={500} value={lang === "es" ? (banner.titulo_es ?? "") : (banner.titulo_en ?? "")} onChange={e => updateField(banner.id, lang === "es" ? "titulo_es" : "titulo_en", e.target.value)} />
                </label>
              </div>

              <label className="block pl-0 sm:pl-[44px]">
                <span className={labelCls}>{fieldLabel("Párrafo", "Paragraph", lang)}</span>
                <textarea className={textareaCls} rows={3} maxLength={2000} value={lang === "es" ? (banner.parrafo_es ?? "") : (banner.parrafo_en ?? "")} onChange={e => updateField(banner.id, lang === "es" ? "parrafo_es" : "parrafo_en", e.target.value)} />
              </label>

              <div className="grid sm:grid-cols-2 gap-4 pl-0 sm:pl-[44px]">
                <div className="space-y-2">
                  <span className={labelCls}>{fieldLabel("Botón 1 — Texto", "Button 1 — Label", lang)}</span>
                  <input type="text" className={inputCls + " h-[42px]"} maxLength={100} value={lang === "es" ? (banner.btn1_label_es ?? "") : (banner.btn1_label_en ?? "")} onChange={e => updateField(banner.id, lang === "es" ? "btn1_label_es" : "btn1_label_en", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <span className={labelCls}>{fieldLabel("Botón 1 — Enlace", "Button 1 — Link", lang)}</span>
                  <input type="text" className={inputCls + " h-[42px]"} maxLength={500} placeholder="https://... · /ruta · #ancla" value={banner.btn1_href ?? ""} onChange={e => updateField(banner.id, "btn1_href", e.target.value)} />
                  <span className="text-[10.5px] text-[color:var(--muted-foreground)] font-[family-name:var(--font-cond)]">
                    {lang === "es"
                      ? "URL externa (https://...) abre en nueva pestaña · ruta interna (/publicaciones) o ancla (#seccion) en la misma"
                      : "External URL (https://...) opens new tab · internal path (/publicaciones) or anchor (#section) same tab"}
                  </span>
                </div>
              </div>

              {banner.posicion === 1 && (
                <div className="grid sm:grid-cols-2 gap-4 pl-0 sm:pl-[44px]">
                  <div className="space-y-2">
                    <span className={labelCls}>{fieldLabel("Botón 2 — Texto", "Button 2 — Label", lang)}</span>
                    <input type="text" className={inputCls + " h-[42px]"} maxLength={100} value={lang === "es" ? (banner.btn2_label_es ?? "") : (banner.btn2_label_en ?? "")} onChange={e => updateField(banner.id, lang === "es" ? "btn2_label_es" : "btn2_label_en", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <span className={labelCls}>{fieldLabel("Botón 2 — Enlace", "Button 2 — Link", lang)}</span>
                    <input type="text" className={inputCls + " h-[42px]"} maxLength={500} placeholder="https://... · /ruta · #ancla" value={banner.btn2_href ?? ""} onChange={e => updateField(banner.id, "btn2_href", e.target.value)} />
                    <span className="text-[10.5px] text-[color:var(--muted-foreground)] font-[family-name:var(--font-cond)]">
                      {lang === "es"
                        ? "URL externa (https://...) abre en nueva pestaña · ruta interna (/publicaciones) o ancla (#seccion) en la misma"
                        : "External URL (https://...) opens new tab · internal path (/publicaciones) or anchor (#section) same tab"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pl-0 sm:pl-[44px]">
                <BrandButton type="button" variant="navy" onClick={() => saveTextos(banner)} disabled={savingId === banner.id}>
                  <Send className="w-4 h-4" />
                  {savingId === banner.id
                    ? (lang === "es" ? "Guardando..." : "Saving...")
                    : (lang === "es" ? "Guardar textos" : "Save texts")}
                </BrandButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {uploadModal?.open && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
          <div className="bg-white rounded-xl border-2 p-5 w-full max-w-md" style={{borderColor:"var(--brand-line)"}}>
            <div className="text-[16px] font-bold font-[family-name:var(--font-cond)] uppercase mb-3" style={{color:"var(--brand-navy)"}}>
              {lang === "es" ? "Subir contenido" : "Upload content"}
            </div>
            <div className="grid gap-3">
              <button type="button" onClick={() => { const idx = banners.findIndex(b=>b.id===uploadModal.bannerId); const el = fileRefs.current[idx]; el?.click(); setUploadModal(null); }} className="h-11 rounded-lg border-2 font-bold uppercase text-[12px] font-[family-name:var(--font-cond)] hover:bg-[color:var(--brand-mist)]" style={{borderColor:"var(--brand-line)",color:"var(--brand-navy)"}}>
                {lang === "es" ? "Subir archivo imagen o video" : "Upload image or video file"}
              </button>
              <div className="text-[12px] text-center text-[color:var(--muted-foreground)]">— {lang === "es" ? "o" : "or"} —</div>
              <input type="text" value={linkInput} onChange={e=>setLinkInput(e.target.value)} placeholder={lang==="es"?"https://youtu.be/... o vimeo.com/...":"https://youtu.be/... or vimeo.com/..."} className={inputCls+" h-[42px]"} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={()=>setUploadModal(null)} className="h-10 px-4 rounded-lg border-2 text-[12px] font-bold uppercase" style={{borderColor:"var(--brand-line)"}}>{lang==="es"?"Cancelar":"Cancel"}</button>
                <BrandButton type="button" variant="navy" onClick={async ()=>{
                  const bannerId = uploadModal.bannerId;
                  const url = linkInput.trim();
                  if(!url){ showMsg(lang==="es"?"Ingresa un link":"Enter a link"); return; }
                  const ok = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/i.test(url);
                  if(!ok){ showMsg(lang==="es"?"Link no válido":"Invalid link"); return; }
                  setBanners(prev=>prev.map(b=>b.id===bannerId? {...b, video_url:url}:b));
                  await apiPut(`/banners/textos/${bannerId}`, { idioma: lang, video_url: url });
                  setUploadModal(null);
                  showMsg(lang==="es"?"Link guardado":"Link saved");
                }}>
                  {lang==="es"?"Guardar link":"Save link"}
                </BrandButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
