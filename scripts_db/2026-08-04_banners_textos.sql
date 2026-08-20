-- Extiende la tabla banners con campos editables de textos y botones por idioma,
-- y siembra los textos actuales del carrusel (extraídos de views/index.hbs).
-- Convención: en BD se usa <em>palabra</em> para resaltado; el admin edita con *palabra*.
-- Los labels de botones se guardan SIN la flecha "→" (el portal la agrega al render).
-- btn2 solo aplica al banner 1 (único slide con 2 botones hoy).
USE onsv;

ALTER TABLE banners
  ADD COLUMN kicker_es      VARCHAR(200)  NULL,
  ADD COLUMN kicker_en      VARCHAR(200)  NULL,
  ADD COLUMN titulo_es      VARCHAR(500)  NULL,
  ADD COLUMN titulo_en      VARCHAR(500)  NULL,
  ADD COLUMN parrafo_es     VARCHAR(2000) NULL,
  ADD COLUMN parrafo_en     VARCHAR(2000) NULL,
  ADD COLUMN btn1_label_es  VARCHAR(100)  NULL,
  ADD COLUMN btn1_label_en  VARCHAR(100)  NULL,
  ADD COLUMN btn1_href      VARCHAR(500)  NULL,
  ADD COLUMN btn2_label_es  VARCHAR(100)  NULL,
  ADD COLUMN btn2_label_en  VARCHAR(100)  NULL,
  ADD COLUMN btn2_href      VARCHAR(500)  NULL;

-- Banner 1: 2 botones
UPDATE banners SET
  kicker_es  = 'Decenio de Acción 2021–2030',
  kicker_en  = 'Decade of Action 2021–2030',
  titulo_es  = 'Datos que <em>salvan vidas</em> en las vías del Perú',
  titulo_en  = 'Data that <em>saves lives</em> on Peru''s roads',
  parrafo_es = 'El Observatorio Nacional de Seguridad Vial sistematiza, analiza y difunde información sobre los siniestros viales para fortalecer las políticas de prevención.',
  parrafo_en = 'The National Road Safety Observatory systematizes, analyzes and disseminates information on road accidents to strengthen prevention policies.',
  btn1_label_es = 'Ver cifras 2025',
  btn1_label_en = 'See 2025 figures',
  btn1_href = '#siniestralidad',
  btn2_label_es = 'Mapa de Siniestros',
  btn2_label_en = 'Accidents Map',
  btn2_href = '#mapa'
WHERE posicion = 1;

-- Banner 2: 1 botón
UPDATE banners SET
  kicker_es  = 'Campaña vigente',
  kicker_en  = 'Current Campaign',
  titulo_es  = 'Entornos viales <em>seguros</em>',
  titulo_en  = 'Safe road <em>environments</em>',
  parrafo_es = 'Conoce las acciones para reducir la contaminación y el riesgo en corredores de alto tránsito.',
  parrafo_en = 'Learn about actions to reduce pollution and risk in high-traffic corridors.',
  btn1_label_es = 'Ver más',
  btn1_label_en = 'See more',
  btn1_href = '/publicaciones'
WHERE posicion = 2;

-- Banner 3: 1 botón externo
UPDATE banners SET
  kicker_es  = 'Aplicativo',
  kicker_en  = 'Application',
  titulo_es  = 'SRAT · Visor de alerta de <em>siniestros</em>',
  titulo_en  = 'SRAT · Accident <em>alert viewer</em>',
  parrafo_es = 'Monitoreo georreferenciado de los hechos de tránsito a nivel nacional, en tiempo cercano al real.',
  parrafo_en = 'Georeferenced monitoring of traffic incidents nationwide, in near real time.',
  btn1_label_es = 'Abrir visor',
  btn1_label_en = 'Open viewer',
  btn1_href = 'https://sratma.mtc.gob.pe/SRATMA/mapa/'
WHERE posicion = 3;
