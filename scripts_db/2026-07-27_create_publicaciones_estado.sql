CREATE TABLE IF NOT EXISTS publicaciones_estado (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ghost_id VARCHAR(50) NOT NULL,
  tipo ENUM('noticias','publicaciones','normas-legales','notas-prensa') NOT NULL,
  habilitado TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_ghost_tipo (ghost_id, tipo)
);
