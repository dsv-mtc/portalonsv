-- Renombra la columna "descripcion" a "enlace" en la tabla "programa".
-- El campo ahora almacena una URL web a la que se redirige al elegir el programa
-- en el dropdown público (navbar). Si está vacío, se mantiene el comportamiento
-- por defecto (vista interna /programas/:slug).
--
-- Compatible con MySQL 5.7+ y MariaDB. Mantiene el tipo TEXT y la nulabilidad
-- heredada de la columna original (TEXT NOT NULL por defecto, según
-- entornos_viales.descripcion_es). Si la columna admite NULL, el CHANGE
-- conserva ese atributo; en caso contrario se mantiene NOT NULL con DEFAULT ''.

ALTER TABLE programa
  CHANGE COLUMN descripcion enlace TEXT;
