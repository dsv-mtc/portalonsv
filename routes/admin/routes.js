const router = require('express').Router();

const passport = require("passport");
const customUploader = require("../../controllers/customMulter");
const utils = require("../../utils/utils");
const criptoUtils = require("../../utils/criptoUtils");
const { hasPermissions: checkPermissions, Permission } = require('../../controllers/permission');

const mysql = new (require("../../api/mysql"));
mysql.setQuery();

const STATICS_PATH = '/estaticos'
const IMG_PATH = `${STATICS_PATH}/img`
const PDF_PATH = `${STATICS_PATH}/pdf`
const CSV_PATH = `${STATICS_PATH}/csv`
const EXCEL_PATH = `${STATICS_PATH}/excel`

require('dotenv').config();

router.get("/", isAuthenticated, (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { categories, types } = utils.constants;
	const info_document = req.flash('document');
	res.render("pages/administrador", { categories, types, info_document })
})

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

router.get("/footer", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: footer } = await mysql.getFooterData();
	const info_document = req.flash('document');
	res.render("pages/secciones-admin/footer", {
		...footer,
		info_document
	});
})

router.post("/footer", isAuthenticated, async (req, res) => {
	const {
		telefono,
		email,
		direccion,
		piePagina
	} = req.body;
	const { success, message } = await mysql.updateFooterData({
		telefono,
		email,
		direccion,
		piePagina
	})
	const style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})
	res.redirect("/administrador/footer")
})

router.get("/cifras", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: cifras } = await mysql.getCifras();
	const { secondary_navigation } = res.locals
	const info_document = req.flash('document');
	res.render("pages/secciones-admin/cifras", {
		...cifras,
		secondary_navigation,
		info_document
	});
})

router.get("/regiones/:page?", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const info_document = req.flash('document');



	const pageSize = 6;
	const page = req.params.page ? Number(req.params.page) : 1;

	const {
		searchedRegionId,
	} = req.query

	const conditions = {
		id: Number(searchedRegionId)
	}

	const { pages, amount } = await mysql.getRegionesMeta({
		pageSize,
		conditions
	})

	if (amount === 0) {
		res.render("pages/secciones-admin/regiones", {
			hasResults: false,
			regiones: [],
			info_document,
			pagination,
			searched: conditions
		})
		return
	}

	const pagination = {
		pages,
		limit: pageSize,
		page,
		total: amount,
		url_page: 'secciones-admin/regiones'
	}
	pagination.next = page < pagination.pages ? page + 1 : null
	pagination.prev = page > 1 ? page - 1 : null

	const regionIdQuery = searchedRegionId ? `searchedRegionId=${searchedRegionId}&` : '';
	const urlQuery = `?${regionIdQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (page < 1) {
		console.log({
			message: `Redirecting from unexisting page ${page} to first page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/1${urlQuery}`);
		return
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from unexisting page ${page} to last page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/${pagination.pages}${urlQuery}`);
		return
	}

	const [
		{ data: regiones },
		{ data: allRegiones }
	] = await Promise.all([
		mysql.getRegiones({
			paginate: true,
			page,
			pageSize,
			conditions
		}),
		mysql.getRegiones({
			paginate: false,
		}),
	]);

	res.render("pages/secciones-admin/regiones", {
		hasResults: true,
		regiones,
		allRegiones: allRegiones.map(region => ({
			id: region.id,
			value: region.value,
			selected: region.id === conditions.id
		})),
		info_document,
		pagination,
		searched: conditions
	})
})

