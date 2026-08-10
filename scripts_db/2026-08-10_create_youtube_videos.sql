USE onsv;

CREATE TABLE IF NOT EXISTS youtube_videos (
	id INT AUTO_INCREMENT PRIMARY KEY,
	seccion VARCHAR(20) NOT NULL COMMENT 'home | webinars | capacitaciones',
	titulo VARCHAR(200) NOT NULL,
	descripcion TEXT,
	video_url VARCHAR(500) NOT NULL COMMENT 'URL completa de YouTube (youtu.be/ID, watch?v=ID, embed/ID, shorts/ID)',
	create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX idx_seccion (seccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
