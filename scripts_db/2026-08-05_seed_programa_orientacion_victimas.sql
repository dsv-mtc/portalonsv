-- Crea el programa "Orientación a Víctimas" como un registro en la tabla programa
-- (aparecerá en el panel admin de Programas y en el listado público /entornos-viales).
-- El intercept en routes/routes.js:485 sigue sirviendo la vista dedicada para el detalle.
INSERT INTO programa (codigo, nombre, descripcion, estaActivo, fechaRegistro, fechaActualizacion)
SELECT 'orientacion-victimas', 'Orientación a Víctimas', '', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM programa WHERE LOWER(codigo) = 'orientacion-victimas');
