ALTER TABLE parametro
  ADD COLUMN fuente_siniestro VARCHAR(200) DEFAULT '2025 · Fuente PNP' AFTER mensaje2,
  ADD COLUMN porcentaje_siniestro VARCHAR(100) DEFAULT '+20.3% vs 2024' AFTER fuente_siniestro,
  ADD COLUMN fuente_lesiones VARCHAR(200) DEFAULT '2025 · Fuente PNP' AFTER porcentaje_siniestro,
  ADD COLUMN porcentaje_lesiones VARCHAR(100) DEFAULT '+20.3% vs 2024' AFTER fuente_lesiones,
  ADD COLUMN fuente_muertes VARCHAR(200) DEFAULT '2025 · Fuente PNP' AFTER porcentaje_lesiones,
  ADD COLUMN porcentaje_muertes VARCHAR(100) DEFAULT '+20.3% vs 2024' AFTER fuente_muertes;
