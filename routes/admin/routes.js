const express = require('express');
const router = express.Router();
const passport = require("passport");
const criptoUtils = require("../../utils/criptoUtils");
const path = require('path');

const mysql = new (require("../../api/mysql"));
mysql.setQuery();

router.get("/login", isNotAuthenticated, (req, res) => {
	const info_login = req.flash('login');
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/administrador-login", { info_login });
})

router.post("/login", passport.authenticate('local-login', {
	successRedirect: "/administrador",
	failureRedirect: "/administrador/login",
	passReqToCallback: true
}))

router.get("/logout", (req, res) => {
	req.logOut();
	res.redirect("/administrador/login")
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
		req.logOut();
		req.flash('login', 'Usuario o clave incorrecto')
		res.redirect('/administrador/login');
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
