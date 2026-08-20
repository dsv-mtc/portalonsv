-- Convierte la tabla popup (fila única) a un carrusel de slides.
-- - La tabla ya posee id (PK auto_increment); solo se agrega 'posicion'.
-- - 'estado' es global (activa/desactiva el popup completo) y se aplica a todas las filas.
-- - El script es idempotente: si 'posicion' ya existe, no falla.
USE onsv;

-- Backup de seguridad (verifica/revierte en cualquier momento)
CREATE TABLE IF NOT EXISTS popup_bak AS SELECT * FROM popup;

-- Agregar posicion solo si no existe
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'popup' AND COLUMN_NAME = 'posicion') = 0,
  'ALTER TABLE popup ADD COLUMN posicion INT NOT NULL DEFAULT 1 AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE popup SET posicion = id;

-- Verificación: la fila original debe quedar como slide #1 con sus datos intactos
SELECT id, posicion, imagen, enlace, estado FROM popup;
