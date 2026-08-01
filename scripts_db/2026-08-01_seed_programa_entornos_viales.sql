-- Crea el programa "Entornos Viales" como un programa independiente más
-- (aparecerá en el dropdown Programas del navbar con página propia).
INSERT INTO entornos_viales (badge_es, badge_en, titulo_es, titulo_en, descripcion_es, descripcion_en, imagen_url, activo, orden, created_at)
SELECT 'Programa', '', 'Entornos Viales', '', '', '', '', 1, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM entornos_viales WHERE LOWER(titulo_es) = 'entornos viales');