router.put("/regiones", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		nombreEncargado,
		celularEncargado,
		correoEncargado,
		existingImage,
		pageLink
	} = req.body;

	let imageUrl = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imageUrl = `${IMG_PATH}/${file.filename}`
	} else {
		imageUrl = existingImage
	}

	console.log({ imageUrl })

	const { success, message } = await mysql.updateRegiones({
		id,
		nombreEncargado,
		celularEncargado,
		correoEncargado,
		imageUrl,
		pageLink
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

router.post("/cifras", isAuthenticated, async (req, res) => {
	const {
		lesionados,
		accidentados,
		fallecidos,
		mensaje1,
		mensaje2
	} = req.body;
	const { success, message } = await mysql.updateCifras({
		lesionados,
		accidentados,
		fallecidos,
		mensaje1,
		mensaje2
	})
	const style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})
	res.redirect("/administrador/cifras")
})

router.get("/mision-vision", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: enData } = await mysql.getContenidoQuienesSomos(true);
	const { data: esData } = await mysql.getContenidoQuienesSomos(false);
	const info_document = req.flash('document');

	res.render("pages/secciones-admin/mision-vision", {
		enDescripcion: enData[0].contenido,
		enMision: enData[1].contenido,
		enVision: enData[2].contenido,
		esDescripcion: esData[0].contenido,
		esMision: esData[1].contenido,
		esVision: esData[2].contenido,
		info_document
	})
})

router.post("/mision-vision", isAuthenticated, async (req, res) => {
	const {
		enDescripcion,
		enMision,
		enVision,
		esDescripcion,
		esMision,
		esVision
	} = req.body;

	const { success: enSuccess, message: enMessage } = await mysql.updateMisionVision(true, {
		descripcion: enDescripcion,
		mision: enMision,
		vision: enVision
	})

	let style = `alert alert-${enSuccess ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message: enMessage
	})

	const { success: esSuccess, message: esMessage } = await mysql.updateMisionVision(false, {
		descripcion: esDescripcion,
		mision: esMision,
		vision: esVision
	})

	style = `alert alert-${esSuccess ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message: esMessage
	})

	res.redirect('/administrador/mision-vision')
})

router.get("/popup", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: popup } = await mysql.getPopup();
	res.render("pages/secciones-admin/popup", {
		...popup,
		estado: popup.estado === '1'
	})
})

