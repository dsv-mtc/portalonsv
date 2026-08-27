-- Migración: todos los usuarios pasan a rol Administrador (roles ocultos en panel)
-- Ejecutar en DBeaver / MySQL. No borra filas de user_role, solo reasigna users.
SET @adminId := (SELECT id FROM user_role WHERE LOWER(TRIM(value)) = 'administrador' LIMIT 1);
-- Si @adminId es NULL, descomenta la siguiente línea y re-ejecuta el bloque:
-- INSERT INTO user_role (value) VALUES ('administrador');

UPDATE users u
CROSS JOIN (SELECT id AS aid FROM user_role WHERE LOWER(TRIM(value)) = 'administrador' LIMIT 1) t
SET u.idUserRole = t.aid
WHERE u.idUserRole <> t.aid OR u.idUserRole IS NULL;

-- Verificación: todos deben salir como Administrador
-- SELECT u.id, u.user, ur.value AS rol FROM users u JOIN user_role ur ON ur.id = u.idUserRole ORDER BY u.id;
