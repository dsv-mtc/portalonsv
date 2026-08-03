import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, Upload } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/UIBits";
import { apiGet, apiPut, apiUpload } from "../lib/api";

type Banner = { id: number; posicion: number; archivo: string };

export function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [msg, setMsg] = useState("");
  const [msgTimer, setMsgTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  return (
    <>
      <PageHeader title="Banners" eyebrow="Página principal" />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}
      <Panel title="Banners del carrusel">
        <div className="space-y-4">
          {banners.map((banner, i) => (
            <div key={banner.id} className="flex items-center gap-4 p-4 rounded-lg border-2 bg-white" style={{ borderColor: "var(--brand-line)" }}>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-lg border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30" style={{ borderColor: "var(--brand-line)" }}>
                  <ArrowUp className="w-4 h-4" style={{ color: "var(--brand-navy)" }} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === banners.length - 1} className="w-8 h-8 rounded-lg border grid place-items-center hover:bg-[color:var(--brand-mist)] transition disabled:opacity-30" style={{ borderColor: "var(--brand-line)" }}>
                  <ArrowDown className="w-4 h-4" style={{ color: "var(--brand-navy)" }} />
                </button>
              </div>
              <div className="w-[140px] h-[80px] rounded-lg overflow-hidden border" style={{ borderColor: "var(--brand-line)", background: "#f8fafc" }}>
                <img src={encodeURI(banner.archivo)} alt={`Banner ${banner.posicion}`} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold font-[family-name:var(--font-cond)] uppercase tracking-wide" style={{ color: "var(--brand-navy)" }}>Banner {banner.posicion}</div>
                <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{banner.archivo}</div>
              </div>
              <div className="flex-shrink-0">
                <input ref={el => { fileRefs.current[i] = el; }} type="file" accept="image/*" onChange={e => handleFile(banner.id, e)} className="hidden" />
                <button type="button" onClick={() => fileRefs.current[i]?.click()} className="h-10 px-4 rounded-lg border-2 text-[12px] font-bold uppercase tracking-wider font-[family-name:var(--font-cond)] inline-flex items-center gap-2 hover:bg-[color:var(--brand-mist)] transition" style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
                  <Upload className="w-3.5 h-3.5" /> Subir
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}