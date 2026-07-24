-- Migración: crear tabla catálogo tipos_revista + FK en revistas
-- Ejecutar en phpMyAdmin / MySQL Workbench antes de desplegar el código nuevo.

-- 1. Crear tabla catálogo de tipos de revista
CREATE TABLE IF NOT EXISTS tipos_revista (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value VARCHAR(100) NOT NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Sembrar los 6 temas iniciales (basado en el array TEMAS hardcodeado del frontend)
INSERT INTO tipos_revista (value, isActive) VALUES
  ('Economía', 1),
  ('Derecho', 1),
  ('Psicología', 1),
  ('Antropología', 1),
  ('Medio Ambiente', 1),
  ('Educación', 1);

-- 3. Añadir columna FK en revistas (NULL inicialmente, preserva la columna tema por historial)
ALTER TABLE revistas ADD COLUMN idTemaRevista INT NULL;

-- 4. Migrar datos existentes: poblar idTemaRevista con el id del tema que coincida con el string de la columna tema
UPDATE revistas r
JOIN tipos_revista t ON r.tema = t.value
SET r.idTemaRevista = t.id;

-- Nota: la columna tema (string) se mantiene por compatibilidad/historial.
-- Se deja de usar en el código nuevo; idTemaRevista es la fuente de verdad.
