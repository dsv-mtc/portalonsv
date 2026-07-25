import { PageHeader } from "../components/PageHeader";

export function NormasLegales() {
  return (
    <>
      <PageHeader title="Normas Legales" eyebrow="Publicaciones" />
      <div className="rounded-2xl border border-[color:var(--brand-line)] bg-white p-10 text-center"
           style={{ boxShadow: "var(--shadow-brand)" }}>
        <p className="text-[14px]" style={{ color: "var(--brand-navy)" }}>
          Módulo en construcción. Próximamente: creación y edición de Normas Legales.
        </p>
      </div>
    </>
  );
}