router.post("/popup", isAuthenticated, customUploader, async (req, res) => {
	const { estado, enlace, imageValue } = req.body;
	const encodeEstado = estado === 'on' ? '1' : '0'

	let imagen = IMG_PATH
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imagen = `${imagen}/${file.filename}`
	} else {
		imagen = imageValue
	}
	const { success, message } = await mysql.updatePopup({
		imagen,
		estado: encodeEstado,
		enlace
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`

	req.flash("document", {
		style,
		message
	})

	res.json({
		style,
		message
	})

})

router.get("/analitica-menu", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: menu } = await mysql.getMenu();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/analitica-menu", {
		menu,
		info_document
	})
})

router.post("/analitica-menu", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_descripcion,
		new_existingImage,
		new_observacion,
		new_estaActivo
	} = req.body;

	let urlImagen = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		urlImagen = `${IMG_PATH}/${file.filename}`
	} else {
		urlImagen = new_existingImage
	}

	const { success, message } = await mysql.createMenu({
		descripcion: new_descripcion,
		urlImagen: urlImagen,
		observacion: new_observacion,
		estaActivo: new_estaActivo
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

router.put("/analitica-menu", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		descripcion,
		existingImage,
		observacion,
		estaActivo
	} = req.body;

	let urlImagen = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		urlImagen = `${IMG_PATH}/${file.filename}`
	} else {
		urlImagen = existingImage
	}

	const { success, message } = await mysql.updateMenu({
		id,
		descripcion,
		urlImagen,
		observacion,
		estaActivo
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

router.delete("/analitica-menu", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteMenu(id);

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

router.get("/comunicaciones-eventos/:page?", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const info_document = req.flash('document');
	const pageSize = 6;
	const {
		searchedEvento,
		searchedTipoEvento,
		searchedStartDate,
		searchedEndDate,
	} = req.query
	const page = req.params.page ? Number(req.params.page) : 1;

	const conditions = {
		title: searchedEvento,
		idTipoEvento: searchedTipoEvento,
		startDate: searchedStartDate,
		endDate: searchedEndDate
	}

	const [
		{ pages, amount },
		{ data: tiposEvento }
	] = await Promise.all([
		mysql.getComunicationsMeta({
			pageSize,
			conditions
		}),
		mysql.getTiposEvento()
	])

	const pagination = {
		pages,
		limit: pageSize,
		page: page,
		total: amount,
		url_page: 'secciones-admin/comunicaciones-eventos'
	}
	pagination.next = page < pagination.pages ? page + 1 : null
	pagination.prev = page > 1 ? page - 1 : null

	if (amount === 0) {
		res.render("pages/secciones-admin/comunicaciones-eventos", {
			hasResults: false,
			eventos: [],
			tiposEvento: tiposEvento.map(t => ({
				...t,
				selected: t.id === Number(searchedTipoEvento)
			})),
			info_document,
			pagination,
			searched: {
				evento: searchedEvento,
				tipoEvento: searchedTipoEvento,
				startDate: searchedStartDate,
				endDate: searchedEndDate
			}
		})
		return
	}

	const eventoQuery = searchedEvento ? `searchedEvento=${searchedEvento}&` : '';
	const tipoEventoQuery = searchedTipoEvento ? `searchedTipoEvento=${searchedTipoEvento}&` : '';
	const startDateQuery = searchedStartDate ? `searchedStartDate=${searchedStartDate}&` : '';
	const endDateQuery = searchedEndDate ? `searchedEndDate=${searchedEndDate}&` : '';

	const urlQuery = `?${eventoQuery}${tipoEventoQuery}${startDateQuery}${endDateQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (page < 1) {
		console.log({
			message: `Redirecting from unexisting page ${page} to first page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/1${urlQuery}`);
		return
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from unexisting page ${page} to last page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/${pagination.pages}${urlQuery}`);
		return
	}


	const { data: eventos } = await mysql.getComunications({
		paginate: true,
		page,
		pageSize,
		conditions
	})

	res.render("pages/secciones-admin/comunicaciones-eventos", {
		hasResults: eventos?.length !== 0,
		eventos,
		tiposEvento: tiposEvento.map(t => ({
			...t,
			selected: t.id === Number(searchedTipoEvento)
		})),
		info_document,
		pagination,
		searched: {
			evento: searchedEvento,
			tipoEvento: searchedTipoEvento,
			startDate: searchedStartDate,
			endDate: searchedEndDate
		}
	})
})

router.post("/comunicaciones-eventos", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_title,
		new_idTipoEvento,
		new_organizedBy,
		new_place,
		new_direccion,
		new_shortDescription,
		new_description,
		new_startDay,
		new_startTime,
		new_endDay,
		new_endTime,
		new_price,
		new_existingImage,
		new_reunionLink,
		new_facebookLink,
		new_youtubeLink,
		new_twitterLink,
		new_isActive
	} = req.body;

	let imageUrl = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imageUrl = `${IMG_PATH}/${file.filename}`
	} else {
		imageUrl = new_existingImage
	}

	const { success, message } = await mysql.createComunication({
		title: new_title,
		idTipoEvento: new_idTipoEvento,
		organizedBy: new_organizedBy,
		place: new_place,
		shortDescription: new_shortDescription,
		description: new_description,
		startDay: new_startDay,
		startTime: new_startTime,
		endDay: new_endDay,
		endTime: new_endTime,
		price: new_price,
		imageUrl,
		direccion: new_direccion,
		reunionLink: new_reunionLink,
		facebookLink: new_facebookLink,
		youtubeLink: new_youtubeLink,
		twitterLink: new_twitterLink,
		isActive: new_isActive === 'on' ? 1 : 0
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

router.put("/comunicaciones-eventos", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		idTipoEvento,
		title,
		organizedBy,
		place,
		shortDescription,
		description,
		startDay,
		startTime,
		endDay,
		endTime,
		price,
		existingImage,
		direccion,
		reunionLink,
		facebookLink,
		youtubeLink,
		twitterLink,
		isActive,
	} = req.body;

	let imageUrl = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imageUrl = `${IMG_PATH}/${file.filename}`
	} else {
		imageUrl = existingImage
	}

	const { success, message } = await mysql.updateComunication({
		id,
		idTipoEvento,
		title,
		organizedBy,
		place,
		shortDescription,
		description,
		startDay,
		startTime,
		endDay,
		endTime,
		price,
		imageUrl,
		direccion,
		existingImage,
		reunionLink,
		facebookLink,
		youtubeLink,
		twitterLink,
		isActive: isActive === 'on',
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

router.delete("/comunicaciones-eventos", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteMenu(id);

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

router.get("/analitica-submenu", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: submenu } = await mysql.getSubmenu();
	const { data: menu } = await mysql.getMenu();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/analitica-submenu", {
		submenu,
		menu,
		info_document
	})
})

router.post("/analitica-submenu", isAuthenticated, customUploader, async (req, res) => {
	const {
		submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imgFileName,
		estado
	} = req.body;

	let imagenpath = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imagenpath = `${IMG_PATH}/${file.filename}`
	} else {
		imagenpath = imgFileName
	}

	const { success, message } = await mysql.createSubmenu({
		descripcion: submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imagenpath,
		estado
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

router.put("/analitica-submenu", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imgFileName,
		estado
	} = req.body;

	let imagenpath = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imagenpath = `${IMG_PATH}/${file.filename}`
	} else {
		imagenpath = imgFileName
	}

	const { success, message } = await mysql.updateSubmenu({
		id,
		descripcion: submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imagenpath,
		estado
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

router.delete("/analitica-submenu", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteSubmenu(id);

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

router.get("/datos-abiertos/:page?", async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const pageSize = 6;
	const {
		searchedTitulo,
		searchedDescripcion,
		searchedCategoria,
		searchedFecha,
	} = req.query
	const page = req.params.page ? Number(req.params.page) : 1;

	const conditions = {
		description: searchedDescripcion,
		title: searchedTitulo,
		idCategoria: searchedCategoria,
		fecha: searchedFecha
	}

	const { data: pages, dataLength: total } = await mysql.getDatosAbiertosPages({
		pageLength: pageSize,
		conditions
	})
	const pagination = {
		pages,
		limit: pageSize,
		page: page,
		total,
		url_page: 'secciones-admin/datos-abiertos'
	}

	pagination.next = page < pagination.pages ? page + 1 : null
	pagination.prev = page > 1 ? page - 1 : null

	const tituloQuery = searchedTitulo ? `searchedTitulo=${searchedTitulo}&` : '';
	const descripcionQuery = searchedDescripcion ? `searchedDescripcion=${searchedDescripcion}&` : '';
	const categoriaQuery = searchedCategoria ? `searchedCategoria=${searchedCategoria}&` : '';
	const fechaQuery = searchedFecha ? `searchedFecha=${searchedFecha}&` : '';

	const urlQuery = `?${tituloQuery}${descripcionQuery}${categoriaQuery}${fechaQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (page < 1) {
		console.log({
			message: `Redirecting from unexisting page ${page} to first page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/1${urlQuery}`);
		return
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from unexisting page ${page} to last page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/${pagination.pages}${urlQuery}`);
		return
	}

	const [
		{ data: categorias },
		{ data: tipos },
		{ data: datos }
	] = await Promise.all([
		await mysql.getCategorias(),
		await mysql.getTipos(),
		await mysql.getDatosAbiertos({
			paginate: true,
			page,
			pageLength: pageSize,
			conditions
		})
	])

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/datos-abiertos", {
		hasResults: total !== 0,
		datos,
		categorias: categorias.map(c => ({
			...c,
			selected: c.id === Number(searchedCategoria)
		})),
		tipos,
		info_document,
		pagination,
		searched: {
			titulo: searchedTitulo,
			descripcion: searchedDescripcion,
			categoria: searchedCategoria,
			fecha: searchedFecha
		}
	})

})

router.post("/datos-abiertos", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_titulo,
		new_autor,
		new_descripcion,
		new_categoria,
		new_tipo,
		new_fecha
	} = req.body;

	let excelfilepath = 'null'
	if (req.files['excel-file']) {
		const file = req.files['excel-file'][0]
		excelfilepath = `${EXCEL_PATH}/${file.filename}`
	}

	let pdffilepath = 'null'
	if (req.files['pdf-file']) {
		const file = req.files['pdf-file'][0]
		pdffilepath = `${PDF_PATH}/${file.filename}`
	}

	let csvfilepath = 'null'
	if (req.files['csv-file']) {
		const file = req.files['csv-file'][0]
		csvfilepath = `${CSV_PATH}/${file.filename}`
	}

	const { success, message } = await mysql.createDatosAbiertos({
		titulo: new_titulo,
		autor: new_autor,
		descripcion: new_descripcion,
		idCategoria: Number(new_categoria),
		idTipo: Number(new_tipo),
		excelfilepath,
		pdffilepath,
		csvfilepath,
		fecha: new_fecha
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

router.put("/datos-abiertos", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		titulo,
		autor,
		descripcion,
		categoria,
		tipo,
		excelFileName,
		pdfFileName,
		csvFileName,
		fecha
	} = req.body;

	let excelfilepath = 'null'
	if (req.files['excel-file']) {
		const file = req.files['excel-file'][0]
		excelfilepath = `${EXCEL_PATH}/${file.filename}`
	} else {
		excelfilepath = excelFileName || 'null'
	}

	let pdffilepath = 'null'
	if (req.files['pdf-file']) {
		const file = req.files['pdf-file'][0]
		pdffilepath = `${PDF_PATH}/${file.filename}`
	} else {
		pdffilepath = pdfFileName || 'null'
	}

	let csvfilepath = 'null'
	if (req.files['csv-file']) {
		const file = req.files['csv-file'][0]
		csvfilepath = `${CSV_PATH}/${file.filename}`
	} else {
		csvfilepath = csvFileName || 'null'
	}

	const { success, message } = await mysql.updateDatosAbiertos({
		id,
		titulo,
		autor,
		descripcion,
		idCategoria: Number(categoria),
		idTipo: Number(tipo),
		excelfilepath,
		pdffilepath,
		csvfilepath,
		fecha
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

router.delete("/datos-abiertos", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteDatosAbiertos(id);

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


router.get("/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: categorias } = await mysql.getCategorias();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/datos-abiertos-categorias", {
		categorias,
		info_document
	})
})

router.post("/datos-abiertos-categorias", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_value,
		new_existingImage,
		new_estaActivo,
	} = req.body;

	let icon = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		icon = `${IMG_PATH}/${file.filename}`
	} else {
		icon = new_existingImage
	}

	const { success, message } = await mysql.createCategoria({
		value: new_value,
		icon,
		estaActivo: new_estaActivo === 'true'
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

router.put("/datos-abiertos-categorias", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		value,
		existingImage,
		estaActivo,
	} = req.body;

	let icon = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		icon = `${IMG_PATH}/${file.filename}`
	} else {
		icon = existingImage
	}

	const { success, message } = await mysql.updateCategoria({
		id,
		value,
		icon,
		estaActivo: estaActivo === 'true',
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

router.delete("/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteCategoria(id);

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


router.get("/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: tipos } = await mysql.getTipos();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/datos-abiertos-tipos", {
		tipos,
		info_document
	})
})

router.post("/datos-abiertos-tipos", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_value,
		new_estaActivo
	} = req.body;

	const { success, message } = await mysql.createTipo({
		value: new_value,
		estaActivo: new_estaActivo === 'true'
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

router.put("/datos-abiertos-tipos", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		value,
		estaActivo
	} = req.body;


	const { success, message } = await mysql.updateTipo({
		id,
		value,
		estaActivo: estaActivo === 'true'
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

router.delete("/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteTipo(id);

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


router.get("/gestion-usuarios/usuarios", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const [
		{ data: roles },
		{ data: usuarios }
	] = await Promise.all([
		mysql.getRoles(),
		mysql.getUsers()
	]);


	const info_document = req.flash('document');
	res.render("pages/secciones-admin/gestion-usuarios/usuarios", {
		usuarios,
		roles,
		info_document
	})
})

router.post("/gestion-usuarios/usuarios", isAuthenticated, customUploader, async (req, res) => {
	const {
		user,
		password,
		roleId
	} = req.body;

	const { success, message } = await mysql.createUser({
		email: user,
		password,
		roleId
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

router.put("/gestion-usuarios/usuarios", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		user,
		password,
		roleId
	} = req.body;

	console.log(req.body)

	const { success, message } = await mysql.updateUser({
		id,
		email: user,
		password,
		roleId
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

router.delete("/gestion-usuarios/usuarios", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteUser(id);

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


router.get("/gestion-usuarios/roles", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	let [
		{ data: roles },
	] = await Promise.all([
		mysql.getRolesWithPermissions(),
	]);

	const allPermissions = Object.values(Permission)

	const PERMISSION_ACTION_ALIASES = {
		'read' : 'Acceder',
		'create' : 'Crear',
		'update' : 'Actualizar',
		'delete' : 'Eliminar'
	}

	roles = roles.map(role => ({
		...role,
		permissions: role.permissions.map(p => {
			const aliasSufix = allPermissions
				.find(crudPermission => Object.values(crudPermission).includes(p.value))
				.meta.alias
			
			const [,action] = p.value.split('.')

			return {
				...p,
				alias: `${PERMISSION_ACTION_ALIASES[action]} ${aliasSufix}`
			}
		}),
		permissionValuesString: JSON.stringify(role.permissions.map(p => p.value))
	}))

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/gestion-usuarios/roles", {
		roles,
		permisos: allPermissions,
		info_document
	})
})

router.post("/gestion-usuarios/roles", isAuthenticated, customUploader, async (req, res) => {
	const {
		value,
		...permissionsActive
	} = req.body;

	const permissionNames = Object
		.entries(permissionsActive)
		.filter(([key, value]) => value === 'on')
		.map(([key]) => key)

	const {data: permisos} = await mysql.getPermisos()

	const permissionIds = permisos
		.filter(p => permissionNames.includes(p.value))
		.map(p => p.id)

	const { success, message } = await mysql.createRole({
		value,
		permissionIds
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

router.put("/gestion-usuarios/roles", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		value,
		...permissionsActive
	} = req.body;

	const permissionNames = Object
		.entries(permissionsActive)
		.filter(([key, value]) => value === 'on')
		.map(([key]) => key)

	const {data: permisos} = await mysql.getPermisos()

	const permissionIds = permisos
		.filter(p => permissionNames.includes(p.value))
		.map(p => p.id)

	const { success, message } = await mysql.updateRole({
		id,
		value,
		permissionIds
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

router.delete("/gestion-usuarios/roles", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteRole(id);

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
		res.redirect('/administrador/login');
		return;
	}
	const userIdEncrypted = req.user;
	const userId = criptoUtils.decryptUserId(userIdEncrypted);
	
	try {
		const { data: user } = await mysql.getUserById(userId);
		console.log(user)
		if (user.role.toLowerCase() === 'administrador') return next()
		console.log({
			message: 'Usuario no autorizado',
		})
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