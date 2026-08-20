-- Agrega los datos necesarios para mostrar el detalle visual de cada programa.
-- La columna enlace ya existe y se reutiliza como enlace web.

ALTER TABLE programa
  ADD COLUMN descripcion TEXT NULL AFTER nombre,
  ADD COLUMN imagen VARCHAR(500) NULL AFTER enlace;
