import { YoutubeVideosManager } from "../components/YoutubeVideosManager";

export function YoutubeVideos() {
  return (
    <YoutubeVideosManager
      title="YouTube"
      eyebrow="Videos administrables"
      description="Videos de YouTube que se muestran en la home del portal público. La miniatura se obtiene automáticamente del video."
      secciones={[{ key: "home", label: "Home" }]}
    />
  );
}
