const routes = require('express').Router();
const orvProxy = require('./api/orv-proxy');

routes.use('/api', orvProxy);
routes.use('/consejo-regional', require("./consejoRegionalRoutes"));
routes.use('/administrador', require("./admin/routes"));
routes.use('/administrador/api', require("./admin/api"));

// ... resto de las rutas existentes

module.exports = routes;