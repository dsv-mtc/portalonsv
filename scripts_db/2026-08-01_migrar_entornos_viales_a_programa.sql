-- Migración: los programas que antes se guardaban en entornos_viales ahora viven en la tabla `programa`.
-- Se borran los 3 registros previos de programa (Programa Nacional 1/2/3) y se reemplazan
-- por los datos migrados desde entornos_viales. La tabla entornos_viales se conserva sin usar.
--
-- Mapeo:
--   id              <- id (se conserva para no romper slugs /programas/{slug})
--   codigo          <- slug derivado del título (varchar 20 NOT NULL)
--   nombre          <- titulo_es
--   descripcion     <- descripcion_es
--   estaActivo      <- activo
--   fechaRegistro/Actualizacion <- NOW()
--   idObjetivo, idIndicador, periodoInicio, periodoFin, usuarios <- NULL
--
-- Nota: la tabla `objetivo` (legacy, sin uso en el portal) referencia con FK
-- (idPlanIncentivo) los ids 1-3 que se van a borrar; se eliminan esas filas
-- huérfanas para poder ejecutar el DELETE.

DELETE FROM objetivo WHERE idPlanIncentivo IN (SELECT id FROM programa);

DELETE FROM programa;

INSERT INTO programa (id, codigo, nombre, descripcion, estaActivo, fechaRegistro, fechaActualizacion)
SELECT
  ev.id,
  LEFT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(ev.titulo_es), ' ', '-'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 20) AS codigo,
  ev.titulo_es,
  ev.descripcion_es,
  ev.activo,
  NOW(),
  NOW()
FROM entornos_viales ev
ORDER BY ev.id;

-- La tabla entornos_viales queda vacía (ya no se usa; los programas viven en `programa`).
TRUNCATE TABLE entornos_viales;
