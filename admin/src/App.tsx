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
import { ComunicacionesRevistas } from "./pages/ComunicacionesRevistas";
import { DatosAbiertos } from "./pages/DatosAbiertos";
import { DatosAbiertosCategorias } from "./pages/DatosAbiertosCategorias";
import { DatosAbiertosTipos } from "./pages/DatosAbiertosTipos";
import { Usuarios } from "./pages/Usuarios";

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
          <Route path="comunicaciones-revistas" element={<ComunicacionesRevistas />} />
          <Route path="datos" element={<DatosAbiertos />} />
          <Route path="datos-categorias" element={<DatosAbiertosCategorias />} />
          <Route path="datos-tipos" element={<DatosAbiertosTipos />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
