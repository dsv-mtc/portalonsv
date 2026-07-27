import { useState, useEffect } from "react";
import { ToggleLeft, ToggleRight, Loader, ChevronLeft, ChevronRight } from "lucide-react";
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
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-[color:var(--brand-line)]">
            <button onClick={() => fetchPage(page - 1)} disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.04em] font-[family-name:var(--font-cond)] border transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              Página {page} de {pages}
            </span>
            <button onClick={() => fetchPage(page + 1)} disabled={page >= pages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.04em] font-[family-name:var(--font-cond)] border transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--brand-line)", color: "var(--brand-navy)" }}>
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
