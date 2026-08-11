const express = require('express');
const router = express.Router();
const logger = require('../controllers/logger');
const { formLimiter } = require('../controllers/rateLimit');

const GAS_WEBHOOK_URL = process.env.GAS_ORV_WEBHOOK_URL;

if (!GAS_WEBHOOK_URL) {
    logger.warn('GAS_ORV_WEBHOOK_URL no está configurado en .env');
}

router.post('/orv-form', formLimiter, async (req, res) => {
    if (!GAS_WEBHOOK_URL) {
        return res.status(500).json({ success: false, message: 'Servicio no configurado' });
    }

    try {
        const chunkSize = 100;
        const fields = ['NOMBRE', 'DNI', 'E-MAIL', 'MENSAJE'];
        const sanitized = {};

        for (const field of fields) {
            const value = req.body[field];
            if (value !== undefined && value !== null) {
                sanitized[field] = String(value).replace(/<[^>]*>/g, '').trim().substring(0, 500);
            }
        }

        const response = await fetch(GAS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                ...sanitized
            }),
        });

        if (!response.ok) {
            logger.error(`GAS webhook error: ${response.status}`);
            return res.status(502).json({ success: false, message: 'Error al enviar formulario' });
        }

        return res.json({ success: true });
    } catch (error) {
        logger.error('ORV form error:', error.message);
        return res.status(500).json({ success: false, message: 'Error de comunicación' });
    }
});

module.exports = router;