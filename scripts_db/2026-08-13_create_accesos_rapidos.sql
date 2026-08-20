-- Crea la tabla accesos_rapidos (tarjetas bajo el mapa de siniestros viales en la home).
-- Textos bilingües ES/EN, editable desde el panel admin (imagen, textos y enlace del botón).
USE onsv;

CREATE TABLE IF NOT EXISTS accesos_rapidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idioma VARCHAR(2) NOT NULL COMMENT 'ES | EN',
  orden INT NOT NULL DEFAULT 0 COMMENT 'Posicion de la tarjeta (1 y 2)',
  eyebrow VARCHAR(200),
  titulo VARCHAR(500),
  descripcion TEXT,
  texto_boton VARCHAR(200),
  enlace_boton VARCHAR(500),
  external TINYINT NOT NULL DEFAULT 0 COMMENT '1 si el enlace es http(s) externo',
  imagen VARCHAR(500),
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_idioma_orden (idioma, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed ES (tarjetas actuales de la home)
INSERT INTO accesos_rapidos (idioma, orden, eyebrow, titulo, descripcion, texto_boton, enlace_boton, external, imagen)
SELECT 'ES', 1, 'Formación', 'Educación Vial', 'Webinars, capacitaciones y aula virtual para fortalecer la cultura de seguridad vial en todo el país.', 'Ir al aula virtual', 'https://aulavirtual.mtc.gob.pe/seguridadvial/', 1, '/img/fondo-educacion.png'
WHERE NOT EXISTS (SELECT 1 FROM accesos_rapidos WHERE idioma = 'ES' AND orden = 1);

INSERT INTO accesos_rapidos (idioma, orden, eyebrow, titulo, descripcion, texto_boton, enlace_boton, external, imagen)
SELECT 'ES', 2, 'Publicación', 'Revista Institucional', 'Análisis, investigación y buenas prácticas de seguridad vial en una edición periódica del Observatorio.', 'Ver ediciones', '/revistas', 0, '/img/fondo-revista.png'
WHERE NOT EXISTS (SELECT 1 FROM accesos_rapidos WHERE idioma = 'ES' AND orden = 2);

-- Seed EN (traducciones tomadas de utils/locales/en.json)
INSERT INTO accesos_rapidos (idioma, orden, eyebrow, titulo, descripcion, texto_boton, enlace_boton, external, imagen)
SELECT 'EN', 1, 'Training', 'Road Safety Education', 'Webinars, trainings and virtual classroom to strengthen road safety culture nationwide.', 'Go to virtual classroom', 'https://aulavirtual.mtc.gob.pe/seguridadvial/', 1, '/img/fondo-educacion.png'
WHERE NOT EXISTS (SELECT 1 FROM accesos_rapidos WHERE idioma = 'EN' AND orden = 1);

INSERT INTO accesos_rapidos (idioma, orden, eyebrow, titulo, descripcion, texto_boton, enlace_boton, external, imagen)
SELECT 'EN', 2, 'Publication', 'Institutional Journal', 'Analysis, research and road safety best practices in a periodic edition of the Observatory.', 'See editions', '/revistas', 0, '/img/fondo-revista.png'
WHERE NOT EXISTS (SELECT 1 FROM accesos_rapidos WHERE idioma = 'EN' AND orden = 2);
