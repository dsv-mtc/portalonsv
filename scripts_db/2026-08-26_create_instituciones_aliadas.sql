-- Crea tabla instituciones aliadas para sección de la home
USE onsv;

CREATE TABLE IF NOT EXISTS instituciones_aliadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  enlace VARCHAR(500) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  activo TINYINT NOT NULL DEFAULT 1,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed inicial con logos existentes
INSERT INTO instituciones_aliadas (nombre, enlace, logo_url, activo) VALUES
('SAMU','https://www.gob.pe/1013-solicitar-atencion-medida-en-caso-de-emergencia.samu','/img/logosamu.png',1),
('PNP','https://www.gob.pe/pnp','/img/logo-PNP.png',1),
('CGBVP','http://www.bomberosperu.gob.pe','/img/logobombero.png',1),
('Ministerio Público','https://www.gob.pe/mpfn','/img/logomp.png',1),
('ATU','https://www.gob.pe/atu','/img/logoatu.png',1),
('SUTRAN','https://www.gob.pe/sutran','/img/logo-sutran.png',1),
('Ministerio de Justicia','https://www.gob.pe/minjus','/img/minjus.png',1),
('Ministerio del Interior','https://www.gob.pe/mininter','/img/PCM-Interior.png',1),
('Ministerio de Salud','https://www.gob.pe/minsa','/img/minsa.png',1);
