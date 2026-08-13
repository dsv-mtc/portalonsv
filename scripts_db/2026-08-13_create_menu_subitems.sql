-- Subitems del navbar administrables (Quiénes somos, Comunicaciones, Publicaciones, Educación Vial).
-- Reemplaza los arrays hardcodeados de createMenu por datos en BD (bilingüe ES/EN).
USE onsv;

CREATE TABLE IF NOT EXISTS menu_subitems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seccion VARCHAR(30) NOT NULL COMMENT 'quienes-somos | comunicaciones | publicaciones | educacion-vial',
  orden INT NOT NULL DEFAULT 0,
  label_es VARCHAR(200) NOT NULL DEFAULT '',
  label_en VARCHAR(200) NOT NULL DEFAULT '',
  url VARCHAR(500) NOT NULL DEFAULT '',
  external TINYINT NOT NULL DEFAULT 0 COMMENT '1 = abrir en nueva pestana (target=_blank)',
  isActive TINYINT NOT NULL DEFAULT 1,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_seccion_orden (seccion, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: Quiénes somos (ES/EN)
INSERT INTO menu_subitems (seccion, orden, label_es, label_en, url, external, isActive) VALUES
('quienes-somos', 1, '¿Quienes somos?', 'Who we are?', '/quienes-somos#quienes-somos', 0, 1),
('quienes-somos', 2, 'Misión', 'Mission', '/quienes-somos#mision', 0, 1),
('quienes-somos', 3, 'Visión', 'Vision', '/quienes-somos#vision', 0, 1),
('quienes-somos', 4, 'Valores', 'Values', '/quienes-somos#valores', 0, 1),
('quienes-somos', 5, 'Componentes Tecnológicos', 'Tech Components', '/quienes-somos#componentes', 0, 1);

-- Seed: Comunicaciones
INSERT INTO menu_subitems (seccion, orden, label_es, label_en, url, external, isActive) VALUES
('comunicaciones', 1, 'Noticias', 'News', '/comunicaciones/noticias', 0, 1),
('comunicaciones', 2, 'Nota de prensa', 'Press release', '/comunicaciones/nota-prensa', 0, 1),
('comunicaciones', 3, 'Eventos', 'Events', '/comunicaciones/eventos', 0, 1);

-- Seed: Publicaciones
INSERT INTO menu_subitems (seccion, orden, label_es, label_en, url, external, isActive) VALUES
('publicaciones', 1, 'Publicaciones', 'Publications', '/publicaciones', 0, 1),
('publicaciones', 2, 'Revistas', 'Journals', '/revistas', 0, 1);

-- Seed: Educación Vial
INSERT INTO menu_subitems (seccion, orden, label_es, label_en, url, external, isActive) VALUES
('educacion-vial', 1, 'Webinars', 'Webinars', '/webinars', 0, 1),
('educacion-vial', 2, 'Capacitaciones', 'Trainings', '/capacitaciones', 0, 1),
('educacion-vial', 3, 'peru-in-world', 'PERU-IN-world', '/peru-in-world', 1, 1),
('educacion-vial', 4, 'Aula Virtual', 'Virtual Room', 'https://aulavirtual.mtc.gob.pe/seguridadvial/', 1, 1);