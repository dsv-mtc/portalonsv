-- Asigna el enlace interno de "Orientación a Víctimas" para que, al elegir esa
-- opción en el dropdown público, se redirija a su página dedicada (la rama
-- especial en routes/routes.js:485 renderiza views/pages/programa-orientacion-victimas.hbs).
-- El código de la fila se estableció en el seed 2026-08-05 como 'orientacion-victimas'.

UPDATE programa
SET enlace = '/programas/orientacion-a-victimas'
WHERE LOWER(codigo) = 'orientacion-victimas';
