const dotenv = require("dotenv");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const DataBase = require("./mysql");
const criptoUtils = require("../utils/criptoUtils");
const logger = require("../controllers/logger");

dotenv.config();

let client = null;

const apiCloudFireStore = new (require("../api/gcp/FireStore"));
const mysqlClient = new DataBase();
mysqlClient.setQuery();

if (process.env.STRATEGY_MODE === 'GCP') {
	client = apiCloudFireStore;
} else {
	client = mysqlClient;
}

/**
 * @description: Estrategia de logue de usuarios, puede ser usado como proyecto gcp 
 * u On-premise
 */
passport.use('local-login', new Strategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true //envía los datos request=req
}, async (req, email, password, done) => {
	const result = await client.getUserByEmail(email);
	if (!result.success) {
		// Distinguir error de BD vs usuario inexistente (antes ambos daban "Usuario no encontrado")
		if (result.message === 'Cannot get user') {
			logger.error(`getUserByEmail error para ${email}: ${result.message}`);
			return done(null, false, req.flash('login', 'Error interno, intente de nuevo'))
		}
		return done(null, false, req.flash('login', 'Usuario no encontrado'))
	}

	const cmp = await client.comparePassword(password, result.data['password']);
	if (!cmp.ok) {
		return done(null, false, req.flash('login', 'Usuario o clave incorrecto'))
	}

	// Migración transparente: hashes AES legacy pasan a bcrypt al iniciar sesión
	if (cmp.rehash && typeof client.rehashPassword === 'function') {
		await client.rehashPassword(result.data['id'], password).catch(() => {});
	}

	const userEncript = criptoUtils.encryptUserId(result.data['id']);
	return done(null, userEncript)
}))

passport.serializeUser((userIdEncript, done) => {
	// Anteriormente solo userId
	done(null, userIdEncript)
})
passport.deserializeUser(async (userEncript, done) => {
	try {
		const userId = criptoUtils.decryptUserId(userEncript);
		const result = await client.getUserById(userId);
		if (!result.success || !result.data || !result.data.id) {
			return done(null, false);
		}
		const userEncript2 = criptoUtils.encryptUserId(result.data['id']);
		done(null, userEncript2);
	} catch (error) {
		console.error(error);
		done(null, false);
	}
})