-- Agrega soporte de video al carrusel de banners:
-- video_url = link externo (YouTube). El campo `archivo` existente pasa a
-- aceptar tambien archivos de video subidos desde PC (mp4/webm/mov) sin
-- cambio de esquema: se infiere el tipo por extension al renderizar.
-- Prioridad en home: video_url (embed YT) > archivo video (<video>) > imagen (como hoy).
USE onsv;

ALTER TABLE banners
  ADD COLUMN video_url VARCHAR(500) NULL AFTER archivo;
