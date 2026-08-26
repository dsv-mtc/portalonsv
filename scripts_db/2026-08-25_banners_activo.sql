-- Agrega el flag de activación por banner: permite mostrar/ocultar cada slide
-- del carrusel desde el panel admin sin eliminar su configuración.
-- DEFAULT 1 => los banners existentes quedan activos.
USE onsv;

ALTER TABLE banners
  ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER archivo;
