-- Migración: añadir columna estaActivo a la tabla files (datos abiertos)
-- Ejecutar en phpMyAdmin / MySQL Workbench antes de desplegar el código nuevo.

ALTER TABLE files ADD COLUMN estaActivo TINYINT(1) NOT NULL DEFAULT 1;
