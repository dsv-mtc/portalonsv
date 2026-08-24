const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const routes = require("./routes/routes");
const { hbs } = require("./controllers/hbs");
const morgan = require("morgan");
const flash = require("connect-flash");
const session = require("express-session");
const campaigns = require("./controllers/campaigns");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const logger = require("./controllers/logger");
const { genKeyPair } = require("./utils/criptoUtils");
const helmet = require("helmet");
const mysqlClient = new (require("./api/mysql"));
const firestore = new (require('./api/gcp/FireStore'));



dotenv.config();
//check if keys exist
genKeyPair();



if (process.env.STRATEGY_MODE === 'GCP') {
    logger.debug("Trabajando en modo GCP");
    require("./api/passport");

}

if (process.env.STRATEGY_MODE === 'ON_PREMISE') {
    logger.debug("Trabajando en modeo On Premise");
    //calling database
    mysqlClient.getConnection();

    //calling passport
    require("./api/passport");
}




const app = express();
//Settings

app.engine("hbs", hbs.engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// --- Configuración de seguridad ---
const isProduction = process.env.NODE_ENV === 'production' || process.env.STRATEGY_MODE === 'GCP';
// Detrás de proxy (App Engine, load balancer): usa la IP real del cliente
app.set('trust proxy', 1);

// Fail-fast: un secreto de sesión débil permite forjar cookies
if (!process.env.SECRET_APPLICATION || process.env.SECRET_APPLICATION.length < 32) {
    throw new Error('SECRET_APPLICATION debe tener al menos 32 caracteres. Define una clave fuerte en el archivo .env');
}


//Usos
app.use(morgan(isProduction ? "combined" : "dev"));
//app.use(helmet());
app.use(cookieParser(process.env.SECRET_APPLICATION))
//Eliminar en producción
if (process.env.STRATEGY_MODE === 'GCP') {
    app.use(session({
        secret: process.env.SECRET_APPLICATION,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax'
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash()); // <--- MUEVELO AQUÍ
}

// Bloque ON_PREMISE
if (process.env.STRATEGY_MODE === 'ON_PREMISE') {
    app.use(session({
        secret: process.env.SECRET_APPLICATION,
        resave: false,
        saveUninitialized: false,
        store: mysqlClient.sessionStore(session),
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
}
//reference:https://expressjs.com/es/4x/api.html#express.static
const cspDirectives = {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    // NOTA: se mantiene 'unsafe-inline' en scriptSrc porque las vistas usan
    // scripts inline (gtag, carruseles). Quitarlo requiere migrar esos scripts.
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://connect.facebook.net', 'https://kit.fontawesome.com', 'https://cdn.jsdelivr.net', 'https://platform.twitter.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
    frameSrc: ["'self'", 'https://www.youtube.com', 'https://sratma.mtc.gob.pe', 'https://aulavirtual.mtc.gob.pe', 'https://extranet.who.int', 'https://www.google.com', 'https://maps.googleapis.com', 'https://www.facebook.com', 'https://platform.twitter.com', 'https://syndication.twitter.com', 'https://cdn.syndication.twimg.com', 'https://app.powerbi.com', 'https://*.powerbi.com', 'https://*.analysis.windows.net'],
    frameAncestors: ["'self'"],
    connectSrc: ["'self'", 'https://api.twitter.com', 'https://platform.twitter.com', 'https://syndication.twitter.com', 'https://cdn.syndication.twimg.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"]
};
if (isProduction) {
    cspDirectives.upgradeInsecureRequests = [];
}
app.use(helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: { directives: cspDirectives },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' }
}));
app.use(express.static(path.join(__dirname, "/public"), {
    etag: true,
    maxAge: '30 days',
    redirect: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// Manejador central de errores (sin exponer stack traces ni detalles internos)
app.use((err, req, res, next) => {
    console.error(err);
    if (req.path.startsWith('/administrador/api')) {
        return res.status(err.status || 500).json({ success: false, message: 'Error interno del servidor' });
    }
    if (req.path.startsWith('/api/')) {
        return res.status(err.status || 500).json({ success: false, message: 'Error interno del servidor' });
    }
    res.status(err.status || 500).send('Error interno del servidor');
});

//cronjob

app.listen(process.env.PORT || 3000, async () => {
    //campaigns.sendingNewsLetter()
    //console.log(await campaigns._renderCampaign());
    logger.debug(`La aplicación se inició con éxito y a la escucha en el puerto ${process.env.PORT || 3000}`)
})
