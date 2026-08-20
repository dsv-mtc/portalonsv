-- Migración: crear tabla redes_sociales
CREATE TABLE redes_sociales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  red VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  imagen_url VARCHAR(500) DEFAULT NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;