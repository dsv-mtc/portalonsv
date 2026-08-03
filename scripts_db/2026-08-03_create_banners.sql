-- Crea la tabla banners (imágenes del carrusel/banner principal) y su seed inicial.
-- Origen: se ejecutó manualmente vía `node -e` en local; se versiona ahora para
-- poder aplicarlo en la BD del servidor de desarrollo y sincronizar con el equipo.
USE onsv;

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  posicion INT NOT NULL,
  archivo VARCHAR(500) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO banners (posicion, archivo) VALUES
  (1, '/assets/banner1.png'),
  (2, '/assets/banner2.png'),
  (3, '/assets/banner3.png');