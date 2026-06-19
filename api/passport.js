const dotenv = require("dotenv");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const DataBase = require("./mysql");
const criptoUtils = require("../utils/criptoUtils");

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
		return done(null, false, req.flash('login', 'Usuario no encontrado'))
	}

	if (!client.comparePassword(password, result.data['password'])) {
		return done(null, false, req.flash('login', 'Usuario o clave incorrecto'))
	}

	const userEncript = criptoUtils.encryptUserId(result.data['id']);
	return done(null, userEncript)
}))

passport.serializeUser((userIdEncript, done) => {
	// Anteriormente solo userId
	done(null, userIdEncript)
})
passport.deserializeUser(async (userEncript, done) => {
	const userId = criptoUtils.decryptUserId(userEncript);
	const result = await client.getUserById(userId);
	const userEncript2 = criptoUtils.encryptUserId(result.data['id']);
	done(null, userEncript2);
})