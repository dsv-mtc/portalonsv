const express = require('express');
const router = express.Router();
const passport = require("passport");
const criptoUtils = require("../../utils/criptoUtils");
const path = require('path');
const { loginLimiter } = require("../../controllers/rateLimit");

const mysql = new (require("../../api/mysql"));
mysql.setQuery();

router.get("/login", isNotAuthenticated, (req, res) => {
	const info_login = req.flash('login');
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/administrador-login", { info_login });
})

router.post("/login", loginLimiter, (req, res, next) => {
	passport.authenticate('local-login', (err, user, info) => {
		if (err) return next(err);
		if (!user) {
			// Asegurar que flash se persista en MySQLStore antes del redirect (evita race del 1er intento)
			return req.session.save(() => res.redirect('/administrador/login'));
		}
		req.logIn(user, (err) => {
			if (err) return next(err);
			return req.session.save(() => res.redirect('/administrador'));
		});
	})(req, res, next);
})

router.get("/logout", (req, res) => {
	req.logOut(function (err) {
		if (err) return res.status(500).send("Error al cerrar sesión");
		res.redirect("/administrador/login")
	});
})

// Serve SPA static assets (JS, CSS, images) only if authenticated
router.use(isAuthenticated, express.static(path.join(__dirname, '../../admin/dist')));

// SPA catch-all — serve React admin for all /administrador/* routes (client-side routing)
router.get('/*', isAuthenticated, (req, res) => {
	res.sendFile(path.join(__dirname, '../../admin/dist', 'index.html'));
});

async function isAuthenticated(req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('/administrador/login');
		return;
	}
	const userIdEncrypted = req.user;
	const userId = criptoUtils.decryptUserId(userIdEncrypted);
	try {
		const { data: user } = await mysql.getUserById(userId);
		if (user.role.toLowerCase() === 'administrador') return next()
		req.logOut(function (err) {
			if (err) console.log(err);
			req.flash('login', 'Usuario o clave incorrecto')
			res.redirect('/administrador/login');
		});
		return;
	} catch (error) {
		console.log(error);
	}
}

function isNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/administrador');
		return;
	}
	return next();
}

module.exports = router;
