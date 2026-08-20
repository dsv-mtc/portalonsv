USE onsv;

CREATE TABLE IF NOT EXISTS componentes_tecnologicos (
	id INT AUTO_INCREMENT PRIMARY KEY,
	idioma VARCHAR(2) NOT NULL COMMENT 'ES | EN',
	orden INT NOT NULL DEFAULT 0 COMMENT 'Posicion en el carrusel',
	titulo VARCHAR(2000),
	descripcion TEXT,
	link VARCHAR(500),
	icon TEXT NULL COMMENT 'SVG path opcional. Si es NULL, el controlador aplica fallback ciclico',
	external TINYINT NOT NULL DEFAULT 0 COMMENT '1 si el link es http(s) externo',
	create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX idx_idioma_orden (idioma, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migra los 9 componentes actuales desde pagina.seccionN (ES).
-- Mapeo: orden 1-4 usan seccion6-13 (titulo,desc), orden 5-9 usan seccion26-35.
-- Links: orden 1-9 usan seccion36-44.
INSERT INTO componentes_tecnologicos (idioma, orden, titulo, descripcion, link, external, icon)
SELECT 'ES', n.orden, n.titulo, n.descripcion, n.link, IF(n.link REGEXP '^https?://', 1, 0), NULL
FROM (
	SELECT seccion6  AS titulo, seccion7  AS descripcion, seccion36 AS link, 1 AS orden FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion8,  seccion9,  seccion37, 2 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion10, seccion11, seccion38, 3 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion12, seccion13, seccion39, 4 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion26, seccion27, seccion40, 5 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion28, seccion29, seccion41, 6 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion30, seccion31, seccion42, 7 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion32, seccion33, seccion43, 8 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion34, seccion35, seccion44, 9 FROM pagina WHERE idioma LIKE 'ES'
) n
WHERE n.titulo IS NOT NULL OR n.descripcion IS NOT NULL;

-- Migra los 9 componentes actuales desde pagina.seccionN (EN).
-- Nota: en EN los links historicamente se reusan desde ES (ver routes.js);
-- para mantener paridad, migrar los links desde el registro ES.
INSERT INTO componentes_tecnologicos (idioma, orden, titulo, descripcion, link, external, icon)
SELECT 'EN', n.orden, n.titulo, n.descripcion, n.link, IF(n.link REGEXP '^https?://', 1, 0), NULL
FROM (
	SELECT seccion6  AS titulo, seccion7  AS descripcion, 1 AS orden FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion8,  seccion9,  2 FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion10, seccion11, 3 FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion12, seccion13, 4 FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion26, seccion27, 5 FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion28, seccion29, 6 FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion30, seccion31, 7 FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion32, seccion33, 8 FROM pagina WHERE idioma LIKE 'EN'
	UNION ALL SELECT seccion34, seccion35, 9 FROM pagina WHERE idioma LIKE 'EN'
) n
LEFT JOIN (
	SELECT seccion36 AS link, 1 AS orden FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion37, 2 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion38, 3 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion39, 4 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion40, 5 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion41, 6 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion42, 7 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion43, 8 FROM pagina WHERE idioma LIKE 'ES'
	UNION ALL SELECT seccion44, 9 FROM pagina WHERE idioma LIKE 'ES'
) l ON l.orden = n.orden
SET n.link = COALESCE(l.link, n.link)
WHERE n.titulo IS NOT NULL OR n.descripcion IS NOT NULL;
