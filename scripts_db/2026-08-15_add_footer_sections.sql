-- Agrega y carga las secciones administrables del footer.
-- Cada fila representa una sección con su nombre y enlace.

ALTER TABLE footer
  ADD COLUMN IF NOT EXISTS seccion VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS enlace VARCHAR(500) NULL;

INSERT INTO footer (seccion, enlace)
SELECT 'Publicaciones', '/publicaciones'
WHERE NOT EXISTS (
  SELECT 1 FROM footer
  WHERE seccion = 'Publicaciones' AND enlace = '/publicaciones'
);

INSERT INTO footer (seccion, enlace)
SELECT 'Datos abiertos', '/datosabiertos'
WHERE NOT EXISTS (
  SELECT 1 FROM footer
  WHERE seccion = 'Datos abiertos' AND enlace = '/datosabiertos'
);

INSERT INTO footer (seccion, enlace)
SELECT 'Normas legales', '/normas-legales'
WHERE NOT EXISTS (
  SELECT 1 FROM footer
  WHERE seccion = 'Normas legales' AND enlace = '/normas-legales'
);
