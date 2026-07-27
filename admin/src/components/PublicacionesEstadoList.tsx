import { useState, useEffect } from "react";
import { ToggleLeft, ToggleRight, Loader, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { api, apiPut } from "../lib/api";

type GhostPost = { id: string; title: string; published_at: string; habilitado: boolean };

export function PublicacionesEstadoList({ tipo, title, eyebrow }: { tipo: string; title: string; eyebrow: string }) {
  const [items, setItems] = useState<GhostPost[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const fetchPage = async (p: number) => {
    const res = await api<any>(`/publicaciones-estado?tipo=${tipo}&page=${p}`);
    if (res.success) {
      setItems(res.data || []);
      setPage(res.pagination?.page || 1);
      setPages(res.pagination?.pages || 1);
    }
  };

  useEffect(() => { fetchPage(1); }, [tipo]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const toggle = async (post: GhostPost) => {
    setToggling(post.id);
    const r = await apiPut("/publicaciones-estado", { ghost_id: post.id, tipo, habilitado: !post.habilitado });
    if (r.success) {
      setItems(prev => prev.map(p => p.id === post.id ? { ...p, habilitado: !p.habilitado } : p));
      setMsg(r.message || "Estado actualizado");
    }
    setToggling(null);
  };

  return (
    <>
      <PageHeader title={title} eyebrow={eyebrow} />
      {msg && <div className="mb-4 p-3 rounded-lg bg-[#e8f5ec] text-[#1f7a44] text-[13px] font-semibold">{msg}</div>}

      <section className="rounded-2xl border border-[color:var(--brand-line)] bg-white" style={{ boxShadow: "var(--shadow-brand)" }}>
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[color:var(--brand-line)]">
          <h3 className="text-[17px] uppercase text-[color:var(--brand-navy)] tracking-tight font-[family-name:var(--font-display)] font-bold">
            {title}
          </h3>
        </header>
        <div className="p-0">
          {items.length === 0 ? (
            <p className="p-5 text-[13px] text-center" style={{ color: "var(--muted-foreground)" }}>No se encontraron publicaciones.</p>
          ) : (
            <div className="divide-y divide-[color:var(--brand-line)]">
              {items.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#f8fafc] transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate" style={{ color: "var(--brand-navy)" }}>{post.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(post.published_at).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <button onClick={() => toggle(post)} disabled={toggling === post.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] uppercase font-bold tracking-[0.04em] font-[family-name:var(--font-cond)] border transition cursor-pointer shrink-0"
                    style={{
                      background: post.habilitado ? "#dcfce7" : "#f1f5f9",
                      color: post.habilitado ? "#166534" : "#475569",
                      borderColor: post.habilitado ? "#bbf7d0" : "#e2e8f0",
                    }}>
                    {toggling === post.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : post.habilitado ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {post.habilitado ? "Habilitado" : "Deshabilitado"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <style>{`
          .pag-btn-t { width:42px; height:42px; border-radius:10px; border:1px solid transparent; background:transparent; color:#1d3557; font-weight:700; font-size:17px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all .3s ease; }
          .pag-btn-t:hover { border-color:#C8102E; color:#C8102E; }
          .pag-btn-t.active { background:#C8102E; color:#fff; border-color:transparent; }
          .pag-btn-t:disabled { opacity:0.3; cursor:not-allowed; }
          .pag-btn-t:disabled:hover { border-color:transparent; color:#1d3557; }
        `}</style>
        {pages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-1.5">
            <button type="button" aria-label="Primera página" onClick={() => fetchPage(1)} disabled={page <= 1} className="pag-btn-t"><ChevronsLeft className="w-4 h-4" /></button>
            <button type="button" aria-label="Página anterior" onClick={() => fetchPage(page - 1)} disabled={page <= 1} className="pag-btn-t"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} type="button" aria-label={`Página ${p}`} onClick={() => fetchPage(p)}
                className={`pag-btn-t${p === page ? " active" : ""}`}>{p}</button>
            ))}
            <button type="button" aria-label="Página siguiente" onClick={() => fetchPage(page + 1)} disabled={page >= pages} className="pag-btn-t"><ChevronRight className="w-4 h-4" /></button>
            <button type="button" aria-label="Última página" onClick={() => fetchPage(pages)} disabled={page >= pages} className="pag-btn-t"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        )}
      </section>
    </>
  );
}
