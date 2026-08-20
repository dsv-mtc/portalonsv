import { YoutubeVideosManager } from "../components/YoutubeVideosManager";

export function EducacionVial() {
  return (
    <YoutubeVideosManager
      title="Educación Vial"
      eyebrow="Videos administrables"
      description="Videos de YouTube de webinars y capacitaciones del portal público. La miniatura se obtiene automáticamente del video."
      secciones={[
        { key: "webinars", label: "Webinars" },
        { key: "capacitaciones", label: "Capacitaciones" },
      ]}
    />
  );
}
