CREATE TABLE IF NOT EXISTS revistas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  tema VARCHAR(100),
  imagen_url VARCHAR(500),
  pdf_url VARCHAR(500),
  esta_activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO revistas (titulo, slug, tema, imagen_url, pdf_url, esta_activo) VALUES
('Economía', 'economia', 'Economía', '/revistas/economia.jpg', '/revistas/economia.pdf', 1),
('Derecho PUCP', 'derecho-pucp', 'Derecho', '/revistas/derecho-pucp.jpg', '/revistas/derecho-pucp.pdf', 1),
('Revista de Psicología', 'revista-de-psicologia', 'Psicología', '/revistas/revista-de-psicologia.jpg', '/revistas/revista-de-psicologia.pdf', 1),
('Anthropologica', 'anthropologica', 'Antropología', '/revistas/anthropologica.jpg', '/revistas/anthropologica.pdf', 1),
('Kawsaypacha: Sociedad y Medio Ambiente', 'kawsaypacha', 'Medio Ambiente', '/revistas/kawsaypacha.jpg', '/revistas/kawsaypacha.pdf', 1),
('Educación', 'educacion', 'Educación', '/revistas/educacion.jpg', '/revistas/educacion.pdf', 1);
