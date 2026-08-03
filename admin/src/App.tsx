import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Cifras } from "./pages/Cifras";
import { PiePagina } from "./pages/PiePagina";
import { MisionVision } from "./pages/MisionVision";
import { Popup } from "./pages/Popup";
import { Regiones } from "./pages/Regiones";
import { AnaliticaMenu } from "./pages/AnaliticaMenu";
import { AnaliticaSubmenu } from "./pages/AnaliticaSubmenu";
import { Comunicaciones } from "./pages/Comunicaciones";
import { PublicacionesRevistas } from "./pages/PublicacionesRevistas";
import { Noticias } from "./pages/Noticias";
import { NotasPrensa } from "./pages/NotasPrensa";
import { Contenidos } from "./pages/Contenidos";
import { NormasLegales } from "./pages/NormasLegales";
import { DatosAbiertos } from "./pages/DatosAbiertos";
import { DatosAbiertosCategorias } from "./pages/DatosAbiertosCategorias";
import { DatosAbiertosTipos } from "./pages/DatosAbiertosTipos";
import { Usuarios } from "./pages/Usuarios";
import { Programas } from "./pages/Programas";
import { Banners } from "./pages/Banners";

export default function App() {
  return (
    <BrowserRouter basename="/administrador">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="cifras" element={<Cifras />} />
          <Route path="pie" element={<PiePagina />} />
          <Route path="mision" element={<MisionVision />} />
          <Route path="popup" element={<Popup />} />
          <Route path="regiones" element={<Regiones />} />
          <Route path="analitica" element={<AnaliticaMenu />} />
          <Route path="analitica-submenu" element={<AnaliticaSubmenu />} />
          <Route path="comunicaciones" element={<Comunicaciones />} />
          <Route path="comunicaciones-noticias" element={<Noticias />} />
          <Route path="comunicaciones-notas-prensa" element={<NotasPrensa />} />
          <Route path="publicaciones-contenidos" element={<Contenidos />} />
          <Route path="publicaciones-revistas" element={<PublicacionesRevistas />} />
          <Route path="normas-legales" element={<NormasLegales />} />
          <Route path="datos" element={<DatosAbiertos />} />
          <Route path="datos-categorias" element={<DatosAbiertosCategorias />} />
          <Route path="datos-tipos" element={<DatosAbiertosTipos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="programas" element={<Programas />} />
          <Route path="banners" element={<Banners />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
