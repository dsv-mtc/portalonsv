const rateLimit = require('express-rate-limit');

// Anti fuerza bruta en el login del panel admin
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    max: 10,                  // máx. 10 intentos por IP en la ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos de inicio de sesión. Inténtelo en 15 minutos.' }
});

// Límite genérico para formularios públicos (contacto, suscripción, webhooks)
const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas solicitudes. Inténtelo más tarde.' }
});

module.exports = { loginLimiter, formLimiter };
