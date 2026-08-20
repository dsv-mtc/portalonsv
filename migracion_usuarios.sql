-- Migración: añadir columna estaActivo a la tabla users
ALTER TABLE users ADD COLUMN estaActivo TINYINT(1) NOT NULL DEFAULT 1;