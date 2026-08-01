-- Desactiva menús de prueba del módulo analítica para que no
-- aparezcan en la vista pública /analitica (ahora dinámica desde BD).
UPDATE menu SET estaActivo = 0 WHERE id IN (4, 5, 8, 9, 12, 20, 21, 29);
