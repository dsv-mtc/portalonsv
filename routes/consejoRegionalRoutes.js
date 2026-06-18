const router = require('express').Router();
const passport = require("passport");
const criptoUtils = require("../utils/criptoUtils");
const customUploader = require("../controllers/customMulter");
const { Permission } = require('../controllers/permission');
const { pageAuthorize } = require('../utils/rest');

const mysql = new (require("../api/mysql"));
mysql.setQuery();

const STATICS_PATH = '/estaticos'
const IMG_PATH = `${STATICS_PATH}/img`
const PDF_PATH = `${STATICS_PATH}/pdf`
const CSV_PATH = `${STATICS_PATH}/csv`
const EXCEL_PATH = `${STATICS_PATH}/excel`

router.get('/', isAuthenticated, permissionChecker, (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/consejo-regional/inicio");
})

router.get("/login", isNotAuthenticated, (req, res) => {
	const info_login = req.flash('login');
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/consejo-regional/login", { info_login });
})

router.post("/login", passport.authenticate('local-login', {
	successRedirect: "/consejo-regional",
	failureRedirect: "/consejo-regional/login",
	passReqToCallback: true
}))

router.get("/logout", (req, res) => {
	req.logOut();
	res.redirect("/consejo-regional/login")
})

router.get('/planes-regionales', isAuthenticated, permissionChecker, async (req, res) => {
	const permissionNeeded = Permission.planRegional.read
	const isAuthorized = pageAuthorize(req, res, [permissionNeeded])
	if (!isAuthorized) return

	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;

	const userIdEncrypted = req.user;
	const userId = criptoUtils.decryptUserId(userIdEncrypted);

	const { data: user } = await mysql.getUserById(userId);

	const isAdmin = user.role === 'Administrador'

	const conditions = {
		idAutor: isAdmin ? undefined : userId,
	}

	const [
		{ data: planesRegionales },
		{ data: regiones },
	] = await Promise.all([
		mysql.getPlanesRegionales({
			conditions
		}),
		mysql.getRegiones(),
	]);

	const info_document = req.flash('document');

	res.render("pages/consejo-regional/planes-regionales", {
		info_document,
		planesRegionales,
		regiones,
		hasResults: planesRegionales.length > 0,
	});
})

router.post("/planes-regionales", isAuthenticated, permissionChecker, customUploader, async (req, res) => {
	const permissionNeeded = Permission.planRegional.create
	const isAuthorized = pageAuthorize(req, res, [permissionNeeded])
	if (!isAuthorized) return

	const {
		titulo,
		idRegion,
		descripcion,
		fechaCreacion,
		estaActivo,
	} = req.body;

	let excelFileUrl
	if (req.files['excel-file']) {
		const file = req.files['excel-file'][0]
		excelFileUrl = `${EXCEL_PATH}/${file.filename}`
	}

	let pdfFileUrl
	if (req.files['pdf-file']) {
		const file = req.files['pdf-file'][0]
		pdfFileUrl = `${PDF_PATH}/${file.filename}`
	}

	let csvFileUrl
	if (req.files['csv-file']) {
		const file = req.files['csv-file'][0]
		csvFileUrl = `${CSV_PATH}/${file.filename}`
	}

	const userIdEncrypted = req.user;
	const userId = criptoUtils.decryptUserId(userIdEncrypted);

	const { success, message } = await mysql.createPlanRegional({
		titulo,
		descripcion,
		idRegion,
		idAutor: userId,
		excelFileUrl,
		pdfFileUrl,
		csvFileUrl,
		fechaCreacion,
		estaActivo: estaActivo === 'on',
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`

	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

router.put("/planes-regionales", isAuthenticated, permissionChecker, customUploader, async (req, res) => {
	const permissionNeeded = Permission.planRegional.update
	const isAuthorized = pageAuthorize(req, res, [permissionNeeded])
	if (!isAuthorized) return

	const {
		id,
		titulo,
		idRegion,
		descripcion,
		excelFileName,
		pdfFileName,
		csvFileName,
		fechaCreacion,
		estaActivo,
	} = req.body;

	let excelFileUrl
	if (req.files['excel-file']) {
		const file = req.files['excel-file'][0]
		excelFileUrl = `${EXCEL_PATH}/${file.filename}`
	} else {
		excelFileUrl = excelFileName || undefined
	}

	let pdfFileUrl
	if (req.files['pdf-file']) {
		const file = req.files['pdf-file'][0]
		pdfFileUrl = `${PDF_PATH}/${file.filename}`
	} else {
		pdfFileUrl = pdfFileName || undefined
	}

	let csvFileUrl
	if (req.files['csv-file']) {
		const file = req.files['csv-file'][0]
		csvFileUrl = `${CSV_PATH}/${file.filename}`
	} else {
		csvFileUrl = csvFileName || undefined
	}

	const userIdEncrypted = req.user;
	const userId = criptoUtils.decryptUserId(userIdEncrypted);

	const { success, message } = await mysql.updatePlanRegional({
		id,
		titulo,
		descripcion,
		idRegion,
		idAutor: userId,
		excelFileUrl,
		pdfFileUrl,
		csvFileUrl,
		fechaCreacion,
		estaActivo: estaActivo === 'on',
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`

	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

router.delete("/planes-regionales", isAuthenticated, permissionChecker, async (req, res) => {
	const permissionNeeded = Permission.planRegional.delete
	const isAuthorized = pageAuthorize(req, res, [permissionNeeded])
	if (!isAuthorized) return

	const { id } = req.body;

	const { success, message } = await mysql.deletePlanRegional(id);

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})


async function isAuthenticated(req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('/consejo-regional/login');
		return;
	}
	return next()
}

function isNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/consejo-regional');
		return;
	}
	return next();
}

async function permissionChecker(req, res, next) {
	const userIdEncrypted = req.user;
	const userId = criptoUtils.decryptUserId(userIdEncrypted);
	const { data: users } = await mysql.getUsersWithPermissions({
		conditions: {
			userId
		}
	})

	const [user] = users

	const canAccess = user.permissions.some(p => p.value === Permission.consejoRegional.read)
	if (canAccess) {
		req.permissions = user.permissions
		return next()
	}
	req.logOut();
	res.redirect('/consejo-regional/login');
}


module.exports = router;