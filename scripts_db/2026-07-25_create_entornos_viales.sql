-- Tabla para el módulo Programas -> Entornos Viales
-- Tarjetas editables desde el panel admin, mostradas en /entornos-viales del portal público.

CREATE TABLE IF NOT EXISTS entornos_viales (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  badge_es     VARCHAR(50)  NOT NULL DEFAULT '',
  badge_en     VARCHAR(50)  NOT NULL DEFAULT '',
  titulo_es    VARCHAR(255) NOT NULL DEFAULT '',
  titulo_en    VARCHAR(255) NOT NULL DEFAULT '',
  descripcion_es TEXT NOT NULL,
  descripcion_en TEXT NOT NULL,
  imagen_url   VARCHAR(500) DEFAULT '',
  activo       TINYINT(1)   NOT NULL DEFAULT 1,
  orden        INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Valores iniciales equivalentes a las 3 tarjetas hoy hardcodeadas en entornos-viales.hbs
-- (sin imagen_url: la versión pública actual usa gradient css; el admin puede subir imágenes luego)
INSERT INTO entornos_viales (badge_es, badge_en, titulo_es, titulo_en, descripcion_es, descripcion_en, imagen_url, activo, orden) VALUES
('Corredores', 'Corredores', 'Corredores de alto tránsito', 'High-traffic corridors',
 'Intervención en vías de mayor siniestralidad con acciones de fiscalización, fiscalización electrónica, y mejoras de infraestructura para reducir el riesgo de todas y todos los usuarios de la vía.',
 'Intervention on roads with the highest accident rates through enforcement, electronic enforcement, and infrastructure improvements to reduce the risk for all road users.',
 '', 1, 1),
('Usuarios', 'Usuarios', 'Protección de usuarios vulnerables', 'Protection of vulnerable road users',
 'Peatones, ciclistas y motociclistas son los más expuestos. Se implementan pasos seguros, ciclovías, reductores de velocidad, y campañas de concientización.',
 'Pedestrians, cyclists, and motorcyclists are the most exposed. Safe crossings, bike lanes, speed reducers, and awareness campaigns are implemented.',
 '', 1, 2),
('Ciudades', 'Ciudades', 'Movilidad urbana sostenible', 'Sustainable urban mobility',
 'Entornos que reducen emisiones y riesgo, priorizando al peatón y al transporte público en zonas urbanas.',
 'Environments that reduce emissions and risk, prioritizing pedestrians and public transport in urban areas.',
 '', 1, 3);
